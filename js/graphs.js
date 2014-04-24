var GDM_GRID_VIEWER = (function(module){
    'use strict';
    var self = module.Graphs = module.Graphs || (function() {
      // [ private properties ]
      var data = module.Data,
          ui = module.UI,
          dimensions = {},
          groups = {},
          bilateral_chart = {},
          sector_chart = {};

      // [ private methods ]
      var init = function() {
          dimensions = {
              bilateral: data.flows_xfilter.dimension(function(d){
                  return d.from + '|' + d.to;
              }),
              sector: data.flows_xfilter.dimension(function(d){
                  return d.sector;
              })
          };
          
          groups = {
              bilateral: dimensions.bilateral.group()
                  .reduceSum(function(d) {
                      return d.value;
                  }),
              sector: dimensions.sector.group()
                  .reduceSum(function(d) {
                      return d.value;
                  })
              };
          // dc.SortableBubbleGrid is defined in
          // js/graph/newDCgridChart.js
          bilateral_chart = dc.SortableBubbleGrid("#bilateralChart");
          // dc.rowChart is a standard method of dc.js
          sector_chart = dc.rowChart("#allSectorChart");
          initialise_bilateral_chart();
          initialise_sector_chart();
      };

      var initialise_bilateral_chart = function() {
          bilateral_chart
              .width(ui.dom_bilateral_chart.parent().width())
              .height(ui.dom_bilateral_chart.parent().width())
              .group(groups.bilateral)
              .dimension(dimensions.bilateral)
              .nodeNames(data.country_names)
              // .maxBubbleRelativeSize(0.3)
              .keyAccessor(function (p) { //x
                  // TODO: This needs refactoring / completely changing!
                  var from_id = +p.key.split("|")[0]; // Cast string as number
                  return data.country_ids.indexOf(from_id);
              })
              .valueAccessor(function (p) { //y
                  // TODO: This needs refactoring / completely changing!
                  var to_id = +p.key.split("|")[1]; // Cast string as number
                  return data.country_ids.indexOf(to_id);
              })
              .radiusValueAccessor(function (p) { //radius
                  return p.value;
              })
              .margins({top: 92, right:40, bottom: 40, left: 92});
      }

      // Update the filtered record count UI element
      var update_filtered_count = function() {
          var filter_text = data.filtered_records.value();
          ui.dom_filtered_count.text(filter_text);
      }

      // The sector_chart is the one down the side
      var initialise_sector_chart = function() {
          var i = 0;
          // Colours
          var rowChartColorsScale = d3.scale.linear()
              .domain([1,data.sectors.length])
              .range(["hsl(275, 100%, 75%, 0.72)", 
                      "hsl(228, 30%, 40%, 0.81)"]);
          var rowChartColors = [];
          for (i = 0; i < data.sectors.length; i++) {
              rowChartColors.push(rowChartColorsScale(i));
          }
      
          sector_chart
              .width(ui.dom_sector_chart.parent().width())
              .height(1000)
              .group(groups.sector)
              .dimension(dimensions.sector)
              .label(function(d) { 
                  return data.sectors_by_id[d.key];
              })
              .colors(rowChartColors)
              .on("filtered",function(chart,filter){
                  if(chart.hasFilter()){
                      ui.dom_reset_sectors.show();
                  }else{
                      ui.dom_reset_sectors.hide();
                  }
                  update_filtered_count();
              })
          .elasticX(true)
              .xAxis()
              .ticks(4);
      }

      var show = function() {
          dc.dataCount(".dc-data-count")
                .dimension(data.flows_xfilter)
                .group(data.filtered_records);
                
          dc.renderAll();
      }
      
      // [ public methods ]    
      return {
          init: init,
          show: show
      };
    })();
    return module;
}(GDM_GRID_VIEWER || {}));

