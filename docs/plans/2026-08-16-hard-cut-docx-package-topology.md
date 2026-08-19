# Hard cut DOCX package topology

Objective:
Hard-cut the DOCX package family into focused paste, import, and export leaves
plus one ergonomic composer package, with every consumer migrated and no
compatibility aliases.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-16-hard-cut-docx-package-topology.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- docs

Mode:
- `standard` accepted-plan execution. The user accepted the exact package
  family in chat and explicitly said to cut it.

Completion threshold:
- `@platejs/docx-paste`, `@platejs/docx-import`, and
  `@platejs/docx-export` own exactly one capability each.
- `@platejs/docx` is the normal-dependency composer and exports `DocxKit` plus
  all leaf APIs.
- `@platejs/docx-io`, `DocxIOPlugin`, the old paste-only `DocxPlugin`, and all
  stale imports/docs/examples have zero matches outside historical plans and
  release evidence.
- Focused package tests/typechecks, generated barrels, docs checks, applicable
  browser proof, P2 autoreview, and `check-complete` pass.

Verification surface:
- Source audits with scoped `rg` over packages, apps, content, tests, package
  manifests, workspace metadata, and agent doctrine.
- Package tests and source-first typechecks for all four final packages and
  every directly changed consumer package/app.
- `pnpm brl`, focused docs/content validation, relevant browser route proof,
  P2 autoreview, stale-name audits, and the autogoal completion checker.

Constraints:
- Implementation is authorized by the user's explicit acceptance and `cut`
  instruction.
- No public compatibility aliases or runtime shims.
- No optional peer dependencies. The composer uses ordinary dependencies;
  leaf packages remain independently installable.
- Preserve existing DOCX paste, file import, file export, comments, image
  security defaults, browser behavior, and inference while changing ownership.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: `packages/docx*`, direct package/app/registry/docs consumers,
  generated barrels/workspace metadata, release artifacts, and affected agent
  teaching.
- Source owners: DOCX package manifests/source/tests, shared `PLUGINS` identity,
  root package exports, registry editor/toolbars, and DOCX docs.
- Non-goals: converter behavior redesign, fidelity expansion, service-backed
  conversion, compatibility bridges, unrelated editor APIs, or PR creation.
- Direct Plite boundary owners: N/A; this is Plate package/plugin ownership and
  does not change the raw editor substrate.

Output budget strategy:
- Read named DOCX owners first; use file lists/counts before broad matches;
  exclude generated output, dependencies, fixtures, and binaries unless they
  are the named proof owner; cap command output and inspect focused slices.

Blocked condition:
- Stop only if the package graph cannot express independently installable
  leaves plus the accepted composer without a new public Core/Plite contract,
  or if required browser/package tooling remains unavailable after the repo's
  documented recovery path.

