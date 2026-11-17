---
description: Sync Potion (../potion) to Plate's newest packages (platejs, plitejs) and every Plate UI component (src/registry) from a Plate session. Use for "sync Potion", "sync Plate into Potion", "update Potion's Plate packages or UI", or 同步 Potion. Potion syncs here, not through sync-plate-ui.
argument-hint: '[plate-path] [--no-pull] [--packages-only | --ui-only] [--style <name>] [--no-add]'
name: sync-potion
metadata:
  skiller:
    source: .agents/rules/sync-potion.mdc
---

# Sync Potion

Handle $ARGUMENTS.

Potion's Plate packages and UI components follow Plate. Potion may restyle a component and change its interaction once the owner calls that component ready, and a sync keeps those changes and merges in only Plate's bug fixes. This skill runs one Potion command, then checks what it wrote.

Potion's own `.claude/skills/sync-plate` has the same method for a session that runs in Potion. This skill runs it from a Plate session. It does not use `sync-plate-ui`'s state: `.plate-ui-sync/status.json`, `forks/` and `runs/`.

## Paths

- Potion's main checkout is `potion` beside Plate's main checkout, which is the parent of `git rev-parse --path-format=absolute --git-common-dir`. Read every Potion file named below by its absolute path there. When that folder does not exist, say so and stop.
- Before any change, read Potion's `AGENTS.md`, `VISION.md` and `.claude/rules/plate-sync.mdc`.
- Deliver as Plate `AGENTS.md`'s **Potion delivery** rule says: sync and commit in a Potion worktree of its own, merge it into Potion's current branch with `git merge --ff-only`, and never push.

## Before you run it

- By default the command reads Plate's main checkout beside Potion, which must be on `next` with a clean tree. To use a Plate fix that has not landed, pass the current Plate worktree's path and `--no-pull`.
- The Potion worktree needs no `bun install` first. The command syncs the packages, which writes `tmp/plate-local/*.tgz` and runs `bun install`, then syncs the UI. `--ui-only` needs `node_modules/.bin/biome` to exist already.
- Copy into the Potion worktree, from Potion's main checkout, the tarballs in `tmp/plate-local/`, which `package.json` names through `file:` specs, and the env files git ignores.

## Command

Run it in the Potion worktree:

```bash
bun run sync:plate-local
```

Arguments:

- `[plate-path]`: the Plate checkout. It defaults to `../plate` beside Potion's main checkout, also from a worktree. A relative path resolves from Potion's root.
- `--no-pull`: skip `git pull` and use Plate's current tree.
- `--packages-only` or `--ui-only`: sync one half.
- `--style <name>`: the registry style overlay, `radix-nova` by default.
- `--no-add`: list the npm packages Potion lacks without running `bun add`.

## What it does

1. Runs `git pull --ff-only` in Plate, then `pnpm install`.
2. Builds and runs `pnpm pack` for every `file:./tmp/plate-local/*.tgz` package in Potion's `package.json`. Each tarball's name carries a content hash, such as `platejs-54.0.0-beta.1-f44336d5.tgz`, so after the command rewrites the spec in `package.json`, `bun install` resolves it as a new package and installs any new dependency. It then runs `bun add` for each optional peer Potion lacks, such as mammoth or jszip, at the version Plate's `apps/www`, or the package's own devDependencies, uses.
3. Reads Plate's `apps/www/public/r/*.json`, applies `src/__registry__/overlays/<style>/` and writes the components, hooks, lib files and example values into `src/registry`. It copies the hooks, lib files and example values the registry lacks straight from source, rewrites import aliases and runs `biome check --write`. A file that differs from what the last sync wrote, which `bases` in `last-sync.json` records, counts as changed by Potion. The command keeps Potion's version, saves Plate's new version as `.plate-ui-sync/base/<path>.base` and writes Plate's change since the last sync as `tmp/plate-sync/review/<plate commit>/<path>.diff`. Before `bases` exists, the committed file counts as the last sync.
4. Runs `bun add` for each package a synced file imports that Potion lacks. When `node_modules` already holds the package as an indirect dependency, it pins that version, so no second copy loads; two copies of `@radix-ui/react-tooltip` leave Tooltip without its TooltipProvider.
5. Clears the Turbopack dev cache and writes `.plate-ui-sync/last-sync.json`, with the Plate commit and the `bases` of every synced file.

## After it runs

1. For each file the report lists as changed by Plate and restyled by Potion, read its diff in `tmp/plate-sync/review/`. Merge Plate's bug fixes into Potion's version by hand, leave out Plate's style and interaction changes, and delete the diff once merged. When the base is unknown (`.upstream`), compare Plate's whole file and pick out the bug fixes.
2. Read the rest of the report:
   - A missing `@/registry/ui/*` is a shadcn component Potion lacks. Add it to `src/registry/ui` with the shadcn CLI.
   - Delete a file Plate no longer ships once nothing imports it. Keep Potion's own files: its tools in hooks and lib, and the files in `plate-sync.mdc`'s table of registry components only Potion has.
3. Run `bun typecheck`, then drive the editor in a browser as Potion's `verify` skill says. Read it at `.claude/skills/verify/SKILL.md` in Potion's main checkout; Plate's `verify` is a different skill.
4. An error in `src/registry` or in a Plate package is Plate's problem. Never fix it or work around it in Potion. Handle it as the "Plate v54 migration blockers" section of Potion's `AGENTS.md` says. When Plate has no API for what Potion needs, file a `udecode/plate-private` issue through `maintainer`'s issue-draft mode. Fix an error in Potion's own code, such as `src/components` or `src/server`, as usual.
5. Report the size of the change from `git diff --stat` and the Plate commit range. Then commit in the Potion worktree and merge it into Potion's current branch with `git merge --ff-only`, without pushing.
