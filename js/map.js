// const { auth } = require("firebase-admin");

const regex = /"([a-zñA-Z0-9Ñ -]*)"/gm;
const str = decodeURI(window.location.search) //.replace(/%20/g, ' ').replace(/%C3%B1/g, 'n')
console.log(str)
let m;

var listMatches = []
while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        if (groupIndex == 1) {
            listMatches.push(match)
        }
        // console.log(`Found match, group ${groupIndex}: ${match}`);
    });
}

var currentProject = listMatches[0]
let currentRole = listMatches[1];
let projectName = listMatches[2];
// const { auth } = require("firebase");
// var currentProject = sessionStorage.getItem('currentProject');
// let projectName = sessionStorage.currentProjName;
// let currentRole = sessionStorage.currentRol;

// Set current project's name and role
if (currentRole) {
    document.getElementById('rol_p').innerHTML = currentRole;
}
if (projectName) {
    document.getElementById('proj_p').innerHTML = projectName;
    document.getElementById('pStruct').innerHTML += projectName;
}

const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const loggedInForms = document.querySelectorAll('.formul')
var userUid = null; // Id del usuario para trar info 

const loginCheck = user => {
    if (user) {
        loggedInLinks.forEach(link => {
            link.style.display = 'block'
        })
        loggedOutLinks.forEach(link => {
            link.style.display = 'none'
        })

    } else {
        loggedInLinks.forEach(link => {
            link.style.display = 'none'
        })
        document.getElementById('goback').click();
    }
}


//Logout
const logout = document.querySelector('#logout')

logout.addEventListener('click', e => {
    e.preventDefault()
    auth.signOut().then(() => {
        // console.log('Sign out correcto')
    })
})


