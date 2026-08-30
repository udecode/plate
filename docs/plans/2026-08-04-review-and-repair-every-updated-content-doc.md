# Review and repair every updated content doc

Objective:

Review all 132 modified `content/**` documents against current Plate, Plite,
package, registry, and app source. Repair every stale public API, import,
ownership, identity, or behavior claim directly without changing runtime
source.

Completion threshold:

- [x] The changed-doc inventory is exactly 132 tracked files and zero untracked
      files.
- [x] Every inventory row has an explicit reviewed disposition.
- [x] Every accepted stale claim is repaired in `content/**`.
- [x] Current docs contracts, Plite docs audit, source generation, API
      reference parity, registry-source checks, typecheck, lint, diff checks,
      import checks, and P2 autoreview pass.
- [x] Browser proof is attempted with the ordinary in-app Browser and any
      external blocker is recorded exactly.
- [x] No package/runtime source, template, changeset, generated registry build,
      git index, commit, or remote state is changed.

Verification surface:

- Exact inventory: `git diff --name-only HEAD -- content`.
- Source-backed drift scan across all changed files.
- `node tooling/scripts/check-plate-doc-code-contracts.mjs`.
- `node tooling/scripts/check-plite-docs.mjs`.
- `pnpm --filter www check:docs`.
- `pnpm --filter www typecheck`.
- `pnpm lint:fix`.
- `git diff --check`.
- Scoped `autoreview --mode local --max-priority P2` over the complete docs
  patch.
- In-app Browser against the local `www` dev server.

Constraints:

- Current source outranks older docs and migration-era call shapes.
- Docs describe only the latest state; no changelog voice.
- Code examples are source-backed and copyable.
- Plugin `name` is capability identity. Persisted element types and property
  keys come from installed plugin schema portals, generated schema handles, or
  explicit document literals.
- A schema portal is read only for an installed plugin. Required capabilities
  are dependencies or explicit kit members; optional capabilities check
  `.installed`.
- Runtime source is read-only for this docs task.

Boundaries:

- Allowed writes: the 132 already-modified `content/**` files and this goal
  plan.
- Read owners: Core, Plite, feature packages, registry kits/components, and the
  `www` docs app.
- Browser target: representative guide, plugin, serialization, and Plite docs
  routes.
- N/A: no issue, tracker, PR, changeset, template, skill, or release mutation
  was requested.

Blocked condition:

Only a contradiction in current source or an external docs-app build failure
may block rendered proof. Such a blocker must name the exact file, import, and
failure and must not be papered over with an invented docs API.

## Docs lane and shape proof

| Lane | Applies | Evidence |
|---|---:|---|
| Install / get-started | yes | Installation pages lead with the working path and current package ownership. |
| Guide / system | yes | Editor/plugin guides state ownership and the shortest correct API before mechanics. |
| Behavior / runtime concept | yes | Editing behavior, rules, selection, clipboard, and schema pages separate runtime owners and stages. |
| Plugin / feature | yes | Feature pages distinguish registry kit, manual package use, and source-real APIs. |
| Serialization / conversion | yes | HTML, Markdown, CSV, and DOCX pages separate directions, runtime environment, codecs, and one-operation overrides. |
| Workflow / AI | yes | AI/collaboration pages separate required runtime plugins, optional UI, provider boundaries, and scoped portals. |
| API reference | yes | API pages use current constructors, exact fields, packages, returns, and caveats without tutorial restarts. |
| Component / registry item | yes | Preview names and registry ownership are retained where the registry intentionally exposes copied code. |
| Spec / law | no | N/A: the changed Plite concept pages are current user guides, not a new normative specification. |

## Ownership map

| Surface | Source owner used for review |
|---|---|
| Plugin constructors, portals, reads, updates, rules, codecs | `packages/core/src/**` |
| Schema, transactions, state reads, roots, selection, DOM | `packages/plite/src/**` and Plite-family packages |
| Feature APIs and inferred element/property types | matching `packages/<feature>/src/**` owner |
| Copied kits, UI components, examples, commands | `apps/www/src/registry/**` |
| MDX routes, API generation, source parity | `apps/www/src/**`, `apps/www/scripts/**`, and `tooling/scripts/**` |

Start Gates:

| Gate | Applies | Evidence |
|---|---:|---|
| Prompt contract captured | yes | All changed docs, direct fixes, docs-only boundary, proof, and handoff are recorded here. |
| Active goal created | yes | Goal created before corpus edits. |
| `docs-creator` loaded | yes | Complete skill read before the audit. |
| Target and sibling docs read | yes | English/CN peers and nearest lane siblings were reviewed with every changed page. |
| Documented source read | yes | Core, Plite, feature, registry, and app owners were inspected for each changed API family. |
| Browser decision | yes | Ordinary in-app Browser selected for local rendered proof. |
| Tracker decision | no | N/A: local docs repair only. |

Work Checklist:

