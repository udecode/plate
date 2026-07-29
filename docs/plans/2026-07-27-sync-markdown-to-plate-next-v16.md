# Sync Markdown to Plate Next v16

Objective:
Sync `packages/markdown` to Plate Next v16 with owner-first colocation,
inline single-owner helpers, preserved Markdown behavior, honest public hard
cuts, and a current package fingerprint.

Completion threshold:
All 85 fingerprinted package files score 100; single-owner helper files are
merged or deleted; shared conversion owners have concrete reuse evidence;
package tests, slow tests, typecheck, build, lint, barrels, source audits, and
package-local autoreview pass; the v16 registry reports Markdown current.

Verification surface:
- `bun test packages/markdown/src/lib`
- `bun test ./packages/markdown/src/lib/commonmarkSurface.slow.ts ./packages/markdown/src/lib/deserializer/deserializeMentionLink.slow.tsx ./packages/markdown/src/lib/deserializer/deserializeMd.slow.ts`
- `pnpm turbo typecheck --filter=./packages/markdown`
- `pnpm --filter @platejs/markdown build`
- `pnpm --filter @platejs/markdown lint:fix`
- `pnpm --filter @platejs/markdown brl`
- package-local topology, React-boundary, plugin-stage, cast, transaction, and
  deleted-export audits
- `pnpm check:core`, with failures classified by owning file
- downstream AI/www typecheck, with failures classified by owning file
- structured Codex autoreview limited to the Markdown packet
- Plate Next registry validate, status, check, and fingerprint commands

Constraints:
- Package-only sync; do not rewrite Core, AI, apps, docs, or unrelated packages.
- Prefer one coherent owner over classification files; no line ceiling.
- Inline single-owner helpers and merge API/test families.
- Keep a separate file only for multiple durable consumers, an independent
  public algorithm, or a cycle-free shared runtime boundary.
- Do not add compatibility wrappers for public helpers removed by this major
  hard cut.
- Do not pass `tx`, `read`, `api`, or editor state through new single-owner
  helper parameters.
- Preserve callback inference; no local `any`, casts, or callback annotations
  used to hide builder/type failures.

Boundaries:
- Writable owner surface: `packages/markdown`,
  `.changeset/markdown-plite-runtime.md`, `pnpm-lock.yaml`,
  `.agents/rules/plate-next/versions.json`, and this plan.
- Core, Selection, Utils, AI, apps, docs, and other package drift is read-only
  evidence.
- Browser proof is not applicable: this is a base-only conversion package with
  no React entrypoint or dedicated runnable UI route.

Blocked condition:
A Markdown-owned behavior, type, build, export, or review failure blocks
completion. Shared-checkout failures naming only untouched owners are recorded
as external risks and do not invalidate the package packet.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Goal ledger | yes | This plan copied package scope, topology rules, proof, stop condition, and handoff requirements before edits |
| Plate Next version baseline | yes | Registry validation passed; Markdown started stale at v0 with fingerprint `sha256:8cac33a0d2798d8d4fede0517256bb28b2ee1c027681700769c8e50e5a3b45a3` |
| Package manifest | yes | Initial fingerprint covered 97 files; final topology is reconciled against an exact 85-file manifest plus deleted-file ledger |
| Package/API release classification | yes | Root-export removals and React dependency removal are a major package hard cut recorded in `.changeset/markdown-plite-runtime.md` |
| Broad Core sweep | no | Named Markdown package sync; Core is read-only except shared-gate evidence |

Work Checklist:
- [x] Audit every package file and materialize the final manifest.
- [x] Merge inline serialize/deserialize APIs and their test families.
- [x] Inline or delete single-owner serializer/deserializer utility files.
- [x] Keep only multi-consumer or independent algorithm/runtime boundaries.
- [x] Preserve the cycle-free shared Markdown runtime owner.
- [x] Remove React peer/runtime dependencies from the base package.
- [x] Regenerate barrels and record the major public hard cut.
- [x] Run fast tests, slow tests, typecheck, build, lint, and source audits.
- [x] Classify shared Core and downstream failures by owning file.
- [x] Run structured package-local autoreview until clean.
- [x] Attest the final v16 fingerprint and verify current status.
- [x] Close the 85-file score ledger and final handoff.

Package file checklist:
Manifest command: `find packages/markdown -type f \( -path '*/src/*' -o -name package.json -o -name LICENSE -o -name 'tsconfig*.json' \) -not -path '*/dist/*' -print | sort`

Expected 85; actual 85; checked at score 100: 85; deferred: 0; missing: 0;
extra: 0.

