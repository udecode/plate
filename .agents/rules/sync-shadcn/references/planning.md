# Planning and Implementation Handoff

Permissions, `status.json` semantics, baseline advancement, and the micro-overlap direct merge exception live in [policy](./policy.md).

## Scoped Planning (`sync-shadcn <scope>`)

Any non-command `$ARGUMENTS` value is a user-named scope (UI surface, route, product area, registry group, content family, or slice). Ask one focused question before writing artifacts if too vague to map to upstream (`../shadcn/apps/v4`) and Plate (`apps/www`).

- Use the same baseline/target range as the default lane, but filter inventory rows and hunks to the named scope; classify unrelated hunks sharing a file as out-of-scope (classify the scope hunk as `smart-merge`).
- Save artifacts under `docs/sync/shadcn/runs/<date>-<base>-to-<target>-<scope-slug>/`, record the out-of-scope row count, and note that the default full lane remains pending for out-of-scope rows.
- For visual or route-owned scopes, save uncommitted local screenshots under `docs/sync/shadcn/runs/<range>/screenshots/` and include paths and visible deltas in the plan.
- Scoped plans never advance `lastSyncedCommit` (accepted scoped work records a `partialSyncs` entry) and still stop for review before non-micro `apps/www` edits.

## 1. Establish Upstream Clone and Refs

Use `../shadcn` (clone only if missing) and inspect `docs/sync/shadcn/status.json` for `BASE` (`lastSyncedCommit`):

```bash
test -d ../shadcn/.git || gh repo clone shadcn-ui/ui ../shadcn
git -C ../shadcn fetch origin main --tags
test -d ../shadcn/apps/v4
TARGET=$(git -C ../shadcn rev-parse origin/main)
git -C ../shadcn log -1 --format='%H%n%ci%n%s' "$TARGET"
```

If `$ARGUMENTS` names a base or target ref, verify it with `git -C ../shadcn rev-parse <ref>`.

- **Empty `BASE` (bootstrap audit):** compare all of `../shadcn/apps/v4` against Plate, write a plan, and record the `lastSyncedCommit` pick as a Defaults row before setting it (never set silently).
- **Non-empty `BASE`:** prove ancestry (`git -C ../shadcn merge-base --is-ancestor "$BASE" "$TARGET"`). If not an ancestor, stop and report the ref problem before planning.

## 2. Create Run Artifact Directory

```bash
RUN_DIR="docs/sync/shadcn/runs/$(date +%Y-%m-%d)-${BASE:0:7}-to-${TARGET:0:7}" # or target-only for bootstrap
mkdir -p "$RUN_DIR"
git -C ../shadcn diff --name-status --find-renames "$BASE..$TARGET" -- apps/v4 > "$RUN_DIR/upstream-name-status.tsv"
git -C ../shadcn diff --numstat "$BASE..$TARGET" -- apps/v4 > "$RUN_DIR/upstream-numstat.tsv"
git -C ../shadcn log --oneline --decorate "$BASE..$TARGET" -- apps/v4 > "$RUN_DIR/upstream-commits.txt"
# Bootstrap without BASE: git -C ../shadcn ls-files apps/v4 > "$RUN_DIR/upstream-files.txt"
```

Never stream huge diffs into chat or write `.patch` files. Inspect focused capped diffs (`git -C ../shadcn diff --stat` or piped through `sed -n '1,220p'`), narrowing by path/function/search term when large, and summarize relevant hunks in `inventory.md` or the plan.

## 3. Classify Upstream Changes

Assign every changed upstream file to one subsystem:

- `docs-engine`: Fumadocs source, page tree, MDX compilation, raw markdown
- `routing`: Next routes, rewrites, metadata, layout groups
- `shell-nav-sidebar`: header, footer, sidebar, mobile nav, command/search UI
- `mdx-code`: MDX components, code blocks, copy-page, source viewer, RSS/OG
- `registry-contract`: shadcn schema, resolver semantics, namespace behavior, init/base item, local-file install
- `registry-build`: registry scripts, generated source indexes, validation
- `preview-view`: block/component preview routes and iframe/source display
- `product-page`: create, charts, colors, blocks gallery, directory, examples product pages
- `theme-style`: global CSS, theme providers, tokens, active theme, customizer
- `deps-config`: package, lock, tsconfig, eslint, Next config
- `tests`: upstream app tests and fixtures
- `assets`: public assets, manifest, images, fonts
- `other`: only with an explanation

Record per file: upstream status (`A`/`M`/`D`/`R`), upstream path, subsystem, nearest Plate owner path (or `none`), local search evidence, default decision, and confidence.

Local mapping heuristics:

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

Search Plate by component/function/route/registry names and discarded-surface vocabulary:

```bash
git grep --untracked -n -E "<ComponentOrFunctionName>|<route-segment>|<registry-key>" -- apps/www content/docs docs/sync/shadcn
git grep --untracked -n -E "v0|OpenInV0|create|charts|colors|themes|customizer|useProject|liftMode|docsConfig|Contentlayer|/api/registry/\\[name\\]" -- apps/www content/docs docs
```

For discarded surfaces, also search hidden state (hooks, routes, `localStorage` keys, event names, stale sync comments); deleting visible UI alone is insufficient.

Assign one decision per row:

- `adopt-upstream`: upstream owns the better generic docs infrastructure and Plate has no durable reason to diverge.
- `smart-merge`: apply upstream architecture/fix while retaining a named Plate product requirement (state both sides).
- `plate-fork`: keep Plate's implementation intentionally; upstream change is context only.
- `exclude-upstream`: do not bring this upstream product surface to Plate.
- `delete-plate-residue`: upstream direction confirms local fork code should be removed.
- `no-op`: upstream changed content or product surface irrelevant to Plate.
- `needs-question`: user decision required before planning implementation.

## 4. Plan Evidence

Include every row from `upstream-name-status.tsv` in the plan's Evidence (for very large inventories, put the full table in `$RUN/inventory.md` and link it from the plan):

| Status | Upstream file | Subsystem | Plate owner | Decision | Evidence |
| --- | --- | --- | --- | --- | --- |
| M | `apps/v4/...` | `shell-nav-sidebar` | `apps/www/src/...` | `smart-merge` | focused diff summary + rg evidence |

Ask one pointed question for `needs-question` rows; never ask about settled exclusions.

Include a `## Recommended Merge Slices` table with one row per slice waiting on an owner decision (deferred slices included), carrying forward every open slice from earlier plans under its existing dashboard item id (second cell in backticks):

| Order | Slice | Class | Files | Why | Verification |
| --- | --- | --- | --- | --- | --- |
| 1 | `next-security` | `smart-merge` | `apps/www/package.json` | why Plate needs it | proof to run once accepted |

## 5. Status and Dashboard Updates

1. Update `lastPlannedCommit` and `lastPlan` in `docs/sync/shadcn/status.json` (advance `lastSyncedCommit` only when all five [policy](./policy.md) gates hold).
2. Add each slice from `## Recommended Merge Slices` to `docs/sync/shadcn/deltas.json` as state `pending` under its owning (or new) feature, filling `title`, `upstream`, `files`, `suggestion` (plan recommendation), and `evidence` (plan path + upstream commits), leaving `decision` empty. Leave items that already have the slice id unchanged.
3. Run `pnpm sync-shadcn dashboard --no-open`. It fails while any slice in `lastPlan`'s table has no item. Feature states are derived from items, never stored on features.
