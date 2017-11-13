// details map

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