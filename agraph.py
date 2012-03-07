#!/usr/bin/env python

from subprocess import Popen
from subprocess import PIPE
import json


timestamps = []
reads = []
writes = []

output = Popen(['atop', '-PDSK', '-r', '/var/log/atop.log.1'], stdout=PIPE).stdout
skip_first = True

for line in output:
    line = line.strip()
    if line in ('SEP', 'RESET'):
        continue
    # First readings are ridiculously high
    if skip_first:
        skip_first = False
        continue
    tokens = line.split(' ')
    label, host, timestamp_str, _, _, interval, device, milliseconds, read, sectors_read, write, sectors_written = tokens
    timestamp = int(timestamp_str)
    timestamps.append(timestamp)
    reads.append(int(read))
    writes.append(int(write))


f = open('data.js', 'w')
f.write('data = ' + json.dumps({
    'timestamps': timestamps,
    'reads': reads,
    'writes': writes,
}))
