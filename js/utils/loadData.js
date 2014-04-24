// The SVG container
var allData = getFakeResults();
$(".button").button();

var data = allData.results;
var countries = allData.countries;
var crossfilter = crossfilter(data);
var all = crossfilter.groupAll();


function updateFilterCounts(v){
	$("#filters").text(v);
}
$("#filters").append(all.value());
$("#totalFlows").append(crossfilter.size());

// dc.SortableBubbleGrid is defined in
// js/graph/newDCgridChart.js
var newChart = dc.SortableBubbleGrid("#newChart");
// dc.rowChart is a standard method of dc.js
var allSectorChart = dc.rowChart("#allSectorChart");



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
	newChart.resetGrid();
});

$(".resetSectors").hide();
$(".resetSectors").click(function(){
	allSectorChart.filterAll();
	dc.redrawAll();
});


var map_countries = allData.countries.slice(0);
var countriesToFilter = [];


$('#scenarios').on("change",function(){
	var scenario = $(this).find("option:selected").val();
	if(scenario == "guns_roses"){
		
	}else if(scenario == "random"){
		allData = getFakeResults();
		
		
		
		$("#newChart").empty();
		$("#allSectorChart").empty();
		
		newChart = dc.SortableBubbleGrid("#newChart");
		allSectorChart = dc.rowChart("#allSectorChart");
		makePlot(allData);
		
		
		deselectAllCountry();

		
		$(".resetGrid").hide();
		$(".reset").hide();
	}
});


$('#expand-map').click(function(){
    $('#content-map').slideToggle('slow');

	$(this).toggleClass("ui-icon-circle-minus ui-icon-circle-plus");
});
$('#expand-flows').click(function(){
    $('#content-flows').slideToggle('slow');

	$(this).toggleClass("ui-icon-circle-minus ui-icon-circle-plus");
});
$('#expand-sectors').click(function(){
    $('#content-sectors').slideToggle('slow');

	$(this).toggleClass("ui-icon-circle-minus ui-icon-circle-plus");
});
$('#expand-scenarios').click(function(){
    $('#content-scenarios').slideToggle('slow');

	$(this).toggleClass("ui-icon-circle-minus ui-icon-circle-plus");
});
