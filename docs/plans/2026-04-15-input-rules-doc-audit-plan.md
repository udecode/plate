# Input Rules Doc Audit Plan

## Status

In progress.

## Goal

Audit and update all current docs that show `inputRules` usage so they match the
current API and kit wiring.

## Scope

- guide pages
- plugin pages
- element pages
- registry-facing examples that surface in docs builds
- `content/components/changelog.mdx`

## Checks

- no stale `CodeBlockRules.markdown()` examples without `on`
- no stale `MathRules.markdown({ variant: '$$' })` examples without `on`
- no stale wording that frames input rules as hidden defaults or string-key
  activation
- changelog entry explains the docs-facing shift clearly

## Verification

- `pnpm turbo build --filter=./apps/www`
- `pnpm turbo typecheck --filter=./apps/www`
- `pnpm lint:fix`
