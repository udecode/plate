# plate-next html plugin config inference

Objective:
Remove the handwritten `HtmlConfig` workaround and restore main-style inferred `HtmlPlugin` typing without keeping HTML in the global Core API cycle.

Completion threshold:
`HtmlPlugin` has no exported handwritten config/API mirror, parser behavior stays green, no `editor.api.html` Core call sites remain, and Core typecheck/lint pass.

Verification surface:
Focused HTML plugin tests, static DOM fragment tests, Core typecheck, Core lint, and a source audit for explicit HTML config/API mirror patterns.

Constraints:
Use `plate-next` review mode. Preserve behavior unless the mock hid a real gap. Do not add public compat aliases, no `type HtmlApi` mirror, no full `PluginConfig<'html', ...>` hand typing, and no duplicate Plate wrapper around the HTML deserializer.

Boundaries:
Edit scope was `packages/core` HTML plugin, Core plugin registry typing, initial HTML value deserialization, and selected DOM fragment fallback. No broad Plate package migration, no public API rename pass, no docs/browser surface.

Blocked condition:
None. The original blocker was TypeScript circular inference through `CorePluginConfig`/`CorePluginApi`; it was removed by keeping HTML out of global Core API typing.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User asked why explicit `HtmlConfig` was needed when main inferred it. |
| Plate-next read | yes | `.agents/skills/plate-next/SKILL.md` read in this packet. |
| Mode classified | yes | Named file/API review packet, not broad Core sweep. |
| No-legacy target | yes | Removed workaround instead of blessing compatibility typing. |

Work Checklist:
- [x] Inspect current `HtmlPlugin`, `getCorePlugins`, and `deserializeHtml`.
- [x] Compare origin/main HTML plugin and Core plugin registry shape.
- [x] Remove exported handwritten `HtmlConfig`.
- [x] Remove HTML from `CorePluginConfig`/`CorePluginApi` inference cycle.
- [x] Replace `editor.api.html` Core call sites with direct HTML owner calls.
- [x] Repair selected DOM fragment proof after the old mock hid real text-fragment behavior.
- [x] Run focused tests, typecheck, lint, and source audit.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| HTML inference cleanup | done | No `HtmlConfig`, no `api.html`, no HTML API mirror audit matches. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/html/HtmlPlugin.spec.ts src/static/utils/getSelectedDomFragment.spec.tsx` -> 4 pass.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/html src/static/utils/getSelectedDomFragment.spec.tsx` -> 108 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `rg -n "api\\.html|HtmlConfig|PluginConfig<\\s*'html'\\s*,|createBasePlugin<\\s*HtmlConfig|type HtmlApi|InferConfig<typeof HtmlPlugin>\\['api'\\]|InferConfig<typeof HtmlPlugin>" packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx'` -> no matches.

Open risks:
None for this packet. HTML remains a plugin API/runtime feature, not a global Core API dependency.

Reboot status:
Complete. If this area reopens, start from `HtmlPlugin.ts`, `getCorePlugins.ts`, and the selected DOM fragment fallback test.
