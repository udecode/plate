# S4 consumer correctness and S5 consumer adoption

**Both consumers meet the S4 laws, now through the S5 continued parse.**
- **AI flow:** the transport receipt keeps 55 of 55 earlier preview blocks as the same objects, and the benchmark keeps 95–99%. Cumulative preview work falls 8–29×.
- **Joiner:** deleted; its measured matrix doesn't regress.
- **Browser:** after lane-authored's fix landed, the Chromium lifetime spec passes 14/14 on a fresh dev server, editable Columns included.

## Changes

**AI** (`packages/platejs/src/ai/react/AIChatPlugin.ts`)
- **Cancel (S4).** `hide`, `reset`, `show` (through `resetOptions`) and `reload` call a private `cancel()`. It clears `_requestId` and `streaming` before stopping the adapter, so the adapter's final flush fails its request check. `api.stop()` still publishes the current response as the final draft.
- **Invalid edit response (S4).** When an edit response fails the strict parse, `setPreview` rejects the current suggestion and returns `false`. It used to throw, which left `streaming` true and kept `stop()` from aborting the request.
- **Hint (S5).** A partial `setPreview` passes `previous` and keeps only the latest result. It is dropped by a final parse, `invalidatePreview`, `resetOptions`, `submit`, `reload` and plugin cleanup.
- **Store identity (S5).** The plugin store copies every value it receives, so the parser's identity never reached readers. `setPreview` now passes back the store's earlier copy of each block the parser reused. The store keeps copies it already owns, so reused blocks keep their identity and only new blocks are copied.
  - Without the handback, the transport receipt reads 0 of 55 even with the reuse-key fix. With it, 55 of 55.
- JSDoc on `accept`, `reload`, `reset`, `setPreview` and `stop`.

**Registry AI preview** (`ai-menu.tsx`, `AIChatEditor`)
- Publishes from the first block that differs (`!==`) from the last published array, using `tx.nodes.replaceChildren(tail, { at: [], index: start })` inside `update({ history: 'skip' })`. That is one change, equivalent to remove-then-insert.
- When no leading block is shared (`start === 0`), it replaces the value instead. At CJK 50 KB a full `replaceChildren` took 657–678 ms, against 398–417 ms for `value.replace`.
- It compares against the last published array because the editor keeps its own copies of nodes.

**Demo** (`apps/www/src/registry/examples/markdown-streaming-demo.tsx`)
- No AIChat code. Previews call `parseSlice(draft, { lossPolicy: 'allow', partial: true, previous })`; Finish and Stop call a strict `parseSlice(draft)`.
- One stream record owns the AbortController, the draft, the hint and the 32 ms timer. The first chunk publishes at once; later chunks publish the latest draft on that timer.
- Reset, scenario, chunk size, source edit, preview switch, navigation and unmount all cancel: they abort, clear the timer and the hint, and skip the final parse.
- The static preview publishes the same way as `AIChatEditor`.
- The editable preview keeps `update({ history: 'skip' }).value.replace({ children })`. Its EditorKit editor is authored, so an ordinary node write needs an author ID and is recorded as an authored change; 10 small splices grew `meta` to 24 KB. A preview is a document load.
- An ad hoc happy-dom run (not kept) reused 91 of at most 92 earlier blocks in both previews.
- Controls: scenario presets, editable Markdown source, chunk size (recorded tokens or words, or 16, 64 or 256 characters), live delay (10–200 ms), play/pause/resume, Stop, previous/next, click-to-chunk and reset. It streams raw chunks with no joiner.

**Joiner (deleted)**
- `lib/markdown-joiner-transform.ts`.
- Its import and `experimental_transform` in `app/api/ai/command/route.ts`.
- The `registry-lib.ts` item.
- `@plate/markdown-joiner-transform` from `ai-api` (`registry-components.ts`).
- `@plate/markdown-joiner-transform` and `@plate/ai` from `markdown-streaming-demo` (`registry-examples.ts`).
- You removed the docs references in `ai.mdx` and `ai.cn.mdx`.

