# Plan pages that talk like a person

Status: executed: dotai pushed and plate-2 synced; waiting on your commit
Topic: plan-page
Playbook: feature

Plan pages read like specs. The owner asked for plain talk: every part of the page in the `pstack:bro` voice by default, one section that teaches the thing the plan changes, and a simpler Picked for you. After seeing it, the owner asked for nothing folded, Picked for you split by importance like major, minor and patch, a shorter How it works with a before and after picture, and bro as the last writing pass. This iteration changes the page shape in dotai's `plan-page` skill and renderer, syncs plate-2, and rewrites the authored page in the new voice.

## Brief

### What will change?

Every page now talks like a person. A short How it works, with a picture, explains the thing. Picked for you shows one line per choice, grouped big calls, small calls and details. It's live in dotai and synced here.

### What could go wrong?

Old pages keep their old wording until someone edits them. The authored page's engineer sections still read dense. Ellie gets this at its next sync. The plate-2 sync waits for your commit.

## Teach

A plan page is the one place the owner reads to understand a piece of work and decide what happens next. Agents write it as Markdown, and a script turns it into a web page.

Until now the page read like a manual. Picked for you was a four-column table, and nothing explained the thing being changed.

Now every sentence uses the bro voice, which means short, plain and no jargon. A How it works section under the brief explains the thing in three short paragraphs, with a before and after picture when parts move. Picked for you shows one line per choice, grouped as big calls, small calls and details, and nothing is folded.

## Main changes

- `skills/plan-page/references/shape.md` makes the bro voice the default for every sentence the page shows, adds the `## Teach` section with its three-paragraph limit and its before and after picture, adds the Defaults `Impact` column, and says how to write Defaults cells so their one-line form reads plainly.
- `skills/plan-page/SKILL.md` has Render write `## Teach` with `pstack:teach`'s method right after the brief, and Check run the prose pass first and `pstack:bro` last over each owner-facing section, dropping detail the plan's other sections keep.
- `skills/sync-pstack/assets/pstack/plan-page.mjs` renders `## Teach` as How it works right after the brief, with its pictures inline, and refuses an open plan whose Teach runs past three paragraphs or 160 words. It renders a Defaults table as one sentence per row under Picked for you, grouped under Big calls, Small calls and Details when the table has an `Impact` column, and refuses any other impact. It refuses a Teach picture inside a sentence and code in a fenced block, as it already refused inline code. It inlines SVG pictures, and a page with pictures in both Demo and Teach gets one image viewer.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which projects get it now | plate-2, by syncing it | Ellie too, which is behind on other changes | sync ellie | big |
| How long How it works can run | Three short paragraphs and 160 words, checked | No limit | no teach limit | small |
| Is the teach part required | Expected but not checked, so old plans still render | The renderer refuses an open plan without one | require teach | small |
| Is the impact column required | Expected but not checked, so old plans still render | The renderer refuses a plan without it | require impact | small |
| Order of the last writing passes | Unslop, then bro last, which may drop detail the plan keeps | Bro, then unslop | bro first | small |
| How the defaults look on the page | One sentence per choice | The old four-column table | keep the table | detail |
| What the teach part is called on the page | How it works | Teach | call it teach | detail |
| Names of the groups in Picked for you | Big calls, small calls, details | Major, minor, patch | semver names | small |
| The page link | A new page at https://claude.ai/artifact/NRgfJHG3SH8PULHUqGy3fn, because the old one no longer opens for this account | Go back to https://claude.ai/artifact/QkmXGRS8ykgdL4YtYCNr1f | old page | detail |
| Where the authored reply's full reasoning goes | The plan file's Evidence, off the page | On the page under the short reply | full reply on page | detail |

## Steps

