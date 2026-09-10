## Commands

Supported commands:

- `status`: summarize current shadcn sync state, partial syncs, deferred
  decisions, and recommended next step without writing sync artifacts.
- `dashboard`: regenerate the structured feature-delta dashboard under
  `docs/sync/shadcn` for visual review of synced, deferred, rejected, forked,
  and pending shadcn sync decisions.
- `apply`: apply a copied dashboard review payload to
  `docs/sync/shadcn/deltas.json`, answer question-only rows without mutation,
  implement rows targeting `synced`, then regenerate the dashboard when rows
  changed.
- `review`: re-audit the current tracked shadcn range against `../shadcn` and
  the current Plate checkout before trusting an existing plan.

Feature-scoped planning:

- Any non-command $ARGUMENTS value is a user-named scope. Treat the full
  argument string as the scope label instead of hardcoding allowed feature names.
- Scope labels can describe UI surfaces, routes, product areas, registry
  groups, content families, or implementation slices.
- If the scope is too vague to map to upstream and Plate files, ask one focused
  question before writing artifacts.

Command parsing:

- The first $ARGUMENTS token is the command when it matches a supported command.
- The full $ARGUMENTS string is the scope when the first token is not a
  supported command.
- If no command or scope is present, use the default full-range
  planning/implementation flow.
- Reserved commands are `status`, `dashboard`, `apply`, and `review`; do not
  treat them as scope labels.
- Scopes are planning lanes, not broad implementation permission. A scoped
  plan still stops for user review before non-micro `apps/www` work.

### Scoped Planning

Use `sync-shadcn <scope>` when the user wants to sync only one named surface
before reviewing broader docs sync work.

Purpose:

- compare the tracked upstream range, but inventory and classify only changes
  that affect the named scope
- write a reviewable scope-specific plan under `docs/sync/shadcn`
- avoid the default full-range lane unless the user invokes `sync-shadcn`
  without a command or scope

Scope discovery:

- Translate the user-named scope into likely upstream files under
  `../shadcn/apps/v4` and likely Plate files under `apps/www`.
- Search names, route paths, component names, config keys, registry names, and
  docs paths that match the scope.
- Include all matching hunks that directly affect the scope.
- Exclude adjacent changes that only share a file but belong to another surface;
  classify those as out-of-scope.

Scoped planning rules:

- Save artifacts in a scope-named run directory or plan name, for example
  `docs/sync/shadcn/runs/<date>-<base>-to-<target>-<scope-slug>/`.
- Use upstream diffs/logs for the same baseline and target as the default lane,
  but filter inventory rows to scope-matching files and patch hunks.
- Also record an out-of-scope count for upstream rows in the range so it is
  clear the scoped plan cannot advance `lastSyncedCommit` alone.
- If the scope is visual or route-owned, capture upstream and Plate screenshots
  for the matching route(s) at the same viewport before finalizing the plan.
  Use `docs/sync/shadcn/runs/<range>/screenshots/` for committed evidence, and
  include screenshot paths plus the visible deltas in the plan.
- Do not update `lastSyncedCommit` from a scoped plan. Scoped sync can add a
  `partialSyncs` entry after accepted implementation, but the baseline advances
  only when the full range is accounted for.
- The plan's recommended slices must stay inside the named scope. If a file also
  contains unrelated changes, classify the scope hunk as `smart-merge` and the
  unrelated hunks as out-of-scope for this lane.
- Final planning output must say that the default full sync lane remains
  pending for the out-of-scope rows.

## 1. Establish Upstream Clone And Refs

Do this only after the Task start gates are satisfied and the active
`sync-shadcn` plan records the output budget strategy.

Use `../shadcn` as the upstream clone. Create it only if missing:

```bash
test -d ../shadcn/.git || gh repo clone shadcn-ui/ui ../shadcn
git -C ../shadcn fetch origin main --tags
test -d ../shadcn/apps/v4
```

Read the tracked baseline:

```bash
node -e '
const fs = require("fs");
const status = JSON.parse(fs.readFileSync("docs/sync/shadcn/status.json", "utf8"));
console.log(JSON.stringify(status, null, 2));
'
```

Resolve refs:

```bash
BASE=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/sync/shadcn/status.json", "utf8")).lastSyncedCommit || "")')
TARGET=$(git -C ../shadcn rev-parse origin/main)
git -C ../shadcn log -1 --format='%H%n%ci%n%s' "$TARGET"
```

