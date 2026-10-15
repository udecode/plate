#!/bin/zsh
cd /Users/zbeyens/git/plate-2
node .agents/pstack/cross.mjs --to codex --model gpt-6.1-sol --effort high --timeout 1800 --prompt-file docs/plans/artifacts/2026-10-15-regression-sweep/lifecycle/key-writer.md > /private/tmp/claude-501/-Users-zbeyens-git-plate-2/ac862676-9124-4cbd-8ab3-5c886b30fb97/scratchpad/sealed-lifecycle/answer.md 2> /private/tmp/claude-501/-Users-zbeyens-git-plate-2/ac862676-9124-4cbd-8ab3-5c886b30fb97/scratchpad/sealed-lifecycle/answer.err
print "exit=$?" > docs/plans/artifacts/2026-10-15-regression-sweep/lifecycle/key.status
