---
description: 'Plate Next cleanup supervisor: deeply review and migrate Plate surfaces to be Plite-perfect, hard-cut old Slate/Plate compatibility sludge, route plans vs implementation, and run auto-style timed/full loops.'
argument-hint: '[sync [package]|specific API|path|package|current tree|hours|full-loop|batch-loop]'
name: plate-next
metadata:
  skiller:
    source: .agents/rules/plate-next.mdc
---

# Plate Next

Handle $ARGUMENTS.

## Doctrine Version

Current doctrine version: `124`.

The machine-readable source is
`.agents/rules/plate-next/versions.json`. It owns immutable doctrine history and
the applied version, source fingerprint, verification date, and evidence plan
for every completed Plate Next package review. Active `packages` must exactly
match `reviewedPackageSlugs` in `tooling/scripts/check-core.mjs`. Deleted
packages stay under `retiredPackages` with retirement date/evidence, remain
visible in history, and are excluded from sync.

Use the read-only helper:

```bash
node .agents/rules/plate-next/scripts/version.mjs validate
node .agents/rules/plate-next/scripts/version.mjs status [all|<package>]
node .agents/rules/plate-next/scripts/version.mjs pending [all|<package>]
node .agents/rules/plate-next/scripts/version.mjs fingerprint <package>
node .agents/rules/plate-next/scripts/version.mjs check [all|<package>]
node .agents/rules/plate-next/scripts/version.mjs doctrine-fingerprint
```

Version law:

- Use monotonic integers. Do not use semver or infer fake historical versions.
- Every change to a reusable Plate Next pattern, review rule, topology law,
  completion gate, or package-facing proof requirement increments
  `latestVersion` by one and appends one immutable `versions` entry with
  concrete `migrationChecks`.
- The latest version entry stores a doctrine fingerprint over the Plate feature
  coordinator, Best API, Plate Next, Plate Plugin Creator, Docs Creator, and
  Plate UI source rules and required adjuncts; the shared resource sync owner;
  the Plate Next and feature templates/packs; and the feature checker/tests.
  `validate` fails when any source changes without a version bump. Treat any
  edit to those doctrine surfaces as a bump; generated mirror regeneration is
  not a bump.
- `validate` also requires exact generated main-skill parity for Plate Feature,
  Plate Next, Plate Plugin Creator, Best API, Docs Creator, and Plate UI, plus
  exact parity for every resource owned by the shared sync script.
- Never edit or reorder an older version entry. Correct a bad reusable rule by
  adding the next version. The current doctrine fingerprint hashes canonical
  version history, excluding only the latest entry's self-referential
  `doctrineFingerprint`, so older history and current migration law are
  tamper-evident. Validation also compares the current fingerprint with the
  immutable Git baseline: dirty doctrine runs use `HEAD`; clean runs use the
  previous commit that changed `versions.json`; and CI may set
  `PLATE_NEXT_BASE`. Current history must preserve that baseline's complete
  version array as an exact prefix. Fingerprinted inputs may change at the same
  version only when the base already records that fingerprint.
- A doctrine bump never mass-updates package entries. Packages remain at their
  last proven version until `sync` closes them.
- Keep the visible `Current doctrine version` here equal to `latestVersion`,
  then run `pnpm install` to regenerate the skill mirror.

Use this when the user wants Codex to do the review they keep doing manually:
open a migrated Plate file/API, ask why every compatibility helper exists, and
cut or move it until Plate is a clean product layer on top of Plite.

This is a wrapper skill, not a new execution engine. It uses `autogoal` for
state, `best-api` for public call-shape forks, `plate-plan` for adoption and
boundary plans, `architecture-cleanup` for source shape/deslop, and `auto` for
implementation/proof loops. Its distinct job is the Plate Next review lens:
make Plate Plite-perfect and stop old Slate/Plate compatibility from becoming
the final API.

## Use When

- The user invokes `plate-next`.
- The user asks "why is this file/helper here?" during Plate migration.
- The user wants a file-by-file or API-by-API Plate v2 cleanup pass.
- The user wants careful package-by-package migration review before broad Plate
  package migration.
- The target is Plate foundation, Plate runtime, plugin API, package migration, docs/API
  mismatch, or old Slate compatibility in Plate.
- The user gives no target and expects autopilot to find the next Plate cleanup
  risk.
- The user gives a duration such as `1h`, `8h`, or `overnight`.
- The user invokes `plate-next sync` to bring tracked packages to the current
  doctrine.

