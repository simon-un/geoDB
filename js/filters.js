var markerFilterStatus = {}

// Get function
function get(object, key, default_value) {
    if (typeof object[key] == "undefined") {
        object[key] = default_value
    }
    return object
}

var filterTags = {}
var divFilters = document.getElementById('div-filtros-tab')

const groupGenFilters = () => {
    var i = 0
    groupGen.eachLayer(group => {
        group.eachLayer(layer => {
            layer.eachLayer(l => {
                var features = l.feature.properties
                // var id = l.feature.properties['title']
                Object.keys(features).forEach(feature => {
                    if (typeof features[feature] === 'number' && filterTags[feature] == null) {
                        get(filterTags, feature, i)
                        i+=1
                    }
                })
            })
        })
    })
    
    // var objeto = {profundidad: 0, nivel_freatico: 1}
    Object.keys(filterTags).forEach(key => {
        // divFilters.innerHTML += `
        //                         <div>
        //                             <div class="form-check form-check-inline">
        //                                 <p></p>
        //                                 <p></p>
        //                                 <label class="form-check-label" for="inlineCheckbox3">${key}</label>
        //                             </div>
        //                             <div id="${key}Slider"></div>
        //                             <div class="form-check form-check-inline">
        //                                 <p></p>
        //                                 <input id="${key}InputMin" type="number">
        //                                 <label class="form-check-label" for="inlineCheckbox1">Min (m)</label>
        //                             </div>
        //                             <div class="form-check form-check-inline">
        //                                 <p></p>
        //                                 <input id="${key}InputMax" type="number">
        //                                 <label class="form-check-label" for="inlineCheckbox1">Max (m)</label>
        //                             </div>
        //                         </div>`
        

        var div = document.createElement('div')
        var divSlider = document.createElement('div')
        divSlider.setAttribute('id', key+'Slider')
        var div2 = document.createElement('div')
        div2.setAttribute('class', 'form-check form-check-inline')
        var input1 = document.createElement('input')
        input1.setAttribute('id', key+'InputMin')
        input1.setAttribute('type', 'number')
        var input2 = document.createElement('input')
        input2.setAttribute('id', key+'InputMax')
        input2.setAttribute('type', 'number')

        div.appendChild(divSlider)
        div.appendChild(div2).appendChild(input1)
        div.appendChild(div2).appendChild(input2)
        divFilters.appendChild(div)


        // var valueProf
        window['min'+key] = null
        window['max'+key] = null
        window[key+'Slider'] = document.getElementById(key+'Slider');

        groupGen.eachLayer(group => {
            group.eachLayer(layer => {
                layer.eachLayer(l => {
                    window['value'+key] = l.feature.properties[key]
                    get(markerFilterStatus, l.feature.properties.title, [1])
                    if (window['value'+key] < window['min'+key] || window['min'+key] === null && typeof window['value'+key] === 'number') window['min'+key] = window['value'+key];
                    if (window['value'+key] > window['max'+key] || window['max'+key] === null && typeof window['value'+key] === 'number') window['max'+key] = window['value'+key];
                })
            })
        })

        noUiSlider.create(window[key+'Slider'], {
            start: [0, 0.0001],
            connect: true,
            range: {
                'min': 0,
                'max': 0.0001
            }
        }).on('update', e => {
            groupGen.eachLayer(function (group) {
                group.eachLayer(layer => {
                    layer.eachLayer(l => {
                        valueProf = l.feature.properties[key]
                        if (valueProf >= e[0] && valueProf <= e[1]) {
                            markerFilterStatus[l.feature.properties.title][filterTags[key]] = 1
                            if (!markerFilterStatus[l.feature.properties.title].includes(0)) {
                                l.addTo(map)
                            }
                        } else {
                            markerFilterStatus[l.feature.properties.title][filterTags[key]] = 0
                            map.removeLayer(l)
                        }
                    })
                })
            })
        });

        window[key + 'InputMin'] = document.getElementById(key + 'InputMin');
        window[key + 'InputMax'] = document.getElementById(key + 'InputMax');

        window[key + 'Slider'].noUiSlider.on('update', function (values, handle) {

            var value = values[handle];

            if (handle) {
                window[key + 'InputMax'].value = value;
            } else {
                window[key + 'InputMin'].value = value;
            }
        });

        window[key + 'InputMin'].addEventListener('change', function () {
            window[key + 'Slider'].noUiSlider.set([this.value, null]);
        });

        window[key + 'InputMax'].addEventListener('change', function () {
            window[key + 'Slider'].noUiSlider.set([null, this.value]);
        });

        if (window['min'+key] == window['max'+key]) {
            window['max'+key] = window['max'+key] + 0.0001
        }
        
        if (typeof window['min'+key] === 'number' && typeof window['max'+key] === 'number') {
            window[key+'Slider'].noUiSlider.updateOptions({
                start: [window['min'+key], window['max'+key]],
                'range': {
                    'min': window['min'+key],
                    'max': window['max'+key]
                }
            })
        } else {
            window[key+'Slider'].setAttribute('disabled', true)
        }
    })

    // console.log(document.documentElement.innerHTML)
}


// slider profundidad

// Finding depth min-max values 
// var valueProf
// var minProf = null
// var maxProf = null
// var profundidadSlider = document.getElementById('profundidadSlider');

