# Slate v2 Donor Manifest Summary

## Donor

- Path: `.tmp/slate-v2`
- Branch: `main`
- Commit: `f0e5ad1ae7caa14027dc57bc38bd457909bd4b97`
- Commit time: `2026-06-17T15:46:44+02:00`

## Totals

- Git tree files: 2157
- Included files: 2157
- Excluded files: 0
- Included bytes: 12424805

## Include Policy

- all tracked files from the donor HEAD commit unless explicitly excluded below
- packages with source, tests, configs, README/CHANGELOG, and package-owned benchmarks
- root package manager, TypeScript, lint, build, Playwright, and workspace configs
- scripts including benchmark, proof, stress, integration, and local server helpers
- Playwright integration, stress, and docker proof assets
- site examples and example route/app shell files needed to port proof routes
- docs, changesets, GitHub templates/workflows, and config files

## Exclude Policy

- git-dir
- node-modules
- package-dist
- next-output
- turbo-cache
- coverage-output
- test-results
- playwright-report
- scratch-tmp
- cache-output
- os-junk
- log-output

## Category Counts

| Category | Files |
| --- | ---: |
| benchmark-script | 35 |
| changeset | 16 |
| config | 9 |
| docs | 134 |
| github-config | 10 |
| package-config | 29 |
| package-doc | 13 |
| package-other | 9 |
| package-source | 446 |
| package-test | 1280 |
| playwright | 1 |
| playwright-docker | 5 |
| playwright-integration | 37 |
| playwright-stress | 3 |
| proof-script | 5 |
| research-artifact | 21 |
| root-config | 16 |
| root-doc | 2 |
| root-other | 3 |
| script | 6 |
| site-app | 11 |
| site-component | 15 |
| site-example | 43 |
| site-example-route | 2 |
| site-public | 3 |
| stress-script | 3 |

## Package Counts

| Package | Files |
| --- | ---: |
| slate | 1249 |
| slate-browser | 73 |
| slate-dom | 46 |
| slate-history | 38 |
| slate-hyperscript | 45 |
| slate-layout | 10 |
| slate-react | 255 |
| slate-yjs | 61 |

## Excluded Tracked Files

- None.

## Artifacts

- `docs/transplant/slate-v2/donor-manifest.tsv.txt`
- `docs/transplant/slate-v2/donor-manifest.jsonl`
- `docs/transplant/slate-v2/donor-excluded.tsv.txt`
- `docs/transplant/slate-v2/donor-manifest-meta.json`
- `docs/transplant/slate-v2/donor-manifest-summary.md`

## Verification

```bash
node docs/transplant/slate-v2/scripts/build-donor-manifest.mjs --check
```
