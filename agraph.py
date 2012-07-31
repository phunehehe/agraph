#!/usr/bin/env python

from subprocess import Popen
from subprocess import PIPE
from datetime import datetime
import json


# TODO: Provide a way to select log file
log_file = Popen(['atop', '-Pcpu,MEM,DSK', '-r', '/var/log/atop.log.1'], stdout=PIPE).stdout
disk_data = {}
memory_data = []
cpu_data = {}


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
    length = len(tokens)
    if length == 13:
        _, _, timestamp, _, _, _, page_size, total_pages, free_pages, cache_pages, buffer_pages, slab_pages, dirty_pages = tokens
    elif length == 12:
        _, _, timestamp, _, _, _, page_size, total_pages, free_pages, cache_pages, buffer_pages, slab_pages = tokens
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


def consume_cpu_tokens(tokens):
    length = len(tokens)
    if length == 18:
        _, _, timestamp, _, _, _, tps, cpu_id, sys, user, niced, idle, wait, irq, softirq, steal, guest, _, _ = tokens
    elif length == 16:
        guest = 0
        _, _, timestamp, _, _, _, tps, cpu_id, sys, user, niced, idle, wait, irq, softirq, steal = tokens
    if cpu_id not in cpu_data:
        cpu_data[cpu_id] = []
    cpu_data[cpu_id].append((
        int(timestamp),
        int(sys),
        int(user),
        int(niced),
        int(idle),
        int(wait),
        int(irq),
        int(softirq),
        int(steal),
        int(guest),
    ))


for line in log_file:
    line = line.strip()
    if line in ('SEP', 'RESET'):
        continue
    tokens = line.split(' ')

    label = tokens[0]
    {
        'DSK': consume_disk_tokens,
        'MEM': consume_memory_tokens,
        'cpu': consume_cpu_tokens,
    }[label](tokens)


f = open('html/data/disk.js', 'w')
f.write(json.dumps(disk_data))

f = open('html/data/memory.js', 'w')
f.write(json.dumps(memory_data))

f = open('html/data/cpu.js', 'w')
f.write(json.dumps(cpu_data))
