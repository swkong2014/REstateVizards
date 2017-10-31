// details map

var center = [1.3521, 103.8198];
//        var detailsMap = L.map('detailsMap').setView(center, 13);
//
//        L.tileLayer('http://maps-{s}.onemap.sg/v2/Original/{z}/{x}/{y}.png', {
//            attribution: '&copy; <a href="https://www.onemap.sg/home/TermsOfUse.html">OneMap</a> contributors'
//        }).addTo(detailsMap);

function getAverage(d) {

    var total = 0
//                console.log(d.length);
//                console.log(d);

    for(var record in d){
        if(record != 'x' && record != 'y')
            total += d[record]['o'][2];
    }

//                return d[2];
    return Math.round(total / d.length * 100) /100  ;
}

//        var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//        var osmUrl = 'http://maps-{s}.onemap.sg/v2/Original/{z}/{x}/{y}.png'

var osmUrl ='http://maps-{s}.onemap.sg/v2/Grey/{z}/{x}/{y}.png'
osmAttrib = '&copy; <a href="https://www.onemap.sg/home/TermsOfUse.html">OneMap</a> contributors',
    osm = L.tileLayer(osmUrl, {maxZoom: 18,  minZoom: 12, attribution: osmAttrib});

map = new L.Map('map', {layers: [osm], center: new L.LatLng(center[0], center[1]), zoom: 12, zoomControl: false});

var options = {
    radius : 18,
    opacity: 1,
    duration: 200
};

var hexLayer = L.hexbinLayer(options).addTo(map);

hexLayer.colorScale().range(['cyan', 'darkblue']);

hexLayer
    .radiusRange([4, 18])
    .lng(function(d) { return d[0]; })
    .lat(function(d) { return d[1]; })
    .colorValue(function(d) {

        var total = 0
//                console.log(d.length);
//                console.log(d);

        for(var record in d){
            if(record != 'x' && record != 'y')
                total += d[record]['o'][2];
        }

//                return d[2];
        return total / d.length;
    })
    .radiusValue(function(d) { return d.length; });

function generateData(){
    var data = [];

    d3.csv('data/Realis12-17_geocoded.csv', function(error, dataset) {  // NEW
        dataset.forEach(function (d) {
            data.push([+d.Longtitude, +d.Latitude, +d.Price_PSF, d.Project_Name]);
        });

        hexLayer.data(data);
    });
};
generateData();

var options = {
    tooltipContent: function(d) {
        var content = "No. of Transactions: " + d.length +
            "<br/>Average Price PSF: $" + getAverage(d);
        return content;
    }
};

hexLayer.dispatch().on('click', function(d, i) {
    console.log({ type: 'click', event: d, index: i, context: this });
    var clickedNode = d3.select(this);
    // console.log(hexBinData);
//            detailsMap.setView(center, 16);


    // d.SaleDate = dateParser(d.SaleDate);
    // d.PlanningArea = d.PlanningArea;
    // d.psf = +d.psf
    // d.Level = +d.Level
    // d.Area = +d.Area;
});
hexLayer.hoverHandler(L.HexbinHoverHandler.tooltip(options));

    // array of dictionaries
function addData(){


}

function removeData(){

}