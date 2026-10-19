# Per AI cell, candidate arm, measured pair streams: style recalculation
# (UpdateLayoutTree), Layout and Paint ms per preview commit from the trace;
# full-preview recalcs per stream (recalcs covering at least half of the final
# preview's elements, counted from the final HTML dump); React time (c) and
# busy from the receipt. Medians over the measured streams, with the range.
# Usage: python3 ai-style-compare.py <label> <matrix-dir> <trace-dir> <text-dir> [out.json]
import json, os, re, sys, glob, statistics as st, datetime

label, matrix_dir, trace_dir, text_dir = sys.argv[1:5]
out = sys.argv[5] if len(sys.argv) > 5 else None
ms = lambda s: datetime.datetime.fromisoformat(s.replace('Z', '+00:00')).timestamp() * 1000
cells = sorted([json.load(open(f)) for f in glob.glob(matrix_dir + '/*.json') if 'budget' not in f], key=lambda c: c['startedAt'])

def files_in(d, prefix, ext, lo, hi):
    fs = [f for f in glob.glob(f'{d}/{prefix}*{ext}')]
    fs = [(int(os.path.basename(f)[len(prefix):].split('.')[0]), f) for f in fs]
    return [f for t, f in sorted(fs) if lo <= t < hi]

def trace_stats(f, preview_elements):
    ev = json.load(open(f))
    start = [e for e in ev if e.get('name') == 's5-start'][0]
    main = [e for e in ev if e.get('pid') == start['pid'] and e.get('tid') == start['tid']]
    marks = sorted(e['ts'] for e in main if e.get('name') == 's5-batch')
    end = marks[-1]
    sums = {'UpdateLayoutTree': 0.0, 'Layout': 0.0, 'Paint': 0.0}
    full = 0; full_ms = 0.0; biggest = 0
    for e in main:
        if e.get('ph') != 'X' or e.get('name') not in sums or not (start['ts'] <= e['ts'] <= end):
            continue
        d = e.get('dur', 0) / 1000
        sums[e['name']] += d
        if e['name'] == 'UpdateLayoutTree':
            n = e.get('args', {}).get('elementCount', 0)
            biggest = max(biggest, n)
            if n >= 0.5 * preview_elements:
                full += 1; full_ms += d
    commits = len(marks) - 1
    return {k: v / commits for k, v in sums.items()}, full, full_ms, biggest, commits

rows = []
for i, cell in enumerate(cells):
    if not cell['composition'].startswith('ai'):
        continue
    lo = ms(cell['startedAt']); hi = ms(cells[i + 1]['startedAt']) if i + 1 < len(cells) else 1e20
    receipts = [s for s in cell['streams'] if s['arm'] == 'candidate']
    traces = files_in(trace_dir, f"{cell['composition']}-candidate-", '.json', lo, hi)
    texts = files_in(text_dir, f"{cell['composition']}-candidate-", '.html', lo, hi)
    assert len(traces) == len(receipts), (cell['cell'], len(traces), len(receipts))
    streams = []
    for s, tf, hf in zip(receipts, traces, texts):
        if not s['role'].startswith('pair-'):
            continue
        html = open(hf).read()
        elements = len(re.findall(r'<[a-zA-Z]', html)) + 1
        per, full, full_ms, biggest, commits = trace_stats(tf, elements)
        streams.append({'role': s['role'], 'load1': round(s['loadavg'][0], 1), 'commits': commits, 'previewElements': elements,
                        'ult': round(per['UpdateLayoutTree'], 2), 'layout': round(per['Layout'], 2), 'paint': round(per['Paint'], 2),
                        'fullRecalcs': full, 'fullRecalcMs': round(full_ms, 1), 'largestRecalc': biggest,
                        'c': round(s['profile']['stream']['react'], 1), 'busy': round(s['trace']['totalMs'], 1),
                        'errors': len(s['errors'])})
    med = lambda k: round(st.median([x[k] for x in streams]), 2)
    rng = lambda k: [min(x[k] for x in streams), max(x[k] for x in streams)]
    row = {'label': label, 'cell': cell['cell'], 'streams': streams,
           'median': {k: med(k) for k in ['ult', 'layout', 'paint', 'fullRecalcs', 'fullRecalcMs', 'c', 'busy', 'commits', 'previewElements']},
           'range': {k: rng(k) for k in ['ult', 'fullRecalcs', 'c', 'busy']}}
    rows.append(row)
    m = row['median']
    print(f"{label} {cell['cell']}: per commit ULT {m['ult']} (range {row['range']['ult']}) Layout {m['layout']} Paint {m['paint']} | full-preview recalcs {m['fullRecalcs']} per stream ({m['fullRecalcMs']} ms; range {row['range']['fullRecalcs']}) | c {m['c']} busy {m['busy']} | streams {len(streams)} preview elements {m['previewElements']}")
if out:
    json.dump(rows, open(out, 'w'), indent=1)
