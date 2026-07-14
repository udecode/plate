# Plate Next: plate, plate-scripts, and test-utils

Objective:
Close the sequential Plate Next reviews for `plate`, `plate-scripts`, and
`test-utils`. Every package file must score 100 or have an explicit deferral,
and package/shared proof must pass.

Flow mode:
One-shot sequential package review.

Goal plan:
`docs/plans/2026-07-14-plate-next-plate-plate-scripts-test-utils-package-reviews.md`

Plate Next source:
- User approved the final three direct packages with `ok go`.
- Order: `plate`, `plate-scripts`, `test-utils`.
- No fourth product package review and no broad Core sweep.
- Smallest owner fixes are allowed when a target package exposes a real Plite
  or shared-proof gap.
- Review target is clean Plate v2 on Plite, not Slate compatibility.

Completion threshold:
All 28 tracked or untracked target-package files score 100 or are explicitly
deferred. Package typecheck, lint, tests, builds, release artifacts, barrels,
the selected shared gate, final review, and the mechanical plan checker must
close. A non-target failure is recorded with exact owner evidence instead of
silently widening the packet.

Verification surface:
- Target package typecheck, lint, tests, builds, and public export audits.
- `pnpm check:core` after adding reviewed Core-adjacent packages.
- Scoped `@platejs/plite-hyperscript` typecheck, tests, build, runtime export,
  and TypeScript inference proof for the smallest Plite owner fix.
- `pnpm brl` after public export changes.
- Source sweeps for aggregate ownership, duplicate hyperscript engines, type
  escapes, direct dependencies, and compatibility residue.
- `node .agents/skills/autogoal/scripts/check-complete.mjs` on this plan.

Constraints:
- Plate owns product composition; Plite owns generic editor substrate.
- No public compatibility aliases, local shims, duplicate engines, helper
  dumps, broad `any` casts, or fake editor intersections.
- Preserve callback inference; fix the owning generic instead of annotating
  callbacks locally.
- Keep current names and paths unless a false owner must be deleted.
- Package READMEs describe only the current API.
- Published user-visible changes require package-scoped patch changesets.
- `plate-scripts` is private and needs no changeset.
- Browser proof is excluded for this package-review mode.
- Do not stage, commit, push, or create a PR.

Boundaries:
- Target packages: `packages/plate`, `packages/plate-scripts`, and
  `packages/test-utils`.
- Smallest owner: `packages/plite-hyperscript` plus its exact Plite public
  export contract.
- Shared proof ownership: `tooling/scripts/check-core.mjs`, direct
  `@platejs/test-utils` dev-dependency declarations, lockfile, and package
  changesets.
- Excluded: apps, content, registry, templates, broad Plite/Yjs migration, and
  git publication.

Blocked condition:
Stop only after the same blocker repeats three times without a smaller owner
fix, or closure needs a new public architecture decision. The full
`check:plite` Yjs failure is an out-of-scope existing migration blocker; the
changed Plite owner has complete scoped proof.

Current verdict:
- Verdict: complete.
- Confidence: 1.00 for all 28 target files.
- Deferred target rows: 0.
- Keep/revert/quarantine: keep the reviewed packet; no quarantine.
- Next owner: Yjs migration, separately from this package review.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact packages, order, stop condition, proof, no fourth review, and final handoff are recorded. |
| `plate-next` loaded | yes | `.agents/skills/plate-next/SKILL.md` was read before package work. |
| Active quantitative goal | yes | Goal names this plan and the every-file score threshold. |
| Package manifest initialized | yes | Initial 27 rows were corrected to 28 when the new DataTransfer spec became part of the package. |
| Review target | yes | Best Plate v2 on Plite, with no legacy compatibility goal. |
| Changeset rules loaded | yes | `changeset` was read before published package artifacts were finalized. |
| Broad Core sweep | no | User named exactly three direct package reviews. |
| Browser proof | no | Package-review skill excludes Browser; no app/UI surface changed. |

Work Checklist:
- [x] Capture every explicit requirement and boundary before closure.
- [x] Review `plate`, then `plate-scripts`, then `test-utils`.
- [x] Give every target package file a score-100 or explicit-deferral row.
- [x] Record the best Plate v2 recommendation and rejected compatibility hacks.
- [x] Remove the duplicate Test Utils hyperscript engine and move the generic
      missing capability to Plite hyperscript.
- [x] Keep public types honest; remove the fake `Editor & fixture` intersection
      and blanket JSX `any` attributes.
