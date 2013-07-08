var template = " \
	<h3>OneTab Settings</h3> \
	<% \
	function isChecked(prop){ \
		return prop == true ? 'checked' : ''; \
	} \
	%> \
	<input name=\"oneTab\" type=\"checkbox\" <%= isChecked(enabled) %>>Enable OneTab <br />";

function start(){
	getSettings(loadPopup);
	setEventListeners();
}

function setEventListeners(){
	$('body').on('change', '[name=oneTab]', toggleOneTab);
	// chrome.storage.onChanged.addListener(function(changes, namespace) {
	//   for (key in changes) {
	//     var storageChange = changes[key];
	//     console.log('Storage key "%s" in namespace "%s" changed. ' +
	//                 'Old value was "%s", new value is "%s".',
	//                 key,
	//                 namespace,
	//                 storageChange.oldValue,
	//                 storageChange.newValue);
	//   }
	// });
}

function toggleOneTab(e){
	if($(this).prop('checked'))
		enableOneTab(true);
	else
		enableOneTab(false);
}

function enableOneTab(enabled){
	chrome.storage.local.set({'enabled': enabled});
}

function getSettings(callback){
	chrome.storage.local.get(null, callback);
}

function loadPopup(settings){
	settings = getDefault(settings);
	var html = _.template(template, settings);
	$('body').html(html);
}

function getDefault(settings){
	if (Object.keys(settings).length == 0 || !("enabled" in settings))
		return {enabled: false};
	return settings;
}

start();