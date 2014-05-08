var GDM_GRID_VIEWER = GDM_GRID_VIEWER || {};

GDM_GRID_VIEWER.Data = (function(my){
    'use strict';
    // [ private properties ]
    var _server_address = "http://localhost:5000",
        _flows = [], // Flow data from the server JSON
        _flow_deltas = [], // Changes since last time (or 0)
		_show_deltas = false, // Toggle to show deltas
        _countries = [], // list of countries from the server JSON
        _country_names = [],
        _country_ids = [],
        _sectors = [], // list of sectors from the server JSON
        _sectors_by_id = {},
        _flows_xfilter = {}, // crossfilter
        _flows_groupAll = {}; // ndx.groupAll()

    // [ private methods ]
    var _get_data = function(callback) {
        d3.json(_server_address + '/get_flows', callback);
    };

    var _delta_json = function(x, y, matchOn) {
        // Return a JSON object identical in structure to
        // x but delta'ed with the elements of y
        // if no y is given, the resulting JSON will have all zeros
        // in its numerical values
        var z = {}, // the return object
		    delta;
        if (typeof(x) === "object") {
            Object.keys(x).forEach(function(key) {
                // call this function recursively until x is
                // just a property and not an object itself
				delta = _delta_json(x[key], (y ? y[key] : undefined), matchOn);
				if (key === matchOn && typeof(delta) !== "number") {
					z[key] = delta;
				} else {
					z[key] = x[key];
				}
            });
        }
        else{
            // This is where the recursion 'bottoms out'
            if (typeof(x) === "number") {
                // if x is a number
                if (typeof(y) !== "undefined") {
                    // if y is present
                    return x - y;
                }
                else {
                    // if y is absent
                    return 0;
                }
            }
            else{
                // if x isn't a number
                return x;
            }
        }
        // the recursion has come all the way back.
        return z; // Convert object to array
    };

    var _init_json_response = function(error, json) {
        _flows = _get_flows_from_json(json);
		_countries = json.countries;
        _country_names = _countries.map(function(c) { return c.name; });
        _country_ids = _countries.map(function(c) { return c.id; });
        _sectors = json.sectors;
        _sectors.forEach(function(s) { _sectors_by_id[s.id] = s.name; });
        //_flows_xfilter = crossfilter(_flows);
        //_flows_groupAll = _flows_xfilter.groupAll();
        GDM_GRID_VIEWER.UI.init();
        GDM_GRID_VIEWER.Graphs.init(_flows);
        GDM_GRID_VIEWER.Map.init();
    }
	
	var _refresh_json_response = function(error, json) {
        //_flows = _delta_json(_get_flows_from_json(json), _flows, "value");
        //_flows = Array.prototype.slice.call(_flows); // TODO: Convert to array!!!
        //GDM_GRID_VIEWER.Graphs.refresh(_flows);
        GDM_GRID_VIEWER.Graphs.refresh(_get_flows_from_json(json));
	}

	var _get_flows_from_json = function(json) {
		return json.flows;
	}
	
    // [ public methods ]
    my.init = function() { return _get_data(_init_json_response); };
	my.refresh = function() { return _get_data(_refresh_json_response); };
    my.flows_xfilter = function() { return _flows_xfilter; };
    my.flows_groupAll = function() { return _flows_groupAll; };
    my.flows_groupAll_count = function() { return _flows_groupAll.value(); };
    my.countries = function() { return _countries; };
    my.country_names = function() { return _country_names; };
    my.country_ids = function() { return _country_ids; };
    my.sectors = function() { return _sectors; };
    my.sectors_by_id = function() { return _sectors_by_id; };
    my.server_address = _server_address;
    
    return my;
}(GDM_GRID_VIEWER.Data || {}));
