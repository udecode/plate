# harden vision from docs and sessions

Objective:
Harden vision taste profile; done when batched docs/session scan adds self-grill rules, skill syncs, and checks pass.

Goal plan:
docs/plans/2026-06-03-harden-vision-from-docs-and-sessions.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: local docs corpus, local Codex session logs, memory registry, existing `vision` source rule
- id / link: `docs/plans/**`, `docs/research/decisions/**`, `docs/solutions/**`, `docs/slate-v2/**`, `docs/slate-browser/**`, `docs/editor-behavior/**`, `/Users/zbeyens/.codex/session_index.jsonl`, local Codex session JSONL, `/Users/zbeyens/.codex/memories/MEMORY.md`
- title: Harden Vision taste profile from docs and project prompts
- decision to make: which repeated user corrections become automatic supervisor self-grill/red-flag rules
- decision criteria: compact, deduped, future-actionable, source-backed, Slate-specific, and strong enough to change future automation behavior

Major lane:
- lane: mixed docs, agent-native workflow, prompt/session research
- output type: updated source skill, generated skill mirror, batched evidence artifacts, updated goal plan
- implementation expected: yes, source rule update only
- affected packages / surfaces: `.agents/rules/vision.mdc`, `.agents/skills/vision/SKILL.md`, this plan, `.tmp` evidence artifacts
- dominant risk: overfitting noisy prompts or old execution logs into permanent doctrine

Completion threshold:
- Decision docs/plans/solutions/slate-browser/editor-behavior corpus is scanned in batches and deduped into reusable correction themes.
- Relevant local Codex sessions are streamed, user prompts are extracted, deduped, and batched without loading giant JSONL files into memory.
- `vision` gains a compact red-flags/self-grill section that tells an overnight supervisor how to catch misses before the user does.
- The source rule is edited, generated skill mirror is synced, and source/mirror audit finds the new rules.
- `pnpm install`, `pnpm docs:slate-v2:audit`, `pnpm lint:fix`, and `check-complete.mjs` pass before goal close.

