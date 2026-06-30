# plate-next pipe change specs

Objective:
Review `pipeOnTextChange.spec.ts` and `pipeOnNodeChange.spec.ts` under Plate
Next review mode; remove fake migration casts while preserving main-parity
handler behavior.

Completion threshold:
Named-file packet is complete when both specs use current Core/Plite APIs
without `createBasePlugin as any`, fake operation casts, or renamed owners; the
focused tests, Core typecheck, and Core lint pass.

Verification surface:
- `pnpm --filter @platejs/core exec bun test ./src/lib/utils/pipeOnTextChange.spec.ts ./src/lib/utils/pipeOnNodeChange.spec.ts`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm --filter @platejs/core lint`
- source audit for removed fake casts in the two target specs

Constraints:
- Plate owns product handler dispatch.
- Plite owns operation types.
- Keep current file names and owners; no rename pass.
- Do not broaden into full Core sweep.
- Do not chase non-Core package drift.

Boundaries:
- allowed edit scope: the two named specs and this autogoal scratchpad.
- package/API surfaces: Core tests only; no runtime API changes.
- docs/browser surfaces: not applicable.
- non-goals: no full Core drift ledger, no public API plan, no runtime rewrite.
- out-of-scope package errors: none observed.

Blocked condition:
None. The scoped proof passed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Target capture | complete | User named the two Core utility specs. |
| Source review | complete | Compared current specs with `origin/main` and current pipe implementations. |
| Cleanup packet | complete | Removed plugin-factory casts and fake operation casts. |
| Proof | complete | Focused tests, Core typecheck, Core lint, and source audit passed. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target files copied into objective and boundaries. |
| `plate-next` skill/rule read | yes | User supplied active skill body in prompt. |
| Active goal checked or created | yes | Scratchpad created at this path. |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet; broad Core sweep explicitly out of scope. |
| Broad Core drift ledger initialized when in scope | no | Not a broad Core request. |
| Source of truth and allowed workspace recorded | yes | Current files plus `origin/main`; workspace `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | Targeted reads and focused proof only. |
| Public API fork routing checked | yes | No public API fork required. |
| Review-mode rename freeze checked | yes | No renames performed. |

Work Checklist:
- [x] First checkpoint complete: explicit target, scope boundary, non-goals,
      proof commands, and success criterion copied into this plan.
- [x] Mode classified as named file/API packet.
- [x] Broad Core sweep ruled out.
- [x] Review matrix filled for inspected specs.
- [x] Public API fork checked and not needed.
- [x] Review-mode rename freeze applied.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run.
- [x] Export/barrel proof recorded as not applicable.
- [x] Source audit run for removed fake casts.
- [x] Changed list and needs-attention rows filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests | `4 pass`, `0 fail`. |
| Broad Core drift ledger coverage | no | Record N/A | Not a broad Core sweep. |
| Score gate | yes | No high drift rows remain in target specs | Both specs score clean after removing fake casts. |
| Package/API proof | yes | Run Core typecheck and lint | Both passed. |
| Non-Core package error triage | no | Record N/A | No non-Core failures observed. |
| Source audit | yes | Audit removed fake casts | `rg` returned no matches. |
| Rename ledger | no | Record N/A | No rename suggested or performed. |
| Autoreview / review | no | Record N/A | Tiny test-only cleanup with focused proof. |
| Final lint/check | yes | Run scoped lint | Core lint passed. |
| Changed list / top drift / needs attention | yes | Fill handoff rows | Recorded below. |
| Goal plan complete | yes | Run `check-complete.mjs` | Pending until final command in this run. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/utils/pipeOnTextChange.spec.ts` | 1 | main-parity-cleanup | Core handler pipe tests | Removed factory cast and fake operation cast; kept handler stop/read-only assertions. | Keep. |
| `packages/core/src/lib/utils/pipeOnNodeChange.spec.ts` | 1 | main-parity-cleanup | Core handler pipe tests | Removed factory cast and fake operation cast; kept handler stop/read-only assertions. | Keep. |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Typed pipe specs | Core tests | `createBasePlugin as any` and operation `as any` hid migration drift. | Two target specs; focused tests/typecheck/lint. | Keep. | None. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | None. |
| tests/proof | Replaced fake plugin factory casts with typed `BasePlugin['handlers']`; replaced fake operation casts with real Plite `TextOperation` and `NodeOperation`. |
| docs/templates/skills | This scratchpad only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None for these specs | The cleanup is test-only and proof is green. | Target specs | No review needed beyond normal diff scan. |

Verification evidence:
- Focused tests: `pnpm --filter @platejs/core exec bun test ./src/lib/utils/pipeOnTextChange.spec.ts ./src/lib/utils/pipeOnNodeChange.spec.ts` -> `4 pass`, `0 fail`.
- Core typecheck: `pnpm turbo typecheck --filter=./packages/core` -> passed.
- Core lint: `pnpm --filter @platejs/core lint` -> passed.
- Source audit: `rg -n "as any|createBasePlugin as any|\\{ type: 'insert_(text|node)' \\} as any|AnyBasePlugin" packages/core/src/lib/utils/pipeOnTextChange.spec.ts packages/core/src/lib/utils/pipeOnNodeChange.spec.ts` -> no matches.

Reboot status:
This was a scoped named-file Plate Next packet. Runtime owners were read but not
changed. Continue with the next user-named Core file or a broad Core sweep only
if explicitly requested.

Open risks:
None for this packet.
