#!/bin/zsh
# Usage: run-arm.sh <trial dir> <arm> [snapshot]; runs from a history-free snapshot so the arm reads no plan or trial files.
# A Claude arm in plan mode reads only inside its cwd, so each arm's inputs sit inside its own snapshot.
T=/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-regression-sweep/$1
cd /private/tmp/claude-501/-Users-zbeyens-git-plate-2/ac862676-9124-4cbd-8ab3-5c886b30fb97/scratchpad/${3:-snap-r}
node /Users/zbeyens/git/plate-2/.agents/pstack/cross.mjs --to claude --model claude-opus-5-5 --effort high --timeout 2700 --prompt-file $T/arm-$2-prompt.md > $T/arm-$2-out.md 2> $T/arm-$2-err.txt
code=$?
print "exit=$code" >> $T/arm-$2-out.md
print "exit=$code" > $T/arm-$2.status