**Tests**
- `useAIChat.spec.tsx`: cadence, cancel paths and strict failures.
- `AIChatPlugin.streaming.spec.ts`: deleted target, and identity through the store.
- New `ai-menu.spec.tsx`: tail publication.
- New `markdown-streaming-demo.spec.tsx`: fake timers.
- `tests/browser/markdown-streaming-lifetime.spec.ts`: new controls, strict Stop and finish status.
- `ai.lifecycle-test-support.tsx`: sets `globalThis.React` for Bun's classic JSX, and adds `CalloutPlugin` for the registered-tags case.

**Release notes**
- `.changeset/platejs-ai-stream-lifecycle.md` (`platejs` patch).
- Registry entries `2026-09-28-markdown-streaming-demo-lifecycle.mdx` (demo and ai-menu rows) and `2026-09-29-markdown-joiner-removal.mdx` (remove, with a migration note). Both wait for `--write`.

## Laws and evidence

| Law | AI | Demo |
|---|---|---|
| First chunk at once, then the latest draft every 32 ms | Already held (`queueInsert`). Spec: `['A']`, then `['A','ABC']`, then one final. | Spec: 1 commit at start, none through 40 ms, one at 42 ms, one strict final. |
| Finish and Stop: one strict parse of the current draft | Held. The edit-mode throw is fixed. | Finish and Stop each add exactly one commit. Stop shows the literal `<column` that the partial preview hid. |
| Cancel, close, replacement and unmount: abort and fence, with no final flush | Fixed. Before: closing in insert mode published a strict `AB`; edit-mode `hide` left an orphaned suggestion and a history entry; `reload` added two history entries. | Each of the 7 cancel paths, plus unmount, adds exactly one replacement commit and nothing after it. |
| Accept: only the strict valid result, in one history batch; a deleted target refuses | Held. Specs cover partial and invalid drafts, edit-mode deletion, the insert-mode deleted target (new) and one undo entry. | Not applicable: previews are ephemeral. |
| Hint: keep only the latest; drop it on finish, cancel, replace or unmount | Implemented. A spec shows a reused block keeping its identity through the store, and the strict final starting over. | The hint lives on the stream record and is dropped with it. |
| Every preview equals a fresh partial parse of its prefix | Every AI-flow preview is identical to the pre-S5 plugin's fresh partial parse, across 4 fixtures and 10 pairs. | Static spec: the paused preview equals a fresh partial parse, and the final equals a strict parse. |

**Mutation checks**
- Against `HEAD`'s plugin, 7 of the 13 `useAIChat` specs fail.
- The demo spec fails when cancel flushes (9 of 11), when coalescing is removed, when finalization uses the partial parse, and when the static splice range is wrong.
- The `ai-menu` spec fails on a wrong range.
- The identity spec fails without the hint and without the handback.

## AI flow identity and timing

Harness: `lanes/s4/ai-flow-benchmark.test.ts`, output `ai-flow-benchmark.json`, console output `ai-flow-benchmark.txt`.

- **Input and cadence:** 64-character chunks every 10 ms. The first chunk is published immediately, then the latest arrived prefix every 32 ms, then one strict final.
- **Publication path:** each draft goes through `AIChatPlugin.setPreview` (parse plus store publication), then into a BaseEditorKit preview editor the same way `AIChatEditor` publishes it.
- **Baseline:** `AIChatPlugin` at `a7750ad388`, publishing with `value.replace`.
- **Runs:** one warmup per arm, then alternating pairs: three at 10 KB, two at 50 KB.
- **Correctness:** every preview and every final value is identical between the two arms (asserted).
- **Host:** Apple M5 Max, Bun 1.3.12, load average about 3.

Baseline → candidate:

| Fixture | Previews | Blocks kept | Work | setPreview p95 | Preview publish p95 | Strict final |
|---|---|---|---|---|---|---|
| Rich 10 KB | 49 | 5,486 / 5,749 | 1,408–1,612 → 196–213 ms | 11.7–18.8 → 1.3–1.5 ms | 36.9–49.8 → 2.3–2.8 ms | 52–64 → 48–59 ms |
| Rich 50 KB | 245 | 143,469 / 144,784 | 37.5–39.0 → 1.33–1.45 s | 74–82 → 3.0–3.2 ms | 230–240 → 4.7–5.5 ms | 276–349 → 295–319 ms |
| CJK 10 KB | 49 | 6,946 / 7,264 | 2.77–2.88 → 0.32–0.33 s | 22.9–36.7 → 1.6–1.7 ms | 82–93 → 4.2–4.8 ms | 99–123 → 102–128 ms |
| CJK 50 KB | 245 | 180,517 / 182,116 | 70.8–75.3 → 2.40–2.53 s | 111–130 → 3.6–4.3 ms | 460–480 → 12.3–14.3 ms | 661–680 → 619–674 ms |

- **Strict final:** both arms run the same full parse and the same value replacement, so the spread is run noise.
- **The `start === 0` rule:** before it, the candidate's final publication at CJK 50 KB took 657–678 ms against 398–417 ms.
- **Where identity starts:** the second partial preview. A full parse records no segments for the next parse to reuse.
- **Transport receipt** (`ai-reuse.test.tsx` → `ai-reuse.json`): 12 previews through the real `useAIChat` transport keep 55 of 55 earlier blocks. That needs both the reuse-key fix and the store-copy handback; without the handback it is 0 of 55.

## Joiner deletion

Harness: `lanes/s4/joiner-benchmark.test.ts`, which carries its own copy of the deleted joiner so it still reproduces. Output `joiner-benchmark.json` (run 4, current consumer); console output `joiner-benchmark-run1.txt`, `-run3.txt` and `-run4.txt`.

- **Arms:** both get the same raw schedule. `joiner` passes it through the joiner with its transform delays; `raw` passes it through unchanged.
- **Consumer:** the S5 path above.
- **Timing:** virtual time for one client thread, advanced by measured parse and publish CPU.
- **Correctness:** final values are identical in every pair.

Run 4, joiner → raw:

| Fixture | Work | Previews | Duration | Arrival-to-publish p95 | Literal-syntax previews |
|---|---|---|---|---|---|
| Rich 10 KB | 229–258 → 169–194 ms | 99 → 39 | 9.9 → 1.6 s | 7,964 → 36–37 ms | 0 → 7 |
| Rich 50 KB | 1,431–1,462 → 889–929 ms | 568 → 195 | 57.0 → 8.1 s | 46.7 s → 36 ms | 0 → 32 |
| CJK 10 KB | 382–391 → 260–295 ms | 118 → 39 | 11.7 → 1.7 s | 9.6 s → 37 ms | 7 → 8 |
| CJK 50 KB | 2,334–2,376 → 1,615–1,629 ms | 680 → 195 | 68.4 → 8.3 s | 56.8 s → 41 ms | 43 → 38–44 |

- **Other runs:** runs 1 and 3 move in the same direction in every cell. Run 2 ran at load 8; work kept its direction in 8 of 10 pairs, and the other two (CJK 10 KB) were +1.7% and +2.4%.
- **Strict final:** the same operation in both arms. Runs 1 and 3 stay within max(10%, 5 ms). Run 4's CJK 10 KB medians differ by 29 ms; that is heap-state noise, since the only thing that differs between the arms before the final is the garbage left behind.
- **Per-preview cost** is higher without the joiner, because each preview covers about three chunks. Cumulative work still falls 24–39%.
- **Trade-off:** rich text shows literal inline syntax such as `**ord` in 7–32 previews, each until the next publish at most 32 ms later. The fix for that is `partial` hiding a trailing unclosed inline delimiter, not buffering.
- **Decision: deleted.** Latency, duration and cumulative work improve in every fixture, and the strict final doesn't depend on the transport.

## Commands and results

| Command | Result |
|---|---|
| `pnpm --filter platejs test:partition:ai-react` | 96 pass |
| `bun --config=bunfig.toml test` on the AI `.slow` suites | 27 pass, 3 pre-existing failures (below) |
| `bun tooling/scripts/test-suite.mjs fast` on the AI lifecycle, use-chat, keyboard, ai-menu, ai-chat-demo, demo and registry specs | 76 pass |
| `bun tooling/scripts/test-suite.mjs slow` on `ai-menu`, `streamInsertChunk` and `streamHistory` | 22 pass |
| `pnpm --filter platejs typecheck:partition:ai-react` | clean |
| `tsc --noEmit` on both www tsconfigs | clean except the formats lane's `markdownSafety.ts` |
| `npx oxfmt` and `npx oxlint` on every touched file | clean |
| changelog generator dry run | both entries, no errors |
| lane-authored repro `lanes/authored/editorkit-replace.repro.test.ts` | 5/5 on the current tree |

