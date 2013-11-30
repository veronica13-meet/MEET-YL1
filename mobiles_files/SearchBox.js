AttachEvent(window, "onload", function() { 
    if ($("boxNoFocus") != null && $("boxNoFocus").value) return;
    var txtSearch = $("txtSearch", "input", "text");
    if (txtSearch != null) {
        txtSearch.focus();
    }
});

function Redirect(link) {
    if (link.className && link.className == "Active" && link.innerHTML != "Data") return;

    var searchTerm = $("txtSearch", "input", "text").value;
    var url = "Default.aspx";
    
    switch (link.innerHTML) {
        case "Data":
            url = searchTerm != null && searchTerm != ""
                ? "Search.aspx?q=" + searchTerm
                : "Default.aspx";
            
            break;
            
        case "Glossary":
            url = searchTerm != null && searchTerm != ""
                ? "Glossary.aspx?q=" + searchTerm
                : "Glossary.aspx";

            break;
            
         case "Countries":
            url = "Areas.aspx";
            break;
    }
    
    link.href = url;
}