var center = [1.3521, 103.8198];

var dateParser = d3v3.time.format("%d-%b-%y").parse;

//        var detailsMap = L.map('detailsMap').setView(center, 13);
//
//        L.tileLayer('http://maps-{s}.onemap.sg/v2/Original/{z}/{x}/{y}.png', {
//            attribution: '&copy; <a href="https://www.onemap.sg/home/TermsOfUse.html">OneMap</a> contributors'
//        }).addTo(detailsMap);

function getAverage(d) {

    var total = 0;
    for(var record in d){
        if(record != 'x' && record != 'y')
            total += d[record]['o'].Price_PSF;
    }
    return Math.round(total / d.length * 100) /100;
}

function getProjectNames(d) {

    var projectNames = [];
    for(var record in d){
        if(record != 'x' && record != 'y'){
            if (projectNames.indexOf(d[record]['o'].Project_Name) == -1)
                projectNames.push(d[record]['o'].Project_Name);
        }
    }
    return projectNames;
}

function getPlanningArea(d) {

    var planningAreas = [];
    for(var record in d){
        if(record != 'x' && record != 'y'){
            if (planningAreas.indexOf(d[record]['o'].Planning_Area) == -1)
                planningAreas.push(d[record]['o'].Planning_Area);
        }
    }
    return planningAreas;
}

function getDateRange(d) {

    var minDate;
    var maxDate;
    
    var firstRow = true;
    for(var record in d){

        if(record != 'x' && record != 'y'){
            if (firstRow){
                minDate = d[record]['o'].Sale_Date;
                maxDate = d[record]['o'].Sale_Date;
                firstRow = false;
            }else {
                if (minDate > d[record]['o'].Sale_Date){
                    minDate = d[record]['o'].Sale_Date;
                }
                if (maxDate < d[record]['o'].Sale_Date){
                    maxDate = d[record]['o'].Sale_Date;
                }
            }
        }
    }
    minDateString = minDate.getDate() + "/" + (minDate.getMonth()+1) + "/" + minDate.getFullYear();
    maxDateString = maxDate.getDate() + "/" + (maxDate.getMonth()+1) + "/" + maxDate.getFullYear();
    return minDateString + " - " + maxDateString;
}

//        var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//        var osmUrl = 'http://maps-{s}.onemap.sg/v2/Original/{z}/{x}/{y}.png'

var osmUrl =
// 'http://maps-{s}.onemap.sg/v2/Grey/{z}/{x}/{y}.png'
'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;' +
    '<a href="https://carto.com/attribution">CARTO</a>'
    // '&copy; <a href="https://www.onemap.sg/home/TermsOfUse.html">OneMap</a> contributors',
    osm = L.tileLayer(osmUrl, {maxZoom: 11,  minZoom: 11, attribution: osmAttrib });

map = new L.Map('map', {layers: [osm], center: new L.LatLng(center[0], center[1]), zoom: 11, zoomControl:false});
map.dragging.disable();
var options = {
    radius : 14,
    opacity: 1,
    duration: 200
};

var hexLayer = L.hexbinLayer(options).addTo(map);

hexLayer.colorScale().range(['cyan', 'darkblue']);

hexLayer
    .radiusRange([4, 14])
    .lng(function(d) { return +d.Longtitude; })
    .lat(function(d) { return +d.Latitude; })
    .colorValue(function(d) {

        var total = 0;

        for(var record in d){
            if(record != 'x' && record != 'y')
                total += d[record]['o'].Price_PSF;
        }

//                return d[2];
        return total / d.length;
    })
    .radiusValue(function(d) { return d.length; });

var options = {
    tooltipContent: function(d) {
        var content = "<font size=2>Planning Area: " + getPlanningArea(d) +
        "<br>No. of Transactions: " + d.length +
        "<br/>Average Price PSF: $" + getAverage(d) + "</font>";
        return content;
    }
};
var currentNode = null;
hexLayer.dispatch().on('click', function(d, i) {
    console.log({ type: 'click', event: d, index: i, context: this });
    // hexbinFilter(d, true);
    if(currentNode){
        d3.select(currentNode).style('stroke', null);
    }
    d3.select(this).style("stroke", "red");
    currentNode = this;

    var arr = []
    items = [];
    for (i = 0; i < d.length; i++ ){
        arr.push(d[i]['o']);
        if(d[i]["o"]){
            items.push(d[i]["o"]["index"]);
        }
    }

    hexLayerMini.data(arr);
    hexbinFilter();
    zoomCenter = findCenter(d);
    loadMiniMap();
});

hexLayer.hoverHandler(L.HexbinHoverHandler.compound({
    handlers: [
        L.HexbinHoverHandler.resizeFill(),
        L.HexbinHoverHandler.tooltip(options)
    ]
}));


