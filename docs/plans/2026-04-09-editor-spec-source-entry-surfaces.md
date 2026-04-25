# Editor Spec: Markdown-Native Source-Entry Surfaces

## Goal

Run the editor-spec workflow for the markdown-native source-entry surface
family:

- links
- markdown images
- HTML blocks

Decide whether the current law should stay split across those entities or
whether the standards/spec/protocol/parity stack should recognize one explicit
interaction family.

## Scope

- current editor-behavior standards/spec/protocol/parity/audit docs
- compiled research for Typora link/image/html behavior
- current link/image/html law and protocol rows
- minimal honest doc updates only

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load editor-spec + research stack | complete | standards/spec/protocol/parity/audit/research |
| Inspect current link/image/html law | complete | current split across markdown spec and protocol |
| Decide family shape + authority | complete | markdown-native source-entry subfamily under Typora |
| Patch docs | complete | smallest honest set |
| Verify consistency | complete | terminology + links + parity honesty |

## Findings

- Existing evidence was already sufficient to formalize one markdown-native
  interaction family: source-entry surfaces.
- Authority did not change; Typora was already the real owner for this behavior.
- The family now explicitly covers:
  - links
  - markdown images
  - HTML blocks
- `Link` and `Image` stay `locked`.
- `HTML block` was initially tracked as `partial`, then later moved to
  `locked` once the source-canonical current surface gained direct markdown
  deserializer test coverage.
- No research-full pass was justified. The compiled research lane was already
  strong enough for the family-level law.

## Progress Log

- 2026-04-09: Started editor-spec pass for markdown-native source-entry surfaces.
- 2026-04-09: Read the editor-spec stack plus the compiled Typora source-entry decision/concept/source pages.
- 2026-04-09: Added a markdown-native source-entry winner line to standards, family law to the readable spec, family rows to the protocol matrix, and an explicit HTML block row to parity.
- 2026-04-09: HTML block later moved from `partial` to `locked` once the
  source-canonical current surface was proven directly in the markdown package
  tests.
