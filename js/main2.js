d3.csv("data/human cost.csv",function(d){

	d.inflation_adjusted=+d.inflation_adjusted;

	d.years=+d.when;
/*
	if(d.years>=1850 && d.years<=1860) {
		d.years=1850;
	}

	if(d.years>=1900 && d.years<=2050) {
		d.years=2000;
	}
*/
	//d.years+=500;

	d.date=new Date(d.years,0,1);



	return d;
},function(data){
	console.log(data);

	var WIDTH=500,
		HEIGHT=1000;
	var margins={
		top:50,
		bottom:50,
		left:50,
		right:50
	};

	
	
	//console.log(data.map(function(d){return d.date;}))

	var avgByYear = d3.nest()
	    .key(function(d) { return d3.time.format("%Y")(d.date); })
	    .rollup(function(years) { return d3.mean(years,function(d){return d.inflation_adjusted}); })
	    .map(data, d3.map);

	console.log(avgByYear);

	//d3.range(21).map(function(d){return new Date(-500 + d*100,0,1);})
/*
	data=d3.range(21).map(function(d){
				return {
					date:new Date(d*100,0,1),
					inflation_adjusted:50000
				}
			});
	*/
	var date_extents=d3.extent(data,function(d){return d.date});

	var cost_extents=d3.extent(data,function(d){return d.inflation_adjusted});

	var xscale=d3.scale.linear().domain(cost_extents).range([0,WIDTH-margins.right-margins.left]);

	var yscale=d3.scale.pow().exponent(0.3).domain(date_extents).range([0,HEIGHT-margins.top-margins.bottom]);
						
	
	var svg=d3.select("#costs").append("svg")
				.attr("width",WIDTH)
				.attr("height",HEIGHT);

	var costs=svg.append("g")
				.attr("transform","translate("+margins.left+","+margins.top+")");

	var cost=costs.selectAll("g.cost")
			.data(data)
			.enter()
			.append("g")
				.attr("class","cost")
				.attr("transform",function(d){
					return "translate("+xscale(d.inflation_adjusted)+","+yscale(d.date)+")"
				});
	cost.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",2)

	cost.append("text")
			.attr("x",10)
			.attr("y",0)
			.attr("dy","0.3em")
			.text(function(d){
				return d3.time.format("%Y")(d.date);
			})
})