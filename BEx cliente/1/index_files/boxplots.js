var boxplots = (function(){
	// Note that we use camel case in JavaScript, as opposed to Python, where
    // we prefer the use of the underscore

	namespace = 'boxplots'; // change to an empty string to use the global namespace

    // 'private', these do not go in the return object
    var marg = 10;
    var padd = 20;
    var default_opts = {
        margin: {top: marg, right: marg, bottom: marg, left: marg},
        padding: {top: padd, right: padd, bottom: padd, left: padd},
        barHeightPct: 0.33,
        noTicks: 6,
        suffix: ""
    };


    // 'public' functions and variables

    /*  Plots interactive boxplot using sibling <svg> and <div> elements
        and data of the format:
        var default_data = {
            lowerQuartile: 0.25,
            upperQuartile: 0.75,
            median: 0.5,
            low: 0,
            high: 1.0,
        };
     */
    var navbarBoxPlot = function(svg_selector, div_selector, data) {
        svg = d3.select(svg_selector);
        svg.selectAll("*").remove();

        // Define the div for the tooltip
        var div = d3.select(div_selector)
            .attr("id", div_selector.replace("#","")) //"#ims-nav-volume-boxplot-tooltip")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("width", 500);

        var opts = default_opts;

        var renderTooltip = function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("<small>" + d.type + ": " + d.value + " " + data.suffix + "</small>")
                .style("left", opts.padding.left + "px")
                .style("top", (opts.padding.top + svg.top) + "px")
                .style("align", "right")
                .style("width", "200px");
        };

        var fadeTooltip = function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        }

        var W = parseInt(svg.style('width'), 10);
        var H = parseInt(svg.style('height'), 10);

        // grey area
        var innerWidth = W - opts.margin.left - opts.margin.right;
        var innerHeight = H - opts.margin.top - opts.margin.bottom;

        // plot area inside of grey
        var width = innerWidth - opts.padding.left - opts.padding.right;
        var height = innerHeight - opts.padding.top - opts.padding.bottom;

        var x = d3.scale.linear().range([0, width]).domain([data.low, data.high]);
        var xAxis = d3.svg.axis().scale(x).ticks(opts.noTicks);
        svg.select(".x.axis").selectAll("text")
             .style("font-size","8px");

        // main g
        var g = svg.append("g")
            .attr("transform", "translate(" + opts.padding.left + "," +opts. padding.top + ")");

        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // IQR boxes
        g.append("rect")
            .attr("width", x(data.upperQuartile) - x(data.median))
            .attr("height", opts.barHeightPct*height)
            .attr('y', height*(0.5-opts.barHeightPct) )
            .attr('x', function(d) {
                return x(data.median);
            })
            .attr('fill', 'rgba(95, 128, 163, 0.4)')//'#ffffff')
            .attr('stroke', '#000')
            .attr('stroke-width', 2)
            .data([{type:'75th Pct', value:data.upperQuartile}])
            .on("mouseover", renderTooltip)
            .on("mouseout", fadeTooltip);


        g.append("rect")
            .attr("width", x(data.median) - x(data.lowerQuartile))
            .attr("height", opts.barHeightPct*height)
            .attr('y', height*(0.5-opts.barHeightPct) )
            .attr('x', function(d) {
                return x(data.lowerQuartile);
            })
            .attr('fill', 'rgba(95, 128, 163, 0.4)') //'#ffffff')
            .attr('stroke', '#000')
            .attr('stroke-width', 2)
            .data([{type:'25th Pct', value:data.lowerQuartile}])
            .on("mouseover", renderTooltip)
            .on("mouseout", fadeTooltip);


        // median
        g.append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('x1', x(data.median))
            .attr('y1', height*0.5)
            .attr('x2', x(data.median))
            .attr('y2', height*(0.5-opts.barHeightPct))
            .data([{type:'Median', value:data.median}])
            .on("mouseover", renderTooltip)
            .on("mouseout", fadeTooltip);


        // whiskers
        g.append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('x1', x(data.upperQuartile))
            .attr('y1', height*(0.5-opts.barHeightPct/2))
            .attr('x2', x(data.high))
            .attr('y2', height*(0.5-opts.barHeightPct/2));

        g.append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('x1', x(data.high))
            .attr('y1', height*0.5)
            .attr('x2', x(data.high))
            .attr('y2', height*(0.5-opts.barHeightPct))
            .data([{type:'Max', value:data.high}])
            .on("mouseover", renderTooltip)
            .on("mouseout", fadeTooltip);

        g.append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('x1', x(data.low))
            .attr('y1', height*(0.5-opts.barHeightPct/2))
            .attr('x2', x(data.lowerQuartile))
            .attr('y2', height*(0.5-opts.barHeightPct/2));

        g.append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('x1', x(data.low))
            .attr('y1', height*0.5)
            .attr('x2', x(data.low))
            .attr('y2', height*(0.5-opts.barHeightPct))
            .data([{type:'Min', value:data.low}])
            .on("mouseover", renderTooltip)
            .on("mouseout", fadeTooltip);


    }

    return {
        navbarBoxPlot: navbarBoxPlot,
    }

}());