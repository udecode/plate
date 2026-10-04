---
description: Keep the live Plate packages attested against Plate Next doctrine through package review with the Plate v2 review law, and doctrine sync.
argument-hint: '[sync [package] | <package, file or API path>]'
name: plate-next
metadata:
  skiller:
    source: .agents/rules/plate-next.mdc
---

# Plate Next

Handle $ARGUMENTS.

The migration is nearly done: most packages are retired and the live ones are listed in `versions.json`. This skill keeps those packages reviewed against the Plate v2 target shape: a clean Plate product layer on top of Plite, with no old Slate or Plate compatibility left in the final API. Apply `pstack:principle-redesign-from-first-principles`: Plite owns the substrate, and its current implementation can still need replacement. Public call-shape forks go to `best-api`, adoption plans to the Plan playbook, source-shape cleanup to the Refactoring playbook, current-tree closure to the Babysit playbook, and ordinary changes to the playbook poteto-mode picks.

## Doctrine Version

Current doctrine version: `258`.

`.agents/rules/plate-next/versions.json` owns the immutable doctrine history and, for each live package, its applied version, source fingerprint, verification date and evidence plan. Active `packages` match `reviewedPackageSlugs` in `tooling/scripts/check-core.mjs`; deleted packages stay in `retiredPackages` with their retirement date and evidence.

```bash
node .agents/rules/plate-next/scripts/version.mjs validate
node .agents/rules/plate-next/scripts/version.mjs status [all|<package>]
node .agents/rules/plate-next/scripts/version.mjs pending [all|<package>]
node .agents/rules/plate-next/scripts/version.mjs fingerprint <package>
node .agents/rules/plate-next/scripts/version.mjs check [all|<package>]
node .agents/rules/plate-next/scripts/version.mjs doctrine-fingerprint
```

Version law:

- Versions are monotonic integers. Bump deliberately, by one, when a reusable review rule, completion gate or package-facing proof requirement changes in a way that should send packages back to review, and append one immutable entry with concrete `migrationChecks`. Editing a skill file needs no bump; git versions the skills.
- The doctrine fingerprint covers only the version history, excluding the latest entry's own `doctrineFingerprint`, so history stays tamper-evident. Validation compares it with the Git baseline (`HEAD` when the registry is dirty, otherwise the previous commit that changed `versions.json`, or `PLATE_NEXT_BASE`), and current history must keep that baseline's versions as an exact prefix.
- `validate` also requires exact generated parity for the required skills and every resource the shared sync script owns.
- Never edit or reorder an older entry; correct a bad rule with the next version. A bump never mass-updates packages: each stays at its last proven version until `sync` closes it.
- Keep the visible `Current doctrine version` equal to `latestVersion`, then run `pnpm install`.

## Sync

`sync` is an execution mode, not a status summary. With no argument it runs until every live package is current; `sync <package>` does the same for one. Retired packages are reported, never queued.

1. Run `validate`, then `status`, and freeze the queue: oldest `appliedVersion` first, then slug. Keep one plan under `docs/plans/` with a row per queued package: starting and latest version, fingerprint state, missing versions, required checks, proof, final fingerprint and registry update.
2. Process one package at a time; never attest or start the next while the active one has unchecked or deferred rows.
3. A v0 package, or any source-fingerprint mismatch, needs a full [package review](./rules/audit-modes.md#package-review-mode) against the current law. Unchanged source runs every `migrationChecks` row after its applied version plus focused proof.
4. After the review, proof and the Review rule close, run `fingerprint <package>` and patch its entry with the latest version, exact digest, verification date and evidence plan. Never pre-attest or copy another package's digest.
5. Rerun `status` after every attestation and keep a package that is not `current` active until its cause is repaired.
6. A missing reusable rule found mid-sync is repaired, then versioned, then the whole queue is recomputed; packages attested earlier in the run become stale again.
7. All-package sync closes only when `version.mjs check all` exits zero. A blocked package keeps its old version and blocks the all-current claim.

Package fingerprints cover code, tests, type-tests, fixtures, examples, manifests and config, and exclude generated output, caches, logs, `.npmignore`, changelogs and readmes.

## Review

A package, file or API path under a live package gets the Plate v2 review. The plan lives under `docs/plans/`.

- [Review law](./rules/review-law.md): the target shape and the package and file review invariants.
- [Audit modes](./rules/audit-modes.md): the review matrix, bridge scoring, the full `platejs` sweep law and package review mode.
- [Ownership and correction](./rules/ownership-and-correction.md): gaps, corrective sweeps, extracted-file recovery and the Plate foundation boundary.

For each target, build the source map (public API, internal bridge, callers, tests, docs and examples, exports), bucket every extracted file, fill the review matrix, and prefer `main-parity-cleanup` when the concept and owner are durable, or `merge-existing-owner` and `hard-cut` over restoring a one-use migration split. After every correction run the scoped same-class sweep the correction law requires; in package review mode, broader matches become deferred rows. A completed package review updates the registry from the final fingerprint and proves the package reports `current`. Each cleanup packet ends with a keep, revert or quarantine decision and its proof recorded in the plan; never leave speculative cleanup dirty.

## Proof

```bash
pnpm check:core
pnpm turbo typecheck --filter=./packages/platejs
pnpm --filter platejs test
pnpm --filter platejs build
```

Use package-local focused tests first and broader gates only when exports, the public type surface or the foundation/Plite owner change. Never start `apps/www` from a package review unless the target is docs, registry UI or examples. `pnpm check:core` is required after a package joins `reviewedPackageSlugs`. Failures in packages outside the named scope are out-of-scope drift unless the current change caused them. Removed legacy names get an exact source audit, such as `rg -n 'oldName|old\\.api|legacyHelper' packages/platejs/src --glob '!**/dist/**'`.

## Handoff

Report the target and mode; files and APIs reviewed; the package checklist (total, score-100, unchecked and deferred rows); the doctrine summary (starting and final applied version, fingerprint state, remaining stale packages); the verdict matrix (main-parity-cleanup, move-to-plite, keep-in-plate, hard-cut, Plite gap, Plate gap, private-bridge, defer-with-owner); changes made; the scoped sweep counts; out-of-scope matches; proof commands; legacy names audited; gaps and blockers; anything needing the user's taste review; and the next packet.
