var GDM_GRID_VIEWER = (function(module){
    'use strict';
    var self = module.Map = module.Map || (function() {
      // [ private properties ]
      var _data = module.Data,
          _ui = module.UI,
          _width, _height,
          _map, _svg, _projection, _path, _zoom, _tooltip;
          
      // [ private methods ]
      var _init = function() {
          self._width = _ui.dom_map.width();
          self._height = _width / 2;
          self._projection = d3.gdo.equirectangular()
              .scale(153)
              .translate([_width / 2, _height / 2])
              .precision(.1);
          self._path = d3.geo.path().projection(_projection);
          self._zoom = d3.behavior.zoom()
              .scaleExtent([1, 8]).on("zoom", _redraw);
          self._map = d3.select("#map");
          self._svg = _map.append("svg")
                          .attr("width", _width)
                          .attr("height", _height)
                          .attr("class","grabbable")
                          .call(_zoom)
                          .append("g");
          self._tooltip = _map.append("div")
              .attr("class", "tooltip hidden");
          d3.selectAll('.button').on('click', _zoomClick);
          queue()
              .defer(d3.json, "data/world-110m.json")
              .defer(d3.tsv, "data/world-country-names.tsv")
              .await(_ready);

      };
      
    var _deselectAll = function(){
        countriesToFilter = [];
        _renderMap();
        $("._resetMap").hide();
    }

    var _resetMap = function(){
      
      countriesToFilter = [];
      newChart.filterAll();
      newChart.isSubset(false);
      // newChart.resetGrid();
      newChart.reDrawGrid(map_countries);
      
      allSectorChart.redraw();
      _renderMap();
      $("._resetMap").hide();
      $(".resetGrid").hide();
      updateFilterCounts(all.value());
    }

    var _addToFilters = function(c){
      if(!newChart.hasFilter(c+c)){
        newChart.filter(c+c);
      }
      _buildFlowsFilters(c);
      countriesToFilter.push(c);
      newChart.isSubset(true);
      
      newChart.reDrawGrid(countriesToFilter);
    }

    var _removeFromFilters = function(c){

      var index = countriesToFilter.indexOf(c);
      if (index > -1) {
          countriesToFilter.splice(index, 1);
        if(newChart.hasFilter(c+c)){
          newChart.filter(c+c);
        }
      }
      if(countriesToFilter.length > 0){
        _buildFlowsFilters(c);
        newChart.reDrawGrid(countriesToFilter);
        // newChart.filterAll();
      }else{
        newChart.isSubset(false);
        _resetMap();
      }

    }

    var _buildFlowsFilters = function(c){
      
      for (var i = 0; i < countriesToFilter.length; i++) {
        newChart.filter(countriesToFilter[i]+c)
        newChart.filter(c+countriesToFilter[i])
      }
      allSectorChart.redraw();
      updateFilterCounts(all.value());
    }

    var redraw = function() {
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
                redraw();
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
        country
         .enter()
          .insert("path")
          .attr("class", function(d,i){
          if(map_countries.indexOf(d.name) != -1){
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
                  _addToFilters(d.name);
                  }else{
                    d3.select(this).classed('selected',true);
                    el.style('fill','#D0D0D0');
                    _removeFromFilters(d.name);
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
              .html(d.name)
          })
          ;
    }

    var _ready = function(error, world, names) {

      var countries = topojson.object(world, world.objects.countries).geometries,
          neighbors = topojson.neighbors(world, countries),
          i = -1,
          n = countries.length;

      countries.forEach(function(d) { 
        var tryit = names.filter(function(n) { return d.id == n.id; })[0];
        if (typeof tryit === "undefined"){
          d.name = "Undefined";
        } else {
          d.name = tryit.name; 
        }
      });

    country = _svg.selectAll(".country").data(countries);
    _renderMap();
      
    }
      
      
      // [ public methods ]
    })();
    return module;
}(GDM_GRID_VIEWER || {}));