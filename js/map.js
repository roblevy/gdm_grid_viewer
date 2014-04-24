var GDM_GRID_VIEWER = (function(module){
    'use strict';
    var self = module.Map = module.Map || (function() {
      // [ private properties ]
      var _data = module.Data,
          _graphs = module.Graphs,
          _charts = _graphs.charts,
          _ui = module.UI,
          _width, _height,
          _map, _svg, _projection, _path, _zoom, _tooltip, _d3_countries,
          _countries_to_filter = [];
          
      // [ private methods ]
      var _init = function() {
          _width = _ui.dom_map.width();
          _height = _width / 2;
          _projection = d3.geo.equirectangular()
              .scale(153)
              .translate([_width / 2, _height / 2])
              .precision(.1);
          _path = d3.geo.path().projection(_projection);
          _zoom = d3.behavior.zoom()
              .scaleExtent([1, 8]).on("zoom", _redraw);
          _map = d3.select("#map");
          _svg = _map.append("svg")
                  .attr("width", _width)
                  .attr("height", _height)
                  .attr("class","grabbable")
                  .call(_zoom)
                  .append("g");
          _tooltip = _map.append("div")
              .attr("class", "tooltip hidden");
          d3.selectAll('.button').on('click', _zoomClick);
          queue()
              .defer(d3.json, "data/world-110m.json")
              .defer(d3.csv, "data/world-country-names-with-iso.csv")
              .await(_ready);
      };
      
    var _deselectAll = function(){
        _countries_to_filter.length = 0;
        _renderMap();
        $("._resetMap").hide();
    }

    var _resetMap = function(){
      
      _countries_to_filter.length = 0;
      _graphs.bilateral_chart.filterAll();
      _graphs.bilateral_chart.isSubset(false);
      // _graphs.bilateral_chart.resetGrid();
      _graphs.bilateral_chart.reDrawGrid(map_countries);
      
      _charts.sector_chart.redraw();
      _renderMap();
      $("._resetMap").hide();
      $(".resetGrid").hide();
      _graphs.update_filtered_count(_data.filtered_records.value());
    }

    var _addToFilters = function(c){
      if(!_charts.bilateral_chart.hasFilter(c+c)){
        _charts.bilateral_chart.filter(c+c);
      }
      _buildFlowsFilters(c);
      _countries_to_filter.push(c);
      _charts.bilateral_chart.isSubset(true);
      
      _charts.bilateral_chart.reDrawGrid(_countries_to_filter);
    }

    var _removeFromFilters = function(c){

      var index = _countries_to_filter.indexOf(c);
      if (index > -1) {
          _countries_to_filter.splice(index, 1);
        if(_charts.bilateral_chart.hasFilter(c+c)){
          _charts.bilateral_chart.filter(c+c);
        }
      }
      if(_countries_to_filter.length > 0){
        _buildFlowsFilters(c);
        _charts.bilateral_chart.reDrawGrid(_countries_to_filter);
        // _charts.bilateral_chart.filterAll();
      }else{
        _charts.bilateral_chart.isSubset(false);
        _resetMap();
      }

    }

    var _buildFlowsFilters = function(c){
      
      for (var i = 0; i < _countries_to_filter.length; i++) {
        _charts.bilateral_chart.filter(_countries_to_filter[i]+c)
        _charts.bilateral_chart.filter(c+_countries_to_filter[i])
      }
      _charts.sector_chart.redraw();
      _graphs.update_filtered_count(_data.filtered_records.value());
    }

    var _redraw = function() {
        _svg.attr("transform", "translate(" + _zoom.translate() + ")scale(" + _zoom.scale() + ")");
    }

    var _interpolateZoom = function (translate, scale) {
        var self = this;
        return d3.transition().duration(350).tween("zoom", function () {
            var iTranslate = d3.interpolate(_zoom.translate(), translate),
                iScale = d3.interpolate(_zoom.scale(), scale);
            return function (t) {
                _zoom
                    .scale(iScale(t))
                    .translate(iTranslate(t));
                _redraw();
            };
        });
    }

    var _zoomClick = function() {

        var clicked = d3.event.target,
            direction = 1,
            factor = 1,
            target_zoom = 1,
            center = [_width / 2, _height / 2],
            extent = _zoom.scaleExtent(),
            translate = _zoom.translate(),
            translate0 = [],
            l = [],
            view = {x: translate[0], y: translate[1], k: _zoom.scale()};

        d3.event.preventDefault();
        direction = (this.id === 'zoom_in') ? 1 : -1;
        target_zoom = _zoom.scale() + (factor * direction);

        if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }
      
        translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
        view.k = target_zoom;
        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

        view.x += center[0] - l[0];
        view.y += center[1] - l[1];

        _interpolateZoom([view.x, view.y], view.k);
      
    }

    var _renderMap = function(){
        _d3_countries
         .enter()
          .insert("path")
          .attr("class", function(d,i){
          if(_data.country_names.indexOf(d.iso3) != -1){
            return "country inmodel selected";
          }else{
            return "country";
          } 
          })    
            .attr("title", function(d,i) { return d.name; })
            .attr("d", _path)
            .style("fill", function(d, i) {
            var el = d3.select(this);
            if(el.classed('inmodel')){
              return "#D0D0D0";
            }else{
              return "#FFFFFF";
            } 
          })
          .on("mouseover",function(d){
            var el = d3.select(this);
            if(el.classed('inmodel')){
              // if(!el.classed('selected')){
                d3.select(this)
                  .style('fill','#808080')
              // }
            }
          })
        .on("mouseout",function(){
          _tooltip.classed("hidden", true)
          var el = d3.select(this);
          if(el.classed('inmodel')){
            if(!el.classed('selected')){
              d3.select(this)
                .style('fill','#505050')
            }else{
                d3.select(this)
                  .style('fill','#D0D0D0')
            }
          }
        })
        .on("click",function(d){
        
          var el = d3.select(this);
          if(el.classed('inmodel')){
                  if(el.classed('selected')){
                    el.classed('selected',false);
                  el.style('fill','#505050');
                  _addToFilters(d.iso3);
                  }else{
                    d3.select(this).classed('selected',true);
                    el.style('fill','#D0D0D0');
                    _removeFromFilters(d.iso3);
                  }
              
          }
        })
          .on("mousemove", function(d,i) {
            var mouse = d3.mouse(_map.node()).map( function(d) { return parseInt(d); } );
        // console.log(mouse);
        var offset = $("#map").offset();
        offset.top = offset.top - 50;
            _tooltip
              .classed("hidden", false)
              // .attr("style", "left:"+(mouse[0] + 100)+"px;top:"+(mouse[1] + 500)+"px")
            .attr("style", "left:"+(mouse[0] + offset.left)+"px;top:"+(mouse[1]+offset.top)+"px")
              .html(d.iso3)
          })
          ;
    }

    var _ready = function(error, world, names) {

      var country_shapes = topojson.object(world, world.objects.countries).geometries,
          neighbors = topojson.neighbors(world, country_shapes),
          i = -1,
          n = country_shapes.length;

      country_shapes.forEach(function(d) { 
        var tryit = names.filter(function(n) { return d.id == n.id; })[0];
        if (typeof tryit === "undefined"){
          d.name = "Undefined";
          d.iso3 = "Undefined";
          console.log("id " + d.id + " not found");
        } else {
          d.name = tryit.name;
          d.iso3 = tryit.iso3;
        }
      });
      
      _d3_countries = _svg.selectAll(".country").data(country_shapes);
      _renderMap();

    }
      
      // [ public methods ]
      return {
          init: _init,
          map: _map
      };
    })();
    return module;
}(GDM_GRID_VIEWER || {}));