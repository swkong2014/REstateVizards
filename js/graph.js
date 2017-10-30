function barChart() {
  var margin = {top: 80, right: 80, bottom: 200, left: 80},
      width = 1280,
      height = 720;

  var x = d3.scaleBand()
              .rangeRound([1, width],.2);

  var y = d3.scaleLinear()
              .range([height, 0]);

  var xAxis = d3.axisBottom()
                  .scale(x);

    var yAxis = d3.axisLeft()
                  .scale(y);

  function chart(selection) {
    selection.each(function(d) {

      x.domain([0, d3.max(d)]);
      y.domain(d3.range(d.length));

      var svg = d3.select(this).append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", "bar chart")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.selectAll(".bar")
          .data(d)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("y", function(d, i) { return y(i); })
          .attr("width", x)
          .attr("height", y.bandwidth());

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y.rangeExtent()[1] + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .selectAll("text")
          .text(function(d) { return String.fromCharCode(d + 65); });

    });
  }

  return chart;
}