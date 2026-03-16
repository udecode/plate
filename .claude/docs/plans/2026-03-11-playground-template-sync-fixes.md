# Playground Template Sync Fixes

## Scope
- Fix playground template build/typecheck failures caused by stale generated files or stale `apps/www` registry items.
- Current blocker after DOCX fixes: AI command prompt API mismatch (`backgroundData` vs current structured prompt shape).

## Checklist
- [x] Reproduce playground build failure
- [x] Fix missing DOCX registry/template wiring
- [x] Compare playground AI command files with `apps/www` registry source
- [x] Patch template/source mismatch
- [x] Re-run `bun run build`
- [x] Re-run `bun run typecheck`
- [x] Run `bun lint:fix`

## Findings
- The playground template had multiple stale/generated mismatches layered on top of each other, so fixing the first error just exposed the next one.
- Initial playground failure was missing DOCX wiring, not a generic TS problem.
- After fixing DOCX registry/template wiring, build now fails in `src/app/api/ai/command/prompts.ts` due to stale `backgroundData` usage.
- `apps/www` registry source already uses the newer `prompt/*` layout and `context`/`instruction` API.
- `templates/plate-playground-template/src/app/api/ai/command/prompts.ts` was dead stale baggage; `route.ts` imports `./prompt`, not `./prompts`.
- `apps/www` registry source and the template route were both stale against `ai@5.0.28`: they used `generateText(...).output` and `streamText + Output.array` instead of `generateObject` / `streamObject`.

## Verification Log
- `bun install` in `templates/plate-playground-template`: passed
- `bun run build` in `templates/plate-playground-template`: progressed past DOCX failure, now fails on structured prompt API mismatch

## Learnings
- Pending

- `docx-export-kit` registry dependencies were using nonexistent `*-static` item names; contentlayer only accepts actual registry item names.
- The playground template `tooltip.tsx` was stale against the working app version and broke prerendering because `Tooltip` did not wrap a `TooltipProvider`.
- `ai@5.0.28` route patterns here were stale in two ways: the route carried dead `prompts.ts` baggage, and the structured-output usage had drifted away from the installed SDK types.

## Verification Log
- `bun install` in `templates/plate-playground-template`: passed
- `bun run build` in `templates/plate-playground-template`: passed
- `bun run typecheck` in `templates/plate-playground-template`: passed
- `pnpm --dir apps/www typecheck`: passed
- `bun typecheck`: passed
- `bun lint:fix`: passed

## Learnings
- package reality: dead generated files in templates are not harmless; Next build/typecheck will still walk them. Delete them instead of migrating two parallel implementations.
- package reality: registry dependencies must reference registry item names, not convenient file-shaped names like `callout-node-static`.
- durable testing rule: when a template build fails, diff the template file against `apps/www` registry source before inventing a new fix. Most of the time the template is just stale.
- bug found: the AI command route pattern in `apps/www` registry source had drifted from the installed SDK expectations, so the source of truth needed fixing, not just the generated template copy.
