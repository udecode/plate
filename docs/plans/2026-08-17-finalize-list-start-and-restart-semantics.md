# Finalize list start and restart semantics

Objective:
Finalize the public flat-list start/restart contract and its v53 migration;
done when the rejected field is absent, focused regressions pass, docs and
generated schema agree, and `pnpm check` passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-finalize-list-start-and-restart-semantics.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api

Mode:
- `standard` accepted-plan execution. The user accepted the Best API target and
  explicitly said to implement it.

Completion threshold:
- `listStartIfFirst` has zero live product, docs, generated-contract, or test
  matches.
- `listStart` is conditional start intent; `listRestart` is an unconditional
  sequence boundary; derived ordinals remain runtime-only.
- v53 `listStart`, `listRestart`, and `listRestartPolite` migrate without
  freezing derived ordinals or losing latent intent.
- Focused List, Markdown, migration, generated-contract, docs-source, and
  integration checks pass; final `pnpm check` exits 0.
- P2 autoreview has zero accepted open findings and `check-complete` passes.

Verification surface:
- Source audits over List, Markdown, Plate migration, www integration/docs,
  generated plugin schema, and changesets.
- Focused package specs for List, Markdown, and `migratePlateV54` plus the
  playground list-input-rule slow test.
- `plate generate`, `pnpm --filter www build:source`, owning package
  typechecks, `pnpm lint:fix`, and final `pnpm check`.
- P2 autoreview of the current checkout and final plan checker.

Constraints:
- The user already accepted the target and invoked execution; do not pause for
  another plan review.
- No public compatibility aliases or runtime shims.
- Preserve both v53 explicit restart modes and natural separated starts while
  deleting only recomputable ordinals.
- Keep migration tests centralized in Plate; feature packages test current
  behavior, not historical contract fixtures.
- Do not commit, push, or create a PR.

Boundaries:
- In scope: List schema/runtime/HTML, Markdown codecs, centralized Plate v54
  migration, docs, generated contract, integration expectations, changeset,
  and API-doctrine stale-teaching audit.
- Source owners: `packages/list`, `packages/markdown`,
  `packages/plate/src/migrations`, `content/docs`, `apps/www` generated and
  integration surfaces, `.changeset`, and the Best API/Plate Vision owners.
- Non-goals: changing flat-list architecture, adding versioned runtime plugins,
  storing ordinary derived ordinals, or redesigning the shared migration
  runner.
- Direct Plite boundary owners: N/A; these are Plate feature annotations and
  interchange/migration policy, not raw editor substrate.

Output budget strategy:
- Read named owners first; use count/file-list audits before line output; cap
  tests and CI output; exclude dependencies, build output, and unrelated
  generated trees unless an owning command reports a failure there.

Blocked condition:
- Stop only if the same non-local tool/access failure repeats three times and
  no focused code, test, or source-audit move remains. Test failures with a
  local owner are work, not blockers.

