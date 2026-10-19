#!/bin/zsh
# Differential sweep: one generic keyboard journey on each upstream Slate example and its beta Plite twin.
set -o pipefail
P=${0:A:h}
ENGINE=${1:-chromium}
for ex in check-lists code-highlighting custom-placeholder editable-voids embeds forced-layout hovering-toolbar huge-document iframe images inlines markdown-preview markdown-shortcuts mentions paste-html plaintext read-only richtext search-highlighting shadow-dom styling tables; do
  echo "== $ex"
  node $P/differential-v2.mjs "https://www.slatejs.org/examples/$ex" "https://beta.platejs.org/examples/plite/$ex" "$P/out-v2/$ex" "$ENGINE" 2>&1 | sed 's/^/  /'
done
echo "sweep done"