If $ARGUMENTS names a base or target ref, prove it exists and use it:

```bash
git -C ../shadcn rev-parse <base-or-target-ref>
```

If `BASE` is empty, run a bootstrap audit:

- compare the whole `../shadcn/apps/v4` source against Plate
- write a plan
- ask the user before setting `lastSyncedCommit`
- do not silently set the baseline

If `BASE` is present, prove ancestry when possible:

```bash
git -C ../shadcn merge-base --is-ancestor "$BASE" "$TARGET"
git -C ../shadcn log --oneline --decorate "$BASE..$TARGET" -- apps/v4
```

If `BASE` is not an ancestor of `TARGET`, stop and explain the ref problem
before planning. Do not produce a misleading change list.

## 2. Create A Run Artifact Directory

Use a range-keyed directory so the full evidence survives beyond chat context:

```bash
RUN_DIR="docs/sync/shadcn/runs/$(date +%Y-%m-%d)-${BASE:0:7}-to-${TARGET:0:7}"
mkdir -p "$RUN_DIR"
```

Save complete inventories:

```bash
git -C ../shadcn diff --name-status --find-renames "$BASE..$TARGET" -- apps/v4 \
  > "$RUN_DIR/upstream-name-status.tsv"

git -C ../shadcn diff --numstat "$BASE..$TARGET" -- apps/v4 \
  > "$RUN_DIR/upstream-numstat.tsv"

git -C ../shadcn log --oneline --decorate "$BASE..$TARGET" -- apps/v4 \
  > "$RUN_DIR/upstream-commits.txt"
```

For bootstrap audits without a base ref, use `target-only` in the directory
name and save a full current upstream file list instead:

```bash
git -C ../shadcn ls-files apps/v4 > "$RUN_DIR/upstream-files.txt"
```

Do not stream huge diffs into chat and do not write `.patch` files. Inspect
focused diffs on demand with capped commands, then summarize only the relevant
hunks in `inventory.md` or `plan.md`:

```bash
git -C ../shadcn diff --stat "$BASE..$TARGET" -- apps/v4/app apps/v4/components apps/v4/lib
git -C ../shadcn diff "$BASE..$TARGET" -- apps/v4/app/(app)/(root)/page.tsx | sed -n '1,220p'
```

If the focused diff is still too large, narrow by path/function/search term and
record the command plus summary instead of saving the diff body.

## 3. Classify Upstream Changes

Every upstream changed file must be assigned to one subsystem:

- `docs-engine`: Fumadocs source, page tree, MDX compilation, raw markdown
- `routing`: Next routes, rewrites, metadata, layout groups
- `shell-nav-sidebar`: header, footer, sidebar, mobile nav, command/search UI
- `mdx-code`: MDX components, code blocks, copy-page, source viewer, RSS/OG
- `registry-contract`: shadcn schema, resolver semantics, namespace behavior,
  init/base item, local-file install
- `registry-build`: registry scripts, generated source indexes, validation
- `preview-view`: block/component preview routes and iframe/source display
- `product-page`: create, charts, colors, blocks gallery, directory, examples
  pages that are shadcn product surfaces
- `theme-style`: global CSS, theme providers, tokens, active theme, customizer
- `deps-config`: package, lock, tsconfig, eslint, Next config
- `tests`: upstream app tests and fixtures
- `assets`: public assets, manifest, images, fonts
- `other`: only with an explanation

Upstream preset bases and styles are inventory, not automatic Plate capability.
Never assign `PRESET_BASES` directly as Plate's supported set or multiply the
physical Plate/docs graph by `base x style`. First audit the complete installed
graph, name each real provider-specific owner, keep primitive-agnostic items
canonical, and reject unsupported provider/style routes. Base/Nova may remain
the full canonical output while other supported combinations are sparse
logical overlays. Isolated generation of one variant component does not prove
registry compatibility.

Plate defaults to Base. A supported provider must resolve the complete public
semantic registry. Never filter or 404 an item inside Base or Radix because its
current implementation is provider-coupled. Remove the coupling or add a sparse
author-source variant at the smallest direct primitive owner, then prove the
affected installed closure. Maintenance-only items are not exempt from this
compatibility floor.

For each file, record:

- upstream status: added, modified, deleted, renamed
- upstream path
- subsystem
- nearest Plate owner path, or `none`
- local search evidence
- default decision
- confidence

