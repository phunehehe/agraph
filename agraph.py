#!/usr/bin/env python

from subprocess import Popen
from subprocess import PIPE
from datetime import datetime
import json


# TODO: Provide a way to select log file
log_file = Popen(['atop', '-PDSK', '-r', '/var/log/atop.log.1'], stdout=PIPE).stdout


data = {}

for line in log_file:
    line = line.strip()
    if line in ('SEP', 'RESET'):
        continue

    tokens = line.split(' ')
    label, host, timestamp, _, _, interval, device, milliseconds, reads, sectors_read, writes, sectors_written = tokens

    if device not in data:
        data[device] = []
    data[device].append((
        int(timestamp),
        int(milliseconds),
        int(reads),
        int(sectors_read),
        int(writes),
        int(sectors_written),
    ))


f = open('html/data/data.js', 'w')
f.write('data = ' + json.dumps(data))