## Do Not Use When

- The target is pure Plite substrate design: use `plite-plan`.
- The target is public GitHub issue/PR/security queue: use `maintainer`.
- The target is already-applied current-tree closure before commit: use
  `autoclosure`.
- The task is one ordinary local patch with no Plate/Plite boundary question:
  use `task`.

## Invocation

Same user-facing shape as `auto`:

- `plate-next`
- `plate-next editor.api`
- `plate-next packages/platejs/src/lib/utils/isType.ts`
- `plate-next packages/platejs/src/features/table`
- `plate-next packages/platejs/src/features/basic-nodes`
- `plate-next sync`
- `plate-next sync table`
- `plate-next current tree`
- `plate-next 2h`
- `plate-next all plate packages full-loop`

No argument means autopilot: scan the highest-risk Plate Next surfaces and pick
the next cleanup packet without asking.

## Sync Mode

`plate-next sync` is an execution mode, not a status summary. With no package
argument it continues until every active tracked package is current.
`sync <package>` does the same for one active tracked package. Retired packages
are reported but never queued.

1. Run `version.mjs validate`, then `status`. Freeze the queue from the
   machine-readable result: oldest `appliedVersion` first, then package slug.
2. Create one Plate Next autogoal plan with a row for every queued package.
   Record starting version, latest version, fingerprint state, missing doctrine
   versions, required checks, proof, final fingerprint, and ledger update.
3. Process one package at a time. Do not attest or start the next package while
   the active package has unchecked/deferred file rows.
4. A v0 package has no trustworthy current-doctrine attestation: rerun the full
   package review against the latest skill. For a later version with unchanged
   source, run every `migrationChecks` row after its applied version plus the
   normal focused proof. Any source-fingerprint mismatch forces a full current
   package review.
5. After package proof and package-local P1 autoreview close, run
   `fingerprint <package>`. Patch that package entry with the latest version,
   exact digest, local verification date, and evidence plan. Never pre-attest a
   package or copy another package's digest.
6. Rerun `status` after every attestation. If the package is not `current`, keep
   it active and repair the cause.
7. If sync exposes a missing reusable rule and the rule is repaired, bump the
   doctrine version before continuing, append its migration checks, and
   recompute the entire queue. Packages attested earlier in the same run are
   stale again; that is correct.
8. Run the final goal-plan checker only after registry status is current.
   All-package sync closes only when `version.mjs check all` exits zero. A
   blocked/deferred package keeps its old version and blocks the all-current
   claim.

The helper is deliberately read-only. The version registry is reviewed source,
not mutable hidden state. Package fingerprints include package code, tests,
type-tests, fixtures, examples, manifests, and config. They exclude generated
output, dependency/cache directories, logs, `.npmignore`, changelogs, and
readmes so releases and prose-only edits do not trigger fake code drift.

## Review Law → [review-law.md](./rules/review-law.md)

Read this reference for the Plate v2 review lens, target shape, and package/file review invariants.

## Ownership And Correction → [ownership-and-correction.md](./rules/ownership-and-correction.md)

Read this reference when a gap, corrective sweep, extracted-file recovery, or Plate foundation boundary is active.

## Audit Modes → [audit-modes.md](./rules/audit-modes.md)

Read this reference for the review matrix, bridge scoring, full Plate foundation sweep, and package review mode.

## Loop

Use the dedicated Plate Next plan template unless a public API design fork
requires `best-api` first:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template plate-next \
  --title "plate-next <surface>"
