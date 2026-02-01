<!--
## Sync Impact Report

- **Version change**: 0.0.0 → 1.0.0
- **Bump rationale**: MAJOR - Initial constitution creation
- **Modified principles**: N/A (new document)
- **Added sections**:
  - Principle I: Test-First (NON-NEGOTIABLE)
  - Principle II: Evidence Over Assumptions
  - Principle III: Diligence and Meticulousness
  - Principle IV: Search-First Discovery
  - Principle V: Simplicity and Minimalism
  - Feature Focus: DOCX Comments Export/Import
  - Development Workflow
  - Governance
- **Removed sections**: N/A
- **Templates requiring updates**:
  - `.specify/templates/plan-template.md` ✅ no update needed
    (Constitution Check section is a generic gate placeholder)
  - `.specify/templates/spec-template.md` ✅ no update needed
    (User scenarios + requirements align with test-first principle)
  - `.specify/templates/tasks-template.md` ✅ no update needed
    (Test-first workflow already built in)
- **Follow-up TODOs**: None
-->

# Plate DOCX Comments Constitution

## Core Principles

### I. Test-First (NON-NEGOTIABLE)

We are like Saint Thomas: we only believe after tests pass.
No feature, fix, or refactor is considered real until a test
proves it works.

- TDD MUST be followed: tests written first, tests MUST fail,
  then implement until green
- Red-Green-Refactor cycle MUST be strictly enforced
- No PR merges without passing test suite
- If a test does not exist for a behavior, that behavior is
  unverified and untrustworthy

### II. Evidence Over Assumptions

Every technical decision MUST be grounded in verified facts.

- Before claiming something works: run it, read the output,
  check the logs
- Before assuming an API shape: read the source, grep the
  codebase, check the types
- Before trusting documentation: verify against actual
  implementation
- "I think it works" is never sufficient; "the test passes"
  is the minimum bar

### III. Diligence and Meticulousness

We are diligent and meticulous in every aspect of development.

- MUST read code before modifying it; understand context before
  proposing changes
- MUST check for existing patterns in the codebase before
  introducing new ones
- MUST verify imports, paths, and types exist before
  referencing them
- Small, focused commits with clear purpose; no drive-by
  changes

### IV. Search-First Discovery

When facing unknowns, MUST search the codebase and
documentation before guessing.

- Use grep/glob/read to find existing implementations before
  writing new ones
- Check for prior art in the project before introducing new
  libraries or patterns
- Trace data flow through actual code paths, not assumed ones
- When something breaks, read the error and trace it to the
  source

### V. Simplicity and Minimalism

Start simple. Only add complexity when tests demand it.

- YAGNI: MUST NOT build for hypothetical futures
- Prefer the smallest change that makes the test pass
- No premature abstractions; three similar lines beat one
  clever helper
- If you can delete it without a test failing, it probably
  should not exist

## Feature Focus: DOCX Comments Export/Import

This constitution governs a specific feature scope:

- **Export**: Plate comments and discussions (including
  subcomments) MUST export to DOCX without unreadable tokens
  or simplification. The exported DOCX MUST contain all
  comment threads with full fidelity.
- **Import**: DOCX files with comments and subcomments MUST
  import into Plate and render correctly in the UI. Comment
  threads MUST be preserved with their full hierarchy.
- **No regressions**: Existing export/import functionality
  MUST NOT break. All changes MUST be covered by regression
  tests.

## Development Workflow

- All PRs MUST verify compliance with this constitution
- Code review MUST check for test coverage on every changed
  behavior
- MUST run full test suite before merging
- MUST commit after each logical task or group of tasks
- MUST stop at checkpoints to validate independently

## Governance

- This constitution supersedes all other practices for the
  DOCX comments export/import feature
- Amendments require: documentation of change, approval,
  migration plan for affected code
- Complexity MUST be justified against Principle V
- All five principles are equally binding; none may be
  deprioritized without an explicit amendment

**Version**: 1.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
