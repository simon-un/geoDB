(function() {
    'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            console.log('Mallll')
          } else {
          event.preventDefault();
          event.stopPropagation();
          var inputCreateStructureValue = document.getElementById('inputCreateStructure').value
          dbRt.ref('PROYECTOS/' + currentProject + '/' + inputCreateStructureValue + '/').set({
              'reservedGeometry': 0
          })

          document.getElementById('btnDismissModalCreateStructure').click()
          }
          form.classList.add('was-validated');


        }, false);
      });
    }, false);
  })();


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

map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    var postListRef = dbRt.ref('PROYECTOS/' + currentProject + '/ESTACION_1/reservedGeometry/features/')
    var newPostRef = postListRef.push()
    var firebaseKey = newPostRef.key

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
        
        // layerGeoJson.properties['title'] = 'reservedGeometry'
        // layerGeoJson.properties['key'] = newPostRef.key

        // Se agrega propiedad key a la capa 'layer'

        var feature = layer.feature = layer.feature || {}; // Initialize feature

        feature.type = feature.type || "Feature"; // Initialize feature.type
        var props = feature.properties = feature.properties || {}; // Initialize feature.properties
        props.key = newPostRef.key
        props.title = 'reservedGeometry'

        layerGeoJson = layer.toGeoJSON()

        // drawnItems.addLayer(layer);
    } else {
        // layerGeoJson = layer.toGeoJSON()
        // layerGeoJson.properties['title'] = 'reservedGeometry'
        // layerGeoJson.properties['key'] = newPostRef.key

        // Se agrega propiedad key a la capa 'layer'

        var feature = layer.feature = layer.feature || {}; // Initialize feature

        feature.type = feature.type || "Feature"; // Initialize feature.type
        var props = feature.properties = feature.properties || {}; // Initialize feature.properties
        props.key = newPostRef.key
        props.title = 'reservedGeometry'

        layerGeoJson = layer.toGeoJSON()

        // drawnItems.addLayer(layer);
        
    }

    try {
        obj['ESTACION_1']['reservedGeometry']['features'][firebaseKey] = layerGeoJson
    } catch {
        obj['ESTACION_1']['reservedGeometry']['features'] = []
        obj['ESTACION_1']['reservedGeometry']['features'][firebaseKey] = layerGeoJson
    }

    resetMap() // Se resetea el mapa con las nuevas capas
 
    newPostRef.set({
        "type": layerGeoJson["type"],
        "geometry": layerGeoJson["geometry"],
        "properties": layerGeoJson["properties"]
    });

    

    dictCountFigures['ESTACION_1'] = dictCountFigures['ESTACION_1'] + 1
});

map.on('draw:deleted', function (e) {
    
    var layersRemoved = e.layers
    var layersRemovedGeoJSON = layersRemoved.toGeoJSON()
    var layersRemovedList = layersRemovedGeoJSON.features
    var firebaseKey
    layersRemovedList.forEach(objRemoved => {
        firebaseKey = objRemoved.properties.key
        dbRt.ref('PROYECTOS/' + currentProject + '/ESTACION_1/reservedGeometry/features/' + firebaseKey).remove()

        delete obj['ESTACION_1']['reservedGeometry']['features'][firebaseKey]
    })

    // drawnItems.removeLayer(layersRemoved)

    resetMap() // Se resetea el mapa quitando las capas eliminadas
    
});

map.on('draw:edited', function (e) {

    var layersEdited = e.layers
    var layersEditedGeoJSON = layersEdited.toGeoJSON()
    var layersEditedList = layersEditedGeoJSON.features
    var postListRef = dbRt.ref('PROYECTOS/' + currentProject + '/ESTACION_1/reservedGeometry/features/')
    var newPostRef = postListRef.push()
    var previousFirebaseKey

    layersEditedList.forEach(objEdited => {
        previousFirebaseKey = objEdited.properties.key
        dbRt.ref('PROYECTOS/' + currentProject + '/ESTACION_1/reservedGeometry/features/' + previousFirebaseKey)
            .set({
                "type": objEdited["type"],
                "geometry": objEdited["geometry"],
                "properties": objEdited["properties"]
            })

        obj['ESTACION_1']['reservedGeometry']['features'][previousFirebaseKey] = objEdited
    })

    resetMap() // Se resetea el mapa modificando las capas

})

