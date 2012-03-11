window.onload = function () {

    var screen_width = screen.width;
    var screen_height = screen.height;

    var r = Raphael(0, 0, screen_width, screen_height);

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

        r.linechart(x, y, width, height, timestamps, [reads, writes], {shade: true});
    }

    var y = 0;
    var y_offset = screen_height / Object.keys(data).length;
    var graph_height = y_offset - 10;

    for (device in data) {
        graph_device(0, y, 800, graph_height, data[device]);
        y += y_offset;
    }
};
