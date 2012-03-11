var timestamps = [];
var reads = [];
var writes = [];

for (var i = 0; i < data.length; i++) {
    var tuple = data[i];
    console.log(tuple);
    timestamps.push(tuple[0]);
    reads.push(tuple[1]);
    writes.push(tuple[2]);
}

window.onload = function () {
    var r = Raphael(0, 0, 800, 480);
    r.linechart(0, 0, 800, 480, timestamps, [reads, writes], {shade: true});
};
