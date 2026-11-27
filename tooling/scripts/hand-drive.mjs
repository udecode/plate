#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSources } from './docs-sources.mjs';
import {
  BRANCH,
  entries,
  isSplit,
  objectIds,
  privateGit,
  privatePaths,
  run as runGit,
} from './private-files.mjs';

const { hasComponentDocsPage, registryExampleSlug, sourcePathToDocsRoute } =
  await import('../../apps/www/src/lib/docs-routes.ts');

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const DRIVE_DIR = 'docs/plans/artifacts/drive';
const DESKTOP_MIN_WIDTH = 1200;
const LOOK_PAGE_LIMIT = 6;
const SETTLE_MS = 5000;
const REGISTRY_DIR = 'apps/www/src/registry/';
const SHOWN_ROOTS =
  /^(?:apps\/(?:plite|www)\/|config\/|content\/docs\/|packages\/[^/]+\/src\/.*\.(?:[cm]?[jt]sx?|css|json)$)/;
const NOT_SHOWN =
  /(?:^|\/)(?:__tests__|tests|type-tests)\/|(?:^|\/)\.gitignore$|\.(?:spec|test|slow)\.[cm]?[jt]sx?$|\.md$|(?:^|\/)playwright\.config\.[cm]?[jt]s$|^config\/[^/]*test[^/]*$|^apps\/www\/(?:public\/r|src\/__registry__)\//;
const EDIT_TOOLS = new Set(['Edit', 'MultiEdit', 'NotebookEdit', 'Write']);
const SKIP_WORDS = /^\s*skip drive\b/i;

const git = (cwd, args, input) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
    input,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'ignore'],
  });

const unique = (values) => [...new Set(values)];

const readJsonl = (file) =>
  existsSync(file)
    ? readFileSync(file, 'utf-8')
        .split('\n')
        .flatMap((line) => {
          try {
            return line ? [JSON.parse(line)] : [];
          } catch {
            return [];
          }
        })
    : [];

