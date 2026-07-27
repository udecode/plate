---
description: Fix one local Plite regression against Slate or editor behavior with reproduction, durable coverage, architecture pressure, current Plite proof, and autoreview.
argument-hint: '[repair <expectation> | <bug report, route, failing test, or regression cluster>]'
disable-model-invocation: true
name: plite-patch
metadata:
  skiller:
    source: .agents/rules/plite-patch.mdc
---

# Plite Patch

Handle $ARGUMENTS.

If the arguments start with `repair <expectation>`, run Repair Command.
Otherwise run the normal workflow.

This is the sole local repair owner for one Plite regression:

```txt
reproduce -> classify -> red proof -> fix durable owner
-> architecture pressure -> verify -> autoreview -> handoff
```

It owns local code and proof only. It does not read or mutate public issue/PR
state. Use `resolve-slate-issue` when a Slate issue is the public target, and
let that coordinator delegate the local repair here.

## Use When

- The user invokes `plite-patch`.
- One local Plite behavior is wrong relative to Slate or the intended editor
  contract.
- A failing test, browser route, or regression cluster needs a fix now.
- A previous local patch fixed the symptom at the wrong owner.
- The user invokes `plite-patch repair <expectation>` because future runs
  missed a recurring proof, workflow, or handoff standard.

## Do Not Use When

- The prompt identifies a public Slate issue or requests issue/PR mutations.
  Use `resolve-slate-issue`.
- The prompt asks for a public queue, batch, or repository heartbeat. Use
  `maintainer`.
- The prompt asks for broad or timed quality work. Use `auto`.
- The prompt asks only for an architecture plan. Use `plite-plan`.
- Reusable public call shape is unresolved. Use `best-api`, then `plite-plan`
  for adoption/runtime planning.
- The target is Plate product/plugin behavior rather than Plite substrate. Use
  the Plate owner.

## Authority

- Implementation: the current Plate checkout on `next`.
- Runtime owners: `packages/plite`, `packages/plite-dom`,
  `packages/plite-react`, `packages/plite-history`, `packages/yjs`, and
  `packages/browser`.
- Browser proof: `apps/plite`.
- Example source: Plite examples under `apps/www`; `apps/plite` imports them.
- Public mutation: none. Do not create, edit, comment on, close, or merge an
  issue or PR.
- Git mutation: do not commit or push unless the user explicitly asks.

Current checkout source beats memory, old plans, ledgers, and upstream
diagnosis. Upstream Slate is a behavior oracle when the intended contract is
disputed, never the implementation owner.

## Hard Rules

- Reproduce first whenever practical.
- Add a behavior-level regression test when sane. Cover the bug class, not only
  the screenshot that exposed it.
- Fix the durable Plite owner. Example patches are valid only when the example
  contract is wrong.
- Keep Plate product policy out of Plite substrate.
- Public API changes go through `best-api`; broader adoption/runtime changes go
  through `plite-plan`.
- If the first green patch is not the cleanest long-term shape, rework it before
  verification.
- Add a changeset when published packages change.
- Use Browser proof for visible behavior.
- End non-trivial implementation work with `autoreview`.

## Repair Command

Trigger on:

```txt
repair <expectation>
```

Repair the workflow, not runtime code:

1. State the missed recurring expectation.
2. Patch `.agents/rules/plite-patch.mdc`.
3. Put large reusable coverage law in a focused reference doc. Selection and
   navigation coverage belongs in
   `docs/plite/selection-navigation-coverage.md`.
4. Run `pnpm install`.
5. Prove source and generated mirrors contain the rule:

```bash
rg '<expected text>' .agents/rules/plite-patch.mdc
rg '<expected text>' .agents/skills/plite-patch/SKILL.md
```

6. Run agent-native review when routing, authority, proof, or handoff changed.

Do not hand-edit `.agents/skills/**/SKILL.md`.

## Goal Setup

Use `autogoal` for non-trivial work.

```txt
Fix Plite regression <bug or cluster>; done when reproduction, durable behavior
coverage, focused Plite proof, and autoreview pass in the current Plate checkout.
```

