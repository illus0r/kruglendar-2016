//Changable variables
//relative to size
var svg_size = [2104.72, 2979.92],
    center = [0.5, 0.5];
//abs
//var gap = 0.1, // gap for new year
var gap = 0.01, // gap for new year
//var gap = 1/10., // gap for new year
	angle_newyear = 0,
	R = 0.4*svg_size[0], // outer radius
	r = R/12; // inner radius
var monthes_font_size = 1*svg_size[1]/150;
//others
var datesSpan = [new Date(2016, 0, 1), new Date(2016, 11, 31)];
var fontFamily = "Sorren Ex Medium";
var fontFamilyWeekend = "Sorren Ex Bold";
var dateSeparator = 0.00004*svg_size[0];
//var fontFamily = "Antonio";
//var fontFamily = "Varicka"; // TODO the best
//var dateSeparator = "-"; // for Varicka
//var fontFamily = "Higherup";
//var fontFamily = "HFF Jammed Pack"; // unreadable
//var fontFamily = "Xenophobia";
//var fontWeight = "Light";
var fontWeight = "normal";
var fontWeightWeekend = "normal";
//var fontFamily = "msam10";
//font-family: 'Sorren Ex Bold'
//font-family: 'Sorren Ex Medium'

//helpers
var cos = Math.cos, sin = Math.sin;
var pi = Math.PI;

//processing some vars
r *= (1-gap) // gap cause inner radius to be smaller
//var r2 = 0.18*r;// drawing point distance
//var r2 = 0.28*r;// drawing point distance
var r2 = 0.5*r;// drawing point distance
var hypotrochoidAngleSpan = 2*pi*(1-gap);





// Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// for hypotrochoid finds couple [theta, ro] for given psi (angle to rolling circle)
// takes angle psi in radians
// takes 
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
  return hypotrochoidArrayRaw[closestArrayItemIndex][1];
}

function pos2ro(pos){
  var theta = pos * 2*pi * (1-gap) / 12;
  return theta2ro(theta);
}

// we replace hypotrochoid with trochoid.
// takes relative day in month position 
// ex. first day of the month is 0, last one is 1, middle one is 0.5
// returns ro (distance to point of hypotrochoid)
//function trochoid(pos){
  //if (pos > 0.5){
    //pos = 1 - pos;
  //}
  //pos *= pi;
  //// fooplot
  //// 69.45*acos((69.45-s)/19.44)-19.44*sqrt(1-((69.45-s)/19.44)^2)
  ////var y = r  * Math.acos( (r-pos)/r2 ) - //TODO this is greater than 1 sometimes
          ////r2 * Math.sqrt( 1 - Math.pow( (r-pos)/r2 , 2 ) );
  ////y /= 10;
  //y = R-r2*1.8*Math.sin(pos);
  //return y;
//}




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



