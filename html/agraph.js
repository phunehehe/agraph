window.onload = function () {

    var graph_device = function(placeholder, data) {

        var reads = [];
        var writes = [];

        // Start with 1 to skip first entry with accumulated readings
        for (var i = 1, j = data.length; i < j; i++) {
            var tuple = data[i];
            reads.push([tuple[0], tuple[1]]);
            writes.push([tuple[0], tuple[2]]);
        }

        $.jqplot(placeholder, [reads, writes]);
    }

    for (device in data) {
        var placeholder = 'jqplot' + device;
        $('<div/>', {
            'id': placeholder
        }).appendTo('body');

        graph_device(placeholder, data[device]);
    }
};