Verification surface:
- `.tmp/vision-doc-prompt-ingest.json` records the docs scan.
- `.tmp/vision-doc-batches.md` records checked doc batches.
- `.tmp/vision-session-prompts.json` records streamed session prompt extraction.
- `.tmp/vision-session-prompt-batches.md` records checked prompt batches.
- `.tmp/vision-self-grill-synthesis.md` records promoted corrections.
- Source/mirror `rg` verifies new red-flag/self-grill doctrine.
- `pnpm install` syncs generated skill output.
- `pnpm docs:slate-v2:audit`, `pnpm lint:fix`, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-harden-vision-from-docs-and-sessions.md` verify closure.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Keep the skill compact; artifacts hold batch evidence.
- Promote only reusable future-supervisor behavior, not one-off complaints.
- Do not edit generated skill mirrors by hand.
- Do not change Slate runtime code.

Boundaries:
- Source of truth: local docs/session artifacts plus `.agents/rules/vision.mdc`.
- Allowed edit scope: `.agents/rules/vision.mdc`, generated mirror through `pnpm install`, this plan, and `.tmp` artifacts.
- External sources: N/A; local docs and sessions are the source.
- Browser surface: N/A; this is a workflow/taste skill update.
- Tracker sync: N/A.
- Non-goals: no runtime patch, no public docs rewrite, no benchmark target changes, no branch/PR/commit.

Output budget strategy:
- Use counts/manifests first, then targeted slices.
- Do not print full docs or raw session logs.
- Stream JSONL session files line by line; never load giant session logs as one string.
- Exclude injected AGENTS/environment/user-instructions blobs from prompt extraction.
- Cap stored prompt excerpts and dedupe by normalized prompt text.
- Batch docs in groups of 10 and session prompts in groups of 25; record one checklist row per batch in artifacts/plan.

Blocked condition:
- None remaining. Block only if final audits fail in a way outside the allowed scope.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to close

Current verdict:
- verdict: complete after final command pass
- confidence: high
- next owner: vision
- reason: docs and prompts produced concrete self-grill rules and supervisor freedom rules now present in source and mirror

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-harden-vision-from-docs-and-sessions.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `major-task` loaded | yes | Major-task template instantiated; autogoal workflow selected. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan. |
| Source of truth read before analysis | yes | Read current `vision`; memory registry hits for `plate-2`; docs/session source map counted. |
| Major lane selected | yes | Mixed docs plus agent-native workflow hardening. |
| Decision criteria stated | yes | Compact, deduped, future-actionable, source-backed red flags. |
| Existing repo patterns / prior decisions checked | yes | Current `vision`; previous docs-ingest artifact; focused docs/session artifacts. |
| Helper stack selected | yes | `autogoal`, `vision`, major-task, docs pack, agent-native pack. |
| External research decision recorded | yes | N/A: local docs and local sessions are the source. |
| Implementation expectation recorded | yes | Patch source rule only; sync mirror with `pnpm install`. |
| Workspace authority selected | yes | `plate-2` owns skills/docs; local Codex sessions are prompt evidence only. |
| Branch / PR expectation decided | yes | N/A: user did not ask for git. |
| Output budget strategy recorded | yes | Stream sessions, cap excerpts, artifact batches. |
| Docs pack selected | yes | Docs pack applied to this plan. |
| `docs-creator` loaded | N/A | No public docs page authored; internal plan follows template. |
| Docs lane selected | yes | Internal skill/plan docs lane. |
| Target docs and nearest sibling docs read | yes | Target skill read; docs/session source dirs selected. |
| Docs style doctrine read | N/A | No public docs style surface changed. |
| Documented source owner identified | yes | `.agents/rules/vision.mdc` is source; generated SKILL.md is mirror. |
| Agent-native pack selected | yes | Agent-native pack applied because a skill changes. |
| Agent-facing action surface identified | yes | `vision` checkpoint-zero supervisor behavior. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**`; synced `.agents/skills/**` through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | N/A | The changed action surface is a skill rule, audited by source/mirror checks. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected outcome, decision criteria, likely files/packages/surfaces, browser surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration, benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with reason.
- [x] If implementation happens, touched-surface packs cover docs, browser, package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are scoped, capped, counted, or artifacted instead of streamed into goal context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Doc Batch Checklist:
- [x] Doc batch 001 docs 1-10: 10 docs, 322 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 002 docs 11-20: 10 docs, 192 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 003 docs 21-30: 10 docs, 39 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 004 docs 31-40: 10 docs, 33 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 005 docs 41-50: 10 docs, 35 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 006 docs 51-60: 10 docs, 39 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 007 docs 61-70: 10 docs, 26 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 008 docs 71-80: 10 docs, 39 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 009 docs 81-90: 10 docs, 148 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 010 docs 91-100: 10 docs, 143 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 011 docs 101-110: 10 docs, 170 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 012 docs 111-120: 10 docs, 435 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 013 docs 121-130: 10 docs, 108 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 014 docs 131-140: 10 docs, 72 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 015 docs 141-150: 10 docs, 87 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 016 docs 151-160: 10 docs, 179 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 017 docs 161-170: 10 docs, 52 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 018 docs 171-180: 10 docs, 315 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 019 docs 181-190: 10 docs, 100 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 020 docs 191-200: 10 docs, 261 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 021 docs 201-210: 10 docs, 197 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 022 docs 211-220: 10 docs, 70 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 023 docs 221-230: 10 docs, 118 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 024 docs 231-240: 10 docs, 106 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 025 docs 241-250: 10 docs, 225 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 026 docs 251-260: 10 docs, 328 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 027 docs 261-270: 10 docs, 179 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 028 docs 271-280: 10 docs, 198 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 029 docs 281-290: 10 docs, 193 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 030 docs 291-300: 10 docs, 109 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 031 docs 301-310: 10 docs, 104 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 032 docs 311-320: 10 docs, 60 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 033 docs 321-330: 10 docs, 68 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 034 docs 331-340: 10 docs, 163 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 035 docs 341-350: 10 docs, 889 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 036 docs 351-360: 10 docs, 2214 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 037 docs 361-370: 10 docs, 2386 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 038 docs 371-380: 10 docs, 2322 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 039 docs 381-390: 10 docs, 494 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 040 docs 391-400: 10 docs, 1290 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 041 docs 401-410: 10 docs, 1068 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 042 docs 411-420: 10 docs, 1471 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 043 docs 421-430: 10 docs, 392 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 044 docs 431-440: 10 docs, 1245 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 045 docs 441-450: 10 docs, 1694 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 046 docs 451-460: 10 docs, 1962 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 047 docs 461-470: 10 docs, 987 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 048 docs 471-480: 10 docs, 863 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 049 docs 481-490: 10 docs, 1153 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 050 docs 491-500: 10 docs, 860 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 051 docs 501-510: 10 docs, 981 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 052 docs 511-520: 10 docs, 874 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 053 docs 521-530: 10 docs, 478 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 054 docs 531-540: 10 docs, 661 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 055 docs 541-550: 10 docs, 587 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 056 docs 551-560: 10 docs, 345 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 057 docs 561-570: 10 docs, 602 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 058 docs 571-580: 10 docs, 799 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 059 docs 581-590: 10 docs, 1310 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 060 docs 591-600: 10 docs, 1632 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 061 docs 601-610: 10 docs, 1119 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 062 docs 611-620: 10 docs, 752 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 063 docs 621-630: 10 docs, 669 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 064 docs 631-640: 10 docs, 1029 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 065 docs 641-650: 10 docs, 655 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 066 docs 651-660: 10 docs, 1221 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 067 docs 661-670: 10 docs, 910 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 068 docs 671-680: 10 docs, 450 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 069 docs 681-690: 10 docs, 1019 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 070 docs 691-700: 10 docs, 498 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 071 docs 701-710: 10 docs, 809 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 072 docs 711-720: 10 docs, 880 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 073 docs 721-730: 10 docs, 61 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 074 docs 731-740: 10 docs, 46 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 075 docs 741-750: 10 docs, 62 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 076 docs 751-760: 10 docs, 92 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 077 docs 761-770: 10 docs, 214 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 078 docs 771-780: 10 docs, 238 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 079 docs 781-790: 10 docs, 298 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 080 docs 791-800: 10 docs, 1587 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 081 docs 801-810: 10 docs, 1370 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 082 docs 811-820: 10 docs, 320 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 083 docs 821-830: 10 docs, 469 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 084 docs 831-840: 10 docs, 162 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 085 docs 841-850: 10 docs, 116 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 086 docs 851-860: 10 docs, 118 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 087 docs 861-870: 10 docs, 53 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 088 docs 871-880: 10 docs, 64 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 089 docs 881-890: 10 docs, 79 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 090 docs 891-900: 10 docs, 186 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 091 docs 901-910: 10 docs, 130 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 092 docs 911-920: 10 docs, 137 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 093 docs 921-930: 10 docs, 70 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 094 docs 931-940: 10 docs, 63 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 095 docs 941-950: 10 docs, 40 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 096 docs 951-960: 10 docs, 60 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 097 docs 961-970: 10 docs, 90 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 098 docs 971-980: 10 docs, 100 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 099 docs 981-990: 10 docs, 108 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 100 docs 991-1000: 10 docs, 113 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 101 docs 1001-1010: 10 docs, 71 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 102 docs 1011-1020: 10 docs, 64 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 103 docs 1021-1030: 10 docs, 37 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 104 docs 1031-1040: 10 docs, 46 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 105 docs 1041-1050: 10 docs, 58 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 106 docs 1051-1060: 10 docs, 76 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 107 docs 1061-1070: 10 docs, 83 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 108 docs 1071-1080: 10 docs, 101 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 109 docs 1081-1090: 10 docs, 173 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 110 docs 1091-1100: 10 docs, 122 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 111 docs 1101-1110: 10 docs, 106 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 112 docs 1111-1120: 10 docs, 137 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 113 docs 1121-1130: 10 docs, 97 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 114 docs 1131-1140: 10 docs, 82 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 115 docs 1141-1150: 10 docs, 120 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 116 docs 1151-1160: 10 docs, 59 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 117 docs 1161-1170: 10 docs, 39 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 118 docs 1171-1180: 10 docs, 127 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 119 docs 1181-1190: 10 docs, 145 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 120 docs 1191-1200: 10 docs, 163 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 121 docs 1201-1210: 10 docs, 133 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 122 docs 1211-1220: 10 docs, 67 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 123 docs 1221-1230: 10 docs, 98 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json
- [x] Doc batch 124 docs 1231-1233: 3 docs, 34 decision lines, exact paths in .tmp/vision-doc-prompt-ingest.json

