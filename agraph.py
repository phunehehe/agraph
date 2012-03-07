#!/usr/bin/env python

from subprocess import Popen
from subprocess import PIPE
from datetime import datetime


for line in Popen(['atop', '-PDSK', '-r', '/var/log/atop.log.1'], stdout=PIPE).stdout:
    line = line.strip()
    if line in ('SEP', 'RESET'):
        continue
    tokens = line.split(' ')
    print tokens
    label, host, timestamp_str, _, _, interval, device, milliseconds, read, sectors_read, write, sectors_written = tokens
    timestamp = datetime.fromtimestamp(int(timestamp_str))