- [x] Preserve inference by fixing `createHyperscript` generics at the owner.
- [x] Audit direct one-shot API, live-node, matcher, optional-read,
      normalization, plugin inference, empty-config, and plugin-extension laws;
      none occur in the three target runtime surfaces.
- [x] Apply bridge scoring; no forbidden bridge remains in the target packages.
- [x] Inventory extracted/untracked files and classify the one new proof file.
- [x] Add completed Core-adjacent packages to `check:core`; classify private
      `plate-scripts` with package-owned proof instead.
- [x] Sweep all package consumers for direct `@platejs/test-utils`
      dev-dependencies and repair every missing declaration.
- [x] Run target package typecheck, lint, tests, and builds.
- [x] Run `check:core` and repair only failures caused by this packet.
- [x] Run complete scoped Plite-hyperscript proof.
- [x] Run `pnpm brl` after public export changes.
- [x] Add or update one patch changeset per published changed package.
- [x] Run final Plate Next autoreview and apply accepted findings.
- [x] Record changed files, proof, out-of-scope blockers, and open risks.
- [x] Run the final plan checker.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Score gate | yes | 28/28 target rows score 100; 0 deferred. |
| Best Plate v2 recommendation | yes | Aggregate ownership, CLI forwarding, and hyperscript ownership are explicit below. |
| Plite/Plate gap ledger | yes | Plain no-normalization fixture capability moved to Plite; no target gap remains. |
| Related scoped sweeps | yes | Aggregate, args, duplicate engine, type escape, and dependency sweeps are closed below. |
| Package proof | yes | Three target packages pass typecheck/lint/tests/build where applicable. |
| Shared Core gate | yes | `plate` and `test-utils` are in `check:core`; the 45-package gate passes. |
| Private tooling exclusion | yes | `plate-scripts` has no lint/test scripts; Node, Biome, mocked spawn, and real wrapper proofs pass. |
| Non-target error triage | yes | `check:plite` is blocked only by existing Yjs migration errors after a clean reinstall. |
| Source audit | yes | No Test Utils internal engine import or target-package `any` remains. |
| Rename/extracted files | yes | No rename pass; the one new DataTransfer spec is proof tooling. |
| Release artifacts | yes | Plate existing patch changeset updated; Test Utils and Plite Hyperscript each have one patch changeset; private scripts has none. |
| Barrel generation | yes | `pnpm brl` passes across 56 package tasks. |
| Autoreview | yes | First review found the missing existing Test Utils factory exports; direct canonical Plite re-exports fixed it, and the post-fix review returned no findings. |
| Final lint/check | yes | Targeted Biome passes; `check:core` passes. |
| Goal plan complete | yes | Mechanical checker passes after this evidence is recorded. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Plate review | complete | 10/10 rows at 100; aggregate type contract, lint, test, typecheck, and build pass. |
| Plate Scripts review | complete | 3/3 rows at 100; arguments reach every owned command. |
| Test Utils review | complete | 15/15 rows at 100; duplicate engine deleted and package proof passes. |
| Smallest Plite owner | complete | Generic fixture creator and custom-tag inference pass owner proof. |
| Shared closure | complete | `check:core`, barrels, targeted formatting, changesets, and final review pass. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternative | Reason |
|--------|-------------------|----------------------|--------|
| `platejs` aggregate | Explicitly pair Core `BaseEditor` with Core `createBaseEditor`, while retaining Plite substrate exports. | Export Plite's raw `BaseEditor` beside the Plate factory. | The aggregate type must describe the editor its factory returns. |
| `plate-pkg` | Forward trailing CLI arguments directly to the selected owned command. | Add wrapper scripts or silently discard advertised arguments. | One owner, predictable package-script DX. |
| Test Utils JSX | Compose `@platejs/plite-hyperscript`, keeping only Plate shorthand policy and fixture conversion. | Maintain copied creators, tokens, and factory internals in Test Utils. | Generic hyperscript behavior belongs to Plite. |
| Plain editor fixtures | Public `createEditorFixture` in Plite hyperscript, separate from the live `<editor>` creator. | Construct a live editor and rely on normalization, or fake `Editor & fixture`. | Expected/raw fixtures need exact trees without editor lifecycle effects. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Bad local workaround | Smallest owner | Decision / proof |
|----------|--------------------|----------------------|----------------|------------------|
| Plite gap, resolved | Typed plain hyperscript editor fixture without normalization. | Duplicate Test Utils engine and fake editor intersection. | `@platejs/plite-hyperscript` | Added `createEditorFixture`; 34 owner tests, typecheck, build, runtime export contract, and focused TS inference proof pass. |
| Plate gap | None. | N/A | N/A | Aggregate type ownership and Plate-only shorthands are clean. |