Session Prompt Batch Checklist:
- [x] Session batch 001 prompts 1-25: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 002 prompts 26-50: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 003 prompts 51-75: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 004 prompts 76-100: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 005 prompts 101-125: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 006 prompts 126-150: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 007 prompts 151-175: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 008 prompts 176-200: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 009 prompts 201-225: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 010 prompts 226-250: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 011 prompts 251-275: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 012 prompts 276-300: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 013 prompts 301-325: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 014 prompts 326-350: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 015 prompts 351-375: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 016 prompts 376-400: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 017 prompts 401-425: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 018 prompts 426-450: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 019 prompts 451-475: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 020 prompts 476-500: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 021 prompts 501-525: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 022 prompts 526-550: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 023 prompts 551-575: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 024 prompts 576-600: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 025 prompts 601-625: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 026 prompts 626-650: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 027 prompts 651-675: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 028 prompts 676-700: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 029 prompts 701-725: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 030 prompts 726-750: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 031 prompts 751-775: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 032 prompts 776-800: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 033 prompts 801-825: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 034 prompts 826-850: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 035 prompts 851-875: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 036 prompts 876-900: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 037 prompts 901-925: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 038 prompts 926-950: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 039 prompts 951-975: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 040 prompts 976-1000: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 041 prompts 1001-1025: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 042 prompts 1026-1050: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 043 prompts 1051-1075: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 044 prompts 1076-1100: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 045 prompts 1101-1125: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 046 prompts 1126-1150: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 047 prompts 1151-1175: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 048 prompts 1176-1200: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 049 prompts 1201-1225: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 050 prompts 1226-1250: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 051 prompts 1251-1275: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 052 prompts 1276-1300: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 053 prompts 1301-1325: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 054 prompts 1326-1350: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 055 prompts 1351-1375: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 056 prompts 1376-1400: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 057 prompts 1401-1425: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 058 prompts 1426-1450: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 059 prompts 1451-1475: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 060 prompts 1476-1500: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 061 prompts 1501-1525: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 062 prompts 1526-1550: 25 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json
- [x] Session batch 063 prompts 1551-1565: 15 deduped user prompts, exact excerpts in .tmp/vision-session-prompts.json

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Verify docs/session batches, source rule, generated mirror, docs audit, lint, and autogoal check | Artifacts and source/mirror audit recorded below; command gates run before final close. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Source owner is `.agents/rules/vision.mdc`; mirror synced by `pnpm install`. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Reusable red flags promoted; noisy prompts kept in artifacts. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | See Decisions and tradeoffs. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Self-grill source/mirror audit; agent-native gate by source/mirror checks. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Source/mirror discoverability verified with `rg`. |
| External-source audit | N/A | Cite official/local clone/external sources when used, or record N/A | Local docs/session-only pass. |
| Implementation gates | yes | Close primary-template and touched-surface gates | `pnpm install`, `rg`, docs audit, lint, autogoal check. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | See Final handoff contract. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Recorded in Verification evidence. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record accidental output and recovery | One large rg output and two Node mistakes recorded; extraction switched to artifacts and streaming. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-harden-vision-from-docs-and-sessions.md` | Recorded in Verification evidence. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Source/mirror audit verifies changed skill claims. |
| Docs links / routes / previews | N/A | Verify leaf links, routes, anchors, and preview names or record N/A | No public route or MDX page changed. |
| Docs MDX/content parser | yes | Run `pnpm docs:slate-v2:audit` for docs/plans change | Recorded in Verification evidence. |
| Plugin page specifics | N/A | For plugin pages, apply docs-creator kit/manual/API rules; otherwise N/A | No plugin page changed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` completed; `rg` found new rules in source and mirror. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | New sections visible in `.agents/skills/vision/SKILL.md`. |
| Agent-native review | N/A | Load reviewer or record N/A | Source/mirror audit is the relevant agent-native proof for this skill-only change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills and source maps read | docs scan |
| Docs batch scan | complete | 1452 files scanned; 1233 decision docs; 124 doc batches | session scan |
| Session prompt scan | complete | 629 session files; 1565 deduped prompts; 63 prompt batches | synthesis |
| Synthesis | complete | Self-grill and supervisor freedom rules selected | implementation |
| Implementation or plan artifact | complete | Source rule patched; mirror synced; artifacts written | verification |
| Verification | complete | Final commands recorded below | closeout |
| Closeout | complete | Final handoff ready | final response |

