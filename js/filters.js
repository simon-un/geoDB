var markerFilterStatus = {}

// slider profundidad

// Finding depth min-max values 
var valueProf
var minProf = null
var maxProf = null
const groupGenTreatmentProf = () => {
    groupGen.eachLayer(group => {
        group.eachLayer(layer => {
            layer.eachLayer(l => {
                valueProf = l.feature.properties['PROFUNDIDAD_DE_EXPLORACION']
                if (valueProf < minProf || minProf === null) minProf = valueProf;
                if (valueProf > maxProf || maxProf === null) maxProf = valueProf;
            })
        })
    })
    if (minProf == maxProf) {
        maxProf = maxProf + 0.0001
    }
    profundidadSlider.noUiSlider.updateOptions({
        start: [minProf, maxProf],
        'range': {
            'min': minProf,
            'max': maxProf
        }
    })
}

var profundidadSlider = document.getElementById('profundidadSlider');

noUiSlider.create(profundidadSlider, {
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
                valueProf = l.feature.properties['PROFUNDIDAD_DE_EXPLORACION']
                if (valueProf >= e[0] && valueProf <= e[1]) {
                    l.addTo(map)
                } else {
                    map.removeLayer(l)
                }
            })
        })

    })

});

var profundidadInputMin = document.getElementById('profundidadInputMin');
var profundidadInputMax = document.getElementById('profundidadInputMax');

profundidadSlider.noUiSlider.on('update', function (values, handle) {

    var value = values[handle];

    if (handle) {
        profundidadInputMax.value = value;
    } else {
        profundidadInputMin.value = value;
    }
});

profundidadInputMin.addEventListener('change', function () {
    profundidadSlider.noUiSlider.set([this.value, null]);
});

profundidadInputMax.addEventListener('change', function () {
    profundidadSlider.noUiSlider.set([null, this.value]);
});

// slider nivel freatico
// Finding depth min-max values 
var valueNivel
var minNivel = null
var maxNivel = null
const groupGenTreatmentNivel = () => {
    groupGen.eachLayer(group => {
        group.eachLayer(layer => {
            layer.eachLayer(l => {
                var valueNivel = l.feature.properties['NIVEL_FREATICO(m)']
                if (valueNivel < minNivel || minNivel === null) minNivel = valueNivel;
                if (valueNivel > maxNivel || maxNivel === null) maxNivel = valueNivel;
            })
        })
    })
    if (minNivel == maxNivel) {
        maxNivel = maxNivel + 0.0001
    }
    nivelFreaticoSlider.noUiSlider.updateOptions({
        start: [minNivel, maxNivel],
        'range': {
            'min': minNivel,
            'max': maxNivel
        }
    })
}

var nivelFreaticoSlider = document.getElementById('nivelFreaticoSlider');

noUiSlider.create(nivelFreaticoSlider, {
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
                valueNivel = l.feature.properties['NIVEL_FREATICO(m)']
                if (valueNivel >= e[0] && valueNivel <= e[1]) {
                    l.addTo(map)
                } else {
                    map.removeLayer(l)
                }
            })
        })
    })
});

var nivelInputMin = document.getElementById('nivelInputMin');
var nivelInputMax = document.getElementById('nivelInputMax');

nivelFreaticoSlider.noUiSlider.on('update', function (values, handle) {

    var value = values[handle];

    if (handle) {
        nivelInputMax.value = value;
    } else {
        nivelInputMin.value = value;
    }
});

nivelInputMin.addEventListener('change', function () {
    nivelFreaticoSlider.noUiSlider.set([this.value, null]);
});

nivelInputMax.addEventListener('change', function () {
    nivelFreaticoSlider.noUiSlider.set([null, this.value]);
});