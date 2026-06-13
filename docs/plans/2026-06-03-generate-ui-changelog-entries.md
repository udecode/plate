# collapse registry changelog output by change unit

Objective:
Collapse registry changelog output to one JSON file per change unit; done when
the latest 10 source changelog rows generate exactly 3 grouped event files by
PR/commit, stale row-level files are removed, and focused checks pass.

Completion threshold:
- The latest 10 rows in `content/docs/components/changelog.mdx` generate 3
  registry changelog event files.
- Grouping key preference is PR number, then commit SHA, then source row ID when
  provenance is unavailable.
- Each grouped event keeps row-level migration data under `entries`.
- Top-level `pr` is the source/change PR; release dependency PR stays under
  `release.versionPackagePr`.
- Release dependency resolution uses PR mentions in release-index content before
  any date fallback.
- Stale one-row JSON files from the trial generation are removed.
- Focused tests, dry-run generation, count audit, docs source generation, lint,
  and autogoal checker pass.

Verification surface:
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10 --write`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10`
- Count audit over `apps/www/src/registry/changelog/*.json`
- `pnpm --filter www build:source`
- `pnpm lint:fix`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-generate-ui-changelog-entries.md`

Constraints:
- Do not invent provenance.
- Do not emit multiple files for one PR.
- Keep the filename standard as `<date>-<slug>.json`.
- Do not keep `pr: null` or `commit: null` when local git/GitHub evidence can
  resolve them.
- Do not rerun autoreview; the user stopped it.
- Do not commit, push, create a PR, or wire CI in this slice.

Boundaries:
- Generator and tests:
  `tooling/scripts/generate-ui-changelog-entries.mjs`,
  `tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- Generated JSON:
  `apps/www/src/registry/changelog/*.json`.
- Durable plan:
  `docs/plans/2026-06-03-generate-ui-changelog-entries.md`.
- Non-goals: full-history import, public raw routes, per-component indexes,
  release workflow wiring, browser route work, and auto-merging downstream forks.

Blocked condition:
None. Git blame and GitHub PR lookup resolved the current trial rows, and the
open PR state is recorded honestly.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal` because the request has a measurable artifact count and proof commands. |
| Active goal checked or created | yes | Active goal requires 10 source rows to collapse into 3 grouped event files. |
| Source of truth read before edits | yes | Inspected generator, tests, existing generated files, and git/GitHub provenance for the current changelog rows. |
| Tracker comments and attachments read | no | N/A: no tracker item in this slice. |
| Video transcript evidence required | no | N/A: no video. |
| TDD decision before behavior change | yes | Added grouped-event tests with injected provenance and release-index fixtures. |
| Branch decision for code-changing task | yes | No branch change; user did not ask for commit or PR. |
| Release artifact decision | yes | Release dependencies are metadata in generated JSON, not package artifacts. |
| Browser tool decision for browser surface | no | N/A: generated JSON and Node script only; no route consumes this output yet. |
| PR expectation decision | no | N/A: no PR requested. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are concrete.
- [x] Current complaint classified: many JSON files per PR is wrong.
- [x] Grouping contract selected: PR, then commit, then source row fallback.
- [x] Provenance contract kept: populate PR/commit when evidence exists.
- [x] Release dependency contract repaired: source/change PR is separate from
      Version Packages PR.
- [x] Row-level migration details preserved under grouped `entries`.
- [x] Latest 10 trial rows regenerated as 3 grouped events.
- [x] Stale row-level generated files removed.
- [x] Open PR 4989 recorded with warning and no release dependency.
- [x] PR 4987 mapped to release `v53.0.7`.
- [x] PR 4941 mapped to release `v53.0.0`.
- [x] Focused tests updated and passed.
- [x] Dry-run generation passed.
- [x] Count audit passed.
- [x] `www build:source` passed.
- [x] `pnpm lint:fix` passed after removing the dead row-level helper.
- [x] Autoreview decision recorded: skipped because the user stopped it.
- [x] No git commit, push, or PR created.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Latest 10 rows generate 3 grouped event files with 10 total row entries. |
| Bug reproduced before fix | yes | Existing output had 10 one-row JSON files for 3 change units. |
| Targeted behavior verification | yes | Unit tests and generated output prove one event per PR/commit change unit. |
| TypeScript or typed config changed | no | N/A: JS tooling and JSON only. |
| Package exports or file layout changed | no | N/A: no exports or barrels. |
| Package manifests, lockfile, or install graph changed | no | N/A: no install graph changes. |
| Agent rules or skills changed | no | N/A: no agent rule or skill edits in this slice. |
| Workspace authority proof | yes | All commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | no | N/A: no browser route or UI surface consumes these files yet. |
| CI-controlled template output changed | no | N/A: no templates touched. |
| Package behavior or public API changed | no | N/A: script output shape changed only for generated changelog metadata. |
| Registry-only component work changed | yes | Registry changelog JSON now groups by change unit and keeps item entries inside the event. |
| Docs or content changed | yes | Plan updated; `content/docs/components/changelog.mdx` was read but not changed. |
| High-risk mini gate | yes | False dependency risk reduced by PR-matched release lookup; ambiguous release/date fallback still refuses to guess. |
| Agent-native review for agent/tooling changes | no | N/A: no agent-action tooling changed. |
| Local install corruption suspected | no | N/A: no env-rot signal. |
| Autoreview for non-trivial implementation changes | no | Skipped because the user explicitly stopped autoreview. |
| PR create or update | no | N/A: no PR requested. |
| Tracker sync-back | no | N/A: no tracker. |
| Final handoff contract | yes | Final response includes changed files, grouping result, and proof commands. |
| Final lint | yes | `pnpm lint:fix` passed with no fixes applied on final run. |
| Goal plan complete | yes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-generate-ui-changelog-entries.md` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source audit | complete | Existing output had 10 JSON files; git/GitHub grouped those rows into PRs 4989, 4987, and 4941. | done |
| Implementation | complete | Generator groups rows by PR/commit/source and builds grouped events with row `entries`. | done |
| Generation | complete | `--limit 10 --write` wrote exactly 3 event files. | done |
| Verification | complete | Tests, dry-run, count audit, build source, and lint passed. | done |
| Closeout | complete | Plan updated for the actual grouping contract. | done |