Plate Plan state:
- status: done
- phase: complete
- next: hand off the verified local hard cut
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records the accepted four-package topology, hard-cut boundary, no optional peers, proof, and handoff requirements. |
| Active goal and plan verified | yes | Active goal points to this exact plan; flow is one-shot accepted execution. |
| Current owners read | yes | Read both legacy package manifests, public barrels, plugin definitions, tests, consumers, docs, shared plugin keys, and workspace tooling before splitting ownership. |
| Best API target resolved | yes | Accepted target: `docx`, `docx-paste`, `docx-import`, `docx-export`; `DocxKit` plus three capability plugins; no aliases. |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by explicit user acceptance and `cut`. |
| Package/API pack selected | yes | Package names, exports, manifests, dependencies, and release artifacts change. |
| Public surface or package boundary identified | yes | The complete current `docx` and `docx-io` public surfaces and all direct consumers are in scope. |
| Release artifact path selected | yes | `.changeset` per published package delta after comparison with `origin/main`; registry-only classification is inapplicable. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read before release work. |
| Barrel/export impact decision recorded | yes | Exported files/packages change; `pnpm brl` is mandatory. |
| Docs pack selected | yes | Public DOCX package imports and plugin names change. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` before rewriting the DOCX pages. |
| Docs lane selected | yes | Canonical plugin reference lane at `/docs/docx`; the redundant `/docs/docx-io` page is deleted. |
| Target docs and nearest sibling docs read | yes | Read both existing DOCX pages, their Chinese counterparts, the export example, and serialization siblings. |
| Docs style doctrine read | yes | Applied current-state reference voice, package ownership, kit/manual setup, and API-reference rules. |
| Documented source owner identified | yes | Package manifests, plugin definitions, public barrels, and `DocxKit` are authoritative for all documented imports and APIs. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: this published hard cut uses one package changeset.
- [x] Package/API pack: `.changeset` work loaded `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work is N/A because this is a published package change; registry consumers were migrated as adoption work.
- [x] Package/API pack: no-artifact is N/A because package users receive a breaking public delta.
- [x] Package/API pack: compatibility, migration, and hard-cut decisions are explicit.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded below.
- [x] Package/API pack: generated barrels and package changesets are updated.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, route, and transform is source-backed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, routes, and anchors pass the docs checks.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All four package builds, source-first typechecks, package tests, app integration tests, docs checks, lint, and the affected Plite gate pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final package manifests, barrels, consumers, shared keys, and scoped stale-name searches were reread after generation and lint. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | `best-api repair` confirms three single-capability leaves plus a dependency composer; no aliases or optional peers. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | All consumers/docs/releases migrated. Browser route is blocked by unrelated missing generated registry modules; package-facing type/docs proof and Plite Chromium smoke pass. Issue provenance is N/A. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and outcomes are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, public breaks, adoption, proof, and the browser limitation are recorded below. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Focused frozen-snapshot review ran with `--mode local --max-priority P2`. Three findings were rejected as byte-identical pre-existing paste behavior outside the ownership hard cut; no accepted actionable finding remains. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-hard-cut-docx-package-topology.md` | Closeout command passes after this final evidence update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Leaf barrels expose only their capability; composer reexports all leaves and owns only `DocxKit`; active manifests/lockfile contain no `docx-io`. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking package/API change. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `.changeset/docx-package-topology.md`; `pnpm changeset status` passes and uses a major bump for the existing composer identity. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry files are direct consumers of a published package change. Historical registry changelog evidence is intentionally immutable. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: the package changeset is required and present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | All four DOCX typechecks, builds, fast tests, and focused slow/integration tests pass. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passes: 57 tasks. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Imports, plugin keys, kit composition, APIs, and browser/client constraints match package source. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `pnpm --filter www check:docs` passes. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | The www typecheck ran the MDX source build successfully; focused `build:source` is rerun at closeout. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Canonical DOCX page documents composer setup, focused leaf setup, plugin ownership, APIs, and client boundary. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Current package, consumer, docs, release, and doctrine owners inventoried | Decide |
| Decide | completed | Four-package hard cut accepted; optional peers, aliases, and the combined package rejected | Prove and hand off |
| Prove and hand off | completed | Implementation and deterministic checks pass; P2 review has no accepted in-scope finding | Goal completion |

Decision brief:
- outcome: truthful independently installable DOCX capabilities with one
  obvious full-stack entrypoint.
- chosen shape: `@platejs/docx-{paste,import,export}` leaves and
  `@platejs/docx` composer exporting `DocxKit` and leaf APIs.
- strongest rejected alternative: one heavy `@platejs/docx` package with
  subpath exports and optional peers.
- consequence: one additional leaf package, hard public renames, smaller
  selective installs, and one intentional all-in composer dependency graph.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Word clipboard normalization | Paste-only `@platejs/docx` / `DocxPlugin` | `@platejs/docx-paste` / `DocxPastePlugin` | docx-paste | One focused leaf under the accepted family prefix | Rename all package, plugin, key, docs, and consumer imports | Paste behavior tests and stale-name audit | Plugin identity and docs drift | rename |
| DOCX file import | `DocxIOPlugin.api.import` inside `@platejs/docx-io` | `@platejs/docx-import` / `DocxImportPlugin` | docx-import | Mammoth import is independent from export | Move import types/tests/callers; depend on paste normalization without a runtime plugin dependency | Import tests/typecheck and toolbar proof | Comment/reference behavior drift | move |
| DOCX file export | `DocxIOPlugin.api.toBlob`, `exportToDocx`, and converter tree inside `@platejs/docx-io` | `@platejs/docx-export` / `DocxExportPlugin` | docx-export | Export owns the heavy converter stack and different runtime concerns | Move exporter internals/types/tests/callers | Export tests/typecheck, remote-image default proof, toolbar proof | Browser/server boundary or dependency omissions | move |
| Full DOCX composition | No honest full-family package; current `docx` means paste only | `@platejs/docx` reexports leaves and exports `DocxKit` | docx composer | Default users get one discoverable install while selective users keep leaf boundaries | Update full editor kit/docs/root exports | Composer typecheck, dependency/export audit, editor install proof | Bundle/install cost is intentional for composer users | rearchitect |
| Legacy IO identity | `@platejs/docx-io` / `DocxIOPlugin` / `docxIO` | Deleted | hard-cut owner | Redundant taxonomy after leaf split | Migrate every caller and delete source/tests/docs/package metadata | Zero-match audit | Hidden consumer miss | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | docx-paste | Rename current paste package/plugin/identity and preserve normalization behavior | Live ownership inventory complete | Leaf manifest/source/tests and imports use final names | Focused paste tests/typecheck |
| 2 | docx-import | Extract Mammoth import API/types/tests from IO owner | Paste normalizer public/internal reuse decided | Import leaf has no export dependencies | Focused import tests/typecheck |
| 3 | docx-export | Extract export plugin/functions/converter/tests and dependencies | Current IO dependency graph mapped | Export leaf owns all converter code and no import dependencies | Focused export tests/typecheck |
| 4 | docx composer | Create normal-dependency composer, reexports, and `DocxKit` | All leaves compile | Full package installs the three descriptors | Composer typecheck and API compile proof |
| 5 | adoption | Migrate app, registry, docs, root exports, manifests, release artifacts; delete IO package | Final leaf APIs compile | No live old names/imports remain | `rg`, barrels, docs/browser proof, changesets |
| 6 | closure | Lint, focused/broad checks, best-api repair audit, P2 autoreview, plan closure | Adoption complete | All accepted findings fixed and gates pass | Exact command/review evidence |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Paste behavior is clipboard Word HTML/RTF normalization | Current `DocxPlugin` owns only `text/html`, reads `text/rtf`, and detects `mso-*` | 13 moved package tests plus focused slow behavior tests pass under docx-paste | passed |
| Import and export are independently installable | Current IO source has separable Mammoth and custom converter dependency graphs | Independent manifests, source audits, typechecks, builds, and package tests pass | passed |
| Composer intentionally includes all leaves | Accepted user decision and normal-dependency policy | Manifest/barrel audit and `DocxKit` package test pass; built package imports under Bun | passed |
| Hard cut leaves no compatibility surface | hard-cut rule and accepted target | Old directory absent; manifests/lockfile clean; active matches exist only in the migration changeset and immutable historical release evidence | passed |

Conditional evidence:
- High-risk scenarios: missing leaf dependency after split; stale plugin key
  causing runtime lookup failure; composer duplicating/omitting descriptors;
  browser-only code leaking into an intended server path.
- External research: accepted editor audit compared current CKEditor, Tiptap,
  TinyMCE, Lexical, and ProseMirror package/capability boundaries.
- Issue/PR provenance: N/A; this is a user-directed local API hard cut.
- Docs/registry/browser/release/behavior-law owners: docs, registry editor and
  import/export toolbars, package changesets, package proof, and applicable
  browser demo proof all apply.

Findings:
- Current paste behavior and file IO are already separate packages but carry
  misleading ownership names.
- The accepted family prefix optimizes package discovery while docs can teach
  the human-facing feature as "Paste from Word".
- The current IO package combines Mammoth import with a much larger custom
  exporter and eleven third-party dependencies.

Decisions and tradeoffs:
- Keep the common `docx-*` package prefix -> discoverability and composer
  coherence outweigh MIME-level naming purity -> docs must state that paste
  consumes Word clipboard HTML/RTF.
- Use normal composer dependencies -> full-stack convenience is explicit ->
  selective consumers install leaves.
- Hard-cut all old identities -> one final contract -> coordinated breaking
  adoption is required across every consumer.

Review fixes:
- Rejected `DocxPastePlugin` parenthesized-list-marker finding: every cited
  regex is byte-identical to `HEAD:packages/docx/src/lib/DocxPlugin.ts`; this
  cut preserves paste behavior and does not absorb an unrelated parser fix.
- Rejected `cleanWordHtml` font-style gate finding: the cited condition is
  byte-identical to `HEAD:packages/docx/src/lib/cleanDocx.ts`; fixing legacy
  mark conversion belongs in a focused behavior packet with regression proof.
- Rejected `cleanWordHtml` background-color copy finding for the same reason:
  it is real legacy behavior, not a regression or ownership defect introduced
  by this package hard cut.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| `/docs/docx` browser route fails before rendering because generated registry index imports missing `editor-kit.tsx` and `plate-types.ts` | 1 | Keep CI-owned generated registry untouched; rely on source/type/docs and package/browser proof, and report the unrelated blocker | Scoped as pre-existing generated registry drift; `build:registry` is forbidden locally. |
| Native Node ESM import reaches extensionless `virtual-dom` internals in the client export stack | 1 | Verify the intended client/bundler package with Bun and package tests/builds | Bun built-package import passes; server-side native Node import is not a declared contract. |
| Whole-checkout autoreview source snapshot changed during concurrent unrelated Core work | 3 | Build a frozen DOCX-only Git snapshot from `HEAD` plus every task-owned current file, then run the same helper inside it | Focused snapshot reviewed the complete DOCX patch in three chunks; no accepted in-scope finding remains. |

Verification evidence:
- `pnpm brl` -> 57 tasks passed.
- Source-first typechecks passed for `docx-paste`, `docx-import`,
  `docx-export`, `docx`, and `utils`.
- Package fast tests passed: paste 13, import 3, export 84, composer 1.
- Focused slow/app integration suite passed: 19 tests.
- Release artifact builds passed for all four DOCX packages after their
  dependency chain was rebuilt.
- `pnpm --filter www typecheck` and `pnpm --filter www check:docs` passed.
- `pnpm lint:fix` passed.
- `pnpm check:plite:dev` passed, including package checks, contracts, browser
  core tests, and three Chromium smoke rows.
- `pnpm changeset status` passed.
- Plate Next registry validates at v86 with 44 active and 2 retired packages;
  `docx-io` is retired and the four final identities are tracked.
- Final stale-name audit found only the intentional migration changeset and
  immutable historical release/changelog evidence; package manifests and the
  lockfile contain no legacy package.
- Frozen-snapshot P2 autoreview completed in three chunks. Its three findings
  cite byte-identical legacy paste logic and were rejected as out of scope; the
  ownership hard cut has no accepted actionable finding.

Final handoff prepared:
- Ownership and target API: three single-capability leaf plugins plus the
  `@platejs/docx` composer and `DocxKit`.
- Public breaks and adoption: all direct consumers use `DocxPastePlugin`,
  `DocxImportPlugin`, `DocxExportPlugin`, `cleanWordHtml`, and `isWordHtml`;
  no compatibility layer remains.
- Runtime/package/docs/browser decisions: package, app type, docs, and focused
  Chromium proof pass. The docs route cannot render because unrelated generated
  registry imports are missing; generated registry output remains untouched.
- Proof and execution risks: deterministic gates are green; no accepted P2
  finding remains. Three legacy paste-cleaner bugs stay separate from this cut.
- Execution order and user attention: no commit or PR was requested; hand off
  the local hard cut after the final review is clean.

Timeline:
- 2026-08-16T12:18:40.886Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Verified local handoff |
| Where am I going? | User review or a separately authorized commit/PR |
| What is the goal? | Hard-cut the DOCX family into three focused leaves plus one composer with zero stale compatibility surface. |
| What have I learned? | The split is clean at the package boundary; the only live browser obstruction is unrelated generated registry drift. |
| What have I done? | Split the package, migrated consumers/docs/releases/doctrine, deleted the legacy owner, and passed package/app/docs/Plite checks. |

Open risks:
- Browser rendering of `/docs/docx` remains blocked by unrelated missing
  generated registry modules; local generation is intentionally forbidden.
- Parenthesized Word list markers and two block-style-to-span cases remain
  legacy paste behavior. They are not regressions from this ownership cut and
  need a separate behavior-fix packet if selected.