```

Checkpoint zero must copy the user's exact target, duration, non-goals, stop
rules, and final-handoff expectations into the plan.

Then loop:

1. Read `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`, and the
   target source/tests/docs.
2. Build the right source map:
   - named file/API: public API, internal bridge, caller graph, tests,
     docs/examples, package exports, and related correction-sweep pattern;
   - one package: package file manifest plus one plan checkbox per package
     file, with score `100` as the only checked state;
   - broad Plate foundation sweep: full Plate foundation manifest plus drift ledger for every file.
3. Build the extracted-file inventory for the target scope and give every
   untracked/extracted file a bucket before scoring confidence.
4. Fill the review matrix for every relevant helper/API in the target. For
   broad Plate foundation sweep, every Plate foundation file gets a drift score before any closure
   claim.
5. In review mode, prefer `main-parity-cleanup` when the concept and owner remain
   durable. When `origin/main` shows a one-use migration split, prefer
   `merge-existing-owner` or `hard-cut` instead of restoring the old file graph.
6. If the next choice is a public API fork, route to `best-api`. Use
   `plate-plan` afterward only when adoption/runtime/proof needs a plan, and
   stop implementation until the target and required plan are accepted.
7. If the smell is source shape, route to `architecture-cleanup`.
8. If the decision is safe, implement the smallest cleanup packet.
9. After every correction, run the related scoped sweep required by Correction
   Sweep Law inside the active scope and patch/defer all scoped same-class
   matches. In package review mode, broader matches become deferred rows, not
   edits.
10. Run focused proof: package typecheck/test/build when needed, plus `pnpm brl`
    if exports/barrels changed.

- For Plate foundation-only targets, prefer `pnpm check:core` and Plate foundation-focused tests.
  Non-Plate foundation package failures are not blockers unless that package is named,
  touched, or the failure proves the Plate foundation API broke it.

11. Run source audits for removed legacy names. In package review mode, audit
    broadly only to discover risk; patch only the named package and required
    owner.
12. For full Plate foundation sweep, close the autogoal template's drift-ledger score gate.
13. For package review mode, close the package file checklist or defer
    unchecked rows for user review before considering the next package.
14. For a completed package review, update the version registry from the final
    package fingerprint and prove that package reports `current`.
15. Keep/revert/quarantine the packet in the plan.
16. Pick the next packet. In timed mode, keep going until the minimum runtime
    elapsed, then finish or quarantine the active packet.

## Autopilot Priority

When no target is provided, inspect in this order:

1. Plate foundation public API/runtime files touched by the Plate migration.
2. `packages/platejs/src/react/editor/createPlateRuntimeEditor.ts`.
3. Plate foundation plugin API types and plugin resolver/installers.
4. Old Slate compatibility surfaces in Plate foundation/package exports.
5. First-party Plate plugins, features, components, specs, type tests, or
   fixtures importing `plitejs` instead of the relative facade or matching
   Plate entrypoint owner, including imports hidden by test-glob exemptions.
6. Docs/examples teaching old APIs.
7. Tests with fake compatibility assertions instead of current behavior.

## Proof

For Plate foundation/Plite boundary cleanup, prefer:

```bash
pnpm check:core
pnpm turbo typecheck --filter=./packages/platejs
pnpm --filter platejs test
pnpm --filter platejs build
```

For package review mode, prefer:

```bash
pnpm turbo typecheck --filter=./packages/platejs
pnpm --filter platejs test
pnpm --filter platejs build
```

Use package-local focused tests when available. Run broader gates only when the
package exports, public type surface, or Plate foundation/Plite owner changes make the
package proof insufficient.

Do not start `apps/www` or hit `www` routes from Plate Next package review.
`www` proof is a separate docs/app lane unless the current target is explicitly
docs, registry UI, examples, or the user asks for that proof.

For every completed package review, `pnpm check:core` is required after the
package is added to `reviewedPackageSlugs` in
`tooling/scripts/check-core.mjs`. Do not close a package review while leaving
the shared gate blind to it.

Use focused tests first. Run broader gates only before closing a risky packet.
If a broader command reports errors in packages outside the named/touched
scope, do not fix them in Plate Next by default. Classify them as out-of-scope
package drift unless the failure is caused by the current Plate foundation/API change.
For broad Plate foundation sweeps, the Plate Next autogoal template owns the drift ledger,
manifest count, score gate, and top-drift handoff. Keep this template-only.

If a source audit is the proof, make it exact and small:

```bash
rg -n 'oldName|old\\.api|legacyHelper' packages/platejs/src --glob '!**/dist/**'
```

## Final Handoff

Report:

- target surface and mode;
- files/APIs reviewed;
- package file checklist summary when package review mode applies: total rows,
  score-100 rows, unchecked rows, deferred rows, and next package block;
- doctrine version summary when package review or sync mode applies: starting
  version, final applied version, source-fingerprint state, registry evidence,
  and remaining stale/drifted package count;
- verdict matrix: main-parity-cleanup, move-to-plite, keep-in-plate, hard-cut,
  Plite gap, Plate gap, private-bridge, defer-with-owner;
- changes made;
- related scoped sweep query, active scope, match count, patched count,
  deferred count;
- out-of-scope matches discovered during package review;
- tests/proof commands;
- old compatibility names audited;
- Plite/Plate gaps or blockers;
- anything that still needs the user's taste review;
- next best Plate Next packet.
