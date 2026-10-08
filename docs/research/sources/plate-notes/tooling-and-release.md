---
title: Tooling, docs build and release
type: source
status: partial
source_refs:
  - 52625e8502:docs/solutions/developer-experience
  - 52625e8502:docs/solutions/security-issues
updated: 2026-10-06
---

# Tooling, docs build and release

These lessons come from retired solution notes, and no rule, script comment or public doc states them. A reader checked each one against the current tree on 2026-10-06. Each source is a path under `docs/` at commit `52625e8502`; read it with `git show 52625e8502:docs/<path>`.

## Build

- **Turbopack aliases are app-relative.** `resolveAlias` targets must be app-relative paths with forward slashes and a `./` or `../` prefix; absolute filesystem targets fail with "Can't resolve './Users/...'" and "server relative imports are not implemented yet". Both Next configs build their aliases through `toAppImportPath` for this reason, and the helper has no comment saying so. Code: `apps/www/next.config.ts:14-20`, `apps/plite/next.config.ts:11`. Source: `solutions/developer-experience/2026-03-11-next-turbopack-react-compiler-workspace-aliases.md`.
- **Example galleries use an explicit importer map.** Route-level galleries map each key to its own `() => import('./_examples/x')`. A template-string ``import(`./examples/${path}`)`` makes the bundler pull in the whole directory, and Next 16 then parsed `custom-types.d.ts` as a module and failed the build. Code: `apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx:6-20`. Source: `solutions/developer-experience/2026-04-16-next-16-webpack-example-imports-must-use-explicit-maps-and-drop-next-config-eslint.md`.
- **Compiled MDX rejects HTML comments.** `<!-- x:start -->` fails with "Unexpected character `!` (U+0021)" in `@mdx-js/mdx` 3.1.1, so a generator that writes replaceable markers into compiled MDX emits `{/* x:start */}`. The registry changelog entries under `apps/www/src/registry/changelog/entries/` hold `<!-- entry: ... -->` and are safe only because the build parses them and never compiles them. Code: `tooling/scripts/generate-ui-changelog-entries.mjs:909`. Source: `solutions/developer-experience/2026-04-27-mdx-generated-markers-must-use-jsx-comments.md`.

## Templates and CI

- **The template updater runs `pnpm dlx shadcn@latest add`.** The `npx shadcn@latest` form failed only in GitHub Actions, with `ERR_MODULE_NOT_FOUND` for the transitive `tinyexec`, and the script has no comment saying so. Code: `tooling/scripts/update-template.sh:134-137`. Source: `solutions/developer-experience/2026-03-13-template-update-script-should-not-own-ci-verification.md`.
- **Bun can nest stale workspace packages under a local tarball.** Installing a local `platejs` tarball can still leave stale published workspace packages under `node_modules/<pkg>/node_modules/`, so a new export looks missing ("Export X doesn't exist in target module") while the source build is green. Template prep packs the changed package and its template-facing dependents and writes an `overrides` entry for every packed tarball. The local tarball showing in `bun install` output proves nothing; check for nested workspace copies. Code: `tooling/scripts/prepare-local-template-packages.mjs:487-499`, `prepare-local-template-packages.test.mjs:44`. Source: `solutions/developer-experience/2026-03-28-template-local-package-overrides-must-cover-transitive-exports.md`.
- **Reproduce registry and template workflow failures with `gh act`.** Run `gh act pull_request -W .github/workflows/registry.yml -j validate-registry` or `-W .github/workflows/ci-templates.yml -j ci` before pushing a CI fix. act needs a running Docker daemon and fails at once with "Cannot connect to the Docker daemon" without one. Source: `solutions/developer-experience/2026-03-13-template-update-script-should-not-own-ci-verification.md`.

## Dependencies

- **Drop a dependency with an unpatched advisory instead of guarding the call.** Remove it from the manifest and the lockfile and keep the small part you use as local code; a call-site guard leaves the vulnerable package in every consumer's dependency graph and security scanner. `@platejs/media` dropped `js-video-url-parser` (CVE-2026-5986, a ReDoS in its time parsing) for parsers built on the URL API, with tests for each provider variant and one exploit-input test. That test's `< 100 ms` wall-clock assertion breaks the rule against time budgets in blocking tests, so assert the parse result instead and do not copy the timing check. Code: `packages/platejs/src/features/media/lib/media/parseMediaUrl.spec.ts:257`. Source: `solutions/security-issues/2026-04-24-media-video-url-parser-redos.md`.
