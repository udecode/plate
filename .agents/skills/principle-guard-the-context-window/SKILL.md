---
name: principle-guard-the-context-window
description: "Reduce large or repeated context loads while preserving the current task, latest corrections and evidence."
---

# Guard the Context Window

The active context is finite. Keep the current objective, latest user corrections, open acceptance and evidence reachable across compaction; load only what the next decision needs.

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress. A compact checkpoint lets later context recover the current task without restarting intake.

**Pattern:**
- **Isolate large payloads.** Use bounded searches and artifacts for verbose output. Delegate independent source questions when permitted and useful, then inspect the evidence behind the returned summary.
- **Don't read what you won't use.** Read selectively based on relevance. If a file isn't needed for the current task, skip it.
- **Keep frequently used content inline.** Templates and references used on every invocation belong in the skill file, not in separate files that cost a read each time.
- **Size coherent units.** Bound output and working batches without shrinking the accepted outcome or inventing a turn budget. Compaction is neither a pause nor a new task.