Useful local mapping heuristics:

| Upstream path | Plate path to inspect |
| --- | --- |
| `apps/v4/app/**` | `apps/www/src/app/**` |
| `apps/v4/components/**` | `apps/www/src/components/**` |
| `apps/v4/lib/**` | `apps/www/src/lib/**` |
| `apps/v4/hooks/**` | `apps/www/src/hooks/**` |
| `apps/v4/content/docs/**` | `content/docs/**` |
| `apps/v4/registry/**` | `apps/www/src/registry/**` |
| `apps/v4/scripts/**` | `apps/www/scripts/**` |
| `apps/v4/styles/**` | `apps/www/src/app/globals.css`, `apps/www/src/styles/**` |
| `apps/v4/package.json` | `apps/www/package.json` |
| `apps/v4/next.config.mjs` | `apps/www/next.config.ts` |

Search Plate by component/function names from upstream diffs:

```bash
rg -n "<ComponentOrFunctionName>|<route-segment>|<registry-key>" apps/www content/docs docs/sync/shadcn
```

Also search deleted/discarded vocabulary when upstream or Plate removes a
surface:

```bash
rg -n "v0|OpenInV0|create|charts|colors|themes|customizer|useProject|liftMode|docsConfig|Contentlayer|/api/registry/\\[name\\]" apps/www content/docs docs
```

Classify each row with one decision:

- `adopt-upstream`: upstream owns the better generic docs infrastructure and
  Plate has no durable reason to diverge.
- `smart-merge`: apply the upstream architecture or fix, but retain a named
  Plate product requirement.
- `plate-fork`: keep Plate's implementation intentionally; upstream change is
  useful as context but not directly adopted.
- `exclude-upstream`: do not bring this upstream product surface to Plate.
- `delete-plate-residue`: upstream direction confirms local fork code should be
  removed.
- `no-op`: upstream changed content or product surface irrelevant to Plate.
- `needs-question`: user decision required before planning implementation.

## 4. Produce The Sync Plan

Write a Markdown plan:

```bash
PLAN="docs/sync/shadcn/runs/$(date +%Y-%m-%d)-${BASE:0:7}-to-${TARGET:0:7}/plan.md"
```

The plan must include these sections:

```md
# Sync Shadcn <base-short>..<target-short>

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `<sha> <date> <subject>`
- Target: `<sha> <date> <subject>`
- Plate app: `apps/www`
- Status source: `docs/sync/shadcn/status.json`

## Summary

Short factual summary of the changed subsystems and the recommended merge
posture.

## Complete Upstream Inventory

| Status | Upstream file | Subsystem | Plate owner | Decision | Evidence |
| --- | --- | --- | --- | --- | --- |
| M | `apps/v4/...` | `shell-nav-sidebar` | `apps/www/src/...` | `smart-merge` | focused diff summary + rg evidence |

This table must include every row from `upstream-name-status.tsv`.

## Added Files

All upstream added files with decision.

## Modified Files

All upstream modified files with decision.

## Deleted Files

All upstream deleted files with decision.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| --- | --- | --- | --- | --- | --- |

## Micro Auto-Merges

List qualifying tiny overlapping-component fixes applied during this activation,
or `None`.

| Upstream file | Plate file | Change | Why direct | Verification |
| --- | --- | --- | --- | --- |

## Explicit Exclusions

List upstream changes not to import, especially v0/charts/colors/theme and the
full project-designer surfaces, with the local Plate policy evidence.

## Plate Forks To Preserve

List intentional forks, including sidebar accordion/filter UX,
`/api/registry-source/[name]`, API MDX, CN docs, MCP, Plus hooks, GA, Plate home,
editor demos, workspace aliases, and package integration tests when touched.

## Visual Evidence

For visual scopes or browser-visible slices, include upstream and Plate
screenshot paths, viewport, route, and the visible deltas that still need work.
Do not rely on source diffs alone for visual parity.

## Smart Merge Details

For every `smart-merge` row, state what comes from upstream and what remains
Plate-owned.

## Questions

Only include real user decisions. Do not ask about settled policy.

## Status Update Rule

State whether this plan can advance `lastSyncedCommit` after implementation. If
not, identify the remaining groups.
```

If the inventory is very large, the plan still needs every row. Put the full row
table in `inventory.md` in the same run directory and link it from `plan.md`.

## 5. Stop For User Review

Default stop point:

