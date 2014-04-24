


// buildFlowsFilters();
// var flowsFilters = [];

var country;
// var width  = 960,
//     height = 500;

var width = $("#map").width();
var height =$("#map").width() / 2;

var projection = d3.geo.equirectangular()
    .scale(153)
	.translate([width / 2, height / 2])
    .precision(.1);
	
var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", redraw); 

var tooltip = d3.select("#map").append("div")
    .attr("class", "tooltip hidden");
	
var  map = d3.select("#map");
var svg = map.append("svg")
    .attr("width", width)
    .attr("height", height)
	.attr("class","grabbable")
    .call(zoom)
    .append("g");




function deselectAllCountry(){
		countriesToFilter = [];
		renderMap();
		$(".resetMap").hide();
}

function resetMap(){
	
	countriesToFilter = [];
	newChart.filterAll();
	newChart.isSubset(false);
	// newChart.resetGrid();
	newChart.reDrawGrid(map_countries);
	
	allSectorChart.redraw();
	renderMap();
	$(".resetMap").hide();
	$(".resetGrid").hide();
	updateFilterCounts(all.value());
}

function addToFilters(c){
	if(!newChart.hasFilter(c+c)){
		newChart.filter(c+c);
	}
	buildFlowsFilters(c);
	countriesToFilter.push(c);
	newChart.isSubset(true);
	
	newChart.reDrawGrid(countriesToFilter);
	// newChart.fadeDeselectedArea();
	
	//     newChart.selectAll("g." + newChart.BUBBLE_NODE_CLASS).each(function (d) {
	// 	var id_col = d3.select(this).data()[0].x;
	// 	var col = d3.select(".column"+id_col).node(); 
	// 	var id_row = d3.select(this).data()[0].y;
	// 	var row = d3.select(".row"+id_row).node();
	// 	newChart.resetHighlight(col);
	// 	newChart.resetHighlight(row);
	// 	newChart.resetHighlight(this);
	// })
		
	// var cols = $(".gridColumn").find('line'); 
	// cols.each(function(col){
	// 	newChart.resetHighlight(col);
	// })
	// console.log(cols);

	// _chart.resetHighlight(col);
	// newChart.filterAll();
}

function removeFromFilters(c){

	var index = countriesToFilter.indexOf(c);
	if (index > -1) {
	    countriesToFilter.splice(index, 1);
		if(newChart.hasFilter(c+c)){
			newChart.filter(c+c);
		}
	}
	if(countriesToFilter.length > 0){
		buildFlowsFilters(c);
		newChart.reDrawGrid(countriesToFilter);
		// newChart.filterAll();
	}else{
		newChart.isSubset(false);
		resetMap();
	}

}

function buildFlowsFilters(c){
	
	
	for (var i = 0; i < countriesToFilter.length; i++) {
		newChart.filter(countriesToFilter[i]+c)
		newChart.filter(c+countriesToFilter[i])
	}
	allSectorChart.redraw();
	updateFilterCounts(all.value());
}

function redraw() {
    svg.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
}

function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            redraw();
        };
    });
}

function zoomClick() {

    var clicked = d3.event.target,
        direction = 1,
        factor = 1,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};

    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() + (factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }
	
    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
	
}

d3.selectAll('.button').on('click', zoomClick);

queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.tsv, "data/world-country-names.tsv")
    .await(ready);

function renderMap(){
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
        .attr("d", path)
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
  		tooltip.classed("hidden", true)
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
  	    			addToFilters(d.name);
  	    		  }else{
  	    			  d3.select(this).classed('selected',true);
  	    			  el.style('fill','#D0D0D0');
  	    			  removeFromFilters(d.name);
  	    		  }
  	  		
  	  }
  	})
      .on("mousemove", function(d,i) {
        var mouse = d3.mouse(map.node()).map( function(d) { return parseInt(d); } );
		// console.log(mouse);
		var offset = $("#map").offset();
		offset.top = offset.top - 50;
        tooltip
          .classed("hidden", false)
          // .attr("style", "left:"+(mouse[0] + 100)+"px;top:"+(mouse[1] + 500)+"px")
  		  .attr("style", "left:"+(mouse[0] + offset.left)+"px;top:"+(mouse[1]+offset.top)+"px")
          .html(d.name)
      })
  	  ;
}

function ready(error, world, names) {

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

country = svg.selectAll(".country").data(countries);
renderMap();
  
}
