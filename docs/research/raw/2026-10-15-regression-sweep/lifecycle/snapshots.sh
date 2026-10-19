#!/bin/zsh
# Clones the history-free snapshot once per arm and puts only that arm's inputs inside it.
set -e
S=/private/tmp/claude-501/-Users-zbeyens-git-plate-2/ac862676-9124-4cbd-8ab3-5c886b30fb97/scratchpad
for arm in P V S C; do
  test -e $S/snap-$arm && { print "snap-$arm exists"; exit 1 }
  cp -cR $S/snap-r $S/snap-$arm
done
for arm in P V S; do cp -R $S/round-data $S/snap-$arm/round-data; done
cp -R $S/qa-rounds $S/snap-P/qa-rounds
cp -R $S/qa-notes $S/snap-S/qa-notes
cp -R $S/qa-pass $S/snap-C/qa-pass
for arm in P V S C; do print "snap-$arm: $(ls -d $S/snap-$arm/round-data $S/snap-$arm/qa-* 2>/dev/null | xargs -n1 basename | tr '\n' ' ')"; done