// Unpack
var dict = {}
var dictLevel = {}
const unpack = (obj, lenObj, ID, status, ID_prev, i, dicc, col, depth, rec) => {
    Object.keys(obj).forEach(key => {

        if (typeof (obj[key]) === 'object' && obj[key] !== null && i <= depth) {

            var id = ''

            color_btn = ['btn-primary', 'btn-primary', 'btn-success', 'btn-primary', 'btn-info',
                'btn-warning', 'btn-danger'
            ]

            color = ['text-primary', 'text-primary', 'text-secondary', 'text-success', 'text-danger',
                'text-warning', 'text-info'
            ]

            color_tr = ['table-primary', 'table-primary', 'table-success', 'table-primary', 'table-info', 'table-warning', 'table-danger']
            position = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh']

            id = key + uniqueID() // Para crear ids unicos
            if (status === true) {
                dicc = get(dicc, ID, [color_btn[i], color_tr[i], position[i]])
            } else {
                dicc = get(dicc, ID, [color_btn[i], color_tr[i], position[i]])
            }

            Level = get(dictLevel, key + ID, get(dictLevel, ID_prev, 0)[ID_prev] + 1)

            if (status === true) {
                t = `
                <tr>
                    <td colspan="10">
                        <div class="${ID} collapse ${dicc[ID][2]}" id="${key+ID}" >
                            <button class="btn ${dicc[ID][0]} btn-sm sticky" type="button" data-toggle="collapse" data-target=".${id}" aria-expanded="false" aria-controls="${id}">
                                ${key}
                            </button>
                        </div>    

                        <div class = "collapse ${id}" >
                            <table class="table table-bordered" >
                                <tbody id="tbody${id}">
                                    
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                `;

                var doc = document.querySelector('#tbody' + ID)

            } else {
                t = `
                <div id="${key+ID}">
                    <table class="table borderless w-auto small table-sm" >
                        <tbody>
                            <tr>
                                <td>
                                    <button class="btn btn-outline-primary btn-sm sticky" type="button" data-toggle="collapse" data-target=".${id}" aria-expanded="false" aria-controls="${id}">
                                        ${key}
                                    </button>
                                </td>
                                <td>
                                    <div class = "collapse ${id}" >
                                        <table class="table table-bordered">
                                            <tbody id="tbody${id}">
                                                
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                
                `;

                var doc = document.querySelector('#' + ID_prev);

            }

            doc.innerHTML += t;

            i = dictLevel[key + ID]
            i += 1

            var color = dicc[ID][1]

            return unpack(obj[key], Object.values(obj[key]).filter(v => typeof v === 'object').length, id, true, key + ID, i, dicc, color, depth, true);

        } else {

            color_tr = ['table-primary', 'table-success', 'table-info', 'table-warning', 'table-danger']

            t_r = `
                        <tr class="${col}">
                            <th scope="row">${key}</td>
                            <td>${obj[key]}</td>
                        </tr>
            `

            var docInfo = document.querySelector('#tbody' + ID);
            docInfo.innerHTML += t_r;

        }


    })
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function uniqueID() {
    return Math.floor(Math.random() * Date.now())
}

function get(object, key, default_value) {
    if (typeof object[key] == "undefined") {
        object[key] = default_value
    }
    // var result = object[key];
    return object
}

//Events
//List data for auth state changes

auth.onAuthStateChanged(user => {
    if (user && infoRequested) {
        userUid = user.uid
        loggedInLinks.forEach(link => {
            link.style.display = 'block'
        })

        // Chequea los proyectos en los que se encuentra el usuario
        var prIdList = [];
        dbRt.ref('USERS/' + userUid).once('value', (snap) => {
            var prIdDict = snap.val();

            try {
                Object.keys(prIdDict).forEach(key => {

                    if (prIdDict[key]) {
                        prIdList.push(key)
                    }

                })
            } catch {
                
            }
        }).then(() => {

            if (prIdList.includes(currentProject) || currentProject == 'PUBLIC') {

                dbRt.ref('PROYECTOS').child(currentProject).once('value', async snap => {
                    var obj = snap.val()
                    await graphGeoMarkers(obj)
                    await groupGenFilters() // Find it in filters.js file
                    await enableAllLayers()
                    await activateGenFilter()
                    await fitBounds()

                    // await groupGenTreatmentProf() // Find it in filters.js file
                    // await groupGenTreatmentNivel() // Find it in filters.js file

                })

                document.getElementById('alertMsgP').textContent += 'Bienvenido al mapa ' + String(user.displayName).match(/(\w*)/)[1] + '!'

            } else {
                document.location.href = 'exception.html'
            }
        })

    } else {
        userUid = null
        loginCheck(user);
    }
})

// Starting to work on the map
const mapdiv = document.getElementById('mapid');
const navbar = document.getElementById('navbarid');
const alertnotif = document.getElementById('alert-notif');
const optionsBtn = document.getElementById('sidebar-button');
const mainfo = document.getElementById('maininfo');

navbar.style.height = String(navbar.getBoundingClientRect().height / 2) + 'px';
// mainfo.style.height = String(navbar.getBoundingClientRect().height) + 'px';
// mapdiv.style.height = String(window.innerHeight - navbar.getBoundingClientRect().height * 2) + 'px';
mapdiv.style.height = String(window.innerHeight - navbar.getBoundingClientRect().height - mainfo.offsetHeight) + 'px';

// Working on the side panel
const sidePanel = document.getElementById("mySidebar");
sidePanel.style.height = mapdiv.style.height;


window.addEventListener('resize', (evt) => {
    mapdiv.style.height = String(window.innerHeight - navbar.getBoundingClientRect().height - mainfo.offsetHeight) + 'px';
    sidePanel.style.height = mapdiv.style.height;
})

alertnotif.addEventListener('click', () => {
    alertnotif.style.display = 'none';
})

const map = L.map('mapid').setView([4.6384979, -74.082547], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// const marker = L.marker([4.6384979,-74.082547]).addTo(map);

var inicio = document.querySelector('#inicio')
var list = []
var clicked = false

const graphMarkers = (Obj) => {

    Object.keys(Obj).forEach(key => {

        window['marker' + key] = L.marker([Obj[key]['Norte'], Obj[key]['Este']]).addTo(map)

        window['clicked' + 'marker' + key] = false
        window['marker' + key].bindPopup(`<b>ID_EXPLORACION:</b><br>${key}`)
        // list.push(['marker'+key]) // Utilizar para agrupar exploraciones

        var infoRequested = {} // Objeto que evita solicitar informacion mas de una vez para
        // un objeto de firebase

        window['marker' + key].on('click', e => {

            // if (!infoRequested['marker' + key]) {
            //     infoRequested['marker' + key] = true
            //     dbRt.ref('PROYECTOS/PUBLIC/BOGOTA').child(key).on('value', (snap) => {
            //         var obj = snap.val()
            //         dict = {}
            //         dictLevel = {}

            //         div = `<div class="table-responsive text-nowrap col-md-12 mx-auto inicio" id="${key}inicio">

            //         </div>`
            //         inicio.innerHTML += div

            //         var objMod = {}

            //         objMod[key] = obj
            //         unpack(objMod, Object.values(obj).filter( v => typeof v === 'object').length, '', false, key+'inicio', 0, dict, '', 8, false)
            //     })
            // } else {
            //     console.log('Object requested')
            // }


            openNav()
            $('#inicio').toggle()
            window['marker' + key].openPopup()
            if (!clicked) {
                //     // window['marker'+key].setIcon(greenIcon)
                window['marker' + key].openPopup()
                clicked = true
                $("#inicio").children().hide();
                $('#' + key + 'inicio').show()
            } else {
                // window['marker'+key].setIcon(blueIcon)
                clicked = false
            }
        }).on('mouseover', e => {
            window['marker' + key].openPopup()
        }).on('mouseout', e => {
            if (!window['clicked' + 'marker' + key]) {
                window['marker' + key].closePopup()
            }
        })
        // list.push(eval('marker'+key))
    })
}

var groupGen = new L.FeatureGroup();
var overlayMaps = {}
var name
var infoRequested = {} // Objeto que evita solicitar informacion mas de una vez para
// un objeto de firebase
const ulStructuresTab = document.querySelector('#ul-structures-tab')
const ulSondeosTab = document.querySelector('#ul-sondeos-tab')
const myTbodyStructureNav = document.querySelector('#myTbodyStructureNav')
const myTbodySondeosNav = document.querySelector('#myTbodySondeosNav')
const pSondeos = document.querySelector('#pSondeos')
const myTableSondeosNav = document.querySelector('#myTableSondeosNav')
const myFormSondeosNav = document.querySelector('#myFormSondeosNav')
const myFormStructureNav = document.querySelector('#myFormStructureNav')


function activeTab(tab, structureObj, name) {

    myTableSondeosNav.style.display = 'table'
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    myTbodySondeosNav.innerHTML = ''
    Object.keys(structureObj).forEach(key => {

        if (key != 'reservedGeometry') {
            pSondeos.innerHTML = `<p style="text-align:justify; color:#55595c" id="pStruct">
                Se muestran todos los sondeos relacionados a la estructura ${name} 
                </p>
                `

            myTbodySondeosNav.innerHTML += `
                <tr>
                    <td colspan="2">
                        <a href="#" id="a${key}" onclick="openInfo('nav-stratCol', '${key}')">${key}</a>
                    </td>
                </tr>
                `
        }

    })
};

function openInfo(tab, key) {
    controlSearch.searchText(key)
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    getInfo(key)
    clicked = true
    $("#inicio").children().hide();
    $('#' + key + 'inicio').show()
    myFormSondeosNav.reset();
    $("#myInputSondeosNav").keyup()
}

//Getting info
var cacheInfo = {}
var structureAsValue = {} // Se toman las estructuras como valores,
// y las exploraciones como llaves

function getInfo(key) {
    if (!infoRequested['marker' + key]) {
        document.getElementById('divSvg').style.display = "block";
        clicked = false
        infoRequested['marker' + key] = true
        // + currentProject + '/' + 
        dbRt.ref('PROYECTOS/' + currentProject + '/' + structureAsValue[key]).child(key).once('value', (snap) => {
            var obj = snap.val()
            cacheInfo[key] = obj
            extractStratigraphicData(obj)

            dict = {}
            dictLevel = {}

            div = `<div class="table-responsive text-nowrap col-md-12 mx-auto inicio" id="${key}inicio">
            
            </div>`
            inicio.innerHTML += div

            var objMod = {}

            objMod[key] = obj
            unpack(objMod, Object.values(obj).filter(v => typeof v === 'object').length, '', false, key + 'inicio', 0, dict, '', 8, false)
        })
    } else {
        console.log('Object requested')
        extractStratigraphicData(cacheInfo[key])
    }

    if ($('#inicio').is(":hidden")) {
        $('#inicio').show();
    }
}

var i = 0
const reservedWords = ['NAME', 'USERS']
var dictCountFigures = {}

const graphGeoMarkers = (Obj) => {

    Object.keys(Obj).forEach(key => {

        if (!reservedWords.includes(key)) {

            var structureName = key
            var group = new L.FeatureGroup()
            var ObjPerf = Obj[key]
            name = key

            // Contenido de Estructuras
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.setAttribute("colspan", "2");
            var a = document.createElement('a');
            a.setAttribute('href', '#');
            a.textContent = name

            a.onclick = function () {
                myFormStructureNav.reset()
                $("#myInputStructureNav").keyup()
                activeTab('nav-sondeos', Obj[key], key)
            };
            tr.appendChild(td).appendChild(a)
            myTbodyStructureNav.appendChild(tr)

            var reservedGeometryToList = []
            Object.keys(ObjPerf).forEach(key => {
                if (key.match(/reservedGeometry/)) {

                    var reservedGeometryObjects = ObjPerf[key]
                    var features = reservedGeometryObjects['features']

                    try {
                        Object.keys(features).forEach(key => {
                            reservedGeometryToList.push(features[key])
                        })
                    } catch {

                    }
                    


                    group.addLayer(L.geoJSON(reservedGeometryToList, {
                        onEachFeature: {
                            title: key
                        },
                        onEachFeature: function (feature, layer) {
                            loadLeafletDrawFigures(layer)
                            dictCountFigures[name] = get(dictCountFigures, name, 0)[name] + 1
                            layer.bindPopup(`<b>ID_ESTRUCTURA:</b><br>${name}`)
                            layer.on({
                                mouseover: e => {
                                    layer.openPopup()
                                },
                                mouseout: e => {
                                    layer.closePopup()
                                }
                            })
                        }
                    })).addTo(map)

                } else {

                    get(structureAsValue, key, structureName)
                    group.addLayer(L.geoJSON(ObjPerf[key], {
                        onEachFeature: {
                            title: key
                        },
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(`<b>ID_EXPLORACION:</b><br>${key}`)
                            layer.on({
                                click: (e) => {
                                    getInfo(key)

                                    openNav()
                                    layer.openPopup()

                                    if (!clicked) {
                                        layer.openPopup()
                                        clicked = true
                                        // console.log(clicked)

                                        if ($('#inicio').is(":visible")) {
                                            $("#inicio").children().hide();
                                            $('#' + key + 'inicio').show()
                                        }
                                    } else {
                                        clicked = false
                                        if ($('#inicio').is(":visible")) {
                                            $("#inicio").children().hide();
                                            $('#' + key + 'inicio').show()
                                        }
                                        // console.log(clicked)
                                    }
                                },
                                mouseover: e => {
                                    layer.openPopup()
                                },
                                mouseout: e => {
                                    layer.closePopup()
                                }
                            });
                        }
                    }).addTo(map))
                }

                // let s = '   reservedGeometryUNA1p2 Deci, 35; sd'

                // if (s.match(/reservedGeometry/)) {
                //     console.log('Encontrado')
                // } else {
                //     console.log('No encontrado')
                // }

                // if (i == 2) {
                //     const objeto = {
                //         "name": key,
                //         "type": "FeatureCollection",
                //         "features": [{
                //                 "type": "Feature",
                //                 "properties": {},
                //                 "geometry": {
                //                     "type": "Polygon",
                //                     "coordinates": [
                //                         [
                //                             [
                //                                 -74.16080474853516,
                //                                 4.667109618126994
                //                             ],
                //                             [
                //                                 -74.13814544677734,
                //                                 4.667109618126994
                //                             ],
                //                             [
                //                                 -74.13814544677734,
                //                                 4.679428147769262
                //                             ],
                //                             [
                //                                 -74.16080474853516,
                //                                 4.679428147769262
                //                             ],
                //                             [
                //                                 -74.16080474853516,
                //                                 4.667109618126994
                //                             ]
                //                         ]
                //                     ]
                //                 }
                //             },
                //             {
                //                 "type": "Feature",
                //                 "properties": {},
                //                 "geometry": {
                //                     "type": "LineString",
                //                     "coordinates": [
                //                         [
                //                             -74.16526794433594,
                //                             4.662661207034317
                //                         ],
                //                         [
                //                             -74.16389465332031,
                //                             4.685587331332217
                //                         ],
                //                         [
                //                             -74.13368225097656,
                //                             4.684902980281527
                //                         ]
                //                     ]
                //                 }
                //             }
                //         ]
                //     }
                //     group.addLayer(L.geoJSON(objeto, {
                //         onEachFeature: {
                //             title: objeto['name']
                //         },
                //         onEachFeature: function (feature, layer) {
                //             layer.bindPopup(`<b>ID_ESTRUCTURA:</b><br>${objeto['name']}`)
                //             layer.on({
                //                 mouseover: e => {
                //                     layer.openPopup()
                //                 },
                //                 mouseout: e => {
                //                     layer.closePopup()
                //                 }
                //             })
                //         }
                //     })).addTo(map)
                //     i = 3
                // }

                // if (i == 1) {
                //     group.addLayer(L.geoJSON({
                //         "type": "FeatureCollection",
                //         "features": [{
                //             "type": "Feature",
                //             "properties": {},
                //             "geometry": {
                //                 "type": "Polygon",
                //                 "coordinates": [
                //                     [
                //                         [
                //                             -74.16732788085938,
                //                             4.6133846214188114
                //                         ],
                //                         [
                //                             -74.17625427246094,
                //                             4.600722722785758
                //                         ],
                //                         [
                //                             -74.17076110839844,
                //                             4.585322812931121
                //                         ],
                //                         [
                //                             -74.14260864257812,
                //                             4.5873761534497035
                //                         ],
                //                         [
                //                             -74.14398193359375,
                //                             4.607567020318201
                //                         ],
                //                         [
                //                             -74.16732788085938,
                //                             4.6133846214188114
                //                         ]
                //                     ]
                //                 ]
                //             }
                //         }]
                //     })).addTo(map)
                //     i = 2
                // }

                // if (i == 0) {
                //     group.addLayer(L.geoJSON({
                //         "type": "FeatureCollection",
                //         "features": [{
                //             "type": "Feature",
                //             "properties": {},
                //             "geometry": {
                //                 "type": "LineString",
                //                 "coordinates": [
                //                     [
                //                         -74.08252716064453,
                //                         4.547334951577334
                //                     ],
                //                     [
                //                         -74.09076690673828,
                //                         4.671215818726475
                //                     ],
                //                     [
                //                         -74.12132263183594,
                //                         4.673268910010635
                //                     ]
                //                 ]
                //             }
                //         }]
                //     })).addTo(map)

                //     // groupGen.addLayer(group)
                //     // overlayMaps['TEST'] = group
                //     // map.addLayer(group)
                //     i = 1
                // }

            })

            groupGen.addLayer(group)
            overlayMaps[name] = group
            map.addLayer(group)
        }
    })

    L.control.layers({}, overlayMaps, {
        position: 'bottomleft'
    }).addTo(map);

    console.log('aaaa', dictCountFigures)

}

map.addLayer(groupGen)

// Show map and markers boundaries
function fitBounds() {
    map.fitBounds(groupGen.getBounds())

    const zoomAllButton = document.getElementById('zoomAllButton')

    zoomAllButton.addEventListener('click', e => {
        map.fitBounds(groupGen.getBounds())
    })
}

map.on('click', e => {
    if (clicked) {
        $('#inicio').toggle()
        clicked = false
    }
})

// General structures filter
var overLayers = [{
    group: "Filtro general",
    layers: [{
        active: true,
        name: "Estructuras",
        layer: groupGen,

    }]
}]

var panelLayers = new L.Control.PanelLayers({}, overLayers, {
    compact: true,
    collapsibleGroups: true,
    position: 'bottomleft',
});

map.addControl(panelLayers);

// Structures nav filter
$(document).ready(function () {
    $("#myInputStructureNav").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTbodyStructureNav tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

// Sondeos nav filter
$(document).ready(function () {
    $("#myInputSondeosNav").on("keyup", function (e) {
        var value = $(this).val().toLowerCase();
        $("#myTbodySondeosNav tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });

        $("#myTbodySondeosNav tr").on('click', e => {
            controlSearch.searchText(e.target.text)
        })
    });
});


// Icons for markers
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Search control
var controlSearch = new L.Control.Search({
    position: 'topleft',
    layer: groupGen,
    initial: true,
    zoom: 20,
    marker: false,
    firstTipSubmit: true,
    textErr: 'Exploración no encontrada',
    textPlaceholder: 'Buscar',
});

controlSearch.on('search:locationfound', e => {

    e.layer.setIcon(greenIcon)
    e.layer.openPopup()
})

map.addControl(controlSearch)

showMsg = (msg, className = 'alert alert-primary') => {
    // Options for className:
    // - alert alert-secondary
    // - alert alert-success
    // - alert alert-danger
    // - alert alert-warning
    // - alert alert-info
    // - alert alert-light
    // - alert alert-dark
    alertnotif.className = className;
    document.getElementById('alertMsgP').innerHTML = msg;
    alertnotif.style.display = 'block';
}

// mapdiv.addEventListener('click', () => {
//     showMsg("Hizo click en el mapa", 'alert alert-info')
//     // optionsBtn.style.display = "block";
// })

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
    if (window.innerWidth <= 700) {
        var percentage = "95%"
        alertnotif.style.display = 'none'
    } else {
        var percentage = "50%"
    }

    document.getElementById("mySidebar").style.width = percentage;
    document.getElementById("map-div").style.marginRight = percentage;
    optionsBtn.style.display = "none";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("map-div").style.marginRight = "0";
    optionsBtn.style.display = "block";
}