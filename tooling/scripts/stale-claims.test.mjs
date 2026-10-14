import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { hookOutput, staleClaims } from './stale-claims.mjs';

const OLD =
  'Links the selected text when the selection starts or ends inside a link or covers whole links.';
const NEW =
  "Links the selected text when the selection crosses a link's edge or covers whole links.";

const repository = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'stale-claims-'));
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), `${text}\n`);
  };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf-8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const commit = () => {
    git('add', '-A');
    git(
      '-c',
      'user.name=t',
      '-c',
      'user.email=t@t',
      'commit',
      '-q',
      '-m',
      'step'
    );
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q');
  return { commit, root, write };
};

test('a doc that keeps wording another doc narrowed is listed, and its fix clears it', () => {
  const { commit, root, write } = repository();
  try {
    write('.changeset/link.md', `- ${OLD}\n- Other.\n- ${OLD}`);
    write('docs/editor-behavior/spec.md', `note: ${OLD}`);
    write('.changeset/released.md', `- ${OLD}`);
    const base = commit();
    write('.changeset/link.md', `- ${NEW}\n- Other.\n- ${OLD}`);
    spawnSync('git', ['rm', '-q', '.changeset/released.md'], { cwd: root });
    const narrowed = commit();
    write('.changeset/link.md', `- ${NEW}\n- Other.`);
    write('docs/editor-behavior/spec.md', `note: ${NEW}`);
    const fixed = commit();

    assert.deepEqual(
      staleClaims({ base, cwd: root, head: narrowed }).map(
        (hit) => `${hit.file}:${hit.line} from ${hit.from}`
      ),
      ['docs/editor-behavior/spec.md:1 from .changeset/link.md'],
      'only the other doc is listed: not the narrowed doc itself, and not a deleted changeset'
    );
    assert.deepEqual(
      staleClaims({ base: narrowed, cwd: root, head: fixed }),
      []
    );
    assert.throws(
      () => staleClaims({ base: 'no-such-commit', cwd: root, head: fixed }),
      /cannot resolve no-such-commit/
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test('the freeze hook adds the stale lines between the parent and the frozen tree', () => {
  const { commit, root, write } = repository();
  try {
    write('.changeset/link.md', `- ${OLD}`);
    write('content/docs/link.mdx', OLD);
    const parent = commit();
    write('.changeset/link.md', `- ${NEW}`);
    const frozen = commit();
    const payload = (command) => ({
      cwd: root,
      hook_event_name: 'PostToolUse',
      tool_input: { command },
      tool_name: 'Bash',
      tool_response: { stdout: `frozen ${frozen}\n` },
    });

    const output = hookOutput(
      payload(
        `F=$(node .agents/pstack/freeze.mjs --dir d --parent ${parent} a)`
      )
    );
    assert.equal(output?.hookSpecificOutput.hookEventName, 'PostToolUse');
    assert.match(
      output.hookSpecificOutput.additionalContext,
      /content\/docs\/link\.mdx:1: still says ".*", which this change removed from \.changeset\/link\.md/
    );
    assert.equal(
      hookOutput(payload('node .agents/pstack/freeze.mjs --dir d a')),
      null
    );
    assert.equal(hookOutput(payload(`git diff ${parent}`)), null);
    assert.equal(
      hookOutput({
        ...payload(
          `node .agents/pstack/freeze.mjs --dir d --parent ${parent} a`
        ),
        tool_response: { stdout: '' },
      }),
      null,
      'without the frozen commit it stays silent instead of reading the working tree'
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
