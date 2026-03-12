# www Typecheck Regression Investigation

## Goal
Find which local workspace/config change caused `apps/www` registry files to start surfacing type errors that did not appear before.

## Checklist
- [x] Reproduce current `apps/www` typecheck failure
- [x] Identify failing files and exact diagnostics
- [x] Inspect `apps/www` tsconfig / package resolution / workspace setup changes
- [x] Compare current resolution path against expected published/dist path
- [x] Pin root cause
- [ ] Propose minimal fix without guessing

## Findings
- Reproduced current `apps/www` errors: implicit-any diagnostics in `src/registry/components/editor/plugins/ai-kit.tsx`, `copilot-kit.tsx`, `src/registry/ui/ai-menu.tsx`, `toc-node.tsx`, and `toc-node-static.tsx`.
- Root `tsconfig.json` source path aliases are not the primary cause. A temp app tsconfig that removed inherited `@platejs/*`/`platejs` source aliases still produced the same errors.
- `apps/www` now consumes local workspace packages via `workspace:^` entries in `apps/www/package.json`.
- The local package declarations being consumed are the problem. In `packages/ai/dist/react/index.d.ts`, `AIPlugin` and `AIChatPlugin` are declared as `any`. In `packages/toc/dist/react/index.d.ts`, `useTocElementState()` returns `editor: any` and `headingList: any`. Those `any` declarations erase contextual typing in the registry callbacks and trigger `noImplicitAny` in app code.
- This means the apparent `apps/www` regression is actually a package declaration quality regression surfaced by the workspace setup.

## Verification Log
- `pnpm --dir apps/www typecheck`: reproduced failure
- `pnpm --dir apps/www exec tsc --noEmit -p tsconfig.debug-node_modules.json`: same failure even without inherited root package source aliases
- inspected `packages/ai/dist/react/index.d.ts` and `packages/toc/dist/react/index.d.ts`: confirmed exported `any` types at the relevant APIs

## Learnings
- The fast way to separate tsconfig-alias regressions from package-declaration regressions is a temp app tsconfig that strips inherited package paths. If the same errors survive, stop blaming root aliases.
- Workspace refs in app manifests make declaration regressions surface immediately. That is useful, but it means bad generated `.d.ts` files in packages leak straight into app typecheck.