```md
Range: <base-short>..<target-short>
Plan: <path>

| Decision | Count | Notes |
| --- | ---: | --- |
| adopt-upstream | ... | ... |
| smart-merge | ... | ... |
| plate-fork | ... | ... |
| exclude-upstream | ... | ... |
| delete-plate-residue | ... | ... |
| needs-question | ... | ... |

Micro auto-merges:
- <list, or none>

Recommended first slice: <slice>

Question: Review the plan. Should any decision change before implementation?
To implement it, invoke `sync-shadcn` again with the accepted plan path and
slice.
```

Ask one pointed question when there are `needs-question` rows. Do not ask about
settled exclusions.

Stop if the request was planning-only or a required decision remains open.
Otherwise continue the authorized slice through Task; no repeat acceptance
is needed.

## 6. Delegate Accepted Implementation Through `task`

When the active request authorizes the plan/slice, continue through Task
with the following complete implementation handoff:

```md
Implement this shadcn docs sync slice.

Upstream: shadcn-ui/ui `../shadcn/apps/v4`
Range: <base-sha>..<target-sha>
Plan: <docs/sync/shadcn/runs/.../plan.md>
Slice: <one-sentence selected slice>
Class: <adopt-upstream | smart-merge | plate-fork cleanup | delete-plate-residue>

Evidence:
- Upstream commits: <short commit list or artifact path>
- Upstream files: <file rows from the plan>
- Upstream diff evidence: <focused command summaries, file rows, or hunk notes>
- Plate evidence: <local files and solution notes>
- Explicit exclusions: <v0/charts/colors/themes/full designer/etc. if relevant>

Implementation:
- <specific files or surfaces to inspect first>
- <what should come from upstream>
- <what must stay Plate-owned>
- <what must be deleted instead of carried forward>

Acceptance:
- <focused typecheck/test/source audit>
- `pnpm install` only if package, lock, or agent generated output needs it
- `pnpm lint:fix`
- browser proof only if the slice changes browser-visible docs UI
- for visual slices, screenshot both upstream shadcn and Plate pages at the
  same viewport before calling the slice done
- run `pnpm --filter www build:registry` on `next` when accepted registry
  source changed; otherwise follow the branch's CI-generation rule
- update `docs/sync/shadcn/status.json` only if the whole target range is fully
  accounted for; otherwise record a partial sync note and keep
  `lastSyncedCommit` unchanged

Do not preserve obsolete Plate fork residue if the upstream change removes the
need for it. Hard cut the residue.
```

Then follow `task` until the implementation is verified or a real blocker is
proven. Record the transition to implementation mode in the same plan.

## 7. Status Updates

`docs/sync/shadcn/status.json` has three meanings:

- `lastSyncedCommit`: every upstream change through this commit has been
  adopted, smart-merged, intentionally forked, or explicitly excluded.
- `lastPlannedCommit`: latest target commit with a written sync plan.
- `partialSyncs`: accepted slices that landed before the whole range was fully
  accounted for.

Plan generation may update `lastPlannedCommit` and `lastPlan`.

Only update `lastSyncedCommit` when:

1. the plan covers every row in the upstream range
2. all selected implementation slices for that range are complete
3. all excluded/forked rows are recorded in the plan
4. verification for touched surfaces passed
5. the user accepted the final accounting

When advancing the baseline, include:

```json
{
  "lastSyncedCommit": "<target-sha>",
  "lastSyncedAt": "YYYY-MM-DD",
  "lastSyncPlan": "docs/sync/shadcn/runs/.../plan.md",
  "lastVerification": ["<commands or proof>"]
}
```

Do not delete older run artifacts. They are the audit trail.

## Output

For planning-only runs, end with:

```md
Range: <base-short>..<target-short>
Plan: <path>

| Decision | Count | Notes |
| --- | ---: | --- |
| adopt-upstream | ... | ... |
| smart-merge | ... | ... |
| plate-fork | ... | ... |
| exclude-upstream | ... | ... |
| delete-plate-residue | ... | ... |
| needs-question | ... | ... |

Micro auto-merges:
- <list, or none>

Recommended first slice: <slice>
Question: Review the plan. Should any decision change before implementation?

To implement it, invoke `sync-shadcn` again with the accepted plan path and
slice.
```

For implementation runs, use `task`'s final handoff format and include whether
`docs/sync/shadcn/status.json` was advanced or left unchanged.
