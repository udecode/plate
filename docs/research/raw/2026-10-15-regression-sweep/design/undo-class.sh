#!/bin/zsh
# Lists P1 beta examples that wire no history, beside whether the Slate original uses withHistory.
set -o pipefail
B='/Users/zbeyens/git/plate-2/apps/www/src/app/(app)/examples/plite/_examples'
S=/Users/zbeyens/git/slate/site/examples/ts
print "slate $(git -C /Users/zbeyens/git/slate rev-parse --short HEAD)"
missing=0
for n in check-lists code-highlighting custom-placeholder editable-voids embeds forced-layout hovering-toolbar huge-document iframe images inlines markdown-preview markdown-shortcuts mentions paste-html plaintext read-only richtext search-highlighting shadow-dom styling tables; do
  beta=$(grep -c -E 'history|History' "$B/$n.tsx")
  slate=$(grep -c withHistory "$S/$n.tsx")
  if [[ $beta == 0 && $slate != 0 ]]; then
    print "missing $n beta=$beta slate=$slate"
    missing=$((missing + 1))
  fi
done
print "missing-total $missing"
