# plate-next editor runtime rename

Objective:
Rename the Plate editor runtime bucket from `editor.meta` to `editor.runtime`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-30-plate-next-editor-runtime-rename.md

Primary template:
docs/plans/templates/plate-next.md

Completion threshold:
- Runtime/editor bookkeeping uses `editor.runtime`.
- Document value metadata remains `value.meta` / `editor.read.meta()`.
- No public `editor.meta.*` runtime references remain in Core source/tests or source docs/app code.
- No compatibility alias/getter for `editor.meta`.
- Core proof passes.

Verification surface:
- Source audit for stale runtime `editor.meta`, old indexed access types, and
  old type names.
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `pnpm check:core`
- `pnpm --filter www check:docs`
- Browser route attempt for the touched docs page, or explicit blocker.

Constraints:
- Do not rename document value `meta`.
- Do not rename registry/component metadata fields.
- Do not touch generated registry output.
- Do not add `_runtime`, `_cache`, or compatibility aliases.
- Keep the packet scoped to the editor runtime bucket.

Boundaries:
- Allowed: Core editor/runtime types, Core callsites/tests, and source
  docs/examples that mention the editor runtime bucket.
- Allowed app code: source callsites under `apps/www/src` that directly read
  `editor.meta`.
- Not allowed: generated registry output, registry metadata fields, document
  value `meta`, and broad unrelated Plate package/app compile repairs.

Blocked condition:
Stop if proving the docs route requires repairing unrelated package/app compile
failures outside this rename packet. Record the blocker instead of widening
scope.

Start Gates:
| Gate | Applies | Status | Evidence |
|------|---------|--------|----------|
| Prompt requirements captured before work | yes | done | User approved `editor.runtime` over `_runtime` / `_cache`; hard rename, no private underscore. |
| `plate-next` skill read | yes | done | `.agents/skills/plate-next/SKILL.md` read before patching. |
| Active goal created | yes | done | Active goal tracks this rename packet. |
| Mode classified | yes | done | Targeted public editor bucket rename, not broad Core sweep. |
| Gap policy checked | yes | done | No Plite/Plate feature gap required for the rename. |
| Review-mode rename freeze checked | yes | done | Exception applies because the user explicitly approved this rename. |

Work Checklist:
- [x] Renamed Core runtime bucket types from meta to runtime.
- [x] Renamed Core runtime callsites from `editor.meta` to `editor.runtime`.
- [x] Updated Plate editor React/fallback/root types.
- [x] Updated source docs for the Plate editor runtime property.
- [x] Preserved document value `meta` / `editor.read.meta()` semantics.
- [x] Avoided generated registry output and unrelated metadata fields.
- [x] Audited stale public `editor.meta` runtime references.
- [x] Ran Core typecheck/lint/check proof.
- [x] Ran docs check proof.
- [x] Tried browser proof and recorded unrelated app compile blocker.
- [x] Recorded changed list, proof, remaining risk, and needs-attention.

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BaseEditor.runtime` | 100 | keep | Core editor runtime | Replaces ambiguous runtime `meta` bucket without touching document metadata. | Done. |
| `PlateEditor.runtime` | 100 | keep | React Plate editor type | Preserves Plate editor runtime shape under the new name. | Done. |
| Runtime cache fields | 100 | keep | Core runtime | `pluginList`, `pluginCache`, `shortcuts`, `inputRules`, `components`, fallback and root ids moved under `runtime`. | Done. |
| Document value `meta` | 100 | keep | Plite document value | Not part of editor runtime bucket. | Done. |
| Generated registry metadata | 100 | keep untouched | Registry output | Excluded from rename packet. | Done. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| checkpoint zero | done | Requirements captured and goal plan created. |
| source map | done | Runtime bucket refs separated from document/registry metadata. |
| implementation | done | Core/docs runtime refs moved to `editor.runtime`. |
| proof | done | Core proof and docs check passed; browser route blocker recorded. |
| handoff | done | Changed list, proof, blocker, and review attention recorded. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| Editor runtime bucket | `editor.runtime` | `_runtime`, `_cache`, `editor.meta` alias | Runtime is honest; underscore is fake privacy; cache is too narrow; `meta` conflicts with document metadata. | Already approved. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | N/A | N/A | Core proof | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `editor.meta` -> `editor.runtime` | `rg` audit for stale runtime refs across Core source/tests, docs/app source, excluding generated registry output | none | all expected runtime refs patched | generated registry metadata untouched | low |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Renamed the Plate editor runtime bucket to `runtime` in Core editor/runtime types, React editor types, fallback/root editor helpers, and runtime callsites. |
| tests/proof | Updated Core tests touched by the rename; no dead-code removal assertion added. |
| docs | Updated Plate editor API docs to teach `runtime` instead of `meta`. |
| reverted/quarantined packets | None. |

Verification evidence:
- `rg -n "editor\.meta\b|\.meta\.(pluginList|pluginCache|shortcuts|inputRules|components|isFallback|uid|key|userId)\b|PlateEditor\['meta'\]|BaseEditor<[^>]+>\['meta'\]|\bPlatePluginMeta\b" packages/core/src packages/core/type-tests apps/www/src content/docs --glob '!**/dist/**' --glob '!**/.next/**' --glob '!apps/www/src/__registry__/**' --glob '!apps/www/src/generated/**'` -> no matches.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint:fix` -> fixed formatting/imports.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm check:core` -> pass, 1872 pass, 85 skip, 0 fail.
- `pnpm --filter www check:docs` -> pass.
- Browser route proof attempted at `http://localhost:3002/docs/api/core/plate-editor`; blocked by unrelated app compile failures in registry/package surfaces such as missing `withLink`, `withTable`, `PliteElement`, `toTPlatePlugin`, `useFocused`, and `useReadOnly`. This packet does not patch those unrelated Plate package/app blockers.

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Browser docs proof blocked | The app cannot compile current registry/package imports, so the docs route returns 500. | `apps/www` dev server output | Treat as a separate Plate package/app cleanup lane, not part of this rename. |

Completion Gates:
| Gate | Applies | Status | Evidence |
|------|---------|--------|----------|
| Named verification threshold | yes | done | Source audit, Core typecheck/lint/check, docs check. |
| Source audit | yes | done | No stale runtime `editor.meta` refs in scoped source. |
| Package/API proof | yes | done | Core proof passed. |
| Non-Core package error triage | yes | done | Browser blocked by unrelated app compile failures, recorded above. |
| Rename ledger | yes | done | User accepted `editor.runtime`; rejected underscore/private naming. |
| Autoreview / review | no | N/A | Focused rename packet; command proof substituted. |
| Changed list / needs attention | yes | done | Tables above. |
| Goal plan complete | yes | done | Ready for `check-complete.mjs`. |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Rename packet implemented and verified at Core/docs-check level. |
| Where am I going? | Close autogoal after plan verification. |
| What is the goal? | `editor.runtime`, no stale runtime `editor.meta`. |
| What learned? | `meta` collisions are real because Plite document values own `meta`; `runtime` is the clean bucket. |
| What done? | Code/docs renamed, source audit clean, Core proof passed, app browser blocker recorded. |

Open risks:
- Browser proof for the docs page is blocked by unrelated current app/package compile failures. This does not invalidate the Core rename, but it blocks page-render confidence until the app lane is repaired.