function filterSalesType(salesType){
    if (salesType){
        SalesTypeDim.filter(function(d){
            return salesType === d;
        });
    } else {
        SalesTypeDim.filter(salesType);
    }
    hexLayer.data(PlanningRegionDim.top(Infinity));
    mapResize();
}

function filterPropertyType(propertyType){
    if (propertyType){
        PropertyTypeDim.filter(function(d){
            return propertyType === d;
        });
    } else {
        PropertyTypeDim.filterAll();
    }
    mapResize();
}

function filterDate(startDate, endDate){
    SaleDateDim.filter(function(d){
        return d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime();
    });
    mapResize();
}

// function resetFilters(){
//     SalesTypeDim.filterAll();
//     PropertyTypeDim.filterAll();
//     SaleDateDim.filterAll();
//     mapResize();
// }

function mapResize() {
    hexLayer.data(PlanningRegionDim.top(Infinity));
    hexLayerMini.data(PlanningRegionDim.top(Infinity));

    map.setView([0,0],11);
    detailsMap.setView([0,0],miniZoomFactor)
    setTimeout(function() {
        map.setView(center,11);
        detailsMap.setView(zoomCenter,miniZoomFactor);
    }, 200);

}

//START OF MINIMAP
var zoomCenter = [1.2965676, 103.8499297]; //default center for minimap
var miniZoomFactor = 14; //zoom value for minimap
var minimapUrl = 'http://maps-{s}.onemap.sg/v2/Grey/{z}/{x}/{y}.png' //default map for minimap
//minimap
var detailsMap = new L.Map('detailsMap', {zoomControl: false}).setView(zoomCenter, miniZoomFactor);
    L.tileLayer(minimapUrl, {maxZoom: miniZoomFactor,  minZoom: miniZoomFactor}).addTo(detailsMap);
    detailsMap.dragging.disable();
//minimap

//options for minimap
var optionsMini = {
    radius : 12,
    opacity: 1,
    duration: 200
};

//load minimap
function loadMiniMap(){
    detailsMap.setView(zoomCenter, miniZoomFactor);
}

//Add this hexlayer to the minimap as well
var hexLayerMini = L.hexbinLayer(optionsMini).addTo(detailsMap);

//hexLayerMini Map details
hexLayerMini.colorScale().range(['cyan', 'darkblue']);

hexLayerMini
    .radiusRange([4, 13])
    .lng(function(d) { return d.Longtitude; })
    .lat(function(d) { return d.Latitude; })
    .colorValue(function(d) {

        var total = 0;
//                console.log(d.length);
//                console.log(d);

        for(var record in d){
            if(record != 'x' && record != 'y')
                total += d[record]['o'].Price_PSF;
        }

//                return d[2];
        return total / d.length;
    })
    .radiusValue(function(d) { return d.length; });

var items = [];
hexLayerMini.dispatch().on('click', function(d, i) {
    console.log({ type: 'click', event: d, index: i, context: this });
    // console.log(IndexDim.top(Infinity));

    if(currentNode){
        d3.select(currentNode).style('stroke', null);
    }
    d3.select(this).style("stroke", "red");
    currentNode = this;

    items = [];
    for (i = 0; i < d.length; i++ ){
        // arr.push(d[i]['o']);
        if(d[i]["o"]){
            items.push(d[i]["o"]["index"]);
        }
    }

    hexbinFilter();
});

//tooltip for minimap
var optionsMinimap = {
    tooltipContent: function(d) {

        var content = "<font size=2>Project Name(s): " + getProjectNames(d) +
            "<br/>Date of Transactions: " + getDateRange(d) +
            "<br/>No. of Transactions: " + d.length +
            "<br/>Average Price PSF: $" + getAverage(d) + "</font>";
        return content;
    }
};

hexLayerMini.hoverHandler(L.HexbinHoverHandler.tooltip(optionsMinimap));

function redrawMiniMap(){
    hexLayerMini.data(PlanningRegionDim.top(Infinity));
}

//END OF MINIMAP

function findCenter(data) {
    var longArray = [];
    var latArray = [];
    data.forEach(function(d){
        obj = d.o;
        objLong = +obj.Longtitude;
        objLat = +obj.Latitude;
        
        if (latArray.indexOf(objLat) == -1){
            latArray.push(objLat);
        }
        if (longArray.indexOf(objLong) == -1){
            longArray.push(objLong);
        }
    });

    var sumLong = longArray.reduce(function(a, b) { return a + b; });
    var sumLat = latArray.reduce(function(a, b) { return a + b; });
    var longAvg = sumLong / longArray.length;
    var latAvg = sumLat / latArray.length;

    return [latAvg,longAvg];
}

function hexbinFilter(){
    // if (clearArr) item = [];
    // for (item in d){
    //     if(d[item]["o"])
    //         items.push(d[item]["o"]["index"]);
    // }
    IndexDim.filter(function(d){
        return items.includes(d);
    });
    dc.redrawAll();

}