// const groupGenTreatmentProf = () => {
//     groupGen.eachLayer(group => {
//         group.eachLayer(layer => {
//             layer.eachLayer(l => {
//                 valueProf = l.feature.properties['profundidad']
//                 get(markerFilterStatus, l.feature.properties.title, [1])
//                 if (valueProf < minProf || minProf === null) minProf = valueProf;
//                 if (valueProf > maxProf || maxProf === null) maxProf = valueProf;
//             })
//         })
//     })
//     if (minProf == maxProf) {
//         maxProf = maxProf + 0.0001
//     }
//     profundidadSlider.noUiSlider.updateOptions({
//         start: [minProf, maxProf],
//         'range': {
//             'min': minProf,
//             'max': maxProf
//         }
//     })
// }

// noUiSlider.create(profundidadSlider, {
//     start: [0, 0.0001],
//     connect: true,
//     range: {
//         'min': 0,
//         'max': 0.0001
//     }
// }).on('update', e => {
//     groupGen.eachLayer(function (group) {
//         group.eachLayer(layer => {
//             layer.eachLayer(l => {
//                 valueProf = l.feature.properties['profundidad']
//                 if (valueProf >= e[0] && valueProf <= e[1]) {
//                     markerFilterStatus[l.feature.properties.title][0] = 1
//                     if (!markerFilterStatus[l.feature.properties.title].includes(0)) {
//                         l.addTo(map)
//                     }
//                 } else {
//                     markerFilterStatus[l.feature.properties.title][0] = 0
//                     map.removeLayer(l)
//                 }
//             })
//         })
//     })
// });

// var profundidadInputMin = document.getElementById('profundidadInputMin');
// var profundidadInputMax = document.getElementById('profundidadInputMax');

// profundidadSlider.noUiSlider.on('update', function (values, handle) {

//     var value = values[handle];

//     if (handle) {
//         profundidadInputMax.value = value;
//     } else {
//         profundidadInputMin.value = value;
//     }
// });

// profundidadInputMin.addEventListener('change', function () {
//     profundidadSlider.noUiSlider.set([this.value, null]);
// });

// profundidadInputMax.addEventListener('change', function () {
//     profundidadSlider.noUiSlider.set([null, this.value]);
// });

// // slider nivel freatico
// // Finding depth min-max values 
// var valueNivel
// var minNivel = null
// var maxNivel = null
// var nivelFreaticoSlider = document.getElementById('nivelFreaticoSlider');
// const groupGenTreatmentNivel = () => {
//     groupGen.eachLayer(group => {
//         group.eachLayer(layer => {
//             layer.eachLayer(l => {
//                 var valueNivel = l.feature.properties['nivel_freatico']
//                 if (valueNivel < minNivel || minNivel === null) minNivel = valueNivel;
//                 if (valueNivel > maxNivel || maxNivel === null) maxNivel = valueNivel;
//             })
//         })
//     })
//     if (minNivel == maxNivel) {
//         maxNivel = maxNivel + 0.0001
//     }
//     nivelFreaticoSlider.noUiSlider.updateOptions({
//         start: [minNivel, maxNivel],
//         'range': {
//             'min': minNivel,
//             'max': maxNivel
//         }
//     })
// }

// noUiSlider.create(nivelFreaticoSlider, {
//     start: [0, 0.0001],
//     connect: true,
//     range: {
//         'min': 0,
//         'max': 0.0001
//     }
// }).on('update', e => {
//     groupGen.eachLayer(function (group) {
//         group.eachLayer(layer => {
//             layer.eachLayer(l => {
//                 valueNivel = l.feature.properties['nivel_freatico']
//                 if (valueNivel >= e[0] && valueNivel <= e[1]) {
//                     markerFilterStatus[l.feature.properties.title][1] = 1
//                     if (!markerFilterStatus[l.feature.properties.title].includes(0)) {
//                         l.addTo(map)
//                     }
//                 } else {
//                     markerFilterStatus[l.feature.properties.title][1] = 0
//                     map.removeLayer(l)
//                 }
//             })
//         })
//     })
// });

// var nivelInputMin = document.getElementById('nivelInputMin');
// var nivelInputMax = document.getElementById('nivelInputMax');

// nivelFreaticoSlider.noUiSlider.on('update', function (values, handle) {

//     var value = values[handle];

//     if (handle) {
//         nivelInputMax.value = value;
//     } else {
//         nivelInputMin.value = value;
//     }
// });

// nivelInputMin.addEventListener('change', function () {
//     nivelFreaticoSlider.noUiSlider.set([this.value, null]);
// });

// nivelInputMax.addEventListener('change', function () {
//     nivelFreaticoSlider.noUiSlider.set([null, this.value]);
// });

// Multiple selection filters

$('select').selectpicker();

const filterSelected = document.getElementById('filterActive')
$('.selectpicker').change(function () {
    var selectedItem = $('.selectpicker').val();
    filterSelected.innerHTML = ''
    if (selectedItem == '') {
        filterSelected.innerHTML = `
            <li>Ninguno</li>
        `
    } else {
        selectedItem.forEach(value => {
            filterSelected.innerHTML += `
            <li>${value}</li>
        `
        })
    }
});