/*
 * Allows the user to download the nominated series
 */
function ShowDownloadPopup(link, dataMartId, dataFilter, columns, sortOrder, pivotColumn, recordCount, maxRecordCount) {
    HideDownloadPopup();
    
    BuildDownloadBox(dataMartId, dataFilter, sortOrder, columns, pivotColumn, recordCount, maxRecordCount);
    ShowInlinePopup("divDownload", link, 100, -20);
}

function ShowDynamicDownloadPopup(link, dataMartId, maxRecordCount) {
    ShowDownloadPopup(link, dataMartId, $("boxDataFilter").value, BuildColumnListParam(), BuildSortOrderParam(), BuildPivotColumnParam(), $("spanRecordCountB").innerHTML, maxRecordCount)
}

function BuildDownloadBox(dataMartId, dataFilter, columns, sortOrder, pivotColumn, recordCount, maxRecordCount) {
    
    $("downloadXmlLink").href = BuildDownloadLinkFor('xml', dataMartId, dataFilter, columns, sortOrder, pivotColumn);
    $("downloadCommaLink").href = BuildDownloadLinkFor('csv', dataMartId, dataFilter, columns, sortOrder, pivotColumn);
    $("downloadSemicolonLink").href = BuildDownloadLinkFor('scsv', dataMartId, dataFilter, columns, sortOrder, pivotColumn);
    $("downloadPipeLink").href = BuildDownloadLinkFor('psv', dataMartId, dataFilter, columns, sortOrder, pivotColumn);
    
    SetPanelVisible("downloadNote", maxRecordCount < recordCount);
}

function BuildDownloadLinkFor(type, dataMartId, dataFilter, columns, sortOrder, pivotColumn){
    return "javascript:Download('" + type + "','" + dataMartId + "','" + dataFilter + "','" + columns + "','" + sortOrder + "','" + pivotColumn + "');";
}

function HideDownloadPopup() {
    HideInlinePopup("divDownload", true);
}

/*
 * Downloads the data into the specified file format
 */
function Download(format, dataMartId, dataFilter, columns, sortOrder, pivotColumn) {
    if (!dataFilter) dataFilter = $("boxDataFilter").value;
    if (!dataMartId) dataMartId = $("boxDataMartId").value;
   
    var url = "Handlers/DownloadHandler.ashx?DataFilter=" + dataFilter + "&DataMartId=" + dataMartId + "&Format=" + format + PrependAmpersandTo(sortOrder) + PrependAmpersandTo(pivotColumn) + PrependAmpersandTo(columns);
    window.location = url;
}

function PrependAmpersandTo(s) {
    if (s.length > 0) {
        return "&" + s; 
    }
    
    return "";
}