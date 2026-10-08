Feature-scoped planning:

- Any non-command $ARGUMENTS value is a user-named scope. Treat the full
  argument string as the scope label instead of hardcoding allowed feature names.
- Scope labels can describe UI surfaces, routes, product areas, registry
  groups, content families, or implementation slices.
- If the scope is too vague to map to upstream and Plate files, ask one focused
  question before writing artifacts.
- Scopes are planning lanes, not broad implementation permission. A scoped
  plan still stops for user review before non-micro `apps/www` work.

### Scoped Planning

Use `sync-shadcn <scope>` when the user wants to sync only one named surface
before reviewing broader docs sync work.

Purpose:

- compare the tracked upstream range, but inventory and classify only changes
  that affect the named scope
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
  Use `docs/sync/shadcn/runs/<range>/screenshots/` for local evidence, which
  stays uncommitted, and include screenshot paths plus the visible deltas in the plan.
- Do not update `lastSyncedCommit` from a scoped plan. Scoped sync can add a
  `partialSyncs` entry after accepted implementation, but the baseline advances
  only when the full range is accounted for.
- The plan's recommended slices must stay inside the named scope. If a file also
  contains unrelated changes, classify the scope hunk as `smart-merge` and the
  unrelated hunks as out-of-scope for this lane.
- Final planning output must say that the default full sync lane remains
  pending for the out-of-scope rows.

## 1. Establish Upstream Clone And Refs

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
- record the `lastSyncedCommit` pick as a Defaults row with the commit it would set, then set it
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
hunks in `inventory.md` or the plan:

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
git grep --untracked -n -E "<ComponentOrFunctionName>|<route-segment>|<registry-key>" -- apps/www content/docs docs/sync/shadcn
```

Also search deleted/discarded vocabulary when upstream or Plate removes a
surface:

```bash
git grep --untracked -n -E "v0|OpenInV0|create|charts|colors|themes|customizer|useProject|liftMode|docsConfig|Contentlayer|/api/registry/\\[name\\]" -- apps/www content/docs docs
```

For every discarded surface, also search its hidden state names, not only its UI entrypoints: component, hook and route names, localStorage keys, event names, and stale sync comments. Deleting the visible UI is not enough.

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

## 4. Plan Evidence

The plan's Evidence holds the complete upstream inventory:

| Status | Upstream file | Subsystem | Plate owner | Decision | Evidence |
| --- | --- | --- | --- | --- | --- |
| M | `apps/v4/...` | `shell-nav-sidebar` | `apps/www/src/...` | `smart-merge` | focused diff summary + rg evidence |

This table must include every row from `upstream-name-status.tsv`.

For every `smart-merge` row, state what comes from upstream and what remains
Plate-owned.

If the inventory is very large, the plan still needs every row. Put the full row
table in `$RUN/inventory.md` and link it from the plan.

Ask one pointed question when there are `needs-question` rows. Do not ask about
settled exclusions.

## 5. Status Updates

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
  "lastSyncPlan": "docs/plans/<date>-sync-shadcn-<range>.md",
  "lastVerification": ["<commands or proof>"]
}
```

Do not delete older run artifacts. They are the audit trail.
