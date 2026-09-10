# Redesign from First Principles doctrine repair

Status: complete

Objective:

Make Redesign from First Principles the governing principle for `next` beta
API and architecture decisions. Repair the shared method routing and Plate
sources, regenerate the current project's skills, and verify the result.

Flow: one-shot local workflow maintenance. The user explicitly requested this
repair on 2026-09-10. The preceding authored-changes research remains an
assessment; this work does not select or implement its product architecture.

Boundaries:

Dotai owns the reusable principle and method selection. Plate owns its beta
policy, Best API decision method, layer-plan adoption and versioned doctrine.
Edit those sources and install only the named changed shared skills in this
checkout for `codex` and `claude-code`, the configured Skiller agents.

No product changes, other-project installs, publication, worktrees, independent
review or full repository Vision synchronization.

Constraints:

Preserve full upstream methods and provenance, hard correctness, security,
serialized-data, native-behavior and runtime laws, explicit user constraints,
immutable version history and package attestations.

Completion threshold:

Every requirement below has source or command evidence. Shared validation,
named installed-file parity, Plate generation, doctrine validation and the
plan checker pass. The source review confirms the principle applies before
target selection without forcing a rewrite or restarting an accepted plan.

Verification surface:

Use Dotai skill and pstack preservation validators, named installed-file
comparison for both configured agents, Plate's existing generation and doctrine
validator, a source-backed real-API trial and the existing plan checker. These
prove workflow sources and installed routing, not product runtime behavior.

Work Checklist:

- [x] Trace the existing principle, source ownership and configured install
  destinations before edits. Sources: Maintain Workflow, Sync Skills,
  `.agents/skiller.toml`, Dotai pstack provenance.
- [x] Make the user's named principle central to `next` beta in
  `.agents/AGENTS.md`, root Vision and the smallest common Vision owner.
- [x] Apply the full principle at design intake in shared Best API Review,
  Architect and Poteto routing; keep the upstream leaf and full recipes.
- [x] Connect Best API, Plate/Plite Plan, Plate Next and the common Task/review
  route to that decision. Keep current and proposed owners deletable; reuse
  only when the current job and hard laws justify it.
- [x] Keep target quality separate from migration order. Preserve scoped
  authority, direct implementation of valid accepted plans and actual proof
  requirements. Sources: Plate workflow and Maintain Workflow.
- [x] Append one Plate Next doctrine version and preserve every existing
  history entry and package attestation. Source: Plate Next version law.
- [x] Validate Dotai, install the named local sources, run `pnpm install`, and
  verify generated sources, dependencies and both agent destinations.
- [x] Apply Agent Native Reviewer to intent, route, source, discovery, proof
  and handoff. Apply Technical Writing preservation and meaning checks.
- [x] Reconcile this checklist, record exact evidence and run the existing
  completion checker. Source: Autogoal checklist retention.
- [x] Suggest named downstream syncs without applying them. Source: Maintain
  Workflow and the user's global workflow instruction.

## Classification

This is a scoped Vision repair from one explicit human correction, not a
committed-range sync. No baseline advances; `docs/sync/vision/status.json`
remains outside the write scope.

| Input | Classification | Owner |
| --- | --- | --- |
| First-principles redesign governs next beta | captured | Root Vision and Common Vision |
| Apply the method before preserving an API or architecture | owner-routed | Dotai methods, Plate Best API and Task routing |
| Hard laws, material value and adoption proof remain binding | reaffirmed | Existing Vision and workflow owners |
| Authored-changes candidate representation and API | run-specific | Existing research assessment; no architecture selected here |

Verification evidence:

- Plate branch `next`; Dotai branch `codex/ellie-skill-redesign`, read before
  mutation. Continue both existing checkouts.
- The full principle already exists in Dotai and both installed agent paths.
  Architect mentions it mainly at the scrap phase; Best API Review describes
  the counterfactual without directly loading the leaf.
- Preserve one shared principle. Project rules supply its beta application,
  rather than copying the full recipe into every skill.
- Corrected the unconditional "Plite wins" rule in root Vision and
  `docs/vision/plate.md`: substrate ownership survives; an inadequate current
  primitive can require replacement. Plate product policy still stays in Plate.

