// listen for new tab created event
chrome.tabs.onCreated.addListener(function(newTab) {
    // check all the open tabs
    chrome.tabs.query({}, function(tabs){
      checkTabs(tabs, newTab);
    });
  }
);

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
			// console.log(arguments);
			chrome.tabs.update(tabs[0].id, {url: newURL});
		});

	});
}

