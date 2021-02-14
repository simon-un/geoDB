var graphsCache = {}
var divGraphs = document.getElementById('divGraphs')

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
    const stratumGraphTitle = document.getElementById('stratumGraphTitle')
    const pageStratumGraphsTitle = document.getElementById('pageStratumGraphsTitle')
    var title = Obj.text.title

    stratumGraphTitle.textContent = `GRAFICO ${title}`
    pageStratumGraphsTitle.textContent = `GRAFICO ${title}`

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
    // Create list with d3 format
    Object.keys(graphNumberTitle).forEach(title => {
        nestList[0][title] = []
        Object.keys(muestras).forEach(key => {
            if (muestras[key][title] !== undefined && muestras[key][title] !== null) {
                nestList[0][title].push({
                    "depth": muestras[key]['PROFUNDIDAD_MEDIA'],
                    "value": muestras[key][title]
                })
            }
        })
    })

    // Organize list ascending
    Object.keys(nestList[0]).forEach(key => {
        nestList[0][key].sort(function (x, y) {
            return d3.ascending(x.depth, y.depth);
        })
    })

    return nestList
}



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

        // Shows selected items
        var selectedItemGraphs = $('.selectpicker').val();

        // Muestra los items que no han sido seleccionados
        let difference = filterTagsListGraphs
            .filter(x => !selectedItemGraphs.includes(x))
            .concat(selectedItemGraphs.filter(x => !filterTagsListGraphs.includes(x)));

        difference.forEach(notSelectedKey => {
            if (graphsCache[notSelectedKey]) {
                document.getElementById(`div${notSelectedKey}`).style.display = 'none'
            }
        })

        // 
        selectedItemGraphs.forEach(selectedKey => {
            if (graphsCache[selectedKey]) {
                document.getElementById(`div${selectedKey}`).style.display = 'block'
            } else {
                graphsCache[selectedKey] = true
                createDomElement(selectedKey)
                var [min, max, minX, maxX] = organizeObj(nestList, selectedKey)
                makeGraph(nestList, min, max, minX, maxX, selectedKey)
            }
        })
    })

}

function createDomElement(selectedKey) {

    var div = document.createElement('div')
    div.setAttribute('id', `div${selectedKey}`)
    div.setAttribute('class', 'divGraphs inline mx-center')

    var span = document.createElement('span')
    span.setAttribute('class', 'spanGraphs badge badge-info')
    span.textContent = selectedKey

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var height = screen.height * 0.8
    var width = screen.height / 2
    svg.setAttribute('id', `svg${selectedKey}`)
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('perserveAspectRatio', 'xMinYMid')

    div.appendChild(svg)
    divGraphs.appendChild(div)
}

function organizeObj(nestList, selectedKey) {
    // var layersList = object.layers
    // var listDepth = []
    var [min, minX] = [null, null]
    var [max, maxX] = [null, null]

    var prof = nestList[0]['PROFUNDIDAD_MEDIA']
    prof.forEach(v => {

        var depth = v.value

        // Min depth value
        if (min === null || depth < min) {
            min = depth
        }

        // Max depth value
        if (max === null || depth > max) {
            max = depth
        }

    })

    var atribute = nestList[0][selectedKey]
    atribute.forEach(v => {

        var atrValue = v.value

        // Min depth value
        if (minX === null || atrValue < minX) {
            minX = atrValue
        }

        // Max depth value
        if (maxX === null || atrValue > maxX) {
            maxX = atrValue
        }

    })

    return [min, max, minX, maxX]

}

