Date.prototype.format = function(formatString) {
    var hour = this.getHours();
    var minute = this.getMinutes();
    return formatString.replace('%H', hour).replace('%M', minute);
}


function dataToSeries(data) {
    var reads = [];
    var writes = [];

    // Start with 1 to skip first entry with accumulated readings
    for (var i = 1, j = data.length; i < j; i++) {
        var tuple = data[i];
        var date = new Date(tuple[0] * 1000);
        reads.push([date, tuple[2]]);
        writes.push([date, tuple[4]]);
    }

    return [
        { data : reads, label : 'Reads' },
        { data : writes, label : 'Writes' },
    ];
}


function millisSeries(data) {
    var allSeries = [];
    for (device in data) {
        var deviceData = data[device];
        var seriesData = []
        for (var i = 1, j = deviceData.length; i < j; i++) {
            var tuple = deviceData[i];
            var date = new Date(tuple[0] * 1000);
            seriesData.push([date, tuple[1]]);
        }
        allSeries.push({ data: seriesData, label: device });
    }
    return allSeries;
}


function drawFlotr(container, series, options) {
    var defaultOptions = {
        selection : { mode : 'x' },
        xaxis: {
            noTicks: 20,
            tickFormatter: function(millis) {
                var date = new Date(parseInt(millis));
                return date.format('%H:%M');
            }
        }
    }
    defaultOptions = Flotr._.extend(defaultOptions, options);

    function drawGraph(extraOptions) {
        // Clone so that 'defaultOptions' is intact
        extraOptions = Flotr._.extend(Flotr._.clone(defaultOptions), extraOptions || {});
        return Flotr.draw(
            container,
            series,
            extraOptions
        );
    }

    Flotr.EventAdapter.observe(container, 'flotr:select', function(area) {
        // Draw graph with new area
        drawGraph({
            xaxis: {
                min: area.x1,
                max: area.x2
            },
            yaxis: {
                min: area.y1,
                max: area.y2
            }
        });
    });

    // When graph is clicked, draw the graph with default area.
    Flotr.EventAdapter.observe(container, 'flotr:click', function() {
        drawGraph();
    });

    drawGraph();
}


$(document).ready(function() {
    var body = $('body');
    function makeContainer(options) {
        var container = $('<div/>', options);
        container.appendTo(body);
        return container[0];
    }

    drawFlotr(
        makeContainer({ 'id': 'dsk', 'class': 'graph' }),
        millisSeries(data),
        { title: 'Time spent on I/O' }
    );

    for (device in data) {
        drawFlotr(
            makeContainer({ 'id': 'dsk-' + device, 'class': 'graph' }),
            dataToSeries(data[device]),
            { title: 'Number of reads/writes for ' + device }
        );
    }
});
