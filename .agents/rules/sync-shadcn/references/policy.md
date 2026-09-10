# Sync Shadcn

Apply [the Plate workflow](../../task/references/workflow.md) for plan, authority, proof and review ownership.


Handle $ARGUMENTS.

Goal: compare the tracked upstream shadcn docs baseline with the current
`../shadcn/apps/v4` target, inventory every added/modified/deleted upstream
change, map each change to Plate's docs app, classify the merge decision, write
a reviewable plan under `docs/sync/shadcn`, directly merge any qualifying tiny
overlap fixes, then stop for user review of the remaining slices. Implementation mode requires current user authorization for the named scope.
Existing authorization remains valid after the plan is written.

If $ARGUMENTS starts with a command name, dispatch to that command before the
default planning/implementation flow. If $ARGUMENTS names a feature, product
surface, or slice, run a scoped planning lane for that scope. The default
full-range planning lane applies only when no command or scope is mentioned.

This skill exists because Plate's docs app is a forked product surface, not a
generic shadcn mirror. Upstream owns the Fumadocs/shadcn docs architecture.
Plate owns Plate docs content, editor demos, registry content, API MDX, CN docs,
MCP, Plate Plus hooks, GA, and a small set of intentional forks.

## File-plan contract

Task owns the file plan and lifecycle. Apply the project's standing Autogoal request for long-running work. Read the existing plan and mode before mutation.

`sync-shadcn` has planning and implementation modes within Task:

- Planning mode is the default. It writes the range plan, updates
  `lastPlannedCommit`, directly applies qualifying micro-overlap merges,
  asks the user to review the remaining plan, and stops.
- Implementation mode follows the user-authorized plan and slice. Do not
  request the same acceptance twice. Explicit planning-only requests stop at
  handoff and never apply micro-overlap edits.
- Default flow mode: one-shot execution for planning mode and one-shot
  execution for accepted implementation mode. An already-authorized task may continue between them.
- Use collaborative planning only when the user is explicitly deciding policy
  before a range plan is written.
- Primary template:
  `docs/plans/templates/sync-shadcn.md`.
- Default packs: none. Add `docs` if docs/content pages are edited during an
  accepted implementation, `browser` if visible docs UI is edited, and
  `agent-native` if `.agents/**`, `.claude/**`, `.codex/**`, skills, commands,
  prompts, or user-action tooling are edited.
- Required evidence types: `command`, `source-audit`, `artifact`, and `N/A`
  rows. Add `browser` evidence when a planning scope or accepted
  implementation touches visible docs UI.
- Visual sync scopes must capture comparable screenshots of the upstream
  shadcn page and the Plate page before making or closing a visual parity call.
  Save only screenshots and notes, not broad upstream patch files.
- Task owns lifecycle, mode, existing authority, plan and output scope. The
  file helper and `check-complete.mjs` support the plan without native goal
  state. Apply mode can follow planning in the same authorized task.
- `sync-shadcn` owns shadcn range policy, commit accounting, upstream inventory
  classification, Plate fork/exclusion decisions, status JSON semantics, and
  merge-slice handoff.

## Micro-Overlap Direct Merge Exception

The default review boundary is still real. Do not use it as an excuse to miss
obvious tiny upstream fixes on components Plate already mirrors.

During planning, directly merge a change when all of these are true:

- The upstream row maps to a retained Plate component, primitive, hook, or
  utility with a clear local owner path, not to upstream product content.
- The parent surface is already `synced`, an accepted partial sync, or an
  obvious overlapping primitive such as `Button`, `Badge`, `Input`, `Command`,
  `Tooltip`, `PageHeader`, or the copied docs-shell components.
- The diff is tiny: one local file, one behavior/class/token/prop/import fix,
  no new files, no deleted files, no new dependency, no route, no data model,
  no generated output, and no package or lockfile edit.
- The local Plate file still has the old value or an equivalent local variant
  that should receive the same fix.
- The change does not touch settled exclusions: v0, charts, colors,
  theme/customizer product surfaces, upstream docs prose, external registry
  directory content, or generated `public/r/**` output. Plate `/create` and
  registry styles are accepted surfaces, but their multi-file product work can
  never qualify as a micro-merge.
- No product judgment is needed. If the change changes layout, UX, copy,
  route shape, docs concepts, registry semantics, or multi-file architecture,
  it is not a micro-merge.

Examples of direct merges:

- Replace one stale utility class on Plate's copied `Button` because upstream
  fixed the same class on every style variant.
- Apply one bugfix conditional to a copied `Command` or `CopyButton` primitive
  when Plate has the same bug and no Plate product requirement changes.
