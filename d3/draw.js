//Changable variables
//relative to size
var svg_size = [500, 500],
    center = [0.5, 0.5];
//abs
//var gap = 0.1, // gap for new year
var gap = 0.04, // gap for new year
	//angle_newyear = -Math.PI / 2,
	angle_newyear = 0,
	R = 0.4*svg_size[0], // outer radius
	r = R/12; // inner radius
var date_font_size = 1*svg_size/500;
//others
var dates_span = [new Date(2016, 0, 1), new Date(2016, 11, 31)];
var date_format = d3.time.format("%B %d");
var date_format_num = d3.time.format("%_d");
var font_family = "Sorren Ex SemiBold";
//var font_family = "Ubuntu Mono";
//font-family: 'Sorren Ex Bold'
//font-family: 'Sorren Ex Medium'

//processing some vars
r *= (1-gap) // gap couse inner radius to be smaller
var d = 0.5*r;// drawing point distance

//helpers
var cos = Math.cos, sin = Math.sin;
var pi = Math.PI;

// finding point on hypotrachoid for an angle
// takes angle in radians
// returns theta (angle to point) and ro (distance to point)
//
function psi2thetaRo(psi){
	//var shift = Math.PI*(gap/2);
  shift = 0;
	x =  ((R-r)*sin(psi  + shift ) + d*sin((R-(r))*psi/(r)  - shift  - pi));
	y = -(R-r)*cos(psi  + shift )
		+ d*cos((R-(r))*psi/(r)  - shift  - pi);
  var theta = Math.atan2(x,y);
  return [theta, Math.sqrt(x*x+y*y)];
}

// We fill rawArray with extra detailed ro(psi) hyportohoid data
// and use it later for interpolation in ro(theta)
var rawArray = d3.range(0, pi*2, 0.001).map(psi2thetaRo);
console.log(rawArray[400]);

// finds item in array [theta, ro] with theta closest to num
// takes num and arr (sorted by theta)
// returns array index
function closest (num, arr) {
    var curr = arr[0];
    var index = 0;
    var diff = Math.abs (num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
            index = val;
        }
    }
    return index;
}

function theta2ro(theta){
  //interpolating rawArray to find nearest to angle point
  var closestArrayItemIndex = closest(theta, rawArray.map(function(d){
    return d[0];
  }));
  return rawArray[closestArrayItemIndex][1];
}

// date array
//
var dates = d3.time.scale()
	.domain(dates_span)
	.ticks(d3.time.days, 1);
var scale_date_angle = d3.scale.linear()
	.domain(dates_span)
  .range([-pi*(1-2*gap), pi]);
dates = dates.map(function(i){
	return {date: i, angle: scale_date_angle(i)};
});
var dates_num = dates.map(function(d){
    return date_format_num(d.date);
}).join(" ");
//console.log(dates_num);

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
		+ ")");
var dates_text = calendar.append("g")
  .classed("dates-text", true);
//var date_g = dates_text.selectAll("g.date")
  //.data(dates)
  //.enter()
  //.append("g")
  //.attr("transform", function(d){ 
    //var rotation = (d.angle-2*pi*gap)*180/pi + 90;
    //// TODO Arrrr, why this works?
    //return "rotate("+ rotation +")"; 
  //})
  //.classed("date", true)
  //.append("text")
  //.text(function(d){
    //return date_format(d.date);
  //})
  //.attr({
    //x: function(d){
      //return theta2ro(d.angle);
    //},
    //y: 0
  //});

// Test text string to get to know font-size for calendar
var textTmp = calendar.append("text")
  .style("font-size", "1px")
  .style("font-family", font_family)
  .text(dates_num);

function render(){
  var textTmpLength = textTmp.node().getComputedTextLength();
  //textTmp.remove();

  var points = d3.range(-pi*(1-2*gap), pi, 0.01)
    .map(function(theta){
      return [theta, theta2ro(theta)];
    });
	var line = d3.svg.line();

  // Take path length
  var hypotrochoid = calendar.append("path")
    .classed("calendar-shape", true)
    .attr({
      d: line(points.reverse().map(function(d){return [d[1]*sin(d[0]), d[1]*cos(d[0])]})),
      id: "hypotrochoid",
    });
  var hypotrochoidLength = hypotrochoid.node().getTotalLength();

  calendar.append("text")
    .append("textPath")
    .attr("xlink:href","#hypotrochoid")
    .style("font-size", hypotrochoidLength/textTmpLength)
    .style("font-family", font_family)
//font-family: 'Sorren Ex Bold'
    .text(dates_num);
  ////just for test and refreshing memory: add some circles to path.
  //calendar.selectAll("circle")
    //.data(points)
    //.enter()
    //.append("circle")
    //.attr({
      //cx: function(d){
        //console.log(d[0]);
        //return d[1]*sin(d[0]);
      //},
      //cy: function(d){
        //return d[1]*cos(d[0]);
      //},
      //r: 0.4,
      //fill: "red"
    //});
  //calendar.append("circle")
    //.attr({
      //cx: function(d){
        //return R*sin(0);
      //},
      //cy: function(d){
        //return R*cos(0);
      //},
      //r: 2,
      //fill: "red"
    //});
}

//render();
