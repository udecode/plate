# Give each Plate API rule one home

Status: superseded by [the skills redesign](2026-10-04-plate-skills-first-principles.md), whose build lands these rulings in Vision

Split out of [the pstack drift plan](2026-10-03-pstack-drift.md) at the owner's answer on 2026-10-03, because the dedup changes Plate API guidance rather than moving text.

## What the read-only map found

[The rule map](2026-10-03-best-api-dedup.map.tsv) has one row per distinct rule in `best-api.mdc` and its three references, with every other copy, whether the copies agree, the proposed home and what each copy becomes. Line numbers are as of 2026-10-03; recheck them before editing.

- 253 rules: 200 agree everywhere, 36 have a conflicting copy and 17 have no other copy.
- 167 already live in Vision (`docs/vision/plate.md` restates about 150 almost line for line, `docs/vision/plite.md` about 60), 31 need new Vision text, 21 belong to existing checks and 14 are best-api's own procedure.
- In five conflicts best-api is the stale side, so moving its text into Vision would make the guidance worse: persisted `type` and `key` defaulting to the plugin name, `insert` versus `upsert`, `tx.plugin(name)` typing, React Aria support, and registry dependencies derived from source.
- Seven files require each law change in both Vision and best-api (`best-api.mdc` twice, `common.md`, `plate.md`, `plate-ui.mdc`, `AGENTS.md` and the retired `sync.md`). Until that rule says "repair the Vision owner; best-api keeps its procedure", the next `best-api repair` restores the copies.

## Open questions

### AI previews

Should streaming an AI selection edit show as a native suggestion?

- **plate** (recommended): `docs/vision/plate.md` streams AI selection edits into a native suggestion; best-api's ban on entering Suggesting just to preview goes.
- **best-api**: keep the ban and change `plate.md`.

### api mutation

May an `api` method mutate the document?

- **mutates** (recommended): live `api.history.undo` (29 files) mutates; `capabilities.md` stops saying `api` never mutates.
- **never**: `api` never mutates and history moves to `tf`.

## Steps

1. - [ ] Rewrite the two-homes rule in all seven files.
2. - [ ] Settle the conflicts in the map, Vision and source winning except where an open question decides.
3. - [ ] Move the 31 missing rules into Vision and cut best-api to its 14 procedure rules plus links.
4. - [ ] Point each skill copy at its home, and delete the 144 duplicate copies inside Vision.
5. - [ ] Add the two missing checks (a package root exporting a `*Kit` array; `InternalBaseEditorWithInstalledPlugins` in the declaration-brands list).
6. - [ ] Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`, `node .agents/rules/plate-next/scripts/version.mjs validate`, `node tooling/scripts/review-ledger.mjs check`, one `git grep` per rule finding one law location, and a plain-request smoke for an API review.
