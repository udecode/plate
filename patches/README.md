# Local dependency corrections

`tailwindcss@4.1.8.patch` emits group and peer variants as ordinary ancestor and sibling selectors. Selector meaning and specificity are preserved. Avoiding the universal descendant inside `:is()` lets Chromium limit hover invalidation to matching elements. Both CommonJS and ESM compiler distributions are patched. `apps/www/tests/browser/tailwind-relational-variants.spec.ts` verifies compiled hover, focus, named, data, arbitrary, negated, combined and pseudo-element cases; the native interaction test checks the actual website with 30,000 token spans.

pnpm applies the Tailwind patch through the root `pnpm.patchedDependencies` entry. On dependency upgrades, rerun its browser cases and the native interaction benchmark. Remove the patch when the installed upstream implementation preserves the same behavior and bounded work. Evidence and source fingerprints live in `docs/plans/2026-09-05-code-block-docs-scrolling.md` and its artifact directory.
