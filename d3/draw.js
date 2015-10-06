//Changable variables
//relative to size
var svg_size = [500, 500],
    center = [0.5, 0.5];
//abs
//var gap = 0.1, // gap for new year
var gap = 0.016, // gap for new year
	//angle_newyear = -Math.PI / 2,
	angle_newyear = 0,
	R = 0.4*svg_size[0], // outer radius
	r = R/12; // inner radius
var date_font_size = 1*svg_size/500;
//others
var dates_span = [new Date(2016, 0, 1), new Date(2016, 11, 31)];
//var font_family = "Sorren Ex SemiBold";
var font_family = "Ubuntu Mono";
//font-family: 'Sorren Ex Bold'
//font-family: 'Sorren Ex Medium'

//processing some vars
r *= (1-gap) // gap couse inner radius to be smaller
var d = 0.5*r;// drawing point distance

//helpers
var cos = Math.cos, sin = Math.sin;
var pi = Math.PI;





// Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// for hypotrochoid finds couple [theta, ro] for given psi (angle to rolling circle)
// takes angle psi in radians
// returns theta (angle to point) and ro (distance to point)
//
function psi2thetaRo(psi){
	//var shift = Math.PI*(gap/2);
  var shift = 0;
	x =  ((R-r)*sin(psi  + shift ) + d*sin((R-(r))*psi/(r)  - shift  - pi));
	y = -(R-r)*cos(psi  + shift )
		+ d*cos((R-(r))*psi/(r)  - shift  - pi);
  var theta = Math.atan2(x,y);
  var ro = Math.sqrt(x*x+y*y);
  return [theta, ro];
}

// finds item in array [theta, ro] with theta closest to num
// takes num and arr (sorted by theta!)
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

// for hypotrochoid finds ro by theta (distance to point by angle)
// takes theta
// returns ro (wow)
function theta2ro(theta){
  var closestArrayItemIndex = closest(theta, hypotrochoidArray.map(function(d){
    return d[0];
  }));
  return hypotrochoidArray[closestArrayItemIndex][1];
}





// Arrays
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// fill hypotrochoidArray with extra detailed ro(psi) hyportohoid data
// and use it later for interpolation in ro(theta)
var hypotrochoidArray = d3.range(0, pi*2, 0.001).map(psi2thetaRo);
// data in hypotrochoidArray is extradetailed now. 
// We'll keep just 365 points we need
hypotrochoidArray = d3.range(-pi*(1-2*gap), pi, 0.01)
  .map(function(theta){
    return [theta, theta2ro(theta)];
  });

// date array
//var date_format = d3.time.format("%B %d");
var dateFormatDate = d3.time.format("%-d");
var dateFormatDay = d3.time.format("%A");
//var dateFormatMonth = d3.time.format("%B");
var dateFormatMonth = d3.time.format("%-m");
var dates = d3.time.scale()
	.domain(dates_span)
	.ticks(d3.time.days, 1)
  .map(function(d){
    return {
      date: dateFormatDate(d), 
      weekend: (dateFormatDay(d) == "Saturday" || dateFormatDay(d) == "Sunday"), 
      month: dateFormatMonth(d),
    };
  });
var datesString = dates.map(function(d){return d.date;}).join(" ");

//console.log(dates);
//var scale_date_angle = d3.scale.linear()
	//.domain(dates_span)
  //.range([-pi*(1-2*gap), pi]);
//dates = dates.map(function(i){
	//return {date: i, angle: scale_date_angle(i)};
//});
//var dates_num = dates.map(function(d){
    //return date_format_num(d.date);
//}).join(" ");
//console.log(dates_num);





// Drawing SVG
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// SVG
var svg = d3.select("body")
	.append("svg")
	.attr({
		width: svg_size[0],
		height: svg_size[1]	
	});
// Helper circle
svg.append("circle")
	.attr({
		cx: svg_size[0]*center[0],
		cy: svg_size[1]*center[1],
		r: R
	})
	.classed("circle", true);
// Whole calender will be stored in this var
var calendar = svg.append("g")
	.attr("transform", 
		"translate("
		+ svg_size[0]*center[0] 
    + "," 
    + svg_size[1]*center[1]
		+ ") rotate("
		+ (angle_newyear + 2*pi*gap/2)*180/pi
		+ ")");

// Text objects
var text_dates = calendar.append("g")
  .classed("text-dates", true);
var text_monthes = calendar.append("g")
  .classed("text-monthes", true);
//var date_g = text_dates.selectAll("g.date")
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
  .text(datesString);





// Render
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Draw hypotrochoid path
var line = d3.svg.line();
var hypotrochoid = calendar.append("path")
  .classed("calendar-shape", true)
  .attr({
    d: line(hypotrochoidArray.reverse().map(function(d){return [d[1]*sin(d[0]), d[1]*cos(d[0])]})),
    id: "hypotrochoid",
  });

// Now 
// Measure path length
var hypotrochoidLength = hypotrochoid.node().getTotalLength();
// should be measures after fonts are loaded
var textTmpLength = textTmp.node().getComputedTextLength();
//textTmp.remove();

calendar.append("text")
  .append("textPath")
  .attr("xlink:href","#hypotrochoid")
  .style("font-size", hypotrochoidLength/textTmpLength)
  .style("font-family", font_family)
  .text(datesString);
////just for test and refreshing memory: add some circles to path.
//calendar.selectAll("circle")
  //.data(hypotrochoidArray)
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
// Point do start polar coordinates
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