| Verification | Result |
| --- | --- |
| Dotai `scripts/validate-skills` | `skills ok` |
| Dotai `python3 scripts/check-pstack-preservation.py` | 40 skills, 99 upstream files, zero errors; exact adaptation diffs replay |
| `npx skills add /Users/zbeyens/git/dotai --skill best-api-review architect poteto-mode --agent codex claude-code -y` | Three named local installs; exactly those three lock entries changed |
| Plate `pnpm install` | Skiller applied both agents; required skill resources synchronized |
| Source/install inventory and byte comparison | Four shared skills including the unchanged principle, two agents, 90 file comparisons, zero mismatches |
| `node .agents/rules/plate-next/scripts/version.mjs validate --json` | Version 182 valid; two active and 44 retired package records unchanged |
| Generated routing/source audit | Ten local skill entrypoints resolve the changed workflow or principle; root AGENTS contains its current source body |
| Prose scanner on Common Vision | No finding in the changed passage; three existing title-case headings retained as established document style |
| Existing plan checker | Complete after source and evidence reconciliation |

The initial consumer search included a nonexistent `apps/www/content` path and
returned exit 2. The corrected search used the observed `packages/platejs/src`
and `apps/www/src` roots and completed with exit 0. No result depends on the
invalid path.

The plan checker initially rejected Markdown headings for its required fields.
Those fields use the existing template's `Label:` syntax in the final plan.

### Agent Native Reviewer

Source-backed review in the main agent; no independent reviewer or model eval.

| Intent | Route and evidence | Result |
| --- | --- | --- |
| Review an API or architecture proposal | Best API Review loads the full leaf before its design lanes; Plate review routing applies Best API and both relevant layer methods | Pass |
| Design or adopt a changed contract | Best API starts with the named principle; Plate/Plite Plan consume the comparison and reopen material contradictions | Pass |
| Audit, clean or migrate architecture | Plate Review, Architecture Cleanup, Editor Audit and Plate Next load Task's common workflow; Plate Next explicitly allows substrate replacement | Pass |
| Implement through feature owners | Plate Plugin Creator and Plate UI load the same workflow; runtime and product proof remain with their current owners | Pass |
| Make an ordinary small edit or execute a valid accepted plan | Shared adapter and project doctrine permit direct work and reuse; no fresh redesign chain required | Pass |
| Maintain the guidance later | Dotai source plus exact provenance and named install; Plate source rules plus Skiller and version validator | Pass |

### Real API trial

Trial prompt: assess `getEditorDOMFromHtmlString` and its actual consumer using
the revised decision method. No desired verdict or replacement was supplied.
This was a bounded source review, not product implementation or runtime proof.

The current job is importing HTML. Source:
`packages/platejs/src/static/deserialize/htmlStringToEditorDOM.ts` selects the
first `[data-plite-editor="true"]` element and casts its nullable result to
`HTMLElement`. Its spec records both first-editor selection and a null result.
`apps/www/src/registry/components/editor/import-toolbar-button.tsx` is the one
production caller found in the selected source roots; it then calls
`HtmlPlugin.api.deserialize`. The latter already accepts an HTML string at
`packages/platejs/src/lib/plugins/html/HtmlPlugin.ts:2950`.

The comparison considered keeping the helper, repairing its nullable return,
inlining extraction in the caller, moving import interpretation into the
existing HTML owner, adding a standalone importer, and replacing substrate
parsing. The strongest supported direction is to investigate removing the
public extraction helper and consolidating import interpretation with the HTML
owner. A nullable type repair alone leaves the caller's two-stage protocol.
Another public importer or substrate replacement has no demonstrated need in
this bounded case. Existing decoding earns consideration because it already
owns string input and schema validation, not merely because it exists.

Verdict: Pursue that bounded ownership question. Before choosing the exact
contract, compare exported documents, arbitrary HTML without an editor marker,
and multiple embedded editor roots; preserve schema and unsafe-HTML handling.
Direct string input is an existing API, but equivalent first-editor behavior
was not executed or claimed. No product source or new tests were written.

### Propagation

The configured candidate checkouts `better-convex`, `plate` and `informed-fe-v3`
exist. None currently has the three changed shared skills or same-name local
source rules. Suggest a named install of Dotai's `best-api-review`, `architect`
and `poteto-mode` with their referenced principle dependencies after checking
each project's policy. Keep the Plate beta rule specific to Plate; do not copy
it into other products. No candidate checkout or global install was changed.

Publication, app/browser proof, new runtime tests, Autoreview on `next`, a full
Vision baseline sync and package re-attestation are outside this scoped repair.

Open risks:

None for the local workflow repair. This source review does not establish how
a separate future model will execute the guidance or prove product behavior.

Blocked condition:

The risk is teaching automatic rewrites or shielding existing substrate behind
reuse. Verification checks both failure modes. Stop dependent work only for
an unresolved source/install failure or missing actual authority; continue
independent checks. Other project installation requires separate scope.

## Next action

Use the repaired design and review routes. Other-project installation remains
a separate named sync; no user decision blocks this completed local repair.

## Linked plans

None.
