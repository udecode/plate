import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const macOnly = process.platform !== 'darwin' && 'the fseventsd check runs only on macOS';

const runHookInEmptyHome = ({ fseventsdKb, watchdogLoaded }) => {
  const emptyHome = mkdtempSync(join(tmpdir(), 'doctor-'));
  const fakeBin = join(emptyHome, 'bin');
  mkdirSync(fakeBin);
  const fseventsd = '/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/FSEvents.framework/Versions/A/Support/fseventsd';
  writeFileSync(join(fakeBin, 'ps'), `#!/bin/sh\necho "  4096 /usr/libexec/logd"\necho "${fseventsdKb} ${fseventsd}"\n`, { mode: 0o755 });
  writeFileSync(join(fakeBin, 'launchctl'), `#!/bin/sh\nexit ${watchdogLoaded ? 0 : 113}\n`, { mode: 0o755 });
  return spawnSync(process.execPath, [join(import.meta.dirname, 'doctor.mjs'), '--hook'], {
    cwd: import.meta.dirname,
    encoding: 'utf8',
    env: { ...process.env, HOME: emptyHome, PATH: `${fakeBin}:${process.env.PATH}` },
    input: '{}',
  }).stdout;
};

test('a leaking fseventsd with no watchdog tells the human to install the watchdog', { skip: macOnly }, () => {
  assert.match(runHookInEmptyHome({ fseventsdKb: 18_874_368, watchdogLoaded: false }), /fix: a human runs .*sudo zsh ~\/\.claude\/skills\/mac-watchdog\/scripts\/install-fseventsd\.sh/u);
});

test('fseventsd under 1 GB prints nothing', { skip: macOnly }, () => {
  assert.equal(runHookInEmptyHome({ fseventsdKb: 1_000_000, watchdogLoaded: false }), '');
});

test('a leaking fseventsd prints nothing while the watchdog job is loaded', { skip: macOnly }, () => {
  assert.equal(runHookInEmptyHome({ fseventsdKb: 18_874_368, watchdogLoaded: true }), '');
});

test('Antigravity doctor flags missing skills.json and isolated T3 profile mcp_config.json', () => {
  const fakeHome = mkdtempSync(join(tmpdir(), 'doctor-agy-'));
  mkdirSync(join(fakeHome, '.agents/skills'), { recursive: true });
  mkdirSync(join(fakeHome, '.gemini/config'), { recursive: true });
  writeFileSync(join(fakeHome, '.gemini/config/mcp_config.json'), '{"mcpServers":{"playwright":{"command":"npx"}}}\n');
  mkdirSync(join(fakeHome, '.t3/userdata/providers/antigravity/abc123profile/config'), { recursive: true });
  writeFileSync(join(fakeHome, '.t3/userdata/providers/antigravity/abc123profile/config/mcp_config.json'), '');

  const out = spawnSync(process.execPath, [join(import.meta.dirname, 'doctor.mjs'), '--hook'], {
    cwd: import.meta.dirname,
    encoding: 'utf8',
    env: { ...process.env, HOME: fakeHome },
    input: '{}',
  }).stdout;

  assert.match(out, /skills\.json/u);
  assert.match(out, /isolated\/empty mcp_config\.json/u);
});

test('Antigravity doctor passes when skills.json, plugins, and T3 profile mcp_config.json are configured', () => {
  const fakeHome = mkdtempSync(join(tmpdir(), 'doctor-agy-ok-'));
  mkdirSync(join(fakeHome, '.agents/skills'), { recursive: true });
  mkdirSync(join(fakeHome, '.gemini/config/plugins/pstack/.antigravity-plugin'), { recursive: true });
  writeFileSync(join(fakeHome, '.gemini/config/plugins/pstack/.antigravity-plugin/plugin.json'), '{"name":"pstack","version":"0.9.145"}\n');
  writeFileSync(join(fakeHome, '.gemini/config/skills.json'), '{"entries":[{"path":"~/.agents/skills"}]}\n');
  writeFileSync(join(fakeHome, '.gemini/config/mcp_config.json'), '{"mcpServers":{"playwright":{"command":"npx"}}}\n');
  mkdirSync(join(fakeHome, '.t3/userdata/providers/antigravity/abc123profile/config/plugins/pstack'), { recursive: true });
  writeFileSync(join(fakeHome, '.t3/userdata/providers/antigravity/abc123profile/config/mcp_config.json'), '{"mcpServers":{"playwright":{"command":"npx"}}}\n');

  const out = spawnSync(process.execPath, [join(import.meta.dirname, 'doctor.mjs'), '--hook'], {
    cwd: import.meta.dirname,
    encoding: 'utf8',
    env: { ...process.env, HOME: fakeHome },
    input: '{}',
  }).stdout;

  assert.doesNotMatch(out, /Antigravity|mcp_config\.json|skills\.json|plugins/u);
});
