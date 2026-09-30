#!/bin/zsh
# S5 static and AI cells on snapshot pp3: candidate :3631, baseline pp3-base :3632.
SP=/private/tmp/claude-501/-Users-zbeyens-git-plate-2/856960db-daa3-4f09-b3dd-781f16665103/scratchpad/s5
OUT=$1
cd $SP/wt-pp3/apps/www || exit 9
mkdir -p $OUT
{ date -u +%FT%TZ; sysctl -n vm.loadavg; } > $OUT/matrix-started.txt
S5_BENCH=1 S5_OUT=$OUT S5_BASELINE_URL=http://localhost:3632 PLAYWRIGHT_BASE_URL=http://localhost:3631 \
  S5_CELLS=static-,ai-rich,ai-cjk S5_PROFILE=$SP/pp3-prof S5_SAVE_TEXT=$SP/pp3-text S5_SAVE_TRACE=$SP/pp3-trace \
  nice -n 5 pnpm test:www-browser:chromium tests/browser/markdown-streaming-contract.spec.ts -g "S5 acceptance" > $OUT/matrix-run.log 2>&1
echo "exit $?" >> $OUT/matrix-run.log
date -u +%FT%TZ >> $OUT/matrix-started.txt
