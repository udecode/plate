#!/usr/bin/env node
// Fast landing gate enforcing Antigravity / pstack repository contracts:
// 1. AGENTS.md stays under AGY_RULE_SAFE_BYTES (before agy's 24 KB silent truncation).
// 2. .agents/pstack/rules/*.md files stay under READ_FILE_MAX_BYTES (single-call read_file).
// 3. .agents/playbooks/*.md and references stay under per-file and total byte ceilings.
// 4. .agents/rules/*.mdc and .agents/skills/*/SKILL.md stay under per-file byte ceilings
//    and skill descriptions stay within AGY_SKILL_DESC_BUDGET.
// 5. .claude/pstack-models.md passes lead.mjs sheetMisses (no pro/flash/flash_lite/sonnet/haiku).
// 6. .agents/hooks.json is valid JSON and every PreToolUse hook returns {"decision":"allow"}
//    for benign calls and guard.mjs returns {"decision":"deny"} for force-pushing next.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { maxEffort, sheetMisses } from '../../.agents/pstack/lead.mjs';

export const AGY_RULE_SAFE_BYTES = 22_500;
export const READ_FILE_MAX_BYTES = 46_080;
export const AGY_SKILL_DESC_BUDGET = 16_000;
export const PLAYBOOK_MAX_BYTES = 14_000;
export const PLAYBOOK_TOTAL_MAX_BYTES = 70_000;
export const RULE_MDC_MAX_BYTES = 14_000;
export const SKILL_MAX_BYTES = 20_000;

const DEFAULT_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));

function runHookScript(root, scriptPath, payload) {
  const full = join(root, scriptPath);
  const run = spawnSync(process.execPath, [full], {
    cwd: root,
    encoding: 'utf-8',
    input: JSON.stringify(payload),
    timeout: 10_000,
  });
  return {
    status: run.status,
    stderr: run.stderr ?? '',
    stdout: (run.stdout ?? '').trim(),
  };
}

