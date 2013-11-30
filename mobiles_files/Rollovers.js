AttachEvent(window, "onload", ApplyRollovers);

var lastBackground;

/*
 * Applies the mouse rollover effect to the data table
 */
function ApplyRollovers() {
    // If too many filters are applied then there will be no data table
    var tableElements = $("divData").getElementsByTagName("table");
    
    if (tableElements == null || tableElements.length == 0) {
        return;
    }

    for (var j = 0; j < tableElements.length; j++) {   
        var table = tableElements[j];
        
        for (var i = 1; i < table.rows.length; i++) {
            if (table.rows[i].className == null || table.rows[i].className == "") {
                table.rows[i].onmouseover = function() { lastBackground = this.bgColor; this.bgColor = "#ffffe0"; };
                table.rows[i].onmouseout = function() { this.bgColor = lastBackground; }
            }
        }
    }
}