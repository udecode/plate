# Rename image natural dimensions

Objective:
Rename persisted image geometry to `naturalWidth` and `naturalHeight`; done
when v53 migration, public types, codecs, consumers, docs, generated contracts,
focused regressions, P2 review, and `pnpm check` are green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-rename-image-natural-dimensions.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api

Mode:
- `standard` accepted-plan execution after the user's explicit “go”.

Completion threshold:
- Zero live `intrinsicWidth`/`intrinsicHeight` matches in product source,
  current tests/docs, generated contracts, or release prose.
- Frozen v53 `initialWidth`/`initialHeight` migrate directly to
  `naturalWidth`/`naturalHeight`; the branch-only intermediate name has no
  compatibility alias.
- Plate clipboard HTML preserves natural geometry exactly; generic HTML
  dimension attributes remain specified/rendered sizing rather than being
  mislabeled as natural geometry.
- Focused Media, migration, generated-contract, docs, typecheck, and
  integration proof passes; final `pnpm check` exits 0.
- Final P2 autoreview has zero accepted open findings and `check-complete`
  passes.

Verification surface:
- Source audits over Media schema/types/codecs, registry upload replacement,
  centralized Plate migration, generated editor schema, EN/CN document-model
  docs, research, and changesets.
- Focused Media contracts and centralized `migratePlateV54` regressions.
- `pnpm --filter www editor:generate`, `editor:check`, `build:source`, owning
  package typechecks, `pnpm lint:fix`, final `pnpm check`, and scoped P2 review.

Constraints:
- The user accepted the Best API target and invoked execution; do not pause for
  another plan review.
- No public compatibility aliases or runtime shims.
- Preserve user-selected/rendered `width` separately from image-owned natural
  dimensions.
- Keep historical v53 names only in the frozen manifest, migration fixtures,
  historical changelog, and migration demo.
- Do not commit, push, or create a PR.

Boundaries:
- In scope: Image plugin schema and insert input, HTML codec provenance,
  registry upload replacement, Plate v54 migration/manifest, generated schema,
  docs/research, tests, and the existing Media changeset.
- Source owners: `packages/media`, `packages/plate/src/migrations`,
  `apps/www/src/registry`, `content/docs`, current research, and `.changeset`.
- Non-goals: adding display `height`, changing resize behavior, redesigning all
  media dimension APIs, or migrating historical changelog prose.
- Direct Plite boundary owners: N/A; these are Plate Image feature properties
  and format/migration behavior.

Output budget strategy:
- Read named owners first; list/count exact matches before line output; exclude
  dependencies, build output, historical release output, and generated JSON
  except when the generator owns it.

Blocked condition:
- Stop only if the same non-local tool/access failure repeats three times and
  no focused source, test, or generator move remains.

