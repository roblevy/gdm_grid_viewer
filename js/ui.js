var GDM_GRID_VIEWER = GDM_GRID_VIEWER || {};

GDM_GRID_VIEWER.UI = (function(my){
    'use strict';
      // [ private properties ]
      var _data = GDM_GRID_VIEWER.Data,
          _dom_bilateral_chart = $("#bilateralChart"),
          _dom_sector_chart = $("#allSectorChart"),
          _dom_reset_sectors = $(".resetSectors"),
          _dom_filtered_count = $("#filtered_count"),
          _dom_map = $("#map");
	
      // [ private methods ]
      function _init() {
          $(".button").button();
          // Report how many records have been filtered
          _dom_filtered_count.append(_data.filtered_count());
          // Report the total number of records
          $("#flows_count").append(_data.flows_xfilter().size());
          _initialise_reset_buttons();
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

    // [ public methods ]
    my.init = _init;
    // DOM Elements
    my.dom_bilateral_chart = function() { return _dom_bilateral_chart; };
    my.dom_sector_chart = function() { return _dom_sector_chart; };
    my.dom_reset_sectors = function() { return _dom_reset_sectors; };
    my.dom_filtered_count = function() { return _dom_filtered_count; };
    my.dom_map = function() { return _dom_map; };

    return my;
}(GDM_GRID_VIEWER.UI || {}));
