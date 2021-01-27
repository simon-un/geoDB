// var LeafIcon = L.Icon.extend({
//     options: {
//         shadowUrl: 
//             'http://leafletjs.com/docs/images/leaf-shadow.png',
//         iconSize:     [38, 95],
//         shadowSize:   [50, 64],
//         iconAnchor:   [22, 94],
//         shadowAnchor: [4, 62],
//         popupAnchor:  [-3, -76]
//     }
// });

// var greenIcon = new LeafIcon({
//     iconUrl: 'http://leafletjs.com/docs/images/leaf-green.png'
//     });

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

    var layerGeoJson = layer.toGeoJSON()

    layerGeoJson.properties['title'] = 'reservedGeometry'

    if (type === 'marker') {
        layer.bindPopup('A popup!');
    }

    console.log(e)

    drawnItems.addLayer(layer);
    console.log(layerGeoJson[0])
    console.log(Object.keys(layerGeoJson))
    i += 1

    console.log(dictCountFigures['ESTACION_1'])

    var postListRef = dbRt.ref('PROYECTOS/' + currentProject + '/ESTACION_1/reservedGeometry/features/' + dictCountFigures['ESTACION_1'])
    // var newPostRef = postListRef.push()
    postListRef.set({
        "type": layerGeoJson["type"],
        "geometry": layerGeoJson["geometry"],
        "properties": layerGeoJson["properties"]
    });

    dictCountFigures['ESTACION_1'] = dictCountFigures['ESTACION_1'] + 1
});

map.on('draw:deleted', function (e) {
    console.log(e)

    layer = e.layers

    drawnItems.removeLayer(layer)

    console.log(layer.toGeoJSON())
});