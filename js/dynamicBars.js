var area = "Ang Mo Kio";

var buttonYears = ["Ang Mo Kio","Bedok","Bishan","Boon Lay","Bukit Batok","Bukit Merah","Bukit Panjang","Bukit Timah","Central Water Catchment","Changi","Changi Bay","Choa Chu Kang","Clementi","Downtown Core","Geylang","Hougang","Jurong East","Jurong West","Kallang"];
     var ageBand = ["0_4", "5_9","10_14",   "15_19",   "20_24",   "25_29" ,  "30_34",   "35_39" ,  "40_44",   "45_49" ,  "50_54" ,  "55_59"  , "60_65" ,  "65_over"];
     var margin = {top: 30, right: 0, bottom: 0, left: 100},
          width = 900 - margin.left - margin.left,
          height = 700 - margin.top - margin.bottom;

var body = d3.select("#body");

var x = d3.scaleLinear()
          .range([0, width]);

var y = d3.scaleBand()
          .rangeRound([0, height], 0.1);

         //Axes Generators
var xAxis = d3.axisTop()
                  .scale(x);

var yAxis = d3.axisLeft()
                  .scale(y);

function keys(d) {
          return d.age;
     }

body.append("h2")
               .text("Age distribution of Some SG Areas");
     
var buttons = body.append("div")
          .attr("class", "buttons-container")
          .selectAll("div").data(buttonYears)
       .enter().append("div")
          .text(function(d) { return d; })
          .attr("class", function(d) {
               if(d == area)
                    return "button selected";
               else
                    return "button";
          });

/*     body.append("div")
          .attr("class", "clearfix")*/

     body.append("div")
          .attr("class", "top-label age-label")
       .append("p")
          .text("age group");

     body.append("div")
          .attr("class", "top-label")
       .append("p")
          .text("population");

/*     body.append("div")
          .attr("class", "clearfix")*/

     d3.csv("http://127.0.0.1/MyChart/data/popsg2.csv", function(error, data){
         data.forEach(function(d){
          d.area = d.area;
          d.age = d.age;
          d.value = +d.value;
            });
console.log(data);
          var popData = data.filter(function(element) {return element.area == area});

          x.domain(d3.extent(data, function(element) { return element.value; }));

          y.domain(ageBand);

          var svg = body.append("svg")
               .attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom)
           .append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var barGroup = svg.append("g")
               .attr("class", "bar");

          var bars = barGroup.selectAll("rect")
               .data(popData, keys)
            .enter().append("rect")
               .attr("x", 0)
               .attr("y", function(d) {return y(d.age)})
               .attr("width", function(d) {return x(d.value)})
               .attr("height", y.bandwidth()-4);


          svg.append("g")
               .call(xAxis)
               .attr("class", "x axis")

          svg.append("g")
               .call(yAxis)
               .attr("class","y axis")

          buttons.on("click", function(d) {
               update(d);
               
          });
          
          function update(NewArea) {

               d3.select(".selected")
                    .classed("selected", false);

               buttons
                    .filter(function(d) { return d == NewArea; })
                    .classed("selected", true)

               popData = data.filter(function(element) {return element.area == NewArea});

               bars.data(popData, keys)
                    .transition()
                    .duration(500)
                    .attr("width", function(d) { return x(d.value); });

          };
     });