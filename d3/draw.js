//Changable variables
//relative to size
var svg_size = [2104.72, 2979.92],
    center = [0.5, 0.5];
//abs
//var gap = 0.1, // gap for new year
var gap = 0.016, // gap for new year
//var gap = 1/10., // gap for new year
	//angle_newyear = -Math.PI / 2,
	angle_newyear = 0,
	R = 0.4*svg_size[0], // outer radius
	r = R/12; // inner radius
var date_font_size = 1*svg_size/500;
//others
var datesSpan = [new Date(2016, 0, 1), new Date(2016, 11, 31)];
//var fontFamily = "Sorren Ex SemiBold";
//var fontFamily = "Antonio";
var fontFamily = "Antonio";
var fontWeight = "Light";
//var fontFamily = "Ubuntu Mono";
//var fontFamily = "Times New Roman";
//var fontFamily = "msam10";
//font-family: 'Sorren Ex Bold'
//font-family: 'Sorren Ex Medium'

//helpers
var cos = Math.cos, sin = Math.sin;
var pi = Math.PI;

//processing some vars
r *= (1-gap) // gap cause inner radius to be smaller
//var r2 = 0.18*r;// drawing point distance
var r2 = 0.28*r;// drawing point distance
var hypotrochoidAngleSpan = 2*pi*(1-gap);





// Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// for hypotrochoid finds couple [theta, ro] for given psi (angle to rolling circle)
// takes angle psi in radians
// returns theta (angle to point) and ro (distance to point)
//
function psi2thetaRo(psi){
  //var shift = Math.PI*2*0.3;
  var shift = 0;
	x =  (R-r)*sin(psi+shift) 
      + r2 * sin( (R-r)*psi/r - shift - pi );
	y = -(R-r)*cos(psi+shift)
		  + r2 * cos( (R-r)*psi/r - shift - pi );
  var theta = Math.atan2(x,y);
  theta = pi - theta;
  if (theta<0){
    theta = theta + 2*pi;
  }
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

// fill hypotrochoidArray with extra detailed ro(psi) hyportohoid data
// and use it later for interpolation in ro(theta)
// TODO not in the right place
var hypotrochoidArrayRaw = d3.range(0.0001, hypotrochoidAngleSpan, 0.001).map(psi2thetaRo);

// for hypotrochoid finds ro by theta (distance to point by angle)
// uses ready array of hypotrochoid points hypotrochoidArrayRaw
// takes theta
// returns ro (wow)
function theta2ro(theta){ // TODO Ты неправильно работаешь, шайтан
  var closestArrayItemIndex = closest(theta, hypotrochoidArrayRaw.map(function(d){
    return d[0];
  }));
  //var d = Math.abs(theta-hypotrochoidArrayRaw[closestArrayItemIndex][0]);
  //if (d>0.01){
  //}
  return hypotrochoidArrayRaw[closestArrayItemIndex][1];
}





//
//          AAAAAA
//          A    A
//          A    A
//          AAAAAA
//          A    A
//
//
// Arrays
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//// Preloading fonts
//var textTmp = d3.select("body").append("svg").classed("tmp", true).append("text")
  //.style("font-size", "10px")
  //.style("font-family", fontFamily)
  //.text("hello")
  //.attr("y","10");


function draw(){
  

  //hypotrochoidArrayRaw.map(function(d){
  //});
  //hypotrochoidArrayRaw = hypotrochoidArrayRaw.sort(function(a,b){if(a[0]<b[0]){return 1;} else{if(a[0]>b[0]){return -1;} else return 0;}});
  //hypotrochoidArrayRaw = hypotrochoidArrayRaw.reverse();
  // data in hypotrochoidArray is extradetailed now. 
  // We'll keep just 365 points we need
  var hypotrochoidArray = hypotrochoidArrayRaw;
  //hypotrochoidArray = d3.range(-pi*(1-2*gap), pi, 0.01)
  //var hypotrochoidArray = d3.range(0, hypotrochoidAngleSpan, 0.01)
    //.map(function(theta){
      //return [theta, theta2ro(theta)];
    //});

  // date array
  //var date_format = d3.time.format("%B %d");
  var dateFormatDate = d3.time.format("%-d");
  var dateFormatDay = d3.time.format("%A");
  //var dateFormatMonth = d3.time.format("%B");
  var dateFormatMonth = d3.time.format("%-m");
  //var datesString = dates.map(function(d){return d.date;}).join(" ");
  var datesString = "";
  var dates = d3.time.scale()
    .domain(datesSpan)
    .ticks(d3.time.days, 1)
    .map(function(d){
      var date = dateFormatDate(d).toString() + ""; 
      // text object for measuring
      var textTmp = d3.select("body")
        .append("svg")
        .classed("tmp", true)
        .append("text")
        .attr({
          style: function(d){
            return "font-size:1px; font-family:"+ fontFamily +";text-anchor:begin;font-weight:"+ fontWeight +";";
          }
        })
        .text(datesString);
        //.text(date.toString());
        //.text("0");
      var textTmpLength = textTmp.node().getComputedTextLength();
      d3.selectAll("svg.tmp").remove();
      datesString += date.toString() + "_"; // TODO
      return {
        theta: textTmpLength, // will be converted to radians after this map is over
        date: date, 
        weekend: (dateFormatDay(d) == "Saturday" || dateFormatDay(d) == "Sunday"), 
        month: dateFormatMonth(d),
      };
    });
  //normalizing theta for every date
  var datesStringLength = dates[dates.length-1].theta;
  dates.map(function(d){
    d.theta = hypotrochoidAngleSpan * d.theta/datesStringLength;
  });

  //var scale_date_angle = d3.scale.linear()
    //.domain(datesSpan)
    //.range([-pi*(1-2*gap), pi]);
  //dates = dates.map(function(i){
    //return {date: i, angle: scale_date_angle(i)};
  //});
  //var dates_num = dates.map(function(d){
      //return date_format_num(d.date);
  //}).join(" ");





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
      + ")"
      + " rotate("
      + (angle_newyear + 2*pi*gap/2)*180/pi
      + ")"
      );

  // Text objects
  var text_dates = calendar.append("g")
    .classed("text-dates", true);
  var text_monthes = calendar.append("g")
    .classed("text-monthes", true);
  var date_g = text_dates.selectAll("g.date")
    .data(dates)
    .enter()
    .append("g")
    .attr("transform", function(d){
      //var rotation = (d.angle-2*pi*gap)*180/pi + 90;
      var rotation = d.theta * 180/pi;
      // TODO Arrrr, why this works?
      return "rotate("+ rotation +")"; 
    })
    .classed("date", true)
    //.append("circle")
    //.attr({
      //cx: 0,
      //cy: function(d){
        //return -theta2ro(d.theta);
      //},
      //r: 0.4,
      //fill: "red"
    //})
    //;
    .append("text")
    .text(function(d){
      return d.date;
    })
    .attr({
      x: 0,
      fill: function(d){ if(d.weekend) { return "red"; } else{ return "black"; } },
      y: function(d){
        return -theta2ro(d.theta);
      },
      style: function(d){
        var fontSizeKoef = 1.0;
        //var fontSize = fontSizeKoef * R * hypotrochoidAngleSpan / datesStringLength;
        var fontSize = fontSizeKoef * (R-r2) * hypotrochoidAngleSpan / datesStringLength;
        console.log("fontSize = " + fontSize);
        //decoration = (d.weekend)? "underline" : "none";
        decoration = "none";
        //weight = (d.weekend)? "normal" : "bold";
        return "font-size:"+ fontSize +"px; "
              +"font-family:"+ fontFamily +";"
              +"text-anchor:begin;"
              +"font-weight:"+ fontWeight +";"
              //+"border-bottom: 3px solid black;"
              +"text-decoration: "+ decoration +";";
      }
    });

  var svgExtra = svg.append("g")
    .classed("extra", true);
  svgExtra.append("text")
    .text("Kruglendar")
    .attr({
      style: "text-anchor: middle;font-size: 16px; font-family:"+fontFamily+";",
      x: svg_size[0]*(0.5),
      y: svg_size[1]*(0.495)
    }); 
  svgExtra.append("text")
    .text("2016")
    .attr({
      style: "text-anchor: middle;font-size: 40px; font-family:"+fontFamily+";",
      x: svg_size[0]*(0.5),
      y: svg_size[1]*(0.51)
    });

  // Test text string to get to know font-size for calendar
  //var textTmp = calendar.append("text")
    //.style("font-size", "1px")
    //.style("font-family", fontFamily)
    //.text(datesString);





  // Render
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  //// Draw hypotrochoid path
  //var line = d3.svg.line();
  //var hypotrochoidRaw = calendar.append("path")
    //.classed("calendar-shape", true)
    //.attr({
      //d: line(hypotrochoidArrayRaw.map(function(d){return [d[1]*sin(d[0]), d[1]*cos(d[0])]})),
      //id: "hypotrochoidRaw",
      //style: "opacity: 0.09; stroke-width: 5px;"
    //});
  //var hypotrochoid = calendar.append("path")
    //.classed("calendar-shape", true)
    //.attr({
      //d: line(hypotrochoidArray.map(function(d){return [d[1]*sin(d[0]), d[1]*cos(d[0])]})),
      //id: "hypotrochoid",
    //});

  // Now 
  // Measure path length
  //var hypotrochoidLength = hypotrochoid.node().getTotalLength();
  // should be measures after fonts are loaded
  //var textTmpLength = textTmp.node().getComputedTextLength();
  //textTmp.remove();

  //// text by path
  //calendar.append("text")
    //.append("textPath")
    //.attr("xlink:href","#hypotrochoid")
    //.style("font-size", hypotrochoidLength/textTmpLength)
    //.style("font-family", fontFamily)
    //.text(datesString);

  ////just for test and refreshing memory: add some circles to path.
  //calendar.selectAll("circle")
    //.data(hypotrochoidArray)
    //.enter()
    //.append("circle")
    //.attr({
      //cx: function(d){
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
}

draw();
