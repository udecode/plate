# Authored typing regression: locate the owner introduced by 95eeaf92b7

This is a project-owned plan template. Copy it to `docs/plans/<date>-<slug>.md` and fill its `{{…}}` placeholders. The pstack block in `AGENTS.md` governs timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

## Brief

### What did you find?

每次按键都为新状态重建整份内容根边界图，图中逐个编译 1000 条删除建议的片段，约 90ms/键。来源是 95eeaf92b7 引入的 `applyMarkupInput` 与投影视图选区绑定。

### What will change?

修复后打字耗时与删除建议数量无关，大文档回到 `next` 水平（约 20ms/键）；本计划只定位与给出方案，尚未改代码。

### What do you need from me?

确认按“片段编译跨提交缓存 + 边界图按需构建”实施，或改用其他方向。

### What happens if I say go?

按 Durable fix decision 实施，先做片段缓存并复测，再做边界图按需构建；每步跑基准与正确性用例。不提交。

### What could go wrong?

缓存失效条件写错会显示过期删除线；以 `authored-fragment-provider` 与 Chromium 套件守护，并用基准确认收益。

## Benchmark Source

- request: 所有者要求定位导致打字与挂载变慢的代码并给出优化方案（Open work 15，`docs/plans/2026-10-07-suggestion-final-behavior.md`）
- scope: Plite authored changes 在删除线较多时的按键与挂载路径
- invocation: $benchmark authored typing regression
- candidate-identity: fingerprint: 6efd9bf87c 加工作区改动（76 个文件，计划 2026-10-07-suggestion-final-behavior）
- plate-main-identity: commit: da4898bb61（next）（本次对照基线；main 不含本功能）
- plite-identity: fingerprint: 同候选，packages/plitejs 源码
- slate-identity: N/A: 回退位于 authored 层，Slate 无对应实现
- named-symptom: plite-authored-typing-benchmark large cohort（1000 段、1000 删除建议）keydown→domReady p50 next 20ms、当前约 120ms；normal 10ms 对 21ms；mounted views-1 paint p95 33ms 对 50–58ms
- final-artifacts: artifact: scratch-review/perf/profile-*.txt 与 *.cpuprofile

Boundaries:
- allowed runtime/packages/apps: packages/plitejs（只读诊断与可撤回的临时干预）
- allowed benchmark/tests/fixtures: scratch 中的 profile-typing.mjs，不改仓库内基准
- allowed baseline checkouts/hosts: next da4898bb61 的临时 worktree 与 dev server（已删除）
- non-goals: 本计划不落地修复；拖选端点问题（Open work 23）由他人跟进（之后随 `2026-10-07-struck-text-onlyoffice-caret.md` 关闭）

## Interaction Coverage

- first-interaction: N/A: 诊断以稳定状态下的连续按键为对象
- settled-interaction: pass: 30 键 CPU profile，热身 10 键
- route-scope: pass: /examples/plite/authored-changes，1000 段、1000 删除建议、markup 视图
- reporter-profile: N/A: 回退由基准发现，无外部报告者

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | 6efd9bf87c + 工作区 | next da4898bb61 | artifact: 两侧各自 pnpm install --offline |
| lockfile / package manager | 各自 pnpm-lock.yaml，pnpm 离线 | 同左 | artifact: 安装 exit 0 |
| build mode / host / port | plite next dev :3298（名称）与生产导出 :3410（耗时） | plite next dev :3299 | artifact: dev 对 dev 比较 |
| browser / machine / viewport / DPR | 系统 Chrome，同一台 arm64 Mac | 同左 | artifact: 同机同时段 |
| route / fixture / document / plugins | authored-changes 示例，1000 段 Seed.，每段删除 e，markup 视图 | 同左 | artifact: 同一 profile-typing.mjs |
| setup / action / DOM strategy | 热身 10 键后 30 键，每键等两帧 | 同左 | artifact: 同一脚本 |
| warmups / samples / interleave order | 每个变体一次 30 键 profile | 同左 | artifact: 干预前后对照 |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | request 字段 |
| `benchmark` source and methodology read | yes | 本会话已读 SKILL.md、methodology.md 与 perf-issue.md |
| Existing plan reused | yes | 无同主题的进行中计划 |
| Candidate and baseline identities recorded | yes | Comparison Signature |
| Target/runner discovery completed from current source | yes | browser-typing-contract.json 与 authored-performance.spec.ts |
| Host/build/fixture freshness proved | yes | dev server cwd 经 lsof 核对 |
| Correctness oracle identified | yes | packages/plitejs 的 pnpm test:bun 与 pnpm test:react |
| All default lanes inventoried | yes | Lane Table |
| `only` narrowing explicitly authorized or N/A | yes | N/A: 未缩窄 |
| Browser/native proof strategy selected | yes | 系统 Chrome CDP Profiler |
## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Comparison Signature | none |
| 2 | current-vs-main-product-smoke | yes | complete | plite-authored-typing-benchmark 两轮：normal 10.3 对 20.7ms，large 20 对 118–121ms | none |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - 回退在 Plite authored 示例上即复现，Plate 层未参与 | 不适用 | none |
| 4 | owner-microbench-and-trace | yes | red | CPU profile 与两次因果干预，见 Cause History | 实施 Durable fix decision |
| 5 | product-mount-matrix | yes | pending | 挂载基准 views-1 paint p95 33 对 50–58ms，推断同一原因 | 修复后复测 |
| 6 | trusted-editing-matrix | yes | pending | Chromium 套件 23 过 12 失败，与 HEAD 相同 | 修复后复测 |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - Slate 没有 authored 删除线投影 | 不适用 | none |
| 8 | example-breadth | yes | pending | 首页自动化核对行为正确 | 修复后复测 |
| 9 | large-and-stress | yes | pending | large cohort 为当前红线 | 修复后复测 |

