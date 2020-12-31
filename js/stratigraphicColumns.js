// All info cache
var allInfoCache = {}

// Check if a mobile device is used
window.mobileCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|android|ipad|playbook|silk|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getIndexCoordinates(indexCoorTop, indexCoorBottom) {
    indexCoorTop += 5
    indexCoorBottom += 5
    return [indexCoorTop, indexCoorBottom]
}

function queryAndOrganizeInfo(object) {

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

    return textObjAsD3
}

function extractStratigraphicData(object) {

    var layersList = object.layers
    var listDepth = []
    var min = null
    var max = null
    var texts = []
    var colors = {}
    const title = object.properties.title
    const pStratCol = document.getElementById('pStratCol')

    if (!mobileCheck()) {
        pStratCol.innerHTML = `<p style="text-align:justify; color:#55595c" id="pStratCol">
                Perfil estratigráfico del sondeo: ${title}
            </p>
            <p style="text-align:justify; color:green" id="pStratCol">
                Ubique el <img src="images/pointer.png" style="display:inline;" width="15" height="15"> <span style="color:blue;">Cursor </span> sobre un estrato para mostrar información
                <img src="images/infoStrat.png" style="display:inline;" width="150" height="60">
            </p>
            <p style="text-align:justify; color:green">
                Click sobre un estrato para mostrar información de muestras
            </p>`
    } else {
        pStratCol.innerHTML = `<p style="text-align:justify; color:#55595c" id="pStratCol">
                Perfil estratigráfico del sondeo: ${title}
            </p>
            <p style="text-align:justify; color:green">
                Click sobre un estrato para mostrar información de muestras
            </p>`
    }

    document.getElementById('spanSvg').textContent = object.properties.title

    // Creating all-info button
    var buttonSondeo = document.createElement('button')
    buttonSondeo.className = "btn btn-info"
    buttonSondeo.id = "buttonSondeo"
    buttonSondeo.textContent = "Mostrar tabla con todas las muestras"

    pStratCol.appendChild(buttonSondeo)

    // Query of all "sondeo" info
    buttonSondeo.addEventListener('click', e => {

        if (allInfoCache[title]) {

            sessionStorage.setItem('isStratum', false)
            sessionStorage.setItem('sondeoObject', JSON.stringify({
                "text": allInfoCache[title]
            }))
            window.open(
                "stratumInfo.html", "_blank");

        } else {

            // Save in cache requested organized info
            allInfoCache[title] = queryAndOrganizeInfo(object)

            sessionStorage.setItem('sondeoObject', JSON.stringify({
                "text": allInfoCache[title]
            }));
            sessionStorage.setItem('isStratum', false)
            window.open(
                "stratumInfo.html", "_blank");

        }
    })


    // Creating graphs button
    var buttonGraphs = document.createElement('button')
    buttonGraphs.className = "btn btn-info"
    buttonGraphs.id = "buttonGraphs"
    buttonGraphs.textContent = "Generador de gráficos"

    pStratCol.appendChild(buttonGraphs)

    // Query of all "sondeo" info
    buttonGraphs.addEventListener('click', e => {

        if (allInfoCache[title]) {

            // sessionStorage.setItem('isStratum', false)
            sessionStorage.setItem('sondeoObject', JSON.stringify({
                "text": allInfoCache[title]
            }))
            window.open(
                "stratumGraphs.html", "_blank");

        } else {

            // Save in cache requested organized info
            allInfoCache[title] = queryAndOrganizeInfo(object)

            sessionStorage.setItem('sondeoObject', JSON.stringify({
                "text": allInfoCache[title]
            }));
            // sessionStorage.setItem('isStratum', false)
            window.open(
                "stratumGraphs.html", "_blank");

        }
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

    // list and objects to make rects USCS info
    var indexInfo = [{
        "texts": [],
        "coords": []
    }]
    var top = 0
    var bottom = 5
    Object.keys(colors).forEach(color => {
        [top, bottom] = getIndexCoordinates(top, bottom)
        indexInfo[0].texts.push({
            "text": color
        })
        indexInfo[0].coords.push({
            "top": top,
            "bottom": bottom
        })
    })

    nest = [{
        "key": object.properties.title,
        "values": listDepth,
        "texts": texts
    }]

    drawStratigraphicColumns(nest, min, max, colors, indexInfo)
}

function drawStratigraphicColumns(nest, min, max, colors, indexInfo) {
    document.getElementById('svg').innerHTML = ''

    // 500px corresponde a la altura del svg
    const factor = (max - min) * 5 / 500

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

    var svgIndex = d3.select("#svgIndex")

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

    // Si no es dispositivo movil muestra info, al hacer hover
    if (!mobileCheck()) {

        tip.html(function (d) {

            var html = ''
            Object.keys(d.text).forEach(key => {
                if (key == 'MUESTRAS') {
                    html += `<strong>${key}:</strong> <span style='color:#f54b42'>Click sobre el estrato para ver</span><br>`
                } else {
                    html += `<strong>${key}:</strong> <span style='color:#118f8b'>${d.text[key]}</span><br>`
                }
            })
            return html
        })

        svg.call(tip)
    }


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

    // create new group for indexes
    var stackIndex = g.append("g").selectAll(".stackIndex")
        .data(indexInfo)
        .enter().append("g")
        .attr("class", "stackIndex")
        .attr("transform", function (d) {
            return translate(165, 0);
        });

    // Create a rectangle for each element.
    var rectsIndex = stackIndex.selectAll(".elementIndex")
        .data(function (d) {
            return d.coords;
        })
        .enter().append("rect")
        .attr("class", "elementIndex")
        .attr("x", 0)
        .attr("y", function (d) {
            return y(d.top * factor);
        })
        .attr("width", 60)
        .attr("height", function (d) {
            return Math.abs((y(d.top) - y(d.bottom)) * factor);
        })

    rectsIndex
        .data(function (d) {
            return d.texts;
        })
        .attr("fill", function (d) {
            return colors[d.text]
        })
        .attr("opacity", "0.4")

    // Create text for each element.
    stackIndex.selectAll(".elementText")
        .data(function (d) {
            return d.coords;
        })
        .enter().append("text")
        .attr("class", "elementText")
        .attr("x", 10)
        .attr("y", function (d) {
            return y(d.top) * factor + 15;
        })

    stackIndex.selectAll(".elementText")
        .data(function (d) {
            return d.texts;
        })
        .text(function (d) {
            return d.text;
        })

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