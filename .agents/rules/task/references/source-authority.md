# Source authority

Task reads the current user request and named sources first. Root `VISION.md` is the mandatory doctrine entrypoint
and essential summary. Detailed owner doctrine lives in `docs/vision/*.md`.

## Rule

1. Read the active Task plan when one exists.
2. Read root `VISION.md`.
3. Read only the relevant detail files:
   - common proof, automation, docs, maintainer policy:
     `docs/vision/common.md`
   - Plite substrate/API/runtime/browser/perf work: `docs/vision/plite.md`
   - Plate framework/plugin/component/docs work: `docs/vision/plate.md`
   - vision learning, baseline, or doctrine sync: `docs/vision/sync.md`
4. Follow root first when root and a detail file conflict, then repair the
   stale detail file or root summary during the same workflow.
5. Read the owner skill/rule for execution details.
6. Put checkpoint evidence in the active plan, not in this reference.

For a concrete reusable public API shape, read this doctrine and then use
`best-api design` or `best-api review`. Vision owns durable direction;
`best-api` owns applying it to call sites.

Do not duplicate doctrine here. When reusable vision changes, edit root
`VISION.md` for essential always-read doctrine and the relevant
`docs/vision/*.md` file for owner detail, then run `pnpm install` when owned instruction sources changed.