export function checkAgentContracts(root = DEFAULT_ROOT) {
  const errors = [];

  const agentsMd = join(root, 'AGENTS.md');
  if (existsSync(agentsMd)) {
    const { size } = statSync(agentsMd);
    if (size > AGY_RULE_SAFE_BYTES) {
      errors.push(
        `AGENTS.md is ${size} bytes (safe cap ${AGY_RULE_SAFE_BYTES}; Antigravity truncates at 24,000 bytes). Move extended prose to docs/development/plate-workflow.md or ustack rule files.`
      );
    }
  }

  const pstackRulesDir = join(root, '.agents/pstack/rules');
  const MULTI_READ_RULES = new Set(['chips.md']);
  if (existsSync(pstackRulesDir)) {
    for (const name of readdirSync(pstackRulesDir)) {
      if (!name.endsWith('.md') || MULTI_READ_RULES.has(name)) continue;
      const { size } = statSync(join(pstackRulesDir, name));
      if (size > READ_FILE_MAX_BYTES) {
        errors.push(
          `.agents/pstack/rules/${name} is ${size} bytes (exceeds ${READ_FILE_MAX_BYTES}-byte single-read limit).`
        );
      }
    }
  }

  const playbooksDir = join(root, '.agents/playbooks');
  if (existsSync(playbooksDir)) {
    let totalPlaybookBytes = 0;
    for (const name of readdirSync(playbooksDir).sort()) {
      if (!name.endsWith('.md')) continue;
      const { size } = statSync(join(playbooksDir, name));
      totalPlaybookBytes += size;
      if (size > PLAYBOOK_MAX_BYTES) {
        errors.push(
          `.agents/playbooks/${name} is ${size} bytes (max ${PLAYBOOK_MAX_BYTES}); compress or subtract redundant prose.`
        );
      }
    }
    const playbookRefsDir = join(playbooksDir, 'references');
    if (existsSync(playbookRefsDir)) {
      for (const name of readdirSync(playbookRefsDir).sort()) {
        if (!name.endsWith('.md')) continue;
        totalPlaybookBytes += statSync(join(playbookRefsDir, name)).size;
      }
    }
    if (totalPlaybookBytes > PLAYBOOK_TOTAL_MAX_BYTES) {
      errors.push(
        `.agents/playbooks/*.md and references total ${totalPlaybookBytes} bytes (max ${PLAYBOOK_TOTAL_MAX_BYTES}); subtract before adding.`
      );
    }
  }

  const rulesDir = join(root, '.agents/rules');
  if (existsSync(rulesDir)) {
    for (const name of readdirSync(rulesDir).sort()) {
      if (!name.endsWith('.mdc')) continue;
      const { size } = statSync(join(rulesDir, name));
      if (size > RULE_MDC_MAX_BYTES) {
        errors.push(
          `.agents/rules/${name} is ${size} bytes (max ${RULE_MDC_MAX_BYTES}); compress or move detail to references/.`
        );
      }
    }
  }

  const skillsDir = join(root, '.agents/skills');
  if (existsSync(skillsDir)) {
    const rows = readdirSync(skillsDir)
      .sort()
      .map((name) => {
        const file = join(skillsDir, name, 'SKILL.md');
        if (!existsSync(file)) return null;
        const { size } = statSync(file);
        if (size > SKILL_MAX_BYTES) {
          errors.push(
            `.agents/skills/${name}/SKILL.md is ${size} bytes (max ${SKILL_MAX_BYTES}); keep well below agy's 24 KB truncation cap.`
          );
        }
        const fm =
          readFileSync(file, 'utf-8').match(/^---\n([\s\S]*?)\n---/u)?.[1] ??
          '';
        const desc =
          fm
            .match(/description:\s*([\s\S]*?)(?=\n[a-zA-Z0-9_-]+:|$)/u)?.[1]
            ?.trim() ?? '';
        return { len: desc.length, name };
      })
      .filter(Boolean);
    const total = rows.reduce((sum, item) => sum + item.len, 0);
    if (total > AGY_SKILL_DESC_BUDGET) {
      const top = rows
        .sort((a, b) => b.len - a.len)
        .slice(0, 3)
        .map((item) => `${item.name} (${item.len})`)
        .join(', ');
      errors.push(
        `.agents/skills descriptions total ${total} chars (budget ${AGY_SKILL_DESC_BUDGET}; largest: ${top}). Trim .agents/rules/*.mdc or ustack SKILL.md descriptions.`
      );
    }
  }

  const modelsSheetPath = join(root, '.claude/pstack-models.md');
  if (existsSync(modelsSheetPath)) {
    const text = readFileSync(modelsSheetPath, 'utf-8');
    const misses = sheetMisses(text, maxEffort(root));
    for (const miss of misses) {
      errors.push(`.claude/pstack-models.md: ${miss}`);
    }
  }

  const hooksPath = join(root, '.agents/hooks.json');
  if (!existsSync(hooksPath)) {
    errors.push('.agents/hooks.json is missing.');
  } else {
    let hooks;
    try {
      hooks = JSON.parse(readFileSync(hooksPath, 'utf-8'));
    } catch (error) {
      errors.push(`.agents/hooks.json is not valid JSON: ${error.message}`);
    }
    if (hooks && typeof hooks === 'object') {
      const group = hooks['plate-hooks'] ?? Object.values(hooks)[0];
      for (const event of [
        'SessionStart',
        'PreToolUse',
        'PreInvocation',
        'Stop',
      ]) {
        if (!Array.isArray(group?.[event]) || group[event].length === 0) {
          errors.push(`.agents/hooks.json is missing ${event} handlers.`);
        }
      }

      const preToolChecks = [
        {
          allowPayload: {
            conversationId: 'agent-contracts-probe',
            cwd: root,
            hookEventName: 'PreToolUse',
            toolCall: {
              args: { CommandLine: 'git status' },
              id: 'probe-allow-1',
              name: 'run_command',
            },
          },
          denyPayload: {
            conversationId: 'agent-contracts-probe',
            cwd: root,
            hookEventName: 'PreToolUse',
            toolCall: {
              args: { CommandLine: 'git push --force origin next' },
              id: 'probe-deny-1',
              name: 'run_command',
            },
          },
          script: '.agents/pstack/guard.mjs',
        },
        {
          allowPayload: {
            conversationId: 'agent-contracts-probe',
            cwd: root,
            hookEventName: 'PreToolUse',
            toolCall: {
              args: { CommandLine: 'git status' },
              id: 'probe-allow-2',
              name: 'run_command',
            },
          },
          script: 'tooling/scripts/type-probe-guard.mjs',
        },
        {
          allowPayload: {
            conversationId: 'agent-contracts-probe',
            cwd: root,
            hookEventName: 'PreToolUse',
            toolCall: {
              args: { Path: join(root, 'AGENTS.md') },
              id: 'probe-allow-3',
              name: 'read_file',
            },
          },
          script: 'tooling/scripts/read-budget.mjs',
        },
      ];

      for (const { allowPayload, denyPayload, script } of preToolChecks) {
        if (!existsSync(join(root, script))) continue;
        const allowed = runHookScript(root, script, allowPayload);
        let allowJson;
        try {
          allowJson = JSON.parse(allowed.stdout);
        } catch {
          allowJson = null;
        }
        if (allowed.status !== 0 || allowJson?.decision !== 'allow') {
          errors.push(
            `${script} PreToolUse must output {"decision":"allow"} for benign agy calls (got status=${allowed.status}, stdout=${JSON.stringify(allowed.stdout)}).`
          );
        }
        if (denyPayload) {
          const denied = runHookScript(root, script, denyPayload);
          let denyJson;
          try {
            denyJson = JSON.parse(denied.stdout);
          } catch {
            denyJson = null;
          }
          if (denied.status !== 0 || denyJson?.decision !== 'deny') {
            errors.push(
              `${script} PreToolUse must output {"decision":"deny"} for force-pushing next (got status=${denied.status}, stdout=${JSON.stringify(denied.stdout)}).`
            );
          }
        }
      }
    }
  }

  return errors;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkAgentContracts();
  if (errors.length > 0) {
    console.error('agent-contracts check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('ok: agent contracts verified.');
}
