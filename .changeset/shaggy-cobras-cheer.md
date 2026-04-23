---
"@platejs/core": patch
---

Improve large-document mount and render performance across core element, mark, and `nodeId` paths

- Cut `10k` mixed-document core mount time from `1240.60 ms` to `468.26 ms` without `nodeId` (`62.3%`, `2.65x` faster)
- Cut `10k` mixed-document core mount time from `1290.66 ms` to `477.73 ms` with `nodeId` (`63.0%`, `2.70x` faster)
- Cut mixed-document `nodeId` overhead over core from `+50.06 ms` to `+9.46 ms` (`81.1%` smaller)
- Cut duplicate-id paste cost from `20.06 ms` to `13.79 ms` (`31.2%`, `1.45x` faster)
- Cut `10k` code-only mount time from `1500.30 ms` to `496.47 ms` (`66.9%`, `3.02x` faster) and shrink the code-only tax over core from `+280.75 ms` to `+27.89 ms` (`90.1%` smaller)
- Bring the current `10k` core and basic large-document mount lanes to Slate parity or better (`core -3.5%`, `core + nodeId -1.6%`, `basic -1.2%`)
