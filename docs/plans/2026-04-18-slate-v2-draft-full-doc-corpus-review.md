---
date: 2026-04-18
topic: slate-v2-draft-full-doc-corpus-review
status: in_progress
---

# Goal

Read every file under `docs/slate-v2-draft/**` without skipping any file, then
give harsh, honest feedback on:

- whether the current migration framing is too timid or too rewrite-averse
- how to preserve maximum legacy parity without becoming implementation-blind
- how test coverage from both legacy and draft should actually drive the work

# Scope

- all files currently under `docs/slate-v2-draft/**`
- include non-markdown residue like `.DS_Store`
- no skipping archive, commands, ledgers, references, or verdict docs

# Working Rules

1. Legacy parity is the default goal.
2. Draft parity is not the default goal.
3. If a rewrite is required to preserve public behavior and test-backed
   contract width, then rewrite is required.
4. Coverage matters more than sentimental attachment to current source shape.
5. Implementation logic is evidence, not the goal. Contract-preserving proof is
   the goal.

# Phases

1. Inventory the corpus and line-count it.
2. Read every file and record the main claims.
3. Identify contradictions, stale assumptions, and overcorrections.
4. Produce blunt recommendations for the next migration rule set.

# Progress

- inventoried `docs/slate-v2-draft/**`
- found 52 files in scope
- next: line-count and read the full corpus in chunks
