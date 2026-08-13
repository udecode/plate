# Descriptor-owned renderer props

Objective:
Replace plugin-owned `Plate*Props` and `Plite*Props` node-type generics with
their owning plugin descriptors, classify every production use in `apps/**`
and `packages/**`, and prove the corrected renderer surface without changing
generic renderer infrastructure.

Completion threshold:
- The six renderer prop families are parsed across production TypeScript:
  `PlateElementProps`, `PlateLeafProps`, `PlateTextProps`,
  `PliteElementProps`, `PliteLeafProps`, and `PliteTextProps`.
- Every plugin-bound renderer uses `typeof FooPlugin` or
  `typeof BaseFooPlugin`.
- Every retained default or generic type argument has a concrete
  plugin-independent owner.
- Expected and actual manifest counts match, with zero missing, extra, or
  unclassified rows.
- Changed renderers have focused type/runtime evidence, formatting proof, and
  a P2 review pass.

Verification surface:
- TypeScript-AST manifest over `apps/**` and `packages/**`, excluding tests,
  build output, dependencies, and type-test fixtures.
- Focused renderer, suggestion-kit, list-classic, and toggle tests.
- Source-first package typecheck plus the www TypeScript check, with unrelated
  shared-checkout failures classified by file.
- Scoped Biome, registry changelog generation check, and `git diff --check`.
- Registry browser smoke when the Browser integration and generated editor
  schema inputs are available.

Constraints:
- Do not replace descriptor inference with casts, copied node aliases, or
  explicit editor-context annotations.
- Keep schema-agnostic family shells and wrapper infrastructure generic.
- Preserve transient decorations such as code-token `className` and diff
  intent without pretending they are persisted schema fields.
- Do not patch unrelated CLI, table, Core schema, blockquote transform,
  callout, or editor-kit work in the shared checkout.
- Edit `.agents/rules/**` as source of truth and regenerate skills with
  `pnpm install`; do not hand-edit generated skill output.

Boundaries:
- In scope: production renderer prop type arguments, the smallest owning
  renderer/package corrections, Plate UI doctrine, affected release prose,
  registry changelog metadata, and this goal ledger.
- Out of scope: changing the public renderer prop generic API, generic Core
  render plumbing, generated editor-schema architecture, and unrelated
  behavior fixes found by whole-checkout review.
- Templates remain CI-owned and untouched.

