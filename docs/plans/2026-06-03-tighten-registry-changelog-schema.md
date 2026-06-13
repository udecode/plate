# tighten registry changelog schema

Objective:
Tighten registry changelog JSON schema; done when the generated latest-10 trial
still produces 3 event files, duplicate top-level/provenance fields are removed,
diagnostics are typed, row details remain under entries, and focused checks
pass.

Completion threshold:
- Latest 10 changelog rows still generate exactly 3 grouped event files.
- Removed old top-level soup: `pr`, `prUrl`, `prState`, `commit`, `commitUrl`,
  `commits`, `mergedAt`, `date`, `title`, `items`, `provenance`, `warnings`,
  and `sourceType`.
- Event shape is `schemaVersion`, `id`, `status`, `source`, `change`,
  `release`, `kind`, `summary`, `targets`, `entries`, `diagnostics`.
- `release` is a status object, not `null`.
- Diagnostics are typed objects, not warning strings.
- Focused tests, dry-run generation, count audit, docs source generation, lint,
  and autogoal checker pass.

Verification surface:
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10 --write`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10`
- Structural count audit over `apps/www/src/registry/changelog/*.json`
- `pnpm --filter www build:source`
- `pnpm lint:fix`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-tighten-registry-changelog-schema.md`

Constraints:
- Keep one file per change unit.
- Keep row-level summaries and migration notes under `entries`.
- Keep registry file hints for agent sync, but centralize them under `targets`.
- Do not invent provenance or release dependency data.
- Do not rerun autoreview because the user stopped it.
- Do not commit, push, create a PR, or wire CI.

Boundaries:
- Changed generator and tests:
  `tooling/scripts/generate-ui-changelog-entries.mjs`,
  `tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- Regenerated JSON:
  `apps/www/src/registry/changelog/*.json`.
- Added goal ledger:
  `docs/plans/2026-06-03-tighten-registry-changelog-schema.md`.
- Non-goals: formal JSON Schema file, public raw route, full-history import,
  per-component indexes, release workflow wiring, downstream sync application.

Blocked condition:
None. The schema was cut and the focused proof set passed.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `task`; created an `autogoal` because the cleanup had measurable schema and artifact thresholds. |
| Active goal checked or created | yes | Goal created for schema tightening. |
| Source of truth read before edits | yes | Inspected generated JSON, generator, and tests before patching. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| TDD decision before behavior change | yes | Tests now reject old top-level fields and assert typed diagnostics/targets. |
| Branch decision for code-changing task | yes | No branch change; user did not ask for commit or PR. |
| Release artifact decision | yes | N/A: generated metadata only, no package artifact. |
| Browser tool decision for browser surface | no | N/A: generated JSON/script only. |
| PR expectation decision | no | N/A: no PR requested. |

Work Checklist:
- [x] Harsh schema critique made against actual generated files.
- [x] Duplicate top-level PR/commit/provenance fields removed.
- [x] `change` object added for PR/commit identity.
- [x] `targets` added for normalized registry file hints.
- [x] Row entries reduced to summaries, migration notes, target names, and
      source line metadata.
- [x] Warning strings replaced by typed `diagnostics`.
- [x] Constant legacy warning removed as noise.
- [x] `release: null` replaced by `release.status`.
- [x] Latest 10 rows regenerated as 3 files.
- [x] Tests updated and passed.
- [x] Dry-run generation passed.
- [x] Structural count audit passed with zero old-field hits.
- [x] `www build:source` passed.
- [x] `pnpm lint:fix` passed with no fixes applied on final run.
- [x] Autoreview skipped because the user stopped it.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Latest 10 rows still generate 3 events with 10 entries and zero old-field hits. |
| Bug reproduced before fix | yes | Existing schema had duplicated top-level/provenance data and warning-string control flow. |
| Targeted behavior verification | yes | Tests assert the new schema and reject old fields. |
| TypeScript or typed config changed | no | N/A: JS script and JSON only. |
| Package exports or file layout changed | no | N/A: no exports/barrels. |
| Package manifests, lockfile, or install graph changed | no | N/A: no install graph change. |
| Agent rules or skills changed | no | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | All commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | no | N/A: no browser route/UI. |
| CI-controlled template output changed | no | N/A: no templates. |
| Package behavior or public API changed | no | N/A: generated changelog metadata only. |
| Registry-only component work changed | yes | Registry changelog JSON shape changed. |
| Docs or content changed | yes | Goal ledger added; source MDX unchanged. |
| High-risk mini gate | yes | Risk is breaking future agents with noisy or ambiguous schema; tests and audit lock the cut fields. |
| Agent-native review for agent/tooling changes | no | N/A: no agent-action tooling changed. |
| Local install corruption suspected | no | N/A: no env-rot signal. |
| Autoreview for non-trivial implementation changes | no | Skipped because the user explicitly stopped autoreview. |
| PR create or update | no | N/A: no PR requested. |
| Tracker sync-back | no | N/A: no tracker. |
| Final handoff contract | yes | Final response includes harsh take, schema changes, and proof commands. |
| Final lint | yes | `pnpm lint:fix` passed with no fixes applied on final run. |
| Goal plan complete | yes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-tighten-registry-changelog-schema.md` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Schema critique | complete | Identified duplicated provenance, warning strings, target duplication, and lazy null release state. | done |
| Implementation | complete | Reworked event shape to `change`, `release`, `targets`, `entries`, `diagnostics`. | done |
| Generation | complete | `--limit 10 --write` wrote 3 event files. | done |
| Verification | complete | Tests, dry-run, count audit, docs source, and lint passed. | done |
| Closeout | complete | Plan written for checker. | done |

Verification evidence:
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10 --write`
  -> wrote 3 registry changelog events from 10 source rows.
- Structural audit -> each file has `oldFields: []`.
- Structural audit -> `{ "events": 3, "entries": 10, "oldFieldHits": 0,
  "diagnostics": 2, "releaseStatuses": ["released", "released",
  "unreleased"] }`.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs` -> 7 pass,
  0 fail.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10` -> would
  write the same 3 event files.
- `pnpm --filter www build:source` -> generated docs source successfully.
- `pnpm lint:fix` -> final run checked 3244 files and applied no fixes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-tighten-registry-changelog-schema.md`
  -> `[autogoal] complete`.

Open risks:
- A formal JSON Schema file is still future work.
- Full-history import may expose older rows with weaker provenance.
- Downstream fork-aware sync still needs file diffs or patch bundles; this
  changelog schema is the index, not the merge engine.

Reboot status:
| Question | Answer |
|----------|--------|
| Active goal | Tighten registry changelog JSON schema. |
| Current state | Complete. |
| Last proof | Tests, dry-run, structural audit, `www build:source`, and lint passed. |
| Next command | Close the goal. |