const appendJsonl = (file, record) => {
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(record)}\n`);
};

const pageOf = (route) => route?.split('#')[0];

const docsRoutes = (item) =>
  (item.meta?.docs ?? [])
    .map((doc) => pageOf(doc.route))
    .filter((route) => route?.startsWith('/docs'));

const primaryPage = (item) =>
  item.type === 'registry:example' || item.type === 'registry:block'
    ? `/blocks/${item.name}`
    : (docsRoutes(item)[0] ??
      (hasComponentDocsPage(item)
        ? `/docs/components/${item.name}`
        : undefined));

const examplesOf = (item, sources) =>
  (item.meta?.examples ?? [])
    .map((name) => sources.items.find((other) => other.name === name))
    .filter(Boolean);

const loaderRoutes = (file, sources) =>
  sources.loaders
    .filter(
      ({ base }) =>
        file === base ||
        file.startsWith(`${base}.`) ||
        file.startsWith(`${base}/`)
    )
    .map(({ route }) => route);

function itemPages(item, sources) {
  const pages = [
    primaryPage(item),
    ...docsRoutes(item),
    ...(item.files ?? []).flatMap((entry) =>
      loaderRoutes(`${REGISTRY_DIR}${entry.path}`, sources)
    ),
  ];

  if (item.type === 'registry:component') {
    if (hasComponentDocsPage(item)) pages.push(`/docs/components/${item.name}`);
    for (const example of examplesOf(item, sources)) {
      pages.push(...itemPages(example, sources));
    }
  }
  pages.push(...(sources.previews.get(item.name) ?? []));
  if (item.type === 'registry:example') {
    pages.push(`/docs/examples/${registryExampleSlug(item.name)}`);
    for (const component of sources.items) {
      if (
        hasComponentDocsPage(component) &&
        component.meta?.examples?.includes(item.name)
      ) {
        pages.push(`/docs/components/${component.name}`);
      }
    }
  }

  return unique(pages.filter((page) => page && !page.startsWith('/cn/')));
}

function itemsShowing(item, items) {
  const found = new Map();
  const queue = [item];

  while (queue.length > 0) {
    const current = queue.shift();
    const next = items.filter(
      (other) =>
        other !== item &&
        !found.has(other.name) &&
        (other.registryDependencies?.includes(`@plate/${current.name}`) ||
          current.meta?.examples?.includes(other.name))
    );
    for (const other of next) {
      found.set(other.name, other);
      queue.push(other);
    }
  }

  return [...found.values()];
}

function filePages(file, sources, routes, currentBlob) {
  const named = routes.get(file);
  if (named && named.blob === currentBlob(file)) {
    return named.none
      ? { kind: 'none' }
      : { kind: 'pages', own: named.pages, reach: [] };
  }
  if (!SHOWN_ROOTS.test(file) || NOT_SHOWN.test(file)) return { kind: 'none' };
  if (currentBlob(file) === null) return { kind: 'unmapped' };
  if (file.startsWith('content/docs/')) {
    if (!file.endsWith('.mdx')) return { kind: 'unmapped' };
    return {
      kind: 'pages',
      own: [sourcePathToDocsRoute(file.slice('content/docs/'.length))],
      reach: [],
    };
  }

  if (file.startsWith(`${REGISTRY_DIR}changelog/`)) {
    return { kind: 'pages', own: ['/docs/releases'], reach: [] };
  }

  let own = [];
  let reach = [];

  if (file.startsWith(REGISTRY_DIR)) {
    const relative = file.slice(REGISTRY_DIR.length);
    // A Chinese demo value loads through getI18nValues on the Chinese pages
    // of the item that lists its English twin.
    const twin = relative.replace(
      /^examples\/values\/cn\//,
      'examples/values/'
    );
    const owners = sources.items.filter((item) =>
      item.files?.some((entry) => entry.path === twin)
    );
    if (twin !== relative) {
      own = unique(owners.flatMap((item) => itemPages(item, sources)))
        .filter((page) => page.startsWith('/docs'))
        .map((page) => `/cn${page}`);
    } else {
      own = unique(owners.flatMap((item) => itemPages(item, sources)));
      reach = unique(
        owners.flatMap((item) =>
          itemsShowing(item, sources.items).map(primaryPage)
        )
      ).filter((page) => page && !own.includes(page));
    }
  }

  own.push(...loaderRoutes(file, sources));

  if (own.length === 0 && reach.length === 0) return { kind: 'unmapped' };

  return { kind: 'pages', own: unique(own), reach };
}

function cellsFor(files, sources, routes, currentBlob) {
  const cells = new Map();
  const unmapped = [];
  const add = (route, variant, file) => {
    const key = `${route} ${variant}`;
    const cell = cells.get(key) ?? { files: [], key, route, variant };
    if (!cell.files.includes(file)) cell.files.push(file);
    cells.set(key, cell);
  };

  for (const file of files) {
    const pages = filePages(file, sources, routes, currentBlob);
    if (pages.kind === 'none') continue;
    if (pages.kind === 'unmapped') {
      unmapped.push({ earlier: routes.get(file), file });
      continue;
    }
    const look =
      pages.own.length + pages.reach.length <= LOOK_PAGE_LIMIT
        ? [...pages.own, ...pages.reach]
        : pages.own.length > 0
          ? pages.own
          : pages.reach.slice(0, 1);

    for (const page of look) add(page, 'desktop', file);
    for (const page of pages.reach) {
      if (!look.includes(page)) add(page, 'load', file);
    }
  }

  return { cells: foldLoadsIntoLooks([...cells.values()]), unmapped };
}

function foldLoadsIntoLooks(cells) {
  const looks = cells.filter((cell) => cell.variant !== 'load');
  const loads = cells.filter((cell) => cell.variant === 'load');
  for (const load of loads) {
    for (const look of looks.filter((cell) => cell.route === load.route)) {
      look.files = unique([...look.files, ...load.files]);
    }
  }
  return [
    ...looks,
    ...loads.filter((load) => !looks.some((cell) => cell.route === load.route)),
  ];
}

const showsDesktop = (visit) =>
  visit.theme === 'light' && visit.width >= DESKTOP_MIN_WIDTH;

const errorsWinTies = (a, b) => a.errors.length - b.errors.length;

const pagePath = (route) => {
  try {
    return decodeURI(route).replace(/\/$/, '');
  } catch {
    return route.replace(/\/$/, '');
  }
};

function judge(cells, { lastWrite, visits }) {
  return cells.map((cell) => {
    const edited = Math.max(...cell.files.map(lastWrite));
    const fresh = (visit) => visit.rendered >= edited + SETTLE_MS;
    const failedAfterEdit = (visit) =>
      visit.errors.length > 0 && Date.parse(visit.at) > edited;
    const counts = (visit) => fresh(visit) || failedAfterEdit(visit);
    const onPage = (visit) => pagePath(visit.path) === pagePath(cell.route);

    if (cell.variant === 'load') {
      const counted = visits.filter((each) => onPage(each) && counts(each));
      const visit =
        counted.findLast((each) => !each.webdriver) ?? counted.at(-1);
      if (!visit) return { ...cell, state: 'open' };
      return visit.errors.length > 0
        ? { ...cell, detail: visit.errors[0], state: 'error' }
        : { ...cell, state: 'covered' };
    }

    const matching = visits.filter(
      (visit) => !visit.frame && onPage(visit) && showsDesktop(visit)
    );
    const handDriven = matching.filter((visit) => !visit.webdriver);
    const failsOrShowsDesktop = (visit) =>
      visit.errors.length > 0 || showsDesktop(visit);
    const current = visits.findLast(
      (visit) =>
        !visit.frame &&
        !visit.webdriver &&
        onPage(visit) &&
        counts(visit) &&
        failsOrShowsDesktop(visit)
    );

    if (current) {
      return current.errors.length > 0
        ? { ...cell, detail: current.errors[0], state: 'error' }
        : { ...cell, state: 'covered' };
    }
    const missed = visits.findLast(
      (visit) =>
        !visit.frame && !visit.webdriver && onPage(visit) && counts(visit)
    );
    if (missed) {
      return {
        ...cell,
        detail: `the latest fresh visit showed the page ${missed.width} px wide in ${missed.theme}; reload it in light at least ${DESKTOP_MIN_WIDTH} px wide, such as a 1280x900 tab`,
        state: 'open',
      };
    }
    if (handDriven.length > 0) {
      const gap = Math.round(handDriven.at(-1).rendered - edited);
      return {
        ...cell,
        detail: Number.isNaN(gap)
          ? 'the visit has no render time; reload the page'
          : `the page rendered ${Math.abs(gap)} ms ${gap < 0 ? 'before' : 'after'} the last edit to its files; reload it ${SETTLE_MS / 1000} s after the edit`,
        state: 'stale',
      };
    }
    if (matching.length > 0) {
      return { ...cell, detail: 'only a webdriver visit', state: 'open' };
    }
    return { ...cell, state: 'open' };
  });
}

function blobReader(root) {
  const blobs = new Map();
  return (file) => {
    if (!blobs.has(file)) {
      blobs.set(
        file,
        existsSync(path.join(root, file))
          ? git(root, ['hash-object', '--', file]).trim()
          : null
      );
    }
    return blobs.get(file);
  };
}

const lastWriteReader = (root, routes) => (file) => {
  const full = path.join(root, file);
  return existsSync(full)
    ? statSync(full).mtimeMs
    : Date.parse(routes.get(file)?.at);
};

const readRoutes = (dir) =>
  new Map(
    readJsonl(path.join(dir, 'routes.jsonl')).map((record) => [
      record.file,
      record,
    ])
  );

function judgeFiles(files, { dir, root }) {
  const routes = readRoutes(dir);
  const { cells, unmapped } = cellsFor(
    files,
    readSources(root),
    routes,
    blobReader(root)
  );
  const states = judge(cells, {
    lastWrite: lastWriteReader(root, routes),
    visits: readJsonl(path.join(dir, 'visits.jsonl')).sort(
      (a, b) =>
        (a.sent ?? Date.parse(a.at)) - (b.sent ?? Date.parse(b.at)) ||
        errorsWinTies(a, b)
    ),
  });
  return { states, unmapped };
}

function report({ states, unmapped }) {
  const lines = states.map(
    (cell) =>
      `${cell.state.padEnd(7)} ${cell.key}${cell.detail ? `  (${cell.detail})` : ''}`
  );
  for (const { earlier, file } of unmapped) {
    lines.push(
      earlier
        ? `unmapped ${file}  (its route names an earlier version of the file; name its pages again: hand-drive.mjs route ${file} ${earlier.none ? `--none ${JSON.stringify(earlier.none)}` : earlier.pages.join(' ')})`
        : `unmapped ${file}  (name its pages: hand-drive.mjs route ${file} <page...>, or --none <reason>)`
    );
  }
  return lines;
}

const AGY_EDIT_TOOLS = new Set(['edit_file', 'write_file']);
const AGY_USER_REQUEST = /<USER_REQUEST>\s*([\s\S]*?)\s*<\/USER_REQUEST>/u;
const ACTIVE_WORK_STATES = new Set(['working', 'waiting_for_children']);
const ACTIVE_TASK_STATUSES = new Set([
  'pending',
  'queued',
  'running',
  'starting',
]);
const DELEGATE_TOOL = /(?:^|__|_|\/)delegate_task$/u;
const STATUS_TOOL = /(?:^|__|_|\/)task_status$/u;
const CANCEL_TOOL = /(?:^|__|_|\/)task_cancel$/u;
const DELEGATE_CMD = /\b(?:delegate_task|task_status|task_cancel)\b/u;
const SUBAGENT_CREATED = /Created the following subagent:\s*(\{[\s\S]*\})/u;

const agyString = (value) => {
  if (typeof value !== 'string') return '';
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : value;
  } catch {
    return value;
  }
};

const delegationToolKind = (name) => {
  if (typeof name !== 'string') return null;
  if (DELEGATE_TOOL.test(name)) return 'delegate';
  if (STATUS_TOOL.test(name)) return 'status';
  if (CANCEL_TOOL.test(name)) return 'cancel';
  return null;
};

const parseJsonObject = (text) => {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const tryParse = (candidate) => {
    try {
      const value = JSON.parse(candidate);
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  };
  const direct = tryParse(trimmed);
  if (direct) return direct;
  const lastLine = trimmed.split('\n').findLast((line) => line.trim());
  return lastLine?.trim().startsWith('{') ? tryParse(lastLine.trim()) : null;
};

const extractTaskPayload = (raw) => {
  const fromObject = (obj) => {
    if (!obj || typeof obj !== 'object' || obj.isError === true) return null;
    if (obj.structuredContent && typeof obj.structuredContent === 'object') {
      return obj.structuredContent;
    }
    if (typeof obj.taskId === 'string') return obj;
    if (Array.isArray(obj.content)) {
      for (const block of obj.content) {
        if (block?.type === 'text') {
          const inner = fromObject(parseJsonObject(block.text));
          if (inner) return inner;
        }
      }
    }
    return null;
  };
  if (typeof raw === 'string') return fromObject(parseJsonObject(raw));
  if (Array.isArray(raw)) {
    for (const block of raw) {
      if (block?.type === 'text') {
        const inner = fromObject(parseJsonObject(block.text));
        if (inner) return inner;
      }
    }
    return null;
  }
  return fromObject(raw);
};

const applyTaskState = (pendingDelegates, payload, kind) => {
  if (typeof payload?.taskId !== 'string' || !payload.taskId) return;
  if (kind === 'cancel') {
    pendingDelegates.delete(payload.taskId);
    return;
  }
  const active =
    typeof payload.workState === 'string'
      ? ACTIVE_WORK_STATES.has(payload.workState)
      : typeof payload.status === 'string' &&
        ACTIVE_TASK_STATUSES.has(payload.status);
  if (active) {
    pendingDelegates.set(
      payload.taskId,
      typeof payload.childThreadId === 'string' ? payload.childThreadId : null
    );
  } else {
    pendingDelegates.delete(payload.taskId);
  }
};

const clearMentionedDelegates = (pendingDelegates, text) => {
  if (!text || pendingDelegates.size === 0) return;
  for (const [taskId, childThreadId] of pendingDelegates) {
    if (
      text.includes(taskId) ||
      (childThreadId && text.includes(childThreadId))
    ) {
      pendingDelegates.delete(taskId);
    }
  }
};

const agyGenericBody = (content) => {
  const marker = 'Command output:\n';
  const at = content.indexOf(marker);
  if (at !== -1) return content.slice(at + marker.length);
  return content
    .replace(/^(?:(?:Created|Completed) At:.*\r?\n)+/u, '')
    .trimStart();
};

const agyList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function analyzeTranscript(transcript, root) {
  let files = new Set();
  const pendingDelegates = new Map();
  const pendingSubagents = new Set();
  const claudeCalls = new Map();
  const codexCalls = new Map();
  let agyTurn = { delegateKind: null, subagent: false };

  for (const line of transcript.split('\n')) {
    if (!line) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }
    const payload =
      record.type === 'response_item' ? record.payload : undefined;
    const change =
      record.type === 'event_msg' && record.payload?.type === 'item_completed'
        ? record.payload.item
        : undefined;

    if (record.type === 'assistant' && Array.isArray(record.message?.content)) {
      for (const block of record.message.content) {
        if (block.type !== 'tool_use') continue;
        if (EDIT_TOOLS.has(block.name)) {
          files.add(block.input?.file_path ?? block.input?.notebook_path);
        }
        const kind = delegationToolKind(block.name);
        if (kind) {
          if (block.id) claudeCalls.set(block.id, kind);
          if (kind === 'cancel' && typeof block.input?.taskId === 'string') {
            pendingDelegates.delete(block.input.taskId);
          }
        }
      }
    } else if (record.type === 'PLANNER_RESPONSE') {
      agyTurn = { delegateKind: null, subagent: false };
      for (const call of Array.isArray(record.tool_calls)
        ? record.tool_calls
        : []) {
        if (AGY_EDIT_TOOLS.has(call?.name)) {
          files.add(agyString(call.args?.Path));
        } else if (call?.name === 'invoke_subagent') {
          agyTurn.subagent = true;
        } else if (call?.name === 'manage_subagents') {
          const action = agyString(call.args?.Action);
          if (action === 'kill_all') {
            pendingSubagents.clear();
          } else if (action === 'kill') {
            for (const id of agyList(call.args?.ConversationIds)) {
              pendingSubagents.delete(id);
            }
          }
        } else if (call?.name === 'call_mcp_tool') {
          const kind = delegationToolKind(agyString(call.args?.ToolName));
          if (kind) {
            agyTurn.delegateKind = kind;
            if (kind === 'cancel') {
              const args = parseJsonObject(agyString(call.args?.Arguments));
              if (typeof args?.taskId === 'string') {
                pendingDelegates.delete(args.taskId);
              }
            }
          }
        } else if (call?.name === 'run_command') {
          const cmd = agyString(call.args?.CommandLine);
          if (DELEGATE_CMD.test(cmd)) {
            agyTurn.delegateKind =
              cmd.includes('task_cancel') && !cmd.includes('delegate_task')
                ? 'cancel'
                : 'delegate';
          }
        } else {
          const kind = delegationToolKind(call?.name);
          if (kind) {
            agyTurn.delegateKind = kind;
            if (kind === 'cancel') {
              const id = agyString(call.args?.taskId);
              if (id) pendingDelegates.delete(id);
            }
          }
        }
      }
    } else if (
      record.type === 'GENERIC' &&
      typeof record.content === 'string'
    ) {
      if (agyTurn.subagent) {
        const match = record.content.match(SUBAGENT_CREATED);
        const created = match && parseJsonObject(match[1]);
        if (typeof created?.conversationId === 'string') {
          pendingSubagents.add(created.conversationId);
        }
      }
      if (agyTurn.delegateKind) {
        const body = agyGenericBody(record.content);
        if (!body.startsWith('Showing lines ')) {
          applyTaskState(
            pendingDelegates,
            extractTaskPayload(body),
            agyTurn.delegateKind
          );
        }
      }
    } else if (
      record.type === 'USER_INPUT' &&
      typeof record.content === 'string'
    ) {
      clearMentionedDelegates(pendingDelegates, record.content);
      if (record.source === 'USER_EXPLICIT') {
        const text =
          record.content.match(AGY_USER_REQUEST)?.[1] ?? record.content;
        if (SKIP_WORDS.test(text)) files = new Set();
      }
    } else if (
      record.type === 'SYSTEM_MESSAGE' &&
      typeof record.content === 'string'
    ) {
      clearMentionedDelegates(pendingDelegates, record.content);
      for (const id of pendingSubagents) {
        if (record.content.includes(`sender=${id}`)) {
          pendingSubagents.delete(id);
        }
      }
    } else if (change?.type === 'FileChange' && change.status === 'completed') {
      for (const [file, { move_path: moved }] of Object.entries(
        change.changes ?? {}
      )) {
        files.add(file);
        if (typeof moved === 'string') files.add(moved);
      }
    } else if (
      payload?.type === 'function_call' ||
      payload?.type === 'custom_tool_call' ||
      payload?.type === 'mcp_tool_call'
    ) {
      const kind = delegationToolKind(payload.name);
      if (kind) {
        const callId = payload.call_id ?? payload.id;
        if (callId) codexCalls.set(callId, kind);
        if (kind === 'cancel') {
          const args = parseJsonObject(payload.arguments ?? payload.input);
          if (typeof args?.taskId === 'string') {
            pendingDelegates.delete(args.taskId);
          }
        }
      }
    } else if (
      payload?.type === 'function_call_output' ||
      payload?.type === 'custom_tool_call_output' ||
      payload?.type === 'mcp_tool_call_output'
    ) {
      const callId = payload.call_id ?? payload.id;
      if (callId && codexCalls.has(callId)) {
        applyTaskState(
          pendingDelegates,
          extractTaskPayload(payload.output ?? payload.result),
          codexCalls.get(callId)
        );
      }
    } else {
      const message =
        record.type === 'user'
          ? record.message
          : payload?.role === 'user'
            ? payload
            : null;
      const blocks =
        typeof message?.content === 'string'
          ? [{ text: message.content, type: 'text' }]
          : Array.isArray(message?.content)
            ? message.content
            : [];
      for (const block of blocks) {
        if (
          block.type === 'tool_result' &&
          !block.is_error &&
          claudeCalls.has(block.tool_use_id)
        ) {
          applyTaskState(
            pendingDelegates,
            extractTaskPayload(block.content),
            claudeCalls.get(block.tool_use_id)
          );
        } else if (
          (block.type === 'text' || block.type === 'input_text') &&
          typeof block.text === 'string'
        ) {
          clearMentionedDelegates(pendingDelegates, block.text);
          if (SKIP_WORDS.test(block.text)) files = new Set();
        }
      }
    }
  }

  return {
    files: [...files]
      .filter(Boolean)
      .map((file) => path.relative(root, path.resolve(root, file)))
      .filter((file) => !file.startsWith('..') && !path.isAbsolute(file))
      .map((file) => file.split(path.sep).join('/')),
    pendingChildTasks: pendingDelegates.size > 0 || pendingSubagents.size > 0,
  };
}

function upstreamBranch(root) {
  const configPath = path.join(root, '.agents/pstack.json');
  if (!existsSync(configPath)) return BRANCH;
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8')).branch || BRANCH;
  } catch {
    return BRANCH;
  }
}

function mergeBase(root, ref, { side = false } = {}) {
  const exec = (args) => (side ? privateGit(root, args) : runGit(root, args));
  if (exec(['rev-parse', '--verify', '--quiet', ref]).status !== 0) {
    return null;
  }
  const result = exec(['merge-base', 'HEAD', ref]);
  return result.status === 0 ? result.stdout.trim() || null : null;
}

function filterUnlandedHalf(root, files, base, { side = false } = {}) {
  if (files.length === 0 || !base) return files;
  const exec = (args) => (side ? privateGit(root, args) : runGit(root, args));
  const worktree = exec([
    'diff',
    '-z',
    '--name-only',
    '--no-renames',
    base,
    '--',
  ]);
  const staged = exec([
    'diff',
    '-z',
    '--name-only',
    '--no-renames',
    '--cached',
    base,
    '--',
  ]);
  if (worktree.status !== 0 || staged.status !== 0) return files;
  const changed = new Set([
    ...entries(worktree.stdout),
    ...entries(staged.stdout),
  ]);
  const inBase = objectIds(
    root,
    files.map((file) => `${base}:${file}`),
    { side }
  );
  return files.filter(
    (file) =>
      changed.has(file) ||
      (!inBase.has(`${base}:${file}`) && existsSync(path.join(root, file)))
  );
}

function unlandedFiles(files, root) {
  if (files.length === 0) return files;
  const branch = upstreamBranch(root);
  const publicBase =
    mergeBase(root, `refs/remotes/upstream/${branch}`) ??
    mergeBase(root, `refs/remotes/origin/${branch}`);
  if (!isSplit(root)) {
    return filterUnlandedHalf(root, files, publicBase);
  }
  const hidden = privatePaths(root, files);
  const privateBase = mergeBase(root, `refs/remotes/origin/${branch}`, {
    side: true,
  });
  return [
    ...filterUnlandedHalf(
      root,
      files.filter((file) => !hidden.has(file)),
      publicBase
    ),
    ...filterUnlandedHalf(
      root,
      files.filter((file) => hidden.has(file)),
      privateBase,
      { side: true }
    ),
  ];
}

function hook({ dir, root }) {
  const input = JSON.parse(readFileSync(0, 'utf-8') || '{}');
  const isAgy = Boolean(input.hookEventName || input.conversationId);
  const stopActive =
    input.stop_hook_active ||
    (isAgy && (input.continuationActive || Number(input.executionNum) > 0));
  const transcriptPath = input.transcript_path ?? input.transcriptPath;
  if (
    stopActive ||
    input.background_tasks?.length ||
    input.session_crons?.length ||
    (isAgy && input.fullyIdle === false) ||
    !transcriptPath ||
    !existsSync(transcriptPath)
  ) {
    if (isAgy) process.stdout.write('{}');
    return;
  }

  const { files: editedFiles, pendingChildTasks } = analyzeTranscript(
    readFileSync(transcriptPath, 'utf-8'),
    root
  );
  if (pendingChildTasks) {
    if (isAgy) process.stdout.write('{}');
    return;
  }
  const files = unlandedFiles(editedFiles, root);
  if (files.length === 0) {
    if (isAgy) process.stdout.write('{}');
    return;
  }
  const result = judgeFiles(files, { dir, root });
  const open = result.states.filter((cell) => cell.state !== 'covered');
  if (open.length === 0 && result.unmapped.length === 0) {
    if (isAgy) process.stdout.write('{}');
    return;
  }

  const lines = report({
    states: open,
    unmapped: result.unmapped,
  });
  process.stdout.write(
    JSON.stringify({
      decision: isAgy ? 'continue' : 'block',
      reason: [
        `The hand drive is not done: ${open.length} cells and ${result.unmapped.length} unmapped files are open for the browser-visible files this session edited. Open each cell's page in the built-in browser against the www-drive server in light, in a tab at least ${DESKTOP_MIN_WIDTH} px wide, such as 1280x900, because the pane often opens narrower, at least ${SETTLE_MS / 1000} s after the last edit to its files, take a screenshot and read it, then run node tooling/scripts/hand-drive.mjs check, as verify's Hand drive section says. The owner's message starting with "skip drive" waives the edits made before it.`,
        ...lines.slice(0, 40),
        ...(lines.length > 40 ? [`… and ${lines.length - 40} more`] : []),
      ].join('\n'),
    })
  );
}

