var filtersChanged = false;

window.onload = function () {
    var currentDefinitionBox = GetCurrentDefinitionBox();
    if (currentDefinitionBox.value) {
        var currentDefinition = currentDefinitionBox.value;
        currentDefinitionBox.value = "";
        ChangeDefinitionTo(currentDefinition);
    }
}

/*
 * Move forward or backward by the number of pages specified
 */
function Page(pageDelta) {
    var pageIndex = parseInt($("spanPageIndexB").innerHTML) + pageDelta;
    SendDataRequest("page", "Page=" + pageIndex + "&DataFilter=" + $("boxDataFilter").value);
}

/*
 * Move to page specified
 */
function GoTo(page) {
    var pageIndex;
    
    if (page == "First") {
        pageIndex = 1;
    }
    
    if (page == "Last"){
        pageIndex = parseInt($("spanPageCountB").innerHTML);
    }
    SendDataRequest("page", "Page=" + pageIndex + "&DataFilter=" + $("boxDataFilter").value);
}

/*
 * Apply the filters
 */
function SendFilterRequest(args) {
    filtersChanged = true;
    SendDataRequest("query", args);
}

/*
 * Sends a request to re-query the database
 */
function SendDataRequest(service, args) {
    // Hide the message box if it's displayed
    $("divMessages").style["display"] = "none";
    
    // Check if there are any filters still applied. If not, hide the current filters list
    var divCurrent = $("divCurrent");
    var filters = divCurrent.getElementsByTagName("a");
    divCurrent.parentNode.style["display"] = !filters || filters.length == 0 ? "none" : "block";

    // Scroll to the top of the page and show a loading box
    window.scroll(0, 0);
    $("divLoading").style["display"] = "block";
    $("divData").style["display"] = "none";
    $("divRecordsB").style["display"] = "none";

    // Get the various options for the query
    var dataMartId = $("boxDataMartId").value;
    var userQuery = $("txtSearch", "input", "text").value
    
    // Build the url then send the request
    var url = "Handlers/" + GetHandlerName() + "?Service=" + service;
    if (args && args != "") {
        url += "&" + args;
    }
    
    url += "&DataMartId=" + dataMartId + "&UserQuery=" + userQuery;
    
    if (!IsPivotChange() && !(IsPivotedView() && filtersChanged)) {
        url += "&" + BuildColumnListParam();
    
        var sortOrder = BuildSortOrderParam();    
        if (sortOrder.length > 0) {
            url += "&" + sortOrder;
        }
    }  
    
    var pivotColumn = BuildPivotColumnParam();
    if (pivotColumn.length > 0) {
        url += "&" + pivotColumn;
    }   
    
    SendXmlHttpRequest(url, OnQueryResult, OnError);
}

function IsPivotedView() {
    return GetPivotColumnValue() != "";
}

function IsPivotChange() {
    return $("boxPivotColumn").value != GetPivotColumnValue();
}

function GetPivotColumnValue() {
    var pivotColumnSelect = $("ddlPivotColumn", "select");
    
    if (pivotColumnSelect.selectedIndex != -1) {
       return pivotColumnSelect.options[pivotColumnSelect.selectedIndex].value;
    }
    
    return "";
}

function GetHandlerName() {
    if (IsPivotedView()) {
        return "PivotHandler.ashx"
    } else {
        return "DataHandler.ashx"
   }
}

/*
 * Updates which columns should and should not be visible
 */
function UpdateView() {
    // Ensure at least 1 column is selected
    var columns = GetColumnList();
    if (columns.length == 0) {
        alert("You must select at least 1 column to display.");
        return;
    }
    
    // Hide the popup
    HideInlinePopup("divView", true);

    // Send a request to find the new stuff and things
    SendDataRequest("query", "DataFilter=" + $("boxDataFilter").value);
}

/*
 * Updates the sort order of the displayed data
 */
function UpdateSort() {
    // Check sort validity
    if (!IsValidSort()) {
        return;
    }

    // Hide the popup
    HideInlinePopup("divSort", true);
   
    // Send a request to find the new stuff and things
    SendDataRequest("query", "DataFilter=" + $("boxDataFilter").value);
}

/*
 * Updates the pivot column of the displayed data
 */
function UpdatePivot() {
    // Hide the popup
    HideInlinePopup("divPivot", true);
   
    // Send a request to find the new stuff and things
    SendDataRequest("query", "DataFilter=" + $("boxDataFilter").value);
}

/*
 * Updates the URL in the address bar for the current data view
 */
function UpdateUrl() {
    // Hide the popup
    HideInlinePopup("divLinkTo", true);
    
    // Rewrite URL
    LinkTo('Data', BuildLinkToParams);
}

/*
 * Get the list of columns currently selected to be displayed
 */
function GetColumnList() {
    var columns = new String();

    // Make a list of the columns that should be displayed
    var columnList = $("divView").getElementsByTagName("input");
    for (var i = 0; i < columnList.length; i++) {
        if (columnList[i].type != "checkbox" || !columnList[i].checked) continue;
        
        if (columns.length > 0) {
            columns += ",";
        }
        
        columns += i; // columnList[i].value;
    }
    
    return columns;
}

