var xmlHttp;
var onResponse;
var onError;

/*
 * Aborts any existing xml http requests in preparation for a new request
 */
function PrepareXmlHttpRequest() {
    if (xmlHttp) {
        try {
            xmlHttp.abort();
            
        } catch(error) {
            // ignore
        }
    }
}

/*
 * Get an Xml HTTP Request object compatible with the current browser
 */
function GetXmlHttpRequestObject() {
    // branch for native XMLHttpRequest object
    if (window.ActiveXObject) {
        var xmlHttpObj = new ActiveXObject("Msxml2.XMLHTTP");
        if (!xmlHttpObj) {
            xmlHttpObj = new ActiveXObject("Microsoft.XMLHTTP");
        }
        
        return xmlHttpObj;
    }
    
    try {
        return new XMLHttpRequest();
    } catch (error) {
        //
    }
    
    return null;
}

/*
 * Send an XmlHttpRequest
 */
function SendXmlHttpRequest(url, responseHandler, errorHandler, content) {
    PrepareXmlHttpRequest();

    this.onResponse = responseHandler;
    this.onError = errorHandler;
    
    xmlHttp = GetXmlHttpRequestObject();
    if (!xmlHttp) {
		return null;
	}

    // Append a random parameter to the end of the URL to force the browser to resend the request
    // (i.e. avoids request caching issues, especially in Internet Explorer).    
    var parmSeperator = url.indexOf("?") >= 0 ? "&" : "?";
    url += parmSeperator + "RequestId=" + Math.round(Math.random() * 1000);
    
    xmlHttp.onreadystatechange = OnResponse;

    // Send the appropriate request
    if (content && content.length > 0) {
        content = "<?xml version='1.0'?>\r\n<request>" + content + "\r\n</request>";

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "text/xml")
        xmlHttp.send(content);
   
    } else {
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }    
    
    return xmlHttp;
}

/*
 * Invoked when the xmlHttp request returns
 */
function OnResponse() {
    if (IsResponseValid() == false) {
        return;
    }
    
    // Check if there's an error
    var errorText = GetResponse("error");
    if (errorText != "" && onError != null) {
        onError(errorText);
        DiscardXmlHttpRequest();
    
    } else {
        responseText = xmlHttp.responseText;
        onResponse(responseText);
    }
}

/*
 * Validate an xmlHttp response
 */
function IsResponseValid() {
    if (!xmlHttp || xmlHttp.readyState != 4) {
        return false;
    }

    try {
        if (xmlHttp.status != 200) {
            onError("Error: Http status = " + xmlHttp.status);
            return false;
        }
        
    } catch(exception) {
    }
    
    return true;
}

/*
 * Signals we are finished with the xmlHttp request object
 */
function DiscardXmlHttpRequest() {
    xmlHttp = null;
    onResponse = null;
    onError = null;
}

/*
 * Get the response from the header. Firefox (et al) don't like it
 * if you ask for a response and it's not there, so catch the exception
 */
function GetResponse(headerKey) {
    try {
        var value = xmlHttp.getResponseHeader(headerKey);
        return value && value != "" ? value : "";
        
    } catch (ex) {
        // ignore
    }
    
    return "";
}

/*
 * Get the img tag for showing that an operation is in progress
 */
function GetProgressImage(captionText, cssClass, style) {
    var html = "<div";
    if (cssClass && cssClass != "") {
        html += " class=\"" + cssClass + "\"";
    }
    
    if (style && style != "") {
        html += " style=\"" + style + "\"";
    }
    
    return html + "><img src=\"_Images/spinner.gif\" alt=\"spinner\" style=\"margin-right:10px\" />" + captionText + "</div>";
}