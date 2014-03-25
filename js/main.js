d3.csv("data/humancost.csv",function(d){

	d.inflation_adjusted=+d.inflation_adjusted;
	

	d.years=+d.when;


	d.date=new Date(d.years,0,1);



	d.age=d.age.replace(/\s+/g, '-').toLowerCase();//+"-"+d.area;

	return d;
},function(data){
	
	

	console.log(data);

	var WIDTH=window.innerWidth-20,
		HEIGHT=window.innerHeight-105;

	WIDTH=(WIDTH>1600?1600:WIDTH);
	WIDTH=(WIDTH<960?960:WIDTH);

	HEIGHT=(HEIGHT>800?800:HEIGHT);
	HEIGHT=(HEIGHT<400?400:HEIGHT);

	var margins={
		top:50,
		bottom:100,
		left:75,
		right:70
	};
	var padding={
		top:20,
		bottom:50,
		left:200,
		right:10
	};

	

	var agesNames={
		"ancient-egypt":{
			name:"Ancient Egypt",
			age:"1000 B.C. - 500 B.C."
		},
		"ancient-rome":{
			name:"Ancient Rome",
			age:"500 B.C. - 0 A.D."
		},
		"caribbean":{
			name:"Caribbean",
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
	
	var price_format=d3.format("$,.0f");
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
		.key(function(d) { return d.age
		})
		.rollup(function(age) { 
			//d3.mean(age,function(d){return d.inflation_adjusted}); 
			return {
				costs:age.sort(function(a,b){
					return b.inflation_adjusted-a.inflation_adjusted;
				}) ,
				mean:d3.mean(age,function(d){return d.inflation_adjusted}),
				median:d3.median(age,function(d){return d.inflation_adjusted}),
				extent:d3.extent(age,function(d){return d.inflation_adjusted})
			}
		})
		.entries(data);
		//.map(data, d3.map);
	data;
	/*
	ages.forEach(function(d){

	})
	

	var orders={};

	data.forEach(function(d){
		if(!orders[d.age]) {
			orders[d.age]=0;
		}
		d.index=orders[d.age];
		orders[d.age]++;
	})
	*/
	console.log("______________________")
	console.log(ages)
	
	var date_extents=d3.extent(data,function(d){return d.date});

	var cost_extents=d3.extent(data,function(d){return d.inflation_adjusted});

  	var xscale=d3.scale.log()
  						.domain([1,cost_extents[1]])
  						.range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);

  	var yscale=d3.scale.ordinal()
  				.domain(ages.map(function(d){return d.key}))
  				.rangePoints([0,HEIGHT-(margins.top+margins.bottom+padding.top+padding.bottom)]);
  		
  	var __yscale=function(age) {
  		return Math.round(yscalePoint(age));
  	}
  	var dxscale=d3.scale.ordinal()
  				.domain(["africa", "asia", "europe", "middle_east", "america", "oceania"])
  				.rangeBands([0,100]);
	

  	//d3.select(window).on("scroll",detectScrollTop);

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

	var grid=svg.append("g")
				.attr("id","grid")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top+padding.top)+")")
				.selectAll("line")
					.data(ages)
					.enter()
					.append("g")
						.attr("rel",function(d){
							return d.key;
						})
						.attr("transform",function(d){
							return "translate(0,"+(yscale(d.key))+")"
						})

	grid.append("line")
		.attr("y1",0)
		.attr("y2",0)
		.attr("x1",0)
		.attr("x2",WIDTH-(margins.left+margins.right+padding.left+padding.right))
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

	var xaxis=svg.append("g")
				.attr("id","xaxis")
				.attr("transform","translate("+(margins.left+padding.left)+","+(HEIGHT-margins.bottom)+")")
    var yaxis=svg.append("g")
				.attr("id","yaxis")
				//.attr("transform","translate("+(WIDTH-margins.right-padding.right)+","+(margins.top)+")")
				.attr("transform","translate("+(margins.left+padding.left)+","+(margins.top)+")")
				//.call(yAxis);

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
						return "translate(0,"+(yscale(d.key))+")";
					});
	

	var cost_box=agesGroup.append("g")
					.attr("class","costs");

	var detailed_cost_box=agesGroup.append("g")
					.attr("class","detailed-costs");

	cost_box.append("line")
				.attr("y1",15)
				.attr("y2",15)
				.attr("x1",function(d){
					return xscale(d.values.extent[0])
				})
				.attr("x2",function(d){
					return xscale(d.values.extent[1])
				})

	cost_box.append("line")
				.attr("y1",15)
				.attr("y2",0)
				.attr("x1",function(d){
					return xscale(d.values.extent[0])
				})
				.attr("x2",function(d){
					return xscale(d.values.extent[0])
				})

	cost_box.append("line")
				.attr("y1",15)
				.attr("y2",0)
				.attr("x1",function(d){
					return xscale(d.values.extent[1])
				})
				.attr("x2",function(d){
					return xscale(d.values.extent[1])
				})
	
	var avg=cost_box.append("line")
					.attr("class","avg")
					.attr("y1",15)
					.attr("y2",9)
					.attr("x1",function(d){
						return xscale(d.values[average])
					})
					.attr("x2",function(d){
						return xscale(d.values[average])
					})

	var dialog={
		el:d3.select("#dialog"),
		price:d3.select("#dialog h3"),
		oprice:d3.select("#dialog span.currency"),
		details:d3.select("#dialog h4"),
		gender_where_when:d3.select("#dialog h5"),
		note:d3.select("#dialog p.note"),
		more:d3.select("#dialog p.more")
	}



	var tm=null;
	var costs=cost_box.selectAll("g.cost")
				.data(function(d){
					return d.values.costs;
				})
				.enter()
				.append("g")
					.attr("class",function(d){
						return "cost  "+d.type; //hidden
					})
					.attr("rel",function(d){
						return d.inflation_adjusted+" , "+(-xscale(d.inflation_adjusted));
					})
					.attr("transform",function(d){
						var x=xscale(d.inflation_adjusted);//xscale(1);//xscale(d.inflation_adjusted);
						var y=0;//yscale(1);//1

						return "translate("+x+","+y+")";
					})
					.on("mouseover",function(d){

						if(tm) {
							clearTimeout(tm);
						}

						showDialog(d);

						
					})
					.on("mouseout",function(d){
						tm=setTimeout(function(){
							dialog.el.style("display","none")	
						},500)
					})
					.on("click",function(d){
						dialog.el.classed("expanded",true);
					})

	dialog.el
		.on("mouseover",function(d){
			if(tm) {
				clearTimeout(tm);
			}
		})
		.on("mouseout",function(d){
			tm=setTimeout(function(){
				dialog.el.style("display","none")	
			},500)
		})
		.on("click",function(d){
			dialog.el.classed("expanded",true);
		})

	function showDialog(d){
		dialog.price.html((d.l_h!="")?d.l_h:price_format(d.inflation_adjusted));
		dialog.oprice.html(d.original_cost?"(original cost "+d.original_cost+")":"&nbsp;");
		dialog.details.html(d.detail);
		dialog.gender_where_when.html(
				(d.gender_id!="b"?d.gender+", ":"")
				+
				d.culture_context+", "
				+
				(d.age=="modern"?d.when:agesNames[d.age].age)
		);
		dialog.note.html(d.note);

		if(d.link1) {
			var link1="<a href='"+d.link1+"' target='_blank'>here</a>";
			var link2=d.link2?" or <a href='"+d.link2+"' target='_blank'>here</a>":"";
			dialog.more.html("Read more "+link1+link2)
		} else {
			dialog.more.html("")
		}
		var x=(xscale(d.inflation_adjusted)-150+margins.left+padding.left),
			dx=(x+300-WIDTH);


		dialog.el.style({
			"display":"block",
			"left":(x-(dx>0?dx:0))+"px",
			"bottom":((HEIGHT-yscale(d.age)-margins.top-padding.top+20)+(details.getDelta(d.age)))+"px"
		})
		.classed("expanded",false)
	}

	function highlightCosts(t) {
			if(!t) {
				costs.classed("dimmed",false);
				detailed_cost_box.selectAll("g.detailed-cost")
										.classed("dimmed",false);
				return;
			}
			costs
				.filter(function(d){
					return d.type!=t;
				})
				.classed("dimmed",true)

			detailed_cost_box.selectAll("g.detailed-cost")
				.filter(function(d){
					return d.type!=t;
				})
				.classed("dimmed",true)
	}

	costs
		.append("line")
		.attr("class","gauge")
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2",0)
		.attr("y2",function(d){
			return HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age)
		})

	costs
		.append("text")
		.attr("class","gauge")
		.attr("x",5)
		.attr("y",function(d){
			return HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age)-5
		})
		.text(function(d){
			if(d.l_h!="") {
				return d.l_h;
			}
			return price_format(d.inflation_adjusted);
		})
	/*
	costs
		.append("text")
		.attr("class","tgauge")
		.attr("x",5)
		.attr("y",-15)
		.text(function(d){
			if(d.l_h!="") {
				return d.l_h;
			}
			return price_format(d.inflation_adjusted);
		})
	
	costs
		.append("text")
		.attr("class","tgauge description")
		.attr("x",-5)
		.attr("y",-15)
		.text(function(d){
			return (d.age=="modern"?d.culture_context+", ":"")+d.detail+" "+(d.gender_id!="b"?d.gender:"");
		})
	*/
	costs
		.append("circle")
		.attr("cy",function(d){
			return 0;
		})
		.attr("cx",0)
		.attr("r",8)
			

	
	var xAxis = d3.svg.axis()
					.orient("bottom")
					//.ticks(20, ",.1s$")
					.tickValues([1,10,100,1000,10000,100000])
					.tickFormat(price_format)
    				.scale(xscale)

    
	xaxis.call(xAxis);
	
	xaxis.append("text")
			.attr("x",-5)
			.attr("y",40)
			.text("Price of a life in history")
	xaxis.append("text")
			.attr("class","note")
			.attr("x",-5)
			.attr("y",54)
			.text("Prices in US $ (Inflation Adjusted)")
	xaxis.append("text")
			.attr("class","note")
			.attr("x",-5)
			.attr("y",68)
			.text("logarithmic scale")

	var lw=150;
	var legend=xaxis.append("g")
			.attr("id","legend")
			.attr("transform","translate("+(xscale.range()[1]-lw)+",85)");

	legend.append("line")
			.attr("x1",-10)
			.attr("y1",-10)
			.attr("x2",lw+10)
			.attr("y2",-10)
			.style("stroke-dasharray","1,5")

	legend.append("line")
			.attr("x1",0)
			.attr("y1",0)
			.attr("x2",lw)
			.attr("y2",0)
	legend.append("line")
			.attr("x1",0)
			.attr("y1",0)
			.attr("x2",0)
			.attr("y2",-10)
	legend.append("line")
			.attr("x1",lw)
			.attr("y1",0)
			.attr("x2",lw)
			.attr("y2",-10)
	legend.append("line")
			.attr("x1",lw/2)
			.attr("y1",0)
			.attr("x2",lw/2)
			.attr("y2",-6)

	legend.append("text")
			.attr("x",lw)
			.attr("y",11)
			.text("MIN");
	legend.append("text")
			.attr("x",0)
			.attr("y",11)
			.text("MAX");
	legend.append("text")
			.attr("x",lw/2)
			.attr("y",11)
			.text("MEDIAN");

	legend.append("circle")
			.attr("cx",lw*3/4)
			.attr("cy",-10)
			.attr("r",8)
	
	legend.append("text")
			.attr("x",lw*3/4)
			.attr("y",-20)
			.text("STORY");

	legend.append("text")
			.attr("x",-10)
			.attr("y",-30)
			.style("text-anchor","start")
			.text("HOW TO READ IT");	

	var ageLabels=yaxis.selectAll("g")
			.data(ages.map(function(d){return d.key}))
			.enter()
				.append("g")
				.attr("class","title")
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d)-5)+")"
				})
				.on("click",function(d){
					var $this=d3.select(this),
						selected=$this.classed("selected");

					ageLabels.classed("selected",false);

					$this.classed("selected",!selected);

					details.show(d);
				})

	ageLabels
			.append("rect")
			.attr("x",0)
			.attr("y",-20)
			.attr("width",200)
			.attr("height",40)

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
			.attr("id",function(d){
				return "title_"+d;
			})
			.attr("y",0)
			.attr("x",0)
			.text(function(d){
				return agesNames[d].name;
			})

	
	var plus=ageLabels
		.append("g")
		.attr("class","symbol")
		.attr("transform",function(d){
			var x=ageLabels.select("#title_"+d).node().getComputedTextLength()+18;
			return "translate("+x+",-6)"	
		});

	plus.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",8);

	plus.append("line")
			.attr("class","plus")
			.attr("x1",-4)
			.attr("x2",4)
			.attr("y1",0)
			.attr("y2",0);

	plus.append("line")
			.attr("class","plus")
			.attr("x1",0)
			.attr("x2",0)
			.attr("y1",-4)
			.attr("y2",4);

	plus.append("line")
			.attr("class","minus")
			.attr("x1",-4)
			.attr("x2",4)
			.attr("y1",0)
			.attr("y2",0);

	

	function DetailedView() {
		var current=null;
		var index=-1;
		var self=this;
		var DURATION=1000;
		var delta=0;

		

		var detailedCosts=detailed_cost_box.selectAll("g.detailed-cost")
				.data(function(d){
					return d.values.costs;
				})
				.enter()
				.append("g")
					.attr("class",function(d){
						return "detailed-cost  "+d.type; //hidden
					})
					.attr("rel",function(d){
						return d.inflation_adjusted+" , "+(xscale(d.inflation_adjusted));
					})
					.attr("transform",function(d,i){
						var x=xscale(d.inflation_adjusted);//xscale(1);//xscale(d.inflation_adjusted);
						var y=0;//20+i*7;//yscale(1);//1
						
						return "translate("+x+","+y+")";
					})
					.on("mouseover",function(d){
						costs
							.filter(function(c){
								//console.log(c.age,"==",d.age," && ",c.inflation_adjusted,"==",d.inflation_adjusted)
								return c.age==d.age && c.inflation_adjusted==d.inflation_adjusted && d.detail==c.detail;
							})
							.classed("hover",true)
							.each(function(c){
								showDialog(c);
							})
					})
					.on("mouseout",function(d){
						costs
							.classed("hover",false)
					})
					.on("click",function(d){
						dialog.el.classed("expanded",true);
					})

		detailedCosts
			.append("rect")
			.attr("x",function(d){
				return -xscale(d.inflation_adjusted);
			})
			.attr("y",-3)
			//.attr("width",WIDTH-margins.left-margins.right-padding.left-padding.right)
			.attr("width",function(d){
				return xscale(d.inflation_adjusted);
			})
			.attr("height",6)

		detailedCosts
			.append("rect")
			.attr("class","bg")
			.attr("x",function(d){
				return -xscale(d.inflation_adjusted);
			})
			.attr("y",-3)
			.attr("width",WIDTH-margins.left-margins.right-padding.left-padding.right)
			.attr("height",6)

		detailedCosts
			.append("circle")
			.attr("cy",0)
			.attr("cx",0)
			.attr("r",2)


		var l2t=detailedCosts
			.append("line")
			.attr("class","l2t")
			.attr("x1",0)
			.attr("y1",-4)
			.attr("x2",0)
			.attr("y2",0)

		var l2b=detailedCosts
			.append("line")
			.attr("class","l2b")
			.attr("x1",0)
			.attr("y1",4)
			.attr("y2",function(d){
				return (HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age));
			})
			.attr("x2",0);

		

		this.reset=function(callback) {

			var tmp_current=current;
			
			current=null;
			index=-1;
			delta=0;

			detailedCosts
				.filter(function(d){
					return d.age==tmp_current;
				})
				.transition()
				.duration(DURATION)
				.attr("transform",function(d,i){
					var x=xscale(d.inflation_adjusted);//xscale(1);//xscale(d.inflation_adjusted);
					var y=0;
					
					return "translate("+x+","+y+")";
				})
				.each("end",function(d,i){
					if(i===0) {
						svg.attr("height",HEIGHT)
						if(callback) {
							callback();
						}
					}
				})

			agesGroup
				.select(".detailed-costs")
				.classed("selected",false);

			agesGroup
				.transition()
				.duration(DURATION)
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d.key)+delta)+")";
				});
			costs
				.select("line.gauge")
				.attr("y2",function(d){
					return HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age);
				})
			costs
				.selectAll("text.gauge")
				.attr("y",function(d){
					return HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age)-5;
				})
			ageLabels
				.transition()
				.duration(DURATION)
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d)-5+delta)+")"
				})
			grid
				.transition()
				.duration(DURATION)
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d.key)+delta)+")"
				})
			xaxis
				.transition()
				.duration(DURATION)
				.attr("transform","translate("+(margins.left+padding.left)+","+(HEIGHT-margins.bottom+delta)+")")

			l2t
				.filter(function(d){
					return d.age==tmp_current;
				})
				.attr("y2",0);

			l2b
				.filter(function(d){
					return d.age==tmp_current;
				})
				.attr("y2",function(d){
					return (HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age));
				})

			illegalTypes.updatePaths(-1,0,DURATION)
		}

		this.getDelta=function(age) {
			console.log(delta)
			if(age && index>-1) {
				return (d3.keys(agesNames).indexOf(age)<=index)?delta:0;
			}
			return delta;
		}

		this.show=function(age) {

			if(current==age) {
				this.reset();
				return;
			}
			if(current) {
				this.reset(function(){
					self.show(age);
				});
				return;
			}

			current=age;
			index=-1;
			var group=null;

			

			agesGroup
				.select(".detailed-costs")
				.filter(function(d){
					return d.key==age;
				})
				.classed("selected",true);

			agesGroup
				.filter(function(d,i){
					if(index>-1 && i>index) {

						return 1;	
					}
					if(index==-1 && d.key==age) {
						index=i;
						group=d;
						delta=d.values.costs.length*7+10;

						delta=(delta<50)?50:delta;

						console.log("SELECTED",d)
						return 0;
					}
					return 0;
				})
				.transition()
				.duration(DURATION)
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d.key)+delta)+")";
				});

			svg.attr("height",HEIGHT+delta)

			costs
				.select("line.gauge")
				.attr("y2",function(d){
					var _delta=(d3.keys(agesNames).indexOf(d.age)<=index)?delta:0;
					return HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age)+_delta
				})
			costs
				.selectAll("text.gauge")
				.attr("y",function(d){
					var _delta=(d3.keys(agesNames).indexOf(d.age)<=index)?delta:0;
					return HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age)+_delta-5;
				})
			ageLabels
				.filter(function(d,i){
					if(i>index) {
						return 1;	
					}
					return 0;
				})
				.transition()
				.duration(DURATION)
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d)-5+delta)+")"
				})

			grid.
				filter(function(d,i){
					if(i>index) {
						return 1;	
					}
					return 0;
				})
				.transition()
				.duration(DURATION)
				.attr("transform",function(d){
					return "translate(0,"+(yscale(d.key)+delta)+")"
				})

			xaxis
				.transition()
				.duration(DURATION)
				.attr("transform","translate("+(margins.left+padding.left)+","+(HEIGHT-margins.bottom+delta)+")")


			detailedCosts
				.filter(function(d){
					return d.age==age;
				})
				.transition()
				.duration(DURATION)
				.attr("transform",function(d,i){
					var x=xscale(d.inflation_adjusted);//xscale(1);//xscale(d.inflation_adjusted);
					var y=20+i*7;//yscale(1);//1
					
					return "translate("+x+","+y+")";
				});

			l2t
				.filter(function(d){
					return d.age==age;
				})
				.attr("y2",function(d,i){
					return -(20+i*7);
				});

			l2b
				.filter(function(d){
					return d.age==age;
				})
				.attr("y2",function(d,i){

					
					var h=(HEIGHT-margins.bottom+delta)-yscale(d.age),
						dy=h -  (20+i*7) - margins.top - padding.top;

					//console.log("############", h -  (20+i*7) - margins.top - padding.top)

					return dy;//delta-(20+i*7)+padding.top+margins.top;
					//return (HEIGHT-margins.bottom-margins.top-padding.top-yscale(d.age));
				})

			illegalTypes.updatePaths(index,delta,DURATION)
		}
	}

	var details=new DetailedView();

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

		var selected=0;

		var type_paddings={
			top:-10,
			bottom:40,
			left:40,
			right:20
		}

		var type_margins={
			top:margins.top+type_paddings.top,
			bottom:margins.bottom+type_paddings.bottom,
			left:type_paddings.left,
			right:margins.right+type_paddings.right
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
				name:"labour"
			},
			{
				id:"law",
				name:"Blood Money"
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

		var type_yscale=d3.scale.ordinal()
  				.domain(types.map(function(d){return d.id}))
  				.rangePoints([0,HEIGHT-(type_margins.top+type_margins.bottom)]);


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
  										return "translate(0,"+type_yscale(d.id)+")";
  									})
  									.on("click",function(d){
  										
  										if(selected==d.id) {
  											selected=null;
  											highlightCosts();
  											highlightPaths()
  										} else {
  											selected=d.id;
  											highlightCosts();
  											highlightPaths();
  											highlightCosts(d.id);
  											highlightPaths(d.id);
  										}
  										
  									})

  		types_boxes.append("rect")
  						.attr("x",0)
  						.attr("y",-20)
  						.attr("width",120)
  						.attr("height",30)
  						.style("fill-opacity",0)

  		types_boxes.append("text")
  						.attr("x",0)
  						.attr("y",0)
  						.text(function(d){
  							return d.name;
  						})

  		types_boxes.append("rect")
  						.attr("x",0)
  						.attr("y",10)
  						.attr("width",100)
  						.attr("height",2)

  		var types_connections=svg.append("g")
  							.attr("id","connections")
  							.attr("transform","translate("+type_margins.left+","+(type_margins.top+10)+")");

  		function getPath(x0,y0,x1,y1) {
  			//return "M"+x0+","+y0+"L"+x1+","+y1;
  			x0=Math.round(x0);
  			x1=Math.round(x1);
  			y0=Math.round(y0);
  			y1=Math.round(y1);

  			var path="M"+x0+","+y0;

  			path+="C"+((x0+x1)/2)+","+y0+","+((x0+x1)/2)+","+y1+","+x1+","+y1;

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
  								var p=getPath((100),type_yscale(d.from)+1,(margins.left+padding.left-type_margins.left),(yscale(d.to)+padding.top));
  								//console.log(d.from,d.to,p)
  								return p;
  							})

  		function highlightPaths(t) {
  			if(!t) {
				types_connections
					.selectAll("path")
					.classed("dimmed",false);
				types_boxes
					.classed("dimmed",false);
				return;
			}
			types_connections
				.selectAll("path")
				.filter(function(d){
					return d.from!=t;
				})
				.classed("dimmed",true);

			types_boxes
					.filter(function(d){
						console.log("@@@@@@@@@@@@@@@@@@@",t,d.id)
						console.log(this)
						return d.id!=t;
					})
					.classed("dimmed",true);
  		}
  		this.updatePaths=function(index,delta,duration) {



  				types_connections.selectAll("path")
  						.transition()
  						.duration(duration)
						.attr("d",function(d,i){

							var age_index=d3.keys(agesNames).indexOf(d.to);

							var p=getPath((100),type_yscale(d.from)+1,(margins.left+padding.left-type_margins.left),(yscale(d.to)+padding.top+(age_index>index?delta:0)));
							//console.log(d.from,d.to,p)
							return p;
						})
  		}
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

	//var story=new Story();
	//story.showStories();


})