import {
  type Decoration,
  type DecorationRefresh,
  type Descendant,
  type EditorCanonicalUpdateTag,
  type Element,
  ElementApi,
  NodeApi,
  type Node,
  type NodeEntry,
  type NodeKey,
  type NodeTextRangeView,
  type Path,
  PathApi,
  type Point,
  RangeApi,
  definePlugin,
  TextApi,
  txLocate,
  txSelection,
} from '../../../core';

export type LintFinding = Readonly<{
  id: string;
  ruleId: string;
  severity: 'error' | 'info' | 'warning';
  message: string;
  /** The content text the rule matched. */
  text: string;
  fixes: readonly string[];
}>;

/** A rule's match: UTF-16 offsets into the checked text, a message and fixes. */
export type LintMatch = Readonly<{
  start: number;
  end: number;
  message: string;
  fixes?: readonly string[];
}>;

export type LintRule = Readonly<{
  id: string;
  severity: LintFinding['severity'];
  /**
   * Check one text block's content text: its text joined through inline
   * elements, without non-content text such as struck suggestions. Offsets are
   * UTF-16 indexes into `text`. Return a promise for a server check; the plugin
   * keeps its result only while the block matches the one it checked, marks
   * and properties included, and aborts `signal` when the block leaves the
   * document or `run`, `clear` or a document replace restarts linting.
   */
  check: (
    text: string,
    context: Readonly<{ block: Element; signal: AbortSignal }>
  ) => Iterable<LintMatch> | PromiseLike<Iterable<LintMatch>>;
}>;

export type LintPluginState = Readonly<{
  rules: readonly LintRule[];
  /** False after `clear` until the next `run`. */
  active: boolean;
  /** Moves whenever the findings list changes. */
  version: number;
  /** The last checker failure. */
  error: Error | null;
}>;

const initialState: LintPluginState = {
  rules: [],
  active: true,
  version: 0,
  error: null,
};

type Hit = Readonly<{
  end: number;
  fixes: readonly string[];
  message: string;
  rule: LintRule;
  start: number;
}>;

type Item = Readonly<{ end: number; finding: LintFinding; start: number }>;

type BlockEntry = Readonly<{
  block: Element;
  group: number;
  items: readonly Item[];
  local: readonly Hit[];
  text: string;
}>;

type Request = Readonly<{
  block: Element;
  controller: AbortController;
  key: NodeKey;
  resend: boolean;
  text: string;
}>;

const NO_FINDINGS: readonly LintFinding[] = [];
const HISTORY_TAGS = [
  'history-merge',
  'history-push',
  'history-skip',
] as const satisfies readonly EditorCanonicalUpdateTag[];
const SLOTS = 4;
const RESEND_SLOTS = 3;

type Reply = ReturnType<LintRule['check']>;

const isPromiseLike = (
  value: Reply
): value is PromiseLike<Iterable<LintMatch>> =>
  typeof (value as Partial<PromiseLike<unknown>>).then === 'function';

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));

const readHits = (rule: LintRule, text: string, matches: Iterable<LintMatch>) =>
  Array.from(matches, (match): Hit | null =>
    Number.isInteger(match.start) &&
    Number.isInteger(match.end) &&
    match.start >= 0 &&
    match.start < match.end &&
    match.end <= text.length
      ? {
          end: match.end,
          fixes: match.fixes ?? [],
          message: match.message,
          rule,
          start: match.start,
        }
      : null
  ).filter((hit) => hit !== null);

const sameFixes = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((fix, index) => fix === b[index]);

const sameNode = (a: Descendant, b: Descendant): boolean => {
  if (a === b) return true;

  const keys = Object.keys(a);

  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) =>
      key === 'children'
        ? ElementApi.isElement(a) &&
          ElementApi.isElement(b) &&
          a.children.length === b.children.length &&
          a.children.every((child, index) => sameNode(child, b.children[index]))
        : Object.hasOwn(b, key) && Object.is(a[key], b[key])
    )
  );
};

const sameInput = (
  seen: Readonly<{ block: Element; text: string }>,
  block: Element,
  text: string
) => seen.text === text && sameNode(seen.block, block);

