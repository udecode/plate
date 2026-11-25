# Potion's code conventions

The conventions Potion's own code follows, outside `src/registry`. They replace
the rule files Potion kept in its own `.claude/rules/` until 2026-11-25, which
were mostly pasted library docs. Read this before changing Potion's own
components, modals, toasts, stores or tests. `src/registry` follows Plate, as
[the registry reference](./registry.md) says.

## UI

- Shared UI components live in `src/registry/ui/`, synced from Plate or added
  with the shadcn CLI. `src/components/ui/` holds only app-only pieces, such
  as `empty.tsx` and `resizable-panel.tsx`.
- `Button` from `src/registry/ui/button.tsx` takes an `icon` prop and a
  `tooltip` prop. Use them instead of wrapping it in a `Tooltip` by hand.
- Styling is Tailwind v4. Theme tokens live in `src/app/globals.css`.
- React Compiler is on, so new code does not memoize by hand. Next turns it on
  with `reactCompiler: true`. The TanStack Start move must turn it on in the
  Vite config, or this rule stops holding.

## Modals

- Every app modal is registered once in `src/components/modals/modals.tsx`
  through `createPushModal`. Add a new modal there.
- Open one with `pushModal('<Name>', props)`, with callbacks passed as props,
  and close it with `popModal()`. Do not keep a modal's open state in local
  React state.
- A confirmation uses the registered `Confirm` modal, which wraps
  `AlertDialog` and closes itself through `AlertDialogAction`.
- An action that needs a signed-in user opens through
  `authGuard(() => pushModal(...))` from `src/components/auth/useAuthGuard.ts`,
  which opens the `Login` modal for a guest.

## Toasts

- Toasts come from `sonner`: `import { toast } from 'sonner'`. The app mounts
  `<Toaster />` from `src/components/toaster.tsx` once, in the root layout.
- Async work uses `toast.promise(promise, { loading, success, error })`.
  Immediate feedback uses `toast.success`, `toast.error`, `toast.info` or
  `toast.warning`. Never use `alert()`.

## State

- Scoped React state uses jotai-x's `createAtomStore(initial, { name })`,
  which gives `<Name>Provider` and `use<Name>Value`, `use<Name>Set`,
  `use<Name>State` and `use<Name>Store`. Examples: the app store in
  `src/components/providers/app-provider.tsx` and the version store in
  `src/components/editor/version-history/version-history-panel.tsx`.
- `zustand-x` backs one global store, `src/components/search/SearchStore.ts`.
  Add a global store only when a provider cannot scope the state.

## Validation

- Zod v4 (`import { z } from 'zod'`) parses input at each boundary, such as a
  server procedure's input or stored JSON, as `src/lib/stored-document.ts`
  does. From the TanStack Start move on, routes parse their search params
  with zod in `validateSearch`.

## Tests

- Tests are `*.test.ts` files next to their source. They import `describe` and
  `it` from `node:test` and `assert` from `node:assert/strict`, not
  `bun:test` globals.
- `bun test --conditions=production src`, with `SKIP_ENV_VALIDATION=true` as
  CI sets it, runs them all. One file runs with
  `bun test --conditions=production <path>`.
- There are no React component or hook tests. Behavior in the browser is
  proven through `verify`'s Potion stack recipe.
