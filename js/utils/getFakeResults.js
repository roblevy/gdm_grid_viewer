function getFakeResults(){
	// var countries=["Australia","Austria","Belgium","Bulgaria","Brazil","Canada","China","Cyprus","Czech Republic","Germany","Denmark","Spain","Estonia","Finland","France","Monaco","United Kingdom","Greece","Hungary","Indonesia","India","Ireland","Italy","Japan","Republic of Korea","Lithuania","Luxembourg","Latvia","Mexico","Malta","Netherlands","Poland","Portugal","Romania","Russian Federation","Slovakia","Slovenia","Sweden","Turkey","United States","Puerto Rico"];
	// 
	// // var countries=["Italy","United Kingdom","France","Germany","Spain"];
	// 
	// // var countries=["Italy","England"];
	// 
	// var sectors=["Agriculture","Mining","Food","Textiles","Leather","Wood","Paper","Fuel","Chemicals","Plastics","Minerals","Metals","Machinery","Electricals","Vehicles","Manufacturing","Utilities","Construction","Vehicle Trade","Wholesale Trade","Retail Trade","Hospitality","Inland Transport","Water Transport","Air Transport","Transport Services","Communications","Financial Services","Real Estate","Business Services","Public Services","Education","Health","Other Services","Private Households"];
	// 
	// // var sectors=["Agriculture","Mining","Food","Textiles","Leather"];
	// 
	// // var sectors=["Agriculture","Turism"];
	// 
	// var results = [];
	// // var id = 0; // flow form country to country per sector
	// // var flowID = 0; // flow form country to country 
	// for (var i = 0; i < countries.length; i++) {
	// 	var country1 = countries[i];
	// 	for (var j = 0; j < countries.length; j++) {
	// 		var country2 = countries[j];
	// 		// flowID++;
	// 		for (var k = 0; k < sectors.length; k++) {
	// 			var sector = sectors[k];
	// 			var value = Math.round(Math.random()* 100);
	// 			var increment = Math.round(Math.random()* 100);
	// 			results.push({
	// 				"type":"result",
	// 				"from":country1,
	// 				"to":country2,
	// 				"aij":country1 + country2,
	// 				"sector":sector,
	// 				"value":value,
	// 				// "id":id++,
	// 				// "flowID":flowID,
	// 				"indexFrom":countries.indexOf(country1),
	// 				"indexTo":countries.indexOf(country2),
	// 				"increment":increment
	// 			});
	// 		}
	// 	}
	// }
	// 
	// return {results:results,countries:countries,sectors:sectors};
	return(json_state0)
}

function addCountries(data,c){
	
	// var newCountries = ["France"];
	
	var sectors=data.sectors;
	
	data.countries.push(c);
	
	var countries = data.countries;
	
	for (var i = 0; i < countries.length; i++) {
		var country1 = countries[i];
		for (var j = 0; j < countries.length; j++) {
			var country2 = countries[j];
			var c= data.results.some(function(element, index, array){
				return (element.from == country1 && element.to == country2)
			})
			if(!c){
				for (var k = 0; k < sectors.length; k++) {
					var sector = sectors[k];
					var value = Math.round(Math.random()* 100);
					var increment = Math.round(Math.random()* 100);
					data.results.push({
						"type":"result",
						"from":country1,
						"to":country2,
						"aij":country1 + country2,
						"sector":sector,
						"value":value,
						// "id":id++,
						// "flowID":flowID,
						"indexFrom":countries.indexOf(country1),
						"indexTo":countries.indexOf(country2),
						"increment":increment
					});
				}
			}
			
			
	
		}
	}

	return data;
}