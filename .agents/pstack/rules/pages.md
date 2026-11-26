# Plan pages

This file says which work gets a page, how plans render, what hand-back replies hold, and how calls become Defaults or Open questions. The pstack block in `AGENTS.md` points here. Edit its shared source in `udecode/dotai`.

- **Page work.** Only page work publishes a page: an architecture or API adoption plan. It is also the verdict an `explore` run converges on, and a `radar` pass. All other plans keep their plan file and decision log, publish nothing, and hand back in the reply.
- **Plan pages.** Load the `plan-page` skill before writing or editing a plan, a subject file (`docs/plans/topics/<slug>.md`), or a page. Every subject has one page; subsequent plans are iterations carrying only their delta. The committed plan and subject files are the record; local HTML under `docs/plans/artifacts/` regenerates via `node .agents/pstack/plan-page.mjs <plan>` (and `--index` for the local subject index). Read pages from local files, never from a published URL.
  - **Publishing per runtime.** Publish only at hand-back stops (plan written, back from review, revised/built, review verdict, close, blocked ask, reflect approval, or subject update), never mid-work:
    - **T3 Code (Antigravity):** Render with `node .agents/pstack/plan-page.mjs <plan>`, verify locally, and show inline via `html_render` (via `acp-mcp-call` when omitted from native tools) or cite the local copy path.
    - **Claude Code:** Publish the rendered page via the Artifact tool to the subject's `Page:` URL (or create a new page if deleted/inaccessible and update `Page:`).
    - **Codex:** Render the page, copy the HTML into the run directory, and cite that copy's path and plan.
  - **Defaults vs Open questions.** For noticeable calls that are not on the Autopilot stop list, pick the recommended option, add a `## Defaults` row (decision, pick, alternative, reversing word, impact), and keep going. Never default an option that leaves the user's goal unmet. Check prior art and shipped product docs before asking or running `architect` on an integration. Only Autopilot stops and held external drafts go under `## Open questions` (and to `AskUserQuestion` where supported, recommended option first). "go" accepts recommended options except production deploys or releases, which always need an explicit answer.
  - **Close.** The plan's `## Close` records what landed, proof and limits, reversals first, and open work with `owner:` and `stop:`.
- **Reply.** A page-work hand-back names what landed in one sentence and ends with its link list (`📄 <url>#run-<slug>` or local copy path, then every landed commit link). If the user's language differs from the page's, include the Brief in their language. For non-page work, put what a page would show directly in the reply:
  - What changed and why, in plain `pstack:bro` prose.
  - Each public API change (before and after).
  - Any comparison made (such as a verdict against other editors).
  - Noticeable picks with the word that reverses each.
  - What waits on the owner and proof limits.
  - The link list.
