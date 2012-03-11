window.onload = function () {

    var documentElement = document.documentElement;
    var screen_width = documentElement.clientWidth;
    var screen_height = documentElement.clientHeight;

    var screen_padding = 10;
    var svg_width = screen_width - screen_padding * 2;
    var svg_height = screen_height - screen_padding * 2;

    var r = Raphael(screen_padding, screen_padding, svg_width, svg_height);

    var graph_options = {
        shade: true,
        axis: '0 0 1 1',
    };

    var graph_device = function(x, y, width, height, data) {

        var timestamps = [];
        var reads = [];
        var writes = [];

        // Start with 1 to skip first entry with accumulated readings
        for (var i = 1, j = data.length; i < j; i++) {
            var tuple = data[i];
            timestamps.push(tuple[0]);
            reads.push(tuple[1]);
            writes.push(tuple[2]);
        }

        r.linechart(x, y, width, height, timestamps, [reads, writes], graph_options);
    }

    var graph_height_outer = svg_height / Object.keys(data).length;
    var graph_padding = 10;
    var graph_height_inner = graph_height_outer - graph_padding * 2;
    var graph_width = screen_width;

    var y = 0;
    for (device in data) {
        graph_device(50, y, graph_width, graph_height_inner, data[device]);
        r.text(graph_width / 2, y + 10, 'Disk usage for ' + device);
        y += graph_height_outer;
    }
};
