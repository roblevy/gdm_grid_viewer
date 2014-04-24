var GDM_GRID_VIEWER = (function(module){
    'use strict';
    var self = module.UI = module.UI || (function() {
      // [ private properties ]
      var data = GDM_GRID_VIEWER.Data,
          dom_bilateral_chart = $("#bilateralChart"),
          dom_sector_chart = $("#allSectorChart"),
          dom_reset_sectors = $(".resetSectors"),
          dom_filtered_count = $("#filtered_count");
      // [ private methods ]
      function init() {
          $(".button").button();
          // Report how many records have been filtered
          dom_filtered_count.append(data.filtered_count());
          // Report the total number of records
          $("#flows_count").append(data.flows_xfilter.size());
          initialise_reset_buttons();
      } 
   
      function initialise_reset_buttons() {
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
      return {
          init: init,
          // DOM Elements
          dom_bilateral_chart: dom_bilateral_chart,
          dom_sector_chart: dom_sector_chart,
          dom_reset_sectors: dom_reset_sectors,
          dom_filtered_count: dom_filtered_count,  
      };
    })();
    return module;
}(GDM_GRID_VIEWER || {}));

GDM_GRID_VIEWER.UI = (function(GDM_GRID_VIEWER){
    'use strict';


}(GDM_GRID_VIEWER));


