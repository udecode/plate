# Commands, availability and shortcuts

The ledger asks for the smallest command contract that shares availability and intent between headless calls, shortcuts and UI controls. The 2026-10-04 audit stopped. A command descriptor is opaque identity plus `id`, authored with `defineCommand(id, { build })` and run with `editor.update.command(command, input)`. Installed dispatch composes ordered `handle` and `around` interception, input rewrites, delegation, read-only checks and native-equivalence decisions, and prepared continuations let a handler stage a prefix that downstream handlers read before one commit. Plate shortcuts and UI target plugin `update` and `api` methods by name. The 2026-09-11 core cuts removed the descriptor's default-only `build()` ([core cuts plan](../2026-09-11-plite-core-cuts.md)). `node tooling/scripts/review-ledger.mjs show commands` prints the scope's history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Semantic dispatch and native equivalence | Plite, `packages/plitejs/src/core/command-registry.ts`, with the private runtime in `command-definition.ts`. |
| Unpublished continuations | Prepared specs: input rules and link exit call `next.after(prefix)` so downstream commands read the staged result ([transactions](transactions.md)). |
| Toolbar presentation and feature policy | Their product owners; copied UI reads its feature's own reads and policy for availability. |
| One-use product actions | Ordinary helpers, not commands. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The descriptor's public `build(state, input)` | No production caller; a second, default-only evaluation path. |
| Renaming it to `preview`, or adding `can` | No consumer that needs full installed-policy semantics. |
| A universal availability or preview API | Speculative; copied UI uses its feature's reads. |
| Deleting the registry or every prepared spec | Loses real middleware and continuation jobs, or forces intermediate commits. |
| Function-only mutable dispatch | Would rebuild identity, ordering, headless evaluation and unpublished continuation. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- The command descriptor carries identity and `id`; definition-time `build`, installed dispatch and prepared transaction specs remain.

## Open work

- The 2026-09-11 cut's strict package, packed-artifact and full browser handoff did not finish in the shared checkout. owner: zbeyens. stop: the next `commands` review reruns them.
