d3.csv("data/human cost.csv",function(d){

	d.inflation_adjusted=+d.inflation_adjusted;

	d.years=+d.when;


	d.date=new Date(d.years,0,1);



	d.age=d.age.replace(/\s+/g, '-').toLowerCase();//+"-"+d.area;

	return d;
},function(data){
	console.log(data);

	var WIDTH=960,
		HEIGHT=1000;
	var margins={
		top:200,
		bottom:50,
		left:75,
		right:70
	};
	var padding={
		top:20,
		bottom:10,
		left:10,
		right:75
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
			name:"America",
			age:"1850"
		},
		"modern":{
			name:"Today",
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

  	var yscale=d3.scale.log().domain([cost_extents[1],1]).range([HEIGHT-(margins.top+margins.bottom+padding.top+padding.bottom),0]);

  	var xscalePoint=d3.scale.ordinal()
  				.domain(ages.map(function(d){return d.key}))
  				.rangePoints([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);
  	var xscale=function(age) {
  		return Math.round(xscalePoint(age));
  	}
  	var dxscale=d3.scale.ordinal()
  				.domain(["africa", "asia", "europe", "middle_east", "america", "oceania"])
  				.rangeBands([0,100]);
	
  	var	body=d3.select("body");

	var detectScrollTop=function(){
		


		//if(is_touch_device)
		//	return;

		var	top=window.scrollY || window.pageYOffset,
		   	fixed=body.classed("fixed");

		console.log(top)

		if(top > 215) {
			//if(fixed) {
				body.classed("fixed",true)
			//}
		} else {
			//if(!fixed) {
				body.classed("fixed",false)
			//}
		}
	}

  	d3.select(window).on("scroll",detectScrollTop);

  	/*d3.select("#headers")
  			.style({
  				"width":(WIDTH-50)+"px",
  				"left":(20)+"px"
  			})*/

  	d3.select("#headers ul")
  			.selectAll("li")
  			.data(ages.map(function(d){return d.key}))
  			.enter()
  				.append("li")
  				.html(function(d){
  					return agesNames[d].name+"<br/><span>"+agesNames[d].age+"</span><br/><i class='mk-male'></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class='mk-female'></i>";
  				})

	var svg=d3.select("#costs").append("svg")
				.attr("width",WIDTH)
				.attr("height",HEIGHT);

	var defs=svg.append("defs")

	var font=defs.append("font")
			.attr("id","gender")
			.attr("horiz-adv-x","1000");
	font.node().innerHTML='<font-face font-family="gender" font-weight="400" font-stretch="normal" units-per-em="1000" ascent="850" descent="-150" /><missing-glyph horiz-adv-x="1000" /><glyph glyph-name="female" unicode="&#xe800;" d="m0 534q0 58 23 111t60 90t91 61t111 22q76 0 142-38t104-103t38-143q0-99-61-176t-156-99v-79h96q28 0 48-20t19-47t-19-49t-48-20h-96v-95q0-28-20-48t-47-20t-49 20t-20 48v95h-95q-28 0-48 20t-19 49t19 47t48 20h95v79q-94 22-155 99t-61 176z m136 0q0-61 44-105t105-43t104 43t44 105t-44 105t-104 44t-105-44t-44-105z" horiz-adv-x="568.8" /><glyph glyph-name="male" unicode="&#xe801;" d="m0 265q0 59 23 113t62 92t93 62t112 23q81 0 151-42l103 104h-47q-23 0-39 16t-17 39t17 39t39 16h201q23 0 39-16t17-39v-201q0-23-17-39t-39-17t-39 17t-16 39v48l-104-104q43-69 43-150q0-79-39-146t-106-107t-147-39q-78 0-145 39t-106 107t-39 146z m139 0q0-63 45-108t106-44q63 0 108 44t45 108t-45 107t-108 45q-62 0-106-45t-45-107z" horiz-adv-x="753.9" />';

	

	var grid=svg.append("g")
				.attr("id","grid")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top)+")")
				.selectAll("line")
					.data(ages)
					.enter()
					.append("g")
						.attr("rel",function(d){
							return d.key;
						})
						.attr("transform",function(d){
							return "translate("+(xscale(d.key))+",0)"
						})

	grid.append("line")
		.attr("y1",0)
		.attr("y2",HEIGHT-(margins.top+margins.bottom+padding.top+padding.bottom))
		.attr("x1",0)
		.attr("x2",0)
	/*
	grid.append("text")
			.attr("class","gender")
			.attr("x",-20)
			.attr("y",10)
			.html("&#xe801;");

	grid.append("text")
			.attr("class","gender")
			.attr("x",20)
			.attr("y",10)
			.html("&#xe800;");
	*/
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
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",function(d){
					return yscale(d.values.extent[0])
				})
				.attr("y2",function(d){
					return yscale(d.values.extent[1])
				})

	cost_box.append("line")
				.attr("x1",-3)
				.attr("x2",4)
				.attr("y1",function(d){
					return yscale(d.values.extent[0])
				})
				.attr("y2",function(d){
					return yscale(d.values.extent[0])
				})

	cost_box.append("line")
				.attr("x1",-3)
				.attr("x2",4)
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

	/*costs.filter(function(d){
				return d.gender_id=='b'
			})
			.append("rect")
			.attr("class","joint")
			.attr("x",-28)
			.attr("y",-8)
			.attr("width",56)
			.attr("height",16)
			.attr("rx",8)
			.attr("ry",8)*/

	costs.filter(function(d){
				return 1;
				return d.gender_id!='b'
			})
			/*.append("rect")
				.attr("x",function(d){
					if(d.gender_id=="f") {
						return -28;
					}
					if(d.gender_id=="m") {
						return 4;
					}
				})
				.attr("y",-8)
				.attr("width",24)
				.attr("height",16)
				.attr("rx",8)
				.attr("ry",8)*/
			.append("circle")
			.attr("cx",function(d){
				if(d.gender_id=="f") {
					return -20;
				}
				if(d.gender_id=="m") {
					return 20;
				}
				return 0;
			})
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
					return "translate("+(xscale(d))+","+(-35)+")"
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