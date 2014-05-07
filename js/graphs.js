var GDM_GRID_VIEWER = GDM_GRID_VIEWER || {};

GDM_GRID_VIEWER.Graphs = (function(my){
    'use strict';
    // [ private properties ]
    var _data = GDM_GRID_VIEWER.Data,
        ui = GDM_GRID_VIEWER.UI,
        _dimensions = {},
        _groups = {},
		_xfilter, _groupAll,
        _charts = {};

    // [ private methods ]
    var _init = function(data) {
		_xfilter_init(data);
        // dc.SortableBubbleGrid is defined in
        // js/graph/newDCgridChart.js. The following line places an empty
		// SortableBubbleGrid in the DOM element specified.
        _charts.bilateral_chart = _initialise_bilateral_chart("#bilateralChart");
        // dc.rowChart is a standard method of dc.js
        _charts.sector_chart = initialise_sector_chart("#allSectorChart");
		// Add a data count widget
		dc.dataCount("#data-count").dimension(_xfilter).group(_groupAll);
		_show();
    };

    var _show = function() {
		// TODO: This is a silly place to put this dataCount bit
        dc.dataCount(".dc-data-count")
              .dimension(_xfilter)
              .group(_groupAll);
		dc.renderAll();
    }
	
	var _refresh = function(data) {
		var i, j,
			chart, filters, filter,
			allCharts = dc.chartRegistry.list();

		_xfilter_init(data);
		_charts.bilateral_chart
			.group(_groups.bilateral)
			.dimension(_dimensions.bilateral);
		_charts.sector_chart
			.group(_groups.sector)
			.dimension(_dimensions.sector);
		
		// Reset all filters
		for (i = 0; i < allCharts.length; i++) {
			chart = allCharts[i];
			filters = chart.filters();
			chart.filter(null); // Reset all filters on current chart
			for (j = 0; j < filters.length; j++) {
				filter = filters[j];
				chart.filter(filter);
			}
		}
		dc.redrawAll();
	}

	var _xfilter_init = function(data) {
		_xfilter = crossfilter(data);
		_groupAll = _xfilter.groupAll();
        _dimensions = {
            bilateral: _xfilter.dimension(function(d){
                return d.from + '|' + d.to;
            }),
            sector: _xfilter.dimension(function(d){
                return d.sector;
            })
        };

        _groups = {
            bilateral: _dimensions.bilateral.group()
                .reduceSum(function(d) {
                    return d.value;
                }),
            sector: _dimensions.sector.group()
                .reduceSum(function(d) {
                    return d.value;
                })
            };
	}
	
    var _initialise_bilateral_chart = function(dom_anchor_name) {
		var chart = _charts.bilateral_chart || dc.SortableBubbleGrid(dom_anchor_name);
        chart
            .width(ui.dom_bilateral_chart().parent().width())
            .height(ui.dom_bilateral_chart().parent().width())
            .group(_groups.bilateral)
            .dimension(_dimensions.bilateral)
            .nodeNames(_data.country_names())
            // .maxBubbleRelativeSize(0.3)
            .keyAccessor(function (p) { //x
                // TODO: This needs refactoring / completely changing!
                var from_id = +p.key.split("|")[0]; // Cast string as number
                return _data.country_ids().indexOf(from_id);
            })
            .valueAccessor(function (p) { //y
                // TODO: This needs refactoring / completely changing!
                var to_id = +p.key.split("|")[1]; // Cast string as number
                return _data.country_ids().indexOf(to_id);
            })
            .radiusValueAccessor(function (p) { //radius
                return p.value;
            })
            .margins({top: 92, right:40, bottom: 40, left: 92});
		return chart;
    }

//    Update the filtered record count UI element
    // var update_filtered_count = function() {
        // var filter_text = _data.filtered_records().value();
        // ui.dom_filtered_count().text(filter_text);
    // }

    // The sector_chart is the one down the side
    var initialise_sector_chart = function(dom_anchor_name) {
        var chart = dc.rowChart(dom_anchor_name);
		var i = 0;
        // Colours
        var rowChartColorsScale = d3.scale.linear()
            .domain([1,_data.sectors().length])
            .range(["hsl(275, 100%, 75%, 0.72)",
                    "hsl(228, 30%, 40%, 0.81)"]);
        var rowChartColors = [];
        for (i = 0; i < _data.sectors().length; i++) {
            rowChartColors.push(rowChartColorsScale(i));
        }

        chart
            .width(ui.dom_sector_chart().parent().width())
            .height(1000)
            .group(_groups.sector)
            .dimension(_dimensions.sector)
            .label(function(d) {
                return _data.sectors_by_id()[d.key];
            })
            .colors(rowChartColors)
            .on("filtered",function(chart,filter){
                if(chart.hasFilter()){
                    ui.dom_reset_sectors().show();
                }else{
                    ui.dom_reset_sectors().hide();
                }
            })
        .elasticX(true)
            .xAxis()
            .ticks(4);
		return chart;
    }

    // [ public methods ]
    my.init = _init;
	my.refresh = function(data) { return _refresh(data) };
    my.show = _show;
    my.charts = function() { return _charts; };
    my.update_filtered_count = function() { return update_filtered_count; };

    return my;
}(GDM_GRID_VIEWER.Graphs || {}));