Related scoped sweep ledger:
| Trigger | Scope / query | Matches | Patched | Deferred | Result |
|---------|---------------|---------|---------|----------|--------|
| Aggregate type mismatch | `BaseEditor|createBaseEditor` in `packages/plate/src` | 4 lines | 2 owner files | 0 | Aggregate test imports `./index` and proves `getType`. |
| Dropped CLI args | Every command branch in `run-with-pkg-dir.cjs` | 8 command paths | 8 | 0 | Optional `--` stripped once; remaining args reach tsdown, rimraf, Biome, Bun, tsc, and brl. |
| Duplicate hyperscript engine | `internals/(creators|hyperscript|tokens)` in Test Utils | 3 files | 3 deleted | 0 | Generic implementation exists only in Plite hyperscript. |
| Type escape cleanup | `any` in `packages/test-utils` | 0 after patch | all prior blanket JSX types removed | 0 | Public JSX attributes use `unknown`; editor fixture type is not an Editor intersection. |
| Direct dependency graph | imports of `@platejs/test-utils` across package source vs manifests | 18 consumers | 11 missing manifests | 0 | 7 already declared; all 18 now direct, and Turbo builds Test Utils before consumers. |
| Public Plite export | exact runtime export lists | 2 contracts | 2 | 0 | Both README/runtime contract and Plite public-package smoke include `createEditorFixture`. |
| Existing Test Utils exports | `origin/main` public exports vs current `jsx.ts` | 2 factory exports | 2 | 0 | `createEditor` and `createHyperscript` remain direct re-exports from their Plite owner. |

Package file checklist:
- Manifest command: tracked `git ls-files packages/<package>` plus untracked
  `git ls-files --others --exclude-standard packages/<package>`, sorted and
  deduplicated.
- Expected row count: 28.
- Actual row count: 28 (`plate` 10, `plate-scripts` 3, `test-utils` 15).
- Checked score-100 count: 28.
- Deferred count: 0.
- Missing row count: 0.
- Extra row count: 0.

Package file rows:
- [x] `packages/plate/.npmignore` — 100 — publish filter remains exact.
- [x] `packages/plate/CHANGELOG.md` — 100 — historical metadata unchanged.
- [x] `packages/plate/README.md` — 100 — current package identity is `Plate`.
- [x] `packages/plate/package.json` — 100 — exports, direct dependencies, and scripts pass.
- [x] `packages/plate/src/index.tsx` — 100 — Core type/factory ownership paired explicitly.
- [x] `packages/plate/src/react/index.tsx` — 100 — current React aggregate owner.
- [x] `packages/plate/src/static/index.ts` — 100 — current static aggregate owner.
- [x] `packages/plate/src/type.spec.ts` — 100 — aggregate public type contract is tested.
- [x] `packages/plate/tsconfig.build.json` — 100 — declaration build passes.
- [x] `packages/plate/tsconfig.json` — 100 — source-first typecheck passes.
- [x] `packages/plate-scripts/package.json` — 100 — exact private binary metadata.
- [x] `packages/plate-scripts/plate-pkg.cjs` — 100 — minimal executable owner; syntax passes.
- [x] `packages/plate-scripts/run-with-pkg-dir.cjs` — 100 — every advertised argument is forwarded; spawn and real-wrapper proof pass.
- [x] `packages/test-utils/.npmignore` — 100 — publish filter remains exact.
- [x] `packages/test-utils/CHANGELOG.md` — 100 — historical metadata unchanged.
- [x] `packages/test-utils/README.md` — 100 — current public fixture and helper surface documented.
- [x] `packages/test-utils/package.json` — 100 — Plite hyperscript is a direct runtime dependency; package scripts pass.
- [x] `packages/test-utils/src/createDataTransfer.spec.ts` — 100 — new proof file verifies default, read, write, and void return semantics.
- [x] `packages/test-utils/src/createDataTransfer.ts` — 100 — string map and DOM mock boundary are correctly typed.
- [x] `packages/test-utils/src/getHtmlDocument.ts` — 100 — focused DOM document helper unchanged and correctly owned.
- [x] `packages/test-utils/src/index.ts` — 100 — generated public barrel matches current files.
- [x] `packages/test-utils/src/internals/creators.ts` — 100 — deleted duplicate; canonical owner is Plite hyperscript.
- [x] `packages/test-utils/src/internals/hyperscript.ts` — 100 — deleted duplicate; canonical owner is Plite hyperscript.
- [x] `packages/test-utils/src/internals/tokens.ts` — 100 — deleted duplicate; canonical owner is Plite hyperscript.
- [x] `packages/test-utils/src/jsx.spec.ts` — 100 — canonical re-exports, aliases, raw fixture, void children, invalid children, and empty fixture covered.
- [x] `packages/test-utils/src/jsx.ts` — 100 — typed Plate shorthands compose Plite, preserve public factory exports directly, and expose an honest fixture API.
- [x] `packages/test-utils/tsconfig.build.json` — 100 — declaration build passes.
- [x] `packages/test-utils/tsconfig.json` — 100 — source-first typecheck passes.