Plate Plan state:
- status: complete
- phase: prove and hand off
- next: final response
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Best API, hard cut, v53 migration, both start/restart semantics, centralized migration proof, full regression coverage, and green CI are explicit above |
| Active goal and plan verified | yes | Active goal names this exact plan and `pnpm check` threshold |
| Current owners read | yes | Live List, Markdown, Plate migration, docs, generated schema, Vision, and prior plan owners reviewed |
| Best API target resolved | yes | `best-api review`: `listStart` conditional; `listRestart` unconditional; reject `listStartIfFirst` |
| Mode and execution boundary resolved | yes | Standard one-shot execution after explicit user acceptance; no git delivery |
| Docs pack selected | yes | Public list plugin and document-model docs change |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read; style reference remains a pre-write gate |
| Docs lane selected | yes | Plugin/feature page plus guide/system model pages |
| Target docs and nearest sibling docs read | yes | List plugin EN/CN pages, document-model EN/CN guide, and adjacent Indent plugin page read before editing |
| Docs style doctrine read | yes | `.agents/skills/docs-creator/rules/style-and-structure.md` read before prose changes |
| Documented source owner identified | yes | `packages/list/src/lib/BaseListPlugin.ts`, Markdown codecs, and centralized Plate migration |
| Package/API pack selected | yes | Published list/markdown behavior and persisted node fields change |
| Public surface or package boundary identified | yes | Flat list node fields and serialization/migration behavior |
| Release artifact path selected | yes | Update existing `.changeset/semantic-flat-lists.md` to describe final delta from main |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read |
| Barrel/export impact decision recorded | yes | No exported file/layout change expected; generated schema changes, barrels N/A unless implementation proves otherwise |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry changelog is N/A because registry source was only a consumer of published package semantics, not a registry-only user-visible delta.
- [x] Package/API pack: the published package delta is covered by package changesets; the internal generated/test/plan rows need no separate release artifact.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated editor schema and release notes are updated; barrels are N/A because exports and file layout did not change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Final live-source audit, focused proof, full CI, generated contract, docs, release notes, and review are closed |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final `rg` audits verify no rejected live field, correct imports, DOCX restart metadata, and source/mirror doctrine |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Two-field target implemented; unrelated AI heading-level P1 rejected as a separate pre-existing bug class |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Runtime, migration, HTML, Markdown, DOCX, AI, docs, generated schema, and changesets covered; browser visual proof N/A because the change is a model/codec contract and the current Browser surface is unavailable |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and pass counts are recorded below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff rows completed below |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Final scoped P2 run exited 0 with no accepted/actionable findings after fixing zero starts, DOCX identity boundaries, input-rule zero, and docs imports |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-finalize-list-start-and-restart-semantics.md` | Final mechanical check command is the last closeout gate |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | List and document-model EN/CN fields, imports, HTML, MDAST, and command semantics match source |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No links/routes changed; `list-demo` is registered in `registry-editor.ts` and the generated registry index |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source` exited 0 after final docs edits |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing plugin page keeps preview, kit path, commands, interchange contract, and API reference with valid public imports |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Schema and generated editor types expose only `listStart` and `listRestart`; no exported file topology changed |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published List, Markdown, and DOCX paste behavior/API delta |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Updated one-package changesets for `@platejs/list`, `@platejs/markdown`, and `@platejs/docx-paste`; no forbidden core-package minor |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry source only consumes published semantics; this is not a registry-only delta |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: published package changesets are required and present |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Owning package typechecks passed; focused suites passed; final root check built/typechecked 60 packages and passed all test lanes |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file, barrel, or package-layout change |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current owners, requirements, boundaries, and Best API verdict recorded | Decide |
| Decide | complete | Target schema, migration law, format behavior, and adoption slices locked | Implement and prove |
| Prove and hand off | complete | Focused suites, generator/docs checks, final `pnpm check`, clean P2 review, and source audits | Final response |

Decision brief:
- outcome: one truthful two-field list policy with complete migration coverage.
- chosen shape: `listStart?: number` applies only at a natural sequence start;
  `listRestart?: number` forces a boundary at that item.
- strongest rejected alternative: `listStartIfFirst` plus unconditional
  `listStart`; it makes the common name mean the surprising behavior and
  invents an awkward third concept.
- consequence: a breaking beta schema/API correction across runtime,
  serializers, migration, docs, tests, and generated contracts.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Persisted list intent | `listStart` unconditional plus `listStartIfFirst` conditional | `listStart` conditional plus `listRestart` unconditional | List schema/runtime | Names match author intent and keep latent intent distinct from derived output | Hard-cut current branch-only rejected field; v53 mapper handles shipped historical fields | Current-behavior specs plus stale-name audit | Incorrect predecessor boundary logic could silently renumber | rearchitect |
