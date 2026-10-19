# Generated contracts

Compiler and CLI share one semantic owner: `platejs/compiler`'s `compileEditor` runs the same Plate lowering as `createEditor` and `defineDocumentMigrations`. Generated contracts stay an opt-in at the application graph, for jobs inference cannot do. Reusable registry items never require CLI-generated application types; they import their owning descriptor and let the public API infer the capability. The 2026-10-04 audit stopped, and the one name-only exception the last review kept has since become a descriptor portal ([triage audit](../2026-10-04-ledger-triage-audit.md)). `node tooling/scripts/review-ledger.mjs show compiler` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Copied registry items | Import the owning descriptor: `tx.plugin(KbdPlugin).toggle()` inside `useEditor().update`, `editor.plugin(Plugin).update` for one feature. Node renderers derive local schema properties from their descriptor. A failed inference is repaired in the owning API, never with a graph import, cast or handwritten union. |
| Generated exact contracts | Statically check one complete customized document shape and its schema and mutation contract. The CLI test covers valid and invalid generated `Value` examples and stale output. Apps opt in at explicit data or editor construction boundaries. |
| Published declarations | Package declaration files and public descriptor-derived types are valid dependencies; they are not app-specific CLI output. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Mandatory generation per application | A copied toolbar would inherit assumptions about unrelated features. |
| Generation per registry item | Duplicates contracts. |
| A shared mega-editor type | Hides installation assumptions; an asserted type cannot say which editor a React context supplies. |
| Editor-type generics on every component | Adds graph work where one capability is needed. |
| Removing generation | Drops its exact-data job. |
| Recursively inferring every document grammar | Not selected without an exactness and type-cost comparison. |

## What other editors do

Not compared in this scope's reviews; the question is internal to Plate's descriptor and CLI owners.

## Main changes

- No reusable registry TS or TSX file imports `plugins.generated`; the generated artifact stays used by an application integration fixture.

## Open work

- Compiler-wide correctness and adoption are not certified; the review was source inspection only. owner: the next compiler review. stop: a run of the CLI and type fixtures on the current tree.
