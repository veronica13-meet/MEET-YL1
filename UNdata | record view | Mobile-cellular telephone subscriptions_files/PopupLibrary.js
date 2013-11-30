var defaultOffsetX = 50;
var defaultOffsetY = 27;
var inlineCloseEventsRegistered = new Object();
var isDocumentClickRegistered = false;
var isMouseOverPopup = false;


/*
 * Creates a div which informs the user that content is loading
 */
function CreateLoadingDiv(strObjectType) {
    var loadingMessage = "Loading " + strObjectType + "...";
    
    var loadingDiv = document.createElement("div");
    loadingDiv.className = "LoadingPopup";
    loadingDiv.style["width"] = (loadingMessage.length * 0.75) + "em";
    loadingDiv.innerHTML = "<img src=\"_Images/spinner.gif\" alt=\"spinner\" style=\"margin-right:5px\" /> " + loadingMessage;
    
    return loadingDiv;
}

/*
 * Displays the nominated div as a popup
 */
function ShowPopupDiv(divPopup) {
    document.getElementsByTagName("body")[0].appendChild(divPopup);
}

/*
 * Hides the nominated popup div
 */
function HidePopupDiv(divPopup) {
	document.getElementsByTagName("body")[0].removeChild(divPopup);
}

/*
 * Positions the nominated div around the current link
 */
function PositionPopup(divPopup, width, height, mouseX, mouseY, offsetX, offsetY) {
    // Default the offsets if needed
    if (!offsetX || offsetX == null) offsetX = defaultOffsetX;
    if (!offsetY || offsetY == null) offsetY = defaultOffsetY;

    // Find the base position
    var posX = mouseX - (width / 2) + offsetX;
    var posY = mouseY - (height / 2) - offsetY;
	
	// Adjust left or right if we're off the screen
	var windowWidth = CalculateViewport()[0];
    if (posX + width + offsetX > windowWidth) {
        posX = windowWidth - width - offsetX;
    } else if (posX <= 0) {
        posX = 15;
    }
        
	// Adjust height if we're off the screen
	var scrollY = GetScrollTop();
	if (posY < scrollY) {
	    posY = scrollY + 15;
	}

    // Set as absolute positions	
	divPopup.style["left"] = posX + "px";
	divPopup.style["top"] = posY + "px";
}


/*
 * Work out how high up the page the user has scrolled
 */
function GetScrollTop() {
	if (window.innerHeight) {
        return window.pageYOffset;
	
	} else if (document.documentElement && document.documentElement.scrollTop) {
		return document.documentElement.scrollTop;
		
	} else if (document.body) {
        return document.body.scrollTop;
	}
	
	return 0;
}

/*
 * Determines the size of the browser's viewport
 */
function CalculateViewport() {
    // all except Explorer
    if (self.innerHeight) {
        return [self.innerWidth, self.innerHeight];
    
    // Explorer 6 Strict Mode
    } else if (document.documentElement && document.documentElement.clientHeight) {
        return [document.documentElement.clientWidth, document.documentElement.clientHeight]

    // other Explorers
    } else if (document.body) { 
        return [document.body.clientWidth, document.body.clientHeight];
    }
}

function BuildInlinePopup(popupId, innerHTML, cssClassList) {
    // Build the inner HTML for the popup
    var html = "<a href=\"javascript:;\" title=\"Close\"><img src=\"_Images/Close.gif\" alt=\"Close\" class=\"X\" /></a>"
    html += innerHTML;

    // Work out the classes. The "Popup" class is mandatory.
    if (cssClassList == null || cssClassList == "") cssClassList = "Popup";
    if (cssClassList.match(/^popup$|^popup\s+|\s+popup$/gi) == null) {
        cssClassList = "Popup " + cssClassList;
    }

    // Build and hide the popup div
    var popup = document.createElement("div");
    popup.id = popupId;
    popup.innerHTML = html;
    popup.className = cssClassList;
    popup.style["display"] = "none";
    
    // Attach the popup to the document then return the popup element.
    document.getElementsByTagName("body")[0].appendChild(popup)    
    return popup;
}

/*
 * Show the options dialog
 */
function ShowInlinePopup(popupId, link, offsetX, offsetY) {    
    // If the popup is already visible (the user has clicked the link twice) then don't re-display it
    var popup = $(popupId);
    if (popup.style["display"] == "block") {
        return;
    }

    // Work out the x and y positions to show the popup. (The "FindPosition" function is in the Common.js file.)
    // Use default offsets for inline popups if not specified
    var mousePos = FindPosition(link);
    if (!offsetX) offsetX = 130;
    if (!offsetY) offsetY = 12;
    PositionPopup(popup, 100, 45, mousePos[0], mousePos[1], offsetX, offsetY);
        
    // Display after a timeout to allow the link.blur(); to occur
    if (link) link.blur();
    ShowInlinePopupByRef(popup, true);
}

function ShowInlinePopupByRef(popup, useDelay) {
    var showPopup = function() {
        // Attach a click event to the links inside the popup, to close the popup after the link is clicked
        var popupId = popup.id;
        AttachCloseEvents(popupId, popup);

        isDocumentClickRegistered = document["onclick"] != null;    
        AttachEvent(document, "onclick", function() { HideInlinePopup(popupId, false); });

        popup.style["display"] = "block";
        AttachEvent(popup, "onmouseover", function() { isMouseOverPopup = true; });
        AttachEvent(popup, "onmouseout", function() { isMouseOverPopup = false; });
        AttachSelectClickEventsFor(popup);
    }
    
    if (useDelay) setTimeout(showPopup, 100); else showPopup();
}

/*
 * Attaches the click events of the selects on the popup to set the isMouseOverPopup flag 
 * as IE fires the mouseout event for when an item is selected from the drop down list.
 */
function AttachSelectClickEventsFor(popup) {
    var selects = popup.getElementsByTagName("select");
    
    for (var i = 0; i < selects.length; i++) {
        AttachEvent(selects[i], "onclick", function() { isMouseOverPopup = true; });
    }
}

/*
 * Attaches a close event to all the links within a popup menu.
 */
function AttachCloseEvents(popupId, popup) {
    // Don't register the close events more than once
    if (inlineCloseEventsRegistered[popupId]) {
        return;
    }
    
    inlineCloseEventsRegistered[popupId] = true;
    
    var links = popup.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        if (links[i]["rel"] && links[i]["rel"] == "event") continue;
        AttachEvent(links[i], "onclick", function() { HideInlinePopup(popupId, true); });
    }
}

/*
 * Hides an inline popup if the mouse is not over it or it was clicked.
 */
function HideInlinePopup(popupId, isClicked, removeCloseEvents) {
    if (isClicked || !isMouseOverPopup) {
        var popup = $(popupId);
        if (!popup || popup == null) {
            return;
        }

        popup.style["display"] = "none";
        popup.onmouseover = popup.onmouseout = "";
        
        // Remove the onclick handler if we can
        if (!isDocumentClickRegistered) {
            document.onclick = null;
        }
        
        // Remove the close events if needed. This is typically done if the popup is going to be destroyed.
        if (removeCloseEvents) {
            inlineCloseEventsRegistered[popupId] = false;
        }
    }
}