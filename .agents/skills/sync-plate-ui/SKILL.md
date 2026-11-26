---
description: Sync Plate registry UI into downstream apps with fork-aware comparison, scoped apply and changelog tracking. Not for Potion, which syncs through sync-potion.
argument-hint: '[status | plan | review | dashboard | apply] <target> [scope]'
name: sync-plate-ui
metadata:
  skiller:
    source: .agents/rules/sync-plate-ui.mdc
---

# Sync Plate UI

Handle $ARGUMENTS.

Sync Plate UI registry components from this repo into a downstream app without flattening its product forks. Read Plate registry source, generated changelog JSON, and downstream files; classify upstream-owned versus target-owned hunks; write reviewable artifacts; then apply only accepted rows.

This is consumer-side only: `sync-shadcn` syncs upstream shadcn docs into Plate, `sync-potion` syncs Potion (`../potion`), and upstream Plate changelog entries are authored via `changeset` and `apps/www/src/registry/changelog/entries/*.mdx`.

## Core model

Downstream Plate UI files usually have mixed ownership. Never treat a whole file as forked or safe to overwrite unless three-way evidence proves it:

- `base`: last Plate UI source applied to the target
- `upstream`: current Plate UI source in this repo
- `local`: current target repo file

If `base` is unknown, run bootstrap planning and stop; never guess fork ownership.

Each run keeps its plan at `<target>/.plate-ui-sync/runs/<date>-<scope>/plan.md` with one checkbox per scoped row closed by its decision or apply evidence. Because this runs in downstream apps, it depends on no Plate-repo workflow file.

## Commands and modes

First token dispatches the command; otherwise treat `$ARGUMENTS` as planning scope (examples: `sync-plate-ui ../app code-block`, `sync-plate-ui status ../app`, `sync-plate-ui apply ../app`). If target repo is omitted and cannot be inferred from cwd, ask one focused question; never guess a target.

- `status`: read-only summary of target sync state and next command.
- `plan` (default): reads Plate and target source and writes only under `<target>/.plate-ui-sync/**`. Never edits target source, packages, or lockfiles, never marks components applied, and never treats a recommendation as acceptance.
- `review`: re-reads Plate and target source, recomputes classifications, and writes `<run>/review.md` without applying changes. Verdicts: `fresh`, `stale-plate`, `stale-target`, `stale-state`, `blocked`.
- `dashboard`: writes unresolved rows to `<target>/.plate-ui-sync/dashboard.json` and `dashboard.md` (use a target HTML dashboard script only if the target already has one).
- `apply`: mutates target source only for rows accepted under current user authorization (no second confirmation needed once authorized). No direct micro-merge exception: even exact-match upstream-only files must be recorded in a plan row first. Collaborative planning resolves policy choices (keep local UX fork versus follow Plate).

## Target state and mapping

The target repo owns all state (never keep state only in chat):

```txt
<target>/.plate-ui-sync/status.json
<target>/.plate-ui-sync/forks/<component>.json
<target>/.plate-ui-sync/runs/<date>-<scope>/   # plan.md, inventory.{json,md}, component-diffs.md, target-files.txt, decision-counts.json
<target>/.plate-ui-sync/dashboard.{json,md}
```

Do not persist `.patch` files; summarize focused hunks instead.

`status.json` tracks what has landed:

```json
{
  "sourceRepo": "<absolute path of the Plate checkout>",
  "targetRepo": "<absolute path of the target app>",
  "lastReviewedAt": "YYYY-MM-DD",
  "components": {
    "code-block": {
      "lastAppliedPr": 4989,
      "lastAppliedSourceRef": "<plate-git-sha>",
      "lastAppliedSourceHash": "<sha256-of-transformed-source>",
      "targetFiles": ["src/registry/ui/code-block-node.tsx"],
      "forks": ["toolbar-style"]
    }
  }
}
```

If `status.json` is missing, bootstrap from target `components.json`, `package.json`, copied registry paths, Plate registry definitions, target imports from copied files, and any user-provided base ref or prior run artifact. Bootstrap may write a plan and fork ledger, but must not apply until the user accepts the baseline.

Read target config before path assumptions: `components.json`, `package.json`, lockfile and package manager, `tsconfig.json` aliases, copied registry folders (commonly `src/registry/**`), and app wrappers importing them. For targets shaped like Potion, expect `src/registry/**`, app wrappers in `src/components/**`, pinned `platejs`/`@platejs/cli`/`@platejs/test`, custom import aliases, and possibly stale sync scripts. Audit existing target sync scripts before trusting them.

## Plate source inputs

