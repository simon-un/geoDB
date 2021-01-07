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
    div.setAttribute('class', 'divGraphs inline')

    var span = document.createElement('span')
    span.setAttribute('class', 'spanGraphs badge badge-info')
    span.textContent = selectedKey

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', `svg${selectedKey}`)
    svg.setAttribute('width', '300')
    svg.setAttribute('height', '500')

    // div.appendChild(span)
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
    // const svg = document.getElementById(`svg${selectedKey}`)
    // graphHtmlTitle.textContent = Obj.text.title

    // document.getElementById('svgGraphs').innerHTML = ''

    // 500px corresponde a la altura del svg

    // console.log(`#svg${selectedKey}`)
    var svg = d3.select(`#svg${selectedKey}`),
        margin = {
            top: 50, // 20
            right: 100,
            bottom: 20,
            left: 40
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
        .scaleExtent([1, 50]) // This control how much you can unzoom (x0.5) and zoom (x20)
        .extent([
            [0, 0],
            [width, height]
        ])
        .translateExtent([
            [0, 0],
            [width, height]
        ])
        .on("zoom", updateChart);

    // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
    // svg.append("rect")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .style("fill", "none")
    //     .style("pointer-events", "all")
    //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    //     .call(zoom);

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
        .attr("dx", "-.3em")
        .attr("dy", "-.8em")
        .attr("transform", "rotate(65)");

    var yAxis = g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    var validateX = []
    var i = 0
    var j = 0

    // Add the line
    var line = gZoom.append("path")
        .datum(nestList[0][selectedKey])
        .attr("class", "line")
        //   .attr("fill", "none")
        //   .attr("stroke", "steelblue")
        //   .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.value)
            })
            .y(function (d) {
                return y(d.depth)
            })
            .curve(d3.curveLinear)
        )

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
        .on("mouseover", function() {
            focus.style("display", null);
          })
          .on("mouseout", function() {
            focus.style("display", "none");
          })
          .on("mousemove", mousemove);

    var h1 = document.getElementById("title1")
    var h2 = document.getElementById("title2")
    var path = svg.select('.line').node();
    var totLength = path.getTotalLength();

    function mousemove() {

      var y0 = d3.mouse(this)[1],
          per = height / y0;
          point = path.getPointAtLength(totLength / per)
          yCoor = y.invert(point.y);
          xCoor = x.invert(point.x);

        var xTot = point.x + margin.left
        var yTot = point.y + margin.top

        h1.textContent = xCoor
        h2.textContent = yCoor
      
      focus.attr("transform", "translate(" + xTot + "," + yTot + ")");
      focus.select("text").text(Math.round((xCoor + Number.EPSILON) * 100) / 100 + ", " + Math.round((yCoor + Number.EPSILON) * 100) / 100);
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




    }
}

// organizeObj()

// Rutina principal
var nestList = queryAndOrganizeInfo()
addDataToSelectpickerGraphs(nestList)