Plate Plan state:
- status: complete
- phase: prove and hand off
- next: final response
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Hard-cut to `naturalWidth`/`naturalHeight`, direct v53 migration, no intermediate alias, full regression/CI proof |
| Active goal and plan verified | yes | Active goal names this exact plan and the green migration/schema/docs/review/CI threshold |
| Current owners read | yes | Image schema/codecs, insert input, upload replacement, migration/manifest/tests, docs, research, generated contract, and changeset inspected |
| Best API target resolved | yes | `best-api review`: web-standard `natural*` wins; `initial*` is lifecycle history and `intrinsic*` is CSS-layout ambiguity |
| Mode and execution boundary resolved | yes | Standard one-shot execution after explicit acceptance; no git delivery |
| Docs pack selected | yes | EN/CN document model and current research field vocabulary change |
| `docs-creator` loaded | yes | Skill and style reference read before edits |
| Docs lane selected | yes | Guide/system model plus internal research decision row |
| Target docs and nearest sibling docs read | yes | EN/CN document-model sections and current editor-node-model research read |
| Docs style doctrine read | yes | `style-and-structure.md` read |
| Documented source owner identified | yes | `BaseImagePlugin`, `ImageInsertInput`, registry upload replacement, and centralized v54 migration |
| Package/API pack selected | yes | Published Media node fields and insert input change |
| Public surface or package boundary identified | yes | `@platejs/media` Image schema and construction input; Plate migration owns persisted adoption |
| Release artifact path selected | yes | Update existing `.changeset/media-v54-runtime.md` relative to main |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset skill read |
| Barrel/export impact decision recorded | yes | No exported file or barrel topology change; generated editor types do change |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, option, transform, and example is source-backed; no route/link/preview changed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links/routes/previews are N/A because topology did not change.
- [x] Package/API pack: public API, package boundary, generated type, and release impact are recorded.
- [x] Package/API pack: the published Media delta uses the existing Media changeset.
- [x] Package/API pack: changeset work loaded the skill and follows one-package/current-main rules.
- [x] Package/API pack: registry changelog is N/A because registry source only adopts a package API.
- [x] Package/API pack: no-artifact rows are N/A because the published Media changeset is required and present.
- [x] Package/API pack: hard-cut and direct v53 migration decisions are explicit.
- [x] Package/API pack: Media, Plate, www, focused, and root proof are recorded.
- [x] Package/API pack: generated editor contracts and Media release prose are updated; barrels are N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Runtime, migration, upload lifecycle, codec provenance, generated contract, docs/research, release, review, and CI gates are closed |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final audits prove zero intermediate live names and only frozen v53 `initial*` inputs remain |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Natural target implemented; empty upload `name` data-loss finding accepted and fixed; unrelated migration-export finding rejected as a prior intentional hard cut |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | HTML provenance, partial dimensions, standalone images, exact-File replacement races, v53 collisions, registry adoption, docs, generator, and release covered; browser N/A with focused DOM/component proof |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and pass counts recorded below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff rows completed below |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Final exact-scope P2 run exited 0 with no accepted/actionable findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-rename-image-natural-dimensions.md` | Final mechanical checker is the last plan gate |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN document model and research match Media schema, upload producer, rendered width, and migration |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no route, link, anchor, or preview changed |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `build:source`, `check:docs`, and full www typecheck passed |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: guide/system and research rows changed, not a plugin page |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Media schema/insert input and generated editor types expose natural fields only; no export topology changed |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/media` schema, construction, and codec behavior |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Updated existing one-package major Media changeset; no forbidden core minor |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry source adopts the package contract; not registry-only |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package changeset is present |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Media/Plate tests and typechecks, www typecheck, and final root check passed |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file or barrel changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Requirements, current owners, web standards, and boundary recorded | Decide |
| Decide | complete | Target schema, HTML provenance, migration, adoption, and proof locked | Implement and prove |
| Prove and hand off | complete | Focused, package, www, root, and review proof passed | Final response |

Decision brief:
- outcome: one truthful split between rendered width and image-owned natural
  geometry.
- chosen shape: `width?: number | string`, `naturalWidth?: number`, and
  `naturalHeight?: number`.
- strongest rejected alternative: `intrinsicWidth`/`intrinsicHeight`; CSS
  explicitly distinguishes natural dimensions from intrinsic box sizing.
- consequence: hard-cut the intermediate beta field across Media, migration,
  registry, generated schema, docs, research, tests, and release prose.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Persisted image geometry | `intrinsicWidth`/`intrinsicHeight` | `naturalWidth`/`naturalHeight` | Image plugin | Matches `HTMLImageElement.natural*` and CSS Images terminology | Hard-cut intermediate field; direct v53 `initial*` migration | Media contracts, generated schema, stale-name audit | Imported HTML attrs may be specified rather than natural dimensions | rename |
