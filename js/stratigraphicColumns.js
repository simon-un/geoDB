function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function extractStratigraphicData(object) {

    var layersList = object.layers
    var listDepth = []
    var min = null
    var max = null
    var texts = []
    var colors = {}
    const pStratCol = document.getElementById('pStratCol')
    pStratCol.innerHTML = `<p style="text-align:justify; color:#55595c" id="pStratCol">
            Perfil estratigráfico del sondeo: ${object.properties.title}
        </p>
        <p style="text-align:justify; color:green" id="pStratCol">
            Ubique el <img src="images/pointer.png" style="display:inline;" width="15" height="15"> <span style="color:blue;">Cursor </span> sobre un estrato para mostrar información
            <img src="images/infoStrat.png" style="display:inline;" width="150" height="60">
        </p>
        <p style="text-align:justify; color:green">
            Click sobre un estrato para mostrar información de muestras
        </p>`

    var buttonSondeo = document.createElement('button')
    buttonSondeo.className = "btn btn-info"
    buttonSondeo.id = "buttonSondeo"
    buttonSondeo.textContent = "Mostrar tabla con todas las muestras"

    pStratCol.appendChild(buttonSondeo)

    // Query of all "sondeo" info
    buttonSondeo.addEventListener('click', e => {

        // Aqui se hace todo el tratamiento para enviar el objeto como si fuera un estrato
        var stratums = object.layers
        var muestras = {}
        var textObjAsD3 = {} // Simula el objeto text usado en d3 para la info de los estratos
        Object.keys(stratums).forEach(stratum => {
            if (stratums[stratum]['MUESTRAS']) {
                Object.keys(stratums[stratum]['MUESTRAS']).forEach(muestra => {
                    get(muestras, muestra, stratums[stratum]['MUESTRAS'][muestra])
                })
            }
        })

        var sondeoProperties = object.properties
        Object.keys(sondeoProperties).forEach(key => {
            get(textObjAsD3, key, sondeoProperties[key])
        })
        
        textObjAsD3['MUESTRAS'] = muestras

        sessionStorage.setItem('sondeoObject', JSON.stringify({"text": textObjAsD3}));
        sessionStorage.setItem('isStratum', false)
        window.open( 
            "stratumInfo.html", "_blank"); 
    })

    Object.keys(layersList).forEach(key => {
        listDepth.push({
            "top": layersList[key]['TRAMO_DESDE(m)'],
            "bottom": layersList[key]['TRAMO_HASTA(m)']
        })

        // Colors Object
        get(colors, layersList[key]['USCS'], getRandomColor())

        // Min value
        if (min === null || layersList[key]['TRAMO_DESDE(m)'] < min) {
            min = layersList[key]['TRAMO_DESDE(m)']
        } else if (layersList[key]['TRAMO_HASTA(m)'] < min) {
            min = layersList[key]['TRAMO_DESDE(m)']
        }
        // Max value
        if (max === null || layersList[key]['TRAMO_HASTA(m)'] > max) {
            max = layersList[key]['TRAMO_HASTA(m)']
        } else if (layersList[key]['TRAMO_DESDE(m)'] > max) {
            max = layersList[key]['TRAMO_DESDE(m)']
        }

        texts.push({
            "text": layersList[key]
        })
    })

    nest = [{
        "key": object.properties.title,
        "values": listDepth,
        "texts": texts
    }]

    drawStratigraphicColumns(nest, min, max, colors)
}

function drawStratigraphicColumns(nest, min, max, colors) {
    document.getElementById('svg').innerHTML = ''

    var svg = d3.select("#svg"),
        margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 40
        },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var g = svg.append("g")
        .attr("transform", translate(margin.left, margin.top));

    var x = d3.scaleBand()
        .domain(nest.map(function (d) {
            return d.key;
        }))
        .range([0, width / 2])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([max, min])
        .range([height, 0]);

    // Create a group for each stack.
    var stacks = g.append("g").selectAll(".stack")
        .data(nest)
        .enter().append("g")
        .attr("class", "stack")
        .attr("transform", function (d) {
            return translate(x(d.key), 0);
        });


    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 10])
        .direction('e')
        .html(function (d) {
            var html = ''
            Object.keys(d.text).forEach(key => {
                html += `<strong>${key}:</strong> <span style='color:#118f8b'>${d.text[key]}</span><br>`
            });
            return html
        })

    svg.call(tip)


    // Create a rectangle for each element.
    var rects = stacks.selectAll(".element")
        .data(function (d) {
            return d.values;
        })
        .enter().append("rect")
        .attr("class", "element")
        .attr("cursor", "pointer")
        .attr("x", 0)
        .attr("y", function (d) {
            return y(d.top);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return Math.abs(y(d.top) - y(d.bottom));
        })

    rects
        .data(function (d) {
            return d.texts;
        })
        .attr("fill", function (d) {
            return colors[d.text["USCS"]]
        })
        .attr("opacity", "0.4")
        .on("click", openStratumInfo) // Find it on stratigraphicColumns.js

    stacks.selectAll(".element")
        .data(function (d) {
            return d.texts;
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    stacks.append("button")
        .attr("type", "button")
        .attr("class", "btn btn-secondary")
        .attr("title", "")
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-placement", "bottom")
        .attr("data-content", "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.")
        .attr("data-original-title", "Popover Title")

    // Create text for each element.
    stacks.selectAll(".elementText")
        .data(function (d) {
            return d.values;
        })
        .enter().append("text")
        .attr("class", "elementText")
        .attr("x", 0)
        .attr("y", function (d) {
            return y(d.top);
        })

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", translate(0, height))
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    function row(d) {
        d.md = +d.md;
        return d;
    }

    function translate(x, y) {
        return "translate(" + x + "," + y + ")";
    }

}

function openStratumInfo(e) {
    if (e.text['MUESTRAS']) {
        sessionStorage.setItem('stratumObject', JSON.stringify(e));
        sessionStorage.setItem('isStratum', true)

        window.open(
            "stratumInfo.html", "_blank");
    } else {
        window.alert('El estrato no contiene muestras')
    }
}