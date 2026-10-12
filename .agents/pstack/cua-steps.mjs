#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BROWSER_SERVER } from './codex-browser.mjs';

const FORBIDDEN_CODE = [
  /\b(getApp|listApps|listTabs|getTab|claimTab|getBrowser|WebSocket|child_process|XMLHttpRequest)\b/,
  /\btabs\s*\.\s*list\b/,
  /\.\s*(evaluate|evaluateHandle|addInitScript|exposeFunction|route|request)\b/,
  /\b(fetch|require|import)\s*\(/,
  /\bnodeRepl\s*\.\s*rpc\b/,
  /\bnode:/,
  /\bprocess\s*\./,
];

const squash = (text) => String(text).replace(/\s+/g, ' ').trim();
const surface = (item) => item.result?._meta?.['codex/toolSurface'];
const resultText = (item) => (item.result?.content ?? []).filter((part) => part.type === 'text').map((part) => part.text).join('\n');

function stepsFrom(answer) {
  const body = answer?.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? answer;
  const start = body?.indexOf('[');
  if (start == null || start < 0) return undefined;
  try {
    const steps = JSON.parse(body.slice(start, body.lastIndexOf(']') + 1));
    return Array.isArray(steps) ? steps : undefined;
  } catch {
    return undefined;
  }
}

export function checkSteps(eventsText, { hosts, instance }) {
  const events = eventsText
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const items = events.filter((event) => event.type === 'item.completed').map((event) => event.item);
  const calls = items.filter((item) => item.type === 'mcp_tool_call' && item.server === BROWSER_SERVER);
  const voids = [];
  for (const item of items) {
    if (item.type === 'agent_message' || item.type === 'reasoning' || calls.includes(item)) continue;
    voids.push(`ran a ${item.type}${item.server ? ` on ${item.server}` : ''} item`);
  }
  if (events.some((event) => event.type === 'turn.failed' || event.type === 'error')) voids.push('the turn failed');
  for (const call of calls) {
    const code = String(call.arguments?.code ?? '');
    if (FORBIDDEN_CODE.some((pattern) => pattern.test(code))) voids.push(`ran forbidden code: ${squash(code).slice(0, 120)}`);
  }
  const instances = new Set(calls.map((call) => surface(call)?.extensionInstanceId).filter(Boolean));
  if (instances.size > 1 || (instance && [...instances].some((id) => id !== instance))) voids.push(`drove browser instance ${[...instances].join(', ')}`);
  const runtimePages = calls.flatMap((call) => [
    ...[...resultText(call).matchAll(/Browser tab: (\d+), Title: ".*?", URL: "([^"]+)"/g)].map(([, tab, url]) => ({ tab, url })),
    ...(call.result?._meta?.browser_use?.url ? [{ url: call.result._meta.browser_use.url }] : []),
  ]);
  const ownTabs = new Set(calls.flatMap((call) => surface(call)?.openTabIds ?? []).map(String));
  for (const { tab, url } of runtimePages) {
    if (tab && !ownTabs.has(tab)) voids.push(`read tab ${tab}, which the run did not open`);
    if (!hosts.includes(new URL(url).hostname)) voids.push(`reached ${new URL(url).hostname}`);
  }
  const answer = items.filter((item) => item.type === 'agent_message').at(-1)?.text;
  const steps = stepsFrom(answer);
  if (!steps) return [{ step: '*', result: 'UNPROVED', reason: 'the answer holds no JSON step list' }];
  const runtimeUrls = new Set(runtimePages.map((page) => page.url));
  return steps.map((step) => {
    if (step.result === 'FAIL') return step;
    if (step.result !== 'PASS') return { ...step, result: 'UNPROVED', reason: step.reason ?? `reported ${step.result}` };
    if (voids.length) return { ...step, result: 'UNPROVED', reason: [...new Set(voids)].join('; ') };
    if (!runtimeUrls.has(step.url)) return { ...step, result: 'UNPROVED', reason: `no page the runtime reported is ${step.url}` };
    if (step.checked == null) return { ...step, result: 'UNPROVED', reason: 'the step names no checked text' };
    const unbacked = [step.checked].flat().find((text) => !calls.some((call) => !resultText(call).startsWith('Error') && squash(resultText(call)).includes(squash(text)) && !squash(call.arguments?.code ?? '').includes(squash(text))));
    if (unbacked != null) return { ...step, result: 'UNPROVED', reason: `no page read shows "${unbacked}"` };
    return step;
  });
}

function main(argv) {
  const hosts = [];
  let instance;
  let events;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--host') hosts.push(argv[++index]);
    else if (argv[index] === '--instance') instance = argv[++index];
    else events = argv[index];
  }
  if (!events || !hosts.length) {
    console.error('Usage: node .agents/pstack/cua-steps.mjs <events file> --host <host> [--host <host>] [--instance <extension instance id>]');
    return 2;
  }
  const steps = checkSteps(readFileSync(events, 'utf8'), { hosts, instance });
  console.info(JSON.stringify(steps, null, 2));
  return steps.every((step) => step.result === 'PASS') ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
