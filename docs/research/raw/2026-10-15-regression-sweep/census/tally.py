import csv, re, sys
from collections import Counter
c = Counter()
for f in sys.argv[1:]:
    for row in csv.DictReader(open(f), delimiter='\t'):
        v = row['test-added']
        if 'apps/www/tests/browser' in v:
            m = re.search(r'\b(both|unit|browser|none)\b', v)
            c[m.group(1) if m else '?'] += 1
print(dict(c), sum(c.values()))
