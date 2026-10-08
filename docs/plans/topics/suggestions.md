# Suggestions

Page: https://claude.ai/artifact/Gcd9LP7QxTS1psbsqRGDV4

Plite 的 authored changes 与 Plate 的 Suggestion：编辑模式（Editing）直接修改正文，修订模式（Suggesting）把修改记成建议，删除的内容以删除线片段留在修订视图中，评审卡片读取当前内容。本主题从 2026-10-03 开始，依次经过六个迭代：`2026-10-03-suggestion-text-review.md`（文本编辑规则，已被取代）、`2026-10-07-suggestion-final-behavior.md`（最终行为契约）、`2026-10-07-authored-typing-regression-benchmark.md`（打字回退定位）、`2026-10-07-markup-caret-model-selection.md`（光标回到模型选区）、`2026-10-07-caret-inside-struck-text.md`（删除线内的光标与编辑）与 `2026-10-07-struck-text-edge-cases.md`（删除线编辑的边界情况）。最终行为契约见 `2026-10-07-suggestion-final-behavior.md` 附录 A，被后续迭代改写的行逐行标注了现行行为。

## Public API

评审卡片与导出读取 `details().parts`，内容是建议当前的样子，不存原文副本。

```ts
// content/docs/(guides)/authored-changes.mdx
const details = authored.read.details(changeId);

if (details?.parts.status === "available") {
  for (const part of details.parts.items) {
    // Render content, boundary, property, or root facts in review UI.
  }
}
```

建议列表分页结果携带 `documentId`；来自已替换文档的游标从第一页开始，来自其他查询条件的游标抛错。

```ts
// apps/www/src/registry/components/editor/comment-toolbar-button.tsx
const page = authored.read.changes({ proposals: true, limit: PAGE_SIZE, cursor });
const cursors = paging.documentId === page.documentId ? paging.cursors : [];
```

视图的 intent 决定输入方式：`edit` 直接修改正文，`propose` 记成建议，修订模式下的格式一律成为格式建议。

```ts
// content/docs/(guides)/authored-changes.mdx
authored.api.setView({
  intent: "propose",
  projection: "proposed",
});
```

## What other editors do

证据来自 2026-10-07 的源码调研（prosemirror-suggest-changes、OnlyOffice sdkjs、LibreOffice、Overleaf）与文档；Word 与 Google Docs 未读源码，结论为推断或实测。

| 行为 | 参考编辑器的做法 | 采用 |
| --- | --- | --- |
| 编辑模式在建议内输入 | LibreOffice、OnlyOffice、CKEditor：普通正文，拆开原建议 | 普通正文，拆开原建议 |
| 编辑模式删除建议内容 | 各家都真删 | 真删 |
| 修订模式删他人新增 | Google Docs、OnlyOffice、Tiptap：嵌套删除 | 叠加删除建议 |
| 光标进入删除线 | OnlyOffice、LibreOffice、prosemirror-suggest-changes 允许；Overleaf 不可能 | 允许，逐字移动 |
| 修订模式在删除线内输入 | Word、LibreOffice、OnlyOffice 拆开删除线；Google Docs 并入删除 | 拆开删除线，新文字为新增 |
| 修订模式在删除线上按 Backspace / Delete | OnlyOffice 逐字跨过，不改内容 | 逐字跨过，到正文再删 |
| 连续删除分组 | Google Docs、OnlyOffice 按位置 | 按位置，同作者同类 |
| 修订模式格式 | 各家都记为格式修订 | 格式建议 |
| 卡片内容 | 各家都显示当前内容 | 当前内容 |

## Layer and owner

| Concern | Owner |
| --- | --- |
| 建议身份、依赖、留存内容 | Plite `authored/state.ts` 的 authored 图；无原文副本 |
| 编辑模式直接文字 | `isolate.ts`、`independent` 与 `decisions.ts` rebase；只有直接编辑与删除线内编辑可独立重放 |
| 依赖判定 | `decisions.ts` 的 `decide`，按操作判定；拒绝有依赖的建议返回 `blocked` |
| 删除分组 | 空间分组，按位置合并同作者同类删除 |
| 卡片摘要 | `readAuthoredReviewParts` 按位置合并连续删除并与相邻新增配成替换；`changes()` 按建议缓存 |
| 修订视图的光标 | 正文中的光标是模型选区加侧别（`markup-selection.ts`）；删除线内的光标是带 `fragmentId` 的视图选区，自绘显示，原生光标停在删除线前 |
| 删除线输入 | 删除线保持 `contenteditable=false`；输入经 `applyMarkupInput` 写到片段目标，核心按锚点拆分删除 |
| 按键旁删除线的计算 | 不跨块时只为光标所在顶层块建边界图（`createCaretBlockGraph`） |
| 格式 | 视图 intent：Editing 直接，Suggesting 格式建议 |
| 协作准入 | Yjs schema identity 与 envelope format 3；传输层 effect 只接受当前版本 |

