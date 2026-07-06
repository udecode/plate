# Cut React Plugin Wrapper

Objective:
Cut the `ReactPlugin` wrapper and `editorExtensions` skip option by splitting the DOM plugin owner cleanly.

Completion threshold:
Done when React core installs the Plate DOM behavior without inheriting the plain Plite DOM bridge, `toPlatePlugin` has no skip option, stale `ReactPlugin` names are gone from source, focused Core proof is green, barrels are regenerated if needed, and final plan check passes.

Verification surface:
- Source audit: `rg -n "ReactPlugin|editorExtensions|inheritEditorExtensions|react/plugins/react" packages/core/src packages/core/type-tests --glob '!**/dist/**'`
- Smoke: create a Plate editor from source.
- Focused tests: Core editor/plugin tests touched by this packet.
- Package proof: `@platejs/core` tests, Core typecheck, Core lint.
- Barrel proof: `pnpm brl` after deleting exported plugin files.

Constraints:
- Best Plate v2 shape wins over compatibility.
- No wrapper whose only job is suppressing inherited editor extensions.
- No broad Core sweep; this is a named React DOM ownership packet.
- Do not rename unrelated files.
- Preserve Plite ownership of the real DOM bridge and Plate ownership of auto-scroll ergonomics.

Boundaries:
- Allowed edits: Core DOM plugin, React core plugin list, `toPlatePlugin`, affected Core specs/barrels, and this plan.
- Docs/browser work: not applicable; runtime/package API cleanup only.
- Non-goal: redesign DOM APIs, navigation feedback, or all Core plugins.
- Out-of-scope package errors: ignored unless proof shows a Core regression.

Blocked condition:
Blocked only if React editor creation still needs two conflicting DOM editor extensions after the DOM owner split.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User asked to cut `editorExtensions: 'skip'` instead of keeping the hack. |
| Skill read | yes | `plate-next` instructions read before implementation. |
| Goal active | yes | Goal created for this packet. |
| Mode classified | yes | Named React DOM ownership cleanup, not broad Core sweep. |

Work Checklist:
- [x] Split DOM plugin into a bridge-free Plate DOM base and the full base-editor DOM plugin.
- [x] Replace React core `ReactPlugin` with direct `toPlatePlugin` use of the bridge-free DOM plugin.
- [x] Remove `editorExtensions` / `inheritEditorExtensions` support from `toPlatePlugin`.
- [x] Delete stale React plugin wrapper exports and regenerate barrels.
- [x] Update focused tests that referenced `ReactPlugin`.
- [x] Run source audit and focused/package proof.
- [x] Record final evidence, risks, and handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source audit | yes | Stale wrapper/skip names removed from source | `rg -n "\bReactPlugin\b|\beditorExtensions\b|inheritEditorExtensions|react/plugins/react" packages/core/src packages/core/type-tests --glob '!**/dist/**'` returned no matches. |
| Package proof | yes | Focused tests, Core tests, typecheck, lint, build | Smoke created editor; focused 45 pass; Core 701 pass; typecheck pass; lint pass; build pass. |
| Barrel proof | yes | Run `pnpm brl` | `pnpm brl` completed 57 package barrel tasks. |
| Final plan check | yes | Run `check-complete.mjs` | Passed. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Implementation | done | React wrapper removed; DOM owner split; proof passed. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun -e "import { createPlateEditor } from './src/react/editor/withPlate.ts'; const editor = createPlateEditor(); console.log(editor.id ? 'created' : 'missing-id');"` -> `created`
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/react/editor/TPlateEditor.spec.ts src/react/editor/TPlateEditorCore.spec.ts` -> 45 pass.
- `pnpm brl` -> 57 successful barrel tasks.
- `pnpm --filter @platejs/core test` -> 701 pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm --filter @platejs/core build` -> pass.
- `rg -n "\bReactPlugin\b|\beditorExtensions\b|inheritEditorExtensions|react/plugins/react" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no matches.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-cut-react-plugin-wrapper.md` -> pass.

Reboot status:
Packet complete. If revisited, next owner is broader Plate DOM API review, not this wrapper cut.

Open risks:
Low. `DOMPluginBase` is now exported through the DOM plugin barrel because React core needs the bridge-free owner. If that public name is unwanted, handle it in a later API curation pass rather than reintroducing the skip hack.
