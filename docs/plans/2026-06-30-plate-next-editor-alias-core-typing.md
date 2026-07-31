# plate-next editor alias core typing

Objective:
Fix exported `BaseEditor` / `PlateEditor` alias defaults so unparameterized
editor types expose Core plugin APIs and reject fake API/tx calls.

Goal plan:
docs/plans/2026-06-30-plate-next-editor-alias-core-typing.md

Template:
docs/plans/templates/plate-next.md

Completion threshold:
- `BaseEditor` and `PlateEditor` plugin generic defaults are no longer `any`.
- Unparameterized `BaseEditor` and `PlateEditor` expose real core APIs such as
  `api.debug.log` and tx groups such as `tx.history.undo`.
- Unparameterized `BaseEditor` and `PlateEditor` reject fake API/tx property
  access in `packages/core/type-tests`.
- `NameofPlugins` includes core plugin keys again.
- Broad runtime/helper sites that intentionally need open plugin typing say
  `<any, any>` explicitly instead of relying on unsafe alias defaults.
- Focused type proof, Core typecheck, Core lint, turbo Core typecheck, and
  `check:core` pass.

Verification surface:
- `pnpm exec tsc -p packages/core/tsconfig.type-tests.json --noEmit`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm check:core`
- Source audit:
  `rg --pcre2 -n "P extends AnyPluginConfig = any|V extends Value = any|= PlateEditor;$|= BaseEditor;$|: PlateEditor(?!<)|: BaseEditor(?!<)|extends PlateEditor(?!<)|extends BaseEditor(?!<)|notARealCoreApi|notARealCoreTx|NameofPlugins" packages/core/src packages/core/type-tests --glob '!**/dist/**'`

Constraints:
- Best Plate v2 shape only: no legacy compatibility alias, no fake public shim.
- Plate owns product composition; Plite owns editor substrate.
- No runtime behavior change for this packet.
- No rename pass.
- Named API/type packet only, not a broad Core drift sweep.
- Fix the owner type surface rather than hiding the regression with broad casts.

Boundaries:
- Allowed edit scope: Core editor type aliases, Plate editor type aliases,
  focused type contracts, and explicit broad annotations required by the stricter
  aliases.
- Package/API surfaces: `@platejs/core` and `@platejs/core/react` editor types.
- Docs/browser surfaces: N/A for this type-only packet.
- Out-of-scope package errors: ignore unless caused by this public type change.

Blocked condition:
The packet would be blocked only if type-safe defaults required a larger public
API fork than `BaseEditor` / `PlateEditor` aliases can express. That did not
happen.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target was the reviewed `SlateEditor.ts` type regression: core plugin APIs missing and fake APIs accepted. |
| `plate-next` skill read | yes | `.agents/skills/plate-next/SKILL.md` read before edits. |
| Active goal checked or created | yes | Active goal created for this packet. |
| Mode classified | yes | Named API/type packet, not broad Core sweep. |
| Review target recorded | yes | Best Plate v2 type surface with no legacy compatibility. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad sweep not requested. |
| Source of truth recorded | yes | `/Users/zbeyens/git/plate-2`, source under `packages/core`. |
| Gap policy checked | yes | No Plite/Plate capability gap found. |
| Related Core sweep policy checked | yes | Swept unsafe plugin defaults, bare editor alias sites, fake API/tx contracts, and `NameofPlugins`. |
| Review-mode rename freeze checked | yes | No renames. |

Work Checklist:
- [x] First checkpoint captured explicit target, scope, non-goals, stop
      condition, proof commands, and final handoff requirements.
- [x] Mode classified as named API/type packet.
- [x] Best Plate v2 call recorded for reviewed targets.
- [x] Legacy/backcompat decision recorded: no public compat alias or shim.
- [x] Hack check recorded: no bridge dump or fake API wrapper kept.
- [x] Gap ledger updated with N/A because no Plite/Plate gap blocked the fix.
- [x] Related Core sweep row added for the correction.
- [x] Broad Core drift ledger marked N/A because the user asked for this named
      fix, not a full Core file-by-file pass.
- [x] Review matrix filled for inspected API/type surfaces.
- [x] Public API fork routing checked: no `plate-plan` fork needed.
- [x] Review-mode rename freeze applied.
- [x] Extracted-file recovery gate closed for the one new proof file.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run after code changes.
- [x] Barrel check recorded N/A because no exported barrel changed.
- [x] Old unsafe generic names audited.
- [x] Changed list, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | Type tests, Core typecheck, Core lint, turbo Core typecheck, and `check:core` pass. |
| Broad Core drift ledger coverage | no | Record N/A | Named API/type packet only. |
| Score gate | no | Record N/A | No broad drift scores in scope. |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Bare aliases are strict; broad runtime sites must opt into `<any, any>`. |
| Plite/Plate gap ledger | yes | Record blocker or N/A | N/A: no substrate gap. |
| Related Core sweep after correction | yes | Run same-class search/review | Unsafe default and bare alias audit completed; broad sites made explicit. |
| Package/API proof | yes | Run focused type/lint/check proof | All named commands pass. |
| Non-Core package error triage | no | Record N/A | Core-only packet. |
| Source audit | yes | Run exact audit for unsafe defaults and fake API probes | Audit only returns expected generic defaults, `NameofPlugins`, and intentional negative type-test probes. |
| Rename ledger | no | Record N/A | No rename pass. |
| Extracted-file inventory | yes | Record new file bucket | `editor-alias-core-contracts.ts` is justified new proof tooling. |
| Autoreview / review | no | Record N/A | Focused type-only fix; package proof substituted. |
| Final lint/check | yes | Run scoped lint/check | Core lint and `check:core` pass. |
| Changed list / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `check-complete.mjs` after evidence | Ready for final mechanical check. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| checkpoint zero | done | Prompt requirements copied before closeout. |
| type design | done | Plugin generic default changed from unsafe `any` to strict `unknown`; core plugins restored into `NameofPlugins`. |
| implementation | done | Editor aliases patched and broad runtime/helper type positions made explicit. |
| proof | done | Core type/lint/check commands pass. |
| handoff | done | Changed list, risks, and next owner recorded. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/SlateEditor.ts` | 2 | keep | Core editor types | `BaseEditor` now defaults plugin typing to `unknown`, keeps broad value default, includes `CorePlugin` in installed API/tx/key inference. | Continue normal Plate Next review. |
| `packages/core/src/react/editor/PlateEditor.ts` | 2 | keep | React editor types | `PlateEditor` now defaults plugin typing to `unknown` while keeping broad value default. | Continue normal Plate Next review. |
| `packages/core/src/lib/editor/withPlite.ts` | 1 | keep | Core editor factory | Factory cast is explicit `unknown as BaseEditor<..., ...>` after stricter alias default. | No follow-up. |
| `packages/core/type-tests/editor-alias-core-contracts.ts` | 0 | keep | Type proof | Positive core API/tx calls compile; fake API/tx calls are `@ts-expect-error`. | Keep as contract. |
| `packages/core/src/**/*` broad editor annotations | 1 | keep | Core runtime/helper types | Bare broad editor references were made explicit as `BaseEditor<any, any>` or `PlateEditor<any, any>`. | No follow-up unless review wants stricter per-site generics. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `BaseEditor` / `PlateEditor` defaults | `V = any` for broad runtime assignability, `P = unknown` for strict plugin API/tx inference | Keep `P = any`; hide fake APIs with tests only; cast fake API away locally | `P = any` lets any fake plugin API compile. `unknown` makes unparameterized aliases safe while still allowing explicit broad `<any, any>` for internal open surfaces. | Low: this is the right type-safety cut. |
| Broad internal editor slots | Spell broad intent as `<any, any>` | Depend on unsafe alias defaults | Explicit broadness is noisy but honest. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No substrate or product capability missing. | N/A | Type contract proof only. | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Unsafe plugin default | `rg "P extends AnyPluginConfig = any"` in Core src/type-tests | 0 after patch | `BaseEditor` / `PlateEditor` defaults changed to `unknown` | 0 | None known. |
| Bare alias sites now strict | PCRE audit for bare `BaseEditor` / `PlateEditor` type positions | All broad helper/store sites reviewed by compiler | Broad sites changed to explicit `<any, any>` | 0 | Some broad sites could later become stricter, but not required for this packet. |
| Core plugin keys missing | `NameofPlugins` source review and type contract | 1 owner | `NameofPlugins` includes `CorePluginConfig` | 0 | None known. |
| Fake API/tx accepted | Negative type-test probes | 4 probes | Added `@ts-expect-error` contract | 0 | None known. |

