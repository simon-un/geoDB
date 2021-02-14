function filtersEvents(eventName, filterSelected, filterTagsList) {
    switch (eventName) {

        case 'activateGenFilter':
            groupGen.eachLayer(group => {
                group.eachLayer(layer => {
                    layer.eachLayer(l => {
                        if (customCheck1.checked) {
                            l.addTo(map)
                        } else {
                            map.removeLayer(l)
                        }
                    })
                })
            })

            var anyFilterTagsUncompletedActivated = false // Chequea si algun condicional de FilterTagsUncompleted esta activado
            var difference3
            Object.keys(filterTagsUncompleted).forEach(key => {
                groupGen.eachLayer(group => {
                    group.eachLayer(layer => {
                        layer.eachLayer(l => {
                            if (l.feature.properties.title.match(/reservedGeometry/)) {
                                // Do nothing
                            } else {
                                markerFilterStatus[l.feature.properties.title][filterTags[key]] = 1
                            }
                        })
                    })
                })
                if (document.getElementById(key).style.display == 'block' && customCheck1.checked) {
                    window[key + 'Slider'].setAttribute('disabled', true);
                    document.getElementById(key + 'InputMin').disabled = true;
                    document.getElementById(key + 'InputMax').disabled = true;
                    document.getElementById('labelTitle' + key).textContent = key
                    difference3 = $('.selectpicker').val().filter(x => !Object.keys(filterTagsUncompleted).includes(x));
                    difference3.forEach(key => {
                            window[key + 'Slider'].noUiSlider.updateOptions({
                                start: [defaultValues[key][0], defaultValues[key][1]],
                            })
                        })
                    customCheck1.checked = true
                    anyFilterTagsUncompletedActivated = true
                } else if (document.getElementById(key).style.display == 'block' && !customCheck1.checked) {
                    window[key + 'Slider'].removeAttribute('disabled');
                    document.getElementById(key + 'InputMin').disabled = false;
                    document.getElementById(key + 'InputMax').disabled = false;
                    document.getElementById('labelTitle' + key).textContent = key + ' (Exploraciones sin esta propriedad: ocultas)'
                    window[key + 'Slider'].noUiSlider.updateOptions({
                                start: [defaultValues[key][0], defaultValues[key][1]],
                            })
                    anyFilterTagsUncompletedActivated = true
                }
            })

            // Evento para resetear los filtros completos al estar seleccionado customcheck1
            difference3 = $('.selectpicker').val().filter(x => !Object.keys(filterTagsUncompleted).includes(x));
            difference3.forEach(key => {
                if (customCheck1.checked && document.getElementById(key).style.display == 'block'){
                    window[key + 'Slider'].removeAttribute('disabled');
                    document.getElementById(key + 'InputMin').disabled = false;
                    document.getElementById(key + 'InputMax').disabled = false;
                    window[key + 'Slider'].noUiSlider.updateOptions({
                        start: [defaultValues[key][0], defaultValues[key][1]],
                    })
                    customCheck1.checked = true
                } else if (!customCheck1.checked && document.getElementById(key).style.display == 'block' && !anyFilterTagsUncompletedActivated) {
                    document.getElementById(key + 'InputMin').disabled = true;
                    document.getElementById(key + 'InputMax').disabled = true;
                    window[key + 'Slider'].setAttribute('disabled', true);
                    customCheck1.checked = false
                }
            })

            break

        case 'addDataToSelectpicker':

            var selectedItem = $('.selectpicker').val();

            // Muestra los objetos que no estan checkeados en el SelectPicker
            let difference = filterTagsList
                .filter(x => !selectedItem.includes(x))
                .concat(selectedItem.filter(x => !filterTagsList.includes(x)));
            difference.forEach(dif => {
                // Se ocultan los DOM que no esten checkeados, y se resetean a sus valores predeterminados
                document.getElementById(dif).style.display = 'none'
                // window[dif + 'Slider'].noUiSlider.set(defaultValues[dif][0], defaultValues[dif][1])
                window[dif + 'Slider'].noUiSlider.updateOptions({
                    start: [defaultValues[dif][0], defaultValues[dif][1]],
                })
            })
            filterSelected.innerHTML = ''

            if (selectedItem == '') {
                filterSelected.innerHTML = `
                <li>Ninguno</li>
            `
                document.getElementById('filterReset').style.display = 'none'
                // Cuando nada este seleccionado, se mostraran todas las capas en el mapa
                if (!customCheck1.checked) {
                    customCheck1.click()
                    customCheck1.checked = true
                } else {
                    customCheck1.click()
                    customCheck1.click()
                }

            } else {
                selectedItem.forEach(value => {
                    filterSelected.innerHTML += `
                <li>${value}</li>
            `
                    document.getElementById('filterReset').style.display = 'block'
                    // Se muestran las capas de los filtros que esten seleccionados
                    document.getElementById(value).style.display = 'block'

                    if (Object.keys(filterTagsUncompleted).includes(value) && !window[value + 'Slider'].getAttribute('disabled')) { // !window[value + 'Slider'].getAttribute('disabled')
                        // Si hay filtros incompletos activados, el check del filtro general se quita,
                        // ya que habran capas (las que no tienen valores) escondidas
                        customCheck1.checked = false
                    } else if (Object.keys(filterTagsUncompleted).includes(value) && window[value + 'Slider'].getAttribute('disabled')) {
                        // Si se desactiva un filtro mientras este checkeado el filtro general y el filtro incompleto este deshabilitado
                        // este ultimo se habilitara, y el general se desactivara
                        window[value + 'Slider'].removeAttribute('disabled');
                    } else if (!Object.keys(filterTagsUncompleted).includes(value) && customCheck1.checked) {
                        customCheck1.click()
                        customCheck1.click()
                    } 
                    // window[value + 'Slider'].noUiSlider.set(defaultValues[value][0], defaultValues[value][1])
                    window[value + 'Slider'].noUiSlider.updateOptions({
                        start: [defaultValues[value][0], defaultValues[value][1]],
                    })
                })
            }
            break

        case 'noUiSliderUpdate':

            $('.selectpicker').val().every(key => {
                if (!Object.keys(filterTagsUncompleted).includes(key)) {
                    if (window[key + 'Slider'].noUiSlider.get().map(Number) == defaultValues[key].toString()) {
                        return customCheck1.checked = true
                    } else {
                        return customCheck1.checked = false
                    }
                } else {
                    return customCheck1.checked = false
                }
            })

            break
    }
}

const filterReset = document.getElementById('filterReset')

filterReset.addEventListener('click', e => {
    $('.selectpicker').val().forEach(key => {
        if (filterTagsUncompleted[key] === false){
            document.getElementById('labelTitle' + key).textContent = key + ' (Exploraciones sin esta propriedad: ocultas)'
        } else {
            document.getElementById('labelTitle' + key).textContent = key
        }
        window[key + 'Slider'].removeAttribute('disabled');
        window[key + 'Slider'].noUiSlider.updateOptions({
            start: [defaultValues[key][0], defaultValues[key][1]],
        })
    })
})