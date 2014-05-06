var GDM_GRID_VIEWER = GDM_GRID_VIEWER || {};

GDM_GRID_VIEWER.Data = (function(my){
    'use strict';
    // [ private properties ]
    var server_address = "http://localhost:5000",
        _flows = [], // Flow data from the server JSON
        _flow_deltas = [], // Changes since last time (or 0)
        _countries = [], // list of countries from the server JSON
        _country_names = [],
        _country_ids = [],
        _sectors = [], // list of sectors from the server JSON
        _sectors_by_id = {},
        _flows_xfilter = {}, // crossfilter
        _filtered_records = {}; // ndx.groupAll()

    // [ private methods ]
    var _get_data = function() {
        d3.json(server_address + '/get_flows', _json_response);
    };

    var _delta_json = function(x, y) {
        // Return a JSON object identical in structure to
        // x but delta'ed with the elements of y
        // if no y is given, the resulting JSON will have all zeros
        // in its numerical values
        var z = {}; // the return object
        if (typeof(x) === "object") {
            Object.keys(x).forEach(function(key) {
                // call this function recursively until x is
                // just a property and not an object itself
                z[key] = _delta_json(x[key], (y ? y[key] : undefined));
            });
        }
        else{
            // This is where the recursion 'bottoms out'
            if (typeof(x) === "number") {
                // if x is a number
                if (typeof(y) === "undefined") {
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
        return z;
    };

    var _json_response = function(error, json) {
        _flow_deltas = _delta_json(json.flows, _flows);
        _flows = json.flows;
        _countries = json.countries;
        _country_names = _countries.map(function(c) { return c.name; });
        _country_ids = _countries.map(function(c) { return c.id; });
        _sectors = json.sectors;
        _sectors.forEach(function(s) { _sectors_by_id[s.id] = s.name; });
        _flows_xfilter = crossfilter(_flows);
        _filtered_records = _flows_xfilter.groupAll();
        GDM_GRID_VIEWER.UI.init();
        GDM_GRID_VIEWER.Graphs.init();
        GDM_GRID_VIEWER.Map.init();
    }

    // [ public methods ]
    my.get_data = _get_data;
    my.filtered_records = function() { return _filtered_records; };
    my.filtered_count = function() { return _filtered_records.value(); };
    my.flows_xfilter = function() { return _flows_xfilter; };
    my.countries = function() { return _countries; };
    my.country_names = function() { return _country_names; };
    my.country_ids = function() { return _country_ids; };
    my.sectors = function() { return _sectors; };
    my.sectors_by_id = function() { return _sectors_by_id; };

    return my;
}(GDM_GRID_VIEWER.Data || {}));
