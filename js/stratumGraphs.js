function get(object, key, default_value) {
    if (typeof object[key] == "undefined") {
        object[key] = default_value
    }
    return object
}

function queryAndOrganizeInfo() {

    var Obj = JSON.parse(sessionStorage.getItem('sondeoObject'))
    var muestras = Obj.text['MUESTRAS']
    var graphNumberTitle = {} // Detects if a value is a number

    // Save only titles that meet the type of === 'number' to use them later
    Object.keys(muestras).forEach(key => {
        var muestrasAtr = muestras[key]
        Object.keys(muestrasAtr).forEach(atrTitle => {
            if (typeof muestrasAtr[atrTitle] === 'number') {
                get(graphNumberTitle, atrTitle, true)
            }
        })
    })

    var nestList = [{}]
    //
    Object.keys(graphNumberTitle).forEach(title => {
        nestList[0][title] = []
        Object.keys(muestras).forEach(key => {
            nestList[0][title].push({
                "value": muestras[key][title]
            })
        })
    })

    console.log(nestList)
    addDataToSelectpickerGraphs(nestList)

}

queryAndOrganizeInfo()

// Multiple selection filters
function addDataToSelectpickerGraphs(nestList) {
    $('select').selectpicker();

    const filterSelectedGraphs = document.getElementById('filterActiveGraphs')
    const selectpickerGraphs = document.getElementById('selectGraphs')
    var filterTagsListGraphs = []

    Object.keys(nestList[0]).forEach(key => {
        selectpickerGraphs.innerHTML += `<option>${key}</option>`
        filterTagsListGraphs.push(key)
    })

    $('.selectpicker').selectpicker('refresh');

    $('.selectpicker').change(function () {
        // Muestra los items seleccionados
        var selectedItemGraphs = $('.selectpicker').val();

        // Muestra los items que no han sido seleccionados
        let difference = filterTagsListGraphs
                .filter(x => !selectedItemGraphs.includes(x))
                .concat(selectedItemGraphs.filter(x => !filterTagsListGraphs.includes(x)));
    })
    // $('.selectpicker').change(function () {

    //     filtersEvents('addDataToSelectpicker', filterSelected, filterTagsList)

    //     Object.keys(filterTagsUncompleted).forEach(key => {
    //         if (document.getElementById(key).style.display == 'none' && !customCheck1.checked) {
    //             customCheck1.click()
    //         }
    //     })
    // });
}

function organizeObj() {
    var object = JSON.parse(sessionStorage.getItem('sondeoObject'))
    console.log(object)
    var layersList = object.layers
    var listDepth = []
    var [min, minX] = [null, null]
    var [max, maxX] = [null, null]
    var texts = []
    var colors = {}
    // const title = object.properties.title


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

        // Min value x
        if (min === null || layersList[key]['TRAMO_DESDE(m)'] < min) {
            min = layersList[key]['TRAMO_DESDE(m)']
        } else if (layersList[key]['TRAMO_HASTA(m)'] < min) {
            min = layersList[key]['TRAMO_DESDE(m)']
        }

        // Min value x
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

    graphColumns(nest, min, max, colors, indexInfo)


}

function graphColumns(nest, min, max, colors, indexInfo) {
    const graphHtmlTitle = document.getElementById('graphHtmlTitle')
    graphHtmlTitle.textContent = Obj.text.title

    document.getElementById('svgGraphs').innerHTML = ''

    // 500px corresponde a la altura del svg

    var svg = d3.select("#svgGraphs"),
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

    // var svgIndex = d3.select("#svgIndex")

    var x = d3.scaleBand()
        .domain([0, 100])
        // .domain(nest.map(function (d) {
        //     return d.key;
        // }))
        .range([0, width / 2])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([100, 0])
        .range([height, 0]);

    // Create a group for each stack.
    // var stacks = g.append("g").selectAll(".stack")
    //     .data(nest)
    //     .enter().append("g")
    //     .attr("class", "stack")
    //     .attr("transform", function (d) {
    //         return translate(x(d.key), 0);
    //     });

    // var tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .offset([0, 10])
    //     .direction('e')

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", translate(0, 0))
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    //functions
    function translate(x, y) {
        return "translate(" + x + "," + y + ")";
    }
}

// organizeObj()