Core drift ledger:
- Applies: no.
- Reason: named API/type packet, not broad Core file-by-file sweep.
- Manifest command: N/A.
- Expected row count: 0.
- Actual row count: 0.
- Missing row count: 0.
- Extra row count: 0.
- Score gate: N/A.
- Top drift rows: N/A.

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/type-tests/editor-alias-core-contracts.ts` | justify-new-proof-tooling | New contract for this branch's Plate/Plite editor aliases | Keep | `tsc -p packages/core/tsconfig.type-tests.json --noEmit` passes and fake API/tx probes are consumed. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Tightened `BaseEditor` / `PlateEditor` plugin defaults; restored core plugin keys in `NameofPlugins`; made broad editor type sites explicit. |
| tests/proof | Added `editor-alias-core-contracts.ts` type contract. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Explicit `<any, any>` broad sites | This is honest but noisy. Later review can tighten individual helper/store sites where inference is practical. | Core source annotations | Accept for now; do not restore unsafe alias defaults. |

Findings:
- The real regression was `P = any`, not the value generic. `any` poisoned the
  plugin API/tx surface and made fake APIs compile.
- Keeping `V = any` is still pragmatic because many Core runtime surfaces need
  broad value assignability while package migration is active.
- `NameofPlugins<T>` must include `CorePluginConfig | T`, or unparameterized
  editor aliases lose core plugin keys.

Decisions and tradeoffs:
- Kept broad value generic default as `any`.
- Changed plugin generic default to `unknown`.
- Made deliberately broad internal type positions explicit with `<any, any>`.
- Added negative type tests instead of a runtime test because this bug is purely
  compile-time.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial null-delimited rewrite invocation used the wrong file-list pipe | 1 | Run the rewrite with `xargs -0` correctly | Fixed and compiler verified. |
| Core lint formatting after type edits | 1 | Run package lint fix | `pnpm --filter @platejs/core lint:fix` fixed formatting. |

Verification evidence:
- `pnpm exec tsc -p packages/core/tsconfig.type-tests.json --noEmit` passed.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint:fix` ran after formatting failure.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm check:core` passed with `1872 pass`, `85 skip`, `0 fail`.
- Source audit passed with only expected matches: value generic defaults,
  `NameofPlugins`, comments, and intentional negative type-test probes.

Final handoff contract:
- target surface and mode: named Core editor alias type packet.
- files/APIs reviewed: `BaseEditor`, `PlateEditor`, `NameofPlugins`, broad
  Core editor type slots, and new type contract.
- broad Core drift score coverage: N/A, not requested.
- best Plate v2 recommendation: strict plugin generic default `unknown`; broad
  runtime sites explicitly opt into `<any, any>`.
- verdict matrix summary: keep all changes.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: unsafe generic, bare alias,
  `NameofPlugins`, and fake API/tx probes swept with no deferred blockers.
- changes made: see Changed list.
- tests/proof commands: see Verification evidence.
- old compatibility names audited: unsafe plugin default and bare broad aliases
  audited.
- needs attention: explicit broad annotations are reviewable but correct.
- next best Plate Next packet: continue normal Core review mode; do not reopen
  this alias default unless a concrete inference regression appears.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Finished the named editor alias type-safety packet. |
| Where am I going? | Close the autogoal after mechanical plan validation. |
| What is the goal? | Prevent unparameterized editor aliases from accepting fake plugin API/tx calls while preserving core plugin APIs. |
| What have I learned? | Plugin generic `any` was the unsafe part; value generic `any` can remain broad. |
| What have I done? | Patched aliases, added type contracts, made broad internal sites explicit, and ran Core proof. |

Timeline:
- 2026-06-30 Goal plan created.
- 2026-06-30 Editor alias defaults patched.
- 2026-06-30 Type contract added.
- 2026-06-30 Focused and full Core proof passed.

Open risks:
- Low: broad `<any, any>` internal annotations are explicit and safe for this
  packet, but later Plate Next review can tighten individual sites.
