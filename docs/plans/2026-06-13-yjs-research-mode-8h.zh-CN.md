# 2026-06-13 `@slate/yjs` 研究模式 8h 中文交接

这份文档是 `docs/plans/2026-06-13-yjs-research-mode-8h.md` 的中文交接版。原文件保留英文结构，因为它被 `autogoal` 检查器读取；这份文件给人看。

## 结论

本轮已经关闭。目标检查通过，活动 goal 已标记完成。

- 运行范围：`/Users/felixfeng/Desktop/repos/plite/packages/plite-yjs`
- 控制仓库：`/Users/felixfeng/Desktop/repos/plate-copy`
- 模式：`@slate/yjs` research mode，原定 8h
- 实际关闭：约 60 分钟后提前关闭
- 停止原因：已经没有安全、低风险、值得继续的小修点；剩下的是架构级工作
- Packet：P0-P30，共 31 个
- Goal 用量：`931,282` tokens，`3,918s`

## 保留的改动

### Benchmark / 指标

- 在 `benchmarks/targets/plite.json` 增加 `yjs-collaboration` 目标。
- 修复 `scripts/benchmarks/core/current/yjs-collaboration.mjs` 的计时边界：setup 不再算进 work 计时。
- 修复 benchmark verification：避免多余 `map` 和 peer 0 自比对。
- benchmark sync 改为按 target state vector 生成增量 update，而不是 full-state 广播。
- 单来源编辑场景只从实际编辑的 peer 广播，不再让所有 peer 都当 source。

### Runtime

- `packages/plite-yjs/src/core/document.ts`
  - 合并 text readback 的 delta 遍历。
  - 空 text 节点直接走 fast path，不再调用 `toDelta()`。
  - hidden-child text match 先比长度，避免不必要 flatten。
  - clone 空 text 节点时保留属性，但跳过空 delta materialization。
- `packages/plite-yjs/src/core/split-history.ts`
  - append / trailing / prefix helper 对空 text 直接返回。

### Tests / oracles / demo

- `packages/plite-yjs/test/support/collaboration.ts`
  - 测试 helper 改为 target-vector sync。
- `packages/plite-yjs/test/attributes-contract.spec.ts`
  - 增加空 Yjs text node 属性回读 oracle。
  - 增加 null-valued text attribute 回读 oracle。
- `site/examples/ts/yjs-collaboration.tsx`
  - demo sync 改为 target-vector update。

## 验证结果

- `bun test ./packages/plite-yjs/test`
  - 最终结果：`215/0`
- `bun --filter ./packages/plite-yjs typecheck`
  - exit `0`
- `bun run bench:core:yjs-collaboration:local`
  - `yjs_correctness_failures=0`
  - baseline worst p95：`158.75ms`
  - latest / best worst p95：`55.76ms`
  - latest / best work p95：`45.34ms`
- local collaboration soak
  - `28` actions
  - `4` iterations
  - `0` issues
- Hocuspocus production smoke
  - `45` actions
  - `3` hard reloads
  - `3` browser offline windows
  - `0` console/page errors
  - `0` issues
- autoreview
  - clean
  - no accepted/actionable findings
  - patch correct confidence：`0.86`
- autogoal checker
  - `[autogoal] complete: docs/plans/2026-06-13-yjs-research-mode-8h.md`

## 没有继续做的事

这几项不是小补丁，硬上会把干净循环搞成架构事故。

| 项目 | 当前事实 | 处理 |
| --- | --- | --- |
| incremental remote import | receiving peer 仍然通过 `readSlateValueFromYjs` + `editor-adapter.replaceValue` 重建完整 Plite value | defer 到架构 packet |
| adjacent compatible Yjs text canonical read | live probe 显示相邻 `Y.XmlText("alpha")` + `Y.XmlText("beta")` 仍导入成两个 Plite leaves | defer 到 raw path / canonical read 双视图设计 |
| native selection / raw mobile / full browser sweep | 本轮只声明 package + scoped browser smoke | 不扩大 claim |
| P5 readback cleanup 性能收益 | 代码少做重复 delta 遍历，但 p95 样本不稳定 | 只当 simplification，不当 perf win |

## 需要注意

1. `large-doc sync` 仍然是最值得做的性能/架构 owner。
2. 相邻 compatible Yjs text 的 canonical read 不能只在 read path 粗暴 merge；operation path 和 selection path 会被影响。
3. 本轮 browser proof 是短 smoke，不是 release gate。
4. `autoreview` 需要 `/tmp/codex-fast-wrapper` 才能绕过本地 service-tier 配置问题；这不是仓库改动。
5. 没有做 commit、push、PR、release、publish。

## 复现命令

```bash
cd /Users/felixfeng/Desktop/repos/plite
bun test ./packages/plite-yjs/test
bun --filter ./packages/plite-yjs typecheck
bun run bench:core:yjs-collaboration:local
SOAK_MS=12000 SOAK_FAIL_ON_ISSUES=1 SOAK_ACTION_DELAY_MS=250 SOAK_REPORT_EVERY_MS=5000 SOAK_HEADLESS=1 bun ./scripts/proof/yjs-collaboration-soak.mjs
PRODUCTION_SOAK_MS=15000 PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_ACTION_DELAY_MS=150 PRODUCTION_SOAK_JITTER_MS=0 SOAK_HEADLESS=1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs
```

```bash
cd /Users/felixfeng/Desktop/repos/plate-copy
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-13-yjs-research-mode-8h.md
```

## 下一步

优先做一个架构 packet：`incremental remote import`。它直接对应 benchmark 里剩下的 hot lane，比继续抠微型 fast path 更值。