- [x] Classify the mixed docs corpus by lane.
- [x] Read every changed page and its nearest relevant sibling.
- [x] Verify named APIs, options, transforms, components, imports, routes, and
      package specifiers against current source.
- [x] Repair constructor, plugin identity, schema identity, component-key,
      portal, read/update, serialization, dependency, and inferred-type drift.
- [x] Keep plugin pages in kit/manual/API order where each layer exists.
- [x] Keep conversion directions and runtime constraints explicit.
- [x] Preserve real registry previews and copied-code transparency.
- [x] Remove fake APIs, stale package ownership, dead imports, incomplete
      snippets, and invalid optional-plugin schema reads.
- [x] Run exact import/package/subpath checks and a temporary compile-only
      named-import audit; remove the temporary audit file afterward.
- [x] Run all repository docs/type/lint/diff proof.
- [x] Run P2 autoreview until it reports zero actionable findings.
- [x] Attempt browser rendering and record the exact external blocker.

Completion Gates:

| Gate | Applies | Evidence |
|---|---:|---|
| 132-file ledger | pass | 132 checked rows below; zero untracked `content/**` files. |
| Source-backed claim audit | pass | Live Core/Plite/package/registry owners inspected; stale-pattern scan has no accepted drift. |
| MDX/source parser | pass | `pnpm --filter www check:docs`; `build:source` is the current Fumadocs source command. |
| API/source parity | pass | API reference check and docs source parity pass. |
| Links/previews | pass | Fumadocs source generation and docs contract checker validate the current corpus and preview names. |
| Package/API behavior change | no | N/A: docs-only task. |
| Skill/rule change | no | N/A: no skill or rule edited. |
| Typecheck | pass | `pnpm --filter www typecheck` exits 0, including editor generation, registry source, and both TS projects. |
| Lint | pass | `pnpm lint:fix` exits 0 with no fixes on the final snapshot; 15 pre-existing oversized-artifact warnings only. |
| Diff hygiene | pass | `git diff --check` exits 0. |
| P2 autoreview | pass | Final scoped run reports “autoreview clean: no accepted/actionable findings reported”; confidence 0.89. |
| Browser render | external blocker | Next dev returns 500 before MDX rendering because `apps/www/src/__registry__/index.tsx:2963` imports missing `@/registry/components/editor/plate-types.ts`. This is outside the authorized docs-only write boundary. |
| Timed checkpoint | no | N/A: no duration requested. |

## Review fixes

- Corrected missing imports, wrong package attribution, stale constructor names,
  old portal/read/update calls, schema-property syntax, persisted-identity
  misuse, and incomplete standalone examples.
- Fixed optional-plugin portal reads across input rules, block selection,
  tabbable, slash command, AI commands, media, and related examples.
- Added real dependencies where reusable plugins require another capability.
- Corrected Node ID semantics, feature-owned inferred types, Markdown
  deserialize/serialize override identities, and `textAlign` storage.
- Rejected reviewer claims contradicted by current source: core paragraph is
  always installed, `text.string` accepts a path `NodeTarget`, HeadingRules
  intentionally derives from resolved `h1`-`h6` types, and Markdown decode
  overrides use installed feature names.

Verification evidence:

- `node tooling/scripts/check-plate-doc-code-contracts.mjs`: pass, 363 current
  docs files.
- `node tooling/scripts/check-plite-docs.mjs`: pass.
- `pnpm --filter www check:docs`: pass.
- `pnpm --filter www typecheck`: pass.
- `pnpm lint:fix`: pass, no final fixes.
- `git diff --check`: pass.
- Package/subpath audit: every changed-doc `@platejs/*` package and public
  subpath exists.
- Runtime named-import audit: 202 locally loadable current imports pass.
- Compile-only docs import audit: 265 unique named imports pass under the
  `www` TypeScript project; temporary source removed.
- Final stale scan: no accepted `create*Plugin`, `defineEditorExtension`,
  `targetPluginNames`, `getPluginType`, `getPluginApi`,
  `editor.api.string`, `tx.insert`, `KEYS.*`, `NODES.*`, nested
  `.plugin`, or persisted `PLUGINS.*` misuse remains.
- Final P2 command: scoped complete docs snapshot with
  `autoreview --mode local --max-priority P2`; clean, zero actionable
  findings.
- Browser attempt: `http://localhost:3000/docs/editor`; exact 500 owner is
  generated app registry import `apps/www/src/__registry__/index.tsx:2963`,
  missing `apps/www/src/registry/components/editor/plate-types.ts`.

## Exact reviewed ledger

Every row below was read against its live owner and either repaired or confirmed
current. The list is the sorted output of
`git diff --name-only HEAD -- content`.

