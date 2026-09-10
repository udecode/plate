import hashlib
import json
import pathlib
import statistics
import subprocess
import time

ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).resolve().parent
TARGET = 'tooling/scripts/test-suite-routing.test.mjs'
COMMANDS = {
    'node': ['node', '--test', TARGET],
    'bun': ['bun', 'test', './' + TARGET],
    'runner': ['bun', 'tooling/scripts/test-fast.mjs', TARGET],
}
samples = []
for cycle in range(6):
    order = ['node', 'bun', 'runner'] if cycle % 2 == 0 else ['runner', 'bun', 'node']
    for lane in order:
        start = time.perf_counter()
        result = subprocess.run(COMMANDS[lane], cwd=ROOT, capture_output=True, text=True, timeout=60)
        elapsed = (time.perf_counter() - start) * 1000
        sample = {'cycle': cycle, 'warmup': cycle == 0, 'lane': lane,
                  'ms': elapsed, 'exit': result.returncode,
                  'stdout': result.stdout, 'stderr': result.stderr}
        samples.append(sample)
        print(json.dumps({k: v for k, v in sample.items() if k not in ['stdout', 'stderr']}), flush=True)
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
inputs = [TARGET, 'tooling/scripts/test-fast.mjs', 'tooling/config/test-suites.mjs',
          'bunfig.toml', 'tooling/config/bunTestSetup.ts', 'config/plite-source-aliases.ts']
receipt = {'commands': COMMANDS, 'samples': samples,
           'sha256': {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in inputs},
           'versions': {tool: subprocess.check_output([tool, '--version'], text=True).strip() for tool in ['node', 'bun']},
           'medianMs': {lane: statistics.median(s['ms'] for s in samples if s['lane'] == lane and not s['warmup']) for lane in COMMANDS}}
(OUT / 'runner-measurements.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt['medianMs']))
