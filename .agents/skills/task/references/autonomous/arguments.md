# Task autonomous mode arguments

Task autonomous mode accepts a natural-language skill request. It is not a shell command or a
flag parser. A leading mode selects the method; the rest names the scope and
outcome. Explicit leading modes win over words inside the scope.

| Form | Meaning |
| --- | --- |
| `task autonomous architecture <scope>` | Read-only architecture audit, strongest target, bounded challenge and adoption plan. |
| `task autonomous architecture <scope> execute` | The same decision work, then implementation after its proof checkpoint. |
| `task autonomous benchmark <scope>` | Benchmark's full applicable lane inventory and ordered causal method. |
| `task autonomous perf <scope>` | The same Benchmark route. |
| `task autonomous benchmark only <lane-or-target>` | Benchmark's explicitly narrowed run; preserve its exclusions and receipt contract. |
| `task autonomous issue-harvester <repo-or-ledger>` | Issue Harvester owns exhaustive issue coverage and resume. |
| `task autonomous <repo> issue inventory` | Editor Test Harvester owns the first inventory and invariant map. |
| `task autonomous regression <case-or-surface-or-corpus>` | Regression's case/oracle/proof method; it delegates exact repairs to Patch. |
| `task autonomous PR #123`, `task autonomous <issue-or-PR-URL>`, `task autonomous queue` | Maintainer interprets the requested public work and its authority. |
| `task autonomous security <scope>` | Maintainer's private-security method. |
| `task autonomous current tree`, `task autonomous post-merge <target>`, `task autonomous ready to commit` | Task closure. “Ready to commit” alone does not commit. |
| `task autonomous plite <objective>` or `task autonomous slate <objective>` | Scope quality work to raw editor substrate. |
| `task autonomous plate <objective>` | Scope quality work to product plugins, React, registry or docs. |
| `task autonomous registry <objective>` or `task autonomous docs <objective>` | Scope quality work to that surface. |
| `task autonomous <one local bug>` | Patch's exact reproduction and repair route. |
| `task autonomous <other bounded quality objective>` | Select checkpoints from current evidence through Task and the domain owners. |
| `task autonomous` during active autonomous work | Continue that task's established scope and authority. Without an established objective, resolve the missing scope first. |

## Modifiers and authority

- `<scope>` is free text: a path, package, feature, accepted plan, issue, corpus
  or stated outcome. Task autonomous mode infers Plate, Plite or shared ownership from source.
- `execute`, or clear build/fix/change wording, authorizes the named local
  implementation. Audit, review, explain and planning requests remain read-only
  for product code. Publication and messages keep their own authority.
- `loop timed <duration>` repeats in-scope checkpoints within a timebox, for
  example `30m` or `2h`. It composes with architecture `execute` and quality
  objectives. A deadline is an upper bound; a minimum requires explicit wording.
- `full`, `all` and a named lane widen only the stated scope. Goal selection
  follows the user's standing long-running-work request. These words create no
  model setting, release claim or scheduled continuation.
- A requested heartbeat or later continuation routes to the actual automation
  tool through Maintainer/Task. A timed run does not schedule one.
- Model choice stays in the runtime. There are no model, harshness, bestness,
  comparator, breakage or benchmark flags for architecture mode. Its method
  already challenges the strongest cut and obtains relevant evidence.

Examples:

```text
$task autonomous architecture comments execute loop timed 2h
$task autonomous architecture packages/platejs: compare the Plite boundary and prove scale
$task autonomous benchmark only huge-code-block
$task autonomous plite fix the remaining selection failures in this corpus
$task autonomous current tree: audit coherence without changing source
```

`architecture` in the second example stays the primary mode. Benchmark is an
evidence owner inside that architecture decision, not a competing controller.
Keep `plate-plan` and `plite-plan` available for deliberate layer planning;
Task autonomous mode carries their internal transitions without requiring repeated invocations.
