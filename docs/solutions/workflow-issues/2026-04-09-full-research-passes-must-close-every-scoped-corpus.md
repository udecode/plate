---
module: Research Workflow
date: 2026-04-09
problem_type: workflow_issue
component: documentation
symptoms:
  - "A 'full' research pass patched law after finding one strong corpus while leaving another scoped corpus only half-checked"
  - "Obsidian-level evidence gaps were described from spot checks instead of an explicit corpus ledger"
  - "The compiled layer improved, but the workflow still allowed silent corpora in a so-called full pass"
  - "Broad grep over local raw was treated like inspected evidence, so direct hits sat unread while the pass still called the corpus unresolved"
root_cause: missing_workflow_step
resolution_type: documentation_update
severity: high
tags:
  - research
  - workflow
  - corpus
  - authority
  - docs
  - skills
---

# Full research passes must close every scoped corpus

## Problem

Our research workflow said “full corpus-level ingest,” but it still let a pass
end after one or two useful sources without explicitly closing the rest of the
scoped corpora.

That is how an authority-sensitive pass can look rigorous while still leaving a
silent hole in one editor corpus.

## What Didn't Work

- Treating “I found one strong source” as enough for a `full` pass
- Marking another corpus `partial` from a spot check instead of from an
  explicit corpus-level outcome
- Letting the workflow describe full ingest without forcing a per-corpus close
  state
- Treating broad grep as if it were the same thing as reading the underlying
  raw files

## Solution

Make `full` mode require a **per-corpus evidence ledger**.

For every scoped corpus, the pass must record:

- compiled pages inspected
- raw paths inspected
- direct raw files actually read
- official source entrypoints checked
- strongest evidence found
- one explicit disposition:
  - `evidenced`
  - `raw gap`
  - `compile gap`
  - `evidence gap`
  - `contradiction gap`
- next action if unresolved

A full pass is not complete until every scoped corpus has one of those
outcomes.

Before calling something `raw gap`, the pass must also do an official-source
discovery step so “missing locally” does not get mistaken for “does not exist”.

Before calling something `evidence gap`, the pass must also read the strongest
local raw hits that the search already surfaced. If the likely answer is
already in local raw, the pass has not earned an unresolved label yet.

## Why This Works

It kills the easiest lie in research work: “full” that really means “I checked
the first corpus thoroughly and glanced at the rest.”

Once every corpus needs an explicit disposition, silence becomes visible:

- missing raw becomes `raw gap`
- missing compiled summaries become `compile gap`
- ambiguous proof becomes `evidence gap`
- conflicting proof becomes `contradiction gap`

And once the ledger separates "searched" from "read", broad grep cannot pretend
to be evidence anymore.

That keeps law changes from outrunning the evidence.

## Prevention

- For authority-sensitive surfaces, never end `full` mode with silent corpora
- Require the ledger before patching downstream law
- Require official-source discovery before any `raw gap` conclusion
- Require direct reads of the strongest local raw hits before any `evidence
gap` conclusion
- If raw exists but the compiled page is missing, create the source summary
  instead of hand-waving the gap
- If a corpus still only proves syntax/settings rather than trigger mechanics,
  say that explicitly instead of flattening it into “partial yes”

## Verification

These checks passed:

```bash
bun install
pnpm lint:fix
```

## Related Issues

- [research-wiki.mdc](.agents/rules/research-wiki.mdc)
- [full-pipeline.md](docs/research/commands/full-pipeline.md)
- [editor-spec.mdc](.agents/rules/editor-spec.mdc)
