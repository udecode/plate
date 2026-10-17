# Pstack sync from plate-2

The workflow owners come from one commit of the plate-2 checkout:
`.agents/playbooks`, `.agents/rules` with their resources, the installed
skills that `skills-lock.json` lists, and the `tooling/scripts` helpers those
owners run. [pstack-source.json](pstack-source.json) records that commit, the
25 skill names, a hash of every source file and the skill names an earlier
migration retired. Ten installed skills keep their source bytes and lock
provenance. Fifteen rule owners generate the other skills.

plate-2 builds Plate on a new editor engine, Plite. This checkout is the
published Slate-based framework. So the sync copies each owner whole and only
cuts its new-engine lines or maps them to their Slate equivalent.
[pstack-adaptations.json](pstack-adaptations.json) lists every source file
left out, with its reason. [pstack-adaptations.patch](pstack-adaptations.patch)
holds every line edit.

## Run a sync

```bash
node tooling/scripts/sync-workflow-source.mjs --write
```

`--write` reads `../plate-2` at `HEAD`, or at the commit that `--commit`
names. It lays down the source bytes, applies the patch, deletes local owner
files the source lacks and rewrites pstack-source.json. When upstream moved a
line that a hunk edits, that hunk no longer applies. `--write` still writes
every other hunk, prints the rejected ones and exits 1. Re-apply those by hand.

```bash
node tooling/scripts/sync-workflow-source.mjs --report
```

`--report` lists each line of an adapted Markdown owner that still names the
new engine, a path this checkout lacks, a package script or `PLATE_*`
variable that no workspace defines, or a code-shaped name, such as a member
path, a constant or a `@platejs/*` specifier, that no file outside `.agents`
and the docs prose spells. The `accept` list in
pstack-adaptations.json clears the hits that are correct here, each with its
reason. Fix every other hit in its owner.

```bash
node tooling/scripts/sync-workflow-source.mjs --record
node tooling/scripts/sync-workflow-source.mjs --check
pnpm run prepare
pnpm check:workflow
```

`--record` saves the local owner edits as the patch. It refuses a source file
deleted locally until the file has an `omit` entry. `--check` fails when an
owner differs from the recorded commit plus the adaptations.

The copied `tooling/scripts` helpers keep their source bytes unless Plate
needs a fix.
`biome.jsonc` turns off the four style rules plate-2's copies of
`proof-worktree.mjs`, `teaching-sweep.mjs` and `trial-power.mjs` break, so the
patch holds no lint rewrites. It does hold one Plate fix that plate-2 lacks:
`proof-worktree.mjs` refuses a `--dir` and `--name` whose log lands inside the
worktree, even through a symlink that does not resolve yet.

## Mapping rules

- Plite as the editor base becomes Slate. `plitejs` becomes `@platejs/slate`
  or `platejs`.
- The new plugin API maps to Plate's. `definePlugin` becomes
  `createSlatePlugin` or `createPlatePlugin`, `toReactPlugin` becomes
  `toPlatePlugin`, `editor.update.*` becomes `editor.tf.*`,
  `editor.plugin(Plugin).api` becomes `editor.getApi(Plugin)` and
  `configure({ component })` becomes `withComponent`.
- `docs/vision/*.md` becomes the root `VISION.md`. The Redesign from First
  Principles section of `docs/vision/common.md` becomes the
  `pstack:principle-redesign-from-first-principles` skill.
- `docs/research/sources/plate-notes/` becomes `docs/solutions/`. Research
  runs live in `docs/research/runs/<date>-<topic>/`.
- The harvest lane `slate-v2` becomes `slate`, the raw Slate checkout at
  `../slate`.
- Registry paths follow this checkout. Copied UI lives in
  `apps/www/src/registry/ui` and kits in
  `apps/www/src/registry/components/editor`. Metadata lives in
  `registry-ui.ts`, `registry-kits.ts`, `registry-components.ts` and
  `registry-examples.ts`, and `registryDependencies` stay authored.
- Commands follow this checkout: Bun through `pnpm --filter <package> test`,
  the `tooling/config/bunTestSetup.ts` preload, Biome and ESLint. `pnpm e2e`
  has no specs here, so browser proof runs through `verify`'s Drive section.
- The patch cuts these new-engine tools wherever they appear: the hand drive,
  playtest and tester-pass runners, the entrypoint graph and test partitions,
  `@platejs/cli`, the `apps/plite` runners, Oxlint, the device lane, the
  `registry/bases` provider variants, `check:plite*` and the Plite
  release-readiness producer.
- The patch also cuts plate-2's review ledger and its front-matter fields.
  The ledger itself is not engine-specific, but its scopes list plate-2's
  packages and `review-ledger.mjs` is not ported, so `verdict`'s `next` has
  no picker here, as before this sync.
- The patch also cuts plate-2's rules for working `main` PRs in `../plate` and
  its `next` delivery overrides, because this checkout delivers by commit and
  PR into `main`.

`plate-ui/rules/component-shape.md`, `plate-ui/rules/registry.md` and
`sync-plate-ui.mdc` changed in plate-2 only for the new engine, so the patch
keeps this checkout's text for them.

## Omitted source files

- verify's `cli.md`, `hand-drive.md`, `playtest.md` and `tester-pass.md`
  drive tools this checkout does not have. verify's Hand drive section keeps
  the drive's page states, its six moves and its drift rule.
- benchmark's `autoresearch.md` runs the Plite Autoresearch loop.
- maintainer's `slate-issue.md` targets `udecode/slate`, the new engine's
  repository, through Plate PRs to `next`. Here the `slate-issue` mode sends a
  plain Slate defect upstream instead.
- plate-plugins' `capabilities.md`, `package-host.md` and
  `plugin-authoring-audit.md` teach the new plugin API, its staged
  capabilities and its entrypoint graph. plate-plugins' Package Boundaries
  section keeps the dependency, peer and CommonJS import rules.
  `creation-flow.md` and `typing.md` land with their new-engine sections cut.

## Retired workflow

pstack-source.json's `removedSkills` records every skill name an earlier
migration removed. The user authorized their removal, including alternate
Claude-only aliases. The workflow keeps no old controller only to preserve a
second entrypoint. Each retired capability group has this surviving owner.

| Retired capability | Surviving owner |
| --- | --- |
| Task, goal, major-task and completion controllers | pstack lifecycle, project playbooks and plan-page |
| Autoreview, reviewer personas, grill and review sweep | Configured pstack review gates and verdict |
| Plugin creator, component and React wrappers | plate-plugins and plate-ui |
| Docs creator and registry-changelog wrappers | plate-docs and changeset |
| Performance and benchmark personas | benchmark and verify |
| Research wiki, editor harvest and issue sweeper | research, issue-harvester and maintainer |
| Potion collaboration comparison | verify, with its retained conditional collaboration recipe |
| Separate test, TDD and test-review wrappers | pstack:tdd when requested, verify and test-audit |
| Promote and main-to-next wrappers | release-lanes |
| Slate-v2/Ralph/OMX/autoresearch controllers | Omitted from this Slate-based maintainer workflow |
| Generic vendor skills absent from the source set | User-authorized cut; the installed pstack plugin supplies its own generic method |

Historical plans, research results and editor evidence retain their provenance.
Live command guides and template preset hooks do not route to retired owners.
Generated consumer templates remain CI output; their canonical preset contains
no root maintainer skill imports or legacy prompt injection.