| HTML dimension provenance | Generic `width`/`height` attrs become intrinsic fields | Plate-private natural metadata round-trips natural geometry; generic width remains rendered sizing | Image HTML codec | Do not relabel author-specified dimensions as image-owned geometry | Add private attributes and generic import regression | Media HTML contract tests | Clipboard compatibility if private metadata is omitted | rearchitect |
| Historical document migration | v53 `initial*` maps to intermediate `intrinsic*` | v53 `initial*` maps directly to `natural*` | Central Plate migration | Main-to-v54 chain must never expose branch-only ontology | Update manifest and centralized fixtures | `migratePlateV54.spec.ts` | Collision handling must target final keys | rename |
| Teaching/release/generated contract | Current docs/research/schema/changeset teach intrinsic | Teach and generate natural geometry only | Docs/generator/changeset owners | One canonical field vocabulary | Update current owners; retain historical changelog and v53 fixtures | docs build, generator check, source audit | Generated drift | rename |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Media runtime | `packages/media` | schema, insert input, HTML codec, Media contracts | Accepted Best API target | Natural names and provenance are implemented | Focused Media tests/typecheck |
| Migration/adoption | `packages/plate` and registry upload owner | direct v53 mapping, placeholder replacement, schema descriptor example | Media runtime settled | No intermediate persisted field survives | Central migration and integration proof |
| Teaching/generated/release | docs, research, generator, changeset | current vocabulary and generated contracts | Runtime/migration green | Zero stale live names | `editor:generate`, docs build, stale-name audit |
| Closure | repo checks/review | lint, focused reruns, root check, P2 review, plan checker | Adoption green | All proof gates closed | exact commands and final handoff |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Upload replacement persists DOM natural dimensions | `media-placeholder.tsx` reads `naturalWidth`/`naturalHeight` | Exact-File preview tests, www typecheck, and final review passed | complete |
| Plate HTML round-trip preserves natural and rendered widths separately | Image codec source | Focused Media contract passed for figure, standalone, and partial provenance | complete |
| Generic HTML width is not mislabeled as natural geometry | HTML standard distinction plus codec source | Direct and figure-wrapped generic decode regressions passed | complete |
| v53 initial dimensions migrate directly to natural dimensions | Frozen manifest and migration source | Central migration and collision regressions passed | complete |
| Public/generated contract contains no intermediate field | Bounded owner manifest | Zero live intermediate matches; generator and docs checks passed | complete |
| Entire checkout stays green | Current root check baseline | Final `pnpm check` exited 0 | complete |

Conditional evidence:
- High-risk scenarios: Plate clipboard natural metadata round-trip; generic
  `<img width height>` import; v53 collision/zero/missing dimensions; generated
  schema drift.
- External research: WHATWG exposes `naturalWidth`/`naturalHeight`; CSS Images
  defines natural dimensions; CSS Sizing distinguishes natural dimensions from
  intrinsic box sizes.
- Issue/PR provenance: N/A; user-directed beta API correction.
- Docs/registry/browser/release/behavior-law owners: EN/CN guide, current
  research, registry upload consumer, generated editor contract, and Media
  changeset apply. Browser visual proof is not required for a persisted
  field/codec contract with package and integration proof.

Findings:
- The upload replacement already sources these numbers from DOM
  `naturalWidth`/`naturalHeight`; the intermediate public name disagrees with
  its literal producer.
- `initial*` is construction/interaction history, while the values remain
  durable source-image geometry.
- Generic HTML dimension attributes are specified dimensions and cannot prove
  natural geometry without Plate provenance.

Decisions and tradeoffs:
- Keep flat fields rather than a nested size object; each field is optional and
  directly schema-owned.
- Keep `width` for user-selected/rendered sizing; natural geometry must not
  compete with resize state.
- Use Plate-private HTML metadata for exact natural-geometry round trips while
  retaining standard `width`/`height` attributes for browser layout hints.
- Do not promote this package-specific naming choice into generic Best API or
  Vision doctrine; existing semantic-name law already covers it.

Review fixes:
- Accepted P1: uploaded non-file media stored `name: ''`, which made images
  fail HTML serialization -> omit `name` outside the File plugin.
- Accepted P2: upload completion could unmount the preview before image decode
  -> retain the registered `currentFile`, wait for geometry, then replace.
- Accepted P2: preview geometry could cross File replacements, including
  colliding file metadata -> keep `{ file, url }` together, tag callback state
  with exact File identity, and add a colliding-replacement regression.
- Accepted P2: standalone and partial-provenance HTML handling lost or
  misclassified width -> consolidate one image-size parser and cover figure,
  standalone, generic, Plate, and partial metadata cases.
- Rejected as out of scope: removed `migratePlateAstIdentities` exports are an
  intentional prior hard cut, not a regression introduced by this API rename.
- Rejected as follow-up: generic upload-store cleanup on placeholder deletion
  is an independent lifecycle issue outside natural-dimension persistence.