## Browser (Chromium)

A fresh dev server of mine on port 3417 (`PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1`), started after lane-authored's fix landed and without `build:registry`; the generated index imports the demo source path. The server is stopped now.

- **`tests/browser/markdown-streaming-lifetime.spec.ts`: 14/14**, with no "Document replacement" errors. This covers editable and static columns, strict Stop, and reset, paused reset, scenario, navigate and mode cancellation.
- **`tests/browser/ai-session.spec.ts`: 18/19 on the previous server.** The failure, `AI edit review renders text, accepts it, and preserves undo on a narrow view`, fails the same way with `HEAD`'s plugin.

## Pre-existing, not S4

- **`AIChatPlugin.submit.slow.ts`:** three backward-selection cases compare `editor.read.value()` after undo. `children` match; `meta.authored` differs.
- **Browser "AI edit review":** the granular diff renders `'d preview text.'` non-contiguously in the markup view.
- **www AI lifecycle specs:** 21/23 failed with "React is not defined" since `a6177b8a85` removed `ai.tsx`'s React import. The test-support global fixes that.

## Open gaps and handoffs

1. **Registry (yours):** `build:registry` and changelog `--write`. Until then `apps/www/scripts/check-registry-source.mts` fails with ENOENT on the deleted joiner, because `__registry__/registry-metadata.json` is stale. `templates/**` still contains the joiner and is regenerated by CI.
2. **Not run:** Firefox, WebKit, a production build, and the Chromium consumer matrix against frozen budgets (the S5 matrix).
3. **Literal inline syntax in streamed rich text:** a candidate follow-up for `partial` in the formats lane.
4. **Identity starts at the second partial preview:** a full parse could record segments.

## Receipts (lanes/s4/)

- `ai-flow-benchmark.test.ts`, `ai-flow-benchmark.json`, `ai-flow-benchmark.txt`
- `ai-reuse.test.tsx`, `ai-reuse.json`
- `joiner-benchmark.test.ts`, `joiner-benchmark.json`, `joiner-benchmark-run1.txt`, `joiner-benchmark-run3.txt`, `joiner-benchmark-run4.txt`

I renamed the console captures from `.log` to `.txt` because `.gitignore` excludes `*.log`.

To run the AI-flow baseline arm, first put the pre-S5 plugin next to the current one, and delete the copy after the run:

```sh
git show a7750ad388:packages/platejs/src/ai/react/AIChatPlugin.ts > packages/platejs/src/ai/react/zz-AIChatPlugin.baseline.ts
```

## Docs

- **ComponentPreview move:** already in the tree. Both `markdown.mdx` and `markdown.cn.mdx` end "Streaming previews" with `<ComponentPreview name="markdown-streaming-demo" />`, and `ai.mdx` no longer embeds it.
- **AI docs:** `ai.mdx` and `ai.cn.mdx` already carry the partial-continuation and cancel sentences, with the joiner removed. No change needed.
- **This part:** replaces the body of "Streaming previews" in both Markdown pages. It keeps your current bullets and adds the publication, cadence and cancel rules.

### content/docs/(plugins)/(serializing)/markdown.mdx

````mdx
## Streaming previews

Parse an unfinished stream prefix with `partial: true`, then parse the complete
source without it:

```ts
let previous: ReturnType<typeof editor.api.markdown.parseSlice> | undefined;

// On each preview:
previous = editor.api.markdown.parseSlice(accumulated, {
  lossPolicy: 'allow',
  partial: true,
  previous,
});

// When the stream finishes or the user stops it:
const result = editor.api.markdown.parseSlice(accumulated);
previous = undefined;
```

