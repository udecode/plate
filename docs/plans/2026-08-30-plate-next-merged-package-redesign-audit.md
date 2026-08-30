# Plate Next merged package redesign audit

Objective:
Audit every surviving Plate workspace package and every public `platejs`
JavaScript entrypoint after PR #5115, then rank the next Plite-era hard cuts and
major redesigns. Give Comments a complete ownership verdict.

Completion threshold:
- Classify all 4 surviving workspace packages.
- Classify all 60 public `platejs` JavaScript entrypoints from the merged DAG.
- Verify the headless, SSR, and client runtime split and inspect private DAG
  owners for public reachability.
- Rank every material hard-cut or owner-correction candidate with source
  evidence, target owner, deletion path, and explicit deferrals.
- Cover the Comments document model, service boundary, editor projection,
  React/UI state, persistence, permissions, and legacy-data extraction.
- Record the complete inventory in a durable linked artifact.

Verification surface:
- Immutable audit snapshot: `origin/next` at
  `494d90c495092d25941b6f57ca7ebf97b5db13dd`, the merge commit for PR #5115.
- Package proof: workspace manifests, package exports, entrypoint DAG, runtime
  declarations, dependency edges, source owners, and representative consumers.
- Deep source reads: Comments, registry discussions, Plite annotations,
  Suggestions, DnD, Yjs, cursor overlays, Find Replace, AI Chat, Tabbable,
  Juice, Media, Resizable, Combobox, Migrations, and Floating.
- Final artifact:
  [public owner inventory](artifacts/plate-next-merged-package-redesign-audit/public-owner-inventory.md).
- This is a read-only architecture audit. Runtime tests and browser proof do
  not apply because no editor code or public API changed.

Constraints:
- Judge the best Plate v2 shape on Plite, not compatibility with obsolete
  Plate or Slate machinery.
- Plite owns editor substrate. Plate owns editor product semantics, composition,
  and its public distribution paths.
- Run the delete, merge, inline, and owner-move counterfactual before preserving
  a plugin, entrypoint, or package.
- Do not recreate npm packages for Turbo granularity.
- Do not implement the redesigns during this audit.
- Keep the local checkout on `main`; audit the merged `origin/next` snapshot
  because PR #5115 merged into `next`, not `main`.

Boundaries:
- In scope: all 4 workspace packages, all 60 public `platejs` JavaScript
  entrypoints, all 15 private DAG owners needed to validate reachability, the 9
  public `plitejs` entrypoints, and the 5 public `@platejs/test` entrypoints.
- In scope: architecture, ownership, package/entrypoint shape, runtime lane,
  dependency pressure, and next-action ranking.
- Out of scope: implementation, public API design details, migrations, docs
  rewrites, changesets, runtime tests, CI, browser proof, commit, and push.
- Follow-up API call shapes route to `best-api`; accepted adoption plans route
  to `plate-plan` before implementation.

Blocked condition:
The audit would be blocked only if the merged ref, manifests, DAG, or source
owners were unavailable. All were readable from the immutable `origin/next`
snapshot, so no blocker remains.

Start Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Merged source is identifiable | yes | PR #5115 resolves to `494d90c495092d25941b6f57ca7ebf97b5db13dd` on `origin/next`. |
| Local branch request is satisfied | yes | The checkout was switched to and fast-forwarded on `main`. |
| Doctrine is current | yes | Read merged `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md`. |
| Product mutation is authorized | no | The user asked what to redesign next; this pass is an audit only. |

Work Checklist:
- [x] Switch the local checkout back to `main` and fast-forward it.
- [x] Resolve the merged PR ref and correct the audit source from `main` to
  merged `origin/next`.
- [x] Read Plate/Plite ownership doctrine and the Plate Next audit law.
- [x] Freeze an immutable source snapshot for repeatable inspection.
- [x] Inventory all surviving workspace packages.
- [x] Inventory every public `platejs` JavaScript entrypoint and runtime lane.
- [x] Check private DAG owners and `plitejs` / `@platejs/test` public exports.
- [x] Measure entrypoint source size, dependencies, and internal consumers.
- [x] Deep-read every high-pressure candidate and its actual owner/callers.
- [x] Compare Comments and Suggestions with Plite annotations and changes.
- [x] Run the hard-cut counterfactual across every inventory row.
- [x] Rank the next redesign program and record explicit non-targets.
- [x] Write the complete package and entrypoint evidence artifact.
- [x] Validate this plan mechanically before closing the goal.

Phase / pass table:

| Phase | Status | Evidence |
|---|---|---|
| Branch and source resolution | complete | Local checkout is `main`; merged audit source is immutable `origin/next`. |
| Doctrine and topology | complete | Read the merged vision owners and parsed all package/export/DAG manifests. |
| Complete inventory | complete | 4 of 4 packages and 60 of 60 `platejs` JavaScript entrypoints classified. |
| Candidate deep reads | complete | Review, DnD, collaboration, projection, AI, navigation, and codec owners inspected. |
| Hard-cut ranking | complete | Eight ranked redesign packets plus explicit non-targets recorded. |
| Closeout | complete | Durable artifact written and mechanical goal validation executed. |

Coverage ledger:

