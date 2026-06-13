# plate ui changelog entrypoint

Objective:
Implement Plate UI changelog as a human and agent entrypoint; done when
`/docs/components/changelog` renders generated changelog events, public
`/registry/changelog` index/component/event JSON routes work, latest-10 output
still has 3 events and 10 entries, and focused checks pass.

Completion threshold:
- `content/docs/components/changelog.mdx` uses a generated renderer instead of
  hand-written changelog prose.
- The generator writes event JSON plus `index.json` and `components.json`.
- Public JSON routes serve:
  `/registry/changelog/index.json`,
  `/registry/changelog/components.json`, and
  `/registry/changelog/{event}.json`.
- The docs page includes a human section and an agent section with
  `npx skills add sync-plate-ui` and raw JSON links.
- The latest-10 trial still produces 3 events and 10 row entries.
- Focused tests, docs source generation, lint, route/browser proof, and the
  autogoal checker pass.

Verification surface:
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- `pnpm --filter www exec bun test src/app/registry/changelog/index.json/route.test.ts src/app/registry/changelog/components.json/route.test.ts 'src/app/registry/changelog/[event]/route.test.ts'`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10 --write`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10`
- Structural audit over `apps/www/src/registry/changelog`
- `pnpm --filter www build:source`
- `pnpm lint:fix`
- Browser proof for `/docs/components/changelog` and public JSON routes when a
  dev server can run.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-plate-ui-changelog-entrypoint.md`

Constraints:
- Keep `/docs/releases` as package-release territory.
- Keep `/api/registry-source/[name]` internal docs hydration; use explicit
  public `/registry/changelog` routes for this contract.
- Do not run `build:registry`.
- Do not commit, push, or create a PR.
- Do not rerun autoreview unless explicitly requested; the user stopped it.
- Do not flatten shadcn sync policy into this component-changelog work.

Boundaries:
- Expected changes:
  `tooling/scripts/generate-ui-changelog-entries.mjs`,
  `tooling/scripts/generate-ui-changelog-entries.test.mjs`,
  `apps/www/src/registry/changelog/*.json`,
  `apps/www/src/lib/registry-changelog.ts`,
  `apps/www/src/components/plate-ui-changelog.tsx`,
  `apps/www/src/app/registry/changelog/**`,
  `apps/www/src/components/mdx-components.tsx`,
  `content/docs/components/changelog.mdx`,
  `content/docs/meta.json`.
- Non-goals: formal external JSON Schema, full-history generation, CI release
  wiring, `sync-plate-ui` implementation, and downstream merge application.

Blocked condition:
None currently. The repo has enough generated data, docs routing, and route
patterns to implement the slice.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `task`, `autogoal`, and `docs-creator`; inspected `sync-shadcn` because it is the comparison source. |
| Active goal checked or created | yes | Active goal created for the changelog entrypoint. |
| Source of truth read before edits | yes | Read existing changelog MDX, generated JSON, release page structure, MDX component map, route patterns, shadcn changelog page, and sync-shadcn status/plan artifacts. |
| User requirements extracted | yes | Requirements listed in this plan's threshold and constraints. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| TDD decision before behavior change | yes | Add generator/index tests and JSON route tests; browser proof for rendered docs. |
| Branch decision for code-changing task | yes | No branch change; user did not request commit or PR. |
| Release artifact decision | yes | N/A: generated metadata only, no package release artifact. |
| Browser tool decision for browser surface | yes | Browser proof required because docs UI changes. |
| PR expectation decision | no | N/A: no PR requested. |

Work Checklist:
- [x] Generator writes `index.json`.
- [x] Generator writes `components.json`.
- [x] Public JSON loader and routes are implemented.
- [x] JSON route tests are added.
- [x] Docs renderer is implemented.
- [x] MDX changelog page uses renderer.
- [x] Metadata/nav title updated to Plate UI Changelog.
- [x] Latest-10 artifacts regenerated.
- [x] Focused tests pass.
- [x] Docs source generation passes.
- [x] Lint passes.
- [x] Browser proof recorded or blocked honestly.
- [x] Autogoal checker passes.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Latest-10 generation writes 3 event JSON files, 10 row entries, `index.json`, and `components.json`; HTTP proof shows rendered docs and public JSON routes. |
| Bug reproduced before fix | no | N/A: feature implementation, not bug reproduction. |
| Targeted behavior verification | yes | Generator tests, route tests, generator dry run, structural audit, and HTTP proof all passed. |
| TypeScript or typed config changed | yes | `pnpm --filter www typecheck` passed after lint formatting. |
| Package exports or file layout changed | no | N/A: no package exports or barrels. |
| Package manifests, lockfile, or install graph changed | no | N/A: no install graph changes. |
| Agent rules or skills changed | no | N/A: no skill implementation in this slice. |
| Workspace authority proof | yes | Commands run in `/Users/zbeyens/git/plate`. |
| Browser surface changed | yes | HTTP proof passed for `/docs/components/changelog` and JSON routes on `localhost:3004`; Browser automation blocked because the exposed tool surface only had Node REPL and the Playwright fallback lacked its local browser binary. |
| CI-controlled template output changed | no | N/A: no templates. |
| Package behavior or public API changed | no | N/A: app public JSON route, not package API. |
| Registry-only component work changed | yes | Generated registry changelog artifacts and docs renderer. |
| Docs or content changed | yes | MDX source generation and docs source parity passed through `pnpm --filter www typecheck`; HTTP proof confirmed the hidden internal source text is not rendered. |
| High-risk mini gate | yes | Risk: public route contract drift; proof covers route JSON and visible docs links. |
| Agent-native review for agent/tooling changes | no | N/A: references a skill command but does not edit agent tooling. |
| Local install corruption suspected | no | N/A unless verification shows env-rot signals. |
| Autoreview for non-trivial implementation changes | no | Skipped because user stopped autoreview. |
| PR create or update | no | N/A: no PR requested. |
| Tracker sync-back | no | N/A: no tracker. |
| Final handoff contract | yes | Pending final response with paths and proof. |
| Final lint | yes | Pending final `pnpm lint:fix`. |
| Goal plan complete | yes | Pending checker. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source audit | complete | Existing docs/router/generator/shadcn references read. | done |
| Implementation | complete | Generator, public JSON routes, docs renderer, MDX wiring, nav title, and latest-10 JSON artifacts implemented. | done |
| Verification | complete | Generator tests, route tests, generator dry run, structural audit, typecheck, and final lint passed. | done |
| Browser proof | complete | HTTP proof passed; Browser automation blocker recorded. | done |
| Closeout | complete | Goal plan updated for checker and final handoff. | done |

Verification evidence:
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10 --write`: wrote 3 event files plus `index.json` and `components.json`.
- Structural audit over `apps/www/src/registry/changelog`: 3 events, 10 row entries, 15 component keys, PRs 4989/4987/4941, releases `unreleased`/`v53.0.7`/`v53.0.0`, no old top-level `pr`/`commit`/`provenance`/`warnings` fields.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`: 7 pass, 0 fail.
- `pnpm --filter www exec bun test src/app/registry/changelog/index.json/route.test.ts src/app/registry/changelog/components.json/route.test.ts 'src/app/registry/changelog/[event]/route.test.ts'`: 5 pass, 0 fail.
- `pnpm --filter www typecheck`: passed after `build:source`, docs source parity, registry source check, and TypeScript checks.
- `pnpm lint:fix`: final pass checked 3254 files with no fixes applied.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --limit 10`: would write 3 registry changelog events from 10 source rows.
- HTTP proof on `http://localhost:3004/docs/components/changelog`: 200, title present, `npx skills add sync-plate-ui` present, latest event present, internal source text absent.
- HTTP proof on `http://localhost:3004/registry/changelog/index.json`, `components.json`, and latest event JSON: 3 events, 15 component keys, latest PR 4989, latest release `unreleased`.
- Browser automation: blocked because tool discovery exposed Node REPL only, and Playwright fallback failed earlier with missing local Chromium executable.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-plate-ui-changelog-entrypoint.md`: `[autogoal] complete`.

Open risks:
- Formal JSON Schema remains future work.
- `sync-plate-ui` itself is not implemented in this slice.
- Full-history generation may need more provenance cleanup.

Reboot status:
| Question | Answer |
|----------|--------|
| Active goal | Plate UI changelog human and agent entrypoint. |
| Current state | Implementation and verification complete. |
| Next command | Run autogoal checker, then close the active goal. |
