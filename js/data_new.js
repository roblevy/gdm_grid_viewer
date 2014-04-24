var GDM_GRID_VIEWER = (function(module){
    'use strict';
    var self = module.Data = module.Data || function() {
        // [ private properties ]
        var server_address = "http://localhost:5000",
            flows = [], // Flow data from the server JSON
            countries = [], // list of countries from the server JSON
            country_names = [],
            country_ids = [],
            sectors = [], // list of sectors from the server JSON
            sectors_by_id = {},
            flows_xfilter = {}, // crossfilter
            filtered_records = {} // ndx.groupAll()
        ;

        // [ private methods ]
        var get_data = function() {
            d3.json(server_address + '/get_flows', json_response);
        };
        
        var json_response = function(error, json) {
            self.flows = json.flows;
            self.countries = json.countries;
            self.country_names = self.countries.map(function(c) { return c.name; });
            self.country_ids = self.countries.map(function(c) { return c.id; });
            self.sectors = json.sectors;
            self.sectors.forEach(function(s) { self.sectors_by_id[s.id] = s.name; });
            self.flows_xfilter = crossfilter(self.flows);
            self.filtered_records = self.flows_xfilter.groupAll();
            GDM_GRID_VIEWER.UI.init();
            GDM_GRID_VIEWER.Graphs.init();
            GDM_GRID_VIEWER.Graphs.show();        
        }

        // [ public methods ]
        return {
            get_data: get_data,
            filtered_records: filtered_records,
            filtered_count: function() {
                return this.filtered_records.value();
            },
            flows_xfilter: flows_xfilter,
            countries: countries,
            country_names: country_names,
            country_ids: country_ids,
            sectors: sectors,
            sectors_by_id: sectors_by_id,
        };      
    }
}(MODULE || {}));
