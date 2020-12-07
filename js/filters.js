var markerFilterStatus = {}

// Get function
function get(object, key, default_value) {
    if (typeof object[key] == "undefined") {
        object[key] = default_value
    }
    return object
}

var filterTags = {}
var filterTagsUncompleted = {}
var defaultValues = {}
var divFilters = document.getElementById('div-filtros-tab')
const customCheck1 = document.getElementById('customCheck1')

function enableAllLayers() {
    groupGen.eachLayer(group => {
        group.eachLayer(layer => {
            layer.eachLayer(l => {
                l.addTo(map)
            })
        })
    })
}

function activateGenFilter() {

    customCheck1.addEventListener('click', e => {
        filtersEvents('activateGenFilter', [], [])
    })
}

const groupGenFilters = () => {
    var i = 0
    groupGen.eachLayer(group => {
        group.eachLayer(layer => {
            layer.eachLayer(l => {
                if (l.feature.properties.title.match(/reservedGeometry/)) {
                    // Do nothing
                } else {
                    var features = l.feature.properties
                    Object.keys(features).forEach(feature => {
                        if (typeof features[feature] === 'number' && filterTags[feature] == null) {
                            get(filterTags, feature, i)
                            i += 1
                        }
                    })
                }
            })
        })
    })

    Object.keys(filterTags).forEach(key => {
        // divFilters.innerHTML += `
        // <div>
        //     <div class="form-check form-check-inline">
        //         <p></p>
        //         <p></p>
        //         <label class="form-check-label" for="inlineCheckbox3">${key}</label>
        //     </div>
        //     <div id="${key}Slider"></div>
        //     <div class="form-check form-check-inline">
        //         <p></p>
        //         <input id="${key}InputMin" type="number">
        //         <label class="form-check-label" for="inlineCheckbox1">Min (m)</label>
        //     </div>
        //     <div class="form-check form-check-inline">
        //         <p></p>
        //         <input id="${key}InputMax" type="number">
        //         <label class="form-check-label" for="inlineCheckbox1">Max (m)</label>
        //     </div>
        // </div>`

        var div = document.createElement('div')
        div.id = key
        div.style.display = 'none'

        var div1 = document.createElement('div')
        div1.setAttribute('class', 'form-check form-check-inline')
        var p1 = document.createElement('p')
        var label1 = document.createElement('label')
        label1.setAttribute('class', 'form-check-label')
        label1.setAttribute('for', 'inlineCheckbox1')
        label1.textContent = key
        div1.appendChild(p1)
        div1.appendChild(p1)
        div1.appendChild(label1)

        var divSlider = document.createElement('div')
        divSlider.setAttribute('id', key + 'Slider')

        var div2 = document.createElement('div')
        div2.setAttribute('class', 'form-check form-check-inline')
        var p2 = document.createElement('p')
        var input2 = document.createElement('input')
        input2.setAttribute('id', key + 'InputMin')
        input2.setAttribute('type', 'number')
        var label2 = document.createElement('label')
        label2.setAttribute('class', 'form-check-label')
        label2.setAttribute('for', 'inlineCheckbox1')
        label2.textContent = 'Min'
        div2.appendChild(p2)
        div2.appendChild(input2)
        div2.appendChild(label2)

        var div3 = document.createElement('div')
        div3.setAttribute('class', 'form-check form-check-inline')
        var p3 = document.createElement('p')
        var input3 = document.createElement('input')
        input3.setAttribute('id', key + 'InputMax')
        input3.setAttribute('type', 'number')
        var label3 = document.createElement('label')
        label3.setAttribute('class', 'form-check-label')
        label3.setAttribute('for', 'inlineCheckbox1')
        label3.textContent = 'Max'
        div3.appendChild(p3)
        div3.appendChild(input3)
        div3.appendChild(label3)

        div.appendChild(div1)
        div.appendChild(divSlider)
        div.appendChild(div2)
        div.appendChild(div3)

        divFilters.appendChild(div)

        // Finding min, max for each layer
        window['min' + key] = null
        window['max' + key] = null
        window[key + 'Slider'] = document.getElementById(key + 'Slider');

        groupGen.eachLayer(group => {
            group.eachLayer(layer => {
                layer.eachLayer(l => {
                    if (l.feature.properties.title.match(/reservedGeometry/)) {
                        // Do nothing
                    } else {
                        window['value' + key] = l.feature.properties[key]
                        get(markerFilterStatus, l.feature.properties.title, [1])
                        if (window['value' + key] < window['min' + key] || window['min' + key] === null && typeof window['value' + key] === 'number') {
                            window['min' + key] = window['value' + key]
                        };
                        if (window['value' + key] > window['max' + key] || window['max' + key] === null && typeof window['value' + key] === 'number') {
                            window['max' + key] = window['value' + key]
                        };
                        if (typeof window['value' + key] != 'number') { // Checking if filter has uncomplete values
                            get(filterTagsUncompleted, key, false) // false if disabled
                        }
                    }
                })
            })
        })

        defaultValues[key] = [window['min' + key], window['max' + key]]

        // Creating noUiSlider
        noUiSlider.create(window[key + 'Slider'], {
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
                        if (l.feature.properties.title.match(/reservedGeometry/)) {
                            // Do nothing
                        } else {
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
                        }
                    })
                })
            })
        });

        // Creating handle-values interaction
        window[key + 'InputMin'] = document.getElementById(key + 'InputMin');
        window[key + 'InputMax'] = document.getElementById(key + 'InputMax');

        window[key + 'Slider'].noUiSlider.on('update', function (values, handle) {

            var value = values[handle];
            // console.log('#########################')
            // console.log(window[key + 'Slider'].noUiSlider.get())
            // console.log($('.selectpicker').val())

            filtersEvents('noUiSliderUpdate', [], [])

            if (handle) {
                window[key + 'InputMax'].value = value;
            } else {
                window[key + 'InputMin'].value = value;
            }
        });

        window[key + 'InputMin'].addEventListener('change', function () {
            window[key + 'Slider'].noUiSlider.set([this.value, null]);
            filtersEvents('noUiSliderUpdate', [], [])
        });

        window[key + 'InputMax'].addEventListener('change', function () {
            window[key + 'Slider'].noUiSlider.set([null, this.value]);
            filtersEvents('noUiSliderUpdate', [], [])
        });

        // Dealing with same min - max values, and no number values
        if (window['min' + key] == window['max' + key]) {
            window['max' + key] = window['max' + key] + 0.0001
        }

        if (typeof window['min' + key] === 'number' && typeof window['max' + key] === 'number') {
            window[key + 'Slider'].noUiSlider.updateOptions({
                start: [window['min' + key], window['max' + key]],
                'range': {
                    'min': window['min' + key],
                    'max': window['max' + key]
                }
            })
        }
    })

    // Adding data to select picker for enable-disable filters
    addDataToSelectpicker()

}

// Multiple selection filters
function addDataToSelectpicker() {
    $('select').selectpicker();

    const filterSelected = document.getElementById('filterActive')
    const selectpicker = document.getElementById('select')
    var filterTagsList = []

    Object.keys(filterTags).forEach(key => {
        selectpicker.innerHTML += `<option>${key}</option>`
        filterTagsList.push(key)
    })

    $('.selectpicker').selectpicker('refresh');

    $('.selectpicker').change(function () {

        filtersEvents('addDataToSelectpicker', filterSelected, filterTagsList)

        Object.keys(filterTagsUncompleted).forEach(key => {
            if (document.getElementById(key).style.display == 'none' && !customCheck1.checked) {
                customCheck1.click()
            }
        })
    });
}