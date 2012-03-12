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
        reads.push([date, tuple[1]]);
        writes.push([date, tuple[2]]);
    }

    return [reads, writes];
}


$(document).ready(function() {

    var body = $('body');

    for (device in data) {

        var placeholder = 'dsk-' + device;

        $('<div/>', {
            'id': placeholder,
            'style': 'height: 300px',
        }).appendTo(body);

        var container = $('#' + placeholder)[0];
        var series = dataToSeries(data[device]);

        var options = {
            selection : { mode : 'x' },
            xaxis: {
                noTicks: 20,
                tickFormatter: function(millis) {
                    var date = new Date(parseInt(millis));
                    return date.format('%H:%M');
                }
            }
        }

        function drawGraph(opts) {
            // Clone the options, so the 'options' variable always keeps intact.
            var o = Flotr._.extend(Flotr._.clone(options), opts || {});
            return Flotr.draw(
                container,
                series,
                o
            );
        }

        drawGraph();

        Flotr.EventAdapter.observe(container, 'flotr:select', function(area) {
            // Draw graph with new area
            f = drawGraph({
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
        Flotr.EventAdapter.observe(container, 'flotr:click', function() { drawGraph(); });

        break;
    }
});