/*
 * Analyses the sort selection to determine its validity. 
 */
function IsValidSort() {
    var sortOrder = GetSortOrder();
    
//    if (!AssertNoSelectionHolesIn(sortOrder)) {
//        alert("");
//        return false;
//    }
    
    if (!AssertNoDuplicateColumnsIn(sortOrder)) {
        alert("You must not select the same column more than once.");
        return false;
    }

    return true;
}

/*
 * Asserts there are no holes (i.e. blanks) in the sort order. Empty strings equal no selection.
 */
function AssertNoSelectionHolesIn(sortOrder) {
    var hasPreviousEmptySelection = false;
    
    for (var i = 0; i < sortOrder.length; i++) {
        if (hasPreviousEmptySelection && sortOrder[i][0] != "") {
            return false;
        }
        if (sortOrder[i][0] == "") {
            hasPreviousEmptySelection = true;
        }
    }
    
    return true;
}

/*
 * Asserts there are no duplicates in the sort order. Empty strings equal no selection.
 */
function AssertNoDuplicateColumnsIn(sortOrder){
    var i = 0;
    var j = 0;
    
    for (var i = 0; i < sortOrder.length; i++) {
        if (sortOrder[i][0] == "") {
            continue;
        }
    
        for (var j = i + 1; j < sortOrder.length; j++) {
            if (sortOrder[i][0] == sortOrder[j][0]) {
                return false
            }
        }
    }

    return true;
}

/*
 * Get the sort order of the displayed data.
 */
function GetSortOrder() {
    var sortOrder = new Array(3);
    
    for (var i = 0; i <= 2; i++) {
        var widgetId = i + 1;
        sortOrder[i] = GetSortTermFrom("ddlSortColumn" + widgetId, "sortByDirectionRadios" + widgetId)
    }

    return sortOrder;
}


/*
 * Get the sort order parameter to pass in the query string.
 */
function BuildSortOrderParam() {
    var param = "";
    var sortOrder = GetSortOrder();
    
    for (var i = 0; i < sortOrder.length; i++) {
        if (sortOrder[i][0] != "") {
            param += "," + sortOrder[i][0] + ":" + sortOrder[i][1];
        }
    }
    
    if (param.length > 0) {
        return "s=" + param.substr(1, param.length - 1);
    } else {
        return "";
    }
}

/*
 * Gets the sort term from the specified select and radio controls.
 */
function GetSortTermFrom(columnSelectName, directionRadiosName) {
    var sortTerm = new Array(2);
    var columnSelect = $(columnSelectName, "select");
    var directionRadios = $(directionRadiosName).getElementsByTagName("input");

    sortTerm[0] = "";
    sortTerm[1] = "asc";
      
    var i = 1;
    var found = false;
    while (i < columnSelect.options.length && !found) {
        if (columnSelect.options[i].selected) {
            sortTerm[0] = columnSelect.options[i].value;
            found = true;
        }
        i++;
    }
       
    if (directionRadios != null) {
        i = 0;
        found = false;
        while (i < directionRadios.length && !found) {
            if (directionRadios[i].checked) {
                sortTerm[1] = directionRadios[i].value;
                found = true;
            }
            i++;
        }
    } 
    
    return sortTerm;
}

function BuildColumnListParam() {
    return "c=" + GetColumnList();
}

function BuildPivotColumnParam() {
    if (IsPivotedView()) {
        return "p=" + GetPivotColumnValue();
    } else {
        return "";
    }
}

function BuildLinkToParams() {
    var linkToParams = "";
    var params = new Array();
    
    params[0] = BuildColumnListParam();
    params[1] = BuildSortOrderParam();
    params[2] = BuildPivotColumnParam();

    for (var i = 0; i <= 2; i++) {
        if (linkToParams != "" && params[i] != "") {
            linkToParams += "&";        
        }
        linkToParams += params[i];
    }
    
    return linkToParams;
}

/*
 * Invoked when the XmlHttp request returns with the query result
 */
function OnQueryResult(responseText) {
    OnFiltersApplied();
    
    if (IsPivotChange() || filtersChanged) {
        UpdateViewColumns();
        UpdateSortColumns();
    }
    
    UpdatePage();
    
    $("boxPivotColumn").value = GetPivotColumnValue();
    filtersChanged = false;
    
    // Rerender the data table then discard the request
    $("divData").innerHTML = responseText;
    ApplyRollovers();
    
    // Hide the loading div
    $("divLoading").style["display"] = "none";
    $("divData").style["display"] = "block";
    $("divRecordsB").style["display"] = "block";
    
    DiscardXmlHttpRequest();
}

/*
 * Update the top and bottom paging panels
 */
function UpdatePage() {
//    UpdatePageSection("T");
    UpdatePageSection("B");
}

