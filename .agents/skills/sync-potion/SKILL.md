---
description: Sync Potion (../potion) to a published Plate beta of its packages (platejs, plitejs) and the UI components (src/registry) at that beta's tag, from a Plate session. Use for "sync Potion" or 同步 Potion.
argument-hint: '[version] [--packages-only | --ui-only] [--style <name>] [--no-add]'
name: sync-potion
metadata:
  skiller:
    source: .agents/rules/sync-potion.mdc
---

# Sync Potion

Handle $ARGUMENTS.

Potion's Plate packages and UI components follow Plate's published betas. Potion may restyle a component and change its interaction once the owner calls that component ready, and a sync keeps those changes and merges in only Plate's bug fixes. This skill runs one Potion command, then checks what it wrote.

## Paths

- Before any change, read the `potion` skill and its registry reference (`.agents/rules/potion/references/registry.md`) in full.

## Before you run it

- The owner releases the Plate beta by hand before each sync. This skill never merges the version PR and never publishes. It syncs to npm's `beta` tag, the newest beta, unless the request names a version.
- When Potion waits on a Plate fix, such as one its plan, friction log or regressions file names, check that the beta holds it: `git merge-base --is-ancestor <fix commit> platejs@<version>` in Plate, after `git fetch origin tag platejs@<version>`. When the beta lacks it, stop and tell the owner which fix it lacks.
- Copy into the Potion worktree, from Potion's main checkout, the env files git ignores. The worktree needs no `bun install` first, because the command installs the packages before it syncs the UI. `--ui-only` needs `node_modules/.bin/biome` to exist already.
- To reproduce a bug or prove a Plate fix in Potion before it has a beta, follow the Potion stack recipe (`.agents/rules/potion/references/stack.md`) instead.

## Command

Run it in the Potion worktree:

```bash
bun run sync:plate [version]
```

Arguments:

- `[version]`: the Plate beta, such as `54.0.0-beta.7`. It defaults to `npm view platejs@beta version`.
- `--packages-only` or `--ui-only`: sync one half.
- `--style <name>`: the registry style overlay, `radix-nova` by default.
- `--no-add`: list the npm packages Potion lacks without running `bun add`.
- `--local <plate-path>`: pack the packages from a Plate checkout into `tmp/plate-local/` instead of using a beta. Only the stack recipe's proof uses it, and nothing it writes is ever committed.

## What it does

1. Fetches the tag `platejs@<version>` into Plate's main checkout and adds a detached Plate worktree at that tag in a temp folder, which it removes when it exits.
2. Pins `platejs` and `plitejs` in Potion's `package.json`, in `dependencies` and `overrides`, to the exact version, runs `bun install` and deletes `tmp/plate-local/`. It then runs `bun add` for each optional peer Potion lacks, such as mammoth or jszip, at the version Plate's `apps/www`, or the package's own devDependencies, uses at that tag.
3. Reads the tag's `apps/www/public/r/*.json`, applies `src/__registry__/overlays/<style>/` and writes the components, hooks, lib files and example values into `src/registry`. It copies the hooks, lib files and example values the registry lacks straight from source, rewrites import aliases and runs `biome check --write`. A file that differs from what the last sync wrote, which `bases` in `last-sync.json` records, counts as changed by Potion. The command keeps Potion's version, saves Plate's new version as `.plate-ui-sync/base/<path>.base` and writes Plate's change since the last sync as `tmp/plate-sync/review/<plate commit>/<path>.diff`. Before `bases` exists, the committed file counts as the last sync.
4. Runs `bun add` for each package a synced file imports that Potion lacks. When `node_modules` already holds the package as an indirect dependency, it pins that version, so no second copy loads; two copies of `@radix-ui/react-tooltip` leave Tooltip without its TooltipProvider.
5. Writes `.plate-ui-sync/last-sync.json`, with the tag's Plate commit and the `bases` of every synced file, and prints the version Potion now runs.

## After it runs

1. For each file the report lists as changed by Plate and restyled by Potion, read its diff in `tmp/plate-sync/review/`. Merge Plate's bug fixes into Potion's version by hand, leave out Plate's style and interaction changes, and delete the diff once merged. When the base is unknown (`.upstream`), compare Plate's whole file and pick out the bug fixes.
2. Read the rest of the report:
   - A missing `@/registry/ui/*` is a shadcn component Potion lacks. Add it to `src/registry/ui` with the shadcn CLI.
   - Delete a file Plate no longer ships once nothing imports it. Keep Potion's own files: its tools in hooks and lib, and the files in the registry reference's table of Potion-only registry components.
3. Run `bun typecheck`, then drive the editor in a browser as the Potion stack recipe (`.agents/rules/potion/references/stack.md`) says.
4. An error in `src/registry` or in a Plate package is Plate's problem. Never fix it or work around it in Potion; handle it as the `potion` skill's Plate problems section says. Fix an error in Potion's own code, such as `src/components` or `src/server`, as usual.
5. Commit in the Potion worktree with the version in the subject, fast-forward Potion's `next` and push it.
6. Open the reply with the version Potion now runs, such as `platejs@54.0.0-beta.7`, then give the size of the change from `git diff --stat` and the Plate commit range.
