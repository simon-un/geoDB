function extractStratigraphicData(object) {
    var list = object.layers
    var listDepth = []
    var min = null
    var max = null
    var texts = []
    Object.keys(list).forEach(key => {
        listDepth.push({
            "top": list[key]['TRAMO_DESDE(m)'],
            "bottom": list[key]['TRAMO_HASTA(m)']
        })
        // Min value
        if (min === null || list[key]['TRAMO_DESDE(m)'] < min) {
            min = list[key]['TRAMO_DESDE(m)']
        } else if (list[key]['TRAMO_HASTA(m)'] < min) {
            min = list[key]['TRAMO_DESDE(m)']
        }
        // Max value
        if (max === null || list[key]['TRAMO_HASTA(m)'] > max) {
            max = list[key]['TRAMO_HASTA(m)']
        } else if (list[key]['TRAMO_DESDE(m)'] > max) {
            max = list[key]['TRAMO_DESDE(m)']
        }

        texts.push({
            "text": list[key]
        })
    })

    nest = [{
        "key": object.properties.title,
        "values": listDepth,
        "texts": texts
    }]

    drawStratigraphicColumns(nest, min, max)
}

function drawStratigraphicColumns(nest, min, max) {
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
        .range([0, width])
        .padding(0.5);

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
    stacks.selectAll(".element")
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