function UpdatePageSection(suffix) {
    var recordCount = GetResponse("RecordCount");
    $("spanRecordCount" + suffix).innerHTML = recordCount;
    
    var pageSize = GetResponse("PageSize");
    var pageCount = parseInt(recordCount / pageSize) + (recordCount % pageSize > 0 ? 1 : 0);
    $("spanPageCount" + suffix).innerHTML = pageCount;

    // Make sure we don't say "Page 1 of 0 if there are no records"
    var pageIndex = GetResponse("PageIndex");
    $("spanPageIndex" + suffix).innerHTML = pageIndex <= pageCount ? pageIndex : pageCount;
    
    var linkPrev = $("linkPrev" + suffix);
    var linkNext = $("linkNext" + suffix);
    var linkLast = $("linkLast" + suffix);
    var linkFirst = $("linkFirst" + suffix);

    // Work out if the previous/next links should be visible
    linkFirst.style["display"] = pageIndex > 1 ? "" : "none"; 
    linkPrev.style["display"] = pageIndex > 1 ? "" : "none";

    linkNext.style["display"] = pageIndex < pageCount ? "" : "none";   
    linkLast.style["display"] = pageIndex < pageCount ? "" : "none";
     
    $("spanSep" + suffix).style["display"] = linkPrev.style["display"] == linkNext.style["display"] && linkPrev.style["display"] == ""
        ? "" : "none";
}

/*
 * Invoked when an error occurs processing an XmlHttp request
 */
function OnError(errorText) {
    // Hide the loading box
    $("divLoading").style["display"] = "none";
       $("divData").style["display"] = "block";
    $("divRecordsB").style["display"] = "block";
    
    $("divMessages").innerHTML = BuildMessageBox(errorText, "error");
    
    $("divMessages").style["display"] = "block";
}

function UpdateViewColumns() {
    var container = $("divView").getElementsByTagName("div")[0];
    container.innerHTML = "";
    
    var columns = GetResponse("Columns").split(";");
    
    for (var i = 0; i < columns.length; i++) {
        var columnParts = columns[i].split(",");
        container.innerHTML += "<input type=\"checkbox\" id=\"" + columnParts[0] + "\" " + Checked(columnParts[2]) + "/><label for=\"" + columnParts[0] + "\">" + columnParts[1] + "</label><br />"
    }
    
}

function Checked(checkedValue) {
    if (checkedValue == 1) {
        return "checked=\"checked\"";
    }
    return "";
}

function UpdateSortColumns() {
    var divSort = $("divSort");
    var sortSelects = divSort.getElementsByTagName("select");
    var sortRadios = divSort.getElementsByTagName("table");
    var columns = GetSortableColumns();
    
    if (columns.length == 0) {
        return;
    }
    
    var sortClauseParts = GetSortClauseParts();
    
    for (var i = 0; i < sortSelects.length && i < sortClauseParts.length; i++) {
        UpdateSortColumn(sortSelects[i], columns, sortClauseParts[i][0]);
        UpdateSortDirection(sortRadios[i], sortClauseParts[i][1]);
    }
}

function UpdateSortColumn(select, options, sortDetail) {
    var sortDetailParts = sortDetail.split(" ");
    select.options.length = 0;    
        
    for (var i = 0; i < options.length; i++) {
        var optionParts = options[i].split(",");              
        select.options[i] = new Option(optionParts[1], optionParts[0], false, (optionParts[0] == sortDetailParts[0]));
    }
}

function UpdateSortDirection(options, sortDirection) {
    var optionIndex = 0;

    if (sortDirection == 'desc') {
        optionIndex = 1;
    }
    
    options.getElementsByTagName("input")[optionIndex].checked = true;   
}

function GetSortableColumns() {
    var sortableColumns = GetResponse("SortableColumns");
    var options = new Array();
    
    if (sortableColumns != "") {
        options = sortableColumns.split(";");
    }
    
    return options;
}

function GetSortClauseParts() {
    var sortClause = GetResponse("SortClause");
    var clauses = new Array();
    var parts = new Array();
    
    if (sortClause != "") {
        clauses = sortClause.split(",");
        
        var i = 0;
        while (i < clauses.length){
            var clauseParts = clauses[i].split(" ");
            parts[i] = new Array();
            
            if (clauseParts.length == 2) {
                parts[i][0] = clauseParts[0];
                parts[i][1] = clauseParts[1];            
            } else {
                parts[i][0] = parts[i][1] = "";
            }

            i++;
        }
        
        while (i < 3) {
            parts[i] = new Array();
            parts[i][0] = parts[i][1] = "";
            i++;
        }     
    }
    
    return parts;
}

function ChangeDefinitionTo(newDefinition) {
    var currentDefinitionBox = GetCurrentDefinitionBox();
    if (currentDefinitionBox.value) {
        TogglePanel(currentDefinitionBox.value);
    }
    TogglePanel(newDefinition);
    currentDefinitionBox.value = newDefinition;
}

function GetCurrentDefinitionBox() {
    return $("boxCurrentDefinition", "input");
}