var dateParser = d3v3.time.format("%d-%b-%y").parse;
var setFormat = d3v3.time.format('%b-%y');
var dateParser2 = d3v3.time.format('%b-%y').parse;

var PriceLineChart = dc.lineChart('#PriceLine')
var TransLineChart = dc.lineChart('#TransLine')
// var ScatterChart = dc.bubbleChart('#Scatter');
var test = dc.rowChart('#test')

var realis = crossfilter();
d3v3.csv('data/Realis12-17_geocoded.csv', function(error, data) {
    if(error) throw error;


    data.forEach(function(d){
        d.Sale_Date = dateParser(d.Sale_Date);
        // d.PlanningArea = d.Planning_Area;
        d.Price_PSF = +d.Price_PSF;
        // d.Level = +d.Level;
        d.Area = +d.Area_sqm;
    });

    console.log(data);

    hexBinData = data;
    // Preparing Dimensions and Groups
    realis = crossfilter(data),
        all = realis.groupAll();

    var ProjectNameDim = realis.dimension(function(d) {return d.Project_Name});
    var psfDim = realis.dimension(function(d) {return d.Price_PSF});
    var SaleDateDim = realis.dimension(function(d) {return (d.Sale_Date)});
    var PlanningRegionDim = realis.dimension(function(d) {return d.Planning_Region});
    var AllDim = realis.dimension(function(d) {return d});


    // var ProjectNameGroup = ProjectNameDim.group();
    var transTotal = SaleDateDim.group()
        .reduceCount(function(d) { return d.Price_PSF; });
    var psmGroup = SaleDateDim.group();
    var PlanningRegionGroup = PlanningRegionDim.group()
        .reduceCount(function(d) { return d.Planning_Region; });
    var psmAverage = SaleDateDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);

    function reduceAdd(p, v) {
        p.count = p.count + 1;
        p.total = p.total + v.Price_PSF;
        p.avg = Math.round(p.total / p.count);
        return p;
    }

    function reduceRemove(p, v) {
        p.count = p.count - 1;
        p.total = p.total - v.Price_PSF;
        p.avg = p.count ? Math.round(p.total / p.count) : 0;
        return p;
    }

    function reduceInitial() {
        return {count: 0, total: 0, avg: 0};
    }

    // Creating Line Chart
    PriceLineChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .width(990)
        .height(300)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(SaleDateDim)
        .group(psmAverage)
        .valueAccessor(function (d) {
            return d.value.avg;
        })
        .brushOn(false)
        .title(function(d){
            return setFormat(d.key)
                + "\nAverage PSM: " + d.value.avg;
        })
        .round(d3v3.time.month.round)
        .xUnits(d3v3.time.months)
        .elasticY(true)
        .x(d3v3.time.scale().domain(d3v3.extent(data,function(d) {return d.Sale_Date})))
        .y(d3v3.scale.linear().domain(d3v3.extent(data, function(d) {return d.Price_PSF})))
        .xAxis();
    // Specify a "range chart" to link its brush extent with the zoom of the current "focus chart".
    // .rangeChart(volumeChart)
    // .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
    // .round(d3.time.month.round)
    // .xUnits(d3.time.months)
    // .elasticY(true)
    // .renderHorizontalGridLines(true)

    TransLineChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .width(990)
        .height(300)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(SaleDateDim)
        .group(transTotal)
        .brushOn(false)

        // .valueAccessor(function (d) {
        //         return d.value.avg;
        //     })
        .title(function(d){
            return setFormat(d.key)
                + "\nNo. of Transactions: " + d.value;
        })
        .elasticY(true)
        .x(d3v3.time.scale()
            .domain(d3v3.extent(data,function(d) {return d.Sale_Date})))
        .xAxis();

    test
        .dimension(PlanningRegionDim)
        .group(PlanningRegionGroup)
        .elasticX(true);

    dc.renderAll();

})

function resetData(dimensions) {
    var priceChartFilters = PriceLineChart.filters();
    var transChartFilters = TransLineChart.filters();
    PriceLineChart.filter(null);
    TransLineChart.filter(null);
    realis.remove();
    PriceLineChart.filter([priceChartFilters]);
    TransLineChart.filter([transChartFilters]);
}
