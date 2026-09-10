## Record A Diff Baseline

For a diff-gated workflow, capture the baseline before the first file mutation,
including plan creation:

```bash
node .agents/skills/walkthrough/scripts/diff-baseline.mjs capture \
  --output tmp/walkthrough/<slug>/baseline.json
```

At closeout, compare the final checkout with that baseline:

```bash
node .agents/skills/walkthrough/scripts/diff-baseline.mjs compare \
  --baseline tmp/walkthrough/<slug>/baseline.json \
  --output tmp/walkthrough/<slug>/diff-receipt.json
```

Use `producedFileDiff` for the file-diff gate. Use `changedPaths` and the final
diff to decide whether UI or rendered output changed. The receipt detects
committed clean-tree changes, tracked working changes, executable-bit changes,
symlink changes, and untracked files without `git status`.

Keep receipts local. Do not publish file hashes. If an older packet has no
baseline, reconstruct it from the recorded starting commit or base ref and the
packet's changed-file ledger. Mark the receipt as reconstructed. New packets
must capture the baseline before mutation. The helper excludes its own baseline
and receipt paths from the comparison, but the output directory should still be
ignored by the repo.
