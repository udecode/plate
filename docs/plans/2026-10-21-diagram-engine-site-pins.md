# Pin the site's diagram engines to the copied versions

Page: https://claude.ai/artifact/YHTfY4d5eBpjZGLFWomS1m
Status: done: merged into next as 7a4f3bb4ca
Playbook: babysit

My commits on top of dylans's diagram engine pins. The babysit run that drove them is `docs/plans/2026-10-21-pr-5230-5231-babysit.md`.

## Brief

### What will change?

The docs site installs the same Pele, Viz.js, flowchart.js and PlantUML encoder versions that the copied renderer items now pin. A routine dependency update can no longer move the site off the version a copied diagram block installs.

### What could go wrong?

An engine upgrade now has to change two places, the registry item and the site's package.json. Nothing checks yet that the two match.

## Teach

Each copied diagram renderer is a registry item, and its dependency list is what the registry's install command adds to a user's app. This branch pins those lists to exact versions, such as Pele 1.6.0, so a copied block gets the engine Plate tested.

The site declared the same four engines with caret ranges, which accept any newer minor version. The lockfile still resolved the tested versions, but the next update could raise them, and the site would then test a newer engine than the one copied blocks install. My commit makes the site's four specifiers exact. The lockfile already held those versions, so the site installs the same bytes as before.

The branch was cut before other registry changes reached the beta branch, so its generated registry files no longer merged. A merge of the beta branch and a rebuild of those files fixed that without touching the author's commits.

## On top of the PR

- Kept
  - The four exact versions in the registry items and the registry changelog entry.
- Changed
  - The site's `apps/www/package.json` declares the four engines at those exact versions instead of caret ranges, and `pnpm-lock.yaml` records the same specifiers with no resolved version moving.
  - The drawing subject file says each renderer item installs the site's exact engine version, and drops its open item about the unpinned `pele` dependency.
  - A merge of `next`, with the generated registry files rebuilt by `build:registry`.
- Dropped
  - Nothing.

## Verification

- `pnpm check --affected` passed all 24 steps on the pushed head.
- A hand drive of the four component pages showed each Manual install command naming the pinned engine, such as `npm install pele@1.6.0`, and the releases page listed the changelog entry.
