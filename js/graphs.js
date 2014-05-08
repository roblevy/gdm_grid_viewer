var GDM_GRID_VIEWER = GDM_GRID_VIEWER || {};

GDM_GRID_VIEWER.Graphs = (function(my){
    'use strict';
    // [ private properties ]
    var _data = GDM_GRID_VIEWER.Data,
        _ui = GDM_GRID_VIEWER.UI,
        _dimensions = {},
        _key_separator = "|",
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
        _add_event_handlers();
    };

    var _show = function() {
		// TODO: This is a silly place to put this dataCount bit
        dc.dataCount(".dc-data-count")
              .dimension(_xfilter)
              .group(_groupAll);
		dc.renderAll();
    }
	
    var _add_event_handlers = function() {
        d3.selectAll(".bubble")
        .on("click", function(data, index) {
            //handle right click
            var i, from_to,
                sector_filters = _charts.sector_chart.filters();
            if (sector_filters.length) {
                _ui.log("Killing flow in sector " + sector_filters);
                for (i = 0; i < sector_filters.length; i += 1) {
                    from_to = _split_key(data.key);
                    _kill_flow(from_to[0], from_to[1], sector_filters[i]);
                }
            } else {
                _ui.log("Pick a sector to kill first");
            }
            //prevent showing of browser menu
            d3.event.preventDefault();
        });
    }
    
	var _refresh_data = function(data) {
		var i, j,
			chart, oldFilters,
			allCharts = dc.chartRegistry.list();

		_xfilter = _xfilter_reset(_xfilter, _dimensions, data);		
		
		// Reset all filters using dc.js
		for (i = 0; i < allCharts.length; i++) {
			chart = allCharts[i];
			oldFilters = chart.filters(); // Get current filters
			chart.filter(null); // Reset all filters on current chart
			for (j = 0; j < oldFilters.length; j++) {
				// Set all the oldFilters back onto the chart
				chart.filter(oldFilters[j]);
			}
		}
		dc.redrawAll();
	}

	// Unfilters all the given dimensions, removes all data
	// from xf and adds newData to xf.
	var _xfilter_reset = function(xf, dimensions, newData) {
		var i,
            dims = Object.getOwnPropertyNames(dimensions);
		for (i = 0; i < dims.length; i++) {
			// Clear all filters from this dimension.
			// Necessary because xf.remove only removes records
			// matching the current filter.
			dimensions[dims[i]].filter(null);
		}
		xf.remove(); // Remove all data from the crossfilter
		xf.add(newData);
		return xf;
	}
	
	var _xfilter_init = function(data) {
		_xfilter = crossfilter(data);
		_groupAll = _xfilter.groupAll();
        _dimensions = {
            bilateral: _xfilter.dimension(function(d){
                return _join_key(d.from, d.to);
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
	
    var _split_key = function(key) {
        return key.split(_key_separator);
    }
    
    var _join_key = function(x, y) {
        return x + _key_separator + y;
    }
    
    var _initialise_bilateral_chart = function(dom_anchor_name) {
		var chart = _charts.bilateral_chart || dc.SortableBubbleGrid(dom_anchor_name);
        chart
            .width(_ui.dom_bilateral_chart().parent().width())
            .height(_ui.dom_bilateral_chart().parent().width())
            .group(_groups.bilateral)
            .dimension(_dimensions.bilateral)
            .nodeNames(_data.country_names())
            // .maxBubbleRelativeSize(0.3)
            .keyAccessor(function (p) { //x
                // TODO: This needs refactoring / completely changing!
                var from_id = +_split_key(p.key)[0]; // Cast string as number
                return _data.country_ids().indexOf(from_id);
            })
            .valueAccessor(function (p) { //y
                // TODO: This needs refactoring / completely changing!
                var to_id = +_split_key(p.key)[1]; // Cast string as number
                return _data.country_ids().indexOf(to_id);
            })
            .radiusValueAccessor(function (p) { //radius
                return p.value;
            })
            .margins({top: 92, right:40, bottom: 40, left: 92});
		return chart;
    }

    function _kill_flow(from, to, sector) {
        var post_data = {from:from, to:to, sector:sector};
        d3.xhr(_data.server_address + '/kill_trade_route')
            .header("Content-Type", "application/json")
            .post(JSON.stringify(post_data), function(error, data) {
                showServerResponse(data);
                _data.refresh(); // Get new data from the server
            });
    }

    function showServerResponse(data) {
        _ui.log(data.response);
    }

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
            .width(_ui.dom_sector_chart().parent().width())
            .height(1000)
            .group(_groups.sector)
            .dimension(_dimensions.sector)
            .label(function(d) {
                return _data.sectors_by_id()[d.key];
            })
            .colors(rowChartColors)
            .on("filtered",function(chart,filter){
                if(chart.hasFilter()){
                    _ui.dom_reset_sectors().show();
                }else{
                    _ui.dom_reset_sectors().hide();
                }
            })
        .elasticX(true)
            .xAxis()
            .ticks(4);
		return chart;
    }

    // [ public methods ]
    my.init = _init;
	my.refresh = function(data) { return _refresh_data(data) };
    my.show = _show;
    my.charts = function() { return _charts; };
    my.update_filtered_count = function() { return update_filtered_count; };

    return my;
}(GDM_GRID_VIEWER.Graphs || {}));

