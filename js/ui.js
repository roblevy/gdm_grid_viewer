var GDM_GRID_VIEWER = GDM_GRID_VIEWER || {};

GDM_GRID_VIEWER.UI = (function(my){
    'use strict';
      // [ private properties ]
      var _data = GDM_GRID_VIEWER.Data,
          _dom_bilateral_chart = $("#bilateralChart"),
          _dom_sector_chart = $("#allSectorChart"),
          _dom_reset_sectors = $(".resetSectors"),
          _dom_filtered_count = $("#filter-count"),
          _dom_map = $("#map"),
          _dom_messages = $("#messages"),
          _current_message = "";
	
      // [ private methods ]
      function _init() {
        _dom_messages.on("transitionend", function(e) {
            this.classList.remove("new");
        });
          $(".button").button();
          _initialise_reset_buttons();
      }

	  function _update_filtered_count(value) {
		  _dom_filtered_count.text(value);
	  }
	  
      function _initialise_reset_buttons() {
          $(".resetMap").hide();
          $(".resetMap").click(function(){
              resetMap();
          });


          $(".resetAll").click(function(){
              dc.filterAll();
              dc.redrawAll();
              resetMap();
          });

          $(".resetGrid").hide();
          $(".resetGrid").click(function(){
              bilateral_chart.resetGrid();
          });

          $(".resetSectors").hide();
          $(".resetSectors").click(function(){
              sector_chart.filterAll();
              dc.redrawAll();
          });
      }

    function _write_message(msg, append) {
        _dom_messages.addClass("new");
        if (append) {
            msg = _current_message + '' + msg;
        }
        _dom_messages.text(msg);
        _current_message = msg;
    }
      
    // [ public methods ]
    my.init = _init;
    my.log = function(m, a) { return _write_message(m, a); };
    // DOM Elements
    my.dom_bilateral_chart = function() { return _dom_bilateral_chart; };
    my.dom_sector_chart = function() { return _dom_sector_chart; };
    my.dom_reset_sectors = function() { return _dom_reset_sectors; };
    my.dom_filtered_count = function() { return _dom_filtered_count; };
    my.dom_map = function() { return _dom_map; };
	my.update_filtered_count = _update_filtered_count;

    return my;
}(GDM_GRID_VIEWER.UI || {}));