- Final scoped P2 review exited 0 with no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Root lint briefly saw an unrelated concurrent unused pagination helper | 1 | Recheck current source before touching another owner | Concurrent work removed it; subsequent lint and root check passed |
| First www typecheck found our optional-state narrowing plus one unrelated perf-row narrowing | 1 | Fix exact TypeScript guards, then rerun the complete www lane | Full www typecheck exited 0 |

Verification evidence:
- Focused Media plus centralized migration proof: 39/39 passed before the
  broader package sweep.
- Full `packages/media/src` plus `packages/plate/src/migrations` tests: 123/123
  passed across 9 files.
- Source-first Media and Plate typechecks: 13/13 Turbo tasks passed.
- `pnpm --filter www editor:generate` regenerated the committed editor types
  and schema; `editor:check` passed.
- `pnpm --filter www check:docs` passed API reference, MDX source generation,
  and docs source parity.
- Live-source audit found zero `intrinsicWidth`/`intrinsicHeight` matches in
  product source, current tests/docs/research, generated contracts, or
  changesets. Remaining `initial*` matches are limited to frozen v53 migration
  inputs, its manifest/tests, and the migration demo.
- Review-triggered focused proof passed 41/41 across Media HTML, upload preview,
  and centralized migration tests; the exact-File preview file has 2/2 tests.
- `pnpm --filter www typecheck` exited 0, including generator, API reference,
  docs parity, registry source, app TypeScript, and package-integration
  TypeScript checks.
- Final `pnpm check` exited 0: lint completed with warnings only, 60 package
  builds and 60 package typechecks passed, 3,144 fast tests passed, and 1,519
  slow tests passed with 60 skipped. The slowest-suite gate also passed.
- Final exact-scope `autoreview --mode local --max-priority P2` passed
  TruffleHog and exited 0 with no accepted/actionable findings.
- Best API repair audit found no stale worker-skill field teaching. Existing
  Common/Plate doctrine already requires intentional semantic persisted names,
  so no generic rule, Vision, or generated skill edit was justified.
- `check-complete.mjs` reported the goal plan complete after every gate,
  checklist row, proof row, review decision, and risk was recorded.

Final handoff prepared:
- Ownership and target API: Image owns `naturalWidth`/`naturalHeight`; shared
  Media retains rendered `width`; Plate owns direct v53 `initial*` migration;
  registry upload replacement owns capture timing.
- Public breaks and adoption: hard-cut branch-only `intrinsic*`; update Media,
  migration, registry, examples, generated editor contracts, EN/CN docs,
  research, tests, and the Media changeset with no alias.
- Applicable runtime/package/docs/browser decisions: Plate-private HTML data
  attributes preserve natural provenance; generic HTML width stays rendered
  sizing. Browser proof is N/A because focused DOM/component tests and full www
  typecheck cover this non-visual contract.
- Proof and execution risks: focused, package, generator, docs, www, full-CI,
  and final P2 gates are green.
- Execution order and user attention: implementation is complete; no commit,
  push, or PR was requested.

Timeline:
- 2026-08-17T23:38:19.174Z Plate Plan created.
- 2026-08-18 Goal activated after explicit acceptance; runtime, HTML
  provenance, migration, registry, docs/research, generated contract, tests,
  and release prose adopted the natural-dimension vocabulary.
- 2026-08-18 Review hardened upload timing, exact File identity, standalone and
  partial HTML provenance, and image serialization; final www/root/review
  gates passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation and proof complete |
| Where am I going? | Final handoff and goal closure |
| What is the goal? | Ship only `naturalWidth`/`naturalHeight` with direct v53 migration and truthful HTML provenance |
| What have I learned? | Natural geometry also needs explicit HTML provenance and exact File lifecycle ownership |
| What have I done? | Hard-cut the intermediate fields, migrated every owner, and closed focused, www, root, and review proof |

Open risks:
- No open risk in the natural-dimension contract. Generic rendered height
  remains intentionally outside the current Media API; no new field was
  invented.
- Hosted GitHub Actions were not run because nothing was pushed; final local
  `pnpm check` and full www typecheck are green.
