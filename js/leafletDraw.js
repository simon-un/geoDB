function loadLeafletDrawFigures(layer){
    drawnItems.addLayer(layer);
}



var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    position: 'bottomright',
    draw: {
        polygon: {
            shapeOptions: {
                color: 'purple'
            },
            allowIntersection: false,
            drawError: {
                color: 'orange',
                timeout: 1000
            },
            showArea: true,
            metric: false,
            repeatMode: true
        },
        polyline: {
            shapeOptions: {
                color: 'red'
            },
        },
        rect: {
            shapeOptions: {
                color: 'green'
            },
        },
        circle: {
            shapeOptions: {
                color: 'steelblue'
            },
        },
    },
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

var i = 0

map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

        console.log(layer)
        console.log(layer._leaflet_id)

    var layerGeoJson;

    // 

    if (type === 'marker') {
        layer.bindPopup('A popup!');
    }

    if (type === 'circle') {

        var origin = layer.getLatLng(); //center of drawn circle
        var radius = layer.getRadius(); //radius of drawn circle
        var projection = L.CRS.EPSG4326;
        var polys = createGeodesicPolygon(origin, radius, 60, 0, projection); //these are the points that make up the circle
        var polygon = []; // store the geometry
        for (var i = 0; i < polys.length; i++) {
            var geometry = [polys[i].lat, polys[i].lng]; 
            polygon.push(geometry);
        }

        var layer = L.polygon(polygon); //convert geometry to a leaflet polygon and add it to the map
        drawnItems.addLayer(layer);
        layerGeoJson = layer.toGeoJSON()
        layerGeoJson.properties['title'] = 'reservedGeometry'
        console.log('circle')
    } else {
        layerGeoJson = layer.toGeoJSON()
        layerGeoJson.properties['title'] = 'reservedGeometry'
        drawnItems.addLayer(layer);
    }
    
    i += 1

    var postListRef = dbRt.ref('PROYECTOS/' + currentProject + '/ESTACION_1/reservedGeometry/features/')
    var newPostRef = postListRef.push()
    layerGeoJson.properties['key'] = newPostRef.key
    newPostRef.set({
        "type": layerGeoJson["type"],
        "geometry": layerGeoJson["geometry"],
        "properties": layerGeoJson["properties"]
    });

    dictCountFigures['ESTACION_1'] = dictCountFigures['ESTACION_1'] + 1
});

map.on('draw:deleted', function (e) {
    
    layer = e.layers

    drawnItems.removeLayer(layer)

    console.log(layer.toGeoJSON())
});




// Create circle as polygon 
function createGeodesicPolygon(origin, radius, sides, rotation, projection) {
    var latlon = origin; //leaflet equivalent
    var angle;
    var new_lonlat, geom_point;
    var points = [];
  
     for (var i = 0; i < sides; i++) {
        angle = (i * 360 / sides) + rotation;
        new_lonlat = destinationVincenty(latlon, angle, radius); 
        geom_point = L.latLng(new_lonlat.lng, new_lonlat.lat); 
  
        points.push(geom_point); 
      }   
  
    return points; 
  } 

  L.Util.VincentyConstants = {
    a: 6378137,
    b: 6356752.3142,
    f: 1/298.257223563  
};

function destinationVincenty(lonlat, brng, dist) { //rewritten to work with leaflet

    var u = L.Util;
    var ct = u.VincentyConstants;
    var a = ct.a, b = ct.b, f = ct.f;
    var lon1 = lonlat.lng;
    var lat1 = lonlat.lat;
    var s = dist;
    var pi = Math.PI;
    var alpha1 = brng * pi/180 ; //converts brng degrees to radius
    var sinAlpha1 = Math.sin(alpha1);
    var cosAlpha1 = Math.cos(alpha1);
    var tanU1 = (1-f) * Math.tan( lat1 * pi/180 /* converts lat1 degrees to radius */ ); 
    var cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1;
    var sigma1 = Math.atan2(tanU1, cosAlpha1);
    var sinAlpha = cosU1 * sinAlpha1;
    var cosSqAlpha = 1 - sinAlpha*sinAlpha;
    var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var sigma = s / (b*A), sigmaP = 2*Math.PI;
    while (Math.abs(sigma-sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2*sigma1 + sigma);
        var sinSigma = Math.sin(sigma);
        var cosSigma = Math.cos(sigma);
        var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
            B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b*A) + deltaSigma;
    }
    var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1;
    var lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
        (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp));
    var lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1);
    var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
    var lam = lambda - (1-C) * f * sinAlpha *
        (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));  
    var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing
    var lamFunc = lon1 + (lam * 180/pi); //converts lam radius to degrees
    var lat2a = lat2 * 180/pi; //converts lat2a radius to degrees

    return L.latLng(lamFunc, lat2a);

}

// -------------------------
