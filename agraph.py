#!/usr/bin/env python

from subprocess import Popen
from subprocess import PIPE
import json


log_file = Popen(['atop', '-PDSK', '-r', '/var/log/atop.log.1'], stdout=PIPE).stdout


data = []
skip_first = True

for line in log_file:
    line = line.strip()
    if line in ('SEP', 'RESET'):
        continue
    # First readings are ridiculously high
    if skip_first:
        skip_first = False
        continue
    tokens = line.split(' ')
    label, host, timestamp, _, _, interval, device, milliseconds, read, sectors_read, write, sectors_written = tokens
    data.append((int(timestamp), int(read), int(write)))

f = open('data.js', 'w')
f.write('data = ' + json.dumps(data))
