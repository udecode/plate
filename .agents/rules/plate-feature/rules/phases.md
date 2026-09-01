# Delivery Phases

Load only the active phase's owner.

## 1. Intake

Choose one flow mode and fill every Feature Manifest row before source writes.
Name the package, public imports, registry consumers, docs route, release
surface, and proof boundary.

## 2. API And Layer Gate

Load `best-api` when the public shape is unresolved. Load `plate-plan` only for
a cross-layer, breaking, or runtime-boundary adoption decision. Record the
accepted call sites and owner before implementation.

Resolve the Feature Manifest's Scale proof row here. When runtime layers or
repeated/hot work can change, materialize `performance-observability` and run
Benchmark's embedded current-owner versus target probe before source writes.
Use a disposable target prototype when needed; planning prose is not proof.

## 3. Manual Package Shell

Editor features live in `platejs`; do not create another editor-facing package.
Add a root feature module for standard behavior or an explicit
`platejs/<feature>` and `platejs/<feature>/react` entrypoint for an optional or
advanced runtime. Declare every direct entrypoint dependency in
`tooling/entrypoints/entrypoint-dag.mjs`; only `packages/platejs` may declare or
import `plitejs`. The only scoped package roots are `@platejs/cli` and
`@platejs/test`, which peer on `platejs` with `workspace:^` as their local
dev provider. Run install and `pnpm test:manifests` after dependency or package
metadata changes.

## 4. Package Semantics

Load `plate-plugin-creator`. Keep semantic behavior in `src/lib`, colocate
plugin-owned capabilities, preserve contextual inference, and prove the package
surface before React work.

## 5. React Adapter

Load `plate-ui` with `plate-plugin-creator`. Add only durable package React
adapters. Copied-product composition, handlers, layout, and opinionated state
belong in registry source.

When this phase changes source roots or entrypoints, update the exact
`oxlint.config.ts` `no-restricted-imports` coverage. Headless roots stay free of
React packages, React entrypoints, and React-owned source trees. Add only narrow
React/test/proof exclusions; never ignore the whole package.

## 6. Registry UI

Load `plate-ui`. Author one copied component family under
`apps/www/src/registry/components/editor`; keep primitive variants on the same
installed target and retain open-code ownership.

## 7. Composition And Registry Metadata

Wire app-owned `*Kit` values, static bindings, editor composition, registry
metadata, dependencies, examples, and intentional transparent feature setup.
Do not export package-owned composition arrays.

## 8. Docs And Release

Load `docs-creator` for current-state docs. Load `changeset` for published
package deltas and `registry-changelog` for registry-only deltas. Record an
explicit N/A reason when neither applies.

## 9. Proof

Run only the proof selected by the manifest, then widen at handoff. Update each
row after its evidence exists, not before.

For Scale proof `yes`, rerun the frozen cohort/budget contract on the final
production path and source identity, then run the selected correctness guard.
The pre-acceptance prototype cannot close this phase.

## 10. Attestation And Review

Load `plate-next` for a completed package review. Reuse the Feature Manifest as
the attestation input and keep required per-file review rows in the same plan's
`Package file evidence` section. Advance only that package's version after full
current proof, with the registry entry pointing to this exact plan and
authoritative fingerprint at the latest doctrine version.

For focused work in an existing stale or unreviewed package, mark Plate Next
attestation `no` with its exact status and reason. Record changed-file review
and package fingerprint evidence without inventing a whole-package score or
advancing the package. Run P1 `autoreview`, close accepted findings, then run
both the feature checker and goal checker.