| Surface | Expected | Actual | Missing | Extra |
|---|---:|---:|---:|---:|
| Workspace packages | 4 | 4 | 0 | 0 |
| `platejs` public JavaScript entrypoints | 60 | 60 | 0 | 0 |
| Headless entrypoints | 30 | 30 | 0 | 0 |
| SSR entrypoints | 1 | 1 | 0 | 0 |
| Client entrypoints | 29 | 29 | 0 | 0 |
| Private `platejs` DAG owners | 15 | 15 | 0 | 0 |
| `plitejs` public entrypoints | 9 | 9 | 0 | 0 |
| `@platejs/test` public entrypoints | 5 | 5 | 0 | 0 |

Ranked verdict:
1. Delete the Comments plugin model. Store threads in the app/service and
   project anchors with Plite annotations/widgets. Keep only a one-shot legacy
   `comment_<id>` extraction migration.
2. Replace dynamic Suggestion node properties with serializable Plite
   `DocumentChange` proposals plus annotations. Plate keeps accept/reject
   product semantics.
3. Delete React DnD and its peer stack. Reuse Plite native drag, clipboard,
   cross-editor move, drop resolution, and autoscroll primitives.
4. Move raw Yjs integration to `plitejs/yjs` and generic provider/projection
   work to `plitejs/yjs/react`; preserve thin Plate distribution proxies.
5. Add one Plite range-geometry/projection owner for cursors and Yjs. Use
   decorations for transient Find paint, annotations for durable review
   anchors, and widgets for anchored UI.
6. Split AI chat/provider/prompt/tool policy from editor-owned AI transforms.
7. Move Tabbable focus-navigation substrate to Plite React.
8. Fold the dependency-named `platejs/juice` surface into its honest HTML/DOCX
   owner and later trim broad Floating UI pass-through exports.

Explicit non-targets:
- Do not rewrite Table; its size represents real table grammar and transforms.
- Do not split Image from Media; they share one persisted media model.
- Keep Resizable optional because Media and Table both consume it.
- Do not move Callout, Date, Footnote, Layout, Media, Table, Tag, or TOC into
  the root entrypoint.
- Keep the four-package topology: `plitejs`, `platejs`, `@platejs/test`, and
  `@platejs/cli`.

Comments decision:
- Delete `BaseCommentPlugin`, `CommentPlugin`, and the registry
  `discussionPlugin` as canonical owners.
- Store thread bodies, users, permissions, resolution, and audit events in the
  application or service, never editor plugin state.
- Store durable anchors and minimal render payload in Plite annotations.
- Use Plite widgets for popover/sidebar anchors.
- Keep hover, draft, composer, and selection UI state in the React controller.
- Permit comment writes while the document is read-only.
- Make copy/paste portability an explicit application policy rather than a
  reason to mutate the document for every comment.
- Extract legacy `comment`, `comment_<id>`, `comment_draft`, and transient mark
  data through `platejs/migrations`; do not ship a permanent runtime adapter.

Verification evidence:
- `find` and manifest parsing found exactly 4 workspace packages.
- `platejs/package.json` declares 62 exports: 60 JavaScript runtime entrypoints,
  one Math CSS export, and `package.json`.
- The merged DAG maps all 60 runtime entrypoints to 30 headless, 1 SSR, and 29
  client entries and declares 15 private owners.
- The linked artifact contains one verdict row for every package and every
  public JavaScript entrypoint, plus the ranked redesign program and full
  Comments target model.
- Targeted source reads verified the cited plugin sizes, dependency edges,
  duplicate geometry/drag behavior, dynamic review properties, and thin proxy
  boundaries.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-plate-next-merged-package-redesign-audit.md`
  passed with `[autogoal] complete`.
- A bounded artifact count returned `workspace package rows=4` and
  `platejs entrypoint rows=60`.

Correction log:
- `main` did not contain the merged feature work. Resolved the PR merge commit
  and audited `origin/next` without moving the local checkout away from `main`.
- The plan template was absent from `main`. Read it from `origin/next` and used
  the merged template as the plan source.
- Two broad source reads exceeded output limits. Repeated them as bounded,
  paginated reads before drawing conclusions.
- A shell loop used zsh's reserved `path` variable and hid command lookup.
  Renamed it to `file_path` and reran the inventory successfully.
- The first combined closeout command had an unmatched shell quote and did not
  execute. Reran the goal checker and artifact counts independently; both
  passed.

Completion Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Complete package inventory | yes | 4 expected, 4 classified, zero missing or extra. |
| Complete public entrypoint inventory | yes | 60 expected, 60 classified, zero missing or extra. |
| Comments verdict | yes | Current owner, hard cut, target channels, permissions, UI state, and migration are recorded. |
| Ranked recommendation | yes | Eight ordered packets and five explicit non-targets are recorded. |
| Runtime or browser proof | no | Read-only audit changed no runtime code or public API. |
| Product implementation | no | Each accepted packet requires its own API/adoption plan. |
| Durable handoff | yes | Plan and linked full inventory artifact contain the evidence and next actions. |

Reboot status:
The audit can resume from the linked inventory without rescanning the repository.
Start the next implementation cycle with Comments, run `best-api repair` for
the new public call shape, then produce the bounded `plate-plan` adoption and
proof plan. The local checkout remains on `main`; implementation must target the
appropriate branch separately.

Open risks:
- The inventory proves architecture and ownership, not runtime behavior after
  any future cut.
- Legacy comment documents need a measured extraction corpus before the
  migration helper can be considered safe.
- Plite annotation/widget capabilities may need a small public API addition;
  the exact call shape is deliberately deferred to `best-api`.
- Suggestions and DnD have large blast radii and must follow Comments rather
  than run concurrently with the review-model rewrite.
