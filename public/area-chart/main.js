const svg = d3.select('svg');
const margin = { top: 0, left: 0, right: 0, bottom: 0 };
const width = +svg.attr('width') - margin.left - margin.right;
const height = +svg.attr('height') - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const color = 'rgba(0, 168, 232, 0.7)';

const area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) { return x(d.date); })
    .y0(height)
    .y1(function (d) { return y(d.values.nominalPrice); });

var parseDate = d3.timeParse("%Y-%m-%d");

const bisect = d3.bisector(function (d) {
    return d.date;
}).left;

d3.json('http://localhost:3000/pricing/hk?code=02638&start_date=2018-07-01&end_date=2018-09-01').then((res) => {

    const columns = res.column_names.map(c => _.camelCase(c));

    const sources = res.data.map((d, idx) => {
        let dataPoint = {
            id: idx,
            date: parseDate(d[0]),
            value: +d[1],
            values: {}
        };
        columns.forEach((c, colIdx) => {
            dataPoint.values[c] = colIdx === 0 ? parseDate(d[0]) : +d[colIdx];
        });
        return dataPoint;
    });

    x.domain([sources[0].date, sources[sources.length - 1].date]);
    y.domain(d3.extent(sources, function (d) { return d.values.nominalPrice}))
    // y.domain([
    //     d3.min(sources, function (d) { return d.values.nominalPrice; }) * 1.1,
    //     d3.max(sources, function (d) { return d.values.nominalPrice; }) * 1.1,
    // ]);

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

    let areaGradient = svg.append('defs')
        .append("linearGradient")
        .attr("id", "area-gradient")
        // .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "200%");

    areaGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#21825C")
            .attr("stop-opacity", 0.9);

    areaGradient.append("stop")
            .attr("offset", "90%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0);


    svg.append("path")
        .datum(sources)
        .attr("class", "area")
        .style("fill", "url(#area-gradient)")
        .attr("d", area);

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

    var tooltipBox = svg.append('g')
        .attr('class', 'tooltip-box');
    tooltipBox.append('rect');
    tooltipBox.append('text')
        .attr('class', 'price')
        .attr('text-anchor', 'end')
        .attr('x', width + 'px')
        .attr("dy", "2em");

    const mousemove = () => {
        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
            i = bisect(sources, x0, 1),
            d0 = sources[i - 1],
            d1 = sources[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        console.log(i, x(d.date), y(d.values.nominalPrice));

        focus.attr("transform", "translate(" + (x(d.date) + margin.left) + "," + (y(d.values.nominalPrice) + margin.top) + ")");

        focus.select("text").text(d.values.nominalPrice);
        tooltipLine.attr('x1', x(d.date) + margin.left);
        tooltipLine.attr('x2', x(d.date) + margin.left);
        tooltipLine.attr('y1', margin.top);
        tooltipLine.attr('y2', height + margin.top);

        tooltipBox.select('text').text([d.values.nominalPrice]);
    };

    svg.append("rect")
        .attr("class", "overlay")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function () {
            focus.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
        })
        .on("mousemove", mousemove);


})