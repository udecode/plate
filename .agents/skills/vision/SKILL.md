---
description: Route to root VISION.md and relevant docs/vision detail files. Use when a task mentions vision, taste, north star, checkpoint zero, long-term architecture, public API shape, proof standards, Slate/Plate boundaries, or autonomous maintainer fit.
name: vision
metadata:
  skiller:
    source: .agents/rules/vision.mdc
---

# Vision

This skill is a router. Root `VISION.md` is the mandatory doctrine entrypoint
and essential summary. Detailed owner doctrine lives in `docs/vision/*.md`.

## Rule

1. Read the active goal plan when one exists.
2. Read root `VISION.md`.
3. Read only the relevant detail files:
   - common proof, automation, docs, maintainer policy:
     `docs/vision/common.md`
   - Slate substrate/API/runtime/browser/perf work: `docs/vision/slate.md`
   - Plate framework/plugin/component/docs work: `docs/vision/plate.md`
   - vision learning, baseline, or doctrine sync: `docs/vision/sync.md`
4. Follow root first when root and a detail file conflict, then repair the
   stale detail file or root summary during the same workflow.
5. Read the owner skill/rule for execution details.
6. Put checkpoint evidence in the active plan, not in this skill.

Do not duplicate doctrine here. When reusable vision changes, edit root
`VISION.md` for essential always-read doctrine and the relevant
`docs/vision/*.md` file for owner detail, then run `pnpm install` so this
generated skill stays in sync.
