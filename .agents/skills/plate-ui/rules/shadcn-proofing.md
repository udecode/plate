# Shadcn Proofing

## Contents

- Preserve recognizable open code
- Prefer readable files over abstraction churn
- Review like an upstream diff

---

## Preserve recognizable open code

Keep the component source close to normal shadcn expectations:

- clear local composition
- obvious `asChild` / `data-slot` / `data-state`
- variants and classes near the JSX that uses them
- no abstraction maze for simple UI

---

## Prefer readable files over abstraction churn

A component file is allowed to be a little long if the alternative is hiding
everything behind package hooks and helper wrappers.

Long but readable open code beats "clean" indirection that nobody can diff
against upstream.

---

## Review like an upstream diff

Before extracting, ask:

- would a user still recognize this as open source component code?
- can they copy, tweak, and own it easily?
- did we move semantics, or just move clutter?

If the answer is "we mostly moved clutter," put it back.