## Current Cause Checkpoint

- state: proven
- cause-id: C1-graph-rebuild-per-commit
- lane: owner-microbench-and-trace
- comparable-baseline: next da4898bb61，同一 profile 脚本与 dev 模式
- material-delta: 30 键 4850ms 对 1511ms；输入处理 3371ms 对 364ms
- isolated-owner: createContentRootViewBoundaryGraph → readAuthoredViewFragments → compileAuthoredMarkupFragments，由 reconcilePliteViewSelection 与 applyMarkupInput 在每次提交后触发
- causal-intervention: 纯文本折叠光标走模型路径并跳过绑定重解析后，30 键 1659ms、输入处理 525ms、片段编译 2647ms 降到 7ms
- correctness-guard-result: pass: 未干预的候选上 packages/plitejs pnpm test:bun 3028 与 pnpm test:react 1453 全过；因果干预本身使 React 6 项失败，只作证明并已撤回
- fix-class: internal-implementation
- long-term-target: 每次按键的 authored 工作只与编辑区域相关：片段编译按建议跨提交缓存，内容根边界图按需构建且复用未变块
- decision-owner: benchmark
- layer-plan: N/A: 内部实现，不改公开 API
- compatibility-verdict: N/A: 不改持久化与公开 API
- fix-owner: natamox
- benchmark-command: node scratch-review/perf/profile-typing.mjs <url> 1000；pnpm 运行 plite-authored-typing-benchmark.ts large
- benchmark-rerun: node scratch-review/perf/profile-typing.mjs <url> 1000；pnpm 运行 plite-authored-typing-benchmark.ts large
- benchmark-rerun-result: pending
- correctness-command: pnpm --filter plitejs test:bun 与 test:react
- correctness-rerun: pnpm --filter plitejs test:bun 与 test:react
- correctness-rerun-result: pending
- resume-lane: product-mount-matrix

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| P1 | owner-microbench-and-trace | 纯文本插入走模型路径 | 5085ms（无改善） | 未测 | reverted | 发现绑定重解析仍建图 |
| P2 | owner-microbench-and-trace | 跳过折叠纯文本光标的绑定重解析 | 5208ms（成本转移到 applyMarkupInput 建图） | 未测 | reverted | 两者合并 |
| P3 | owner-microbench-and-trace | P1 加 P2 | 1659ms，base 1511ms | fail: React 6 项 | reverted | 按 Durable fix decision 修复 |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| large typing keydown→domReady | 每轮 100 键、交替 2 轮 | next p50 19.9–20.0、p95 24.8–24.9 | 当前 p50 117.5–120.6、p95 144.6–154.4 | 约 +100ms，约 6 倍 | 两轮 base 差 0.1ms | scratch-review/bench/typing-*.json |
| normal typing keydown→domReady | 每轮 300 键、交替 2 轮 | p50 10.3–10.4 | p50 20.7 | +10ms，约 2 倍 | 同上 | 同上 |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | pending | Run the exact metrics, comparisons, and correctness proof named above | pending |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-07-authored-typing-regression-benchmark.md` at cause/resume checkpoints | pending |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pending |
| Exact post-fix benchmark reruns | pending | Rerun every kept fix against its original lane/baseline | pending |
| Correctness/native behavior reruns | pending | Run named tests and Browser/Chrome/device proof required by the claim | pending |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | pending |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | pending |
| Durable fix decision | pending | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | pending |
| Package/type/build proof | pending | Run affected package checks/typecheck/build only where owned | pending |
| Browser surface proof | pending | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | pending |
| Changeset/release artifact | pending | Add only for published package behavior/API changes, otherwise N/A | pending |
| Benchmark plan complete validation | yes | Run validator with `--complete` | pending |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-07-authored-typing-regression-benchmark.md` | pending |

Verification evidence:
- Pending.
