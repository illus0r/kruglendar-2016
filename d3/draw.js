//Changable variables
//relative to size
var svg_size = [500, 500],
    paddings = [0.1, 0.1, 0.1, 0.1],
    center = [0.5, 0.5];
//abs
var gap = 0.1, // gap for new year
	//angle_newyear = -Math.PI / 2,
	angle_newyear = 0,
	R = 0.4*svg_size[0],
	r = R/12; // inner radius
var date_font_size = 1*svg_size/500;
//others
var dates_span = [new Date(2016, 0, 1), new Date(2016, 11, 31)];
var date_format = d3.time.format("%B %d");

//processing some vars
r *= (1-gap) // gap couse inner radius to be smaller
var d = 0.5*r;// drawing point distance

//helpers
var cos = Math.cos, sin = Math.sin;
var pi = Math.PI;


// finding point on hypotrachoid for an angle
// takes angle in radians
// returns two points for [x, y]
//
function hypotrochoid(alpha){
	var shift = Math.PI*2*(gap/2);
	//shift = 0;
	x =  (R-r)*sin(alpha /* + shift */)
		+ d*sin((R-(r))*alpha/(r) /* - shift */ - pi);
	y = -(R-r)*cos(alpha /* + shift */)
		+ d*cos((R-(r))*alpha/(r) /* - shift */ - pi);
	//x = R*cos(alpha) + svg_size[0]*center[0];
	//y = R*sin(alpha) + svg_size[1]*center[1];
	return [x, y];
}

// date array
//
var dates = d3.time.scale()
	.domain(dates_span)
	.ticks(d3.time.days, 1);
var scale_date_angle = d3.scale.linear()
	.domain(dates_span)
	.range([0, 2*pi*(1-gap)]);
dates = dates.map(function(i){
	//console.log([i, scale_date_angle(i)]);
	return {date: i, angle: scale_date_angle(i)};
});
//console.log(dates);

var svg = d3.select("body")
	.append("svg")
	.attr({
		width: svg_size[0],
		height: svg_size[1]	
	});
svg.append("circle")
	.attr({
		cx: svg_size[0]*center[0],
		cy: svg_size[1]*center[1],
		r: R
	})
	.classed("circle", true);
var calendar = svg.append("g")
	.attr("transform", 
		"translate("
		+ svg_size[0]*center[0] + "," + svg_size[1]*center[1]
		+ ") rotate("
		+ (angle_newyear + 2*pi*gap/2)*180/pi
		+ ")")
var dates_text = calendar.append("g")
	.classed("dates-text", true);
var date_g = dates_text.selectAll("g.date")
	.data(dates)
	.enter()
	.append("g")
	//.attr("transform", "rotate("+pi/2*180/pi+")")
	.attr("transform", function(d){ return "rotate("+ (d.angle-pi/2)*180/pi +")"; })
	.classed("date", true)
	.append("text")
	.text(function(d){
		return date_format(d.date);
	})
	//.style({
		//'font-size': date_font_size,
	//})
	.attr({
		x: function(d){
			var x = hypotrochoid(d.angle)[0];
			var y = hypotrochoid(d.angle)[1];
			console.log(x + " " + y);
			return Math.sqrt(x*x+y*y);
		},
		y: 0
	});



function render(){
	// calendar shape
	var points = d3.range(0, Math.PI*2*(1-gap), 0.01)
		.map(hypotrochoid);
	var line = d3.svg.line();
		//.x()
		//.y()
	calendar.append("path")
		.classed("calendar-shape", true)
		.attr({
			d: line(points),
		});
  //just for test and refreshing memory: add some circles to path.
  calendar.selectAll("circle")
    .data(points)
    .enter()
    .append("circle")
    .attr({
      cx: function(d){
        return d[0];
      },
      cy: function(d){
        return d[1];
      },
      r: 0.5
    });
}

render();
