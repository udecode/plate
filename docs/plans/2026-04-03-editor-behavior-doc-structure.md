# Editor Behavior Doc Structure Cleanup

## Goal

Make `docs/editor-behavior/` easier to use before more protocol work lands.

The target split stays:

- `README.md` = entry map
- `markdown-standards.md` = authority and methodology
- `markdown-editing-spec.md` = readable law
- `editor-protocol-matrix.md` = exhaustive scenario matrix
- `markdown-parity-matrix.md` = family coverage gate
- `markdown-editing-reference-audit.md` = external reference evidence
- `docs/research/systems/editor-behavior-architecture.md` = long-horizon architecture
- `references/*` = corpus inventories and usage

## Cleanup Rules

- delete stale copies instead of keeping “just in case” archaeology
- remove outdated draft language once the newer doc state supersedes it
- keep canonical examples in the spec, not entire family backlogs
- keep execution history in `docs/plans/`, not under `docs/editor-behavior/`

## Findings

- `docs/editor-behavior/plans/` was dead weight once execution moved to
  `docs/plans/`.
- the readable spec still duplicated family backlog material that belongs in
  the protocol matrix
- multiple docs still talked like the work was pre-audit even though the matrix
  is now filled for in-scope families

## Progress

- 2026-04-03: removed stale reference/corpus plan copies from
  `docs/editor-behavior/plans/`
- 2026-04-03: trimmed duplicated family backlog sections out of
  `markdown-editing-spec.md`
- 2026-04-03: repointed `README.md` to the surviving docs and `docs/plans/`
- 2026-04-03: updated stale wording in surviving docs so they describe the
  current structure instead of an earlier draft stage