Findings:
- Docs scan: 1452 focused docs, 1233 decision-bearing docs, 219 skipped docs, 124 checked doc batches.
- Session scan: 629 owned project session files, 1565 deduped prompt excerpts, 63 checked prompt batches.
- Repeated user corrections cluster around exact repro, human-like browser behavior, perf honesty, architecture/API owner depth, reusable proof, skill repair, branch/commit surprises, all-next scope, and output-budget batching.
- The prior north-star covered many taste rules, but it lacked a single pre-close self-grill that forces the supervisor to catch the user's likely objections.

Decisions and tradeoffs:
- Chosen: add `Self-Grill Red Flags` and `Supervisor Freedom` sections to `vision`.
- Rejected: paste prompt examples into the skill; that would make checkpoint zero noisy and slower.
- Rejected: create another skill now; the failure is checkpoint-zero doctrine, not missing topology.
- Chosen: keep raw prompt excerpts and batch ledgers in `.tmp` artifacts.
- Chosen: treat `slate-browser` API growth as a self-grill row, not only a proof-lane note.

Implementation notes:
- Patched `.agents/rules/vision.mdc`.
- Ran `pnpm install` to regenerate `.agents/skills/vision/SKILL.md`.
- Added `.tmp/vision-self-grill-synthesis.md`.

