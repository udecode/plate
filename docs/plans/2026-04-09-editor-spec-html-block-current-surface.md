# Editor Spec: HTML Block Current Surface

## Goal

Run the editor-spec workflow for HTML blocks as a current markdown-native
surface and decide whether the current `partial` parity row should tighten, or
whether the current evidence still only justifies a lighter status.

## Scope

- current standards/spec/protocol/parity docs
- compiled Typora research for HTML-block edit entry
- any current Plate package/docs evidence for HTML-block behavior
- minimal honest doc updates only

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load current HTML-block law and evidence | complete | standards/spec/protocol/parity/research |
| Compare current Plate evidence vs Typora authority | complete | current-surface or still thin |
| Decide status and law tightening | complete | move to `locked` with narrower current contract |
| Patch docs | complete | code + docs |
| Verify consistency | complete | standards/spec/protocol/parity alignment |

## Findings

- Typora evidence is strong for HTML-block edit entry as a source-entry surface.
- Current Plate law was already strong enough to formalize the family-level
  interaction shape.
- Current local Plate evidence for HTML-block-specific runtime behavior is still
  thinner than for links and markdown images if the bar is richer rendered edit
  chrome.
- The clearest local signal is still the markdown package html handling in
  `packages/markdown/src/lib/rules/defaultRules.ts`, which deserializes generic
  HTML nodes into text rather than a dedicated HTML-block editor surface.
- The smallest honest implementation seam is to preserve raw HTML block source
  more faithfully through the markdown package, so HTML remains editable source
  instead of lossy fallback text.
- That runtime/test seam now exists through markdown deserializer coverage.
- The honest current contract is narrower than the original row wording:
  source-canonical editable HTML source text, with richer rendered edit chrome
  deferred.
- With that contract shift, `HTML block` can now move to `locked`.
- Package changes require a markdown changeset, which now exists.
- No winner change was justified.
- No research-full pass was justified.

## Progress Log

- 2026-04-09: Started HTML-block current-surface spec pass.
- 2026-04-09: Confirmed the current stack already carries family-level
  source-entry law plus a protocol row for HTML-block edit entry.
- 2026-04-09: Confirmed current local Plate evidence is too thin for richer
  rendered HTML-block chrome, but strong enough for a source-canonical current
  surface.
- 2026-04-09: Confirmed the current markdown package still treats generic HTML
  nodes as text on deserialize, so there is no honest path to `locked` without
  new runtime/test work.
- 2026-04-09: Chose the next implementation seam: preserve raw HTML block
  source faithfully through markdown deserialization instead of dropping
  attributes/structure in fallback handling.
- 2026-04-09: Added markdown deserializer tests and fallback preservation so raw
  HTML blocks now keep attributes and nested source structure as editable text.
- 2026-04-09: Reframed the current HTML-block contract around source-canonical
  editable source text and moved richer rendered edit chrome to deferred.
- 2026-04-09: Verified the markdown package with targeted tests, package build,
  package typecheck, and repo `lint:fix`.
- 2026-04-09: Added `.changeset/markdown-html-block-source-fallback.md`.
