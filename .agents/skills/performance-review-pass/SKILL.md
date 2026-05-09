---
description: Conditional pass for performance-sensitive code using Vercel React best practices and performance-oracle without turning every task into a benchmark project.
argument-hint: '[scope/files]'
disable-model-invocation: true
name: performance-review-pass
metadata:
  skiller:
    source: .agents/rules/performance-review-pass.mdc
---

# Performance Review Pass

Handle $ARGUMENTS.

Use this as a targeted performance review pass. For React/Next/rendering work,
read [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/SKILL.md).
For algorithmic, memory, query, network, scalability, or hot-path concerns, read
[performance-oracle](.agents/skills/performance-oracle/SKILL.md).

## Use When

- The change touches hot paths, render loops, subscriptions, editor runtime,
  large collections, async waterfalls, bundle shape, or browser event paths.
- The user asks about performance or scalability.
- A plan has a React/runtime performance confidence dimension.
- A diff adds algorithms, caches, external stores, database/network access, or
  high-frequency state updates.

## Do Not Use When

- The task is pure docs or tests with no runtime behavior.
- The code path is cold and the active plan has no performance requirement.
- Performance proof would be speculative and no measurable risk exists.

## Completion-State Pass Fields

Before reviewing, update the completion state file:

```md
status: pending
current_pass: performance-review-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/performance-review-pass/SKILL.md
current_pass_scope: <files or hot path>
current_pass_trigger: performance-sensitive change
```

When done, keep top-level `status: pending` unless the whole lane is complete,
then set:

```md
current_pass_status: complete
next_pass: <revision, deslop, or verification pass>
```

Use `current_pass_status: revise` when the pass finds a real bottleneck,
subscription leak, unbounded memory path, waterfall, or algorithmic issue.

## Procedure

1. Classify the performance surface:
   - React/Next/rendering/subscriptions
   - algorithmic complexity
   - memory/lifetime
   - database or I/O
   - network/bundle
   - browser/editor hot path
2. Apply Vercel React rules when React/Next/rendering is in scope.
3. Apply `performance-oracle` when scalability, algorithmic complexity, memory,
   network, or query behavior is in scope.
4. Separate findings into:
   - blocking performance regressions
   - worthwhile optimizations
   - accepted tradeoffs
   - non-issues with evidence
5. Prefer measured evidence or concrete complexity/subscription reasoning over
   generic performance advice.
6. If issues are found, make the next pass a revision pass or focused
   implementation pass.

## Output

Record in the active plan or ledger:

- scope
- applicable skill lenses and why
- hot paths reviewed
- findings by severity
- rejected false positives
- benchmarks/proofs run or recommended
- plan or code deltas
- next pass
