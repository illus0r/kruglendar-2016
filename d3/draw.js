//all available variables
//relative to size
var svg_size = [500, 500];
var paddings = [0.1, 0.1, 0.1, 0.1];
var center = [0.5, 0.5];
//abs
var R = 0.4*svg_size[0];
//helpers
var cos = Math.cos, sin = Math.sin;
function hypotrochoid(alpha){
	r = R/12; // inner radius
	d = 0.5*r;// drawing point distance
	x = (R-r)*cos(alpha)+d*cos((R-(r))*alpha/(r)) + svg_size[0]*center[0];
	y = (R-r)*sin(alpha)-d*sin((R-(r))*alpha/(r)) + svg_size[1]*center[1];
	return [x, y];
}


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
		r: R,
		opacity: 0.1
	});


var points = d3.range(0, Math.PI*2, 0.01).map(hypotrochoid);
console.log(points);
var line = d3.svg.line();
	//.x()
	//.y()
svg.append("path")
	.attr({
		d: line(points)
	});