Extracted file ledger:
| Path | Bucket | Owner check | Decision | Proof |
|------|--------|-------------|----------|-------|
| `packages/test-utils/src/createDataTransfer.spec.ts` | justify-new-proof-tooling | Behavior had no focused test | Keep | Included by package test; 1 test, 4 assertions. |

Review matrix:
| Path / API | Score | Verdict | Owner | Evidence / next |
|------------|-------|---------|-------|-----------------|
| `platejs` `BaseEditor` | 100 | keep-in-plate | Plate aggregate | Core type explicitly paired with factory; aggregate contract passes. |
| `plate-pkg <command> [args...]` | 100 | keep-in-private-tooling | Plate Scripts | Direct forwarding proven; no wrapper layer. |
| `@platejs/test-utils` JSX | 100 | keep-Plate-policy-only | Test Utils | No duplicate engine or blanket any remains. |
| `createEditorFixture` | 100 | move-to-plite | Plite Hyperscript | Public owner proof and changeset pass. |
| `createDataTransfer` | 100 | keep-in-test-utils | Test Utils | DOM boundary is isolated and behavior tested. |

Release artifact matrix:
| Package | User-visible delta | Artifact | Evidence |
|---------|--------------------|----------|----------|
| `platejs` | Correct aggregate `BaseEditor` type | Existing `.changeset/auto-main-to-next-sync-platejs.md` updated | One patch entry only; duplicate entry removed after gate caught it. |
| `@platejs/test-utils` | Typed Plite-backed fixture helpers and DataTransfer behavior | `.changeset/fix-test-utils-fixtures.md` | Patch. |
| `@platejs/plite-hyperscript` | Typed custom tags and plain fixture creator | `.changeset/infer-plite-hyperscript-tags.md` | Patch. |
| `@plate/scripts` | Private tooling only | None | Private package, no published consumer artifact. |
| Direct-dependency manifests | Development graph only | None | No runtime/user-visible package behavior change. |

Out-of-scope package drift:
| Package / command | Error | Classification | Owner / next |
|-------------------|-------|----------------|--------------|
| `@platejs/yjs` via `pnpm check:plite` | Old `editor.api.*.get`, removed `SlateEditor`/`ExtendEditor`, missing `./providers/types`, `@slate-yjs/core`, and `y-protocols/awareness`, plus stale DOM API access | Existing Yjs migration drift; unchanged by this packet and reproduced after `pnpm run reinstall` | Separate Yjs Plate Next/migration packet. Do not hide it by weakening `check:plite`. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| Plate | Aggregate type/factory ownership, aggregate contract test, README title, patch changeset wording. |
| Plate Scripts | Trailing CLI arguments forwarded through every command path. |
| Test Utils | Plite-backed JSX, honest fixture types, valid fresh void children, DataTransfer typing/test, README/dependency, duplicate internals deleted. |
| Plite owner | Typed custom creator/element keys, plain `createEditorFixture`, docs/tests/public export contract, patch changeset. |
| Shared proof | `plate` and `test-utils` added to `check:core`; 11 missing direct Test Utils dev-dependencies and lockfile repaired. |

Findings:
- The `platejs` factory returned a Plate editor while the aggregate exported
  Plite's narrower `BaseEditor`; the old test bypassed the aggregate entirely.
- `plate-pkg` advertised trailing arguments and silently discarded them.
- Test Utils copied the generic Plite hyperscript engine, widened JSX to
  `any`, and lied that a plain fixture was a live Editor.
- A live editor creator cannot replace raw expected fixtures because editor
  construction/normalization changes the oracle tree.