function draw(){
  // data in hypotrochoidArray is extradetailed now. 
  // We'll keep just 365 points we need
  var hypotrochoidArray = hypotrochoidArrayRaw;

  var rainbow = [ 
    [  0, 248, 193],
    [  0, 246, 0  ],
    [239, 194, 0  ],
    [255, 0, 0    ],
    [255, 0, 210  ],
    [  0, 211, 255],
    [  0, 254, 255] ]
    .map( function(rgb){
      return d3.rgb(rgb[0], rgb[1], rgb[2]);
    });
  var colorScale = d3.scale.linear()
    .domain(d3.range(0, 1, 1.0 / (rainbow.length - 1)))
    .range(rainbow);

  // date array
  var dateFormatDate = d3.time.format("%-d");
  var dateFormatDay = d3.time.format("%A");
  var dateFormatMonth = d3.time.format("%-m");
  var dateFormatMonthName = d3.time.format("%B");
  var datesStringLength = 0;
  var dates = d3.time.scale()
    .domain(datesSpan)
    .ticks(d3.time.days, 1)
    .map(function(d){
      // text object for measuring
      var dateString = dateFormatDate(d).toString(); 
      var isWeekend = false;
      if (dateFormatDay(d) == "Saturday" || dateFormatDay(d) == "Sunday"){
        isWeekend = true;
      } 
      var fontFamilyCurrentDay = (isWeekend)?fontFamilyWeekend:fontFamily;
      var fontWeightCurrentDay = (isWeekend)?fontWeightWeekend:fontWeight;
      var textTmp = d3.select("body")
        .append("svg")
        .classed("tmp", true)
        .append("text")
        .attr({
          style: function(d){
            return "font-size:1px;"+
              "font-family:"+ fontFamilyCurrentDay +";"+
              "font-weight:"+ fontWeightCurrentDay +";"+
              "text-anchor:begin;"+
              "";
          }
        })
        .text(dateString);
      var textTmpLength = textTmp.node().getComputedTextLength();
      d3.selectAll("svg.tmp").remove();
      datesStringLength += textTmpLength + dateSeparator; // TODO
      return {
        theta: datesStringLength, // will be converted to radians after this map is over
        date: dateString, 
        weekend: isWeekend, 
        month: dateFormatMonth(d),
        monthName: dateFormatMonthName(d),
        color: "red",
      };
    });
  //normalizing theta for every date
  //var datesStringLength = dates[dates.length-1].theta;
  dates.map(function(d){
    d.theta = hypotrochoidAngleSpan * d.theta/datesStringLength;
    d.color = colorScale(d.theta/(2*pi*(1-gap)))
  });

  var previousLen = 0;
  var monthes = d3.nest()
  .key(function(d){ return d.month; })
  .entries(dates)
  .map(function(d){
    var pLen = previousLen; //temp value
    previousLen += d.values.length;
    var color = colorScale((pLen+d.values.length/2)/dates.length);
    return {
      monthName: d.values[0].monthName,
      lenRelative: d.values.length / dates.length,
      previousLenRelative: pLen / dates.length,
      color: color,
      values: d.values,
    }; 
  });


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


  var text_dates = calendar.append("g")
    .classed("text-dates", true);
  var month_g;

  for (m of monthes){
    month_g = text_dates
      .append("g")
      .classed(m.monthName, true);
    var tBeg = m.values[0].theta;
    var tEnd   = m.values[m.values.length-1].theta;

    var colorScaleMonth = d3.scale.linear()
      .domain([1,0])
      .range ([m.values[0].color, m.values[m.values.length-1].color]);
    m.values = m.values.map( function(d){
      var t = d.theta;
      d.color = colorScaleMonth((t-tBeg)/(tEnd-tBeg));
      return d;
    });
  

    var dates_g = month_g.selectAll("g.date")
      .data(m.values)
      .enter()
      .append("g")
      .attr("transform", function(d){
        var rotation = d.theta * 180/pi;
        return "rotate("+ rotation +")"; 
      })
      .classed("date", true)
      .append("text")
      .text(function(d){
        return d.date;
      })
      .attr({
        "class": function(d){ if(d.weekend) { return "weekend"; } else{ return "weekday"; } },
        x: 0,
        y: function(d){
          var tBeg = m.values[0].theta;
          var tEnd   = m.values[m.values.length-1].theta;
          var t = d.theta;
          return -pos2ro( (t-tBeg)/(tEnd-tBeg) );
        },
        style: function(d){
          var fontSizeKoef = 1.0;
          var fontSize = fontSizeKoef * (R-r2) * hypotrochoidAngleSpan / datesStringLength;
          var fontFamilyCurrentDay = (d.weekend)?fontFamilyWeekend:fontFamily;
          var fontWeightCurrentDay = (d.weekend)?fontWeightWeekend:fontWeight;
          decoration = "none";
          //decoration = (d.weekend)? "underline" : "none";
          //weight = (d.weekend)? "normal" : "bold";
          return "font-size:"+ fontSize +"px; "
                +"font-family:"+ fontFamilyCurrentDay +";"
                +"text-anchor:begin;"
                +"font-weight:"+ fontWeightCurrentDay +";"
                //+"fill:"+ d.color +";"
                +"fill:"+ m.color +";"
                +"text-decoration: "+ decoration +";";
        }
      });

  }

  var arc = d3.svg.arc()
    .innerRadius(R)
    .outerRadius(R)
    .startAngle(-pi/4)
    .endAngle(pi/4);
  var text_monthes = calendar.append("g")
    .classed("text-monthes", true);
  var monthesPath = text_monthes.append("path")
    .attr({
      d: arc,
      fill: "none",
      stroke: "none",
      id: "monthesPath"
    });
  var monthes_g = text_monthes.selectAll("g.month")
    .data(monthes)
    .enter()
    .append("g")
    .attr("transform", function(d){
      var rotation =  (1-gap) * 2 * pi * ( d.lenRelative/2 + d.previousLenRelative ) * 180/pi;
      return "rotate("+ rotation +")"; 
    })
    .classed("month", true)
    .append("text")
    .style({"font-size": monthes_font_size,
            "letter-spacing": "0.1em",
            "text-transform": "uppercase",
            "fill": function(d){return d.color;},
            "text-anchor": "middle",
    })
    .append("textPath")
    .attr({
      "xlink:href": "#monthesPath",
      startOffset: "25%",
    })
    .text(function(d){
      return d.monthName;
    })
    .attr({
      "class": function(d){ if(d.weekend) { return "weekend"; } else{ return "weekday"; } },
      x: 0,
      y: 0,
    });

  var svgExtra = svg.append("g")
    .classed("extra", true);
  svgExtra.append("text")
    .text("Kruglendar")
    .attr({
      style: "text-anchor: middle;font-size: 14px; letter-spacing: 0.1em;",
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

  //// Draw hypotrochoid path
  //var line = d3.svg.line();
  //var hypotrochoidRaw = calendar.append("path")
    //.classed("calendar-shape", true)
    //.attr({
      //d: line(hypotrochoidArrayRaw.map(function(d){return [d[1]*sin(d[0]), d[1]*cos(d[0])]})),
      //id: "hypotrochoidRaw",
      //style: "opacity: 0.09; stroke-width: 5px;"
    //});
}

draw();