var table = $('#chooseStructureTable').DataTable({ // Tabla 
    pageLength: 5,
    language: {
    "processing": "Procesando...",
    "lengthMenu": "Mostrar _MENU_ registros",
    "zeroRecords": "No se encontraron resultados",
    "emptyTable": "Ningún dato disponible en esta tabla",
    "info": "Mostrando _START_ - _END_, de _TOTAL_ estructuras totales",
    "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
    "infoFiltered": "(filtrado de un total de _MAX_ registros)",
    "search": "Buscar:",
    "infoThousands": ",",
    "loadingRecords": "Cargando...",
    "paginate": {
        "first": "Primero",
        "last": "Último",
        "next": "Siguiente",
        "previous": "Anterior"
    },
    "aria": {
        "sortAscending": ": Activar para ordenar la columna de manera ascendente",
        "sortDescending": ": Activar para ordenar la columna de manera descendente"
    },
    "buttons": {
        "copy": "Copiar",
        "colvis": "Visibilidad",
        "collection": "Colección",
        "colvisRestore": "Restaurar visibilidad",
        "copyKeys": "Presione ctrl o u2318 + C para copiar los datos de la tabla al portapapeles del sistema. <br \/> <br \/> Para cancelar, haga clic en este mensaje o presione escape.",
        "copySuccess": {
            "1": "Copiada 1 fila al portapapeles",
            "_": "Copiadas %d fila al portapapeles"
        },
        "copyTitle": "Copiar al portapapeles",
        "csv": "CSV",
        "excel": "Excel",
        "pageLength": {
            "-1": "Mostrar todas las filas",
            "1": "Mostrar 1 fila",
            "_": "Mostrar %d filas"
        },
        "pdf": "PDF",
        "print": "Imprimir"
    },
    "autoFill": {
        "cancel": "Cancelar",
        "fill": "Rellene todas las celdas con <i>%d<\/i>",
        "fillHorizontal": "Rellenar celdas horizontalmente",
        "fillVertical": "Rellenar celdas verticalmentemente"
    },
    "decimal": ",",
    "searchBuilder": {
        "add": "Añadir condición",
        "button": {
            "0": "Constructor de búsqueda",
            "_": "Constructor de búsqueda (%d)"
        },
        "clearAll": "Borrar todo",
        "condition": "Condición",
        "conditions": {
            "date": {
                "after": "Despues",
                "before": "Antes",
                "between": "Entre",
                "empty": "Vacío",
                "equals": "Igual a",
                "not": "No",
                "notBetween": "No entre",
                "notEmpty": "No Vacio"
            },
            "moment": {
                "after": "Despues",
                "before": "Antes",
                "between": "Entre",
                "empty": "Vacío",
                "equals": "Igual a",
                "not": "No",
                "notBetween": "No entre",
                "notEmpty": "No vacio"
            },
            "number": {
                "between": "Entre",
                "empty": "Vacio",
                "equals": "Igual a",
                "gt": "Mayor a",
                "gte": "Mayor o igual a",
                "lt": "Menor que",
                "lte": "Menor o igual que",
                "not": "No",
                "notBetween": "No entre",
                "notEmpty": "No vacío"
            },
            "string": {
                "contains": "Contiene",
                "empty": "Vacío",
                "endsWith": "Termina en",
                "equals": "Igual a",
                "not": "No",
                "notEmpty": "No Vacio",
                "startsWith": "Empieza con"
            }
        },
        "data": "Data",
        "deleteTitle": "Eliminar regla de filtrado",
        "leftTitle": "Criterios anulados",
        "logicAnd": "Y",
        "logicOr": "O",
        "rightTitle": "Criterios de sangría",
        "title": {
            "0": "Constructor de búsqueda",
            "_": "Constructor de búsqueda (%d)"
        },
        "value": "Valor"
    },
    "searchPanes": {
        "clearMessage": "Borrar todo",
        "collapse": {
            "0": "Paneles de búsqueda",
            "_": "Paneles de búsqueda (%d)"
        },
        "count": "{total}",
        "countFiltered": "{shown} ({total})",
        "emptyPanes": "Sin paneles de búsqueda",
        "loadMessage": "Cargando paneles de búsqueda",
        "title": "Filtros Activos - %d"
    },
    "select": {
        "1": "%d fila seleccionada",
        "_": "%d filas seleccionadas",
        "cells": {
            "1": "1 celda seleccionada",
            "_": "$d celdas seleccionadas"
        },
        "columns": {
            "1": "1 columna seleccionada",
            "_": "%d columnas seleccionadas"
        }
    },
    "thousands": "."
}
}); 

var currentProjectStructures = [];
var currentProjectStructuresAsRegex = []
var currentProjectStructuresSTR = ''
var specialObjects = ['NAME', 'USERS']
var btnChooseStructure = document.getElementById('btnChooseStructure')
var btnCreateStructure = document.getElementById('btnCreateStructure')
var selectedStruct = document.getElementById('selectedStruct')
var inputCreateStructure = document.getElementById('inputCreateStructure')

map.on('draw:drawstart', function (e) {

    if (currentProjectStructures.length == 0) {
        Object.keys(obj).forEach((key, i) => {
            if (!specialObjects.includes(key))
            {
                currentProjectStructures.push(key)
                currentProjectStructuresAsRegex.push(`^${key}$`)
                table.row.add( [
                    key
                ] ).draw( false );
            }
        })
    }

    currentProjectStructuresSTR = currentProjectStructuresAsRegex.toString().replace(/,/g, '|')

    inputCreateStructure.setAttribute('pattern', '(?=^((?!(' + currentProjectStructuresSTR + ')).)*$)([a-zA-Z0-9-]*)')

    btnChooseStructure.click(); // Se simula click que abre el modal

})

$(document).ready(function() {
    // var t = $('#example').DataTable();
    var counter = 1;
 
    $('#addStructure').on( 'click', function () {
        
        btnCreateStructure.click();


        // table.row.add( [
        //     counter +'.1',
        // //     // counter +'.2',
        // //     // counter +'.3',
        // //     // counter +'.4',
        // //     // counter +'.5'
        // ] ).draw( false );
 
        // counter++;
    } );

    $('#chooseStructureTable tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            selectedStruct.textContent = 'Seleccione una estructura.'
            selectedStruct.style.color = 'red'
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            selectedStruct.textContent = this.textContent
            selectedStruct.style.color = 'green'
        }
    } );
 
    // Automatically add a first row of data
    // $('#addRow').click();
} );

function resetMap() {

    map.removeControl(panelLayers);
    map.removeControl(LControlLayers);
    map.removeControl(controlSearch)

    groupGen.eachLayer(function (group) {
        map.removeLayer(group)
    })
    map.removeLayer(groupGen)

    groupGen = new L.FeatureGroup()
    graphGeoMarkers(obj)
    // addGroupGenToMap()
    createPanelLayers(groupGen) 
    addSearchControlToMap()
    
}
// map.on("draw:drawstart", e => {
    
//     window.alert('Acaba de iniciar un dibujo')
//     console.log(e)
//     //if saved;

//     //if cancelled,
//   });


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