Findings:
- The many-files-per-PR output was wrong. One PR-level change should be one
  sync unit, with row details nested under it.
- `pr: null` and `commit: null` were also wrong for this batch. Blame plus
  GitHub PR search resolves the current rows.
- PR 4989 is open, so it has no release dependency yet.
- PR 4987 is released in `v53.0.7`.
- PR 4941 is released in `v53.0.0`.

Decisions and tradeoffs:
- Use one standard filename style: `<date>-<slug>.json`.
- Use PR title for event slug/title when PR exists.
- Keep `entries` as the agent-facing row-level payload so downstream sync can
  merge each affected registry item without splitting the event file.
- Keep release dependency as metadata on the grouped event, not as the filename.

Implementation notes:
- `buildRegistryChangelogEvents` now groups rows before writing.
- `resolveReleaseForChangeUnit` matches `release-index` content by PR number.
- `resolveReleaseForRow` remains as the legacy date-fallback helper for tests
  and compatibility.
- `commits` records all distinct row commits inside the grouped event.

Review fixes:
- Removed stale row-level generated JSON files.
- Removed unused `formatEventId` after lint caught it.
- Reran focused checks after lint formatting.

Verification evidence:
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10 --write`
  -> wrote 3 registry changelog events from 10 source rows:
  `2026-06-03-show-code-block-language-labels-read-only-mode.json`,
  `2026-06-02-improve-large-document-editing.json`,
  `2026-04-23-redesign-blockquotes-container-blocks.json`.
- JSON audit -> PR 4989 has `prState: "OPEN"`, commit `a471d05`, release
  `null`, 1 entry, and warnings for open/unreleased state.
- JSON audit -> PR 4987 has commit `68560cc`, release `v53.0.7`, and 2
  entries.
- JSON audit -> PR 4941 has commit `700286b`, release `v53.0.0`, and 7
  entries.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs` -> 7 pass,
  0 fail.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10` -> would
  write 3 registry changelog events from 10 source rows.
- Count audit -> `{ "events": 3, "entries": 10, "prs": 3, "commits": 3,
  "open": 1, "releases": [null, "v53.0.0", "v53.0.7"] }`.
- `pnpm --filter www build:source` -> generated docs source successfully.
- `pnpm lint:fix` -> final run checked 3244 files and applied no fixes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-generate-ui-changelog-entries.md`
  -> `[autogoal] complete`.

Open risks:
- Full-history generation may expose rows where blame points to docs-copy work
  instead of original implementation work.
- Public raw routes, per-component indexes, CI release wiring, and downstream
  fork-aware merge semantics are separate follow-up work.
- GitHub PR lookup still depends on local `gh` availability and auth.

Reboot status:
| Question | Answer |
|----------|--------|
| Active goal | Collapse registry changelog output to one JSON file per change unit. |
| Current state | Complete. |
| Last proof | Tests, dry-run, count audit, `www build:source`, and lint passed. |
| Next command | Close the active goal. |