/** Lint text blocks with app rules; findings follow edits and never go stale. */
export const BaseLintPlugin = definePlugin('lint', {
  initialState,
}).extend(({ editor, store }) => {
  const entries = new Map<NodeKey, BlockEntry>();
  // The current entry of each linted block object, so a list rebuild reads an
  // unchanged block without a key or schema lookup.
  let byBlock = new WeakMap<Node, BlockEntry>();
  // The findings under each container element, so a rebuild reads an unchanged
  // container once.
  let containerFindings = new WeakMap<Node, readonly LintFinding[]>();
  // Nodes are immutable and the editor's schema is fixed, so a node's kind is
  // computed once.
  const kinds = new WeakMap<Node, 'container' | 'other' | 'text-block'>();
  const groupKeys = new Map<number, NodeKey>();
  const accepted = new Map<
    NodeKey,
    Map<
      LintRule,
      Readonly<{ block: Element; hits: readonly Hit[]; text: string }>
    >
  >();
  const asyncRules = new WeakSet<LintRule>();
  const inflight = new Map<LintRule, Map<NodeKey, Request>>();
  const waiting = new Map<
    LintRule,
    Readonly<{ queue: Set<NodeKey>; resend: Set<NodeKey> }>
  >();
  const painters = new Set<(input: DecorationRefresh) => void>();
  let groups = 0;
  let resolvingCommit = false;
  // A document view's decoration read throws when it reads the source editor,
  // so the paint guard compares against the document this plugin last saw
  // published.
  let documentChildren: readonly Descendant[] | null = null;
  let failure: Error | null = null;
  let list: Readonly<{ findings: readonly LintFinding[]; version: number }> = {
    findings: NO_FINDINGS,
    version: -1,
  };

  const kindOf = (view: NodeTextRangeView, node: Node) => {
    let kind = kinds.get(node);

    if (!kind) {
      kind =
        !ElementApi.isElement(node) || view.schema.isInline(node)
          ? 'other'
          : node.children.every(
                (child) => TextApi.isText(child) || view.schema.isInline(child)
              )
            ? 'text-block'
            : 'container';
      kinds.set(node, kind);
    }

    return kind;
  };

  const isTextBlock = (view: NodeTextRangeView, node: Node): node is Element =>
    kindOf(view, node) === 'text-block';

  const setEntry = (key: NodeKey, entry: BlockEntry) => {
    const previous = entries.get(key);

    if (previous?.block === entry.block) {
      // A server result changed findings under an unchanged block, so any
      // container above it may list stale findings.
      if (previous.group !== entry.group) containerFindings = new WeakMap();
    } else if (previous) {
      byBlock.delete(previous.block);
    }
    entries.set(key, entry);
    byBlock.set(entry.block, entry);
  };

  const paint = (nodeKeys: DecorationRefresh['nodeKeys']) => {
    for (const refresh of painters) refresh({ nodeKeys });
  };

  const bump = () => store.set({ version: store.get('version') + 1 });

  const publishFailure = () => {
    if (!failure) return;
    store.set({ error: failure });
    failure = null;
  };

  // A rule can throw inside `findings()`, which React calls while rendering, or
  // inside a decoration read. A store write notifies subscribers at once, so
  // the failure publishes in a microtask, after the read returns.
  const fail = (error: unknown) => {
    failure = toError(error);
    queueMicrotask(publishFailure);
  };

  const validAccepted = (key: NodeKey, block: Element, text: string) => {
    const results = accepted.get(key);

    if (!results) return [];

    return [...results.values()].flatMap((result) =>
      sameInput(result, block, text) ? result.hits : []
    );
  };

  const hitsOf = (
    key: NodeKey,
    block: Element,
    text: string,
    local: readonly Hit[]
  ) => {
    const rules = store.get('rules');

    return [...local, ...validAccepted(key, block, text)].sort(
      (a, b) =>
        a.start - b.start ||
        a.end - b.end ||
        rules.indexOf(a.rule) - rules.indexOf(b.rule)
    );
  };

  const compose = (
    key: NodeKey,
    block: Element,
    text: string,
    local: readonly Hit[],
    previous: BlockEntry | undefined
  ): BlockEntry => {
    const hits = hitsOf(key, block, text, local);

    if (previous && keepsGroup(previous, text, hits)) {
      return {
        block,
        group: previous.group,
        items: hits.map((hit, index) => ({
          end: hit.end,
          finding: previous.items[index].finding,
          start: hit.start,
        })),
        local,
        text,
      };
    }

    groups += 1;
    const group = groups;
    const occurrences = new Map<string, number>();

    if (previous) groupKeys.delete(previous.group);
    groupKeys.set(group, key);

    return {
      block,
      group,
      items: hits.map((hit) => {
        const occurrence = occurrences.get(hit.rule.id) ?? 0;

        occurrences.set(hit.rule.id, occurrence + 1);

        return {
          end: hit.end,
          finding: {
            fixes: hit.fixes,
            id: `${group}:${key}:${hit.rule.id}:${occurrence}`,
            message: hit.message,
            ruleId: hit.rule.id,
            severity: hit.rule.severity,
            text: text.slice(hit.start, hit.end),
          },
          start: hit.start,
        };
      }),
      local,
      text,
    };
  };

  // Ids survive only when every finding is the same payload in the same order
  // and lies outside the span between the old and new text's common prefix
  // and suffix, so an id never moves to text the user did not see flagged.
  const keepsGroup = (
    previous: BlockEntry,
    text: string,
    hits: readonly Hit[]
  ) => {
    if (previous.items.length !== hits.length) return false;
    if (hits.length === 0) return true;

    const before = previous.text;
    const shortest = Math.min(before.length, text.length);
    let prefix = 0;

    while (prefix < shortest && before[prefix] === text[prefix]) prefix += 1;

    let suffix = 0;

    while (
      suffix < shortest - prefix &&
      before[before.length - 1 - suffix] === text[text.length - 1 - suffix]
    ) {
      suffix += 1;
    }

    const shift = text.length - before.length;

    return hits.every((hit, index) => {
      const { end, finding, start } = previous.items[index];
      const offset =
        end <= prefix ? 0 : start >= before.length - suffix ? shift : null;

      return (
        offset !== null &&
        hit.start === start + offset &&
        hit.end === end + offset &&
        hit.rule.id === finding.ruleId &&
        hit.rule.severity === finding.severity &&
        hit.message === finding.message &&
        sameFixes(hit.fixes, finding.fixes)
      );
    });
  };

  const runRules = (view: NodeTextRangeView, block: Element, path: Path) => {
    const discovered: Array<
      Readonly<{
        controller: AbortController;
        result: Reply;
        rule: LintRule;
      }>
    > = [];
    const errors: unknown[] = [];
    const local: Hit[] = [];
    const pending: LintRule[] = [];
    let text = '';

    NodeApi.findTextRanges(
      view,
      (content) => {
        text = content;

        for (const rule of store.get('rules')) {
          if (asyncRules.has(rule)) {
            pending.push(rule);
            continue;
          }

          const controller = new AbortController();

          try {
            const result = rule.check(content, {
              block,
              signal: controller.signal,
            });

            if (isPromiseLike(result)) {
              discovered.push({ controller, result, rule });
            } else {
              local.push(...readHits(rule, content, result));
            }
          } catch (error) {
            errors.push(error);
          }
        }

        return [];
      },
      { at: path, content: true }
    );

    return { discovered, errors, local, pending, text };
  };

  const resolve = (
    view: NodeTextRangeView,
    block: Element,
    path: Path,
    key: NodeKey
  ): BlockEntry => {
    const previous = entries.get(key);

    if (previous?.block === block) return previous;

    const { discovered, errors, local, pending, text } = runRules(
      view,
      block,
      path
    );
    const entry = compose(key, block, text, local, previous);

    for (const error of errors) fail(error);
    setEntry(key, entry);
    for (const { controller, result, rule } of discovered) {
      asyncRules.add(rule);
      track(rule, { block, controller, key, resend: false, text }, result);
    }
    for (const rule of pending) {
      const seen = accepted.get(key)?.get(rule);

      if (!seen || !sameInput(seen, block, text)) {
        request(rule, key, previous !== undefined);
      }
    }

    return entry;
  };

  const entryAt = (key: NodeKey) => {
    const found = editor.read.nodes.get(key);

    if (!found || !isTextBlock(editor.read, found[0])) return null;

    return resolve(editor.read, found[0], found[1], key);
  };

  const queueOf = (rule: LintRule) => {
    let queued = waiting.get(rule);

    if (!queued) {
      queued = { queue: new Set(), resend: new Set() };
      waiting.set(rule, queued);
    }

    return queued;
  };

  const request = (rule: LintRule, key: NodeKey, resend: boolean) => {
    if (inflight.get(rule)?.has(key)) return;

    const queued = queueOf(rule);

    if (resend) {
      queued.queue.delete(key);
      queued.resend.add(key);
    } else if (!queued.resend.has(key)) {
      queued.queue.add(key);
    }
    if (!resolvingCommit) pump(rule);
  };

  const pump = (rule: LintRule) => {
    const queued = queueOf(rule);

    for (;;) {
      const flying = inflight.get(rule);
      const count = flying?.size ?? 0;

      if (count >= SLOTS) return;

      const resends = flying
        ? [...flying.values()].filter((sent) => sent.resend).length
        : 0;
      const resend =
        queued.resend.size > 0 &&
        (resends < RESEND_SLOTS || queued.queue.size === 0);
      const source = resend ? queued.resend : queued.queue;
      const [key] = source;

      if (key === undefined) return;
      source.delete(key);
      send(rule, key, resend);
    }
  };

  const send = (rule: LintRule, key: NodeKey, resend: boolean) => {
    const found = editor.read.nodes.get(key);

    if (!found || !isTextBlock(editor.read, found[0])) return;

    const [block] = found;
    const { text } = resolve(editor.read, block, found[1], key);
    const seen = accepted.get(key)?.get(rule);

    if (seen && sameInput(seen, block, text)) return;

    const controller = new AbortController();
    let result: Reply;

    try {
      result = rule.check(text, { block, signal: controller.signal });
    } catch (error) {
      fail(error);
      return;
    }
    track(rule, { block, controller, key, resend, text }, result);
  };

  const track = (rule: LintRule, sent: Request, result: Reply) => {
    let flying = inflight.get(rule);

    if (!flying) {
      flying = new Map();
      inflight.set(rule, flying);
    }
    flying.set(sent.key, sent);
    Promise.resolve(result)
      .then((matches) => Array.from(matches))
      .then(
        (matches) => settle(rule, sent, matches, null),
        (error: unknown) => settle(rule, sent, null, error)
      );
  };

  const settle = (
    rule: LintRule,
    sent: Request,
    matches: readonly LintMatch[] | null,
    error: unknown
  ) => {
    const flying = inflight.get(rule);

    if (flying?.get(sent.key) !== sent) return;
    flying.delete(sent.key);

    const entry = entryAt(sent.key);
    const stale = entry !== null && !sameInput(sent, entry.block, entry.text);

    if (error !== null) {
      failure = toError(error);
    } else if (matches && entry && !stale) {
      let results = accepted.get(sent.key);

      if (!results) {
        results = new Map();
        accepted.set(sent.key, results);
      }
      results.set(rule, {
        block: sent.block,
        hits: readHits(rule, sent.text, matches),
        text: sent.text,
      });

      const next = compose(
        sent.key,
        entry.block,
        entry.text,
        entry.local,
        entry
      );

      setEntry(sent.key, next);
      if (next.group !== entry.group) {
        bump();
        paint([sent.key]);
      }
    }
    if (stale) request(rule, sent.key, true);
    pump(rule);
    publishFailure();
  };

  const forget = (key: NodeKey) => {
    const entry = entries.get(key);

    if (entry) {
      groupKeys.delete(entry.group);
      byBlock.delete(entry.block);
    }
    entries.delete(key);
    accepted.delete(key);
    for (const [rule, flying] of inflight) {
      const sent = flying.get(key);

      waiting.get(rule)?.queue.delete(key);
      waiting.get(rule)?.resend.delete(key);
      if (!sent) continue;
      sent.controller.abort();
      flying.delete(key);
    }

    return (entry?.items.length ?? 0) > 0;
  };

  const reset = (active: boolean, rules?: readonly LintRule[]) => {
    for (const flying of inflight.values()) {
      for (const sent of flying.values()) sent.controller.abort();
    }
    entries.clear();
    byBlock = new WeakMap();
    containerFindings = new WeakMap();
    groupKeys.clear();
    accepted.clear();
    inflight.clear();
    waiting.clear();
    failure = null;
    store.set({
      active,
      error: null,
      version: store.get('version') + 1,
      ...(rules ? { rules } : {}),
    });
  };

  const findings = (): readonly LintFinding[] => {
    if (!store.get('active')) return NO_FINDINGS;

    const version = store.get('version');

    if (list.version === version) return list.findings;

    const collect = (
      nodes: readonly Descendant[],
      parent: Path,
      into: LintFinding[]
    ) => {
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const known = byBlock.get(node);

        if (known) {
          known.items.forEach((item) => into.push(item.finding));
          continue;
        }

        let inner = containerFindings.get(node);

        if (!inner) {
          if (isTextBlock(editor.read, node)) {
            const path = [...parent, index];

            for (const item of resolve(
              editor.read,
              node,
              path,
              editor.key(node)
            ).items) {
              into.push(item.finding);
            }
            continue;
          }
          if (
            !ElementApi.isElement(node) ||
            kindOf(editor.read, node) !== 'container'
          ) {
            continue;
          }

          const found: LintFinding[] = [];

          collect(node.children, [...parent, index], found);
          inner = found;
          containerFindings.set(node, inner);
        }
        inner.forEach((finding) => into.push(finding));
      }
    };
    const next: LintFinding[] = [];

    collect(editor.read.children(), [], next);
    list = { findings: next.length > 0 ? next : NO_FINDINGS, version };

    return list.findings;
  };

  const contentOffset = (
    view: NodeTextRangeView,
    block: Element,
    path: Path,
    point: Point
  ) => {
    let offset = 0;

    for (const [text, relative] of NodeApi.texts(block)) {
      const content = view.nodes.isContent(text);

      if (PathApi.equals([...path, ...relative], point.path)) {
        return content ? offset + point.offset : offset;
      }
      if (content) offset += text.text.length;
    }

    return null;
  };

  // A text block holds only text and inline elements, so the first one on the
  // way down is the only one above the point.
  const blockAbove = (view: NodeTextRangeView, at: Path) => {
    let nodes = view.children();

    for (let depth = 1; depth < at.length; depth += 1) {
      const node = nodes[at[depth - 1]];

      if (!node || !ElementApi.isElement(node)) return null;
      if (kindOf(view, node) === 'text-block') {
        return [node, at.slice(0, depth)] as const;
      }
      nodes = node.children;
    }

    return null;
  };

  const rangeOf = (
    view: NodeTextRangeView,
    path: Path,
    { end, start }: Readonly<{ end: number; start: number }>,
    expected: string
  ) =>
    NodeApi.findTextRanges(
      view,
      (text) => (text.slice(start, end) === expected ? [{ end, start }] : []),
      { at: path, content: true }
    )[0] ?? null;

  const findingKey = (id: string) =>
    groupKeys.get(Number(id.slice(0, id.indexOf(':'))));

  // The stored document's entry says whether an id is current; the range comes
  // from the document the update edits, which a command frame can replace.
  const locate = (
    view: NodeTextRangeView,
    entryOf: (key: NodeKey) => NodeEntry | undefined,
    id: string
  ) => {
    if (!store.get('active')) return null;

    const key = findingKey(id);
    const item =
      key &&
      entries.get(key)?.items.find((candidate) => candidate.finding.id === id);
    const found = item && entryOf(key);

    if (!item || !found || !isTextBlock(view, found[0])) {
      return null;
    }

    const range = rangeOf(view, found[1], item, item.finding.text);

    return range ? { item, range } : null;
  };

  return {
    activate: ({ beforePublish }) => {
      beforePublish(() => {
        documentChildren = editor.read.children();
      });
    },
    api: () => ({
      /** Findings in document order, the same array until `version` moves. */
      findings,
      /** The finding under the selection focus, or null. */
      at: (): LintFinding | null => {
        const selection = editor.read.selection();

        if (!selection || !store.get('active')) return null;

        const above = blockAbove(editor.read, selection.focus.path);

        if (!above) return null;

        const [block, path] = above;
        const offset = contentOffset(editor.read, block, path, selection.focus);

        if (offset === null) return null;

        return (
          resolve(editor.read, block, path, editor.key(block)).items.find(
            (item) => item.start <= offset && offset <= item.end
          )?.finding ?? null
        );
      },
      /** Lint the whole document again; `rules` replaces the current rules. */
      run: (rules?: readonly LintRule[]) => {
        reset(true, rules);
        findings();
        publishFailure();
        paint('all');
      },
      /** Stop linting and drop every finding until the next `run`. */
      clear: () => {
        reset(false);
        paint('all');
      },
    }),
    update: ({ tx }) => ({
      /**
       * Replace a finding's text with one of its fixes as its own undo step.
       * Writes nothing and returns false when the finding is gone or has no fix
       * at `index`.
       */
      fix: txLocate(
        (args, place) => {
          const key = findingKey(args[0]);

          return key && place.location(key) === null ? null : args;
        },
        (id: string, index: number = 0): boolean => {
          const located = locate(tx, (key) => tx.nodes.get(key), id);
          const replacement = located?.item.finding.fixes[index];

          if (!located || replacement === undefined) return false;

          if (!HISTORY_TAGS.some((tag) => tx.tags.has(tag))) {
            tx.tags.add('history-push');
          }
          tx.selection.set(located.range);
          tx.text.insert(replacement, { marks: false });

          return true;
        }
      ),
      /** Select a finding's text. */
      select: txSelection((id: string): boolean => {
        const located = locate(tx, (key) => tx.nodes.get(key), id);

        if (!located) return false;
        tx.selection.set(located.range);

        return true;
      }),
      /** Select the next or previous finding from the selection, wrapping. */
      move: txSelection((delta: -1 | 1): boolean => {
        if (!store.get('active')) return false;

        const located: Array<
          Readonly<{ end: number; path: Path; start: number; text: string }>
        > = [];
        const walk = (nodes: readonly Descendant[], parent: Path) => {
          nodes.forEach((node, index) => {
            const path = [...parent, index];

            if (
              ElementApi.isElement(node) &&
              kindOf(tx, node) === 'container'
            ) {
              walk(node.children, path);
              return;
            }

            const entry = byBlock.get(node);

            if (entry) {
              for (const { end, finding, start } of entry.items) {
                located.push({ end, path, start, text: finding.text });
              }
              return;
            }
            if (!isTextBlock(tx, node)) return;

            const { discovered, local, text } = runRules(tx, node, path);

            // An app's server check may reject once aborted, and nothing reads
            // a draft's reply.
            for (const { controller, result } of discovered) {
              controller.abort();
              void Promise.resolve(result).catch(() => undefined);
            }
            for (const { end, start } of hitsOf(
              tx.key(node),
              node,
              text,
              local
            )) {
              located.push({ end, path, start, text: text.slice(start, end) });
            }
          });
        };

        walk(tx.children(), []);
        if (located.length === 0) return false;

        const selection = tx.selection();
        const point =
          selection && RangeApi.edges(selection)[delta === 1 ? 1 : 0];
        const above = point && blockAbove(tx, point.path);
        const offset = above && contentOffset(tx, above[0], above[1], point);
        const ahead = ({ path, start }: (typeof located)[number]) => {
          if (!above || offset == null) return delta === 1;

          const order = PathApi.compare(path, above[1]);

          return order === 0 ? start >= offset : order > 0;
        };
        const target =
          delta === 1
            ? (located.find(ahead) ?? located[0])
            : (located.findLast((entry) => !ahead(entry)) ?? located.at(-1));
        const range = target && rangeOf(tx, target.path, target, target.text);

        if (!range) return false;
        tx.selection.set(range);

        return true;
      }),
    }),
    decorate: {
      observe: ({ refresh }) => {
        painters.add(refresh);

        return () => {
          painters.delete(refresh);
        };
      },
      read: ({ editor: view, entry: [node, path] }) => {
        if (
          !store.get('active') ||
          !isTextBlock(view.read, node) ||
          view.read.view.root() !== undefined ||
          view.read.children() !== documentChildren
        ) {
          return [];
        }

        const { items } = resolve(view.read, node, path, view.key(node));
        const decorations: Decoration[] = [];

        if (items.length === 0) return decorations;

        const leaves: Array<
          Readonly<{ end: number; path: Path; start: number }>
        > = [];
        let offset = 0;

        for (const [text, relative] of NodeApi.texts(node)) {
          if (!view.read.nodes.isContent(text)) continue;
          leaves.push({
            end: offset + text.text.length,
            path: [...path, ...relative],
            start: offset,
          });
          offset += text.text.length;
        }
        for (const { end, finding, start } of items) {
          let segment = 0;

          for (const leaf of leaves) {
            const from = Math.max(start, leaf.start);
            const to = Math.min(end, leaf.end);

            if (from >= to) continue;
            segment += 1;
            decorations.push({
              attributes: {
                'data-lint-id': finding.id,
                'data-lint-rule': finding.ruleId,
                'data-lint-severity': finding.severity,
              },
              key: `${finding.id}:${segment}`,
              range: {
                anchor: { path: leaf.path, offset: from - leaf.start },
                focus: { path: leaf.path, offset: to - leaf.start },
              },
            });
          }
        }

        return decorations;
      },
    },
    on: {
      commit: ({ commit }) => {
        documentChildren = commit.after.children;
        if (!store.get('active') || !commit.changed.has('document')) return;
        if (commit.changed.has('replace')) {
          reset(true);
          return;
        }

        let changed =
          commit.changed.has('structure') || commit.changed.has('root-order');
        const repaint: NodeKey[] = [];

        resolvingCommit = true;
        for (const key of commit.changed.nodeKeys('presence')) {
          if (entries.has(key) && !editor.read.nodes.get(key) && forget(key)) {
            changed = true;
          }
        }

        const blocks = new Map<NodeKey, readonly [Element, Path]>();
        const deep = changed || commit.changed.has('properties');

        for (const key of commit.changed.nodeKeys('node')) {
          const found = editor.read.nodes.get(key);

          if (!found) continue;

          const [node, path] = found;

          if (isTextBlock(editor.read, node)) {
            blocks.set(key, [node, path]);
          } else if (deep && ElementApi.isElement(node)) {
            const walk = (children: readonly Descendant[], parent: Path) => {
              children.forEach((child, index) => {
                const childPath = [...parent, index];

                if (isTextBlock(editor.read, child)) {
                  blocks.set(editor.key(child), [child, childPath]);
                } else if (ElementApi.isElement(child)) {
                  walk(child.children, childPath);
                }
              });
            };

            walk(node.children, path);
          }
        }
        for (const [key, [block, path]] of blocks) {
          const previous = entries.get(key);
          const entry = resolve(editor.read, block, path, key);

          if (entry === previous) continue;
          if (!previous || entry.group !== previous.group) {
            changed ||=
              entry.items.length > 0 || (previous?.items.length ?? 0) > 0;
          }
          if (
            previous &&
            [...(accepted.get(key)?.values() ?? [])].some(
              (result) =>
                sameInput(result, previous.block, previous.text) &&
                !sameInput(result, entry.block, entry.text)
            )
          ) {
            repaint.push(key);
          }
        }
        resolvingCommit = false;
        for (const rule of waiting.keys()) pump(rule);
        if (changed) bump();
        publishFailure();
        if (repaint.length > 0) paint(repaint);
      },
    },
  };
});
