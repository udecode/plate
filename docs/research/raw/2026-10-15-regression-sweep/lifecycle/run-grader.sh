#!/bin/zsh
# Usage: run-grader.sh <trial dir>; the blind grader reads grader-filled.md, which names the sealed key and the blind copies.
cd /Users/zbeyens/git/plate-2
T=docs/plans/artifacts/2026-10-15-regression-sweep/$1
node .agents/pstack/cross.mjs --to codex --model gpt-6-astra --effort xhigh --timeout 2700 --prompt-file $T/grader-filled.md > $T/grade-out.md 2> $T/grade-err.txt
code=$?
print "seat: gpt-6-astra @xhigh" >> $T/grade-out.md
print "exit=$code" >> $T/grade-out.md
print "exit=$code" > $T/grade.status
