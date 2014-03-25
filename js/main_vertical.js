d3.csv("data/human cost.csv",function(d){

	d.inflation_adjusted=+d.inflation_adjusted;

	d.years=+d.when;


	d.date=new Date(d.years,0,1);

	d.age=d.age.replace(/\s+/g, '-').toLowerCase();

	return d;
},function(data){
	console.log(data);

	var WIDTH=500,
		HEIGHT=600;
	var margins={
		top:50,
		bottom:50,
		left:50,
		right:50
	};
	var padding={
		top:0,
		bottom:0,
		left:10,
		right:30
	};

	
	
	//console.log(data.map(function(d){return d.date;}))

	var avgByYear = d3.nest()
	    .key(function(d) { return d3.time.format("%Y")(d.date); })
	    .rollup(function(years) { return d3.mean(years,function(d){return d.inflation_adjusted}); })
	    .map(data, d3.map);


	var ages=d3.nest()
		.key(function(d) { return d.age })
		.rollup(function(age) { 
			//d3.mean(age,function(d){return d.inflation_adjusted}); 
			return {
				costs:age,
				mean:d3.mean(age,function(d){return d.inflation_adjusted}),
				median:d3.median(age,function(d){return d.inflation_adjusted}),
				extent:d3.extent(age,function(d){return d.inflation_adjusted})
			}
		})
		.map(data, d3.map);
	console.log(d3.entries(ages));

	/*
	var areas=d3.nest()
			.key(function(d) { return d.area })
			.map(data, d3.map);

	areas=d3.keys(areas).filter(function(d){return d.length>2;});

	console.log(areas)
	*/
	var date_extents=d3.extent(data,function(d){return d.date});

	var cost_extents=d3.extent(data,function(d){return d.inflation_adjusted});

	var xscale=d3.scale.ordinal()
  				.domain(d3.keys(ages))
  				.rangePoints([0,WIDTH-margins.left-margins.right-padding.left-padding.right]);

  	var dxscale=d3.scale.ordinal()
  				.domain(["africa", "asia", "europe", "middle_east", "america", "oceania"])
  				.rangeBands([0,100]);

	var yscale=d3.scale.log().domain(cost_extents).range([HEIGHT-margins.top-margins.bottom,0]);
	//sqrt().exponent(0.2)
	
	var svg=d3.select("#costs").append("svg")
				.attr("width",WIDTH)
				.attr("height",HEIGHT);

	var costs=svg.append("g")
				.attr("transform","translate("+margins.left+","+(margins.top)+")");

	var agesGroup=costs.selectAll("g.age")
				.data(d3.entries(ages))
				.enter()
				.append("g")
					.attr("class","age")
					.attr("id",function(d){
						return d.key;
					})
					.attr("transform",function(d){
						return "translate("+(xscale(d.key))+","+0+")";
					});

	agesGroup.append("text")
			.attr("class","title")
			.attr("x",0)
			.attr("y",HEIGHT-margins.bottom-margins.bottom+15)
			.text(function(d){
				return d.key;
			})
	/*
	costs.append("line")
			.attr("class","axis")
			.attr("x1",0)
			.attr("x2",WIDTH-margins.left-margins.right)
			.attr("y1",HEIGHT-margins.top-margins.bottom)
			.attr("y2",HEIGHT-margins.top-margins.bottom)
	*/
	
	console.log("SHIIIIIIIIIIIIIT",WIDTH,margins,WIDTH-margins.left-margins.right)

	var cost_box=agesGroup.append("g")
					.attr("class","costs");


	cost_box.append("line")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",function(d){
					return yscale(d.value.extent[0])
				})
				.attr("y2",function(d){
					
					console.log(d.key,d.value.extent[0],"-",d.value.extent[1])

					return yscale(d.value.extent[1])

					
				})

	var median=cost_box.append("line")
					.attr("class","median")
					.attr("x1",-10)
					.attr("x2",10)
					.attr("y1",function(d){
						return yscale(d.value.median)
					})
					.attr("y2",function(d){
						return yscale(d.value.median)
					})

	var costs=cost_box.selectAll("g.cost")
				.data(function(d){
					return d.value.costs;
				})
				.enter()
				.append("g")
					.attr("class","cost")
					.attr("rel",function(d){
						return d.inflation_adjusted+" , "+(-yscale(d.inflation_adjusted));
					})
					.attr("transform",function(d){
						var x=0;
						//var y=-(HEIGHT-margins.bottom-padding.bottom-margins.top-padding.top-yscale(d.inflation_adjusted));
						var y=yscale(d.inflation_adjusted);
						console.log(d.inflation_adjusted,y,d.area,dxscale(d.area))

						if(d.age=="modern") {
							//x+=dxscale(d.area);
							//console.log(d.area,dxscale(d.area))
						}

						return "translate("+x+","+y+")";
					});

	costs.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",6)

	

	var yAxis = d3.svg.axis()
					.orient("right")
					.ticks(20, ",.1s")
    				.scale(yscale)

    var axis=svg.append("g")
				.attr("id","yaxis")
				.attr("transform","translate("+(WIDTH-margins.right)+","+(margins.top)+")")
				.call(yAxis);

	console.log(d3.keys(ages))

	d3.keys(ages).forEach(function(d){
		console.log(d,xscale(d))
	})
})