function makeGraph(nestList, min, max, minX, maxX, selectedKey) {

    // console.log(`#svg${selectedKey}`)
    var svg = d3.select(`#svg${selectedKey}`),
        margin = {
            top: 50, // 20
            right: 100,
            bottom: 20,
            left: 50
        },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var gZoom = svg.append("g")
        .attr("transform", translate(margin.left, margin.top))
        .attr("clip-path", "url(#clip)")

    var g = svg.append("g")
        .attr("transform", translate(margin.left, margin.top))

    // var svgIndex = d3.select("#svgIndex")

    var x = d3.scaleLinear()
        // .domain([minX * 0.9, maxX])
        .domain(d3.extent(nestList[0][selectedKey], function (d) {
            return d.value;
        }))
        .range([0, width])
    // .padding(0.1);

    var y = d3.scaleLinear()
        .domain([max, min])
        // .domain(d3.extent(nestList[0][selectedKey], function(d) { return d.depth; }))
        .range([height, 0]);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
    var zoom = d3.zoom()
        .scaleExtent([1, 100]) // This control how much you can unzoom (x0.5) and zoom (x20)
        .extent([
            [0, 0],
            [width, height]
        ])
        .translateExtent([
            [0, 0],
            [width, height]
        ])
        .on("zoom", updateChart);

    var xRectLabelWidth = 20
    var rectLabelHeight = 20
    var rectLabelWidth = 20

    // Coords X Label
    var xRectLabel = svg.append("rect")
        .attr("width", rectLabelWidth)
        .attr("height", rectLabelHeight)
        .style("fill", "#edb5b2")
        .attr("rx", "3")
        .attr("ry", "3")
        // .style("stroke", "black")
        // .style("pointer-events", "all")
        .attr('transform', 'translate(' + (margin.left + width + 4) + ',' + margin.top + ')')
    // .call(zoom);

    var xRectText = svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', (margin.left + width + xRectLabelWidth))
        .attr('y', margin.top + rectLabelHeight * 3 / 4)
        .style("fill", "#c91d14")
        .text('x: ')

    var xCoorLabel = svg.append('text')
        .attr('text-anchor', 'start')
        .attr('x', (margin.left + width + xRectLabelWidth + 5))
        .attr('y', margin.top + rectLabelHeight * 3 / 4)
        .style("fill", "grey")
        .text('Apunte')

    // Coords Y Label
    var yRectLabel = svg.append("rect")
        .attr("width", rectLabelWidth)
        .attr("height", rectLabelHeight)
        .style("fill", "#edb5b2")
        .attr("rx", "3")
        .attr("ry", "3")
        // .style("stroke", "black")
        // .style("pointer-events", "all")
        .attr('transform', 'translate(' + (margin.left + width + 4) + ',' + (margin.top + rectLabelHeight + 4) + ')')
    // .call(zoom);

    var yRectText = svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', margin.left + width + xRectLabelWidth)
        .attr('y', margin.top + rectLabelHeight * 7 / 4 + 3)
        .style("fill", "#c91d14")
        .text('y: ')

    var yCoorLabel = svg.append('text')
        .attr('text-anchor', 'start')
        .attr('x', margin.left + width + xRectLabelWidth + 5)
        .attr('y', margin.top + rectLabelHeight * 7 / 4 + 3)
        .style("fill", "grey")
        .text('al gráfico')

    // .y(function(d) { return y(d.value) })
    // )

    // lines.data(function(d) {
    //     console.log(d.selectedKey)
    // })
    // lines.append("path")
    // .attr("d", function(d) { return line(d[selectedKey]["value"]); });

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

    // g.append("g")
    //     .attr("class", "xAxis x axis")
    //     // .attr("transform", translate(0, 0))
    //     .call(d3.axisBottom(x))

    // gridlines in x axis function
    function make_x_gridlines() {
        return d3.axisBottom(x)
            .ticks(10)
    }

    // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisLeft(y)
            .ticks(10)
    }

    // add the X gridlines
    var xGrid = g.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )


    // xGrid.append('text')
    //     .attr('class', 'axis-label')
    //     .attr('text-anchor', 'start')
    //     .attr('x', width)
    //     .attr('y', -height)
    //     .attr('fill', 'black')
    //     .text(selectedKey)

    // add the Y gridlines
    var yGrid = g.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    var xAxis = g.append("g")
        .attr("class", "x axis")
        .call(d3.axisBottom(x))

    xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("id", "textX" + selectedKey)
        .attr("dx", "-.3em")
        .attr("dy", "-.8em")
        .attr("transform", "rotate(65)")

    xGrid.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('y', function (d, i) {
            return -d3.selectAll('#textX' + selectedKey).filter(function (d, j) {
                    return i === j;
                })
                .node().getComputedTextLength() - height - 20
        })
        .attr('fill', 'black')
        .text(selectedKey)

    var yAxis = g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    yAxis.selectAll("text")
        .attr("id", "textY" + selectedKey)

    yGrid.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'end')
        .attr('y', function (d, i) {
            return d3.selectAll('#textY' + selectedKey).filter(function (d, j) {
                    return i === j;
                })
                .node().getComputedTextLength() + 25
        })
        .attr('x', height)
        .attr('fill', 'black')
        .text("PROFUNDIDAD_MEDIA")
        .attr("transform", "rotate(90)")

    var validateX = []
    var i = 0
    var j = 0

    var lined3 = d3.line()
        .x(function (d) {
            return x(d.value)
        })
        .y(function (d) {
            return y(d.depth)
        })
        .curve(d3.curveLinear)

    // Add the line
    var line = gZoom.append("path")
        .datum(nestList[0][selectedKey])
        .attr("class", "line")
        //   .attr("fill", "none")
        //   .attr("stroke", "steelblue")
        //   .attr("stroke-width", 1.5)
        .attr("d", lined3)

    var totalLength = line.node().getTotalLength();

    // Line animation
    line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2400)
        .attr("stroke-dashoffset", 0);

    validateX = []
    i = 0
    j = 0

    // Add the scatterplot
    var dots = gZoom.selectAll("dot")
        .data(nestList[0][selectedKey])
        .enter().append("circle")
        .attr("r", 2)
        .attr("cx", function (d) {

            if (typeof d.value !== undefined) {
                validateX[i] = true
                i += 1
                return x(d.value);
            } else {
                validateX[i] = false
                i += 1
            }
        })
        // .defined(function(d) { return d.value; }) // Omit empty values.
        .attr("cy", function (d) {
            if (validateX[j]) {
                j += 1
                return y(d.depth);
            }
        });


    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none")

    focus.append("circle")
        .attr("r", 3)
        .attr("fill", "red")

    focus.append("text")
        .attr("x", 9)
        .attr("y", -9)
        .attr("dy", ".35em");

    // svg.append("rect")
    //   .attr("class", "overlay")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .on("mouseover", function() {
    //     focus.style("display", null);
    //   })
    //   .on("mouseout", function() {
    //     focus.style("display", "none");
    //   })
    //   .on("mousemove", mousemove);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom)
        .on("dblclick.zoom", null) // Desactiva el zoom al hacer doble click
        .on("mouseover", function () {
            focus.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
        })
        .on("mousemove", mousemove);

    var h1 = document.getElementById("title1")
    var h2 = document.getElementById("title2")
    var path = svg.select('.line').node();
    var totLength = path.getTotalLength();

    var k = null

    function mousemove() {

        if (k == 1 || k === null) {
            var y0 = d3.mouse(this)[1],
                per = height / y0;
            point = path.getPointAtLength(totLength / per)
            yCoor = y.invert(point.y);
            xCoor = x.invert(point.x);

            var xTot = point.x + margin.left
            var yTot = point.y + margin.top

            // h1.textContent = xCoor
            // h2.textContent = yCoor
            xCoorLabel.text(`${Math.round((xCoor + Number.EPSILON) * 100) / 100}`)
            yCoorLabel.text(`${Math.round((yCoor + Number.EPSILON) * 100) / 100}`)
            xRectLabel.style("fill", "#94f79f")
            yRectLabel.style("fill", "#94f79f")
            xRectText.style("fill", "#097315")
            yRectText.style("fill", "#097315")

            focus.attr("transform", "translate(" + xTot + "," + yTot + ")");
            focus.style("visibility", "visible")

            //   focus.select("text").text(Math.round((xCoor + Number.EPSILON) * 100) / 100 + ", " + Math.round((yCoor + Number.EPSILON) * 100) / 100);
        }
        else {
            xCoorLabel.text(`-`)
            yCoorLabel.text(`-`)
            xRectLabel.style("fill", "#cccccc")
            yRectLabel.style("fill", "#cccccc")
            xRectText.style("fill", "#7d7d7d")
            yRectText.style("fill", "#7d7d7d")

            focus.style("visibility", "hidden")
        }
    }

    //functions
    function translate(x, y) {
        return "translate(" + x + "," + y + ")";
    }

    function updateChart() {

        // recover the new scale
        var newX = d3.event.transform.rescaleX(x);
        var newY = d3.event.transform.rescaleY(y);

        // update axes with these new boundaries
        xAxis
            .call(d3.axisBottom(newX))

        xAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.3em")
            .attr("dy", "-.8em")
            .attr("transform", "rotate(65)");

        yAxis
            .call(d3.axisLeft(newY))

        // update grid
        xGrid.call(
            d3.axisBottom(x)
            .scale(newX)
            .ticks(10)
            .tickSize(-height)
            .tickFormat("")
        )

        yGrid.call(
            d3.axisLeft(y)
            .scale(newY)
            .ticks(10)
            .tickSize(-width)
            .tickFormat("")
        )

        // update circle position
        dots
            .attr('cx', function (d) {
                return newX(d.value)
            })
            .attr('cy', function (d) {
                return newY(d.depth)
            });

        line
            .attr("stroke-dasharray", "")
            .attr("stroke-dashoffset", "")
            .attr("d", d3.line()
                .x(function (d) {
                    return newX(d.value)
                })
                .y(function (d) {
                    return newY(d.depth)
                })
            )

            k = d3.event.transform.k
    }
}

// organizeObj()

// Rutina principal
var nestList = queryAndOrganizeInfo()
addDataToSelectpickerGraphs(nestList)