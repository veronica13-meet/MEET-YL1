var loadingDiv;
var dataMartInfoDiv;
var linkPos;
var activeLink;

/*
 * Displays information about the nominated data mart
 */
function ShowDataMartInfo(link, dataMartId, filter) {
    // Ignore input if we're current fetching another data mart's info
    if (xmlHttp) return;

    // Close previous popups
    if (dataMartInfoDiv != null) {
        CloseDataMartInfo();
    }
    
    // Remove previous popups
    var oldPopup = document.getElementById("divDMI")
    if (oldPopup) {
        oldPopup.parentNode.removeChild(oldPopup);
    }
    
    // Show the loading box near the link that was clicked  
    linkPos = FindPosition(link);
    loadingDiv = CreateLoadingDiv("Information");
    PositionPopup(loadingDiv, 220, 0, linkPos[0], linkPos[1], 0, -40);
    ShowPopupDiv(loadingDiv);

    // Build request arguments
    var args = "d=" + dataMartId;
    if (filter && filter != "") {
        args += "&f=" + filter;
    }
    
    SendXmlHttpRequest("Handlers/DataMartHandler.ashx?" + args, OnDataMartInfoFound, OnDataMartInfoError);
}

/*
 * Displays the country list
 */
function OnDataMartInfoFound(responseText) {
    // Create the element to display
    dataMartInfoDiv = BuildInlinePopup("divDMI", responseText, "DataMartInfoPopup");
    
    // Position
    var viewportSize = CalculateViewport();
    PositionPopup(dataMartInfoDiv, 500, 0, linkPos[0], linkPos[1], 0, -40);

    // Hide the loading div then show the Data Mart Info div
    HidePopupDiv(loadingDiv);
    loadingDiv = null;
    ShowInlinePopupByRef(dataMartInfoDiv);
    
    DiscardXmlHttpRequest();
}

/*
 * Invoked if there is a problem loading the data mart info
 */
function OnDataMartInfoError(errorText) {
    HidePopupDiv(loadingDiv);
    loadingDiv = null;
    
    alert("Error: " + errorText);
}

/*
 * Closes the div showing the data mart info
 */
function CloseDataMartInfo() {
    HideInlinePopup("divDMI", true, true);
    dataMartInfoDiv = null;
}


