var template =
	 "<% function isChecked(prop){ return prop == true ? 'checked' : ''; } %>\
	 <% if (!enabled) { %>\
		<button id='tabZolo' name='tabZolo' type='button' data-action='enable'>Enable TabZolo</button>\
	 <% } else { %>\
	 	<button id='tabZolo' name='tabZolo' type='button' data-action='disable'>Disable TabZolo</button>\
	 <% } %>";

function setEventListeners(){
	$('body').on('click', '[name=tabZolo]', function(e){
		getSettings(loadPopup);
		toggleTabZolo(e);
	});
}

function toggleTabZolo(e){
	if($(e.target).data('action') == 'enable') {
        enableTabZolo(true);
        $('#tabZolo').html('Disable TabZolo');
        window.close();
    }
	else {
        enableTabZolo(false);
        $('#tabZolo').html('Enable TabZolo');
        window.close();
    }

}

function enableTabZolo(enabled){
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

function start(){
    getSettings(loadPopup);
    setEventListeners();
}

start();