Blocked condition:
The task would be blocked only if a stable plugin descriptor could not infer
both the node shape and plugin context without a Core API change. No such gap
was found.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Fix the reported Suggestion renderer and find every same-class production drift. |
| Source of truth and workspace recorded | yes | Repo rules plus `.agents/rules/plate-ui.mdc`; workspace `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | AST counts and grouped classifications replace a path-by-path transcript. |
| Public API fork routing checked | no | Existing descriptor-capable prop generics are sufficient; no API fork. |
| Gap policy checked | yes | No Plite or Plate capability gap; no workaround introduced. |
| Related scoped sweep policy checked | yes | All six production prop families are included in one AST manifest. |
| Review-mode rename freeze checked | no | No public or internal rename belongs to this packet. |
| Package review checklist required | no | This is a cross-repo API-pattern correction, not package review mode. |
| Doctrine registry or sync queue required | no | Plate Next package sync mode is outside this packet. |

Work Checklist:
- [x] Capture the exact renderer-prop families and production scope.
- [x] Replace direct node aliases and plugin-bound defaults with descriptors.
- [x] Verify each changed descriptor against its configured plugin owner.
- [x] Keep only schema-agnostic app wrappers and generic library machinery
      without a descriptor.
- [x] Delete the stale static Suggestion editor workaround.
- [x] Repair the reusable Plate UI authoring rule and regenerate the skill.
- [x] Add package changeset prose and registry changelog coverage.
- [x] Run the final AST manifest and classify all 150 references.
- [x] Run focused tests, typechecks, formatting, changelog, and diff proof.
- [x] Run P2 review, fix its in-scope heading-family finding, and re-review the
      resulting packet.
- [x] Record browser and unrelated shared-checkout limitations explicitly.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Zero unclassified production uses plus focused proof | Manifest: 150 total, 112 descriptors, 13 app wrappers, 25 generic infrastructure, 0 unclassified. |
| Broad Core drift ledger coverage | no | Bounded call-site sweep only | Core was classified only where it contains matching generic infrastructure. |
| Score gate | yes | Own every non-descriptor row | All 38 non-descriptor rows are classified as app wrapper or generic infrastructure. |
| Best Plate v2 recommendation | yes | Record canonical call shape | Plugin-bound renderers use the stable descriptor; family shells stay generic. |
| Plite/Plate gap ledger | yes | Record gap or N/A | N/A: current public generics accept descriptors and infer the required context. |
| Related scoped sweep after correction | yes | Rescan all six families | Fresh AST manifest returned zero unclassified rows. |
| Package file checklist | no | Package review mode only | N/A. |
| Package doctrine attestation | no | Package sync mode only | N/A. |
| All-package sync closure | no | Sync-all mode only | N/A. |
| Helper topology / lexical tx ownership | no | No helper or transaction topology changed | N/A. |
| Package/API proof | yes | Focused tests and source-first checks | 19 isolated focused tests pass; changed www files have no TypeScript diagnostics. |
| Shared Core gate coverage | no | No Core generic changed | N/A. |
| Non-Core package error triage | yes | Classify command failures | Existing Plite React, list, suggestion, table, editor-kit, source, and test-global errors are outside changed files. |
| Source audit | yes | Parse production source | TypeScript AST audit covers all matching production references. |
| Rename ledger | no | No postponed rename | N/A. |
| Extracted-file inventory | no | No extracted file belongs to this packet | N/A. |
| P2 autoreview / review | yes | Run P2 and repair in-scope findings | P2 found heading class forwarding; fixed. Post-fix review produced only out-of-scope shared-tree findings. |
| Final lint/check | yes | Scoped formatter, changelog, diff, tests | Recorded below. |
| Changed list / needs attention | yes | Record owners and risks | Recorded below. |
| Goal plan complete | yes | Run the mechanical plan checker | Final checker passes after this evidence is recorded. |

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Discover | complete | AST manifest enumerated all 150 production references. |
| Correct | complete | Plugin-owned renderers use stable Base/live descriptors. |
| Classify | complete | 112 descriptor, 13 app-wrapper, 25 infrastructure rows; zero unclassified. |
| Prove | complete | Focused tests, TypeScript diagnostics, Biome, changelog check, diff check, and P2 review recorded. |
| Close | complete | Decision ledger and remaining shared-tree risks recorded. |

Review matrix:
| Surface | Count | Verdict | Owner evidence |
|---|---:|---|---|
| Descriptor-bound production props | 112 | keep | Stable Base/live descriptors infer schema node and plugin context together. |
| Schema-agnostic app wrappers | 13 | keep generic | `block-list` family (5), heading family shells (2), classic-list family shells (2), caption, draggable, block selection, and block discussion. |
| Generic Core/Plite React machinery | 25 | keep generic | Public prop definitions, render plumbing, plugin author fields, and the primitive Plite renderer cannot name one feature descriptor. |
| Direct node aliases in production props | 0 | cut complete | No `SuggestionText`, `CodeSyntaxText`, classic todo alias, or other concrete node alias remains as a renderer prop argument. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternative | Reason |
|---|---|---|---|
| Plugin component | `PlateElementProps<typeof FooPlugin>` | `PlateElementProps<FooElement>` or bare props | Descriptor owns both schema and plugin context. |
| Static plugin component | `PliteLeafProps<typeof BaseFooPlugin>` | copied static editor alias | Base descriptor is the server-safe owner. |
| Shared family shell | bare `PlateElementProps` | false union descriptor or cast | The shell intentionally accepts several independently owned plugins. |
| Decoration-only data | `Reflect.get(node, key)` at the renderer boundary | polluting persisted schema | Syntax token classes and diff intent are transient render metadata. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Decision |
|---|---|---|
| None | Descriptor-capable element, leaf, and text props already infer their context | Keep the existing Core API. |

Related scoped sweep ledger:
| Trigger | Scope | Method | Matches | Corrected | Retained generic | Unclassified |
|---|---|---|---:|---:|---:|---:|
| `PliteLeafProps<SuggestionText>` | Production `apps/**` and `packages/**` | TypeScript AST over all six prop families | 150 | Plugin-bound drift across registry/package renderers | 38 | 0 |

Changed list:
| Group | Current-run changes |
|---|---|
| Registry renderers | Suggestion, code block, basic blocks/marks, headings, lists, AI, TOC, toggle, emoji, footnote, find/replace, media file, and local example plugins use descriptors. |
| Packages | Classic-list todo state derives from `BaseListPlugin`; toggle visibility derives from `BaseTogglePlugin`. |
| Doctrine | Plate UI source rule and generated skill require descriptor-owned renderer props. |
| Release metadata | Existing list-classic/toggle changesets and the canonical-node-props registry changelog describe the final API. |

Out-of-scope package drift:
| Command / surface | Error summary | Why it does not block this packet |
|---|---|---|
| `pnpm turbo typecheck --filter=./packages/toggle --filter=./packages/list-classic` | Existing `packages/plite-react/src/plugin/with-react.ts:178` DOM API cast incompatibility | The error is upstream of both changed package files and contains no renderer-props diagnostic. |
| www `tsc --noEmit` | Existing source collection export, editor-kit hook generic, table depth, Bun mock globals, and list/suggestion/table/Plite React errors | Final log contains no changed renderer-props file. |
| Whole-checkout P2 | CLI watch/type printer, blockquote transforms, callout, table focus, editor-kit, and a temporary CLI fixture | None belongs to the named packet; no unrelated source was changed. |

Findings:
- The reported Suggestion static renderer was real drift: its node alias also
  forced a copied `StaticSuggestionEditor` workaround.
- `EmojiInputElement` must derive from `EmojiInputPlugin`, not its parent
  `EmojiPlugin`; the configure owner is authoritative.
- Exact heading functions need exact descriptors. Their shared heading shell
  remains generic because it is intentionally multi-plugin.
- Renderer callback props carry caller classes in `attributes.className`;
  `PlateElement` and `PliteElement` merge those attributes with their explicit
  variant class.
- Multi-file Bun execution exposes a Bun module-cache isolation bug in this
  shared graph. The same eight files pass independently in fresh Bun processes.

Decisions and tradeoffs:
- Prefer a descriptor even when a direct element/text alias appears shorter.
  The alias loses the plugin capability context and creates more type plumbing.
- Do not force descriptors onto wrapper components that are deliberately
  independent of one plugin family.
- Do not add `className` to renderer callback props or cast it into existence;
  preserve the existing `attributes` channel.

Error attempts:
| Error / failed attempt | Count | Resolution |
|---|---:|---|
| P2 review initially resolved Codex CLI 0.139.0 | 1 | Put the updated app CLI 0.147.0-alpha.6.5 first on `PATH`. |
| Heading P2 fix read nonexistent top-level `props.className` | 1 | Use the existing `attributes.className` merge performed by the node primitive. |
| Multi-file Bun run reported missing barrel exports | 2 | Mandatory reinstall plus isolated fresh-process runs; all 19 focused tests pass. |
| First reinstall ended on a missing pnpm nanoid package file | 1 | A direct `pnpm install` completed successfully and regenerated skills. |
| Final narrowly prompted autoreview could not bundle a large unrelated untracked editor schema | 1 | Retain the completed post-fix whole-tree P2 evidence and manual exact-file audit. |

Verification evidence:
- Final AST manifest: `TOTAL 150`, `DESCRIPTOR 112`, `DEFAULT 25`,
  `OTHER 13`; the 25 default and 13 generic-argument rows classify into 13
  schema-agnostic app wrappers and 25 Core/Plite React infrastructure rows.
- Focused runtime tests: eight isolated `bun test <file>` invocations, 19
  passed, 0 failed.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.json --pretty false` reports
  no changed renderer-props file after the heading correction; remaining
  diagnostics are listed in out-of-scope drift.
- `pnpm turbo typecheck --filter=./packages/toggle
  --filter=./packages/list-classic` reaches package typecheck and stops at the
  pre-existing Plite React DOM API cast.
- `pnpm exec biome check --write` on changed renderer files passed; final
  scoped Biome and `git diff --check` are clean.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` passes all
  54 registry changelog entries.
- P2 autoreview ran with the updated app CLI. The only in-scope finding was
  heading class forwarding; it was corrected and the next review contained no
  descriptor-props finding.
- The www dev server starts on port 3001. Browser rendering remains
  unclaimable because the Browser integration is unavailable in this turn and
  the earlier route attempt was blocked by unrelated missing generated editor
  schema inputs.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-12-descriptor-owned-renderer-props.md` is the final
  mechanical closure gate.

Final handoff contract:
- Target: every production use of the six renderer prop families.
- Result: 150 classified, zero unclassified, zero direct node-alias prop
  arguments.
- Canonical law: plugin-bound renderer props use the stable owning descriptor;
  only truly schema-agnostic wrappers and generic infrastructure stay generic.
- Proof: 19 focused tests pass; changed files have no www TypeScript diagnostic;
  formatting, changelog generation, diff check, and P2 review are recorded.
- Remaining risk: whole-checkout typecheck and browser proof are blocked by
  named unrelated shared-tree state, not hidden or claimed green.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Closure complete for the descriptor-owned renderer-props packet. |
| Where am I going? | Mechanical plan check, goal completion, and concise handoff. |
| What is the goal? | Zero unclassified production renderer-prop uses with descriptor ownership and proof. |
| What have I learned? | Stable descriptor ownership is correct; generic family wrappers remain an intentional exception. |
| What have I done? | Corrected the drift, repaired doctrine, classified 150 references, and ran focused proof/review. |

Open risks:
- Whole-checkout typecheck remains red from unrelated shared WIP listed above.
- Browser-rendered proof is not available until the Browser integration and
  generated editor-schema inputs are healthy.
- The shared checkout contains unrelated P2 findings; this packet did not take
  ownership of them.
