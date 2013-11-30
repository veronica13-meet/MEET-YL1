/*
 * Transfer to the auto pivot page
 */
function Pivot(pivot) {
    SetLocation("AutoPivot", "p=" + pivot);
}

/*
 * Unpivots the data
 */
function Unpivot() {
    SetLocation("Data", null);
}

/*
 * Graph the data using the nominated pivot
 */
function Graph(pivot) {
    SetLocation("Graph", "p=" + pivot);
}

/*
 * Transfer to the graphing page. Args are optional.
 */
function SetLocation(pageName, args) {
    var dataFilter = $("boxDataFilter").value;
    var dataMartId = $("boxDataMartId").value;
    var keywords = QueryString("q");
    
    if (keywords) {
        keywords = "q=" + keywords + "&";
    } else {
        keywords = "";
    }

    var url = pageName + ".aspx?" + keywords + "d=" + dataMartId + "&f=" + dataFilter + (args != null && args != "" ? "&" + args : "");
    window.location.href = url;
}

/*
 * Updates the current link to reflect the current filters
 */
function LinkTo(pageName, argumentBuilder) {
    var args = argumentBuilder != null ? argumentBuilder() : "";

    switch (pageName) {
        case "Data":
            if (args.length > 0) args += "&";
            args += "v=" + $("spanPageIndexB").innerHTML;
            SetLocation("Data", args);
            break;
            
        case "AutoPivot":
            if (args.length > 0) args += "&";
            args += "p=" + $("boxPivot").value;
            args += "&h=" + $("boxHPage").value;
            args += "&v=" + $("boxVPage").value;
            
            SetLocation("AutoPivot", args);
            break;
    }
}