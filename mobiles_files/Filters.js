/*
 * Creates a scroll bar using the nominated div element
 */
function InitScrollBar(scrollDiv) {
    var scrollObj = new dw_scrollObj("div" + scrollDiv + "Outer", "div" + scrollDiv + "Inner");
    scrollObj.setUpScrollbar("drag" + scrollDiv, "track" + scrollDiv, "v", 1, 1);
}

/*
 * Verify that the user isn't trying to update the page while an update is still loading
 */
function IsClickValid() {
    if (xmlHttp) {
        alert("Please wait while your previous request is completed.");
        return false;
    }
    
    return true;
}

/*
 * Show/Hide the current filters box depending on if there are any filters displayed
 */
function ToggleCurrentFilters() {
    // Check if there are any filters still applied. If not, hide the current filters list
    var divCurrent = $("divCurrent");
    var filters = divCurrent.getElementsByTagName("a");
    divCurrent.parentNode.style["display"] = !filters || filters.length == 0 ? "none" : "block";
    
    // Show/Hide the Remove All link
    $("divRemoveAll").style["display"] = filters != null && filters.length > 1 ? "block" : "none";
}

/*
 * Removes the nominated data filter
 */
function RemoveFilter(filterLink, dataFilter, RequestHandler) {
    if (!IsClickValid()) return;

    // First, remove the link and uncheck the relevant checkbox
    filterLink.parentNode.removeChild(filterLink);
    var cbxFilter = document.getElementById(dataFilter);
    cbxFilter.checked = false;
    
    var baseDataFilter = $("boxDataFilter").value;
    var args = "DataFilter=" + baseDataFilter + "&Removed=" + dataFilter;

    ToggleCurrentFilters();
    RequestHandler(args);
}

/*
 * Removes all filters
 */
function RemoveAll(RequestHandler) {
    if (!IsClickValid()) return;

    // Remove all the quick remove links
    $("divCurrent").innerHTML = "";
    
    // Uncheck all the checkboxes
    var filters = $("divFilters").getElementsByTagName("input");
    for (var i = 0; i < filters.length; i++) {
        if (!filters[i].type || filters[i].type != "checkbox" || !filters[i].checked) {
            continue;
        }
        
        // Uncheck
        filters[i].checked = false;
    }
    
    ToggleCurrentFilters();
    RequestHandler("Anchor=" + $("boxAnchor").value + "&RemoveAll=1");
}

/*
 * Apply the filters that are currently checked
 */
function ApplyFilters(RequestHandler) {
    if (!IsClickValid()) return;

    // Clear the list of current filters so we can regenerate it
    var divCurrent = $("divCurrent")
    divCurrent.innerHTML = "";

    var filterList = new String();

    var filters = $("divFilters").getElementsByTagName("input");
    for (var i = 0; i < filters.length; i++) {
        if (!filters[i].type || filters[i].type != "checkbox" || !filters[i].checked) {
            continue;
        }
        
        // Add to the filter list 
        if (filterList.length > 0) {
            filterList += ";";
        }
        
        filterList += filters[i].value;
        
        // Now generate a quick link to remove this filter
        divCurrent.innerHTML += GenerateQuickRemoveLink(filters[i].name, filters[i].value);
    }
    
    divCurrent.parentNode.style["display"] = "block";

    ToggleCurrentFilters();

    var anchor = $("boxAnchor").value;
    RequestHandler("Anchor=" + anchor + "&Applied=" + filterList);
}

function OnFiltersApplied() {
    // Update the data filter
    var dataFilter = GetResponse("DataFilter");
    if (dataFilter && dataFilter != "") {
        $("boxDataFilter").value = dataFilter;
    }
}

/*
 * Generates a link to quickly remove a filter
 */
function GenerateQuickRemoveLink(name, value) {
    var requestHandler = $("boxRequestHandler").value;
    var args = "this, '" + value + "', " + requestHandler;
    return "<a href=\"javascript:;\" onclick=\"RemoveFilter(" + args
        + ")\" title=\"Instantly remove this filter\"><img src=\"_Images/RemoveFilter.png\" alt=\"Remove\" />&nbsp;"
        + name + "</a>";
}

function ToggleAdvancedFiltersDisplay() {
    var divAdvancedFilters = $("AdvancedFilters");   
    var linkAdvancedFiltersToggle = $("linkAdvancedFiltersToggle");
     
    if (divAdvancedFilters.style["display"] == "block") {
        divAdvancedFilters.style["display"] = "none";
        if (linkAdvancedFiltersToggle) {
            linkAdvancedFiltersToggle.innerHTML = "More >>";
        }
    } else {
        divAdvancedFilters.style["display"] = "block";
        if (linkAdvancedFiltersToggle) {
            linkAdvancedFiltersToggle.innerHTML = "<< Less";
        }
    }

}