---
review_scopes: [exports]
review_basis: [2026-10-04-exports-audit-2]
verdict: pursue
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [VISION.md, packages/platejs/src/export-compilation.spec.ts, docs/vision/common.md, docs/vision/plate.md, docs/research/decisions/export-fidelity.md, docs/research/review-records/2026-10-04-exports-audit-2.json, docs/plans/2026-09-24-document-first-export-contracts.md, packages/platejs/src/lib/plugins/html/htmlConversion.ts, packages/platejs/src/lib/plugins/html/htmlTypes.ts, packages/platejs/src/plain-text.ts, packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx, packages/platejs/src/static/internal/staticPresentation.ts, packages/platejs/src/static/authoredHtml.spec.tsx, packages/plitejs/src/core/authored-document-capability.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/create-editor.ts, packages/platejs/src/migrations/documentMigrationAuthored.internal.ts, 'content/docs/(plugins)/(serializing)/html.mdx', apps/www/src/registry/app/api/ai/command/utils.ts, packages/platejs/src/ai/react/CopilotPlugin.tsx, '!packages/platejs/src/internal/plugin/compilePlateModel.ts', '!packages/platejs/src/internal/plugin/compilePlateFormats.ts', '!packages/platejs/src/markdown/lib/internal/markdownConversion.ts', '!packages/platejs/src/markdown/lib/serializer/convertNodesSerialize.ts', '!packages/platejs/src/csv/lib/CsvPlugin.ts', '!packages/plitejs/src/authored/checkpoint.ts', '!packages/plitejs/src/dom/plugin/data-transfer-format.ts', '!packages/plitejs/src/core/persisted-document.ts', '!content/docs/api/node.mdx', '!packages/plitejs/src/interfaces/node.ts', '!packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts', '!packages/platejs/src/react/features/table/TablePlugin.tsx', '!packages/platejs/src/static/renderStaticHtml.node-props.spec.ts', '!docs/plite/research/2026-09-24-export-architecture/shards/002-final-reassessment.md', '!packages/platejs/src/static/editor/withStatic.tsx', '!packages/platejs/src/static/components/PlateStatic.tsx', '!apps/www/src/registry/components/editor/html-export.tsx', '!apps/www/src/registry/registry-editor.ts', '!content/docs/examples/export.mdx', '!apps/www/src/registry/components/editor/docx-export.tsx', '!apps/www/src/registry/components/editor/export-toolbar-button.spec.tsx', '!packages/platejs/type-tests/authored-format-contracts.ts']
review_upstreams: ['../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-changeset@e215757276357b64cf74f536552f3a5ef292fa1a', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163']
---

# Exports: one owner refuses an authored export without a projection

Status: executed; waiting on your commit of the working tree on next
Playbook: build

Pursue, superseding `2026-10-04-exports-audit-2` with the same target and new runtime proof. The adopted export law says a document with pending suggestions needs an explicit `accepted` or `proposed` projection, so the caller decides whether unapproved changes ship. Six export paths enforce it with their own copied check. The standalone `serializeHtml` has no copy. On a document holding the pending suggestion " draft", it returns `{ ok: true, data: '<p>Base draft</p>' }` with only an `authored-lossy-projection` warning, while the other six paths throw on the same document (probe log `artifacts/2026-10-12-exports-review/projection-guard-probe-a1.log`). Give the rule one private owner, the shared projection helper every one of those paths already calls, and delete the copies and their `?? 'proposed'` fallbacks. `exports` is the scope the user named and the one `review-ledger.mjs next` returned. Its member `export-toolbar-button.tsx` holds uncommitted work from the finished editor-public-naming build, which this review builds on and does not touch. `MarkdownPlugin.ts` also belongs to the in-flight `markdown` scope, whose open plan does not edit it. The plan below builds the target through the Build playbook; the design comparison also folded the detached projection step into the detached document read and cut the authored capability's unused `review` projection.

## Brief

### What will change?

Exports of a document from an editor with suggestions turned on now stop with one error until you choose whether to keep its suggestions. It is built and tested in your working tree. Word export keeps its own choice.

### What could go wrong?

An app that turns such documents into HTML on a server without choosing now gets an error, even with no suggestion yet. No code in Plate does that. A new editor export must still call the shared check itself.

## Teach

An export turns a Plate document into HTML, Markdown, plain text or Word. In an editor with suggestions turned on, every document keeps a record of its suggestions, even before anyone suggests anything. Exporting such a document means picking a version. Accepted leaves the suggestions out, and proposed keeps them in. Plate refuses to guess, because guessing either loses work or ships unapproved text.

Today each export path checks that rule on its own, with its own copy and wording. One copy is missing. The server-side HTML function quietly keeps the suggestions and only adds a warning, while the editor's own HTML export stops with an error on the same document.

The fix moves the rule into the one helper every export already uses to pick the version. The copies go away, the missing copy no longer matters, and a new export path gets the rule without writing its own check.

## Public API

A detached HTML export of a document with authored metadata and no valid projection stops returning the suggestion as approved text. Every other semantic and static export of such a document throws the same message, for a missing value, `null` or any value other than the two choices.

```ts before
// docs/plans/artifacts/2026-10-12-exports-review/projection-guard.probe.test.ts
const result = serializeHtml(document, { plugins });
// { ok: true, data: '<p>Base draft</p>', diagnostics: [authored-lossy-projection] }
```

```ts after
// packages/platejs/src/export-compilation.spec.ts
expect(() => serializeHtml(editor.read.value(), { plugins })).toThrow(
  projectionRequired
);
```

Each semantic and static `projection` option keeps its type and gains the same JSDoc, which `renderStaticHtml` alone has today.

```ts before
// packages/platejs/src/lib/plugins/html/htmlTypes.ts
export type HtmlSerializeOptions = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  plugins: readonly RuntimePluginReference[];
  projection?: 'accepted' | 'proposed';
  schema?: EditorApplicationSchema;
}>;
```

```ts after
// packages/platejs/src/lib/plugins/html/htmlTypes.ts
export type HtmlSerializeOptions = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  plugins: readonly RuntimePluginReference[];
  /**
   * Version of an authored document to export. `accepted` drops pending changes
   * and `proposed` applies them as plain content. Either choice adds an
   * `authored-lossy-projection` warning while changes are pending. Required
   * when the document has authored metadata, which every document from an
   * editor with the authored plugin carries, even with no pending change.
   * Omitting it or passing any other value then throws, and so does a valid
   * value when `plugins` lacks the authored plugin. A document without authored
   * metadata ignores it.
   */
  projection?: 'accepted' | 'proposed';
  schema?: EditorApplicationSchema;
}>;
```

## Main changes

- `projectFormatDocument` in `packages/platejs/src/lib/editor/withPlite.ts` owns the rule. It takes a required `projection: 'accepted' | 'proposed' | undefined`, returns a clean document unchanged, and for a document with authored metadata throws the shared `TypeError` unless `projection` is `accepted` or `proposed`, before it checks for the authored plugin. That one condition covers a missing value, `null` from a JSON body and any other value. `projectPlateFormatDocument` forwards the editor paths' option unchanged.
- `withPlateFormatCompilation` drops `projectDocument`. Its `readDocument(document, projection, read)` asserts the input, projects it through the rule, then clones and binds the projected document, and hands `read` the state, the owned document and the projection diagnostics. A detached serializer cannot read an authored document without passing the rule.
- The four copied checks in `HtmlPlugin.ts`, `MarkdownPlugin.ts`, `plain-text.ts` and `renderStaticHtmlWithOverrides.tsx` and the seven `?? 'proposed'` fallbacks leave. Each path forwards the caller's option.
- The authored capability's `project` takes only `accepted` or `proposed` and returns `{ diagnostics, document }`. Its `review` branch, the result's `review` field and the clean result's `review: document` leave (`packages/plitejs/src/core/authored-document-capability.ts`, `packages/plitejs/src/authored/authored.ts`).
- Editor-side paths still reach the rule by calling `projectPlateFormatDocument`. The rule is structural only for detached reads. A future editor method that builds a view on a raw authored document could skip it; the rule's JSDoc names that entry point.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| The missing-projection rule | Plate | `platejs`, private `lib/editor/withPlite.ts` | Plate owns format policy, and every semantic and static export already projects there |
| Projection inside the detached document read | Plate | `platejs`, private `withPlateFormatCompilation` | One call gives a detached serializer the projected document and its diagnostics |
| Authored projection with only `accepted` and `proposed` | Plite | `plitejs` core, through `plitejs/internal` | The neutral mechanics stay in Plite; the review input had no caller since HTML and Markdown lost their review projections |
| DOCX projection | Plate | `platejs/docx/export` | Unchanged: `review` also decides whether a retained source returns unchanged |

## Hard cuts and app migration

Standalone `serializeHtml` stops defaulting an authored document to its proposed version. Every document from an editor with the authored plugin carries authored metadata, even before any suggestion (`panel-plan-1/premises-a1.log`), so the refusal reaches every such document, as the other six paths already do. No first-party caller relies on the default. The copied export menu passes a projection, and the AI, Copilot and server-example callers pass documents without authored metadata. An app that relied on it passes the projection it wants:

```ts
const result = serializeHtml(document, { plugins: EditorKit, projection: 'proposed' });
```

The editor HTML method, both Markdown paths, both plain-text paths and `renderStaticHtml` keep refusing, with the shared message instead of their format messages. Detached HTML, the editor HTML method and `renderStaticHtml` also start refusing `projection: null`, which they turn into the proposed version today, while Markdown and plain text already refuse it. Any other string, such as a misspelled choice, now throws on every path instead of shipping the proposed version. Code that matched the old message text matches the new one. `projectDocument`, the capability's `review` input and its result's `review` field are first-party internals with no public import, so no app changes. The unreleased changeset `.changeset/document-first-export-contracts.md` already says every serializer requires an explicit authored projection; the build narrows its "when proposals are present" to "for a document with authored metadata", so no new changeset is needed. The detached `serializeHtml` in `platejs/html` was added on 2026-09-27 (`htmlConversion.ts`), after `platejs@54.0.0-beta.1`, the prerelease version in `packages/platejs/package.json`, so its default never reached a published release. That comes from git history, where the version landed on 2026-08-30 with no later bump; npm was not checked.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| After this verdict | Design the fix, plan it, get the plan reviewed, build it and get the build reviewed, all in this run (look) | Stop here with the verdict written | hold | big |
| Server HTML export of a document with unapproved suggestions, when nobody chose | Stop with the same error the other exports give (look) | Keep putting the suggestions in, with a warning | keep html default | big |
| Word export | Keep asking for a choice on every Word export, since that choice also decides whether an imported Word file comes back untouched | Ask only when the document has suggestions | optional word projection | small |
| Error wording | One message for every export that refuses, naming the option and its two choices | Keep a separate message per format | format messages | small |
| A null or misspelled choice from plain JavaScript | Refuse it with the same error, since only the two choices say which version ships | Let it fall through to the version with the suggestions, as detached HTML does today | unchecked projection | small |
| A document from a suggestions-enabled editor with no suggestion yet | Still require a choice, so a missing choice fails the first time, not later when a suggestion appears (look) | Export it without a choice and refuse only while suggestions are pending | refuse only pending | big |
| What AI reads from the whole editor | Leave it to the AI review, since an AI prompt is not a file export | Make AI prompts ask for a choice too in this build | ai projection now | small |
| The new last step that offers the next review as a one-click task | Ship it without a side-by-side trial in fresh sessions, since it adds one step at the end of a run (look) | Run the old and new instructions side by side first | trial close hand-off | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Missing-projection rule | Four copies; none in detached HTML | One check in `projectFormatDocument` | Plate, `withPlite.ts` | One owner; the measured gap closes | Each path forwards its option | `export-compilation.spec.ts` refusal rows; mutation of the check | Old message text changes | rearchitect |
| `?? 'proposed'` fallbacks | Seven | None | None | They hide a missing choice | Deleted with the copies | Same rows | None | cut |
| Projection value on an authored document | Four checks refuse a missing value, two falsy and two `=== undefined`; HTML and static send `null` and other values to the proposed version | The same condition refuses anything but `accepted` or `proposed` | Plate, `withPlite.ts` | The law names exactly two choices | None | The JSON refusal rows for `null` and a misspelled choice | `null` and misspelled callers now get an error | rearchitect |
| Detached `projectDocument` | A context member beside `readDocument` | Folded into `readDocument` | Plate, `withPlateFormatCompilation` | A detached serializer cannot skip the rule | Three callers: HTML, Markdown, plain text | Same rows, `pnpm --filter platejs typecheck` | None | cut |
| Capability `review` input and result field | `'accepted' \| 'proposed' \| 'review'`, plus `review` | `'accepted' \| 'proposed'`, no `review` | Plite authored | No caller passes `review` and nothing reads the field | None outside the two packages | Both packages' typechecks and authored tests | None | cut |
| DOCX projection | Required, projected through `platejs/authored` helpers | Unchanged | `platejs/docx/export` | `review` decides retained-source exactness | None | Existing DOCX specs pass | None | keep |
| AI whole-editor prompt context | Drops `meta` before Markdown | Unchanged here | `ai` scope | Not a format export | Open work below | None | Prompt reads one fixed version | defer |

## Design

`architect` ran three runners on one outcome-only brief: Opus at high effort, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh. All three answered with the same shape. The rule sits in Plate's `projectFormatDocument` with a required `projection | undefined` parameter, the detached `projectDocument` folds into `readDocument`, and the capability's `review` input and field leave. A blind Opus cross-judge picked the Opus candidate as the base for the fewest concepts and the only stated editor-side limit (22, 21 and 18 of 24); the lead's own scores, written first, ranked it top too. The build grafts the fuller option JSDoc and accepted-output cases from the Sol candidate, and a mutation control from the Astra candidate.

The architect pick first left projection values unchecked. The plan panel's first round reversed that, and all three seats agreed. Markdown and plain text refuse `null` today through a falsy check, while HTML and static ship the proposed version for it. Any value other than `accepted` reaches the proposed version too. The shared condition now refuses anything but the two choices, so the value check is the same check, not a second one. The plan leaves out four other proposals. Forwarding a projection through AI prompt context, which the Astra candidate wanted, loses because a prompt is not a format export (`plate.md` lines 1202 to 1204). A test of the private `readDocument` repeats the public refusal rows. `CODING_STANDARDS.md` bans `Parameters<>` typing. The challenge delta is improved, because the detached read now holds the rule and the dead `review` projection leaves.

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`), in this checkout on `next`, with no commit.

- [x] Write the rows in `packages/platejs/src/export-compilation.spec.ts`: a refusal `it.each` over the seven paths (detached HTML, Markdown and plain text, the editor HTML and Markdown methods, `serializePlainText(editor)` and `renderStaticHtml(editor)`) on the probe's document; one refusal for a document from an editor with the authored plugin and no suggestion; two refusals for a projection read from JSON, `null` and the misspelled `"accepted "`; and an accepted-output `it.each` asserting the text and the `authored-lossy-projection` diagnostic for the five paths no other spec covers (detached HTML, Markdown and plain text, the editor HTML method, `serializePlainText(editor)`). Drop the duplicate refusal line from `MarkdownPlugin.spec.ts` and keep its output assertions. Proof: `proof-worktree.mjs --with` the spec at `HEAD` with `--expect-fail` on the detached HTML refusal row, then the same spec passing on the final tree.
- [x] Move the rule into `projectFormatDocument`, forward `projection` through `projectPlateFormatDocument`, and fold `projectDocument` into `readDocument` in `withPlite.ts`. Proof: the refusal rows pass, and `pnpm --filter platejs typecheck` passes.
- [x] Delete the four copied checks and seven fallbacks in `htmlConversion.ts`, `HtmlPlugin.ts`, `MarkdownPlugin.ts`, `plain-text.ts` and `renderStaticHtmlWithOverrides.tsx`, forwarding each caller's option. Proof: `git grep` finds no `?? 'proposed'` in those files, and the focused specs below pass.
- [x] Narrow the authored capability to `accepted` and `proposed` without the `review` field in `authored-document-capability.ts` and `authored.ts`. Proof: `pnpm --filter plitejs typecheck` and the plitejs authored tests pass.
- [x] Add the shared JSDoc to each semantic and static `projection` option in `htmlTypes.ts` (two types), `markdown/lib/types.ts`, `plain-text.ts` and `renderStaticHtml.tsx`. Proof: a read of each declaration.
- [x] Run three mutants of the check with `.agents/pstack/mutate.mjs` on a frozen commit of the final tree: removing it, narrowing it to `projection === undefined`, and narrowing it to a falsy check. Proof: the first fails the detached HTML refusal row, the second the `null` row and the third the misspelled row, each with its own assertion text, and the control passes.
- [x] Run the focused specs: `export-compilation.spec.ts`, `MarkdownPlugin.spec.ts`, `authoredHtml.spec.tsx`, `plain-text.spec.ts`, `renderStaticHtml.node-props.spec.ts`, the DOCX export specs and the plitejs authored specs. Proof: each log ends with its pass count and `exit=0`.
- [x] Through `plate-docs`, state the rule once in each page that teaches projections or a live-editor export: `content/docs/(guides)/authored-changes.mdx`, `content/docs/(guides)/serializing.mdx`, `content/docs/(plugins)/(serializing)/html.mdx` and the live-editor recipe in `content/docs/(guides)/static.mdx`, with their `.cn.mdx` twins, and check that `markdown.mdx` and its twin already say it. `installation/node.mdx` already passes a projection and `installation/rsc.mdx` renders a static editor without the authored plugin. Proof: the edited text read back, then `pnpm --filter www build:registry` and its `--check`.
- [x] Through `best-api repair`, state the rule in `docs/vision/plate.md` beside "Authored projection is an option on the ordinary format operation", run `tooling/scripts/teaching-sweep.mjs` on the old messages and on the export function names, narrow the changeset sentence in `.changeset/document-first-export-contracts.md`, and update `2e865a0bc4:docs/research/decisions/export-fidelity.md`. Proof: the sweep output with no live hit left.

## Proof

The refusal rows fail at `HEAD` for the measured defect and pass on the final tree; the mutants show they test the one check and that each JSON row catches the weaker guard it names. A path that hard-codes `proposed` fails its refusal row, and a path that drops the caller's choice fails its accepted-output row, which also checks that the projection diagnostic survives the new detached read. Editor Markdown and static HTML keep their accepted and proposed output checks in `MarkdownPlugin.spec.ts` and `authoredHtml.spec.tsx`. Existing specs cover clean documents with no projection (`export-compilation.spec.ts` "serializes formats without activating plugins", `MarkdownPlugin.spec.ts` "serializes the document a view reads by default") and DOCX's already projected static render (the DOCX export specs). No browser run, because the copied export menu always passes a projection and draws nothing new.

## Completion Gates

The build runs on this page's Pursue verdict, which the owner's "/verdict exports" asked for, under Autopilot, from base `6fa1169c5e` on `next`. Its run directory is `docs/plans/artifacts/2026-10-12-exports-review/`, and its packet is the files Steps name.

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:blast-radius` before code, because the plan changes a public export's behavior | yes | `docs/plans/artifacts/2026-10-12-exports-review/blast-radius.md`, this build before code; no first-party caller reaches the two changed inputs |
| Each refusal's state reproduced through the public entry before building it | yes | `docs/plans/artifacts/2026-10-12-exports-review/pre-build-rows-a3.log`: all ten refusal rows fail on the unbuilt source |
| `verify` loaded before the first proof gate | yes | loaded by this build on 2026-10-12 before the pre-edit baseline, with its command recipes read; `docs/plans/artifacts/2026-10-12-exports-review/build/baseline-platejs-a1.log` |
| Hard-cut sweep of callers, exports, tests, docs and examples for the default and the old messages | yes | `docs/plans/artifacts/2026-10-12-exports-review/build/grep-fallbacks-a1.log`, `docs/plans/artifacts/2026-10-12-exports-review/build/teaching-sweep-a1.log` and the blast-radius caller census |
| `best-api repair` for the changed export behavior | yes | loaded by this build; `docs/vision/plate.md` lines 1204 to 1210, the decision page, the changeset sentence and the sweep |
| `plate-docs` on every docs page the plan names | yes | loaded by this build before the docs edits; `docs/plans/artifacts/2026-10-12-exports-review/build/build-registry-a1.log` and `docs/plans/artifacts/2026-10-12-exports-review/build/build-registry-check-a1.log` |
| `pnpm check` steps the edits reach, before the acceptance runs | yes | lint-baseline, plite-bridge, public-types and type-tests pass; core-audits fails the same 11 findings at `HEAD` (`docs/plans/artifacts/2026-10-12-exports-review/build/core-audits-head-a1-a1.log`); review-ledger fails only on other plans' pages; knowledge flagged this subject's broken decision link, fixed in the fold; logs `docs/plans/artifacts/2026-10-12-exports-review/build/check-*-a1.log` |
| `pstack:thermo-nuclear-code-quality-review` per shared-code slice | no | skip: the `api-build` panel on the diff is owed from the first slice |
| A slice freeze after each slice's fixes | yes | one slice, frozen as `721e0765dd` before the diff panel |
| `oxlint --type-aware` on the task's files before the panel freeze | yes | `docs/plans/artifacts/2026-10-12-exports-review/build/oxlint-a2.log` on 13 of 13 files, then `docs/plans/artifacts/2026-10-12-exports-review/build/lint-task-a1.log` |
| Changeset for the platejs behavior change | yes | `.changeset/document-first-export-contracts.md`, unreleased, now says authored metadata; no new changeset |
| `api-build` panel on the diff | yes | one round on `721e0765dd`, no critical finding; the decision log holds its rows |

## Close

### Reversals and deviations

- The plan panel's first round reversed the architect pick that left projection values unchecked. The shared condition refuses anything but `accepted` or `proposed`, and the JSON rows for `null` and a misspelled choice prove it.
- The diff panel scoped the new Vision sentence and the decision page to HTML, Markdown, plain text and static HTML, because DOCX keeps its own required projection, which also offers `review`.
- The `no-comments` pass reshaped the projection JSDoc after the plan. `accepted` drops pending changes, `proposed` applies them as plain content, both warn, and each option type names its own holder of the authored plugin. The Public API fence shows the shipped text, and its first after fence now cites the spec row instead of the probe.
- The Markdown spec's authored case lost its refusal line as planned, and its title now names what it still checks.
- The Verdict playbook's `how` route did not run. The lead read the export owners and every first-party caller itself, so no explorer seat mapped them first.
- `/pstack:correct` did not run on the `as unknown as` cast class, although plan round 1's cast warning matched that rule-only row. This build added no such cast, and the class already has open work in `docs/plans/topics/correct.md`, so the pass stays open below instead of growing this change.

### What landed

Everything is in the working tree on `next`, uncommitted, for the owner to commit. `projectFormatDocument` in `packages/platejs/src/lib/editor/withPlite.ts` owns the one refusal, `readDocument` takes the projection, and `projectDocument` is gone. The copied checks and `?? 'proposed'` fallbacks left `packages/platejs/src/lib/plugins/html/htmlConversion.ts`, `HtmlPlugin.ts`, `packages/platejs/src/markdown/lib/MarkdownPlugin.ts`, `packages/platejs/src/plain-text.ts` and `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx`. The authored capability in `packages/plitejs/src/core/authored-document-capability.ts` and `packages/plitejs/src/authored/authored.ts` takes only `accepted` or `proposed`. All five option types carry the projection JSDoc, including `packages/platejs/src/lib/plugins/html/htmlTypes.ts`. The docs pages, their Chinese twins, `docs/vision/plate.md`, `2e865a0bc4:docs/research/decisions/export-fidelity.md` and the changeset state the rule, and `pnpm --filter www build:registry` regenerated the registry output under `apps/www/public/r`.

### Proof and limits

- At `HEAD`, the final `packages/platejs/src/export-compilation.spec.ts` fails its detached HTML and misspelled-JSON refusal rows, and on the build it passes 16 of 16 (`build/spec-at-head-a1-a1.log`, `build/focused-platejs-a2.log`).
- Three mutants of the shared check each fail the rows they name. Removing it fails all ten refusal rows, narrowing it to `=== undefined` fails the `null` and misspelled rows, and narrowing it to a falsy check fails only the misspelled row (`build/mutate-a1.log`).
- The focused specs pass on the final bytes: 149 in 12 platejs files, including `packages/platejs/src/static/authoredHtml.spec.tsx` and the DOCX export specs, and 53 in 5 plitejs authored files. The platejs, plitejs and contract typechecks pass, and oxlint and `lint:task` are clean on the 13 code files.
- The spec typecheck config is red at `HEAD`, and the task's spec files show the same errors there. The one extra error is in `LinkRules.spec.tsx`, which this run did not touch; that another session's link work causes it is inferred, because no control isolated this run's edits. `pnpm check core-audits` fails the same 11 findings at `HEAD`, all in files this run did not touch.
- No browser run: the copied export menu always passes a projection and draws nothing new. The accepted-output rows pass at base too, so they guard forwarding through the new read, and no mutant targeted that forwarding.
- The predicted benefit held for the four formats. Standalone `serializeHtml` refuses without a choice, the copies and fallbacks are gone, all seven paths give one message, and a new detached export inherits the rule through `readDocument`. A new editor-side export still has to call `projectPlateFormatDocument` by convention.

### Counts

Of 22 items, the 9 steps, 12 completion gates and the `/pstack:correct` gate, 20 are done, 1 is skipped (the per-slice code-quality review, because the `api-build` panel was owed), 1 is open (the correction pass), and none is partial or blocked. The plan panel ran two rounds and the diff panel one; the only critical finding, the unchecked projection value, was applied in plan round 1.

### Open work

- Run `/pstack:correct` on the `as unknown as` cast class. owner: zbeyens, through the open cast row in `docs/plans/topics/correct.md`. stop: that pass lands a lint or records why the row stays rule-only.
- Plite's public `projectAuthoredDocument` still returns the proposed version for any value other than `accepted`. owner: zbeyens, through the `authored` ledger scope's next review. stop: that review rules whether it refuses other values.
- Three editor-side exports project, then build a view with an `as unknown as Editor` cast. owner: zbeyens, through the `exports` ledger scope's next review. stop: the next editor-side export method lands, or the cast sample in `docs/plans/topics/correct.md` settles the type `createEditorView` returns.
- The AI chat plugin's whole-editor Markdown context drops `meta`. owner: zbeyens, through the `ai` ledger scope's next review. stop: that review rules on the projection AI prompt context reads.

### Next

`review-ledger.mjs next` now returns `conversion-boundary`, "Conversion laws and incremental Markdown", and the ledger shows `exports` adopted by this plan.

### Attention

reviewed by gpt-6.1-sol

- `/pstack:correct` was due on the cast class and did not run. It is open work above, not done.
- The `how` route did not run at intake. The lead read the code itself, so one reader mapped the code for the verdict, and the architect runners and three panels checked that map later.
- The blast-radius row first understated the change. A misspelled projection also starts refusing on Markdown and plain text, not only on HTML and static HTML; the writeup and its log row are corrected, and no first-party caller passes one.
- The extra spec-typecheck error in `LinkRules.spec.tsx` is attributed to other sessions by location only.
- The claim that detached `serializeHtml`'s default never shipped comes from git history: the `54.0.0-beta.1` version landed on 2026-08-30 and the function on 2026-09-27, with no later bump. npm was not checked.
- The log gained rows for the decisions it missed: the core-audits attribution, the knowledge link repair, the fence citation, the skipped browser run and the reason this review ran.

### Reflect

After the owner's correction about the missing next-item task, one Opus reviewer read the close and the repair through the judgment, tooling and divergent lenses (`reflect/prompt.md`).

No reflect lesson was applied. None was a script crash fix or a rewording that adds no words, the two kinds this project applies without the owner. Two defects in this run's own work were fixed as part of the repair. The hand-off paragraph now says the offer is the ledger's next item, so a Stop still adds no task of its own. The todo list now closes each item against its evidence instead of a bulk tick.

Rejected:

- Run `/pstack:correct` now because the gate is cheap. The class pass sorts 212 casts and lands a lint or a rule-only record, which is its own change with its own review, so it stays open work.
- Keep the decision-trail review for unattended runs. That is already the rule, and this run's review changed three claims.

Backlog, each with owner: zbeyens and stop: the owner takes or drops it:

- Let the Plan pages rule's link-only reply admit a line that a project playbook's close adds, in the shared `udecode/dotai` source.
- Offer a Defer's investigation, and a Pursue whose next owner is elsewhere, as one-click tasks too.
- Reconcile the Verdict playbook's move into this checkout with `AGENTS.md`'s Git rule, which keeps a worktree session in place and has it hand back a patch.
- Give `review-ledger.mjs` a mode that prints the hand-off brief, so the close needs no throwaway parser of `next` output.
- Give `review-ledger.mjs check` and the knowledge check a per-plan filter, so a close can tell its own failures from other plans'.
- In pstack's `blast-radius`, list each replaced guard's predicate per path before naming the inputs whose outcome changes.
- In the shared `decisions-check.mjs`, keep the lead row when an append shares a message with another tool call, and never prompt a backward stage rename.
- In the shared `close.md`, log every decision already made before freezing for the trail review, and have the close check read the run's todo file.
- In `workflow-change.md`, write down when a workflow change is small enough to skip side-by-side trials.

### Inputs

The review read `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `2e865a0bc4:docs/research/decisions/export-fidelity.md`, `docs/research/review-records/2026-10-04-exports-audit-2.json` and `docs/plans/2026-09-24-document-first-export-contracts.md`. The build changed or proved through `packages/platejs/src/export-compilation.spec.ts`, `packages/platejs/src/lib/plugins/html/htmlConversion.ts`, `packages/platejs/src/lib/plugins/html/htmlTypes.ts`, `packages/platejs/src/plain-text.ts`, `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx`, `packages/platejs/src/static/authoredHtml.spec.tsx`, `packages/plitejs/src/core/authored-document-capability.ts` and `packages/plitejs/src/authored/authored.ts`, and checked `packages/platejs/src/static/internal/staticPresentation.ts`, `packages/plitejs/src/create-editor.ts`, `packages/platejs/src/migrations/documentMigrationAuthored.internal.ts`, `content/docs/(plugins)/(serializing)/html.mdx`, `apps/www/src/registry/app/api/ai/command/utils.ts` and `packages/platejs/src/ai/react/CopilotPlugin.tsx` as unchanged callers.

## Open work

- The AI chat plugin's whole-editor Markdown context rebuilds `{ children, roots }` and drops `meta`, so it never meets this rule (`packages/platejs/src/ai/react/AIChatPlugin.ts` lines 462 to 470). This run did not check which editor's state it reads. Which version an AI prompt should read is the `ai` scope's question. owner: zbeyens, through the `ai` ledger scope's next review. stop: that review rules on the projection AI prompt context reads.
- Plite's public `projectAuthoredDocument` still returns the proposed version for any value other than `accepted` (`packages/plitejs/src/authored/format.ts` lines 386 to 410). Plate's rule refuses such values before they reach it, so no Plate export ships them, but a direct caller from plain JavaScript still can. owner: zbeyens, through the `authored` ledger scope's next review. stop: that review rules whether `projectAuthoredDocument` refuses values other than the two choices.
- Three editor-side exports project, then build a view with an `as unknown as Editor` cast (`HtmlPlugin.ts`, `plain-text.ts` and `renderStaticHtmlWithOverrides.tsx`), so the rule is structural only for detached reads. owner: zbeyens, through the `exports` ledger scope's next review. stop: the next editor-side export method lands, or the `as unknown as` sample in `docs/plans/topics/correct.md` settles the type `createEditorView` returns, whichever comes first.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

This review supersedes `2026-10-04-exports-audit-2`. Its verdict and target hold on current source, and this page adds the runtime proof that record lacked and replaces its evidence after 24 of its fingerprinted inputs changed. It keeps that record's reopening of the seven 2026-09-27 and 2026-09-28 conversion executions, because none of them adopts this target. It retains the landed [HTML export finishing](2026-10-10-html-export-finishing.md), [presentation context](2026-10-10-html-presentation-context.md), [static repair redo](2026-10-09-html-static-repair-redo.md) and [Word owns Word](2026-10-10-html-word-owns-word.md) plans. They added `presentation` to `renderStaticHtml` and `exportDocx` and moved Word mappings, and none touched the missing-projection rule. The export fidelity decision (`2e865a0bc4:docs/research/decisions/export-fidelity.md`) states the 2026-10-04 Pursue and stays true until the build lands.

### Requirements

- Every serializer accepts one complete document and returns format data with structured diagnostics; authored projection is an option on the ordinary format operation ([plate.md](../vision/plate.md) lines 1202 to 1204).
- A document with authored metadata needs an explicit projection, so an export never includes or omits pending work unless the caller chooses ([document-first export contracts](2026-09-24-document-first-export-contracts.md) line 248; the export fidelity decision's Audit of 2026-10-04).
- Detached operations compile supplied declarations without activating plugins or constructing an editing runtime ([plate.md](../vision/plate.md) lines 1204 to 1206).
- Copied UI owns the projection choice, the document shell and the filenames (export fidelity decision, Ownership).
- DOCX `review` writes Word revisions, and a retained DOCX source returns unchanged only under `review` ([exportDocx.tsx](../../packages/platejs/src/docx/export/lib/exportDocx.tsx) line 464).
- Hard cuts beat compatibility shims ([VISION.md](../../VISION.md) Invariants 1). A private bridge stays small, with one owner ([common.md](../vision/common.md) Boundary Law).
- The user asked to build on the uncommitted editor-public-naming state and never revert it, to work in this checkout, and never to commit or push `next`.

### Current source

- `projectFormatDocument` ([withPlite.ts](../../packages/platejs/src/lib/editor/withPlite.ts) lines 1207 to 1226) returns a clean document unchanged and otherwise calls the authored capability's `project`. `projectPlateFormatDocument` (line 1229) feeds it for editor methods, and `withPlateFormatCompilation`'s `projectDocument` (line 1281) for detached conversion. All seven export paths reach it, and none passes it an absent projection.
- Standalone `serializeHtml` ([htmlConversion.ts](../../packages/platejs/src/lib/plugins/html/htmlConversion.ts) lines 37 to 62) calls `projectDocument(document, options.projection ?? 'proposed')` with no check.
- The editor HTML method checks first ([HtmlPlugin.ts](../../packages/platejs/src/lib/plugins/html/HtmlPlugin.ts) lines 3939 to 3957). Markdown checks through `assertMarkdownProjection` ([MarkdownPlugin.ts](../../packages/platejs/src/markdown/lib/MarkdownPlugin.ts) lines 375, 394 and 446), plain text through `assertPlainTextProjection` ([plain-text.ts](../../packages/platejs/src/plain-text.ts) lines 40, 70 and 102), and styled HTML inline ([renderStaticHtmlWithOverrides.tsx](../../packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx) lines 46 to 50). That is four copies, four format labels and two phrasings.
- Each path then passes `?? 'proposed'`, seven fallbacks in all, which only the unguarded `serializeHtml` ever reaches with an absent projection.
- Only `MarkdownPlugin.spec.ts` line 83 tests the refusal. No test covers HTML, plain text, styled HTML or detached HTML without a projection.
- Every first-party caller that serializes a document with authored metadata passes a projection, and the copied export menu always does. The AI and Copilot callers pass `{ children }` documents with no metadata (`AIChatPlugin.ts` lines 466 to 588, `utils.ts` lines 247 and 280, `CopilotPlugin.tsx` line 156). The server example and the HTML export block render clean documents.
- `exportDocx` requires `projection` in its type and at runtime ([exportDocx.tsx](../../packages/platejs/src/docx/export/lib/exportDocx.tsx) lines 531 to 541) and projects through `projectAuthoredDocument` and `projectAuthoredReview` directly.
- The authored capability's `project` accepts `'review'` ([authored.ts](../../packages/plitejs/src/authored/authored.ts) lines 1308 to 1316; [authored-document-capability.ts](../../packages/plitejs/src/core/authored-document-capability.ts) lines 22 to 55), but its one caller is `projectFormatDocument`, whose callers pass only `accepted` or `proposed`. No caller reads the projection's `review` field. HTML and Markdown lost their review projections on 2026-09-26, so this branch is what that cut left behind.
- The probe ran from source. Its log lists `htmlConversion.ts`, `withPlite.ts`, `MarkdownPlugin.ts`, `plain-text.ts`, `renderStaticHtmlWithOverrides.tsx` and Plite's `authored/format.ts` as loaded, and no `dist` file.

The plan's Close marks this predicted benefit held or falsified. Standalone `serializeHtml` stops exporting unapproved suggestions without a choice, four copied checks and seven fallbacks leave, every semantic and static export gives one message, and a new detached export path inherits the rule.

### Lanes

- Keeping the current design loses. The probe shows one public serializer shipping a pending suggestion as approved text while six siblings refuse.
- The strongest deletion drops the rule everywhere and defaults to proposed with the warning. It loses. It deletes four checks, but it reverses the law that the caller decides whether unapproved work ships, and a warning is easy to drop on a server. No current job asks for the default; every first-party export of an authored document already chooses.
- A fifth copy in `serializeHtml` loses. It fixes the symptom and keeps the hand-copying that let this one escape.
- One private owner in the shared projection helper, with the copies and fallbacks deleted, wins. Every path already calls it, and no public signature changes.
- Requiring `projection` on every call, as DOCX does, loses for the semantic formats. A clean document has one projection, so every clean caller would pay for the authored case.
- Making DOCX's projection optional for clean documents loses. DOCX's `review` also decides whether a retained source returns unchanged, so a clean DOCX export still has a real choice.
- Branding an authored document type so TypeScript demands the projection loses. Documents arrive from JSON persistence typed as `Value`, so the brand would need a parse at every load.
- Giving `renderStaticHtml` and `exportDocx` a document plus plugins instead of an editor still loses. The 2026-10-10 presentation work kept the live editor as the owner of the document, schema and plugin settings, and `plate.md` lines 1306 to 1313 state that law.

Where the rule sits inside the helper, Plate's `projectFormatDocument` or Plite's authored capability, and whether the dead `review` branch of the capability leaves too, go to the design comparison.

### Dependents

`lookup exports` lists no dependent scope, so no code outside plitejs imports this scope's members. The related `html`, `markdown`, `documents` and `media` scopes share files but import nothing from this scope's members.

### Proof limits

The lead read the source and ran one source-mode Bun probe of seven paths on one authored document (`artifacts/2026-10-12-exports-review/projection-guard.probe.test.ts`, log `projection-guard-probe-a1.log` beside it). No browser run happened, because the copied export menu always passes a projection and shows no change. Whether an external app relies on the `serializeHtml` default is unknown. The editor comparison read source only, and CKEditor 5's track changes is a commercial plugin outside its checkout.
