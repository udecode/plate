# dev/table-perf 性能快照

## 环境

- 测试时间：2026-03-10 23:36:30 CST
- 页面地址：`http://localhost:3002/dev/table-perf`
- 应用：`apps/www`，Next.js 16.1.6（Turbopack dev）
- 浏览器：`agent-browser` + Chromium 138.0.7204.15
- 机器：macOS 15.7.3
- 页面错误：`agent-browser errors` 未发现报错

## 采样方法

- 阅读 `apps/www/src/app/dev/table-perf/page.tsx`，确认页面内置了两套测试：
  - benchmark：`5` 次 warmup + `20` 次 measured remount
  - input latency：`10` 次 warmup + `50` 次 measured inserts
- 使用 `agent-browser` 打开 `/dev/table-perf`
- 读取页面 Metrics 面板和 console 输出
- 本次记录两组数据：
  - 默认 `10 x 10`（100 cells）
  - 压力 `60 x 60`（3600 cells）

## 结果

| 配置 | Cells | Initial render | Benchmark mean | Benchmark median | Benchmark p95 | Input mean | Input median | Input p95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 x 10 | 100 | 209.30 ms | 99.32 ms | 83.80 ms | 147.50 ms | 28.07 ms | 28.40 ms | 30.50 ms |
| 60 x 60 | 3600 | 2663.30 ms | 2499.24 ms | 2453.30 ms | 2848.70 ms | 390.48 ms | 379.40 ms | 443.70 ms |

## 对比

- `60 x 60` 相比 `10 x 10`
- Initial render：`12.72x`
- Benchmark mean：`25.16x`
- Input mean：`13.91x`

## 结论

- `10 x 10` 基线可接受。input latency 均值约 `28 ms`，交互感觉应当是顺的。
- `60 x 60` 仍可跑完，但已经明显进入高延迟区间：
  - 初始挂载约 `2.66 s`
  - benchmark 均值约 `2.50 s`
  - 单次输入延迟均值约 `390 ms`
- 以当前页面表现看，大表场景下主要问题不是偶发尖峰，而是整体延迟已经稳定抬高到肉眼可感知的程度。

## 解读注意点

- 切换 preset 后点击 `Generate Table`，页面会刷新当前表格和基础 metrics。
- `Benchmark Results` 会被清空后重新计算。
- `Input Latency` 结果不会在 `Generate Table` 时自动清空；如果切到新 preset，必须重新跑一次 input latency 才能读到当前配置的数据。
