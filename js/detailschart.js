var dateParser = d3v3.time.format("%d-%b-%y").parse;
var setFormat = d3v3.time.format('%b-%y');
var dateParser2 = d3v3.time.format('%b-%y').parse;
var setFormat2 = d3v3.time.format('%Y');

var TransBarChart = dc.barChart('#TransBar');
var PriceLineChart = dc.lineChart('#PriceLine');
// var ScatterChart = dc.scatterPlot('#Scatter');
// var PriceBoxPlot = dc.boxPlot('#box-test')


var realis = crossfilter();
var PlanningRegionDim = null;
var PlanningAreaDim = null;
var SaleDateDim = null;
var AllDim = null;
var yearDimension = null;
var monthDimension = null; 
var scatterDim = null;
d3v3.csv('data/Realis12-17_geocoded_new.csv', function(error, data) {
    if(error) throw error;

    var index = 0;
    data.forEach(function(d){
        d.Project_Name = d.Project_Name;
        d.Sale_Date = dateParser(d.Sale_Date);
        d.Planning_Area = d.Planning_Area; 
        d.Price_PSF = +d.Price_PSF
        d.Level = +d.Level
        d.Area_sqm = +d.Area_sqm;
        d.index = index;
        index++;
    });

    // Preparing Dimensions and Groups
    realis = crossfilter(data),
        all = realis.groupAll();

    //var ProjectNameDim = realis.dimension(function(d) {return d.Project_Name});
    // var psfDim = realis.dimension(function(d) {return d.Price_PSF});
    SaleDateDim = realis.dimension(function(d) {return (d.Sale_Date)});
    IndexDim = realis.dimension(function(d) {return (d.index)});
    PlanningRegionDim = realis.dimension(function(d) {return d.Planning_Region});
    PlanningAreaDim = realis.dimension(function(d) {return d.Planning_Area});
    AllDim = realis.dimension(function(d) {return d});
    yearDimension = realis.dimension(function(d) {return d3v3.time.year(d.Sale_Date)});
    monthDimension = realis.dimension(function(d) {return d3v3.time.month(d.Sale_Date)}) ;
    scatterDim = realis.dimension(function(d) {return [d.Level, d.Price_PSF, d.Project_Name]});
    SalesTypeDim = realis.dimension(function(d) {return d.Type_of_Sale});
    PropertyTypeDim = realis.dimension(function(d) {return d.Property_Type});
    var psfAverage = monthDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);

    // var AllDim = realis.dimension(function(d) {return d});

    //init hexlayer
    hexLayer.data(PlanningRegionDim.top(Infinity));
    // hexLayerMini.data(PlanningRegionDim.top(Infinity));
    
    // var ProjectNameGroup = ProjectNameDim.group();
    // var scatterGroup = scatterDim.group();
    var transTotal = monthDimension.group()
        .reduceCount(function(d) { return d.Price_PSF; });
    var psmGroup = SaleDateDim.group();
    var PlanningRegionGroup = PlanningRegionDim.group()
        .reduceCount(function(d) { return d.Planning_Region; });
    var BoxGroup  = yearDimension.group().reduce(
            function(p,v) {
            p.push(v.Price_PSF);
            return p;
            },
            function(p,v) {
            p.splice(p.indexOf(v.Price_PSF), 1);
            return p;
            },
            function() {
            return [];
            }
        );

    // Creating Line Chart
    PriceLineChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .width(500)
        .height(150)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(monthDimension)
        .group(psfAverage)
        .valueAccessor(function (d) {
            return d.value.avg;
        })
        .brushOn(false)
        .title(function(d){
            return setFormat(d.key)
                + "\nAverage PSF: " + d.value.avg;
        })
        .elasticY(true)
        .elasticX(true)
        .x(d3v3.time.scale()
            .domain(d3v3.extent(data,function(d) {return d.Sale_Date})))
        .xAxis();

    TransBarChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
        .width(500)
        .height(150)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(monthDimension)
        .dimension(SaleDateDim)
        .group(transTotal)
        .x(d3v3.time.scale().domain(d3v3.extent(data, function(d) {return (d.Sale_Date)})))
        .yAxisLabel("No. of Transactions")
        .title(function(d){
            return 'Date: ' + setFormat(d.key)
            + "\nNo. of Transactions: " + d.value;
            })
        .brushOn(false)
        .xUnits(d3v3.time.months)
        .elasticX(true)
        .elasticY(true);

    // ScatterChart
    //     .height(300)
    //     .x(d3v3.scale.linear().domain([0, 100]))
    //     .yAxisLabel("y")
    //     .xAxisLabel("x")
    //     .clipPadding(10)
    //     .dimension(scatterDim)
    //     .group(scatterGroup)
    //     .x(d3v3.scale.linear().domain(d3.extent(data, function(d) {return (d.Level)})))
    //     .brushOn(false)
    //     .nonemptyOpacity(0.3)
    //     .title(function(d){
    //         return  'Project: ' + d.key[2] + '\nLevel: ' + d.key[0] + '\nPSM: $' + d.key[1];
    //         });


    dc.renderAll();

});

function resetData() {
    var PriceBoxPlot = PriceBoxPlot.filters();
    var TransBarChart = TransBarChart.filters();
    // var ScatterChart = ScatterChart.filters();
    PriceBoxPlot.filter(null);
    TransBarChart.filter(null);
    TransLineChart.filter(null);
    realis.remove();
    PriceBoxPlot.filter([priceChartFilters]);
    TransBarChart.filter([transChartFilters]);
    // ScatterChart.filter([transChartFilters]);
}


// reduce for group

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