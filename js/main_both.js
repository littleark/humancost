d3.csv("data/human cost.csv",function(d){

	d.inflation_adjusted=+d.inflation_adjusted;

	d.years=+d.when;


	d.date=new Date(d.years,0,1);



	d.age=d.age.replace(/\s+/g, '-').toLowerCase();//+"-"+d.area;

	return d;
},function(data){
	console.log(data);

	var WIDTH=900,
		HEIGHT=700;
	var margins={
		top:200,
		bottom:50,
		left:100,
		right:70
	};
	var padding={
		top:10,
		bottom:10,
		left:10,
		right:30
	};

	var agesNames={
		"ancient-egypt":{
			name:"Ancient Egypt",
			age:"1000-500 B.C."
		},
		"ancient-rome":{
			name:"Ancient Rome",
			age:"500 B.C. - 0"
		},
		"caribbean":{
			name:"Caribbean Society",
			age:"1650"
		},
		"america":{
			name:"American Slavery",
			age:"1850"
		},
		"modern":{
			name:"Modern Days",
			age:"2000"
		}
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

	//console.log("avgByType",avgByType)

	var average="median";

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
		.entries(data);
		//.map(data, d3.map);

	console.log("______________________")
	console.log(ages)
	
	var date_extents=d3.extent(data,function(d){return d.date});

	var cost_extents=d3.extent(data,function(d){return d.inflation_adjusted});

  	var yscale=d3.scale.sqrt().exponent(0.2).domain([cost_extents[1],1]).range([HEIGHT-(margins.top+margins.bottom+padding.top+padding.bottom),0]);

  	var xscale=d3.scale.ordinal()
  				.domain(ages.map(function(d){return d.key}))
  				.rangePoints([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);

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
					.data(ages.map(function(d){return d.key}))
					.enter()
					.append("line")
					.attr("y1",0)
					.attr("y2",HEIGHT-(margins.top+margins.bottom+padding.top+padding.bottom))
					.attr("x1",function(d){
						return xscale(d);
					})
					.attr("x2",function(d){
						return xscale(d);
					})

	var costs=svg.append("g")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top+padding.top)+")");

	var agesGroup=costs.selectAll("g.age")
				.data(ages)
				.enter()
				.append("g")
					.attr("class","age")
					.attr("id",function(d){
						return d.key;
					})
					.attr("transform",function(d){
						return "translate("+(xscale(d.key))+",0)";
					});

	/*
	var line = d3.svg.line()
				    .x(function(d) { return xscale(d.value[average]); })
				    .y(function(d) { return yscale(d.key); })
				    //.interpolate("cardinal");

	costs.append("path")
			.attr("class","avg")
			.attr("d",function(d){
				return line(d3.entries(ages))
			})
	*/

	var cost_box=agesGroup.append("g")
					.attr("class","costs");


	cost_box.append("line")
				.attr("x1",10)
				.attr("x2",10)
				.attr("y1",function(d){
					return yscale(d.values.extent[0])
				})
				.attr("y2",function(d){
					return yscale(d.values.extent[1])
				})

	cost_box.append("line")
				.attr("x1",10)
				.attr("x2",6)
				.attr("y1",function(d){
					return yscale(d.values.extent[0])
				})
				.attr("y2",function(d){
					return yscale(d.values.extent[0])
				})

	cost_box.append("line")
				.attr("x1",10)
				.attr("x2",6)
				.attr("y1",function(d){
					return yscale(d.values.extent[1])
				})
				.attr("y2",function(d){
					return yscale(d.values.extent[1])
				})

	var avg=cost_box.append("line")
					.attr("class","avg")
					.attr("x1",-10)
					.attr("x2",10)
					.attr("y1",function(d){
						return yscale(d.values[average])
					})
					.attr("y2",function(d){
						return yscale(d.values[average])
					})

	var costs=cost_box.selectAll("g.cost")
				.data(function(d){
					return d.values.costs;
				})
				.enter()
				.append("g")
					.attr("class",function(d){
						return "cost hidden "+d.type;
					})
					.attr("rel",function(d){
						return d.inflation_adjusted+" , "+(-yscale(d.inflation_adjusted));
					})
					.attr("transform",function(d){
						var x=0;//xscale(1);//xscale(d.inflation_adjusted);
						var y=yscale(1);//1

						return "translate("+x+","+y+")";
					});

	costs.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",8)

	
	
	var yAxis = d3.svg.axis()
					.orient("right")
					//.ticks(20, ",.1s$")
					.tickValues([1,10,100,1000,10000,100000])
					.tickFormat(d3.format("$,.0f"))
    				.scale(yscale)

    var yaxis=svg.append("g")
				.attr("id","xaxis")
				.attr("transform","translate("+(WIDTH-margins.right)+","+(margins.top+padding.top)+")")
				.call(yAxis);
	

    var xaxis=svg.append("g")
				.attr("id","yaxis")
				//.attr("transform","translate("+(WIDTH-margins.right-padding.right)+","+(margins.top)+")")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top)+")")
				//.call(yAxis);

	var ageLabels=xaxis.selectAll("g")
			.data(ages.map(function(d){return d.key}))
			.enter()
				.append("g")
				.attr("transform",function(d){
					return "translate("+(xscale(d))+","+(padding.top-40)+")"
				})

	ageLabels
			.append("text")
			.attr("class","period")
			.attr("y",20)
			.attr("x",0)
			.text(function(d){
				return agesNames[d].age;
			})

	ageLabels
			.append("text")
			.attr("y",0)
			.attr("x",0)
			.text(function(d){
				return agesNames[d].name;
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
					var y=yscale(d.inflation_adjusted);
					var x=0;
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
				var y=yscale(d.inflation_adjusted);
				var x=0;

				return "translate("+x+","+y+")";
			});
	}


	function Types() {

		var type_paddings={
			top:0,
			bottom:0,
			left:20,
			right:20
		}

		var type_margins={
			top:20,
			bottom:0,
			left:margins.left+padding.left+type_paddings.left,
			right:margins.right+padding.right+type_paddings.right
		};

		var types=[
			{
				id:"slave",
				name:"slavery"
			},
			{
				id:"war",
				name:"military"
			},
			{
				id:"labour",
				name:"forced labour"
			},
			{
				id:"law",
				name:"Law"
			},
			{
				id:"trafficking",
				name:"trafficking"
			}
		];

		var connections=[
			{
				from:"slave",
				to:"ancient-egypt"
				
			},
			{
				from:"slave",
				to:"ancient-rome"
				
			},
			{
				from:"slave",
				to:"caribbean"
				
			},
			{
				from:"slave",
				to:"america"
				
			},
			{
				from:"slave",
				to:"modern"
				
			},
			{
				from:"war",
				to:"modern"
				
			},
			{
				from:"law",
				to:"modern"
				
			},
			{
				from:"labour",
				to:"modern"
				
			},
			{
				from:"trafficking",
				to:"modern"
				
			}

		];

		var type_xscale=d3.scale.ordinal()
  				.domain(types.map(function(d){return d.id}))
  				.rangePoints([0,WIDTH-(type_margins.left+type_margins.right)]);


  		var types_boxes=svg.append("g")
  							.attr("id","types")
  							.attr("transform","translate("+type_margins.left+","+type_margins.top+")")
  							.selectAll("g.type")
  								.data(types)
  								.enter()
  								.append("g")
  									.attr("class",function(d){
  										return "type "+d.id;
  									})
  									.attr("transform",function(d){
  										return "translate("+type_xscale(d.id)+",0)";
  									})

  		types_boxes.append("text")
  						.attr("x",0)
  						.attr("y",0)
  						.text(function(d){
  							return d.name;
  						})

  		types_boxes.append("rect")
  						.attr("x",-50)
  						.attr("y",10)
  						.attr("width",100)
  						.attr("height",5)

  		var types_connections=svg.append("g")
  							.attr("id","connections")
  							.attr("transform","translate("+type_margins.left+","+type_margins.top+")");

  		function getPath(x0,y0,x1,y1) {
  			//return "M"+x0+","+y0+"L"+x1+","+y1;

  			var path="M"+x0+","+y0;

  			path+="C"+x0+","+((y0+y1)/2)+","+x1+","+((y0+y1)/2)+","+x1+","+y1;

  			return path;

  		}

  		types_connections.selectAll("path")
  						.data(connections)
  						.enter()
  						.append("path")
  							.attr("class",function(d){
  								return d.from;
  							})
  							.attr("d",function(d){
  								var p=getPath(type_xscale(d.from),(type_margins.top),(xscale(d.to)-type_paddings.left),(margins.top-padding.top-60));
  								//console.log(d.from,d.to,p)
  								return p;
  							})
	}

	var illegalTypes=new Types();

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