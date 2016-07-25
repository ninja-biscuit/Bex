var ims = (function() {
    // Note that we use camel casein JavaScript, as opposed to Python, where
    // we prefer the use of the underscore

    namespace = 'ims'; // change to an empty string to use the global namespace

    // 'private', these do not go in the return object
    var getUrl = window.location;
    var baseURL = getUrl.protocol + "//" + getUrl.host + "/"; // + getUrl.pathname.split('/')[1];
    //var baseURL = "http://localhost:5000/"
    //var baseURL = "http://pike:8080/"

    var clientChartObj;
    var rowHeight = 15;
    var timeFrame;
    var beginDate, endDate;
    var traderData;
    var traderActivityTable;
    var lpData;
    var lpActivityTable;
    var pairsData;
    var pairVolumeTable;
    var clientData;
    var clientVolumeTable;
    var clientChartData;

    //var lpTraderPairTable, lpTraderSecondTable, lpTraderRejectTable, lpTraderData;
    //var pairTraderTable, pairLpTable, pairClientTable, pairData;
    //var clientPairTable, clientData;
    //var hrCustomerTable, hrCustomerData, hrRFQTable, hrRFQData;

    //var overallVolumeTable, overallVolumeData;

    // ONCE IMPLEMENTED ADD REJECT DATA/TABLE HERE AS WELL

    var spinner_opts = {
        lines: 13 // The number of lines to draw
        , length: 28 // The length of each line
        , width: 14 // The line thickness
        , radius: 42 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.55 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 40 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 1000 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    }
    var overlay; // = $("#spin-div")[0];
    var spinner; // = new Spinner(spinner_opts);

    var navVolume, navRejects, navActions;

    // 'public' functions and variables
    var initNav = function() {
        this.overlay = $("#spin-div")[0]; //document.getElementById('spin-div')
        this.spinner = new Spinner({
              lines: 13 // The number of lines to draw
            , length: 28 // The length of each line
            , width: 14 // The line thickness
            , radius: 42 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.35 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            //, zIndex: 1000 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        });
        
        // Timeframe
        $("#begin-date").on("change", function () {
            beginDate = $(this).val();
        });

        $("#end-date").on("change", function () {
            endDate = $(this).val();
        });

        var tf = ims.getTimeFrame();

        $("#range-" + tf).addClass("active");
    }

    var handleTimeFrameChange = function(timeFrameDiv) {
        $(".range-sel").removeClass("active");
        timeFrameDiv.addClass("active");

        var tf = timeFrameDiv.attr('id').split("-")[1];
        ims.setTimeFrame(tf)

        // let user choose dates
        if (ims.timeFrame == "custom") {
            $("#dialog").dialog({
                modal: true,
                open: function (event, ui) {
                    $('.ui-widget-overlay').addClass('custom-overlay');

                    $("#dialog").append("<div>Pick start and end date. <i>NOTE: daily statistics from this range will be shown.</i></div>")
                        .append("<div id=\"begin-date-picker\" style=\"float:left\"></div>")
                        .append("<div id=\"end-date-picker\" style=\"float:left\"></div>)");
                    $("#begin-date").datepicker({
                        dateFormat: "yyyy-mm-dd"
                    });
                    $("#end-date").datepicker({
                        dateFormat: "yyyy-mm-dd"
                    });
                },
                close: function (event, ui) {
                    $('.ui-widget-overlay').removeClass('custom-overlay');
                    $("#dialog").empty(); //.remove();
                }
            });
        }

        //window.location.reload();
        console.log('click');
        //ims.init();
        //ims.updateIndex(ims.timeFrame);
        //ims.initializeIndex();
        ims.updateNavBarData(ims.timeFrame);
        ims.updateNavBar();
    }

    var initBase = function() {
        var socket = io.connect('http://' + document.domain + ':' + location.port);
        console.log('connected')
        socket.on('srv_health', function (msg) {
            var my_statuses = msg.server_statuses;
            var server_panel_html = '';
            for (var i = 0; i < my_statuses.length; i++) {
                if (my_statuses[i][1] == 'good') {
                    server_panel_html += '<li class="dropdown server-good"><a> ' + my_statuses[i][0];
                    server_panel_html += '<span class="glyphicon glyphicon-ok" style="font-size:1.5em; color:green"></span>'
                    server_panel_html += '</a></li>'
                }
                else {
                    server_panel_html += '<li class="dropdown server-bad"><a> ' + my_statuses[i][0];
                    server_panel_html += '<span class="glyphicon glyphicon-remove" style="font-size:1.5em; color:red"></span>'
                    server_panel_html += '</a></li>'
                }
            }
            $('#ServerBar').html(server_panel_html);
        });


        //ims.spinIMS();
        console.log('init');
        //ims.initializeIndex();

        //ims.updateNavBarData(ims.timeFrame);
        //ims.updateNavBar();
        

        //ims.unspinIMS();
    }

    var spinIMS = function() {
        $("#spin-div").css('visibility', 'visible');
        //$("#spin-div")[0].className = "div-overlay";
        //var spinner = new Spinner(spinner_opts).spin();
        //overlay.appendChild(spinner.el);
        //overlay.className = "div-overlay";
        this.spinner.spin($("#spin-div")[0]);
    }

    var unspinIMS = function() {
        $("#spin-div").css('visibility', 'hidden');
        this.spinner.stop($("#spin-div")[0]);
        //$("#spin-div")[0].className = "";
        //overlay.className = "";
    }

    var dateSelection = function() {
        $("#begin-date").style('visibility', true);
        $("#end-date").style('visibility', true);

        $("#begin-date").style('visibility', false);
        $("#end-date").style('visibility', false);

    }

    var updateIndex = function(timeFrame) {
        //spinIMS();

        this.timeFrame = getTimeFrame();

        updateIndexData(false, timeFrame);

        $("#trader-activity").empty();
        traderActivityTable = new Handsontable(
            document.getElementById('trader-activity'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Trader", "Actions", "Rejects", "Reject %", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"IDDiv", renderer: "html"},
                    {data:"Actions"},
                    {data:"Rejects"},
                    {data:"RejectPct", type:'numeric', format: '0.00'},
                    {data:"Volume", type:'numeric', format: '#,,.0'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: traderData,
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('index.trader');
                },
                afterRender: function(changes, source) {
                    renderBars('index.trader');
                }
            });
        renderBars('index.trader');
        traderActivityTable.sort(4, false);


        $("#lp-activity").empty();
        lpActivityTable = new Handsontable(
            document.getElementById('lp-activity'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["LP", "Actions", "Rejects", "Reject %", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"IDDiv", renderer: "html"},
                    {data:"Actions"},
                    {data:"Rejects"},
                    {data:"RejectPct", type:'numeric', format: '0.00'},
                    {data:"Volume", type:'numeric', format: '#,,.0'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: lpData,
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('index.lp');
                },
                afterRender: function(changes, source) {
                    renderBars('index.lp');
                },
            });
        lpActivityTable.sort(4, false);
        renderBars('index.lp');

        $("#pair-volume").empty();
        pairVolumeTable = new Handsontable(
            document.getElementById('pair-volume'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Pair", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"NameBar", renderer: "html"},
                    {data:"Volume", type:'numeric', format: '#,,.0'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: pairsData,
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('index.pairs');
                },
                afterRender: function(changes, source) {
                    renderBars('index.pairs');
                },

            });
        renderBars('index.pairs');
        pairVolumeTable.sort(1, false);

        $("#client-volume").empty();
        clientVolumeTable = new Handsontable(
            document.getElementById('client-volume'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Client", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"NameBar", renderer: "html"},
                    {data:"Volume", type:'numeric', format: '#,,.0'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: clientData,
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('index.clients');
                },
                afterRender: function(changes, source) {
                    renderBars('index.clients');
                },

            });
        renderBars('index.clients');
        clientVolumeTable.sort(1, false);

        //unspinIMS();

        labels = new Array();
        spots = new Array();
        fwds = new Array();
        swaps = new Array();
        for (var i = 0 ; i < clientChartData.length ; i++){
            labels[i] = clientChartData[i][0];
            spots[i] = (clientChartData[i][1]/1000000).toFixed(2);
            fwds[i] = (clientChartData[i][2]/1000000).toFixed(2);
            swaps[i] = (clientChartData[i][3]/1000000).toFixed(2);
        }

        if(clientChartObj !== undefined) {
            clientChartObj.destroy();
        }
        var client_canvas = document.getElementById("client-chart");

        clientChartObj = new Chart(client_canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Spot Volume',
                        data: spots,
                        backgroundColor: '#026838',
                        //borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Forwards Volume',
                        data: fwds,
                        backgroundColor: ' #8C001A',
                        //borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Swaps Volume',
                        data: swaps,
                        backgroundColor: 'rgb(95, 128, 163)',//'#FFDE00',
                        //borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function(tooltipItems, data) {
                            return data.datasets[tooltipItems.datasetIndex].label + ": "+ tooltipItems.yLabel + ' USD MM';

                        }
                    }
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'USD MM'
                        },
                        ticks: {
                            beginAtZero:true,
                            // Return an empty string to draw the tick line but hide the tick label
                            // Return `null` or `undefined` to hide the tick line entirely
                            userCallback: function(value, index, values) {
                                return value.toLocaleString('en-US', { minimumFractionDigits: 2 });
                            }
                        }
                    }]
                }
            }
        });
        //cht.destroy();

        fitToContainer(client_canvas);
        function fitToContainer(canvas){
            canvas.style.width='100%';
            canvas.style.height='100%';
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }

    var initializeIndex = function() {
        //overlay = document.getElementById('spin-div');
        //overlay = $("#spin-div")[0];
        //spinner = new Spinner(spinner_opts); //.spin($("#spin-div")[0]); //document.getElementById('spin-div'));
        //overlay = $("#spin-div")[0]; //document.getElementById('spin-div')
        //spinner = new Spinner(spinner_opts);

        //spinIMS();

        //updateIndexData(false, this.timeFrame);

        updateIndex(this.timeFrame);


        /*var myChart = new Chart(
            document.getElementById("client-chart"),
            {
                type: 'bar',
                data: {
                    labels: client_chart_data,
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
            });*/
            $(".range-sel").click(function () {
                handleTimeFrameChange($(this));
                //updateIndexData(false, this.timeFrame);
                updateIndex(this.timeFrame);
            })
            .removeClass("active");
    }

    var renderBars = function(table_type) {
        var arrayLength;
        var minVolume = 0;
        var maxVolume = 0;

        if(table_type === "index.trader") {
            arrayLength = traderData.length;
            for (var i = 0; i < arrayLength; i++) {
            if(traderData[i].Volume > maxVolume)
                maxVolume = traderData[i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#trd-" + traderData[i].ID + "-volume");

                if(svg[0][0] === null) {
                    continue;
                }

                svg.selectAll("*").remove();

                var colW = $("#trd-" + traderData[i].ID + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);

                barplots.tableBar(
                    "#trd-" + traderData[i].ID + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: traderData[i].Volume
                    }
                );
            }
        }
        else if(table_type === "index.lp") {
            arrayLength = lpData.length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(lpData[i].Volume > maxVolume)
                    maxVolume = lpData[i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#lp-" + lpData[i].ID + "-volume");
                svg.selectAll("*").remove();

                var colW = $("#lp-" + lpData[i].ID + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);

                if(svg[0][0] === null) {
                    continue;
                }

                barplots.tableBar(
                    "#lp-" + lpData[i].ID + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: lpData[i].Volume
                    }
                );
            }
        }
        else if(table_type === "index.pairs") {
            arrayLength = pairsData.length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(pairsData[i].Volume > maxVolume)
                    maxVolume = pairsData[i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#pair-" + pairsData[i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#pair-" + pairsData[i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#pair-" + pairsData[i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: pairsData[i].Volume
                    }
                );
            }
        }
        else if(table_type === "index.clients") {
            arrayLength = clientData.length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(clientData[i].Volume > maxVolume)
                    maxVolume = clientData[i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#client-" + clientData[i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#client-" + clientData[i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#client-" + clientData[i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: clientData[i].Volume
                    }
                );
            }
        }/*
        else if(table_type === "lptrader.pair"){
            arrayLength = lpTraderData[0].length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(lpTraderData[0][i].Volume > maxVolume)
                    maxVolume = lpTraderData[0][i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#lptrader-pair-" + lpTraderData[0][i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#lptrader-pair-" + lpTraderData[0][i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#lptrader-pair-" + lpTraderData[0][i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: lpTraderData[0][i].Volume
                    }
                );
            }
        }
        else if(table_type === "lptrader.second"){
            arrayLength = lpTraderData[1].length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(lpTraderData[1][i].Volume > maxVolume)
                    maxVolume = lpTraderData[1][i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#lptrader-second-" + lpTraderData[1][i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#lptrader-second-" + lpTraderData[1][i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#lptrader-second-" + lpTraderData[1][i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: lpTraderData[1][i].Volume
                    }
                );
            }
        }
        else if(table_type === "pair.trader"){
            arrayLength = pairData[0].length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(pairData[0][i].Volume > maxVolume)
                    maxVolume = pairData[0][i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#pair-trader-" + pairData[0][i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#pair-trader-" + pairData[0][i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#pair-trader-" + pairData[0][i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: pairData[0][i].Volume
                    }
                );
            }
        }
        else if(table_type === "pair.lp"){
            arrayLength = pairData[1].length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(pairData[1][i].Volume > maxVolume)
                    maxVolume = pairData[1][i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#pair-lp-" + pairData[1][i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#pair-lp-" + pairData[1][i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#pair-lp-" + pairData[1][i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: pairData[1][i].Volume
                    }
                );
            }
        }
        else if(table_type === "pair.client"){
            arrayLength = pairData[2].length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(pairData[2][i].Volume > maxVolume)
                    maxVolume = pairData[2][i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#pair-client-" + pairData[2][i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#pair-client-" + pairData[2][i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#pair-client-" + pairData[2][i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: pairData[2][i].Volume
                    }
                );
            }
        }
        else if(table_type === "client.pair"){
            arrayLength = clientData.length;
            maxVolume = 0;
            for (var i = 0; i < arrayLength; i++) {
                if(clientData[i].Volume > maxVolume)
                    maxVolume = clientData[i].Volume;
            }

            for (var i = 0; i < arrayLength; i++) {
                var svg = d3.select("#client-pair-" + clientData[i].Tag + "-volume");
                svg.selectAll("*").remove();

                if(svg[0][0] === null) {
                    continue;
                }

                var colW = $("#client-pair-" + clientData[i].Tag + "-volume-div").width();
                //console.log("WxH: " + colW + " x " + 20);

                svg.style('width', colW);
                svg.style('height', rowHeight);
                barplots.tableBar(
                    "#client-pair-" + clientData[i].Tag + "-volume",
                    {
                        low: minVolume,
                        high: maxVolume,
                        barValue: clientData[i].Volume
                    }
                );
            }
        }
        */

        //console.log("-------------------------------------------------------------\n");
    }

    var updateNavBarData = function(timeFrame) {
        $.ajax({
            url: baseURL + 'ims/get_nav_bar_data',
            data: JSON.stringify({
                time_frame: timeFrame,
                start_date: "2016-05-10",
                end_date: "2016-05-10",
            }),
            type: 'GET',
            crossDomain: true,
            contentType: "application/json",
            dataType: 'json',
            async: false,
        })
            .done(function (x) {
                ims.navVolume = x.volume;
                ims.navRejects = x.rejects;
                ims.navActions = x.actions;
            });
    };

    var updateNavBar = function() {
        var total_vol_str = ims.navVolume.Total.toFixed(2);
        if(ims.navVolume.Total >= 10 && ims.navVolume.Total < 100)
            total_vol_str = ims.navVolume.Total.toFixed(1);
        else if (ims.navVolume.Total >= 100)
            total_vol_str = ims.navVolume.Total.toFixed(0);

        $("#nav-total-volume").html("Total Volume<br/>" + total_vol_str + " USD MM <span class=\"caret\"></span>");
        boxplots.navbarBoxPlot(
            "#ims-nav-volume-boxplot",
            "#ims-nav-volume-boxplot-tooltip",
            ims.navVolume.Stats
        );

        $("#nav-total-rejects").html("Total Rejects<br/>" + ims.navRejects.Total + " rejects <span class=\"caret\"></span>");
        boxplots.navbarBoxPlot(
            "#ims-nav-rejects-boxplot",
            "#ims-nav-rejects-boxplot-tooltip",
            ims.navRejects.Stats
        );

        $("#nav-total-actions").html("Total Actions<br/>" + ims.navActions.Total + " actions <span class=\"caret\"></span>");
        boxplots.navbarBoxPlot(
            "#ims-nav-actions-boxplot",
            "#ims-nav-actions-boxplot-tooltip",
            ims.navActions.Stats
        );
    }

    var updateIndexData = function(async, timeFrame) {
        $.ajax({
            url : baseURL + 'ims/get_index_data',
            data: JSON.stringify({
                time_frame: timeFrame,
                start_date: "2016-05-10",
                end_date: "2016-05-10",
            }),
            type: 'POST',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: async,
        })
        .done(function(x) {
            traderData = x.trader_data;
            lpData = x.lp_data;
            pairsData = x.pairs_data;
            clientData = x.client_data;
            clientChartData = x.client_chart_data;
        });
    };

    var getVolumes = function() {
        $("#features").html('<h1>' + totalVolume + '</h1>');
        console.log("ims.getVolumes()");
        return 0;
    }

    var setTimeFrame = function(timeFrame) {
        $.ajax({
            url : baseURL + 'ims/time_frame',
            data: JSON.stringify({
                time_frame: timeFrame,
            }),
            type: 'PUT',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: false,
        })
        .done(function(x) {
            this.timeFrame = timeFrame;
        });
    }

    var getTimeFrame = function() {
        $.ajax({
            url : baseURL + 'ims/time_frame',
            type: 'GET',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: false,
        })
        .done(function(x) {
           ims.timeFrame = x.imsTimeFrame;
        });

        return ims.timeFrame;
    }
    /*
    var initializeMainPageSubPage = function(spec_type, spec_value){
        this.timeFrame = getTimeFrame();
        updateMainPageSubPageData(false, timeFrame, spec_type, spec_value);

        if(spec_type == 'lp' || spec_type == 'trader')
            updateLpTrader(this.timeFrame, spec_type, spec_value);
        else if (spec_type == 'pair')
            updatePair(this.timeFrame, spec_value);
        else if (spec_type == 'client')
            updateClient(this.timeFrame, spec_value);

    }

    var updateLpTrader = function(timeFrame, spec_type, spec_value){
        $("#lp-trader-pair-table").empty();
        lpTraderPairTable = new Handsontable(
            document.getElementById('lp-trader-pair-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Pair", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"Name"},
                    {data:"Volume", type:'numeric', format: '#,,.00'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: lpTraderData[0],
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('lptrader.pair');
                },
                afterRender: function(changes, source) {
                    renderBars('lptrader.pair');
                }
            });
        renderBars('lptrader.pair');
        lpTraderPairTable.sort(1, false);

        var lpTraderSecondHeader = "LP";
        if(spec_type == "lp")
            lpTraderSecondHeader = "Trader";
        $("#lp-trader-second-table").empty();
        lpTraderSecondTable = new Handsontable(
            document.getElementById('lp-trader-second-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: [lpTraderSecondHeader, "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"Name"},
                    {data:"Volume", type:'numeric', format: '#,,.00'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: lpTraderData[1],
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('lptrader.second');
                },
                afterRender: function(changes, source) {
                    renderBars('lptrader.second');
                }
            });
        renderBars('lptrader.second');
        lpTraderSecondTable.sort(1, false);

        if(lpTraderData[2].length == 0)
            $('#lp-trader-reject-table').html("<h4>No Rejects for this " + spec_type + "<h4>");
        else{
            var lpTraderRejectHeader = "lp";
            if(spec_type == "lp")
                lpTraderRejectHeader = "RemoteOrderId";
            $("#lp-trader-reject-table").empty();
            lpTraderRejectTable = new Handsontable(
                document.getElementById('lp-trader-reject-table'),
                {
                    renderAllRows: true,
                    observeChanges: true,
                    rowHeaders: false,
                    colHeaders: ["AggOrderId", "Date", "Time", lpTraderRejectHeader, "Symbol", "Side", "Quantity", "Reject Reason"],
                    columns: [
                        {data:"AggOrderId"},
                        {data:"RejectDate"},
                        {data:"RejectTime"},
                        {data:lpTraderRejectHeader},
                        {data:"Symbol"},
                        {data:"Side"},
                        {data:"Quantity", type:'numeric', format: '#,,'},
                        {data:"Reason"},
                    ],
                    columnSorting: true,
                    stretchH: 'all',
                    data: lpTraderData[2],
                    tableClassName: ['table', 'table-hover', 'table-striped', 'htCenter'],
                });
            lpTraderRejectTable.sort(2, false);
        }
    }

    var updatePair = function(timeFrame, spec_type, spec_value){
        $("#pair-trader-table").empty();
        pairTraderTable = new Handsontable(
            document.getElementById('pair-trader-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Trader", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"Name"},
                    {data:"Volume", type:'numeric', format: '#,,.00'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: pairData[0],
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('pair.trader');
                },
                afterRender: function(changes, source) {
                    renderBars('pair.trader');
                }
            });
        renderBars('pair.trader');
        pairTraderTable.sort(1, false);

        $("#pair-lp-table").empty();
        pairLpTable = new Handsontable(
            document.getElementById('pair-lp-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["LP", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"Name"},
                    {data:"Volume", type:'numeric', format: '#,,.00'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: pairData[1],
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('pair.lp');
                },
                afterRender: function(changes, source) {
                    renderBars('pair.lp');
                }
            });
        renderBars('pair.lp');
        pairLpTable.sort(1, false);

        $("#pair-client-table").empty();
        pairClientTable = new Handsontable(
            document.getElementById('pair-client-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Client", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"Name"},
                    {data:"Volume", type:'numeric', format: '#,,.00'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: pairData[2],
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('pair.client');
                },
                afterRender: function(changes, source) {
                    renderBars('pair.client');
                }
            });
        renderBars('pair.client');
        pairClientTable.sort(1, false);
    }

    var updateClient = function(timeFrame, spec_type, spec_value){
        $("#client-pair-table").empty();
        clientPairTable = new Handsontable(
            document.getElementById('client-pair-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["Client", "Volume (MM USD)", "Volume (USD)"],
                columns: [
                    {data:"Name"},
                    {data:"Volume", type:'numeric', format: '#,,.00'},
                    {data:"VolumeBar", renderer: "html"},
                ],
                columnSorting: true,
                stretchH: 'last',
                data: clientData,
                tableClassName: ['table', 'table-hover', 'table-striped'],
                afterColumnSort: function(changes, source) {
                    renderBars('client.pair');
                },
                afterRender: function(changes, source) {
                    renderBars('client.pair');
                }
            });
        renderBars('client.pair');
        clientPairTable.sort(1, false);
    }

    var updateMainPageSubPageData = function(async, timeFrame, spec_type, spec_value){
        $.ajax({
            url : baseURL + 'ims/get_main_sub_page_data',
            data: JSON.stringify({
                time_frame: timeFrame,
                spec_type: spec_type,
                spec_value: spec_value
                }),
            type: 'POST',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: async,
        })
        .done(function(x) {
            if (spec_type == 'trader' || spec_type == 'lp'){
                lpTraderData = new Array();
                lpTraderData[0] = x.pair_data;
                if(spec_type == 'trader')
                    lpTraderData[1] = x.lp_data;
                else
                    lpTraderData[1] = x.trader_data;
                lpTraderData[2] = x.reject_data;
                // ONCE IMPLEMENTED ADD REJECT DATA HERE AS WELL
            }
            else if (spec_type == 'pair'){
                pairData = new Array();
                pairData[0] = x.trader_data;
                pairData[1] = x.lp_data;
                pairData[2] = x.client_data;
            }
            else if (spec_type == 'client'){
                clientData = x.pair_data;
            }
        });
    }

    var initializeVolumePage = function(){
        this.timeFrame = getTimeFrame();
        updateVolumePageData(false, this.timeFrame);
        updateVolumePage();
    }

    var updateVolumePage = function(){
        $("#overall-volume-table").empty();
        overallVolumeTable = new Handsontable(
            document.getElementById('overall-volume-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: ["TYPE", "TODAY (MM USD)", "WEEK TO DATE (MM USD)", "MONTH TO DATE (MM USD)", "YEAR TO DATE (MM USD)"],
                columns: [
                    {data:"Algo"},
                    {data:"TOD", type:'numeric', format: '#,,.00'},
                    {data:"WTD", type:'numeric', format: '#,,.00'},
                    {data:"MTD", type:'numeric', format: '#,,.00'},
                    {data:"YTD", type:'numeric', format: '#,,.00'},
                ],
                columnSorting: false,
                stretchH: 'all',
                data: overallVolumeData,
                tableClassName: ['table', 'table-hover', 'htCenter'],
            });

        all_headers = document.getElementsByTagName("th");
        for (var i = 0 ; i < all_headers.length ; i++){
            all_headers[i].style.fontWeight = 'bold';
            all_headers[i].style.fontSize = 'larger';
        }

        var vol_table = document.getElementsByTagName("table");
        for(var i=0;i<vol_table.length;i++) {
            var tmp_rows = vol_table[i].rows;

            for(var j = 0 ; j < tmp_rows.length ; j++){
                var tmp_cells = tmp_rows[j].cells;
                if(tmp_cells.length > 0){
                    if (tmp_cells[0].innerText == 'ALGO TOTAL' || tmp_cells[0].innerText == 'NON-ALGO TOTAL'){
                        tmp_rows[j].style.backgroundColor = 'rgba(2, 104, 56, 0.2)';
                        tmp_rows[j].style.fontWeight = 'bold';
                        tmp_rows[j].style.fontSize = 'larger';
                    }
                    else if(tmp_cells[0].innerText == 'TOTAL'){
                        tmp_rows[j].style.backgroundColor = 'rgba(2, 104, 56, 0.4)';
                        tmp_rows[j].style.fontWeight = 'bold';
                        tmp_rows[j].style.fontSize = 'larger';
                    }
                }
            }
        }

    }

    var updateVolumePageData = function(async, timeFrame){
        $.ajax({
            url : baseURL + 'ims/get_overall_volume_data',
            data: JSON.stringify({time_frame: timeFrame}),
            type: 'POST',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: async,
        })
        .done(function(x) {
            overallVolumeData = x.overall_volumes;
        });
    }

    var initializeHitRatioPage = function(){
        this.timeFrame = getTimeFrame();
        updateHitRatioPageData(false, this.timeFrame);
        updateHitRatioPage();
    }

    var updateHitRatioPage = function(){
        $("#hr-customer-table").empty();
        hrCustomerTable = new Handsontable(
            document.getElementById('hr-customer-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                columnSorting: false,
                stretchH: 'all',
                data: hrCustomerData,
                renderer: 'html',
                tableClassName: ['table', 'table-hover', 'table-striped', 'htCenter'],
        });

    }

    var updateHitRatioPageData = function(async, timeFrame){
        $.ajax({
            url : baseURL + 'ims/get_hr_customer_table',
            data: JSON.stringify({time_frame: timeFrame}),
            type: 'POST',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: async,
        })
        .done(function(x) {
            hrCustomerData = x.hr_customers;
        });
    }

    var updateHRRFQ = function(my_customer){
        updateHRRFQData(my_customer, false, getTimeFrame());

        $("#hr-rfq-table").empty();
        hrRFQTable = new Handsontable(
            document.getElementById('hr-rfq-table'),
            {
                renderAllRows: true,
                observeChanges: true,
                rowHeaders: false,
                colHeaders: [
                    "Customer", "Cancel Quantity", "Reject Quantity", "Fill Quantity", "Total RFQ", "Win Percentage",
                    "Cancel USD Quantity", "Reject USD Quantity", "Fill USD Quantity", "Total RFQ in USD", "Win Percentage in USD"
                ],
                columns: [
                    {data:"customer"},
                    {data:"cancel-count", type:'numeric', format: '#,,'},
                    {data:"reject-count", type:'numeric', format: '#,,'},
                    {data:"fill-count", type:'numeric', format: '#,,'},
                    {data:"total-count", type:'numeric', format: '#,,'},
                    {data:"perc-count", type:'numeric', format: '0.00'},
                    {data:"cancel-usd", type:'numeric', format: '#,,.00'},
                    {data:"reject-usd", type:'numeric', format: '#,,.00'},
                    {data:"fill-usd", type:'numeric', format: '#,,.00'},
                    {data:"total-usd", type:'numeric', format: '#,,.00'},
                    {data:"perc-usd", type:'numeric', format: '0.00'},
                ],
                columnSorting: true,
                stretchH: 'all',
                data: hrRFQData,
                tableClassName: ['table', 'table-hover', 'table-striped', 'htCenter'],
            });

        // Coloring the last row of the table (the total row)
        var rfq_table = document.getElementsByTagName("table");
        for(var i=0;i<rfq_table.length;i++) {
            var tmp_rows = rfq_table[i].rows;
            if(tmp_rows.length > 0){
                if(tmp_rows[0].cells.length == 11){
                    var tmp_cells = tmp_rows[tmp_rows.length-1].cells;
                    if(tmp_cells.length > 0){
                        if (tmp_cells[0].innerText == my_customer && my_customer != 'All'){
                            tmp_rows[tmp_rows.length-1].style.backgroundColor = 'rgba(2, 104, 56, 0.5)';
                            tmp_rows[tmp_rows.length-1].style.fontWeight = 'bold';
                            tmp_rows[tmp_rows.length-1].style.fontSize = 'larger';
                        }
                    }
                }
            }
        }
    }

    var updateHRRFQData = function(customer, async, timeFrame){
        if(customer == 'All')   customer = '';
        $.ajax({
            url : baseURL + 'ims/get_hr_rfq_data',
            data: JSON.stringify({
                time_frame: timeFrame,
                customer: customer,
                }),
            type: 'POST',
            crossDomain: true,
            contentType:"application/json",
            dataType: 'json',
            async: async,
        })
        .done(function(x) {
            hrRFQData = x.hr_rfq_data;
        });
    }
*/
    return {
        // functions
        initBase: initBase,
        handleTimeFrameChange: handleTimeFrameChange,
        initNav: initNav,
        spinIMS: spinIMS,
        unspinIMS: unspinIMS,
        updateNavBarData: updateNavBarData,
        updateNavBar: updateNavBar,
        updateIndexData: updateIndexData,
        updateIndex: updateIndex,
        initializeIndex: initializeIndex,
        getVolumes: getVolumes,
        dateSelection: dateSelection,
        setTimeFrame: setTimeFrame,
        getTimeFrame: getTimeFrame,
        //initializeMainPageSubPage: initializeMainPageSubPage,
        //updateLpTrader: updateLpTrader,
        //updateClient: updateClient,
        //updatePair: updatePair,
        //updateMainPageSubPageData: updateMainPageSubPageData,
        //initializeVolumePage: initializeVolumePage,
        //updateVolumePage: updateVolumePage,
        //updateVolumePageData: updateVolumePageData,
        //initializeHitRatioPage: initializeHitRatioPage,
        //updateHitRatioPage: updateHitRatioPage,
        //updateHitRatioPageData: updateHitRatioPageData,
        //updateHRRFQ: updateHRRFQ,
        //updateHRRFQData: updateHRRFQData,


        // variables
        navVolume: navVolume,
        navRejects: navRejects,
        navActions: navActions,
        timeFrame: timeFrame,
        traderData: traderData,
        lpData: lpData,
        pairsData: pairsData,
        overlay: overlay,
        spinner: spinner
    }

}());