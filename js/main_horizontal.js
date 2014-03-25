d3.csv("data/human cost.csv",function(d){

	d.inflation_adjusted=+d.inflation_adjusted;

	d.years=+d.when;


	d.date=new Date(d.years,0,1);

	d.age=d.age.replace(/\s+/g, '-').toLowerCase();//+"-"+d.area;



	return d;
},function(data){
	console.log(data);

	var WIDTH=800,
		HEIGHT=500;
	var margins={
		top:50,
		bottom:50,
		left:100,
		right:50
	};
	var padding={
		top:10,
		bottom:10,
		left:10,
		right:10
	};

	
	
	//console.log(data.map(function(d){return d.date;}))

	var avgByYear = d3.nest()
	    .key(function(d) { return d3.time.format("%Y")(d.date); })
	    .rollup(function(years) { return d3.mean(years,function(d){return d.inflation_adjusted}); })
	    .map(data, d3.map);

	var avgByType = d3.nest()
	    .key(function(d) { return d.type; })
	    .rollup(function(type) { return d3.mean(type,function(d){return d.inflation_adjusted}); })
	    .map(data, d3.map);

	console.log("avgByType",avgByType)

	var average="mean";

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

	var xscale=d3.scale.log().domain([cost_extents[1],1]).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);
	xscale.range([WIDTH-(margins.left+margins.right+padding.left+padding.right),0]);

	var yscale=d3.scale.ordinal()
  				.domain(d3.keys(ages))
  				.rangePoints([0,HEIGHT-(margins.top+margins.bottom+padding.top+padding.bottom)]);

  	var dxscale=d3.scale.ordinal()
  				.domain(["africa", "asia", "europe", "middle_east", "america", "oceania"])
  				.rangeBands([0,100]);
	
	var svg=d3.select("#costs").append("svg")
				.attr("width",WIDTH)
				.attr("height",HEIGHT);


	var grid=svg.append("g")
				.attr("id","grid")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top)+")")
				.selectAll("line")
					.data(d3.keys(ages))
					.enter()
					.append("line")
					.attr("x1",0)
					.attr("x2",WIDTH-(margins.left+margins.right+padding.left+padding.right))
					.attr("y1",function(d){
						return yscale(d);
					})
					.attr("y2",function(d){
						return yscale(d);
					})

	var costs=svg.append("g")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top)+")");

	var agesGroup=costs.selectAll("g.age")
				.data(d3.entries(ages))
				.enter()
				.append("g")
					.attr("class","age")
					.attr("id",function(d){
						return d.key;
					})
					.attr("transform",function(d){
						return "translate(0,"+(yscale(d.key))+")";
					});

	var line = d3.svg.line()
				    .x(function(d) { return xscale(d.value[average]); })
				    .y(function(d) { return yscale(d.key); })
				    //.interpolate("cardinal");

	costs.append("path")
			.attr("class","avg")
			.attr("d",function(d){
				return line(d3.entries(ages))
			})

	var cost_box=agesGroup.append("g")
					.attr("class","costs");


	cost_box.append("line")
				.attr("y1",0)
				.attr("y2",0)
				.attr("x1",function(d){
					return xscale(d.value.extent[0])
				})
				.attr("x2",function(d){
					
					

					return xscale(d.value.extent[1])

					
				})

	var avg=cost_box.append("line")
					.attr("class","avg")
					.attr("y1",-10)
					.attr("y2",10)
					.attr("x1",function(d){
						return xscale(d.value[average])
					})
					.attr("x2",function(d){
						return xscale(d.value[average])
					})

	var costs=cost_box.selectAll("g.cost")
				.data(function(d){
					return d.value.costs;
				})
				.enter()
				.append("g")
					.attr("class","cost hidden")
					.attr("rel",function(d){
						return d.inflation_adjusted+" , "+(-yscale(d.inflation_adjusted));
					})
					.attr("transform",function(d){
						var x=xscale(1);//xscale(d.inflation_adjusted);
						var y=0;
						

						if(d.age=="modern") {
							//x+=dxscale(d.area);
							//console.log(d.area,dxscale(d.area))
						}

						return "translate("+x+","+y+")";
					});

	costs.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",10)

	

	var xAxis = d3.svg.axis()
					.orient("bottom")
					.ticks(20, ",.1s")
					.tickValues([1,10,100,1000,10000,100000])
    				.scale(xscale)

    var xaxis=svg.append("g")
				.attr("id","xaxis")
				.attr("transform","translate("+(margins.left+padding.left)+","+(HEIGHT-margins.bottom)+")")
				.call(xAxis);

	var yAxis = d3.svg.axis()
					.orient("right")
    				.scale(yscale)

    var yaxis=svg.append("g")
				.attr("id","yaxis")
				//.attr("transform","translate("+(WIDTH-margins.right-padding.right)+","+(margins.top)+")")
				.attr("transform","translate("+(margins.left-padding.left)+","+(margins.top)+")")
				//.call(yAxis);

	yaxis.selectAll("text")
			.data(d3.keys(ages))
			.enter()
			.append("text")
			.attr("x",padding.left)
			.attr("y",function(d){
				return yscale(d)-20;
			})
			.text(function(d){
				return d;
			})

	function showCost(id,callback) {
		costs.filter(function(d){
				//console.log(d,"==",id)
				return d.id==id;
			})
			.classed("hidden",false)
			.transition()
			.duration(2000)
				.attr("transform",function(d){
					var x=xscale(d.inflation_adjusted);
					var y=0;
					return "translate("+x+","+y+")";
				})
				.each("end",function(){
					if(callback) {
						callback();
					}
				})
	}
	function showAllCosts() {
		costs
			.classed("hidden",false)
			.transition()
			.duration(2000)
			.attr("transform",function(d){
				var x=xscale(d.inflation_adjusted);
				var y=0;
				

				if(d.age=="modern") {
					//x+=dxscale(d.area);
					//console.log(d.area,dxscale(d.area))
				}

				return "translate("+x+","+y+")";
			});
	}


	function Story() {
		var index=0;
		var self=this;
		var chapters=[
			/*{
				id:null,
				caption:"How has the cost of a human life changed in history?"
			},*/
			{
				id:"1",
				caption:"In Ancient Egypt a male slave was worth 32,000$"
			},
			{
				id:"2",
				caption:"During the Roman Empire the cost of a Gladiator was 2,080$"
			},
			{
				id:"5",
				caption:"Today in Indonesian baby farms the life of a new born is valued 160-250$"
			},
			{
				id:"all",
				caption:"This is the stor"
			}
		];

		this.showStory=function(id) {
			chapters.filter(function(d){
				return d.id==id;
			});
		} 

		this.showStories=function() {
			if(index>chapters.length-1) {
				return;
			}
			if(chapters[index].id=="all") {
				showAllCosts();
			} else {
				showCost(chapters[index].id,function(){
					index++;
					self.showStories();
				})	
			}
			


		}
		this.start=function() {
			showAllCosts();
		}
	}

	var story=new Story();
	//story.start();
	//showCost("1",function(){
	//	alert("HIIII")
	//})
	story.showStories();
})