var barplots = (function(){
	// Note that we use camel case in JavaScript, as opposed to Python, where
    // we prefer the use of the underscore

	namespace = 'barplots'; // change to an empty string to use the global namespace

    // 'private', these do not go in the return object
    var marg = 0;
    var padd = 0;
    var default_opts = {
        margin: {top: marg, right: marg, bottom: marg, left: marg},
        padding: {top: padd, right: padd, bottom: padd, left: padd},
        barHeightPct: 0.8,
        suffix: ""
    };


    // 'public' functions and variables

    /*  var default_data = {
            barValue: 0.5,
            low: 0,
            high: 1.0,
        };
     */
    var tableBar = function(svg_selector, data) {
        svg = d3.select(svg_selector);
        //console.log(svg_selector);

        var opts = default_opts;

        var W = parseInt(svg.style('width'), 10);
        var H = parseInt(svg.style('height'), 10);

        // grey area
        var innerWidth = W - opts.margin.left - opts.margin.right;
        var innerHeight = H - opts.margin.top - opts.margin.bottom;

        // plot area inside of grey
        var width = innerWidth - opts.padding.left - opts.padding.right;
        var height = innerHeight - opts.padding.top - opts.padding.bottom;

        var x = d3.scale.linear().range([0, width]).domain([data.low, data.high]);

        // main g
        var g = svg.append("g")
            .attr("transform", "translate(" + opts.padding.left + "," +opts. padding.top + ")");

        // Da bar
        g.append("rect")
            .attr("width", Math.max(10, x(data.barValue)))
            .attr("height", H) //opts.barHeightPct*height)
            //.attr('y', height*(0.5-0.5*opts.barHeightPct) )
            .attr('y', H*0.4)//height*(0.5-0.5*opts.barHeightPct) )
            .attr('x', function(d) {
                return x(0);
            })
            .attr('fill', '#026838');
            //.attr('stroke', '#000')
            //.attr('stroke-width', 1);
            /*.data([{type:'Bar', value:data.barValue}])
            .on("mouseover", renderTooltip)
            .on("mouseout", fadeTooltip);*/

    }

    return {
        tableBar: tableBar,
    }

}());