Review fixes:
- Source/mirror audit confirmed `Self-Grill Red Flags` and `Supervisor Freedom` appear in both rule and generated skill.
- Banned-word audit found no forbidden term in the edited skill surfaces.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Tried to read giant session JSONL files with `readFileSync` and hit V8 string limit | 1 | Stream JSONL line by line | Resolved with streaming extractor over owned session files. |
| Used top-level `await` with CommonJS `require` in inline Node scripts | 2 | Wrap async script body in an IIFE | Resolved; extraction completed. |
| Broad prompt-artifact `rg` printed too much before truncation | 1 | Treat artifacts as evidence and sample targeted slices only | Resolved; synthesis artifact is compact. |

Verification evidence:
- `rg` memory pass: found relevant `plate-2` Slate/session entries in `/Users/zbeyens/.codex/memories/MEMORY.md`.
- Session source map: 763 keyword-relevant JSONL files, 629 owned project session files by `session_meta.cwd`.
- Session extraction: 1565 deduped prompt excerpts, 63 prompt batches.
- Docs extraction: 1233 decision docs, 124 doc batches.
- `pnpm install`: completed and regenerated skills with skiller apply.
- Source/mirror `rg`: `Self-Grill Red Flags`, `Exact repro`, `Human behavior`, `Perf honesty`, `Slate-browser growth`, `Supervisor Freedom`, and supervisor freedom rules found in both source and generated skill.
- Banned-word audit: no forbidden-term matches in `.agents/rules/vision.mdc` or generated skill.
- `pnpm docs:slate-v2:audit`: passed, Slate v2 docs audit passed.
- `pnpm lint:fix`: passed, checked 3234 files and no fixes were applied.
- `check-complete.mjs`: passed for this plan.

Final handoff contract:
- Recommendation: keep `vision` as the compact taste profile; keep prompt/doc evidence in artifacts.
- Confidence: high after final command pass.
- Evidence: docs/session batch artifacts, source/mirror audit, install sync, docs audit, lint, autogoal check.
- Tests / commands: `pnpm install`; source/mirror `rg`; `pnpm docs:slate-v2:audit`; `pnpm lint:fix`; `check-complete.mjs`.
- Browser proof: N/A, no browser surface changed.
- PR / tracker: N/A, user did not request git actions.
- Caveats: prompt extraction is heuristic and excludes injected context; raw artifacts preserve excerpts for audit.
- Next owner: `slate-automation` should consume `vision` at checkpoint zero.

Timeline:
- 2026-06-03T13:34:09.346Z Major-task goal plan created.
- 2026-06-03T13:34Z Active goal created.
- 2026-06-03T13:35Z Session source map counted; readFileSync extractor failed on giant JSONL.
- 2026-06-03T13:36Z Streamed project sessions and wrote prompt artifacts.
- 2026-06-03T13:37Z Scanned focused docs corpus and wrote docs artifacts.
- 2026-06-03T13:38Z Patched `vision`, synced mirror, and wrote synthesis artifact.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout verification |
| Where am I going? | Run final docs/lint/autogoal gates, close goal, report concise result |
| What is the goal? | Harden `vision` from docs and project prompts so it better substitutes for user supervision |
| What have I learned? | The missing layer was a self-grill checklist plus explicit supervisor freedom to repair skills/tests/metrics/API owners |
| What have I done? | Scanned docs and sessions in batches, patched source rule, synced generated skill, artifacted evidence |

Open risks:
- Prompt extraction is heuristic; exact raw session files remain available if a future correction needs deeper archaeology.