Prefer generated changelog JSON (`/registry/changelog/index.json`, `components.json`, `<event-id>.json`, read locally at `apps/www/src/registry/changelog`). Each event exposes id, change source, release, affected registry items, source files, migration notes, and diagnostics. If changelog JSON is missing, prose-only, or incomplete, record that blocker and prove the sync from Plate source and PR/merge-base diffs plus explicit user acceptance.

Inspect Plate registry sources first:

- `apps/www/src/registry/registry-editor.ts`, `registry-features.ts`, `registry-examples.ts`
- `apps/www/src/registry/components/editor/**`, `hooks/**`, `lib/**`, `app/**`

Never run `build:registry` or edit generated registry output. Sync list UI through the standard list registry graph; reject rows creating another persisted list model or copied list UI family.

## Three-way classification and decisions

For each component/file row, apply target import-alias transforms (recorded in the plan) and compare `base -> upstream`, `base -> local`, and `upstream -> local` at hunk or symbol level. Never collapse to one file-level class unless every hunk matches.

Classes: `upstream-only` (Plate changed, local matches base), `local-only` (target changed, Plate did not), `same-change` (equivalent result), `conflict` (both changed same area differently), `local-delete` (target removed file/symbol), `rename-map` (target renamed file/export), `unknown-base` (no trustworthy base).

Decisions:

- `pull-upstream`: apply transformed upstream hunk.
- `keep-fork`: update fork ledger only (change target source only if the accepted row asks to harden the fork).
- `smart-merge`: patch named Plate-owned hunks while preserving named target-owned hunks. Must state what comes from Plate, what stays target-owned, what local tests or audits prove it, and what a full overwrite would break.
- `reject-upstream`: record rejection with reason.
- `delete-target-residue`: delete only named obsolete target code.
- `package-only`: update package versions with the target package manager and lockfile without copying UI source.
- `needs-question`: user decision required (questions never mutate state).
- `no-op`: no target change needed.

## Plan shape

Every `<run>/plan.md` includes: `# Sync Plate UI <target> <scope>`, `## Range` (Plate source ref, target repo, scope, changelog/fallback evidence), `## Target Config` (package manager, registry paths, aliases, sync script trust), `## Inventory` (`| Component | Plate file | Target file | Base | Class | Decision | Evidence |`), `## Fork Ledger` (`| Component | File | Hunk/symbol | Keep/Pull/Ask | Reason |`), `## Apply Rows` (`| Row | Action | Files | Why | Verification |`), `## Questions`, `## Verification Plan`, and `## Status Update Rule`.

## Dashboard and apply

Dashboard actions: `Pull`, `Keep Fork`, `Smart Merge`, `Reject`, `Ask`. Copied apply payload format:

```md
$sync-plate-ui apply ../app

Rows:
- code-block/4989/language-label: Pull note: safe upstream-only render hunk
- code-block/4989/toolbar-style: Keep Fork note: the app's toolbar owns layout

Questions:
- ai-menu/streaming: Should the app keep its custom stream controls?
```

Only `Rows` mutate state; `Questions` are answered in chat.

Before applying: re-read plan and target files, recompute row classifications, confirm rows still match current Plate and target source, and record target package manager and verification commands.

Never overwrite a whole target file unless all four hold: every local hunk matches `base` after transforms, there are zero `local-only` hunks, the plan marks the row `pull-upstream`, and the accepted payload names that file or component.

After applying: update `.plate-ui-sync/status.json` and fork ledgers, run focused target verification (typecheck, lint, test, plus browser proof whenever a visible target route changes), record results with package manager and cwd in the run plan, and leave unrelated files untouched.

## Gates and output

**Start gates:** resolve scope/plan, target repo path, Plate source ref (or uncommitted checkout), target `components.json` and package manager, `status.json` (or bootstrap), changelog or fallback evidence, Plate-to-target file map, output budget, and mode.

**Completion gates:** Planning requires run artifacts under `.plate-ui-sync/runs/**`, complete inventory with hunk-level class (or `unknown-base` blocker) and decision per row, isolated questions, requested dashboard artifacts, and no unchecked row without a recorded blocker. Apply requires revalidated rows, updates strictly for accepted rows, target verification (or blocked with evidence) plus browser proof for visible routes, package manager/cwd recorded, remaining open decisions listed, and no unchecked accepted rows.

**Output shapes:**
- Status: `Status: <fresh | needs-plan | stale-source | stale-target | bootstrap-needed | blocked>`, `Target`, `Components tracked`, `Open decisions`, `Next`.
- Plan: `Target`, `Scope`, `Plan`, `Dashboard`, decision count table (`pull-upstream`, `keep-fork`, `smart-merge`, `needs-question`), and `Next`.
- Apply: `Applied`, `Kept forks`, `Target verification`, `Open decisions`, `Status: <target>/.plate-ui-sync/status.json updated`.
