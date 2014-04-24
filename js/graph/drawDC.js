

makePlot();


function makePlot(){



	
	
	//define group for bubble-chart for all countries





	///////////////	COUNTRIES DIM AND GROUP	////////////////////////////
	//define dimension for bubble-chart for all countries
	var gridDim = ndx.dimension(function (d) {
	        return d.aij;
	     });
	 


	var gridGroup = gridDim.group()
		.reduce(
			function(p,v){ //add
				++p.count;			
				p.value += v.value;
				p.indexFrom = v.indexFrom;
				p.indexTo = v.indexTo;	 
				return p;
			},
			function(p,v){ //remove
				--p.count;
				p.value -= v.value;
				p.indexFrom = v.indexFrom;
				p.indexTo = v.indexTo;
				return p;
			},
			function(){ // inti
				return {count:0,value:0,indexFrom:null,indexTo:null};
			}
		);


	///////////////////////	SECTOR DIM AND GROUP	//////////////////
						//define dimension for row-chart for all sectors
	var allSectorDim = ndx.dimension(function (d) {
		return d.sector;
	});
						//define group for row-chart for all sectors
	var allSectorGroup = allSectorDim.group()
	.reduceSum(function(d){
		return d.value;
	});


	////////////////////////////	CHARTS	///////////////////////////////////

	/////////	GRID
	
	
	newChart
		.width($("#newChart").parent().width())
		.height($("#newChart").parent().width())
	    .group(gridGroup)
	    .dimension(gridDim)
		.nodeNames(countries)
	   // .maxBubbleRelativeSize(0.3)
	 	.keyAccessor(function (p) { //x
	 	    return p.value.indexFrom;
	 	  })
		  .valueAccessor(function (p) { //y
	 	      return p.value.indexTo;
	 	  })
	   	  .radiusValueAccessor(function (p) { //radius
	   	     return p.value.value;
	   	   })
		  .margins({top: 92, right:40, bottom: 40, left: 92});
		  // .margins({top: 92, right:0, bottom: 0, left: 92})
		  ;


	/////////	ROW CHART
	
	
	var rowChartColorsScale = d3.scale.linear().domain([1,allData.sectors.length]).range(["hsl(275, 100%, 75%, 0.72)", "hsl(228, 30%, 40%, 0.81)"]);//228,30%,20%
	var rowChartColors = [];
	for (var i = 0; i < allData.sectors.length; i++) {
		rowChartColors.push(rowChartColorsScale(i));
	}
	
	allSectorChart
		.width($("#allSectorChart").parent().width())
		.height(1000)
		.group(allSectorGroup)
		.dimension(allSectorDim)
		.colors(rowChartColors)
		.on("filtered",function(chart,filter){
			if(chart.hasFilter()){
				$(".resetSectors").show();
			}else{
				$(".resetSectors").hide();
			}
			updateFilterCounts(all.value());
		})
		.elasticX(true)
		.xAxis()
		.ticks(4)
		
		;

	////////////////////////	ALL DATA COUNTS	///////////////////////
	//all data count
	dc.dataCount(".dc-data-count")
		.dimension(ndx)
		.group(all);

	dc.renderAll();
}
