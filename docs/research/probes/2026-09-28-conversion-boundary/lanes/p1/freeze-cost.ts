// Engine cost of freezing and testing wide frozen arrays, the residual
// per-update work of the frozen plain-array document model. Run from the
// repository root: bun docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/freeze-cost.ts [length]
const n = Number(process.argv[2] ?? 1179);
const base = Object.freeze(Array.from({ length: n }, (_, i) => Object.freeze({ type: 'p', children: Object.freeze([Object.freeze({ text: 'x' + i })]) })));
const time = (label: string, fn: () => void, iters = 2000) => {
  for (let i = 0; i < 200; i++) fn();
  const s = performance.now();
  for (let i = 0; i < iters; i++) fn();
  console.log(label.padEnd(40), (((performance.now() - s) / iters) * 1000).toFixed(2), 'µs');
};
let sink: any;
time('copy [...arr]', () => { sink = [...base]; });
time('copy + set one', () => { const a = [...base]; a[n - 1] = base[0]; sink = a; });
time('copy + freeze', () => { const a = [...base]; a[n - 1] = base[0]; sink = Object.freeze(a); });
time('slice + freeze', () => { const a = base.slice(); a[n - 1] = base[0]; sink = Object.freeze(a); });
const frozen = Object.freeze([...base]);
time('isFrozen(frozen array)', () => { sink = Object.isFrozen(frozen); });
const unfrozen = [...base];
time('isFrozen(unfrozen array)', () => { sink = Object.isFrozen(unfrozen); });
time('freeze(already frozen)', () => { sink = Object.freeze(frozen); });
time('read frozen[i] loop', () => { let s = 0; for (let i = 0; i < n; i++) s += frozen[i] ? 1 : 0; sink = s; });
time('read unfrozen[i] loop', () => { let s = 0; for (let i = 0; i < n; i++) s += unfrozen[i] ? 1 : 0; sink = s; });
time('offsets loop', () => { const o = new Array(n); let p = 0; for (let i = 0; i < n; i++) { o[i] = p; p += 5; } sink = o; });