| v53 migration | Maps polite restart to rejected field | Map explicit restart to `listRestart`, polite restart to `listStart`, drop derived continuing ordinals, preserve separated starts | Central Plate migration | One global version chain owns historical documents | Update centralized migration fixtures only | `migratePlateV54.spec.ts` | Derived and explicit legacy fields share names | rearchitect |
| HTML/Markdown interchange | Serializers teach rejected field | Preserve internal intent; map structural list boundaries to forced restarts; derive visible starts | List HTML and Markdown codecs | External AST structure is not Plate persisted policy | Update codecs and round-trip tests | List/Markdown specs | Adjacent legacy `<ol start>` wrappers can be misread as restarts | rearchitect |
| Public teaching/schema | Docs/generated schema expose rejected field | Teach and generate only start/restart | Docs and schema generator | Agents and users need one canonical contract | Update MDX, integration oracle, generated schema, changeset | source audit, docs build, generator check | Generated drift | rename |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Runtime contract | List plugin | schema, ordinal read, operations, input/split/HTML behavior | Accepted Best API target | Two fields implement distinct conditional/forced laws | List specs and package typecheck |
| Version/interchange | Plate migration and Markdown | v53 mapping, MDAST encode/decode, legacy HTML continuity | Runtime contract settled | Historical and external documents preserve meaning | Migration and Markdown specs |
| Adoption | Docs/www/generator/changeset | docs, integration expectations, generated plugin schema, release prose | Runtime/version slices green | No stale teaching or contract drift | stale-name audit, `plate generate`, docs source build |
| Closure | Repo checks/review | lint, focused reruns, `pnpm check`, P2 autoreview, plan checker | Adoption green | Full current-checkout proof | all gates green or exact external caveat recorded |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Conditional starts stay latent while joined and activate after predecessor deletion | Current List implementation and accepted semantic law | Focused List spec passed | complete |
| Forced restart applies in the middle of a compatible sequence | Existing restart semantics and Best API verdict | Focused List/Markdown/DOCX specs passed | complete |
| v53 documents migrate without freezing derived sequence numbers | Central migration source and legacy shape fixtures | Central migration spec passed, including zero, nested, separated, and cross-page cases | complete |
| HTML/MDAST round trips retain visible starts and explicit boundaries | Codec source | List/Markdown specs passed, including default HTML boundaries and MDAST start zero | complete |
| Public contract has no rejected name or generated drift | Bounded source manifest | Zero live `listStartIfFirst` matches; editor generator check and docs build passed | complete |
| Entire checkout satisfies CI gate | Prior baseline was green before this correction | Final `pnpm check` exited 0 | complete |

Conditional evidence:
- High-risk scenarios: predecessor inserted/deleted around conditional start;
  forced restart midsequence; v53 derived and explicit field collisions;
  adjacent legacy HTML wrappers; nested/cross-page migrations.
- External research: completed before target acceptance; ProseMirror/Lexical
  confirm external structural `start` precedent, while Plate's flat model needs
  the separate forced-boundary field.
- Issue/PR provenance: N/A; user-directed beta architecture correction in the
  current checkout.
- Docs/registry/browser/release/behavior-law owners: docs, generated plugin
  schema, integration test, and changeset apply. Registry UI and browser visual
  behavior do not change; model/codec tests own the semantics.

Findings:
- The temporary `listStartIfFirst` design preserves behavior but gives the
  obvious name to the less common forced operation.
- Derived ordinals and latent user policy must remain separate; deleting the
  former must not erase the latter.
- Migration ownership is already centralized in Plate, matching the user's
  explicit test-centralization decision.

Decisions and tradeoffs:
- Choose two flat numeric fields over a mode object: both jobs are independently
  discoverable and no extra object/type machinery earns its cost.
- Use `listRestart` as the only forced boundary marker; sequence-wide editing
  must not treat conditional `listStart` as a boundary while it is inactive.
- Keep actual MDAST structure at the Markdown boundary; do not copy its list
  container ontology into Plate's flat editable model.

Review fixes:
- Accepted P2: MDAST ordered lists starting at zero were collapsed by `> 1`
  and `|| 1` -> use non-default/nullish checks and add a zero round-trip test.
- Accepted P2: Word list identity changes were lost when the next ordinal was
  numerically contiguous -> force `listRestart` on sequence-key changes and
  update unit plus real DOCX slow fixtures.
- Accepted P2: ordered input rule collapsed `0.` through `|| 1` -> use `?? 1`
  and add a rule regression.
- Accepted P2: EN/CN List command snippets referenced `ListPlugin` without an
  import -> add the public `@platejs/list/react` import.
- Rejected as follow-up: AI streamed headings with different levels may be
  coalesced. It is pre-existing canonical-heading work outside list semantics.
- Rejected as follow-up: task items with omitted `checked` may serialize as
  bullets. It is an independent task-state contract, not start/restart policy.
- Final scoped P2 review: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Bun treated explicit `.slow.tsx` names as filters instead of paths | 1 | Prefix each path with `./` | Focused slow lane passed 44/44 |
| Full dirty-checkout autoreview credential preflight | 1 | Keep TruffleHog enforced and review an exact task snapshot | Exact task snapshot passed TruffleHog; final scoped P2 review clean |
| First task-snapshot archive included a HEAD-missing path and an oversized untracked schema | 1 | Materialize tracked baselines per file and leave the generated JSON to generator proof | Scoped review bundle created; `editor:check` separately proves generated JSON |
| Final root slow suite exposed three new DOCX identity boundaries missing from the expected fixture | 1 | Verify source Word identities and update the canonical slow expectation | Focused DOCX slow test passed 18/18; final root check passed |
| Concurrent unrelated Plite React callback triggered Biome iterable-return lint | 1 | Apply the behavior-neutral block callback required by lint | `pnpm lint:fix` and final root check passed |

