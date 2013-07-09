// listen for new tab created event
chrome.tabs.onCreated.addListener(function(newTab) {
    chrome.storage.local.get('enabled', function(settings){
    	if (settings.enabled == true){
			// check all the open tabs
			chrome.tabs.query({}, function(tabs){
			  checkTabs(tabs, newTab);
			});
		}
    });
  }
);

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if('enabled' in changes){
		enableTabZolo(changes['enabled'].newValue);
	}
});

function enableTabZolo(enabled){
	if(enabled){
		// store all open all window tabs
		chrome.windows.getAll({populate: true}, storeWindows);
	} else {
		// restore all open windows / tabs
		chrome.storage.local.get('windows', reopenWindows);
	}
}

function storeWindows(windows){
	windows = windows.filter(function(window){
		if (window.type == 'normal')
			return window;
	})
	chrome.storage.local.set({'windows':windows}, function(){
		enterTabZolo(windows);
	});
}

function enterTabZolo(windows){
	var length = windows.length, i, tabs;
	for (i = 0; i < length; i++){
		tabs = [];
		windows[i].tabs.map(function(tab){
			tabs.push(tab.id);
		})
		// if it's the last window
		// only close n-1 tabs
		// otherwise close 'em all
		if (i == length - 1){
			var newTab = tabs.pop();
		}

		chrome.tabs.remove(tabs);
	}

	// chrome.tabs.update(newTab, {url: "chrome://newtab/", active: true});
}

function reopenWindows(results){
	
	var windows = results.windows, length = windows.length, i, urls;
	
	for (i = 0; i < length; i++){
		if (i > 0){
			urls = [];
			windows[i].tabs.map(function(tab){
				urls.push(tab.url);
			});
			chrome.windows.create({url: urls});
		} else {
			var tabCount = windows[i].tabs.length;
			for (var j = 0; j < tabCount; j++){
				var url = windows[i].tabs[j].url;
				if(tabCount == 1){
					chrome.tabs.query({index: 0, windowType: 'normal'}, function(tabs){
						// if the urls are the same, no need to update
						// therefore only update if the urls are different.
						if(tabs[0].url != url)
							chrome.tabs.update({url: url});
					});

				} else if(j == 0){
					//update current tab
					chrome.tabs.update({url: url});
				} else {
					// create new tab
					chrome.tabs.create({url: url});
				}
			}
		}
	}
	
}

function checkTabs(tabs, newTab){
	var newURL = newTab.url;
	//if an attempt to open a new tab was made
	// close the new tab
	// otherwise change the current url / allow first tab to load.
	if(tabs.length > 1){
		chrome.tabs.remove(newTab.id, function(){
			setURL(newURL);
		});
	} else {
		setURL(newURL);
	}
}

function setURL(newURL){
	chrome.windows.getLastFocused({}, function(window){
		chrome.tabs.query({active: true, windowId: window.id}, function(tabs){
			if (newURL == "chrome://newtab/")
				return;
			chrome.tabs.update(tabs[0].id, {url: newURL});
		});

	});
}

