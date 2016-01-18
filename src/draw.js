var defaultParams = {
  locale: "en",
  month_font: "Bebas Neue Light",
  month_font_weight: "100",
  external_css: ""
};

var userParams = {};
if (document.location.search.length > 0) {
  document.location.search
    .substr(1)
    .split("&")
    .forEach(function (pair) {
      var params = pair
        .replace(/\+/g, "%20")
        .split("=")
        .map(decodeURIComponent);
      userParams[params[0]] = params[1];
    });
}

var params = {};

// set params and populate form
Object.keys(defaultParams).forEach(function (param) {
  params[param] = userParams[param] || defaultParams[param];
  document.getElementById(param).value = params[param];
});

var drawImmediately = true;

// load external css
if (params.external_css !== "") {
  drawImmediately = false;
  var link = document.createElement("link");
  link.addEventListener("load", function () {
    setTimeout(function () {
      draw();
    }, 1000);
  }, false);
  link.setAttribute("href", params.external_css);
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  document.head.appendChild(link);
}

// set locale
document.body.setAttribute('lang', params.locale);
moment.locale(params.locale);

// kerning data
var monthKerning = {
  "Bebas Neue Light": {
    "en": [
      "0 0 0 1.55 -0.85000008 0 -2.4299998",
      "0 0 0 0 0 -0.95000011 -0.54999995 -0.98999995",
      "",
      "0 0 0 2.1899998 2.1399999",
      "0 0 -4.4199996",
      "",
      "0 1.7300001 1.1800001 -8.46",
      "0 0 0 0 0 -2.5899997",
      "0 0 0 -3.1299989 -1.4000001 1.2 1.2299999",
      "0 0 -2.0999999 -3.4299994",
      "0 0 -2.1399999 -1.42 -0.75000006 1",
      "0 0 -1.42 -1.2900001 0 1.33"
    ]
  }
};

var chosenKerning = [];

if (monthKerning[fontFamilyMonth] && monthKerning[fontFamilyMonth][params.locale]) {
  chosenKerning = monthKerning[fontFamilyMonth][params.locale];
}

//Changable variables
//relative to size
var svg_size = [2104.72, 2979.92],
    center = [0.5, 0.4698];
//abs
//var gap = 0.1, // gap for new year
var gap = 0.01, // gap for new year
//var gap = 1/10., // gap for new year
	angle_newyear = 0,
	R = 0.4*svg_size[0], // outer radius
	r = R/12; // inner radius
//others
var datesSpan = [new Date(2016, 0, 1), new Date(2016, 11, 31)];
//var fontFamily = "Roboto Condensed Light";
//var fontFamilyWeekend = "Roboto";
//var fontFamily = "Antonio";
//var fontFamily = "Bebas Neue Thin";
//var fontFamily = "Bebas Neue Light";
//var fontFamily = "Steelfish";
//var fontFamily = "HFF Jammed Pack"; // unreadable
var fontFamily = "Bebas Neue";
var fontWeight = "normal";
//var fontFamilyWeekend = "Arial Black";
//var fontFamilyWeekend = "Impact";
//var fontFamilyWeekend = "Steelfish";
var fontFamilyWeekend = "Bebas Neue";
var fontWeightWeekend = "900";
var fontScaleWeekend = 1.5;
//var fontFamily = "Sorren Ex Medium";
//var fontWeight = "normal";
//var fontFamilyWeekend = "Sorren Ex Bold";
//var fontWeightWeekend = "normal";
var dateSeparator = 0.0002*svg_size[0];
//var fontFamily = "Varicka";
//var fontFamily = "Higherup";
//var fontFamily = "Xenophobia";
//var fontWeight = "Light";
//var fontFamily = "msam10";
//font-family: 'Sorren Ex Bold'
//font-family: 'Sorren Ex Medium'
var fontFamilyMonth = params.month_font;
var fontFamilyMonthWeight = params.month_font_weight;
var monthes_font_size = 2.5*svg_size[1]/150;
//var monthes_radius = R*0.78;
var monthes_radius = R;
//var skew_factor = 1.2;
var skew_factor = 0; // disable skewing
var description_pos = [0.5, 0.98];
var decoration_font_size = R*0.018;

var paddVer = 0.001*R;
var paddHor = 0.003*R;

//helpers
var cos = Math.cos, sin = Math.sin;
var pi = Math.PI;

