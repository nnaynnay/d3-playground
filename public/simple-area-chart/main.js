const svg = d3.select('svg');
const margin = { top: 100, left: 20, right: 0, bottom: 0 };
const width = +svg.attr('width') - margin.left - margin.right;
const height = +svg.attr('height') - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const color = 'rgba(0, 168, 232, 0.7)';

const area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) { return x(d.id); })
    .y0(function (d) { return y(d.values[0]); })
    .y1(function (d) { return y(d.values[1]); });

const bisectId = d3.bisector(function (d) {
    return d.id;
}).left;

d3.json('https://mm-api-playground.herokuapp.com/pricing').then((data) => {

    const sources = data.map((d, idx) => {
        return {
            id: idx,
            values: d
        };
    });

    x.domain([0, d3.max(sources, function (d) { return d.id; })])
    y.domain([
        d3.min(sources, function (d) { return d.values[0]; }),
        d3.max(sources, function (d) { return d.values[1]; }),
    ]);

    var yAxis = d3.axisRight(y).tickSize(width);
    function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", "#efefef");
        g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
    }

    var xAxis = d3.axisBottom(x);
    function customXAxis(g) {
        g.call(xAxis);
        g.select(".domain").remove();
    }

    g.append("g")
        .attr("class", "axis axis--y")
        .call(customYAxis);
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(customXAxis);

    var source = g.selectAll(".area")
        .data([sources])
        .enter().append("g");

    source.append("path")
        .attr("d", function (d) { return area(d); })
        .style("fill", function (d) { return color; });


    // Tooltip //
    var tooltipLine = svg.append("line")
        .attr("class", "tooltip-line");

    var focus = svg.append("g")
        .attr("class", "tooltip-pointer")
        .style("display", "none");
    focus.append("circle")
        .attr("r", 4);
    focus.append("text")
        .attr("class", "tooltip-text")
        .attr('x', '10px')
        .attr("y", ".35em")
        .style("font-size", 15);

    var focus2 = svg.append("g")
        .attr("class", "tooltip-pointer")
        .style("display", "none");
    focus2.append("circle")
        .attr("r", 4);
    focus2.append("text")
        .attr("class", "tooltip-text")
        .attr('x', '10px')
        .attr("y", ".35em")
        .style("font-size", 15);

    var tooltipBox = svg.append('g')
        .attr('class', 'tooltip-box');
    tooltipBox.append('rect');
    tooltipBox.append('text')
        .attr('class', 'price')
        .attr('text-anchor', 'end')
        .attr('x', width + 'px')
        .attr("dy", "2em");

    const mousemove = () => {
        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0] - margin.left),
            i = bisectId(sources, x0, 1),
            d0 = sources[i - 1],
            d1 = sources[i],
            d = x0 - d0.id > d1.id - x0 ? d1 : d0;

        focus.attr("transform", "translate(" + (x(d.id) + margin.left) + "," + (y(d.values[1]) + margin.top) + ")");
        focus2.attr("transform", "translate(" + (x(d.id) + margin.left) + "," + (y(d.values[0]) + margin.top) + ")");

        focus.select("text").text(d.values[1]);
        focus2.select("text").text(d.values[0]);
        tooltipLine.attr('x1', x(d.id) + margin.left);
        tooltipLine.attr('x2', x(d.id) + margin.left);
        tooltipLine.attr('y1', margin.top);
        tooltipLine.attr('y2', height + margin.top);

        tooltipBox.select('text').text([d.values[0], d.values[1]].join(' ~ '));
    };

    svg.append("rect")
        .attr("class", "overlay")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function () {
            focus.style("display", null);
            focus2.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
            focus2.style("display", "none");
        })
        .on("mousemove", mousemove);


})