- [x] `content/docs/(guides)/controlled.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/debugging.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/editing-behavior.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/editor-methods.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/editor-methods.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/editor.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/editor.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/form.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin-components.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin-context.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin-input-rules.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin-methods.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin-rules.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin-shortcuts.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/plugin.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(guides)/static.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(ai)/ai.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(ai)/ai.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(ai)/copilot.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(collaboration)/comment.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(collaboration)/discussion.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(collaboration)/suggestion.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/basic-blocks.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/blockquote.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/callout.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/callout.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/code-block.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/code-drawing.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/column.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/column.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/date.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/date.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/equation.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/equation.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/excalidraw.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/footnote.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/horizontal-rule.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/link.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/legacy-list-model.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/media.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/media.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/mention.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/table.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/table.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/toc.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/toggle.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(elements)/toggle.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(combobox)/combobox.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(combobox)/slash-command.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(utils)/forced-layout.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(utils)/single-block.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/(utils)/trailing-block.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/autoformat.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/block-menu.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/block-placeholder.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/block-selection.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/find-replace.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/multi-select.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/tabbable.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/tabbable.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(functionality)/toolbar.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/basic-marks.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/bold.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/code.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/highlight.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/italic.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/kbd.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/strikethrough.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/subscript.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/superscript.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(marks)/underline.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(serializing)/csv.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(serializing)/docx.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(serializing)/html.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(serializing)/html.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(serializing)/markdown.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/indent.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/indent.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/line-height.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/line-height.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/list.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/list.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/text-align.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/(plugins)/(styles)/text-align.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core/plate-components.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core/plate-editor.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core/plate-plugin.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core/plate-plugin.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/core/plate-store.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/plate.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/plite.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/resizable.cn.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/resizable.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/api/utils.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/examples/collaboration-example.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/examples/editable-voids.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/examples/preview-markdown.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/examples/version-history.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/installation/manual.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/installation/next.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/installation/node.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/installation/react.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/installation/rsc.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/meta.json` — reviewed against current owner; repaired where stale.
- [x] `content/docs/migration/plite-to-plate.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/api/nodes/editor.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/api/scrubber.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/02-nodes.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/06-commands.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/07-editor.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/08-extensions.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/11-normalizing.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/13-roots.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/15-editing-behavior.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/16-selection-and-dom.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/17-clipboard-and-paste.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/concepts/19-schema.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/libraries/plite-dom.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/libraries/plite-history/history-extension-setup.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/libraries/plite-react/editable.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/libraries/plite-react/react-editor.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/libraries/plite-yjs.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/libraries/plite.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/migration.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/walkthroughs/05-executing-commands.mdx` — reviewed against current owner; repaired where stale.
- [x] `content/docs/plite/why-this-fork.mdx` — reviewed against current owner; repaired where stale.

Phase / pass table:

| Phase | Status | Evidence |
|---|---|---|
| Intake and inventory | completed | 132 tracked, zero untracked; prompt contract frozen. |
| Source review and repair | completed | Every ledger row reviewed against live owner. |
| Verification | completed | Docs, Plite, type, lint, diff, import, and P2 review proof pass. |
| Browser proof | completed with external blocker | Exact generated registry missing-import failure recorded. |
| PR / tracker sync | not applicable | No public mutation requested. |
| Closeout | completed | Ledger and evidence frozen for goal checker. |

## Error attempts

| Attempt | Count | Resolution |
|---|---:|---|
| Full-checkout autoreview | 1 | Mandatory secret scan was blocked by unrelated shared-diff credentials; reran the same helper on an isolated complete docs patch. |
| P2 correction cycles | 8 | Fixed accepted docs findings, rejected source-contradicted findings, and stopped on the clean run. |
| Browser render | 1 | Captured the exact non-doc generated-registry missing import; no runtime source edit authorized. |
| `build:contentlayer` | 1 | Script does not exist; current owner is `www build:source`, exercised by `check:docs` and typecheck. |

## Final handoff contract

- PR: N/A; no PR requested.
- Issue / tracker: N/A; no tracker requested.
- Confidence: 98/100 for docs correctness; rendered QA is blocked before MDX
  by the exact app-registry import above.
- Docs lane: complete mixed-corpus audit, 132/132.
- Source-backed claims: pass.
- Content parser/source parity: pass.
- Links/demos/previews: static checks pass.
- Browser: exact external blocker recorded.
- Outcome: all authorized docs repairs complete.
- Caveat: browser rendering cannot turn green until the generated registry
  stops importing deleted `plate-types.ts`.

Reboot status:

| Question | Answer |
|---|---|
| Where am I? | Closeout complete. |
| Where am I going? | Goal checker, goal completion, final handoff. |
| What is the goal? | Review and repair every one of 132 changed `content/**` docs. |
| What have I learned? | Current source uses capability names, installed schema portals, feature-owned inferred types, scoped reads/updates, and feature-name/persisted-type Markdown override identities. |
| What have I done? | Completed the exact ledger, repairs, static/type proof, clean P2 review, and browser blocker diagnosis. |

Open risks:

- The `www` dev server cannot render any docs route while generated
  `apps/www/src/__registry__/index.tsx` imports deleted
  `@/registry/components/editor/plate-types.ts`. This is an app/source
  integration blocker, not a stale MDX finding, and was not changed in this
  docs-only task.
