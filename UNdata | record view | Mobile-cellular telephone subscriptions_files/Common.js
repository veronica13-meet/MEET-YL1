/*
 * Attach an event handler to the nominated event of the target element
 */
function AttachEvent(target, eventType, handler) {
    var currentHandler = target[eventType];
    if (typeof currentHandler == 'function') {
        target[eventType] = function() {
            currentHandler();
            handler();
        }
        
    } else {
        target[eventType] = handler;
    }
}

/*
 * Open a popup window.
 */
function ShowPopup(url, width, height) {
    // IE puts the scrollbars inside the window (i.e. counts it in the width)
    if (navigator.userAgent.indexOf("MSIE") >= 0) {
        width += 18;
    }
    
    var args = "scrollbars=yes,menubar=no,height=" + height + "px,width=" + width + "px,resizable=yes,toolbar=no,location=no,status=no"    
    return window.open(url, "", args);
}

/*
 * Find an element based on the provided strings
 *
 * elementId:   Server-side id of the element to find (e.g. "txtName")
 * tagName:     The runtime tag of the element (e.g. "input")
 * elementType: The runtime value of the "type" attribute for the element,
 *              if it exists (e.g. "text")
 */
function $(elementId, tagName, elementType) {
    if (!tagName || tagName == "") {
        return document.getElementById(elementId);
        
    } else if (tagName) {
        var elements = document.getElementsByTagName(tagName, "gi");
        var typeRegex = elementType && elementType != "" ? new RegExp(elementType) : null;
        
        for (var i = 0; i < elements.length; i++) {
            if (typeRegex) {
                if (!elements[i].type || !typeRegex.exec(elements[i].type)) {
                    continue;
                }
            }
            
            if (elements[i].id && elements[i].id.indexOf(elementId) >= 0) {
                return elements[i];
            }
        }    
    }
    
    return null;
}

/*
 * Find an element by tag name and server Id
 */
function FindElement(tagName, serverId) {
    var tags = document.getElementsByTagName(tagName);
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].id.indexOf(serverId) >= 0) {
            return tags[i];
        }
    }

    return null;
}

/*
 * Find an element by tag name and server Id
 */
function FindElementFromRoot(rootElement, tagName, serverId) {
    var tags = rootElement.getElementsByTagName(tagName);
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].id.indexOf(serverId) >= 0) {
            return tags[i];
        }
    }

    return null;
}

/*
 * Find a sibling of the nominated element
 */
function FindSibling(element, siblingId, isRunAtServer) {
    // Loop until no more siblings are found
    for (var nextSibling = element.nextSibling; nextSibling; nextSibling = nextSibling.nextSibling) {
        // If this sibling doesn't have an Id, then go to the next one
        if (!nextSibling.id) {
            continue;
        }
        
        // For runat=server tags, we need to do an index of (as opposed to a straight compare).
        if ((!isRunAtServer && nextSibling.id == siblingId) ||
            (isRunAtServer && nextSibling.id.indexOf(siblingId) >= 0)) {
            
            return nextSibling;
        }
    }
    
    // Not found - check backwards
    for (var prevSibling = element.previousSibling; prevSibling; prevSibling = prevSibling.previousSibling) {
        // If this sibling doesn't have an Id, then go to the next one
        if (!prevSibling.id) {
            continue;
        }
        
        // For runat=server tags, we need to do an index of (as opposed to a straight compare).
        if ((!isRunAtServer && prevSibling.id == siblingId) ||
            (isRunAtServer && prevSibling.id.indexOf(siblingId) >= 0)) {
            
            return prevSibling;
        }
    }
    
    // Not found :-(
    return null;
}

/*
 * Finds the absolute position of the nominated element, and returns it as an array [x, y]
 */
function FindPosition(oElement) {
    if (oElement.offsetParent) {
        for( var posX = 0, posY = 0; oElement.offsetParent; oElement = oElement.offsetParent ) {
            posX += oElement.offsetLeft;
            posY += oElement.offsetTop;
        }
    
        return [posX, posY];

    } else {
        return [oElement.x, oElement.y];
    }
}

/*
 * Creates a query string parameter to be used to represent the nominated value
 */
function BuildQueryStringParam(paramName, value) {
    if (!value || value.length == 0) {
        return "";
    }
    
    // Convert to a string (just in case it isn't already) and then trim
    value = Trim(value.toString());
    
    // Return the query string parameter
    return value.length > 0 ? "&" + paramName + "=" + value : "";
}

/*
 * Creates an xml style parameter for the body of a request
 */
function BuildRequestParam(name, value) {
    if (value == null) {
        return "";
    }
    
    // Convert to a string (just in case it isn't already) and then trim
    value = Trim(value.toString());
    
    // Return the request parameter
    return value.length > 0
        ? "<" + name + "><![CDATA[" + value + "]]></" + name + ">\r\n"
        : "";
}

/*
 * Retrieves the value of the nominated element, or null if the element is not found or has no value.
 */
function GetElementValue(tagName, serverId, property) {
    if (!property || property == "") {
        property = "value";
    }
    
    var element = FindElement(tagName, serverId);
    return element && element[property] ? element[property] : null;
}

/*
 * Trims a string of excess spaces at the begginning and end
 */
function Trim(value) {
    // LTrim
    var startIndex, endIndex;
    for (startIndex = 0; startIndex < value.length && value.charAt(startIndex) == " "; startIndex++);
    if (startIndex == value.length) {
        return "";
    }

    // RTrim
    for (var endIndex = value.length - 1; endIndex > startIndex && value.charAt(endIndex) == " "; endIndex--);
    return value.substring(startIndex, endIndex + 1);
}

/*
 * Toggle a panel's visibility
 */
function TogglePanel(panelId) {
    var panel = document.getElementById(panelId);
    var isVisible = panel.className && panel.className.match(/Hide/i);
    
    SetPanelVisible(panelId, isVisible);
}

/*
 * Set a panel to be visible or invisible
 */
function SetPanelVisible(panelId, isVisible) {
    var panel = document.getElementById(panelId);
    
    var className = panel.className;
    
    var currentRegex = isVisible ? /Hide/i : /Show/i;
    var updatedRegex = isVisible ? /Show/i : /Hide/i;
    var updatedClass = isVisible ? "Show" : "Hide";

    if (className && className.match(currentRegex)) {
        panel.className = className.replace(currentRegex, updatedClass);
        
    } else if (className && !className.match(updatedRegex)) {
        panel.className += " " + updatedClass;
    }

}


/*
 * Get a message box of the nominated type
 */
function BuildMessageBox(messageText, messageBoxType) {
    var backgroundColor = "#CFE6CF";
    var borderColor = "#598059";
    
    switch (messageBoxType.toLowerCase()) {
        case "confirm":
            backgroundColor = "#cfc";
            borderColor = "#191";
            break;
            
        case "warning":
            backgroundColor = "#FFFFBF";
            borderColor = "#777";
            break;
            
        case "error":
            backgroundColor = "#FFBFBF";
            borderColor = "#FF8080";
            break;
    }
    
    var style="border:solid 1px " + borderColor + ";background-color:" + backgroundColor + ";padding:10px;margin:10px;";
    return "<div style=\"" + style + "\">" + messageText + "</div>";
}


/*
* Toggle visibility
*/

function ToggleVisibility(id) {
    var e = document.getElementById(id);
    if (e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}
