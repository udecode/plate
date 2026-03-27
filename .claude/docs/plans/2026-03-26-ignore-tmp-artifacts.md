# Ignore Tmp Artifacts

## Goal

Stop root-level `tmp*` artifacts from being committed and remove the accidentally committed browser proof PNGs from the current PR branch.

## Checklist

- [in_progress] Inspect current ignore rules and tracked tmp artifacts
- [pending] Add ignore rule for root `tmp*` artifacts
- [pending] Remove tracked tmp PNGs from the branch diff
- [pending] Run the PR gate
- [pending] Commit and push the cleanup

## Findings

- `.gitignore` already ignores `/tmp`, but not root files like `tmp-issue-4900-editor-ai.png`.
- The current branch still tracks `tmp-issue-4900-editor-ai.png` and `tmp-pr-4902-editor-ai.png`.