//processing some vars
r *= (1-gap) // gap cause inner radius to be smaller
//var r2 = 0.18*r;// drawing point distance
//var r2 = 0.28*r;// drawing point distance
var r2 = 0.3*r;// drawing point distance
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
var hypotrochoidArrayRaw = d3.range(0.0001, hypotrochoidAngleSpan, 0.0001).map(psi2thetaRo);

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
    [1,149,213],
    [0.178,227],
    //[5,167,170],
    //[9,162,95],
    [133,198,70],
    [254,232,11],
    [237,130,26],
    [234,27,33],
    [235,25,74],
    [239,6,134],
    [133,41,140],
    [14,77,156],
    [1,149,213],
    ]
    //[  0, 248, 193],
    //[  0, 246, 0  ],
    //[239, 194, 0  ],
    //[255, 0, 0    ],
    //[255, 0, 210  ],
    //[  0, 211, 255],
    //[  0, 254, 255] ]
    .map( function(rgb){
      return d3.rgb(rgb[0], rgb[1], rgb[2]);
    });
  //console.log("hello");
  //console.log(0, 1.0, 1.0 / (rainbow.length-1));
  var colorScale = d3.scale.linear()
    //.domain(d3.range(0, 1.0, 1.0 / (rainbow.length-1)))
    .domain([0, 0.09, 0.18, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 0.90, 1])
    //.domain([ 0, 0.166, 0.333, 0.5, 0.666, 0.833, 1])
    //.domain([ 0, 0.166, 0.233, 0.5, 0.666, 0.833 ])
    //.domain([ 0, 0.2, 0.3, 0.4, 0.6, 0.8, 1])
    //.domain([0, 0.2, 0.4, 0.6, 0.8, 1])
    .range(rainbow);
  //console.log("rainbow = " + JSON.stringify(d3.range(0, 1.0, 1.0 / (rainbow.length-1))));

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
      //TODO
      //dateString = (dateString=="5")?"ﬃ":"1";
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
          x: 100,
          y: 100,
          style: function(d){
            var scale = (isWeekend)?fontScaleWeekend:1;
            return "font-size:"+scale+"px;"+
            //return "font-size:"+1+"px;"+ //should be 1px. Or we sould devide by this value later
              "font-family:"+ fontFamilyCurrentDay +";"+
              "font-weight:"+ fontWeightCurrentDay +";"+
              "text-anchor:middle;"+
              "";
          }
        })
        .text(dateString);
      var textTmpLength = textTmp.node().getComputedTextLength();
      //if(isWeekend){
        //console.log("we textTmpLength = " + textTmpLength);
      //}
      //else{
        //console.log("textTmpLength = " + textTmpLength);
      //}

      datesStringLength += textTmpLength + dateSeparator;
      d3.selectAll("svg.tmp").remove();
      return {
        scale: (isWeekend)?fontScaleWeekend:1,
        //scale: 1,
        theta: datesStringLength, // will be converted to radians after this map is over
        date: dateString, 
        weekend: isWeekend, 
        month: dateFormatMonth(d),
        monthName: moment(d).format('MMMM'),
        color: "red", //tmp
      };
    });
  //normalizing theta for every date
  //var datesStringLength = dates[dates.length-1].theta;
  dates.map(function(d){
    d.theta = hypotrochoidAngleSpan * d.theta/datesStringLength;
    d.color = colorScale(d.theta/hypotrochoidAngleSpan)
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
      dx: chosenKerning.shift() || "",
    }; 
  });


  // Drawing SVG
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  // SVG
  var svg = d3.select("body")
    .append("svg")
    .attr({
      width: svg_size[0],
      height: svg_size[1],
      style: "background: white;",
    });
  //// Helper circle
  //svg.append("circle")
    //.attr({
      //cx: svg_size[0]*center[0],
      //cy: svg_size[1]*center[1],
      //r: R
    //})
    //.classed("circle", true);
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
    var roPrev = -(R-r+r2);
    //console.log("reset");
    var thetaPrev = 0;

    var colorScaleMonth = d3.scale.linear()
      .domain([0,1])
      .range ([m.values[0].color, m.values[m.values.length-1].color]);
    m.values = m.values.map( function(d){
      var t = d.theta;
      d.color = colorScaleMonth((t-tBeg)/(tEnd-tBeg));
      return d;
    });
  

    ////debug
    //var points_g = month_g.selectAll("g.point")
      //.data(m.values)
      //.enter()
      //.append("g")
      //.attr("transform", function(d){
        //var rotation = d.theta * 180/pi;
        //return "rotate("+ rotation +")"; 
      //})
      //.classed("point", true)
      //.append("circle")
      //.attr({
        //cx: 0,
        //cy: function(d){
          //var tBeg = m.values[0].theta;
          //var tEnd   = m.values[m.values.length-1].theta;
          //var t = d.theta;
          //return -pos2ro( (t-tBeg)/(tEnd-tBeg) );
        //},
        //r: 1,
      //});
    ////enddebug

    var dates_g = month_g.selectAll("g.date")
      .data(m.values)
      .enter()
      .append("g")
      .attr({
        "transform": function(d){
          var tBeg = m.values[0].theta;
          var tEnd   = m.values[m.values.length-1].theta;
          var t = d.theta;
          var transitionY = -pos2ro( (t-tBeg)/(tEnd-tBeg) );
          var rotation = d.theta * 180/pi;
          return "rotate("+ rotation +") translate(0,"+ transitionY +")"; 
        },
      })
      .classed("date", true);

    dates_g.append("text")
      .text(function(d){
        return d.date;
      })
      .attr({
        "class": function(d){ if(d.weekend) { return "weekend"; } else{ return "weekday"; } },
        "transform": function(d){ 
          var t = d.theta;
          roCurr = - pos2ro((t-tBeg)/(tEnd-tBeg)) 
          var dy = roCurr - roPrev; 
          var dx = R*(d.theta - thetaPrev); 
          thetaPrev = d.theta;
          roPrev = roCurr;
          return "skewY("+Math.atan(dy/dx)*180/pi*skew_factor+")"; 
        },
        style: function(d){
          var fontSizeKoef = 1.0;
          var fontSize = fontSizeKoef * d.scale * (R-r2) * hypotrochoidAngleSpan / datesStringLength;
          var fontFamilyCurDay = (d.weekend)?fontFamilyWeekend:fontFamily;
          var fontWeightCurDay = (d.weekend)?fontWeightWeekend:fontWeight;
          //var fontColorCurDay = (d.weekend)?"white":m.color;
          var fontColorCurDay = m.color;
          decoration = "none";
          //decoration = (d.weekend)? "underline" : "none";
          //weight = (d.weekend)? "normal" : "bold";
          return "font-size:"+ fontSize +"px; "
                +"font-family:"+ fontFamilyCurDay +";"
                +"text-anchor:end;"
                +"font-weight:"+ fontWeightCurDay +";"
                //+"fill:"+ d.color +";"
                +"fill:"+ fontColorCurDay +";"
                +"text-decoration: "+ decoration +";";
        }
      });

    //dates_g.filter(function(d){return d.weekend;}).insert("rect", "text")
      //.attr({
        //"fill": function(d){return m.color;},
        //"paddHor": function(d){
          //return paddHor;/[>transitionY/R;
        //},
      //});
    //month_g.selectAll("rect")
      //.attr("x", function(d) {return this.parentNode.getBBox().x - paddHor;})
      //.attr("y", function(d) {return this.parentNode.getBBox().y - paddVer;})
      //.attr("width", function(d) {return this.parentNode.getBBox().width + 2*paddHor;})
      //.attr("height", function(d) {return this.parentNode.getBBox().height + 2*paddVer;});



  }

  var arc = d3.svg.arc()
    .innerRadius(monthes_radius)
    .outerRadius(monthes_radius)
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
            "letter-spacing": "5px",
            "font-family": fontFamilyMonth,
            "font-weight": fontFamilyMonthWeight,
            "text-transform": "uppercase",
            "fill": function(d){return d.color;},
            "text-anchor": "middle",
    })
    .attr({
            "dx": function(d){return d.dx;},
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

  var description = svg.append("text")
    .classed("extra", true)
    .attr({
      transform: "translate("
      + svg_size[0]*description_pos[0] 
      + "," 
      + svg_size[1]*description_pos[1]
      + ")",
     style: "font-size:"+decoration_font_size+"px;text-align:center;text-anchor:middle;font-family:Roboto Condensed;letter-spacing:0.01em;",
    });
  description.append("tspan")
    .attr({ 
      "xml:space": "preserve",
    })
    .text("Kruglendar — the poster diary. Download from ");
  description.append("tspan")
    .attr({ 
      style: "font-weight: bold; /*text-decoration: underline;*/ fill: #0195d5;",
    })
    .text("www.kruglendar.ru");
  description.append("tspan")
    .attr({ 
      "xml:space": "preserve",
    })
    .text(" for free");
    //.text(" for free · ");
  //description.append("tspan")
    //.attr({
      //transform: "scale(-1)", //don't work :(
    //})
    //.text("©");
  //description.append("tspan")
    //.text(" Ivan Dianov");
  //var extraLabel = svgExtra.append("g")
    //.attr({
      //transform: "translate(0 10) scale(0.4)",
    //});
    
  var label = svg.append("g")
  .attr({
    transform: "translate("
    + (svg_size[0]*center[0])
    + "," 
    + (svg_size[1]*center[1] + R*0.034)
    + ") scale(0.4)",
  });
  label.append("text")
    .text("Kruglendar")
    .attr({
      x: 0,
      y: 60,
      style: "text-anchor: middle;font-size: 40px; letter-spacing: 5.4px; font-family:'Bebas Neue';",
    }); 
  label.append("text")
    .attr({
      x: "0.017473536",
      y: "0.48287916",
      style: "font-size:127px;text-anchor:middle;font-family:Bebas Neue; font-weight: bold;",
      dx: "-1.0802984 5.6619849 -2.1156566 4.49368",
    })
  .text("2016");

  //var copyrights = svg.append("text")
   //.attr({ 
     //style: "font-size:20.22219467px;text-align:center;line-height:125%;text-anchor:middle;font-family:Bebas Neue;",
     //x: "873.11981",
     //y: "-108.85584", 
     ////transform: "scale(1,-1)",
   //})
  //.text("© Ivan Dianov");

  //copyrights.append("tspan") 
    //.attr({
      //x: "873.11981",
      //y: "-108.85584",
      //style: "font-family:Roboto Condensed Light;",
    //})
  //.text("Kruglendar — the poster-diary");

  //copyrights.append("tspan") 
    //.attr({
      //x: "875.27234",
      //y: "-83.578102",
      //style: "font-family:Roboto Condensed Light",
    //})
  //.text("Free download from")
  //.append("tspan")
  //.attr({
    //style: "font-family:Roboto Condensed",
  //})
  //.text("www.kruglendar.ru");

  //copyrights.append("tspan") 
    //.attr({
      //x: "873.11981",
      //y: "-58.300354",
      //style: "font-family:Roboto Condensed Light;",
    //})
  //.text("© Ivan Dianov");

  var tree = svg.append("g")
    .classed("tree",true)
    .attr({
      transform: "translate("
      + (svg_size[0]*center[0] + R*0.004204)
      + "," 
      + (svg_size[1]*center[1] - R*0.959111)
      + ") scale(3)",
    });
    tree.append("path")
      .attr({
        d: "m -1.9061626,0.6282 1.92250002,-1.9187 1.91874998,1.9187 -3.84125,0 z",
        fill: rainbow[0],
      });
    tree.append("path")
      .attr({
        d: "m -2.3516626,2.3756 2.36875002,-2.3663 2.36374998,2.3663 -4.7325,0 z",
        fill: rainbow[0],
      });
    tree.append("path")
      .attr({
        d: "m -2.7966626,4.1231 2.81250002,-2.8125 2.81124998,2.8125 -5.62375,0 z",
        fill: rainbow[0],
      });
    tree.append("path")
      .attr({
        d: "m 0.01539742,-3.3436 0.28055,0.7187 0.77022998,0.045 -0.59682998,0.4889 0.19547,0.7463 -0.64942,-0.4165 -0.64942,0.4165 0.19547,-0.7463 -0.59683002,-0.4889 0.77022002,-0.045 z",
        style: "fill:#ff1919;",
      });


  //// Draw hypotrochoid path (regualr month length)
  //var line = d3.svg.line();
  //var hypotrochoidRaw = calendar.append("path")
    //.classed("calendar-shape", true)
    //.attr({
      //d: line(hypotrochoidArrayRaw.map(function(d){return [d[1]*sin(d[0]), d[1]*cos(d[0])]})),
      //id: "hypotrochoidRaw",
      //style: "opacity: 0.9; stroke-width: 1px;"
    //});
}

if (drawImmediately) {
  draw();
}
