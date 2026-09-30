#!/bin/zsh
# S5 AI cells on snapshot pp4: candidate :3651, baseline pp4-base :3652.
SP=/private/tmp/claude-501/-Users-zbeyens-git-plate-2/856960db-daa3-4f09-b3dd-781f16665103/scratchpad/s5
OUT=/Users/zbeyens/git/plate-2/docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/proportional/pp4-ai
cd $SP/wt-pp4/apps/www || exit 9
{ date -u +%FT%TZ; sysctl -n vm.loadavg; } > $OUT/matrix-started.txt
S5_BENCH=1 S5_OUT=$OUT S5_BASELINE_URL=http://localhost:3652 PLAYWRIGHT_BASE_URL=http://localhost:3651 \
  S5_CELLS=ai-rich,ai-cjk S5_PROFILE=$SP/pp4-prof S5_SAVE_TEXT=$SP/pp4-text S5_SAVE_TRACE=$SP/pp4-trace \
  nice -n 5 pnpm test:www-browser:chromium tests/browser/markdown-streaming-contract.spec.ts -g "S5 acceptance" > $OUT/matrix-run.log 2>&1
echo "exit $?" >> $OUT/matrix-run.log
date -u +%FT%TZ >> $OUT/matrix-started.txt