## Native behavior and proof

行为契约见 `2026-10-07-suggestion-final-behavior.md` 附录 A（编辑模式 E1–E11、修订模式 S1–S21、重叠建议决定表、卡片 K1–K5）。证明在 `packages/plitejs/test/react/authored-fragment-provider.test.tsx`、`authored-retained-edit-contract.test.ts`、`authored-causal-contract.test.ts` 与 Chromium `apps/www/tests/browser/suggestion.spec.ts`；后者有 12 个用例在本主题之前就失败，记于最终行为计划 Open work 12。

## Main changes

- 删除第二存储：`record.original`、`original.ts` 及其解码兼容，卡片读当前内容。
- 删除线保持不可编辑的 DOM，但光标可进入：点击处自绘光标，方向键逐字移动，删除线内输入、粘贴、回车与输入法提交拆开删除线；修订模式 Backspace 与 Delete 逐字跨过删除线，编辑模式直接删除删除线字符；可局部选中，修订模式复制不含删除线文字。
- 正文中的折叠光标只存模型选区与侧别，打字不再为整份文档建边界图；删除线旁的按键与点击只为光标所在块建图，不再随删除数量增长。
- 恢复按位置分组；删除自动格式策略；依赖按操作判定。
- 删除线片段的位置解析沿着已删字符的插入锚点向上追溯，逐字输入后删掉第一个字符时，后续字符仍保持原来的位置；删掉删除线右边界所在的正文时，位置沿被删字符折叠的方向解析，不再退回左端点。
- 片段视图对删除线切片的开放祖先只放宽最少子节点数，其余 schema 校验照常，分栏内的删除线可编辑。
- 片段更新在外层事务中读取并构建变更时绕开外层草稿，Plate 标记插件在事务内调用的加粗、斜体可作用于包含删除线的选区。
- 撤销与审批共用同一条依赖规则：已撤销的操作不再计为依赖，回车拆段后撤销不再卡住。
- 结构编辑的区段划分只把真正包住边界的节点视为开放节点，修订模式加粗后再输入不再破坏文档结构。
- 修订模式的替换记录被替换范围的起点；替换从删除线之前开始时，新文字排在旧删除线之前，旧删除线按文档顺序排在被替换内容之间。
- 修订模式的格式命令只作用于选区中的正文；删除线内的折叠光标仍设置之后输入文字的格式。外层事务中只含正文的视图更新直接在该事务上执行。
- 修订视图中，模型持有节点选区（如拖选的表格单元格）时，正文 DOM 选区回到普通导入路径；浏览器能绘制的纯正文范围不再记为模型所有。跨单元格拖选与之后的格式快捷键恢复正常，该回退自 95eeaf92b7 引入。
- React 层：表格单元格中点击删除线交给原生选区导入；划选删除整段删除线后光标落在原位置；编辑模式删除删除线字符、以及任何跨删除线的选区删除，光标停在范围起点；修订模式按词或按行删除照常划掉正文；双击删除线时用键盘按词移动的同一规则求出词的两端；自绘光标闪烁。

## Open work

- 本分支在 authored 核心层改动约 4600 行，合并前由该模块的设计者审查独立重放语义、删除线位置规则与撤销依赖规则。owner: natamox，stop: 审查完成或所有者决定不审。
- `suggestion.spec.ts` 中 11 条用例在 HEAD 上即失败，本迭代未处理，其中包括 `expands a pointer selection across deleted text boundaries`。owner: natamox，stop: 逐条判定为过时用例或缺陷并处理。
- `table-selection.spec.ts` 中 `apply-block-toolbar-actions-to-drag-selected-cells` 与 `hide-block-handles-during-cell-selection` 在 next 合并基点即失败。owner: natamox，stop: 在 next 上修复或判定。
