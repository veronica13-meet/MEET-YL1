/*
 * Creates the QueryString class
 */
function QueryString(key) {
	var value = null;
	for (var i = 0; i < QueryString.keys.length; i++) {
		if (QueryString.keys[i] == key) {
			value = QueryString.values[i];
			break;
		}
	}
	
	return value;
}

QueryString.keys = new Array();
QueryString.values = new Array();

/*
 * Initialises the query string
 */
function QueryString_Parse() {
    var url = document.URL;    
	var query = url.substr(url.indexOf("?") + 1, url.length - 1);
	var pairs = query.split("&");
	
	for (var i = 0; i < pairs.length; i++) {
		var index = pairs[i].indexOf('=');
		if (index >= 0) {
			QueryString.keys[QueryString.keys.length] = pairs[i].substring(0, index);
			QueryString.values[QueryString.values.length] = pairs[i].substring(index+1);
		}
	}
}

QueryString_Parse();