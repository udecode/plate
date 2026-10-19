#!/bin/zsh
# Style isolation: one S5 AI cell with baseline = variant A and candidate = variant B or C.
# Usage: run-si.sh <tag> <candidate-port> <cell>
SP=/private/tmp/claude-501/-Users-zbeyens-git-plate-2/856960db-daa3-4f09-b3dd-781f16665103/scratchpad/s5
tag=$1; port=$2; cell=$3
OUT=$SP/si-work/$tag
mkdir -p $OUT
cd $SP/wt-si-a/apps/www || exit 9
{ date -u +%FT%TZ; sysctl -n vm.loadavg; } > $OUT/started.txt
S5_BENCH=1 S5_OUT=$OUT S5_BASELINE_URL=http://localhost:3641 PLAYWRIGHT_BASE_URL=http://localhost:$port \
  S5_CELLS=$cell S5_PAIRS=2 S5_PROFILE=$OUT/prof S5_SAVE_TEXT=$OUT/text S5_SAVE_TRACE=$OUT/trace \
  nice -n 5 pnpm test:www-browser:chromium tests/browser/markdown-streaming-contract.spec.ts -g "S5 acceptance" > $OUT/run.log 2>&1
echo "exit $?" >> $OUT/run.log
date -u +%FT%TZ >> $OUT/started.txt