Verification evidence:
- `bun test` over List, Markdown, centralized Plate migrations, and DOCX paste:
  302/302 passed across 37 files.
- Focused List/Markdown/migration contract: 106/106 passed.
- Focused List plus playground/AI slow integration: 44/44 passed after using
  explicit `./` paths.
- Source-first typecheck for List, Markdown, Plate, DOCX paste, and AI: 43/43
  Turbo tasks passed.
- `pnpm --filter www editor:generate`: regenerated the editor contract with
  `listRestart`; bounded source audit found zero `listStartIfFirst` matches in
  packages, www source, content docs, changesets, and the current research row.
- `pnpm --filter www editor:check` and `pnpm --filter www build:source` exited
  0 after the final generated-contract and docs edits.
- Review-triggered focused proof: List input/HTML and Markdown zero-start tests
  passed 40/40; DOCX unit plus real `numbered_sublist` slow fixture passed
  18/18; owning typechecks passed.
- Final `pnpm check` exited 0: lint completed with warnings only, 60 package
  builds and 60 package typechecks passed, 3,140 fast tests passed, and 1,519
  slow tests passed with 60 skipped. The slowest-suite gate also passed.
- Final scoped P2 autoreview command used `--mode local --max-priority P2` on
  the exact affected List/DOCX/docs bundle; TruffleHog passed and review exited
  0 with no accepted/actionable findings.
- Best API repair audit: the source rule and generated skill already contain
  the durable derived-output-versus-latent-intent doctrine; no rule, Vision, or
  worker-skill edit was needed and no stale field teaching was found.
- `check-complete.mjs` reported the goal plan complete after every gate,
  checklist row, proof row, review decision, and risk was recorded.

Final handoff prepared:
- Ownership and target API: List owns conditional `listStart`, forced
  `listRestart`, and derived ordinals; Plate owns the centralized v53 migration;
  Markdown/HTML/DOCX own interchange mapping.
- Public breaks and adoption: hard-cut `listStartIfFirst`; update runtime,
  migration, formats, consumers, generated schema, EN/CN docs, tests, research,
  and package changesets with no compatibility alias.
- Applicable runtime/package/docs/browser decisions: all source/docs/generated
  owners closed. Browser visual proof is N/A for this model/codec contract and
  no callable Browser surface was available; semantic package/integration tests
  own the proof.
- Proof and execution risks: focused, generated, docs, full-CI, and final P2
  gates are green. The full dirty-checkout review remains credential-blocked by
  unrelated content; exact task review is clean.
- Execution order and user attention: implementation is complete; no commit,
  push, or PR was requested.

Timeline:
- 2026-08-17T21:30:40.932Z Plate Plan created.
- 2026-08-17 Goal activated for one-shot execution after the user's explicit
  acceptance; requirements, target contract, risk cases, and proof owners
  recorded before product edits.
- 2026-08-17 Runtime, HTML, MDAST, v53 migration, DOCX, AI, docs, integration,
  generated contract, and release prose adopted the final two-field API;
  focused tests and package typechecks passed.
- 2026-08-18 P2 review drove zero-start, DOCX identity, input-rule, and docs
  fixes. Exact task review and final `pnpm check` passed; handoff prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation and proof complete |
| Where am I going? | Final handoff and goal closure |
| What is the goal? | Ship only conditional `listStart` and forced `listRestart` with lossless v53 migration |
| What have I learned? | The two-field contract also requires preserving zero starts and external sequence identities |
| What have I done? | Hard-cut the rejected field, migrated every owner, closed focused/full proof, and obtained a clean scoped P2 review |

Open risks:
- No open risk in the start/restart contract. Two unrelated follow-ups remain:
  canonical heading-level equality in AI streaming and omitted task `checked`
  serialization. Neither changes this API or its migration proof.
- Hosted GitHub Actions were not run because nothing was pushed; final local
  `pnpm check` is green.
