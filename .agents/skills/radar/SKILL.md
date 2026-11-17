---
description: Scan outside editors and apps for board-sized Plate product ideas, rank them with a free, Plus or Pro lean and an AI layer, and redraw the product radar map. Use for /radar, a fresh pass over one domain, a redraw of the map after picks change, or "what should Plate build next" across every feature rather than one scope.
argument-hint: '[<lane: structure | visual | review | inline | io | ai> | map]'
name: radar
metadata:
  skiller:
    source: .agents/rules/radar.mdc
---

# Radar

Handle $ARGUMENTS.

The radar finds ideas for the owner to shape. Each gives an existing Plate feature a job people now open another app for, the way the board and ink did. Its state lives in three places:

- The subject file `docs/plans/topics/product-radar.md` is the record: the ranked ideas, each idea's state, and the link to the map page. Its plans keep each pass's evidence and scores.
- The map data `docs/plans/topics/product-radar.map.json`, committed beside it, holds what the map draws, such as each pin's place and each scene's prompt. Where the two disagree, the subject file wins.
- The map page is a claude.ai artifact that shows the map data as a painted island map. Only its painted art lives nowhere else. The map is not a plan page, so the Artifact tool reads and publishes it directly, never through `page-stop.mjs`.

| Argument | Runs |
| --- | --- |
| none | every step, with all six lanes |
| a lane id | every step, with that lane only, merged into the current ranking |
| `map` | steps 5 and 7 only, with the map data landed between them, after the subject file changed, such as the owner picking or dropping ideas |

Load `pstack:poteto-mode` first. A pass is a read-only investigation whose answer is a plan page: its plan names `Playbook: investigation`, the steps below are its method in place of that playbook's `how`-shaped output, and the `plan-page` skill says how to write and publish it.

## Steps

1. **Read the radar.** Read the subject file, its newest plan and the map data in full.
2. **Run the lanes.** Run `node .agents/rules/radar/scripts/radar.mjs lanes <run dir> [lane...]` from the repository root, in the background. The run directory is the main checkout's `docs/plans/artifacts/<date>-product-radar/`. When an earlier pass that day took that name, the run directory and the step 4 plan both add the same short suffix that names the pass, such as `-value`, so neither overwrites the earlier pass's files. Each lane composes the shared brief in [references/lanes.md](references/lanes.md) with its own section and runs on the models sheet's `how explorer` line through `cross.mjs --reach`, so it may read the web but writes nothing in the repository. Check each report against its brief, as `AGENTS.md`'s Extraction rule says. To rerun a lane once for what it left out, write that to a file and run `radar.mjs lanes <run dir> <lane> --gap <file>`, which keeps the first report and writes the rerun beside it as `lane-<id>-a2.md`.
3. **Score.** Merge ideas that name the same job. Score each new or changed idea 0 to 3 on five things and add them, out of 15:
   - **Reach**: how many people a demo would interest.
   - **Paid**: whether a company would buy its Plus kit or its Pro half, as the subject's Paid model defines them, and how hard an agent would find a rebuild from public docs.
   - **AI fit**: 3 when the core works without AI and AI adds the headline demo, lower when the idea needs AI to make sense.
   - **Reuse**: how much Plate already has, where 3 means a small or medium build.
   - **Lanes**: how many lanes proposed it on their own, capped at 3.

   Take a point off when the core needs a service the app must host, other than Plate's own sync server. Ties go to the cheaper build, then the higher Paid score. The top ten are ranked and the next few are near misses. An idea the owner picked, dropped or built keeps its state, and only new evidence changes its scores. Every cost, reach and Paid call is a guess, and the page says so. A lane's reach, paid half, cost and top five are evidence, and the lead makes every merge and score, as `AGENTS.md`'s Extraction rule keeps judgment on the session's model. Lanes counts how many lanes reached an idea from their own features, not votes.
4. **Write the pass.** Write `docs/plans/<date>-product-radar.md` as an iteration of the `product-radar` subject, with only what changed since the last pass: new ideas, rescored ones and ones that left the top ten, with each lane report it rests on. A Defaults row names the two or three ideas the lead would explore first, with the word that changes them, and the plan's Open work lists each with `/verdict explore` on the Plate feature it builds on as its next step.
5. **Map.** Update the map data from the subject file. Give each new idea a `sector` whose island holds it, `at` as [x, y] percentages on that island's land, and a `scene` prompt that shows its job as one small picture. Then run, from the repository root, with the map data's path as `<data>`, the art directory and the page in the session's scratchpad, which the Artifact tool publishes from, and the screenshots in the run directory:
   1. `radar.mjs npm <data>` to refresh the download counts.
   2. Copy the published `art/` files into an art directory with the Artifact tool's `read` action. Then run `radar.mjs paint <data> <art dir>`, which paints a scene only for each ranked idea that has none there. Add `--map` only when the islands change or the map link no longer opens. Image models garble small text, so every image is painted without text and the page draws the pins and labels on top. `paint` runs `codex exec` at low reasoning effort, outside `cross.mjs`, because `cross.mjs --reach` deletes its scratch folder and the image with it. `AGENTS.md`'s Radar painter override lets it run on Codex at that effort.
   3. `radar.mjs render <data> <page.html>`. It refuses an idea whose pin has no island or place.
   4. `radar.mjs shoot <page.html> <art dir> <shots dir>`, then read each screenshot. Fix any pin or label that covers another, and render again.

6. **Land.** Write the plan's Close and fold the new ranking into the subject file's Ideas table, then land and publish the pass as the `plan-page` skill and `.agents/pstack/rules/land.md` say. The map comes first, so the landing commit holds its data and the log rows that cite its screenshots.
7. **Publish the map.** Once land.mjs exits 0, publish the page to the map link, with each new or repainted file in `art/` in its `files`, so the map never shows a ranking `next` lacks. Leave each art file that did not change out of `files`, because an update keeps the files it leaves out and the Artifact tool refuses an `{artifact, path}` copy from the page it publishes to. When the map link no longer opens, publish a new artifact with every file in the art directory, then replace the link in the subject file in a commit of its own. Codex has no Artifact tool. So a Codex session paints into an empty art directory in step 5, then copies the page and its `art/` folder into the run directory and names that folder in its reply in place of the map link.

The pass ends at the ranking. The owner starts each exploration from its Open work line.
