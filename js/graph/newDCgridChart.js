dc.SortableBubbleGrid = function(parent, chartGroup){
	// var _chart = dc.marginable(dc.baseChart({}));
	var _chart = dc.marginable(dc.baseChart({}));
    var _parent;
    var _g;
    var _chartBodyG;
	var _nodeNames;
	var _allNodes;
	var _nodes;
	var _n;
	var _orders;
	var _x, _y, _z, _c;
	var _domain;
	var _countriesToShow;
	var _minRadius = 0.0;
	var _isSubset = false;
	var _subsetFilters = [];
	var _subsetEntryFilters = [];
	
    _chart.resetGrid = function () {

		if(!_chart.isSubset()){
	        _chart.filterAll();

			dc.redrawAll(_chart.chartGroup())
		}else{
			
			_chart.filterAll();
			_subsetFilters = [];
			
			for (var i = 0; i < _chart.subsetEntryFilters().length; i++) {
				_chart.filter(_chart.subsetEntryFilters()[i]);
			}
			_subsetEntryFilters = [];
			dc.redrawAll(_chart.chartGroup());
		}
		
		$(".resetGrid").hide();

    };
	
    _chart.BUBBLE_NODE_CLASS = "node";
	
    _chart.BUBBLE_CLASS = "bubble";
	
    _chart._generateG = function (parent) {
        if (parent === undefined){
        	_chart.resetSvg();
			_parent = _chart.svg();
        }
        else
            _parent = parent;

        _g = _parent.append("g");
        _chartBodyG = _g.append("g").attr("class", "chart-body")
            .attr("transform", "translate(" + _chart.margins().left + ", " + _chart.margins().top + ")")
            .attr("clip-path", "url(#" + getClipPathId() + ")");

        return _g;
    };
	
    _chart.chartBodyG = function (_) {
        if (!arguments.length) return _chartBodyG;
        _chartBodyG = _;
        return _chart;
    };
	
    _chart.nodeNames = function (n) {
		
        if (!arguments.length) return _nodeNames;
        _nodeNames = n;
		
        return _chart;
    };
	
    _chart.subsetFilters = function (n) {
		
        if (!arguments.length) return _subsetFilters;
        _subsetFilters = n;
		
        return _chart;
    };
	
    _chart.subsetEntryFilters = function (n) {
		
        if (!arguments.length) return _subsetEntryFilters;
		// console.log(n);
        _subsetEntryFilters = $.extend(true, [], n);
		
        return _chart;
    };
	
    _chart.isSubset = function (n) {
		
        if (!arguments.length) return _isSubset;
        _isSubset = n;
		
        return _chart;
    };
	
    _chart.setCountriesToShow = function (n) {
		
        if (!arguments.length) return _countriesToShows;
        _countriesToShow = n;
		
        return _chart;
    };
	
    var _rValueAccessor = function (d) {
        return Math.sqrt(d.r);
    };
	
    _chart.radiusValueAccessor = function (_) {
        if (!arguments.length) return _rValueAccessor;
        _rValueAccessor = _;
        return _chart;
    };
	
    function getClipPathId() {
        return _chart.anchorName() + "-clip";
    }
	
	function initNodes(){
		_nodes = _countriesToShow.map(function(d,i){return {name:d,index:i};});
		_n = _nodes.length;
	}
	
	function initAllNodes(){
		_allNodes = _chart.nodeNames().map(function(d,i){return {name:d,index:i};});
		_nodes = _allNodes;
		_n = _nodes.length;
	}
	
	function initOrders(){

			_orders = {
				name: d3.range(_n).sort(function(a, b) { return d3.ascending(_nodes[a].name, _nodes[b].name); }),
				internal: d3.range(_n).sort(function(a, b) { return _nodes[b].internal - _nodes[a].internal; }),
				inwards: d3.range(_n).sort(function(a, b) { return _nodes[b].inwards - _nodes[a].inwards; }),
				outwards: d3.range(_n).sort(function(a, b) { return _nodes[b].outwards - _nodes[a].outwards; })
				// group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
			};
	}
	
	function initAxis(){
	 
		_x = d3.scale.ordinal().rangeBands([0, _chart.effectiveWidth() ]);
		_y = d3.scale.ordinal().rangeBands([0, _chart.effectiveWidth() ]);
	 	_x.domain(_orders.name);
	 	_y.domain(_orders.name);
		
		
	}
	
	function initScales(){
		
		var maxRadius = d3.min([_x.rangeBand()/2,_y.rangeBand()/2])

		// var tempLog = d3.scale.log().base(2);
		var tempLog = d3.scale.pow(0.001);
		var tempDomain = [tempLog(_domain[0]), tempLog(_domain[1])];

		var tempS = d3.scale.sqrt().domain(tempDomain).range([maxRadius*_minRadius,maxRadius]).clamp(true)
		var tempC = d3.scale.sqrt().domain(tempDomain).range(["hsl(298, 100%, 94%, 0.77)", "hsl(228, 30%, 14%, 1)"]).clamp(true)
		
		_z = function(v){
			return tempS(tempLog(v));
		}
		_c = function(v){
			return tempC(tempLog(v));
		}

	}
	
	function initMargins(){
		var minRange = d3.min([_x.rangeBand()/2,_y.rangeBand()/2])
		_chartBodyG.attr("transform", "translate(" 
								// + (_chart.margins().left + _x.rangeBand()/2) 
// 								+ ", " 
// 								+ (_chart.margins().top + _y.rangeBand()/2) + ")");
								+ (_chart.margins().left) 
								+ ", " 
								+ (_chart.margins().top) + ")");
	}
	
	_chart.reDrawGrid = function(f){

		
		
		var tempCountriesToShow = []
		
		// reorder
		for (var i = 0; i < _allNodes.length; i++) {
			var node = _allNodes[i];
			if(f.indexOf(node.name) != -1){
				tempCountriesToShow.push(node.name);
			}else{
				
			}
		}
		
		_chart.setCountriesToShow(tempCountriesToShow);
		
		 _chart._generateG();
	 
		initNodes();
		
		var matrix = buildMatrix(_chart.data());
		
		initAxis();
		
		initScales();
		 
		 initMargins(); 
		 	
		 var bubbleGColumns = _chart.chartBodyG().selectAll(".gridColumn")
		 			.data(matrix);
		 					
		 renderColumns(bubbleGColumns);
		 
		 var bubbleGRows = _chart.chartBodyG().selectAll(".gridRow")
		 			.data(matrix);
		 					
		 renderRows(bubbleGRows);
		 
	 	if(f.length > 0){
	 		$('.resetMap').show();
	 	}else{
	 		$('.resetMap').hide();
	 	}
		// refreshOverallFlowText(matrix);
		
		// setTimeout(function(){
			var orderValue = d3.select("#order").node().value;
			order(orderValue);
		// },1000);
		
    	return _chart;
	}
	
    _chart.doRedraw = function () {
		
		var matrix = buildMatrix(_chart.data());
		
		initScales();
		
		refreshNodes(matrix);
		
		// _chart.fadeDeselectedArea();

		if(!_chart.isSubset()){
			_chart.fadeDeselectedArea();
		}else{
			_chart.fadeDeselectedAreaSubset();
		}
		
		refreshOverallFlowText(matrix);
		
		// setTimeout(function(){
			var orderValue = d3.select("#order").node().value;
			order(orderValue);
		// },1000);
		
    	return _chart;
    };
		
	_chart.doRender = function() {
		if($('#order').length == 0){
			$(_chart.anchor()).append(
					"<span style=\"font-size:16px;\">Sort flows &nbsp;</span>"
					+"<select id=\"order\">"
					+"	<option value=\"name\">by Name</option>"
					+"	<option value=\"inwards\">by incoming flow</option>"
					+"	<option value=\"outwards\">by outgoing flow</option>"
					+"	<option value=\"internal\">by internal flow</option>"
					+"</select>"
					+"<div class=\"clearfix\"></div>"
				);
		}
		
		
		// initNodes();
		
		initAllNodes();
		
		var matrix = buildMatrix(_chart.data());
		
		initAxis();
		
		initScales();
		
		 _chart._generateG();
		 
		 initMargins(); 
		 	
		 var bubbleGColumns = _chart.chartBodyG().selectAll(".gridColumn")
		 			.data(matrix);
		 					
		 renderColumns(bubbleGColumns);
		 
		 var bubbleGRows = _chart.chartBodyG().selectAll(".gridRow")
		 			.data(matrix);
		 					
		 renderRows(bubbleGRows);
		 
		 // refreshOverallFlowText(matrix);
			
		 return _chart;
	};

	 _chart.fadeDeselectedAreaSubset=function(){
         if (_chart.subsetFilters().length > 0 && _chart.isSubset()) {

             _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function (d) {
 				var id_col = d3.select(this).data()[0].x;
 				var col = d3.select(".column"+id_col).node(); 
 				var id_row = d3.select(this).data()[0].y;
 				var row = d3.select(".row"+id_row).node();
				
                 if (_chart.isSelectedSubsetNode(d)) {
 					_chart.highlightSelected(row);
 					_chart.highlightSelected(col);
                     _chart.highlightSelected(this);
                 } else {

 					var resetCol = true;
 					var allBubblesOnCol = d3.selectAll("circle._"+id_col).each(function(d){
 						var isSel = _chart.isSelectedNode(d);
 						if(isSel){
 							resetCol = false;
 						}
 					});
 					if(resetCol){
 						_chart.resetHighlight(col);
 					}
					
 					var resetRow = true;
 					var thisRow =d3.select(d3.select(this).node().parentNode);
 					var allBubbles = thisRow.selectAll("circle");
 					allBubbles.each(function(d){
 						var isSel = _chart.isSelectedNode(d);
 						if(isSel){
 							resetRow = false;
 						}
 					});
 					if(resetRow){
 						_chart.resetHighlight(row);
 					}
					
                     _chart.fadeDeselected(this);
					
					
                 }
             });
         } else {
             _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function (d) {
 				var id_col = d3.select(this).data()[0].x;
 				var col = d3.select(".column"+id_col).node(); 

 				var id_row = d3.select(this).data()[0].y;
 				var row = d3.select(".row"+id_row).node();
				
 				_chart.resetHighlight(row);
 				_chart.resetHighlight(col);
                 _chart.resetHighlight(this);
             });
         }
	 }
	 
    _chart.fadeDeselectedArea = function () {
        if (_chart.hasFilter()) {

            _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function (d) {
				var id_col = d3.select(this).data()[0].x;
				var col = d3.select(".column"+id_col).node(); 
				var id_row = d3.select(this).data()[0].y;
				var row = d3.select(".row"+id_row).node();
				
                if (_chart.isSelectedNode(d)) {
					_chart.highlightSelected(row);
					_chart.highlightSelected(col);
                    _chart.highlightSelected(this);
                } else {

					var resetCol = true;
					var allBubblesOnCol = d3.selectAll("circle._"+id_col).each(function(d){
						var isSel = _chart.isSelectedNode(d);
						if(isSel){
							resetCol = false;
						}
					});
					if(resetCol){
						_chart.resetHighlight(col);
					}
					
					var resetRow = true;
					var thisRow =d3.select(d3.select(this).node().parentNode);
					var allBubbles = thisRow.selectAll("circle");
					allBubbles.each(function(d){
						var isSel = _chart.isSelectedNode(d);
						if(isSel){
							resetRow = false;
						}
					});
					if(resetRow){
						_chart.resetHighlight(row);
					}
					
                    _chart.fadeDeselected(this);
					
					
                }
            });
        } else {
            _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function (d) {
				var id_col = d3.select(this).data()[0].x;
				var col = d3.select(".column"+id_col).node(); 

				var id_row = d3.select(this).data()[0].y;
				var row = d3.select(".row"+id_row).node();
				
				_chart.resetHighlight(row);
				_chart.resetHighlight(col);
                _chart.resetHighlight(this);
            });
        }
    };

    _chart.isSelectedNode = function (d) {
        return _chart.hasFilter(d.key);
    };
	
    _chart.isSelectedSubsetNode = function (d) {
        return _chart.subsetFilters().indexOf(d.key) != -1;
    };
	
    _chart.onClick = function (d) {
        var filter = d.key;
        dc.events.trigger(function () {
            
			if(_chart.isSubset()){

				if(_chart.subsetFilters().length == 0){
					_chart.subsetEntryFilters(_chart.filters());
					_chart.filterAll();
					$(".resetGrid").show();
				}
				// _chart.filterAll();
				
				var index = _chart.subsetFilters().indexOf(filter);
				if( index == -1){
					_chart.subsetFilters().push(filter)
					if(!_chart.subsetFilters().length == 0){
						_chart.filter(filter);
					}
				}else{
					_chart.subsetFilters().splice(index,1);
					if(_chart.subsetFilters().length == 0){
						_chart.filterAll();
						for (var i = 0; i < _chart.subsetEntryFilters().length; i++) {
							_chart.filter(_chart.subsetEntryFilters()[i]);
						}
						_chart.subsetEntryFilters([]);
						$(".resetGrid").hide();
					}else{
						_chart.filter(filter);
					}
				}
			
				dc.redrawAll(_chart.chartGroup());
			
			}else{
				
				_chart.filter(filter);
				if(_chart.filters().length == 0){
					// TODO: Shouldn't be referencing DOM elements here!!!
					$(".resetGrid").hide();
				}else{
					$(".resetGrid").show();
				}
				dc.redrawAll(_chart.chartGroup());
			}
			
        });
    };
	
	_chart.makeRow = function(row){
		// console.log(row);
	
		//data join
		var cells = d3.select(this).selectAll("."+_chart.BUBBLE_NODE_CLASS).data(row);
		// console.log(cells);
	
		//enter
		var cellEnter = cells.enter().append("g").attr("class","node")
			.attr("transform", bubbleLocator)
			.append("circle")
			.attr("class", function(d, i) {
			                return _chart.BUBBLE_CLASS + " _" + i;
			            })
			.attr("r",1e-6)
			.attr("opacity", 1e-6)
			.attr("fill", function(d) {
		                return _c( d.z );
		            })
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", _chart.onClick);
			

		//update
		var cellUpdate = cells.selectAll("circle." + _chart.BUBBLE_CLASS)
			.transition()
			.duration(1000)
			.attr("r", function(d){
				return _z(d.z);
			})
			.attr("opacity", 1)
			;
			
			d3.select("#order").on("change", function() {
				order(this.value);
			});
	}
	
    var bubbleLocator = function(d) {
        // return "translate(" + _x(_chart.keyAccessor()(d)) + "," + _y(_chart.valueAccessor()(d)) + ")";
		return "translate(" + (_x(d.x)+ (_x.rangeBand()/2)) + "," + _y.rangeBand()/2 + ")";
    };
	
	function renderRows(bubbleG){
		// append rows

		var row = bubbleG
			.enter()
			.append("g")
			.attr("class", "gridRow")
			.attr("transform", function(d, i) { return "translate(0," + _x(i) + ")"; })
			.each(_chart.makeRow)
			;

		// // make lines to distinguish rows
		row.insert("line",":first-child")
			.attr("class",function(d, i) { return "row"+i; })
			.attr("x2", _chart.effectiveWidth())
			.attr("y1",_y.rangeBand() / 2)
			.attr("y2",_y.rangeBand() / 2);
		
		// append names for each row
		row.append("text")
			.attr("class","name")
		    .attr("x", -10)
		    .attr("y", _y.rangeBand() / 2)
		    .attr("dy", ".32em")
		    .attr("text-anchor", "end")
		    .text(function(d, i) { return _nodes[i].name; });
			
		// append names for each row
		row.append("text")
			.attr("class","outgoing")
		    .attr("x", function(d, i) { return _chart.effectiveWidth(); })
		    .attr("y", _y.rangeBand() / 2)
		    .attr("dy", ".32em")
		    .attr("text-anchor", "start")
		    .text(function(d, i) {
				var totalOutgoing = d.map(function(o){return o.z;});
				return d3.sum(totalOutgoing);
			});

			
		
	}
	
	function mouseover(p) {
	      d3.selectAll(".gridRow text.name").classed("active", function(d, i) { return i == p.y; });
	      d3.selectAll(".gridColumn text.name").classed("active", function(d, i) { return i == p.x; });
	}

	function mouseout() {
	      d3.selectAll("text").classed("active", false);
	}
	
	function order(value){

	      _x.domain(_orders[value]);
		  _y.domain(_orders[value]);
	      var t = _chart.chartBodyG().transition().duration(2500);

	      t.selectAll(".gridRow")
	          .delay(function(d, i) { return _y(i) * 4; })
	          .attr("transform", function(d, i) { 
				  return "translate(0," + _y(i) + ")"; })
	        .selectAll(".node")
	          .delay(function(d) { return _y(d.x) * 4; })
			  .attr("transform", bubbleLocator)
			  ;

	      t.selectAll(".gridColumn")
	          .delay(function(d, i) { return _x(i) * 4; })
	          .attr("transform", function(d, i) { return "translate(" + _x(i) + ")rotate(-90)"; });
	}
	
	function renderColumns(bubbleG){
		// create columns

		var column =bubbleG
			.enter().append("g")
			.attr("class", "gridColumn")
			.attr("transform", function(d, i) { return "translate(" + _x(i) + ")rotate(-90)"; });
	
		// make lines to distinguish columns	
		column.append("line")
			.attr("class",function(d, i) { return "column"+i; })
			.attr("x1", -_chart.effectiveWidth())
			.attr("y1",_x.rangeBand() / 2)
			.attr("y2",_x.rangeBand() / 2);

		// append names for each columns
		column.append("text")
			.attr("class","name")
			.attr("x", 6)
			.attr("y", _x.rangeBand() / 2)
			.attr("dy", ".32em")
			.attr("text-anchor", "start")
			.text(function(d, i) { return _nodes[i].name; });
		
		// append names for each columns
		column.append("text")
			.attr("class","incoming")
			.attr("x", function(d, i) { return -_chart.effectiveWidth(); })
			.attr("y", _x.rangeBand() / 2)
			.attr("dy", ".32em")
			.attr("text-anchor", "end")
			.text(function(d, i) { 
				
				var totalIncoming = bubbleG.map(function(array) {
					var tempData = array.map(function(d){return d.__data__;});
					var incoming = tempData.map(function(r){
						return r[i].z;
					})
					return d3.sum(incoming);
				});
				
				return d3.sum(totalIncoming); 
			})
			;
	}
	
	function refreshNodes(matrix){
			
	 var bubbleGRows = _chart.chartBodyG().selectAll(".gridRow").data(matrix);

	
		bubbleGRows.each(function(d){
			
			var cells = d3.select(this).selectAll("."+_chart.BUBBLE_NODE_CLASS).data(d);
			cells.select("circle." + _chart.BUBBLE_CLASS).transition()
				.duration(_chart.transitionDuration())
				.attr("r",function(d){
					return _z(d.z);
				})
				.attr("fill", function(d) {
					return _c(d.z)
				})
				;
		});
		
		// setTimeout(function(){
		// 	var orderValue = d3.select("#order").node().value;
		// 
		// 	order(orderValue);
		// },1000);
	}
	
	function newIndexes(s,t){
		// console.log("old-source = "+s);
		// console.log("old-tagert = "+t);
		// console.log(_nodes);
		// console.log(_countriesToShow);
		
		var source = _allNodes[s];
		var target = _allNodes[t];
		
		var newSource = null;
		var newTarget = null;
		
		if(typeof _countriesToShow !== "undefined"){
			for (var i = 0; i < _countriesToShow.length; i++) {
				var c = _countriesToShow[i];
				if(source.name == c){
					newSource = i;
				}
			}
			for (var i = 0; i < _countriesToShow.length; i++) {
				var c = _countriesToShow[i];
				if(target.name == c){
					newTarget = i;
				}
			}
		}else{
			var newSource = source.index;
			var newTarget = target.index;
		}

		
		// console.log("new-source = "+newSource);
		// console.log("new-tagert = "+newTarget);
		return {s:newSource,t:newTarget}
	}
	
	function buildMatrix(data){
		// nodes = countries.map(function(d,i){return {name:d,index:i};});
		// var links = data.map(function(d){return {source:d.value.indexFrom,target:d.value.indexTo,value:d.value.value};});
		// var data = [];
		// if(_chart.filters() == 0){
		// 	data = dat
		// }else{
		// 	for (var i = 0; i < dat.length; i++) {
		// 		var o = dat[i];
		// 		if(_chart.filters().indexOf(o.key) != -1){
		// 			data.push(o);
		// 		}
		// 	}
		// }
		// 
		
		var links = [];

		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			var indexSource = _chart.keyAccessor()(d);
			var indexTarget = _chart.valueAccessor()(d);
			var value = _chart.radiusValueAccessor()(d);// values[i];

			var indexes = newIndexes(indexSource,indexTarget)
			if(indexes.s != null && indexes.t != null){
				links.push({
					key:d.key
					,source:indexes.s
					,target:indexes.t
					,value:value
				});
			}
		}
		
		// var links = data.map(function(d){
		// 	var indexSource = _chart.keyAccessor()(d);
		// 	var indexTarget = _chart.valueAccessor()(d);
		// 	newIndexes(indexSource,indexTarget)
		// 	return {
		// 		key:d.key
		// 		,source:indexSource
		// 		,target:indexTarget
		// 		,value:_chart.radiusValueAccessor()(d)};
		// 	});
		
		var matrix=[];
		
		
		// var n = nodes.length;
		// Compute index per node.
		_nodes.forEach(function(node, i) {
			// node.index = i;
			node.inwards = 0;
			node.outwards = 0;
			node.internal = 0
			
		    matrix[i] = d3.range(_n).map(function(j) { 
				return {x: j, y: i, z: 0, key:""};
			});
			
		});
		
		// Convert links to matrix; count character occurrences.
		links.forEach(function(link) {
			// matrix[link.source][link.target].aij += link.aij;
			matrix[link.source][link.target].key = link.key;
			matrix[link.source][link.target].z += link.value;
			if(link.target == link.source){
				_nodes[link.source].internal += link.value;
			}else{
				_nodes[link.target].inwards += link.value;
				_nodes[link.source].outwards += link.value;
			}

		});
		
		
		
		var max = d3.max(matrix, function(array) {
		  return d3.max(array, function(e){return e.z});
		});
		
		var min = d3.min(matrix, function(array) {
		  return d3.min(array, function(e){return e.z});
		});
		min = (min == 0)?1:min;
		_domain = [min,max];
		
		initOrders();
		
		return matrix;
	}
	
	function refreshOverallFlowText(matrix){
		
		d3.selectAll(".incoming")
			.text(function(d, i) {
				var allBubbles = d3.selectAll("circle._"+i)[0];
				// console.log(allBubbles);
				var temp_inc = allBubbles.map(function(b){
					var bubble = d3.select(b);
					var parent = d3.select(bubble.node().parentNode);
					
					if (parent.classed("selected")){
						
						
						var cx = bubble.data()[0].x;
						var cy = bubble.data()[0].y;
						var val = matrix[cx][cy].z
						// console.log("selected");
						// console.log("flow: "+matrix[cx][cy].key+", x: "+cx+", y = "+cy+", val = "+ val);

						return val;
					}else if(parent.attr("class") == "node"){
						// return bubble.data()[0].z;
						var cx = bubble.data()[0].y;
						var cy = bubble.data()[0].x;
						var val = matrix[cx][cy].z
						// console.log("all nodes");
						// console.log("flow: "+matrix[cx][cy].key+", x: "+cx+", y = "+cy+", val = "+ val);
						return val;
					}
					else{
						return 0	
					}

				});
				return d3.sum(temp_inc);
			})
			
		d3.selectAll(".outgoing")
			.text(function(d, i) {
				
				var thisRow =d3.select(d3.select(this).node().parentNode);
				var allBubbles = thisRow.selectAll("circle")[0];
				
				var temp_inc = allBubbles.map(function(b){
					var bubble = d3.select(b);

					var parent = d3.select(bubble.node().parentNode);
					if(parent.attr("class") == "node"){
						return bubble.data()[0].z;
						// return val;
					}
					else if (parent.classed("selected")){
						
						return bubble.data()[0].z;
						// return val;
					}
					else{
						return 0	
					}

				});
				return d3.sum(temp_inc);

			})
	};
	
	return _chart.anchor(parent, chartGroup);
}
