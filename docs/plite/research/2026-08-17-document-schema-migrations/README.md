# Versioned document migration architecture

Question:
Which open-source architecture best supports automatic Plate document migration
across skipped releases such as v53 to v55, while sharing one engine with an
offline CLI?

Scope:
- Versioned runtime rehydration and ordered migration chains.
- Document/content migration CLIs and dry-run behavior.
- Editor-specific serialized-node evolution.
- Source-version ownership, validation, idempotence, and skipped-version jumps.

Stop rule:
Stop when at least three distinct architecture families have Grade A local
source evidence, the strongest reusable invariant has one clear `best-api`
promotion, and additional candidates only repeat an existing family.

Expected promotion owner:
`best-api`, then the active v53-to-v54 `plate-plan`.

Current local evidence gap:
Plate has a pre-fit callback and explicit CLI scaffolding, but no durable
version-chain contract proving v53-to-v55 behavior.

Exclusions:
- Database DDL systems whose only useful property is transactionality.
- README-only claims without inspected source.
- Per-node compatibility branches that permanently pollute current editor
  runtime unless they expose a unique correctness invariant.

Current verdict:
Dexie has the strongest core architecture: migrations are declared per target
version, sorted independently of declaration order, and every required step
runs oldest-to-newest inside one upgrade boundary. Redux Persist independently
supports the same pure target-version selection rule, but its implementation is
weakly typed and does not fail on missing steps. Zustand contributes the
versioned persisted envelope and automatic writeback. Sanity has the strongest
offline runner: one migration definition powers dry-run and mutation execution
with streaming, batching, concurrency, progress, and uncertain-outcome
reporting.

No editor project wins. Lexical explicitly documents why flat per-node versions
do not compose; ProseMirror/Tiptap provide current-schema parsing or local
feature utilities, not a document version chain.

Promoted recommendation:
- Keep source identity in the app-owned persisted document envelope.
- Define migrations as exact target-version steps.
- Run every step `source < version <= current` in ascending order.
- Fail on missing steps, wrong lineage, future/downgrade input, invalid output,
  or fingerprint mismatch.
- Keep `migrateDocument` as the pure runner verb, not a one-off editor option.
- Let runtime loading and CLI dry-run/write call the same runner.