function parseArgs(argv) {
  const options = { files: [], root: ROOT };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const value = () => argv[(index += 1)];
    if (arg === '--dir') options.dir = value();
    else if (arg === '--root') options.root = path.resolve(value());
    else if (arg === '--none') options.none = value();
    else options.files.push(arg);
  }
  options.dir = path.resolve(ROOT, options.dir ?? DRIVE_DIR);
  return options;
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);

  if (command === '--hook') {
    try {
      hook(options);
    } catch (error) {
      console.error(`hand-drive hook skipped: ${error.message}`);
    }
    return;
  }
  if (command === 'scope') {
    if (options.files.length === 0) {
      throw new Error(
        'scope needs the changed files: hand-drive.mjs scope <file...>'
      );
    }
    const { cells, unmapped } = cellsFor(
      options.files,
      readSources(options.root),
      readRoutes(options.dir),
      blobReader(options.root)
    );
    for (const line of report({
      states: cells.map((cell) => ({ ...cell, state: 'need' })),
      unmapped,
    })) {
      console.log(line);
    }
    return;
  }
  if (command === 'route') {
    const [file, ...pages] = options.files;
    if (!file || (pages.length === 0 && !options.none)) {
      throw new Error('route needs a file and its pages, or --none <reason>');
    }
    appendJsonl(path.join(options.dir, 'routes.jsonl'), {
      at: new Date().toISOString(),
      blob: blobReader(options.root)(file),
      file,
      ...(options.none ? { none: options.none } : { pages }),
    });
    console.log(
      options.none
        ? `${file} shows nothing: ${options.none}`
        : `${file} → ${pages.join(', ')}`
    );
    return;
  }
  if (command === 'check') {
    const result = judgeFiles(options.files, options);
    for (const line of report(result)) console.log(line);
    const open =
      result.states.filter((cell) => cell.state !== 'covered').length +
      result.unmapped.length;
    console.log(open === 0 ? 'hand drive done' : `hand drive open: ${open}`);
    process.exitCode = open === 0 ? 0 : 1;
    return;
  }
  throw new Error(
    'usage: hand-drive.mjs scope|route|check [--dir <drive dir>] [--root <checkout>] <args...> | --hook'
  );
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
