#!/bin/zsh
# Plants two issue-tagged tests in a detached worktree and asks kb for each tag.
# A Plite browser test should list as gated; a www browser spec as manual.
set -e
set -o pipefail
W=/Users/zbeyens/git/plate-2-kb-probe
cd /Users/zbeyens/git/plate-2
git worktree add --detach $W HEAD >/dev/null
ln -s /Users/zbeyens/git/plate-2/node_modules $W/node_modules
cd $W
cat > apps/plite/tests/plite-browser/donor/examples/zz-kb-probe.test.ts <<'EOF'
import { expect, test } from '@playwright/test';

test('probe keeps the caret in the title [plate#99991]', async ({ page }) => {
  await page.goto('/examples/plite/forced-layout');
  expect(1).toBe(1);
});
EOF
cat > apps/www/tests/browser/zz-kb-probe.spec.ts <<'EOF'
import { expect, test } from '@playwright/test';

test('probe keeps undo in the toolbar demo [plate#99992]', async ({ page }) => {
  await page.goto('/docs/examples/hovering-toolbar');
  expect(1).toBe(1);
});
EOF
git add -N apps/plite/tests/plite-browser/donor/examples/zz-kb-probe.test.ts apps/www/tests/browser/zz-kb-probe.spec.ts
print '== plite tag'
node tooling/scripts/knowledge/kb.mjs 'plate#99991' | sed -n '1,12p'
print '== www tag'
node tooling/scripts/knowledge/kb.mjs 'plate#99992' | sed -n '1,12p'
print '== control: untagged issue'
node tooling/scripts/knowledge/kb.mjs 'plate#99993' | sed -n '1,8p'
