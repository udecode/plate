# Plan Handoff

This file contains post-plan-writing instructions: document review, post-generation options, and issue creation. Load it after the plan file has been written and the confidence check (5.3.1-5.3.7) is complete.

## 5.3.8 Document Review

After the confidence check (and any deepening), run the `document-review` skill on the plan file. Pass the plan path as the argument. When this step is reached, it is mandatory — do not skip it because the confidence check already ran. The two tools catch different classes of issues.

The confidence check and document-review are complementary:
- The confidence check strengthens rationale, sequencing, risk treatment, and grounding
- Document-review checks coherence, feasibility, scope alignment, and surfaces role-specific issues

If document-review returns findings that were auto-applied, note them briefly when presenting handoff options. If residual P0/P1 findings were surfaced, mention them so the user can decide whether to address them before proceeding.

When document-review returns "Review complete", proceed to Final Checks.

**Pipeline mode:** If invoked from an automated workflow such as LFG, SLFG, or any `disable-model-invocation` context, run `document-review` with `mode:headless` and the plan path. Headless mode applies auto-fixes silently and returns structured findings without interactive prompts. Address any P0/P1 findings before returning control to the caller.

## 5.3.9 Final Checks and Cleanup

Before proceeding to post-generation options:
- Confirm the plan is stronger in specific ways, not merely longer
- Confirm the planning boundary is intact
- Confirm origin decisions were preserved when an origin document exists

If artifact-backed mode was used:
- Clean up the temporary scratch directory after the plan is safely updated
- If cleanup is not practical on the current platform, note where the artifacts were left

## 5.4 Post-Generation Options

**Pipeline mode:** If invoked from an automated workflow such as LFG, SLFG, or any `disable-model-invocation` context, skip the interactive menu below and return control to the caller immediately. The plan file has already been written, the confidence check has already run, and document-review has already run — the caller (e.g., lfg, slfg) determines the next step.

After document-review completes, present the options using the platform's blocking question tool when available (see Interaction Method). Otherwise present numbered options in chat and wait for the user's reply before proceeding.

**Question:** "Plan ready at `docs/plans/YYYY-MM-DD-NNN-<type>-<name>-plan.md`. What would you like to do next?"

**Options:**
1. **Start `/ce:work`** - Begin implementing this plan in the current environment (recommended)
2. **Open plan in editor** - Open the plan file for review
3. **Run additional document review** - Another pass for further refinement
4. **Share to Proof** - Upload the plan for collaborative review and sharing
5. **Start `/ce:work` in another session** - Begin implementing in a separate agent session when the current platform supports it
6. **Create Issue** - Create an issue in the configured tracker

Based on selection:
- **Open plan in editor** -> Open `docs/plans/<plan_filename>.md` using the current platform's file-open or editor mechanism (e.g., `open` on macOS, `xdg-open` on Linux, or the IDE's file-open API)
- **Run additional document review** -> Load the `document-review` skill with the plan path for another pass
- **Share to Proof** -> Upload the plan:
  ```bash
  CONTENT=$(cat docs/plans/<plan_filename>.md)
  TITLE="Plan: <plan title from frontmatter>"
  RESPONSE=$(curl -s -X POST https://www.proofeditor.ai/share/markdown \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg title "$TITLE" --arg markdown "$CONTENT" --arg by "ai:compound" '{title: $title, markdown: $markdown, by: $by}')")
  PROOF_URL=$(echo "$RESPONSE" | jq -r '.tokenUrl')
  ```
  Display `View & collaborate in Proof: <PROOF_URL>` if successful, then return to the options
- **`/ce:work`** -> Call `/ce:work` with the plan path
- **`/ce:work` in another session** -> If the current platform supports launching a separate agent session, start `/ce:work` with the plan path there. Otherwise, explain the limitation briefly and offer to run `/ce:work` in the current session instead.
- **Create Issue** -> Follow the Issue Creation section below
- **Other** -> Accept free text for revisions and loop back to options

## Issue Creation

When the user selects "Create Issue", detect their project tracker from `AGENTS.md` or, if needed for compatibility, `CLAUDE.md`:

1. Look for `project_tracker: github` or `project_tracker: linear`
2. If GitHub:

   ```bash
   gh issue create --title "<type>: <title>" --body-file <plan_path>
   ```

3. If Linear:

   ```bash
   linear issue create --title "<title>" --description "$(cat <plan_path>)"
   ```

4. If no tracker is configured:
   - Ask which tracker they use using the platform's blocking question tool when available (see Interaction Method)
   - Suggest adding the tracker to `AGENTS.md` for future runs

After issue creation:
- Display the issue URL
- Ask whether to proceed to `/ce:work`