- [x] `packages/markdown/LICENSE` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/package.json` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/MarkdownPlugin.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/MarkdownPlugin.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/__snapshots__/mdx.spec.tsx.snap` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/__tests__/createTestEditor.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/__tests__/testValue.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/columnSurface.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/commonmarkSurface.slow.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/dateElement.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/defaultRules.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/__snapshots__/deserializeMdList.spec.tsx.snap` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/convertChildrenDeserialize.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/convertNodesDeserialize.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/convertNodesDeserialize.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/convertTextsDeserialize.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/deserializeMd.slow.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/deserializeMd.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/deserializeMd.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/deserializeMentionLink.slow.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/mdastToSlate.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/mdastToSlate.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/paragraphBreaks.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/splitLineBreaks.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/htmlToJsx.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/htmlToJsx.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/parseMarkdownBlocks.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/parseMarkdownBlocks.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/stripMarkdown.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/deserializer/utils/stripMarkdown.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/emojiSurface.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/gfmSurface.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/internal/markdownDeserializer.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/internal/markdownDocument.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/internal/markdownOptions.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/internal/markdownRuntime.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/internal/markdownSerializer.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/mathSurface.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/mdast.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/mdx.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/mdxMarks.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/mediaSurface.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/plugins/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/plugins/remarkMdx.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/plugins/remarkMention.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/columnRules.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/columnRules.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/defaultRules.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/fontRules.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/fontRules.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/mediaRules.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/utils/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/utils/parseAttributes.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/rules/utils/parseAttributes.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/__snapshots__/listToMdastTree.spec.ts.snap` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/convertNodesSerialize.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/convertTextsSerialize.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/convertTextsSerialize.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/listToMdastTree.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/listToMdastTree.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/serializeMd.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/serializeMd.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/serializeMention.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/standardList.spec.tsx` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/serializer/wrapWithBlockId.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/table.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/taskList.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/types.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/types.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/utils/getRemarkPluginsWithoutMdx.spec.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/utils/getRemarkPluginsWithoutMdx.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/src/lib/utils/index.ts` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/tsconfig.build.json` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint
- [x] `packages/markdown/tsconfig.json` — score: 100 — verdict: keep — evidence: package audit + 203 fast + 32 slow + typecheck/build/lint

Extracted file recovery ledger:

| Path/family | Bucket | Evidence |
| --- | --- | --- |
| `internal/markdownRuntime.ts` | justify-new-proof-tooling | Shared immutable editor snapshot/registry context used by plugin APIs, codecs, standalone serialize/deserialize APIs, rule building, options, serializer, and deserializer owners; separate placement avoids plugin/algorithm runtime cycles |
| `internal/markdownSerializer.ts` and `internal/markdownDeserializer.ts` | justify-new-proof-tooling | Shared orchestration used by plugin APIs/codecs and standalone public functions |
| `internal/markdownOptions.ts` and `internal/markdownDocument.ts` | justify-new-proof-tooling | Multi-consumer conversion context and document-shape algorithms |
| inline serialize/deserialize source and spec pairs | merge-existing-owner | Merged into `serializeMd.ts`, `deserializeMd.ts`, and their family specs |
| custom MDX/style/custom-mark/key-lookup/unreachable helper files | merge-existing-owner | Logic moved into consuming algorithm/rule owners; 13 obsolete source/spec/barrel files deleted |
| `rules/fontRules.spec.ts` | justify-new-proof-tooling | Family-level style conversion proof replacing the deleted helper-level spec |

Related scoped sweep:
- Helper topology: 16 files remain under `utils`; nine are focused
  implementation/barrel files and seven are colocated specs. Every production
  survivor is public, independently tested, or shared by multiple rule/algorithm
  owners. The serializer utility directory is gone.
- Lexical context parameters: two production files match `state:`:
  `MarkdownPlugin.ts` at the codec boundary and `markdownRuntime.ts` at the
  shared immutable snapshot boundary. No standalone production function accepts
  `tx`, `read`, or `api`.
- Same-owner portal lookups: three production files use
  `editor.plugin(MarkdownPlugin)`; all are public standalone wrappers or the
  exported `buildRules` adapter, not plugin authoring internals.
- React boundary: zero source imports and zero package React peer/runtime
  dependencies.
- Builder/cast audit: zero production `.extend*` stages, explicit plugin export
  annotations, `any`, or TypeScript suppression comments.
- Deleted public helpers: no compatibility wrappers retained; the exact
  removals are disclosed by the existing major Markdown changeset.

Best Plate v2 decision:
Keep `markdownRuntime.ts`. Inlining it into `MarkdownPlugin.ts` would turn the
plugin into a dependency hub and recreate runtime cycles with serializer,
deserializer, options, and standalone public APIs. The correct colocation is
algorithm-family colocation around one shared cycle-free runtime boundary, not
blindly stuffing every file into the plugin.

Rejected alternatives:
- Compatibility wrappers for deleted utility exports: rejected; this is a
  deliberate major hard cut.
- One file per tiny helper: rejected; it scatters behavior and worsens
  inference/navigation.
- One giant plugin containing shared serializer/deserializer algorithms:
  rejected; those are independently tested, public or multi-consumer algorithm
  owners and would create a dependency knot.
- Over-inlining `isMdxJsxNode` and `isPluginTuple`: rejected after TypeScript
  lost required union/readonly-tuple narrowing; these are real type guards.

Error attempts:
- Slow-test paths without a leading `./` matched no files; rerun with explicit
  relative paths passed 32/32.
- Running `brl` and build concurrently briefly removed `src/index.ts` during
  package-root resolution; serial build passed. This was a proof-command race,
  not a package defect.
- Typecheck caught a missed multiline plugin-type replacement and lost
  narrowing from two over-inlined type guards; both were repaired at their
  owners.
- First autoreview correctly flagged undisclosed public helper removals. The
  existing major changeset now lists them; the final review is clean.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Package file score | yes | 85/85 final files checked at score 100; zero deferred, missing, or extra rows |
| Topology | yes | Inline API/test families merged; 13 obsolete helper/spec/barrel files deleted; all remaining boundaries have reuse or independent-owner evidence |
| Behavior proof | yes | 203 fast tests and 32 slow tests pass with zero failures |
| Type/build/lint/barrels | yes | Markdown source-first typecheck, standalone build, package lint, and package barrel generation pass |
| Public API hard cut | yes | `.changeset/markdown-plite-runtime.md` is major and names all removed conversion internals plus React dependency removal |
| React/Base boundary | yes | Zero React imports and zero React peer/runtime dependencies |
| Shared Core gate | yes | `pnpm check:core` reached the source audit and failed only on untouched Core, Selection, and Utils files; no Markdown finding |
| Downstream type gate | yes | AI/www graph reached AI declaration build and failed only on untouched `AIChatPlugin.ts` leaking Selection internal types; Markdown build passed in the same graph |
| Browser | no | Base-only conversion package has no React surface or dedicated browser route |
| Autoreview | yes | Final structured Codex run reports patch correct with zero findings |
| Version attestation | yes | v16 registry validates; `status markdown` and `check markdown` report current; fingerprint is unchanged |
| Goal checker | yes | Run after this evidence is saved |

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Scope and manifest | complete | Package-only boundary and 85-file final manifest |
| Colocation and hard cuts | complete | Inline families merged; obsolete helper files removed |
| Package proof | passed | 203 fast, 32 slow, typecheck, build, lint, barrels |
| Shared-gate triage | complete | Failures mapped to untouched Core/Selection/Utils/AI owners |
| Autoreview | passed | Zero accepted/actionable findings |
| Version sync | complete | Markdown current at Plate Next v16 |
| Handoff | complete | Exact changes, risks, and next owner recorded |

Verification evidence:
- `bun test packages/markdown/src/lib`: 203 pass, 0 fail, 4 snapshots.
- Explicit slow suite: 32 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/markdown`: 13/13 tasks pass.
- `pnpm --filter @platejs/markdown build`: pass when run serially.
- `pnpm --filter @platejs/markdown lint:fix`: 81 files checked, no fixes.
- `pnpm --filter @platejs/markdown brl`: pass; root public inline
  serialize/deserialize names remain exported.
- `pnpm install`: pass; lockfile drops only the Markdown
  `react-compiler-runtime` importer.
- Final autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --engine codex --thinking high --prompt "<Markdown major hard-cut scope>" --stream-engine-output`;
  zero findings, patch correct.
- `version.mjs validate`: 41 active, 1 retired, registry valid.
- `version.mjs status markdown` and `check markdown`: 1 current, 0 stale,
  0 drifted.
- Final fingerprint:
  `sha256:7f4e6eb306dcc88b5853b3d68389c98b9fdf42acb685bcc269d63ca4ecf1b7d6`
  across 85 files.

Reboot status:
One-shot package sync is complete. No reboot, resume packet, or follow-up
implementation is required for Markdown.

Open risks:
The shared checkout still has unrelated `check:core` policy drift in Core,
Selection, and Utils, plus an AI declaration leak from Selection internal
types. Those files were untouched and are not Markdown regressions. Browser
proof is intentionally absent because this package has no runnable React/UI
surface.

Final handoff:
- Markdown is Plate Next v16 current.
- Runtime verdict: keep the shared cycle-free owner.
- User-visible hard cut: removed conversion utility exports and React package
  dependencies, documented in the major Markdown changeset.
- Best next package is `math`, still v0 in the registry.
