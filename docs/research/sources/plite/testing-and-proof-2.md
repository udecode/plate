# Plite: testing and proof, part 2

## Historical browser runs

- The 2026-06-14 draft readiness run, packet `proof-018`, exercised every example integration spec except pagination across Chromium, Firefox and WebKit. After richtext setup and drag-helper repairs, it recorded 1,679 passed, 112 expected skips, zero flakes and zero hard failures in 10.7 minutes. The source does not pin the runtime revision or provide the raw result artifact here. These are historical draft Plite results, not current checkout proof, raw-device proof or pagination coverage. Source: `c70bacbd4a:docs/plans/2026-06-14-plite-public-beta-readiness-review.md:496`.

## Browser replay coverage inventory

- **The May 28 replay comparison measured discovery coverage.** The recorded Chromium inventory covered richtext, tables, inlines and paste-html: 134 listed draft-fork tests versus 8 legacy Slate tests, 136 union fixtures and 280 emitted rows, with 150 `ok` and 130 `coverage-gap`. The plan's duplicated Plite labels are rename damage: the surviving generator distinguishes `slate-v2:browser-replay` from `slate:browser-replay`, invokes Playwright with `--list`, and records `proofKind: 'test-discovery'` (`benchmarks/slate-v2/donor/browser/rich-text-replay-coverage.mjs`). Source: `docs/plans/2026-05-28-plite-browser-rich-text-replay-benchmark.md:130-155`, run dated 2026-05-28; source revisions were not recorded. Limit: listing proves neither execution nor browser action latency, and these are historical counts.
