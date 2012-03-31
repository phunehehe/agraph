#!/usr/bin/env python

from subprocess import Popen
from subprocess import PIPE
from datetime import datetime
import json


# TODO: Provide a way to select log file
log_file = Popen(['atop', '-PCPU,MEM,DSK', '-r', '/var/log/atop.log.1'], stdout=PIPE).stdout
disk_data = {}
memory_data = []


def consume_disk_tokens(tokens):
    _, _, timestamp, _, _, _, device, milliseconds, reads, sectors_read, writes, sectors_written = tokens
    if device not in disk_data:
        disk_data[device] = []
    disk_data[device].append((
        int(timestamp),
        int(milliseconds),
        int(reads),
        int(sectors_read),
        int(writes),
        int(sectors_written),
    ))


def consume_memory_tokens(tokens):
    _, _, timestamp, _, _, _, page_size, total_pages, free_pages, cache_pages, buffer_pages, slab_pages, dirty_pages = tokens
    total_pages = int(total_pages)
    free_pages = int(free_pages)
    cache_pages = int(cache_pages)
    buffer_pages = int(buffer_pages)
    slab_pages = int(slab_pages)
    used_pages = total_pages - free_pages - cache_pages - buffer_pages - slab_pages
    memory_data.append((
        int(timestamp),
        used_pages,
        cache_pages,
        buffer_pages,
        slab_pages,
        free_pages,
    ))


for line in log_file:
    line = line.strip()
    if line in ('SEP', 'RESET'):
        continue

    tokens = line.split(' ')
    label = tokens[0]
    if label == 'DSK':
        consume_disk_tokens(tokens)
    elif label == 'MEM':
        consume_memory_tokens(tokens)


f = open('html/data/disk.js', 'w')
f.write(json.dumps(disk_data))

f = open('html/data/memory.js', 'w')
f.write(json.dumps(memory_data))
