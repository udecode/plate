# Footnote Duplicate Definition Normalization Spec

## Goal

Define the editor-behavior law for duplicate footnote-definition identifiers
without pretending the runtime already auto-normalizes them.

## Classification

- existing current feature family: footnote
- family: markdown extension
- question type: pure law / protocol update
- implementation status: deferred cleanup lane, not current gate work

## Findings

- current footnote law already locks:
  - inline void ref atom
  - block definition model
  - insert flow
  - preview and navigation
  - registry-backed lookup
- current package surface already exposes duplicate detection helpers:
  - `api.footnote.hasDuplicateDefinitions`
  - `api.footnote.duplicateIdentifiers`
  - `api.footnote.definitions`
- current docs do not yet say what future normalization should do once Plate
  chooses to repair duplicate definitions
- external syntax references are useful for canonical single-definition shape,
  but they are thin on repair semantics, so normalization policy is a local
  owner decision

## Edit Plan

- [x] inspect current footnote spec / protocol / parity state
- [x] define duplicate-definition normalization as deferred law, not shipped behavior
- [x] keep footnote parity locked for the current lane
- [x] avoid audit churn unless a real winner shift appears

## Outcome

- readable law now says duplicate-definition detection is current behavior
- readable law now says normalization / repair is deferred
- protocol matrix now has a deferred `EDIT-FOOTNOTE-DUP-001` row
- parity stays locked; footnotes are not reopened as a major blocker
