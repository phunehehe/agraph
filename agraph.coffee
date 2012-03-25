Date::format = (formatString) ->
    hours = this.getHours()
    minutes = this.getMinutes()
    return formatString.replace('%H', hours).replace('%M', minutes)


class Snapshot
    constructor: (@tuple) ->
    timestamp: ->
        return new Date(this.tuple[0] * 1000)
    ioTime: ->
        return this.tuple[1]
    reads: ->
        return this.tuple[2]
    sectorsRead: ->
        return this.tuple[3]
    writes: ->
        return this.tuple[4]
    sectorsWritten: ->
        return this.tuple[5]


ioTimeSeries = (data) ->
    extract = (tuple) ->
        snapshot = new Snapshot tuple
        return [snapshot.timestamp(), snapshot.ioTime()]
    return {
        # Start with 1 to skip first entry with accumulated readings
        data: (extract(tuple) for tuple in deviceData[1..]),
        label: device
    } for device, deviceData of data


readsWritesSeries = (data) ->
    reads = []
    writes = []

    # Start with 1 to skip first entry with accumulated readings
    for tuple in data[1..]
        snapshot = new Snapshot tuple
        reads.push([snapshot.timestamp(), snapshot.reads()])
        writes.push([snapshot.timestamp(), snapshot.writes()])

    return [
        {data: reads, label: 'Reads'},
        {data: writes, label: 'Writes'},
    ]


sectorsSeries = (data) ->
    read = []
    written = []

    # Start with 1 to skip first entry with accumulated readings
    for tuple in data[1..]
        snapshot = new Snapshot tuple
        read.push([snapshot.timestamp(), snapshot.sectorsRead()])
        written.push([snapshot.timestamp(), snapshot.sectorsWritten()])

    return [
        {data: read, label: 'Read'},
        {data: written, label: 'Written'}
    ]


drawFlotr = (container, series, options) ->
    defaultOptions = {
        selection : {mode : 'x'},
        xaxis: {
            noTicks: 10,
            tickFormatter: (millis) ->
                date = new Date(parseInt(millis))
                return date.format('%H:%M')
        }
    }
    defaultOptions = Flotr._.extend(defaultOptions, options)

    drawGraph = (options=defaultOptions) ->
        return Flotr.draw(
            container,
            series,
            options,
        )

    Flotr.EventAdapter.observe(container, 'flotr:select', (area) ->
        newOptions = $.extend(true, defaultOptions)
        newOptions.xaxis.min = area.x1
        newOptions.xaxis.max = area.x2
        drawGraph(newOptions)
    )

    # When graph is clicked, draw the graph with default area.
    Flotr.EventAdapter.observe(container, 'flotr:click', -> drawGraph())

    drawGraph()


makeContainer = (id, extraClass, newRow=true) ->
    container = $('#graph-container')
    if newRow
        row = $('<div/>', {'class': 'row'})
    else
        row = container.find('.row:last')
    graph = $('<div/>', {id: id, class: 'graph ' + extraClass})
    graph.appendTo(row)
    row.appendTo(container)
    return graph[0]


$(document).ready ->

    drawFlotr(
        makeContainer('dsk', 'span12'),
        ioTimeSeries(data),
        {title: 'Time spent on I/O'}
    )

    for device, deviceData of data
        drawFlotr(
            makeContainer('dsk-rw' + device, 'span6'),
            readsWritesSeries(deviceData),
            {title: 'Disk reads/writes - ' + device}
        )
        drawFlotr(
            makeContainer('dsk-srw' + device, 'span6', false),
            sectorsSeries(deviceData),
            {title: 'Sectors read/written - ' + device}
        )
