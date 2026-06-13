# add plate ui changelogs 53 52

Objective:
Add the missing Plate UI registry changelog entries for v53 and v52.

Completion threshold:
- `tooling/data/plate-ui-changelog.mdx` represents every detected v53/v52
  registry-changing PR from the release-index audit.
- `apps/www/src/registry/changelog/*` is regenerated from the MDX source.
- Generated index data contains the expected PR set:
  4762, 4792, 4800, 4811, 4814, 4872, 4876, 4891, 4902, 4912, 4930, 4941,
  4945, 4987, and 4989.
- `/docs/releases` serves with the generated Plate UI cards.

Verification surface:
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write`
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- generated changelog index/components JSON inspection
- `pnpm lint:fix`
- HTTP proof for `http://localhost:3000/docs/releases`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-add-plate-ui-changelogs-53-52.md`

Constraints:
- Do not add package `.changeset` files for registry-only changelog data.
- Do not modify registry component source.
- Preserve unrelated local changes in the checkout.

Boundaries:
- Edited source: `tooling/data/plate-ui-changelog.mdx`.
- Edited generator: `tooling/scripts/generate-ui-changelog-entries.mjs`.
- Edited test: `tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- Generated output: `apps/www/src/registry/changelog/*`.
- Goal plan: this file.

Blocked condition:
No blocker remains. GitHub provenance and local release-index data were
available.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Active goal | yes | `get_goal` returned the active goal for this plan |
| Source of truth | yes | Read `tooling/data/plate-ui-changelog.mdx` and generator source |
| Release artifact | yes | Registry changelog only; no package `.changeset` |
| Browser surface | yes | `/docs/releases` on the running local docs server |
| Tracker sync | no | No issue or Linear tracker attached |
| Branch handling | no | User did not ask for commit, push, or PR |
| Agent-native review | no | No agent skill or rule source edited in this task |

Work Checklist:
- [x] Audit set identified from v52/v53 release data and registry-changing PRs.
- [x] Missing source rows added to `tooling/data/plate-ui-changelog.mdx`.
- [x] Generator repaired to prefer explicit changelog commit hints over `git blame`.
- [x] Generator test updated for the expanded source fixture.
- [x] Registry changelog JSON regenerated.
- [x] Generated index verified against the expected PR set.
- [x] Component lookup verified for representative affected registry items.
- [x] Lint fixer run.
- [x] Releases route verified over HTTP.
- [x] No package changeset added because this is registry changelog data only.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Registry changelog source | yes | Update MDX source and generated JSON | Source has v53/v52 rows; generator wrote 15 events |
| Generator correctness | yes | Test changed generator behavior | `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs` passed |
| Missing PR audit | yes | Compare generated PRs with audit set | missing `[]`, extra `[]` |
| Lint | yes | Run repo lint fixer | `pnpm lint:fix` checked 3266 files |
| Browser proof | yes | Verify route response and rendered content | `curl` returned `200 text/html`; HTML contains Plate UI cards |
| Package changeset | no | Record reason | Registry-only generated changelog data, no package runtime/API delta |
| PR/tracker sync | no | Record reason | User did not request PR; no tracker attached |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Audit | complete | 15 expected PRs recorded | implementation complete |
| Implementation | complete | MDX, generator, test, generated JSON updated | verification complete |
| Verification | complete | tests, lint, JSON audit, HTTP proof | closeout |
| Closeout | complete | plan evidence recorded | final response |

Verification evidence:
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` wrote 15
  registry changelog events from 30 source rows.
- Generated `index.json` contains PRs 4762, 4792, 4800, 4811, 4814, 4872,
  4876, 4891, 4902, 4912, 4930, 4941, 4945, 4987, and 4989 with no missing or
  extra PRs.
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs` passed 7
  tests.
- `pnpm lint:fix` completed.
- `curl -sS -o /tmp/plate-releases.html -w '%{http_code} %{content_type}\n' http://localhost:3000/docs/releases`
  returned `200 text/html; charset=utf-8`.
- Browser callable was not exposed by tool discovery in this turn, so proof used
  HTTP plus rendered HTML inspection.

Reboot status:
Complete. The source MDX, generator, generator test, generated changelog JSON,
and plan are updated.

Open risks:
None. PR 4989 remains unreleased by design, so its generated event keeps the
existing unreleased diagnostic.