- [x] Edit dotai's `plan-page` skill and renderer, with a test that fails on the old renderer for each new behavior. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` in dotai, and the new tests failing on the old renderer. Done: dotai commit 4199918; docs/plans/artifacts/2026-10-08-plan-page-bro-teach/dotai-tests-a4.log; docs/plans/artifacts/2026-10-08-plan-page-bro-teach/prev-renderer-fails-a1.log; docs/plans/artifacts/2026-10-08-plan-page-bro-teach/prev2-renderer-fails-a1.log; docs/plans/artifacts/2026-10-08-plan-page-bro-teach/mutant-viewer-a1.log.
- [x] Render every plate-2 and Ellie plan with the old and the new renderer and diff the bodies. Proof: the diff log under `docs/plans/artifacts/2026-10-08-plan-page-bro-teach/`. Done: docs/plans/artifacts/2026-10-08-plan-page-bro-teach/corpus-3-a1.tsv and docs/plans/artifacts/2026-10-08-plan-page-bro-teach/corpus-diff-3-a1.tsv.
- [x] Run `deslop` and `no-comments` on the renderer change and `unslop` on the skill prose. Proof: decision-log rows. Done: the decision log's writing rows; docs/plans/artifacts/2026-10-08-plan-page-bro-teach/comment-sicko-2/reply.md.
- [x] Commit and push dotai after `scripts/validate-skills` passes. Proof: the dotai commit. Done: dotai commits 4199918, 78cd7b5 and 0510a0a; docs/plans/artifacts/2026-10-08-plan-page-bro-teach/validate-skills-a5.log on 0510a0a's bytes.
- [x] Sync plate-2 from the pushed commit, refresh the installed `plan-page` skill, and run `verify`. Proof: the `apply` and `verify` logs. Done: docs/plans/artifacts/2026-10-08-plan-page-bro-teach/sync-apply-a1.log, docs/plans/artifacts/2026-10-08-plan-page-bro-teach/skill-install-a1.log and docs/plans/artifacts/2026-10-08-plan-page-bro-teach/sync-verify-a1.log.
- [x] Smoke both runtimes with a plain request that ends in a plan page. Proof: the smoke log, judged against the intended-behavior file written first. Done: `docs/plans/artifacts/2026-10-08-plan-page-bro-teach/smoke-a3.log` against `docs/plans/artifacts/2026-10-08-plan-page-bro-teach/smoke-intended.md`, after the Demo order fix the earlier rounds forced.
- [x] Rewrite the authored page's brief, defaults and lead in the bro voice, add its How it works section with `pstack:teach` and a before and after picture, tier its defaults, shorten its reply to the design doc, and republish it. Proof: the published page. Done: https://claude.ai/artifact/HmRjqgC5E9htfk2Kn5psAB.
- [x] Run the decision-trail review on this change. Proof: the reviewer's answer in the run directory. Done: `docs/plans/artifacts/2026-10-08-plan-page-bro-teach/trail/seat-sol.md`.

## Open work

- The authored page's engineer sections, such as Public API, Document shape and Layer and owner, still use dense engineering prose; the bro pass ran on the parts the owner reads first. owner: zbeyens. stop: the authored follow-up iteration's writing pass restates them, or the owner keeps engineer sections technical. Tracked here and in `docs/plans/topics/authored.md` once this plan folds.
- Plan-page rules that disagree and predate this change, named by the smoke runs: a page with a brief hides Close, so its counts and review warnings reach the owner only through the 40-word Risks; the Ship stage shows done once Status says executed, before the owner commits; the subject is picked before a bug is diagnosed; read-only requests versus publishing; shape.md lists a message to outsiders as a stop while the shared block drafts it and keeps going; and Defaults rows have no place for the attention level the block gives every call. owner: zbeyens. stop: a plan-page iteration settles each one, or the owner drops them. Tracked here and in `docs/plans/topics/plan-page.md` once this plan folds.
- Ellie gets the new page shape at its next sync, which also carries the other shared changes it is behind on. owner: zbeyens. stop: Ellie's next sync, or the owner says "sync ellie".

## Close

Reversals and deviations first. Commit 4199918 shipped a stale workflow manifest, because the skill check ran before the last text edits; 78cd7b5 rebuilt it. The first smoke found Demo and How it works both claiming the spot after the brief; 78cd7b5 placed Demo in both page orders. The tier names moved from major, minor and patch to big calls, small calls and details after the owner asked. The authored page moved to https://claude.ai/artifact/HmRjqgC5E9htfk2Kn5psAB because the old link now belongs to another account. The old and new comparison of each page mode was published after the dotai commit, not before it as the plan-page Change mode orders.

What landed: dotai 4199918, 78cd7b5 and 0510a0a on udecode/dotai main. The plan-page skill writes every shown sentence in the bro voice, adds Teach as How it works with at most three short paragraphs and 160 words and an optional before and after picture, groups Defaults under Big calls, Small calls and Details through an optional Impact column, and runs unslop before bro. The renderer refuses a long Teach, a picture inside a sentence, fenced code in the owner-facing parts and an unknown impact, inlines SVG pictures and keeps one image viewer per page. plate-2 is synced and its plan-page skill reinstalled; those files, the workflow guide and both plans wait for your commit.

Proof and limits: 143 dotai tests pass, and each of the nine new tests failed on the renderer before it (`docs/plans/artifacts/2026-10-08-plan-page-bro-teach/dotai-tests-a6.log`). Every plate-2 and Ellie page that renders matches outside the parts this change owns (`docs/plans/artifacts/2026-10-08-plan-page-bro-teach/corpus-diff-4-a1.tsv`). A third smoke showed both runtimes grouping picks and running bro last (`docs/plans/artifacts/2026-10-08-plan-page-bro-teach/smoke-a3.log`). Smoke proves routing, not a page a fresh session wrote. No baseline smoke ran on the old text. Ellie is not synced.

Counts: 8 steps, 8 done. Decision-trail review by gpt-6.1-sol raised no critical finding and 8 warnings plus one side finding: 8 applied and 1 deferred with its owner.

### Attention

reviewed by gpt-6.1-sol. Warnings: the corpus claim was wider than its classifier (applied), the authored page's engineer prose is not in the bro voice (deferred, owner zbeyens), a stale proof backed the commit step (applied), the writing passes predated the last edits (applied), verify, the mode comparison and a baseline smoke were missing (applied, the baseline dismissed), the word cap had no failing case (applied), central decisions had no rows (applied), and the workflow guide was stale (applied). Side finding: a stale serializer step in the authored plan (applied).