Add Browser or package proof packs only when the claim needs them. Add the
agent-native pack in repair mode.

## Workflow

### 1. Reproduce And Bound

Read the latest report, attached media, route, and failing test. Inspect the
live owner, then reproduce through the narrowest honest path:

- package test for pure model behavior;
- real keyboard, mouse, clipboard, focus, or composition input for browser
  behavior;
- both when model and DOM behavior can disagree.

Record actual behavior, expected behavior, owning package/route, model state,
and DOM/native state when relevant.

### 2. Classify

Name the class before patching:

- selection/navigation;
- focus/browser event ownership;
- history/undo;
- DOM coverage/hidden content;
- multi-root/content root/void root;
- rendering/projection;
- normalization/schema;
- clipboard/paste;
- IME/mobile;
- collaboration/replay;
- performance/scalability.

Search adjacent owners and tests when the same assumption can fail elsewhere.

### 3. Add Red Proof

Use:

- package tests for operations, transforms, history, normalization, codecs,
  schema, and deterministic model state;
- focused `apps/plite` Playwright rows for browser-visible behavior;
- both when the browser symptom starts in a model transform.

Assert the user-visible invariant and the model invariant when both matter.
For selection/navigation, choose and name the relevant rows from
`docs/plite/selection-navigation-coverage.md`: command, direction, topology,
starting state, model result, and DOM/native result.

Do not claim raw-device IME/mobile proof from viewport emulation.

### 4. Fix The Durable Owner

Prefer this ownership order:

1. Plite model/runtime;
2. shared DOM/React bridge;
3. schema/API contract;
4. shared example/component pattern;
5. one example, only when it owns the contract.

Prefer deterministic model operations, stable identity, bounded hot paths,
schema-owned behavior, and deletion of workarounds after the real fix.

Reject caller-specific branches, example masking, compatibility aliases for
unreleased APIs, timing waits, broad scans, and tests of implementation trivia.

### 5. Apply Architecture Pressure

After the first green patch, decide:

- `keep`: the owner and shape are durable;
- `rework`: simplify or move the fix before final proof;
- `escalate`: public call shape needs `best-api`, or broader runtime/adoption
  needs `plite-plan`.

Check ownership, API/DX, unopinionated substrate, performance bounds,
determinism, browser/model agreement, class-level coverage, and deletable
machinery. Breaking cost does not justify preserving a bad unreleased shape.

### 6. Verify

Run focused proof first:

```bash
# Package examples; choose only affected owners
pnpm --filter @platejs/plite test
pnpm --filter @platejs/plite-dom test
pnpm --filter @platejs/plite-react test
pnpm --filter @platejs/plite-react typecheck

# Focused browser row
pnpm --filter plite test:plite-browser:chromium <file-or--grep>

# Normal affected development gate
pnpm check:plite:dev

# Strict handoff or release-quality breadth
pnpm check:plite
pnpm check:plite:browser-matrix
```

Run Browser proof for changed visible behavior. `apps/plite` must continue to
import examples from `apps/www`; never create a second example source tree.

Use the strict gate or browser matrix only when the claim width requires it.
Record exact unrelated failures without hiding relevant failures.

### 7. Autoreview

For non-trivial diffs:

1. Load `.agents/skills/autoreview/SKILL.md`.
2. Review the actual current-checkout diff with a strict file boundary.
3. Reject stale, out-of-scope, or non-matching findings.
4. Fix valid findings.
5. Rerun focused proof and autoreview until no accepted actionable findings
   remain.

## Coordinator Handoff

When invoked by `resolve-slate-issue`, return a compact evidence packet:

- classification and root cause;
- durable owner and changed files;
- red proof and passing commands;
- Browser/device proof or explicit limitation;
- architecture-pressure verdict;
- changeset status;
- autoreview result;
- unresolved caveat.

Do not perform the coordinator's root check, PR, issue comment, release
readback, or closure work.

## Final Response

Keep it short:

- root cause and durable owner;
- architecture-pressure verdict;
- tests and Browser proof;
- changeset and autoreview status;
- unresolved gate or next owner.
