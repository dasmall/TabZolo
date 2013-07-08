var template = " \
	<h3>OneTab Settings</h3> \
	<% \
	function isChecked(prop){ \
		return prop == true ? 'checked' : ''; \
	} \
	%> \
	<input name=\"oneTab\" type=\"checkbox\" <%= isChecked(enabled) %>>Enable OneTab <br />";

function start(){
	var html = _.template(template,{enabled: false});
	$('body').html(html);

	chrome.storage.onChanged.addListener(function(changes, namespace) {
	  for (key in changes) {
	    var storageChange = changes[key];
	    console.log('Storage key "%s" in namespace "%s" changed. ' +
	                'Old value was "%s", new value is "%s".',
	                key,
	                namespace,
	                storageChange.oldValue,
	                storageChange.newValue);
	  }
	});

	chrome.storage.sync.set({"test":"value"}, function(){
		console.log(arguments);
	});

}

start();