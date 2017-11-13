var center = [1.3521, 103.8198];

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

var options = {
    tooltipContent: function(d) {
        var content = "No. of Transactions: " + d.length +
            "<br/>Average Price PSF: $" + getAverage(d);
        // console.log(d);
        return content;
    }
};

hexLayer.dispatch().on('click', function(d, i) {
    console.log({ type: 'click', event: d, index: i, context: this });
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
    hexLayer.data(PlanningRegionDim.top(Infinity));
    map.invalidateSize()
    mapResize();
}

function filterDate(startDate, endDate){
    SaleDateDim.filter(function(d){
        return d >= startDate && d <= endDate;
    });
    hexLayer.data(PlanningRegionDim.top(Infinity));
    mapResize();
}

function resetFilters(){
    SalesTypeDim.filterAll();
    PropertyTypeDim.filterAll();
    hexLayer.data(PlanningRegionDim.top(Infinity));
    mapResize();
}

function mapResize() {
    map.setView([0,0],11);
    setTimeout(function() {
        map.setView(center,11);
    }, 50);
}

//START OF MINIMAP
var zoomCenter = [1.3521, 103.8198]; //default center for minimap

//minimap
var detailsMap = new L.Map('detailsMap', {zoomControl: false}).setView(zoomCenter, 15);
    L.tileLayer(osmUrl, {attribution: osmAttrib}).addTo(detailsMap);
//minimap

//options for minimap
var optionsMini = {
    radius : 40,
    opacity: 1,
    duration: 200
};

//load minimap
function loadMiniMap(){
    detailsMap.setView(zoomCenter, 16);
}

//Add this hexlayer to the minimap as well
var hexLayerMini = L.hexbinLayer(optionsMini).addTo(detailsMap);

//options for minimap
var optionsMini = {
    radius : 40,
    opacity: 1,
    duration: 200
};

//hexLayerMini Map details
hexLayerMini.colorScale().range(['cyan', 'darkblue']);

hexLayerMini
    .radiusRange([4, 18])
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

hexLayerMini.dispatch().on('click', function(d, i) {
    console.log({ type: 'click', event: d, index: i, context: this });
    var clickedNode = d3.select(this);
});

hexLayerMini.hoverHandler(L.HexbinHoverHandler.tooltip(options));

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