- `partial: true` hides a trailing tag that has not finished arriving, such as
  `Before <callo`, and does not report tags left open at the end of the
  source. `lossPolicy: 'allow'` keeps unsupported content visible as text
  while the stream is incomplete. The final parse stays strict; when it fails,
  clear the preview instead of keeping a partial one.
- `previous` continues the last partial result of the same method on the same
  editor. When the source extends that result's source and the plugins and
  policy are unchanged, only the text after the last complete block is
  converted again. Complete blocks keep their node objects in `parseSlice`
  results. Any other hint parses the whole source.
- Keep only the latest result. Drop it when the stream finishes, stops, is
  cancelled or replaced, or unmounts.

Publish previews outside the undo history, starting at the first node that
changed. When no leading node is unchanged, replacing the whole value is
cheaper:

```ts
let start = 0;

while (start < nodes.length && published[start] === nodes[start]) start += 1;

if (start === 0) {
  editor.update({ history: 'skip' }).value.replace({ children: nodes });
} else {
  editor.update({ history: 'skip' }, (tx) => {
    tx.nodes.replaceChildren(nodes.slice(start), { at: [], index: start });
  });
}
published = nodes;
```

An editor with authored changes records every node write as an authored change,
so its preview always replaces the whole value.

The consumer owns the source, the abort signal, the hint and the cadence.
Publish the first chunk at once, then the latest source at most every 32 ms.
Cancel, replacement and unmount abort the stream and drop the pending preview
without a final parse.

AI chat previews follow these rules; see [AI streaming](/docs/ai#streaming).

<ComponentPreview name="markdown-streaming-demo" />
````

### content/docs/(plugins)/(serializing)/markdown.cn.mdx

````mdx
## 流式预览

用 `partial: true` 解析未完成的 stream prefix，stream 结束后不带该选项解析完整
source：

```ts
let previous: ReturnType<typeof editor.api.markdown.parseSlice> | undefined;

// 每次预览：
previous = editor.api.markdown.parseSlice(accumulated, {
  lossPolicy: 'allow',
  partial: true,
  previous,
});

// Stream 结束或用户停止后：
const result = editor.api.markdown.parseSlice(accumulated);
previous = undefined;
```

- `partial: true` 会隐藏尚未完整到达的末尾 tag（例如 `Before <callo`），也不会
  报告 source 末尾仍未闭合的 tag。`lossPolicy: 'allow'` 让 stream 未完成时不支持
  的内容以文本形式可见。最终解析保持严格；最终解析失败时应清空 preview，而不是
  保留 partial preview。
- `previous` 延续同一 editor 同一 method 的上一次 partial result。当 source 在该
  result 的 source 之后继续增长，且 plugin 与 policy 未变时，只重新转换最后一个
  完整 block 之后的文本。`parseSlice` result 中的完整 block 保留其 node object。
  其他 hint 都会解析整个 source。
- 只保留最新的 result，并在 stream 完成、停止、被取消或替换，或组件卸载时丢弃它。

在 undo history 之外发布 preview，从第一个发生变化的 node 开始替换。开头没有未变
的 node 时，替换整个 value 开销更小：

```ts
let start = 0;

while (start < nodes.length && published[start] === nodes[start]) start += 1;

if (start === 0) {
  editor.update({ history: 'skip' }).value.replace({ children: nodes });
} else {
  editor.update({ history: 'skip' }, (tx) => {
    tx.nodes.replaceChildren(nodes.slice(start), { at: [], index: start });
  });
}
published = nodes;
```

启用 authored changes 的 editor 会把每次 node 写入记录为 authored change，因此它
的 preview 始终替换整个 value。

Source、abort signal、hint 和发布节奏由调用方负责。第一个 chunk 立即发布，之后最
多每 32 ms 发布一次最新 source。取消、替换和卸载会中止 stream 并丢弃待发布的
preview，不做最终解析。

AI chat preview 遵循这些规则；参阅 [AI 流式传输](/docs/ai#streaming)。

<ComponentPreview name="markdown-streaming-demo" />
````

I've stopped editing `packages/platejs/src/ai/react/**`, `markdown-streaming-demo.tsx` and `ai-menu.tsx`. The registry is yours to regenerate.