- Eleven package tests imported Test Utils without declaring it, so Turbo had
  no dependency edge and could typecheck consumers before Test Utils built.

Error attempts:
| Error / attempt | Resolution |
|-----------------|------------|
| Aggregate `BaseEditor.getType` red proof | Explicit Core type export fixed the public owner; test then passed. |
| First `check:core` found duplicate Plate patch changesets | Merged wording into the existing Plate changeset and deleted the duplicate. |
| Live editor fixtures changed Date normalization or rejected raw Core output | Added Plite's plain fixture creator and preserved live `<editor>` behavior. |
| First direct-dependency gate runs built consumers before Test Utils | Added all 11 missing direct dev-dependencies; focused and full gates passed. |
| Added top-level element validation broke two Plite normalization oracles | Removed the drift guard; invalid input remains valid fixture material for normalization tests. |
| First autoreview found removed Test Utils factory exports | Preserved `createEditor` and `createHyperscript` as direct Plite re-exports; package proof and post-fix autoreview pass. |
| `check:plite` stopped at Yjs typecheck | Clean reinstall reproduced the same unrelated migration failures; scoped changed-owner proof passes. |

Verification evidence:
- `pnpm check:core` — pass: 45 package typechecks/lints, Core and Plite tests,
  reviewed package tests, release contracts, and changeset uniqueness.
- `pnpm turbo typecheck --filter=./packages/plite-hyperscript
  --filter=./packages/test-utils --filter=./packages/plate` — 14 tasks pass.
- `pnpm --filter @platejs/plite-hyperscript test` — 34 pass; build passes.
- Focused TypeScript 7 smoke contract for custom hyperscript tags — pass.
- `pnpm --filter @platejs/test-utils test` — 9 pass, 15 assertions; lint,
  typecheck, build, and built public factory export smoke pass.
- `pnpm --filter platejs test` — 1 pass, 2 assertions; build passes.
- Plate Scripts Node syntax, Biome, mocked spawn trace, and real focused package
  test through the wrapper — pass.
- Focused Plite normalization `remove-text` rows — 2 pass.
- Plite public package import smoke — 18 pass.
- `pnpm brl` — 56 tasks pass.
- Targeted Biome across target and smallest-owner changed files — 26 files,
  no fixes.
- `pnpm run reinstall` — pass; confirms the Yjs gate error is source drift,
  not install corruption.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...` — first run
  produced one accepted public-export finding; post-fix run exited clean with
  zero findings and `patch is correct` at 0.82 confidence.
- Browser proof — N/A by package-review rule; no runnable UI surface changed.

Needs your attention:
| Rank | Item | Why | Recommendation |
|------|------|-----|----------------|
| 1 | Yjs is already inside `check:plite` but does not typecheck | It still uses removed Plate/Slate APIs and undeclared legacy modules | Review Yjs as its own migration packet; do not fold it into these closed packages. |

Final handoff contract:
- Mode: exactly three sequential package reviews, plus the smallest Plite and
  shared-proof owners.
- Coverage: 28/28 target rows at 100; 0 deferred.
- Best shape: Plate aggregate owns Plate composition, Test Utils owns only
  Plate test policy, Plite hyperscript owns generic fixture mechanics.
- Shared proof: `check:core` green; complete scoped Plite owner proof green.
- Out-of-scope blocker: existing Yjs migration prevents the umbrella
  `check:plite` typecheck from reaching later stages.
- Compatibility audit: no duplicate Test Utils hyperscript internals, fake
  editor intersection, dropped CLI arguments, or aggregate type mismatch remains.
- Next packet: Yjs migration, if desired.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure. |
| Where am I going? | Final checker, goal completion, and concise handoff. |
| What is the goal? | Close all 28 files across the three named packages with proof. |
| What have I learned? | The only remaining umbrella-gate failure belongs to Yjs, not these packages. |
| What have I done? | Closed all target rows, fixed the smallest Plite owner, and passed shared Core proof. |

Timeline:
- 2026-07-14: Plate aggregate type owner and README corrected; package proof passed.
- 2026-07-14: Plate Scripts argument forwarding repaired and proven.
- 2026-07-14: Test Utils duplicate engine deleted; Plite fixture owner added.
- 2026-07-14: Direct dependency graph repaired; `check:core` passed.
- 2026-07-14: Scoped Plite owner proof and barrels passed; Yjs umbrella blocker recorded.

Open risks:
- No open target-package risk.
- `check:plite` remains red at unchanged `@platejs/yjs` source until its
  separate migration is completed.