- Remove one dead prop/import from a synced component when upstream removed it
  and Plate has no local dependency on it.

Examples that still require review:

- Package bumps, lockfile changes, registry schema/route changes, docs concept
  additions, new components, deleted components, multi-file UI chunks, visual
  layout rewrites, sidebar/search behavior changes, generated registry output,
  and anything touching a deferred or rejected product surface.

When a micro-overlap merge is found:

1. Record it in the run plan under `## Micro Auto-Merges` with upstream path,
   Plate path, focused diff summary, why it qualifies, and verification.
2. Patch the Plate owner file directly in the same activation.
3. Run the smallest meaningful verification: focused eslint/typecheck/source
   audit; add browser proof when the changed component is browser-visible and a
   stable route exists.
4. Add a `partialSyncs` entry if the full baseline does not advance. Keep
   `lastSyncedCommit` unchanged unless the whole range is complete.
5. Continue to stop for review on every non-micro slice.

## User Review Boundary

Resolve the scope before implementation. A planning-only request stops at
handoff. A request that already authorizes the scope continues after readiness
is resolved; do not require a later message or a second invocation.

Planning mode may:

- fetch/pull `../shadcn`
- create the active Task plan
- write `docs/sync/shadcn/runs/<range>/` artifacts
- update `lastPlannedCommit` and `lastPlan`
- directly apply qualifying micro-overlap merges and record them as partial
  syncs
- ask one review/decision question

Planning mode must not:

- patch `apps/www` except for qualifying micro-overlap direct merges
- delegate to `task`
- advance `lastSyncedCommit`
- treat "recommended first slice" as accepted
- implement a slice without existing user authorization

The final planning response must say:

```md
Review the plan. I directly merged these micro-overlap fixes: <list or none>.
To implement the remaining slices, invoke `sync-shadcn` again with the accepted
plan path and slice.
```

Implementation mode requires current authority for the plan/slice. Continue
the same Task plan and record the accepted slice. A later message is needed
only when that authority or a required product decision is still missing.

## Hard Rules

- Use evidence, not vibes. Read upstream commits, file status, focused diffs,
  local Plate files, prior decisions, screenshots for visual surfaces, and
  relevant solution notes.
- Track exact commits. Never say "latest shadcn" without recording the target
  SHA.
- Treat `docs/sync/shadcn/status.json` as the durable baseline. Do not advance
  `lastSyncedCommit` until every upstream change in the planned range is
  accounted for as adopted, smart-merged, intentionally forked, or explicitly
  excluded.
- Planning is the default output. Do not patch `apps/www` unless the row
  qualifies as a micro-overlap direct merge or the user accepts a merge slice in
  the active request. Explicit planning-only work never patches product source.
- Do not edit generated registry output or generated skill mirrors by hand.
- Never inspect, classify, modify, regenerate, restore, or gate on
  `templates/**`, template `components.json`, or template preparation scripts.
  Post-release CI owns template synchronization unless the user explicitly
  requests that separate release scope.
- On `next`, run `pnpm --filter www build:registry` when accepted registry
  source changes. Other branches follow the repo's CI-generation rule. Never
  generate registry output during a planning-only run.
- Continue accepted implementation through Task in the same activation when
  authorized. A new scope or unresolved product decision needs user input;
  the internal owner transition does not.
- Keep the active `sync-shadcn` Task plan current after every meaningful
  decision, artifact write, classification pass, status JSON edit, accepted
  implementation slice, verification run, or blocker.
- Prefer deleting old Plate fork residue over preserving compatibility layers
  when upstream already owns the better model.
- Prefer upstream docs infrastructure unless Plate has a real product or
  registry reason to diverge.
- Upstream owns its external protocol, not Plate's public component/editor API.
  Route a reusable Plate API fork to `best-api`; upstream is evidence there.
- Keep output comprehensive. If a diff is too large for the chat, save complete
  TSV inventories under `docs/sync/shadcn/runs/<range>/` and summarize the
  artifact paths in the response.
- Do not persist `.patch` files in the repo. Inspect focused diffs on demand
  with capped `git diff` commands, summarize the relevant hunks in
  `inventory.md` or `plan.md`, and leave broad upstream patches out of
  committed sync artifacts.

## Start Gates

These gates must be resolved in the active `sync-shadcn` Task plan before broad
exploration:

- Task scope and file plan read; standing Autogoal request applied or explicit opt-out recorded.
- `docs/sync/shadcn/status.json` read.
- `docs/sync/shadcn/decisions.md` read.
- Prior migration plans and solution notes checked when relevant.
- Output budget strategy recorded before running upstream diff/log commands.
- `../shadcn` clone state known and fetched/pulled intentionally.
- Base and target refs resolved to exact SHAs.
- Base ancestry proven, or the ref problem recorded before stopping.
- Planning-only versus implementation mode decided.
- User-review boundary recorded: planning mode stops, implementation mode
  requires current implementation authority.

## Completion Gates

These gates belong in `docs/plans/templates/sync-shadcn.md` and must be closed
in the instantiated Task plan:

- Upstream range artifacts exist and are non-empty, or a target-only bootstrap
  exception is recorded.
- `inventory.md` accounts for every row in `upstream-name-status.tsv`.
- Decision counts cover every upstream row.
- Source-backed Plate mapping exists for every actionable adoption, fork,
  exclusion, or question group.
- `docs/sync/shadcn/status.json` parses and its `lastPlannedCommit` /
  `lastSyncedCommit` semantics match the work actually completed.
- Planning-only runs prove no `apps/www` implementation patch was made, or
  record and verify every qualifying micro-overlap direct merge.
- Accepted implementation runs include focused verification for the touched
  Plate surface.
- Browser proof exists when browser-visible docs UI changed, or when a
  planning scope is visual and needs Plate-vs-shadcn parity evidence.
- Visual sync scopes include screenshots of both upstream shadcn and Plate
  pages at matching viewport(s), plus written deltas such as background,
  spacing, disabled/gray controls, nav/header items, and first-viewport
  framing.
- `lastSyncedCommit` advances only after full-row accounting, verification, and
  user acceptance.
- Planning-mode final handoff lists any direct micro-overlap merges, asks the
  user to review the remaining plan, and invokes `sync-shadcn` again with the
  accepted plan path and slice for bigger work.
- `check-complete.mjs` passes for the active Task plan.

## Durable Policy

Read these before making decisions:

- `docs/sync/shadcn/status.json`
- `docs/sync/shadcn/decisions.md`
- `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md`
- `docs/plans/2026-05-24-shadcn-base-migration-progress.md`
- `.agents/rules/shadcn-parity.mdc`
- `docs/solutions/best-practices/2026-05-23-shadcn-docs-restart-comparison.md`
- `docs/solutions/developer-experience/2026-05-27-shadcn-docs-sidebar-parity-needs-source-and-dom-metrics.md`
- `docs/solutions/developer-experience/2026-05-24-shadcn-v4-registry-schema-needs-source-only-validation.md`
- `docs/solutions/developer-experience/2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md`
- `docs/solutions/developer-experience/2026-05-24-fumadocs-page-tree-search-needs-locale-safe-metadata.md`

Default durable decisions:

- Discard upstream v0 surfaces.
- Keep a thin Plate `/create` that selects Plate editor presets, Base or Radix,
  and the eight pinned upstream code styles. Keep shadcn as the command and
  preset protocol owner. Discard its theme, font, color, v0, and full project
  designer. Before changing the public flow, prove fresh Base/Nova and
  Radix/Luma projects against the local style-aware directory and freshly built
  Plate artifacts. Treat npm and the deployed directory as post-release smoke.
- When an accepted sync changes upstream registry style inputs, set
  `SHADCN_STYLE_SOURCE_COMMIT` to the exact reviewed upstream SHA, then run
  `pnpm --filter www exec tsx scripts/sync-shadcn-registry-styles.mts` from the
  repo root. Verify the style-transform suite before registry generation. Never
  copy style CSS or edit provenance and preview-class output by hand.
- Discard upstream `/charts`, `/colors`, and public directory-style product
  pages unless the user explicitly asks for a Plate version.
- Discard Plate theme/customizer/project/lift-mode residue.
- Keep Plate docs content under `content/docs/**`.
- Keep committed Fumadocs metadata as the docs navigation authority.
- Keep Plate API MDX vocabulary and generated API docs support.
- Keep Plate registry content and docs-registry generation, aligned to shadcn v4
  schema/resolver semantics.
- Keep Plate editor demos, `/view/[name]`, and registry preview/source display.
- Keep lazy code-view source loading through `/api/registry-source/[name]` for
  bandwidth, but do not treat it as a public registry API.
- Keep CN docs, MCP docs/dialog, Plate Plus/Pro hooks, GA, Plate home page, and
  the Slate-to-HTML special page.
- Keep Plate's sidebar accordion/filter UX only as an intentional fork rebuilt
  on Fumadocs/upstream sidebar primitives.
