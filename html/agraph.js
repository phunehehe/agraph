window.onload = function () {

    var body = $('body');

    var data_to_series = function(data) {

        var reads = [];
        var writes = [];

        // Start with 1 to skip first entry with accumulated readings
        for (var i = 1, j = data.length; i < j; i++) {
            var tuple = data[i];
            var date = tuple[0] * 1000;
            reads.push([date, tuple[1]]);
            writes.push([date, tuple[2]]);
        }

        return [reads, writes];
    }

    for (device in data) {

        var placeholder = 'jqplot-' + device;

        $('<div/>', {
            'id': placeholder,
        }).appendTo(body);

        $.jqplot(placeholder, data_to_series(data[device]), {
            axesDefaults: {
                pad: 0,
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions:{
                    angle: -30,
                },
            },
            axes: {
                xaxis: {renderer: $.jqplot.DateAxisRenderer},
            },
            legend: {
                show: true,
            },
            seriesDefaults: {
                showMarker: false,
                fill: true,
                fillAndStroke: true,
                fillAlpha: 0.5,
            },
            series:[
                {label: 'Reads'},
                {label: 'Writes'},
            ],
            stackSeries: true,
            title: 'Disk Utilization for ' + device,
        });
    }
};
