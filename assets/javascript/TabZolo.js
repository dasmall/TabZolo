chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get('enabled', function(results){
        if(results.enabled == true) {
            chrome.storage.local.set({'enabled': false}, function(){});
        } else {
            chrome.storage.local.set({'enabled': true},function(){});
        }
    });
});

chrome.runtime.onStartup.addListener(function(){
	chrome.storage.local.get('enabled', function(results){
		setIcon(true);
	});
});

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
});

chrome.tabs.onUpdated.addListener(updateHandler);

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if('enabled' in changes)
		enableTabZolo(changes.enabled.newValue);
});

function enableTabZolo(enabled){
	if(enabled){
		chrome.windows.getAll({populate: true}, storeWindows);  // store all open all window tabs
	} else {
		chrome.storage.local.get('windows', reopenWindows);     // restore all open windows / tabs
    }
}

function storeWindows(windows){
	windows = windows.filter(function(window){
        return window.type == 'normal';
	});

	chrome.storage.local.set({'windows':windows}, function(){
		enterTabZolo(windows);
	});
}

function enterTabZolo(windows){
	var length = windows.length,
        tabs = [];

    for (var i = 0; i < length; i++){
		windows[i].tabs.map(function(tab){
            if(!windows[i].focused || !tab.highlighted){
                tabs.push(tab.id);
            }
		});
	}
    chrome.tabs.remove(tabs);
    setIcon(true);
}

function reopenWindows(results){
	
	var windows = results.windows,
        length = windows.length,
        i, urls;

    chrome.tabs.query({currentWindow: true, active: true}, function(tab){
        var currentTabId = tab[0].id;
        for (i = 0; i < length; i++){
            urls = [];
            if (i > 0){
                windows[i].tabs.map(function(tab){
                    urls.push(tab.url);
                });
                chrome.windows.create({url: urls});
            } else {
                var tabCount = windows[i].tabs.length;
                for (var j = 0; j < tabCount; j++){
                    var id = windows[i].tabs[j].id;
                    var url = windows[i].tabs[j].url;
                    if (id != currentTabId) {
                        chrome.tabs.create({url: url});
                    }
                }
            }
        }
        chrome.tabs.update(currentTabId, {active: true});

        setIcon(false);
    });
}

function checkTabs(tabs, newTab){
	var newURL = newTab.url;
	// if an attempt to open a new tab was made close the new tab
	// otherwise change the current url / allow first tab to load.
	if(tabs.length > 1) {
		if (newTab.url != ''){
			chrome.tabs.remove(newTab.id, function(){
				setURL(newURL);
			});
		} else {
            chrome.tabs.onUpdate.addListener(updateHandler);
        }
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

function setIcon(active){
	if(active == true){
		chrome.browserAction.setIcon({'path':
			{
				'19':'/assets/images/tabzolo-active-19.png',
				'38':'/assets/images/tabzolo-active-38.png'
			}
		});

		chrome.browserAction.setTitle({title:'TabZolo (Enabled)'});
	} else {
		chrome.browserAction.setIcon({'path':
			{
				'19':'/assets/images/tabzolo-inactive-19.png',
				'38':'/assets/images/tabzolo-inactive-38.png'
			}
		});

		chrome.browserAction.setTitle({title:'TabZolo (Disabled)'});
	}
}


function updateHandler(tabId, changeInfo, tab){
    if (changeInfo.url) {
        chrome.storage.local.get('enabled', function(settings){
            if (settings.enabled == true) {
                chrome.tabs.query({}, function(tabs){
                    var url = changeInfo.url;
                    var originalTab = tabs.filter(function(t){
                        return t.active == false;
                    });

                    if (originalTab[0].id != tabId){
                        chrome.tabs.remove(tabId, function(){
                            chrome.tabs.update(originalTab[0].id, {url: url});
                        });
                    }
                });
            }
        });
    }
    chrome.tabs.onUpdate.removeListener();
}