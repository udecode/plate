import {
  BROWSER_HANDLE_KEY,
  type BrowserEditorHarness,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const PAGE = '/docs/suggestion';
const MAIN = 'Suggestions document';
const FORMAT = 'Formatting suggestions document';
const SEEDED = new Set([
  'added-paragraph',
  'added-word',
  'added-words',
  'bold-sentence',
  'removed-phrase',
  'removed-word',
]);

type ReviewNode = {
  authored?: Array<{
    author: string;
    change: string;
    key?: string;
    kind: string;
  }>;
  children?: ReviewNode[];
  text?: string;
  type?: string;
};
type Point = { offset: number; path: number[] };

/**
 * One line per block: `type{prop=value}[kind:change] leaf|leaf[kind:change]`,
 * a container as `type{child / child}`. Changes a step records are named n1,
 * n2… in the order they first appear, since their ids are random.
 */
const formatter = () => {
  const names = new Map<string, string>();
  const name = (change: string) => {
    if (SEEDED.has(change)) return change;
    if (!names.has(change)) names.set(change, `n${names.size + 1}`);

    return names.get(change)!;
  };
  const marks = (node: ReviewNode) =>
    node.authored?.length
      ? `[${node.authored
          .map(
            (mark) =>
              `${mark.kind}${mark.key ? `(${mark.key})` : ''}:${name(mark.change)}`
          )
          .join(',')}]`
      : '';
  const props = (node: ReviewNode) =>
    Object.entries(node)
      .filter(
        ([key]) => !['authored', 'children', 'id', 'text', 'type'].includes(key)
      )
      .map(([key, value]) => `{${key}=${JSON.stringify(value)}}`)
      .join('');
  const leaves = (node: ReviewNode): ReviewNode[] =>
    node.children ? node.children.flatMap(leaves) : [node];
  const line = (block: ReviewNode): string => {
    const head = `${block.type === 'paragraph' ? '' : block.type}${props(block)}${marks(block)}`;

    if (block.children?.some((child) => child.type)) {
      return `${head}{${block.children.map(line).join(' / ')}}`;
    }

    return `${head}${head ? ' ' : ''}${leaves(block)
      .map((leaf) => `${leaf.text}${props(leaf)}${marks(leaf)}`)
      .join('|')}`;
  };

  return (children: readonly ReviewNode[]) => children.map(line);
};
const plainLines = formatter();

const openDemo = async (page: Page, label: string) => {
  const container = page
    .locator('[data-slot="editor-container"]')
    .filter({ has: page.locator(`[aria-label="${label}"]`) });
  const root = container.locator('[data-editor="true"]');
  const editor = createBrowserEditorHarness(page, label, root);

  await root.waitFor();
  return { container, editor, root };
};

const children = async (editor: BrowserEditorHarness) =>
  ((await editor.get.modelValue()) as { children: ReviewNode[] }).children;

/** The model caret, after checking the browser's caret resolves to it. */
const caretOf = async (editor: BrowserEditorHarness, root: Locator) => {
  const point = (at: Point) => `[${at.path}]@${at.offset}`;
  const read = (selection: { anchor: Point; focus: Point } | null) =>
    selection
      ? point(selection.anchor) === point(selection.focus)
        ? point(selection.anchor)
        : `${point(selection.anchor)}..${point(selection.focus)}`
      : null;
  let caret: string | null = null;

  await expect
    .poll(async () => {
      caret = read(await editor.get.selection());
      const dom = await root.evaluate(
        (element, key) =>
          (
            element as unknown as Record<
              string,
              { getDOMSelection?: () => unknown }
            >
          )[key]?.getDOMSelection?.() ?? null,
        BROWSER_HANDLE_KEY
      );

      return read(dom as { anchor: Point; focus: Point } | null) === caret;
    }, 'the browser caret matches the model caret')
    .toBe(true);
  return caret;
};

/** The proof route, loaded with a document, gives either projection of it. */
const projector = async (page: Page) => {
  const proof = await page.context().newPage();

  await proof.goto('/dev/authored-review?fixture=page', {
    waitUntil: 'commit',
  });
  await proof.waitForFunction(() => !!window.authoredProof?.load);
  return async (value: readonly ReviewNode[]) =>
    proof.evaluate((loaded) => {
      window.authoredProof!.load(loaded);

      return {
        accepted: window.authoredProof!.project('accepted'),
        proposed: window.authoredProof!.project('proposed'),
      };
    }, value as unknown[]) as Promise<{
      accepted: ReviewNode[];
      proposed: ReviewNode[];
    }>;
};

/** The proof route's plain editor runs the same keys on a loaded document. */
const plainReplay = async (
  page: Page,
  value: readonly ReviewNode[],
  steps: readonly Step[],
  at: Selection
) => {
  const plain = await page.context().newPage();

  await plain.goto('/dev/authored-review?intent=plain&fixture=page', {
    waitUntil: 'commit',
  });
  await plain.waitForFunction(() => !!window.authoredProof?.load);
  await plain.evaluate((loaded) => window.authoredProof!.load(loaded), [
    ...value,
  ] as unknown[]);
  const root = plain.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(plain, 'plain', root);
  const trees: string[][] = [];

  await place(editor, at);
  for (const step of steps) {
    await act(plain, editor, root, step.do);
    trees.push(plainLines(await children(editor)));
  }
  await plain.close();
  return trees;
};

type Selection = Point | { anchor: Point; focus: Point };
type Step = { caret: string; do: string; tree: string[] };
type Case = {
  at: Selection;
  label: string;
  name: string;
  /** Where the plain editor's caret starts, when its paths differ. */
  plainAt?: Selection;
  steps: Step[];
};

const place = async (editor: BrowserEditorHarness, at: Selection) => {
  if ('anchor' in at) await editor.selection.select(at);
  else await editor.selection.collapse(at);
  await editor.focus();
};

const isMac = process.platform === 'darwin';

/**
 * A step is a key, `type <text>`, `card <block text> | <card text> | Accept`
 * or `line start` (Meta+Backspace on macOS, the owner's key).
 */
const act = async (
  page: Page,
  editor: BrowserEditorHarness,
  root: Locator,
  step: string
) => {
  if (step.startsWith('type ')) {
    await page.keyboard.type(step.slice(5));
  } else if (step === 'delete to line start') {
    if (isMac) await page.keyboard.press('Meta+Backspace');
    else {
      await page.keyboard.press('Shift+Home');
      await page.keyboard.press('Backspace');
    }
  } else if (step.startsWith('select ')) {
    const [anchor, focus] = step
      .slice(7)
      .split('..')
      .map((at) => {
        const [path, offset] = at.slice(1).split(']@');

        return { offset: Number(offset), path: path.split(',').map(Number) };
      });

    await editor.selection.select({ anchor, focus });
    await editor.focus();
  } else if (step.startsWith('card ')) {
    const [block, card, action] = step.slice(5).split(' | ');

    await root
      .locator('div')
      .filter({ has: page.locator('[data-discussion-block-trigger]') })
      .filter({ hasText: block })
      .last()
      .locator('[data-discussion-block-trigger]')
      .first()
      .click();
    const review = page
      .locator('[data-suggestion-review]')
      .filter({ hasText: card });

    await expect(review).toHaveCount(1);
    await review.hover();
    await review.getByRole('button', { name: `${action} suggestion` }).click();
    await expect(review).toHaveCount(0);
    await page.keyboard.press('Escape');
    await editor.focus();
  } else {
    await page.keyboard.press(step);
  }
};

const runCase = async (page: Page, current: Case, plain: boolean) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto(PAGE, { waitUntil: 'commit' });
  const { editor, root } = await openDemo(page, current.label);
  const lines = formatter();
  const project = await projector(page);
  const initial = await children(editor);
  const { accepted: rejectedAll, proposed: start } = await project(initial);
  const proposedTrees: string[][] = [];
  let decided = false;

  await place(editor, current.at);
  for (const step of current.steps) {
    await act(page, editor, root, step.do);
    const value = await children(editor);

    expect(lines(value), `tree after ${step.do}`).toEqual(step.tree);
    expect(await caretOf(editor, root), `caret after ${step.do}`).toBe(
      step.caret
    );
    await editor.assert.focusOwner('editor');

    const { accepted, proposed } = await project(value);

    proposedTrees.push(plainLines(proposed));
    decided ||= step.do.startsWith('card ');
    if (!decided) {
      expect(
        plainLines(accepted),
        `rejecting everything after ${step.do}`
      ).toEqual(plainLines(rejectedAll));
    }
  }
  if (plain) {
    expect(
      proposedTrees,
      'accepting everything after each key gives what a plain editor gives'
    ).toEqual(
      await plainReplay(
        page,
        start,
        current.steps,
        current.plainAt ?? current.at
      )
    );
  }
  errors.assertNone();
  return { editor, proposedTrees, root };
};

const KEY_CASES: Case[] = [
  {
    at: { offset: 0, path: [2, 0] },
    label: MAIN,
    name: 'select all then Backspace',
    steps: [
      {
        caret: '[0,0]@0..[2,0]@36',
        do: 'ControlOrMeta+A',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[3,0]@0',
        do: 'Backspace',
        tree: [
          '[delete:n1] Review and refine this sentence.[delete:n1]',
          '[delete:n1] Keep this [delete:n1]|redundant phrase [delete:removed-phrase,delete:n1]|out of the final draft.[delete:n1]',
          '[delete:n1] Try typing your own suggestion here.[delete:n1]',
          '[insert:n1] [insert:n1]',
        ],
      },
      {
        caret: '[3,0]@1',
        do: 'type y',
        tree: [
          '[delete:n1] Review and refine this sentence.[delete:n1]',
          '[delete:n1] Keep this [delete:n1]|redundant phrase [delete:removed-phrase,delete:n1]|out of the final draft.[delete:n1]',
          '[delete:n1] Try typing your own suggestion here.[delete:n1]',
          '[insert:n1] y[insert:n1]',
        ],
      },
      {
        caret: '[3,0]@2',
        do: 'type z',
        tree: [
          '[delete:n1] Review and refine this sentence.[delete:n1]',
          '[delete:n1] Keep this [delete:n1]|redundant phrase [delete:removed-phrase,delete:n1]|out of the final draft.[delete:n1]',
          '[delete:n1] Try typing your own suggestion here.[delete:n1]',
          '[insert:n1] yz[insert:n1]',
        ],
      },
    ],
  },
  {
    at: { offset: 0, path: [2, 0] },
    label: MAIN,
    name: 'select all then typing',
    steps: [
      {
        caret: '[0,0]@0..[2,0]@36',
        do: 'ControlOrMeta+A',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[3,0]@1',
        do: 'type x',
        tree: [
          '[delete:n1] Review and refine this sentence.[delete:n1]',
          '[delete:n1] Keep this [delete:n1]|redundant phrase [delete:removed-phrase,delete:n1]|out of the final draft.[delete:n1]',
          '[delete:n1] Try typing your own suggestion here.[delete:n1]',
          '[insert:n1] x[insert:n1]',
        ],
      },
      {
        caret: '[3,0]@2',
        do: 'type y',
        tree: [
          '[delete:n1] Review and refine this sentence.[delete:n1]',
          '[delete:n1] Keep this [delete:n1]|redundant phrase [delete:removed-phrase,delete:n1]|out of the final draft.[delete:n1]',
          '[delete:n1] Try typing your own suggestion here.[delete:n1]',
          '[insert:n1] xy[insert:n1]',
        ],
      },
      {
        caret: '[3,0]@3',
        do: 'type z',
        tree: [
          '[delete:n1] Review and refine this sentence.[delete:n1]',
          '[delete:n1] Keep this [delete:n1]|redundant phrase [delete:removed-phrase,delete:n1]|out of the final draft.[delete:n1]',
          '[delete:n1] Try typing your own suggestion here.[delete:n1]',
          '[insert:n1] xyz[insert:n1]',
        ],
      },
    ],
  },
  {
    at: { offset: 36, path: [2, 0] },
    label: MAIN,
    name: 'Enter at the end of a line then typing',
    steps: [
      {
        caret: '[3,0]@0',
        do: 'Enter',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.',
          '[split:n1] ',
        ],
      },
      {
        caret: '[3,0]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.',
          '[split:n1] y[insert:n2]',
        ],
      },
      {
        caret: '[3,0]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.',
          '[split:n1] yz[insert:n2]',
        ],
      },
    ],
  },
  {
    at: { offset: 36, path: [2, 0] },
    label: MAIN,
    name: "the owner's sequence",
    steps: [
      {
        caret: '[2,0]@0',
        do: 'delete to line start',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[3,0]@0',
        do: 'Enter',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '',
          '[split:n2] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[4,0]@0',
        do: 'Enter',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '',
          '[split:n2] ',
          '[split:n3] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[3,0]@0',
        do: 'Backspace',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '',
          '[split:n3] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[3,0]@0',
        do: 'Backspace',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '[delete:n4] [delete:n4]',
          '[split:n3] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[1,2]@23',
        do: 'Backspace',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '[delete:n4] [delete:n4]',
          '[split:n3,join:n5] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[1,3]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.|y[insert:n6]',
          '[delete:n4] [delete:n4]',
          '[split:n3,join:n5] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[1,3]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.|yz[insert:n6]',
          '[delete:n4] [delete:n4]',
          '[split:n3,join:n5] Try typing your own suggestion here.[delete:n1]',
        ],
      },
    ],
  },
  {
    at: { offset: 3, path: [2, 0] },
    label: MAIN,
    name: 'Backspace then typing',
    steps: [
      {
        caret: '[2,0]@2',
        do: 'Backspace',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Tr|y[delete:n1]| typing your own suggestion here.',
        ],
      },
      {
        caret: '[2,1]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Tr|y[insert:n2]|y[delete:n1]| typing your own suggestion here.',
        ],
      },
      {
        caret: '[2,1]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Tr|yz[insert:n2]|y[delete:n1]| typing your own suggestion here.',
        ],
      },
    ],
  },
  {
    at: { offset: 0, path: [1, 0] },
    label: MAIN,
    name: "Backspace across a quote's edge",
    steps: [
      {
        caret: '[1,0]@1',
        do: 'type >',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          '>[insert:n1]|Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[1,0,0]@0',
        do: 'type  ',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.}',
          'Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[2,0]@4',
        do: 'ArrowDown',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.}',
          'Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[2,0]@0',
        do: 'Home',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.}',
          'Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[1,0,2]@23',
        do: 'Backspace',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft. / [insert:n3,join:n3] Try typing your own suggestion here.[insert:n3]}',
          '[delete:n3] Try typing your own suggestion here.[delete:n3]',
        ],
      },
      {
        caret: '[1,0,3]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.|y[insert:n4] / [insert:n3,join:n3] Try typing your own suggestion here.[insert:n3]}',
          '[delete:n3] Try typing your own suggestion here.[delete:n3]',
        ],
      },
      {
        caret: '[1,0,3]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.|yz[insert:n4] / [insert:n3,join:n3] Try typing your own suggestion here.[insert:n3]}',
          '[delete:n3] Try typing your own suggestion here.[delete:n3]',
        ],
      },
    ],
  },
  {
    at: { offset: 36, path: [2, 0] },
    label: MAIN,
    name: 'a quote rule over struck text',
    steps: [
      {
        caret: '[2,0]@0',
        do: 'delete to line start',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[2,0]@1',
        do: 'type >',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '>[insert:n2]|Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[2,0,0]@0',
        do: 'type  ',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'blockquote[wrap:n3]{Try typing your own suggestion here.[delete:n1]}',
        ],
      },
      {
        caret: '[2,0,0]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'blockquote[wrap:n3]{y[insert:n4]|Try typing your own suggestion here.[delete:n1]}',
        ],
      },
      {
        caret: '[2,0,0]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'blockquote[wrap:n3]{yz[insert:n4]|Try typing your own suggestion here.[delete:n1]}',
        ],
      },
    ],
  },
  {
    at: { offset: 36, path: [2, 0] },
    label: MAIN,
    name: 'a heading rule over struck text',
    steps: [
      {
        caret: '[2,0]@0',
        do: 'delete to line start',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[2,0]@1',
        do: 'type #',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          '#[insert:n2]|Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[2,0]@0',
        do: 'type  ',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'heading{level=1}[format(type):n3,format(level):n3] Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[2,0]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'heading{level=1}[format(type):n3,format(level):n3] y[insert:n4]|Try typing your own suggestion here.[delete:n1]',
        ],
      },
      {
        caret: '[2,0]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.',
          'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          'heading{level=1}[format(type):n3,format(level):n3] yz[insert:n4]|Try typing your own suggestion here.[delete:n1]',
        ],
      },
    ],
  },
  {
    at: {
      anchor: { offset: 7, path: [2, 0] },
      focus: { offset: 11, path: [2, 0] },
    },
    label: FORMAT,
    name: 'bold on plain text',
    steps: [
      {
        caret: '[2,1]@0..[2,1]@4',
        do: 'ControlOrMeta+B',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select |some{bold=true}[format(bold):n1]| text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[2,1]@4',
        do: 'ArrowRight',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select |some{bold=true}[format(bold):n1]| text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[2,2]@1',
        do: 'type y',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select |some{bold=true}[format(bold):n1]|y{bold=true}[insert:n2]| text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[2,2]@2',
        do: 'type z',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select |some{bold=true}[format(bold):n1]|yz{bold=true}[insert:n2]| text and try Bold, or press Enter to add a paragraph.',
        ],
      },
    ],
  },
  {
    at: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 29, path: [0, 0] },
    },
    label: FORMAT,
    name: 'bold off on the seeded bold sentence',
    steps: [
      {
        caret: '[0,0]@0..[0,0]@29',
        do: 'ControlOrMeta+B',
        tree: [
          'Make this sentence stand out.',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[0,0]@29',
        do: 'ArrowRight',
        tree: [
          'Make this sentence stand out.',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[0,1]@1',
        do: 'type y',
        tree: [
          'Make this sentence stand out.|y[insert:n1]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[0,1]@2',
        do: 'type z',
        tree: [
          'Make this sentence stand out.|yz[insert:n1]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
        ],
      },
    ],
  },
  {
    at: { offset: 0, path: [2, 0] },
    label: FORMAT,
    name: 'select all then bold over a document with an empty line',
    steps: [
      {
        caret: '[2,0]@65',
        do: 'End',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
        ],
      },
      {
        caret: '[3,0]@0',
        do: 'Enter',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
          '[split:n1] ',
        ],
      },
      {
        caret: '[0,0]@0..[3,0]@0',
        do: 'ControlOrMeta+A',
        tree: [
          'Make this sentence stand out.{bold=true}[format(bold):bold-sentence]',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
          '[split:n1] ',
        ],
      },
      {
        caret: '[0,0]@0..[2,0]@65',
        do: 'ControlOrMeta+B',
        tree: [
          'Make this sentence stand out.',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
          '[split:n1] ',
        ],
      },
      {
        caret: '[2,0]@65',
        do: 'ArrowRight',
        tree: [
          'Make this sentence stand out.',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.',
          '[split:n1] ',
        ],
      },
      {
        caret: '[2,1]@1',
        do: 'type y',
        tree: [
          'Make this sentence stand out.',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.|y[insert:n2]',
          '[split:n1] ',
        ],
      },
      {
        caret: '[2,1]@2',
        do: 'type z',
        tree: [
          'Make this sentence stand out.',
          '[insert:added-paragraph] A proposed paragraph adds the missing detail.[insert:added-paragraph]',
          'Select some text and try Bold, or press Enter to add a paragraph.|yz[insert:n2]',
          '[split:n1] ',
        ],
      },
    ],
  },
];

const MAIN_START = [
  'Review |collaboratively [insert:added-word]|and refine this sentence.',
  'Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
  'Try typing your own suggestion here.',
];

/** Cases that decide on cards end with each projection of what is left. */
const CARD_CASES: Array<
  Case & { final: { accepted: string[]; proposed: string[] } }
> = [
  {
    at: { offset: 36, path: [2, 0] },
    final: {
      accepted: [
        'Review and refine this sentence.',
        'Keep this redundant phrase out of the final draft.',
        'Try typing your own suggestion here.',
      ],
      proposed: [
        'Review collaboratively and refine this sentence.',
        'Keep this redundant phrase out of the final draft.',
        'Try typing your own suggestion here.yz',
      ],
    },
    label: MAIN,
    name: 'reject an inner deletion and accept an insertion on their cards, undo, then type',
    steps: [
      {
        caret: '[2,0]@36',
        do: 'card redundant phrase | redundant phrase | Reject',
        tree: [
          MAIN_START[0],
          'Keep this redundant phrase out of the final draft.',
          MAIN_START[2],
        ],
      },
      {
        caret: '[2,0]@36',
        do: 'card collaboratively | collaboratively | Accept',
        tree: [
          'Review collaboratively and refine this sentence.',
          'Keep this redundant phrase out of the final draft.',
          MAIN_START[2],
        ],
      },
      {
        caret: '[2,0]@36',
        do: 'ControlOrMeta+z',
        tree: [
          MAIN_START[0],
          'Keep this redundant phrase out of the final draft.',
          MAIN_START[2],
        ],
      },
      {
        caret: '[2,1]@1',
        do: 'type y',
        tree: [
          MAIN_START[0],
          'Keep this redundant phrase out of the final draft.',
          'Try typing your own suggestion here.|y[insert:n1]',
        ],
      },
      {
        caret: '[2,1]@2',
        do: 'type z',
        tree: [
          MAIN_START[0],
          'Keep this redundant phrase out of the final draft.',
          'Try typing your own suggestion here.|yz[insert:n1]',
        ],
      },
    ],
  },
  {
    at: { offset: 0, path: [1, 0] },
    final: {
      accepted: [
        'Review and refine this sentence.Try typing your own suggestion here.',
      ],
      proposed: [
        'Review collaboratively and refine this sentence.yzTry typing your own suggestion here.',
      ],
    },
    label: MAIN,
    name: 'accept a quote deletion on its card, then type where the caret was',
    steps: [
      {
        caret: '[1,0]@1',
        do: 'type >',
        tree: [
          MAIN_START[0],
          '>[insert:n1]|Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.',
          MAIN_START[2],
        ],
      },
      {
        caret: '[1,0,0]@0',
        do: 'type  ',
        tree: [
          MAIN_START[0],
          'blockquote[wrap:n2]{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.}',
          MAIN_START[2],
        ],
      },
      {
        caret: '[1,0,0]@0',
        do: 'card Keep this | Wrap in Blockquote | Accept',
        tree: [
          MAIN_START[0],
          'blockquote{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.}',
          MAIN_START[2],
        ],
      },
      {
        caret: '[0,2]@25..[2,0]@0',
        do: 'select [0,2]@25..[2,0]@0',
        tree: [
          MAIN_START[0],
          'blockquote{Keep this |redundant phrase [delete:removed-phrase]|out of the final draft.}',
          MAIN_START[2],
        ],
      },
      {
        caret: '[0,2]@25',
        do: 'Backspace',
        tree: [
          MAIN_START[0],
          'blockquote[delete:n3]{[delete:n3] Keep this [delete:n3]|redundant phrase [delete:removed-phrase,delete:n3]|out of the final draft.[delete:n3]}',
          '[join:n3] Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[0,2]@25',
        do: 'card Keep this | paragraph break | Accept',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[0,3]@1',
        do: 'type y',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.|y[insert:n4]|Try typing your own suggestion here.',
        ],
      },
      {
        caret: '[0,3]@2',
        do: 'type z',
        tree: [
          'Review |collaboratively [insert:added-word]|and refine this sentence.|yz[insert:n4]|Try typing your own suggestion here.',
        ],
      },
    ],
  },
];

for (const current of KEY_CASES) {
  test(`${current.name} records each key and keeps the caret where it was typed`, async ({
    page,
  }) => {
    await runCase(page, current, true);
  });
}

for (const current of CARD_CASES) {
  test(current.name, async ({ page }) => {
    const { editor } = await runCase(page, current, false);
    const project = await projector(page);
    const { accepted, proposed } = await project(await children(editor));

    expect({
      accepted: plainLines(accepted),
      proposed: plainLines(proposed),
    }).toEqual(current.final);
  });
}

const colorOf = (root: Locator, change: string, kind: string) =>
  root
    .locator(
      `[data-editor-node="text"][data-editor-authored-change~="${change}"][data-editor-authored-kind~="${kind}"]`
    )
    .first()
    .evaluate((element) => getComputedStyle(element).color);

test('Backspace then typing shows one card in one color, and two changes paint two colors', async ({
  page,
}) => {
  const current = KEY_CASES.find(
    (entry) => entry.name === 'Backspace then typing'
  )!;
  const { editor, root } = await runCase(page, current, false);
  const value = await children(editor);
  const changes = value[2].children!.flatMap((leaf) => leaf.authored ?? []);
  const inserted = changes.find((mark) => mark.kind === 'insert')!.change;
  const deleted = changes.find((mark) => mark.kind === 'delete')!.change;

  expect(await colorOf(root, inserted, 'insert')).toBe(
    await colorOf(root, deleted, 'delete')
  );
  expect(await colorOf(root, 'added-word', 'insert')).not.toBe(
    await colorOf(root, 'removed-phrase', 'delete')
  );
  await root
    .locator('div')
    .filter({ has: page.locator('[data-discussion-block-trigger]') })
    .filter({ hasText: 'typing your own' })
    .last()
    .locator('[data-discussion-block-trigger]')
    .first()
    .click();
  await expect(page.locator('[data-suggestion-review]')).toHaveCount(1);
});

test('reloading a saved snapshot brings back its suggestions and replies with a fresh undo history', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto(PAGE, { waitUntil: 'commit' });
  const label = 'Saved suggestions document';
  const saved = [
    'We ship |the update [insert:added-words]|on Friday.',
    'This |extra [delete:removed-word]|sentence can go.',
  ];
  const { container, editor, root } = await openDemo(page, label);
  const undo = container.getByRole('button', {
    name: 'Undo saved document change',
  });
  const card = page
    .locator('[data-suggestion-review]')
    .filter({ hasText: 'the update' });
  const openCard = async (scope: Locator) =>
    scope
      .locator('div')
      .filter({ has: page.locator('[data-discussion-block-trigger]') })
      .filter({ hasText: 'We ship' })
      .last()
      .locator('[data-discussion-block-trigger]')
      .first()
      .click();

  expect(formatter()(await children(editor))).toEqual(saved);
  await openCard(root);
  await card.getByRole('textbox', { name: 'Comment on suggestion' }).click();
  await page.keyboard.type('Looks good');
  await page.keyboard.press('Enter');
  await expect(card).toContainText('Looks good');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Save snapshot' }).click();
  await editor.selection.collapse({ offset: 16, path: [1, 2] });
  await editor.focus();
  await page.keyboard.type('yz');
  expect(formatter()(await children(editor))).toEqual([
    saved[0],
    `${saved[1]}|yz[insert:n1]`,
  ]);
  await expect(undo).toBeEnabled();

  await page.getByRole('button', { name: 'Reload snapshot' }).click();
  const reloaded = await openDemo(page, label);

  await expect
    .poll(async () => formatter()(await children(reloaded.editor)))
    .toEqual(saved);
  await expect(undo).toBeDisabled();
  await openCard(reloaded.root);
  await expect(card).toContainText('Looks good');
  errors.assertNone();
});

test('switching the read-only view shows each projection and decides nothing', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto(PAGE, { waitUntil: 'commit' });
  const { editor, root } = await openDemo(
    page,
    'Suggestion projection document'
  );
  const group = page.getByRole('group', { name: 'Document projection' });
  const review = [
    'We ship |the update [insert:added-words]|on Friday.',
    'This |extra [delete:removed-word]|sentence can go.',
  ];

  for (const [view, text] of [
    ['Accepted', 'We ship on Friday.\nThis extra sentence can go.'],
    ['Proposed', 'We ship the update on Friday.\nThis sentence can go.'],
    ['Markup', 'We ship the update on Friday.\nThis extra sentence can go.'],
  ] as const) {
    await group.getByRole('radio', { name: view }).click();
    await expect(root).toHaveText(text.replace('\n', ''));
    expect(await root.innerText()).toBe(text);
    expect(formatter()(await children(editor))).toEqual(review);
  }
  errors.assertNone();
});

const insert = (author: string, change: string, at: number) => ({
  at,
  author,
  change,
  kind: 'insert',
});
const level = (author: string, change: string, at: number) => ({
  at,
  author,
  before: 1,
  change,
  id: `${change}:level`,
  key: 'level',
  kind: 'format',
  write: { kind: 'set', value: 2 },
});

const openReview = async (
  page: Page,
  user: string,
  value: readonly ReviewNode[]
) => {
  await page.goto(
    `/dev/authored-review?fixture=review&intent=propose&user=${user}`,
    { waitUntil: 'commit' }
  );
  await page.waitForFunction(() => !!window.authoredProof?.load);
  const root = page.locator(
    '[data-editor="true"][aria-label="Review document"]'
  );
  const editor = createBrowserEditorHarness(page, 'Review document', root);

  await root.waitFor();
  await page.evaluate(
    (loaded) => window.authoredProof!.load(loaded),
    value as unknown[]
  );
  return { editor, root };
};

const stalePaint = (root: Locator) =>
  root.evaluate((element) =>
    [
      ...element.querySelectorAll(
        '[data-editor-node][data-editor-authored-change]'
      ),
    ].flatMap((node) => {
      const changes = node.getAttribute('data-editor-authored-change')!;
      const oneChange = !changes.includes(' ');
      const card = window.authoredProof!.cardOf(changes);
      const painted = {
        color: node.getAttribute('data-editor-authored-color'),
        groups: node.getAttribute('data-editor-authored-groups'),
      };

      return !oneChange ||
        (painted.groups === card?.id && painted.color === String(card.slot))
        ? []
        : [{ card, changes, painted }];
    })
  );

const litTexts = (root: Locator) =>
  root.evaluate((element) => {
    const active = document
      .querySelector('style[data-editor-suggestion-active]')
      ?.getAttribute('data-editor-suggestion-active');
    const card = active ? window.authoredProof!.cardOf(active)?.id : null;

    return [
      ...element.querySelectorAll(
        '[data-editor-node][data-editor-authored-groups]'
      ),
    ]
      .filter(
        (node) =>
          card &&
          node
            .getAttribute('data-editor-authored-groups')!
            .split(' ')
            .includes(card)
      )
      .map((node) => node.textContent);
  });

const backgroundOf = (root: Locator, text: string) =>
  root
    .locator('[data-editor-node="text"][data-editor-authored-change]', {
      hasText: new RegExp(`^${text}$`),
    })
    .evaluate((node) => getComputedStyle(node).backgroundColor);

const LEVELS_AROUND_BOLD = [
  {
    authored: [level('alice', 'alice:1', 1)],
    children: [
      { text: 'One ' },
      {
        authored: [
          {
            at: 3,
            author: 'bob',
            change: 'bob:1',
            id: 'bob:1:bold',
            key: 'bold',
            kind: 'format',
            write: { kind: 'set', value: true },
          },
        ],
        bold: true,
        text: 'bold',
      },
    ],
    level: 2,
    type: 'heading',
  },
  {
    authored: [level('alice', 'alice:2', 2)],
    children: [{ text: 'Two' }],
    level: 2,
    type: 'heading',
  },
];

test('paints and opens Bob’s own card for text he types inside Alice’s insertion', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { editor, root } = await openReview(page, 'bob', [
    {
      children: [
        { text: 'Start ' },
        { authored: [insert('alice', 'alice:1', 1)], text: 'alice words' },
        { text: ' end' },
      ],
      type: 'paragraph',
    },
  ]);

  await editor.dom.clickTextOffset({ offset: 6, path: [0, 1] });
  await page.keyboard.press('x');
  const typedValue = await children(editor);
  const bob = typedValue[0]
    .children!.flatMap((leaf) => leaf.authored ?? [])
    .find((mark) => mark.author === 'bob')!.change;
  const typed = root.locator('[data-editor-node="text"]', { hasText: /^x$/ });

  await editor.dom.clickTextOffset({ offset: 2, path: [0, 0] });
  expect(await typed.getAttribute('data-editor-authored-color')).toBe(
    String(
      await page.evaluate((id) => window.authoredProof!.cardOf(id)!.slot, bob)
    )
  );
  await typed.click();
  const card = page.locator(`[data-suggestion-review="${bob}"]`);

  await expect(card).toBeVisible();
  await card.hover();
  await card.getByRole('button', { name: 'Accept suggestion' }).click();

  await expect
    .poll(async () => plainLines(await children(editor)).at(-1))
    .toBe('Start |alice xwords[insert:n1]| end');
  errors.assertNone();
});

test('lights a whole card from its second change, text under another’s deletion included, and no other card of its color', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { editor, root } = await openReview(page, 'alice', [
    {
      children: [
        { text: 'A ' },
        { authored: [insert('alice', 'alice:1', 1)], text: 'one' },
        { authored: [insert('alice', 'alice:2', 2)], text: 'tw' },
        {
          authored: [
            insert('alice', 'alice:2', 2),
            { at: 3, author: 'bob', change: 'bob:1', kind: 'delete' },
          ],
          text: 'o',
        },
      ],
      type: 'paragraph',
    },
    {
      children: [
        { text: 'B ' },
        { authored: [insert('carol', 'carol:1', 4)], text: 'carol' },
      ],
      type: 'paragraph',
    },
  ]);

  await editor.dom.clickTextOffset({ offset: 1, path: [0, 2] });
  await page.mouse.move(0, 0);
  const lit = await backgroundOf(root, 'tw');

  expect({
    carolLit: (await backgroundOf(root, 'carol')) === lit,
    carolSlotIsAlices: await page.evaluate(
      () =>
        window.authoredProof!.cardOf('carol:1')!.slot ===
        window.authoredProof!.cardOf('alice:1')!.slot
    ),
    lit: await litTexts(root),
    oneLit: (await backgroundOf(root, 'one')) === lit,
    struckLit: (await backgroundOf(root, 'o')) === lit,
  }).toEqual({
    carolLit: false,
    carolSlotIsAlices: true,
    lit: ['one', 'tw', 'o'],
    oneLit: true,
    struckLit: true,
  });
  errors.assertNone();
});

test('keeps a younger active card active through a decision that merges it', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { editor, root } = await openReview(page, 'carol', LEVELS_AROUND_BOLD);

  await editor.dom.clickTextOffset({ offset: 1, path: [1, 0] });
  expect(await litTexts(root)).toEqual(['Two']);
  await page.evaluate(() =>
    window.authoredProof!.decide({ action: 'accept', changes: ['bob:1'] })
  );

  await expect.poll(() => litTexts(root)).toEqual(['One bold', 'Two']);
  errors.assertNone();
});

test('keeps a card active when its oldest change’s earliest text is withdrawn', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { editor, root } = await openReview(page, 'alice', [
    {
      children: [
        { text: 'Keep ' },
        { authored: [insert('alice', 'alice:1', 1)], text: 'old' },
        { authored: [insert('alice', 'alice:2', 2)], text: 'new' },
        { authored: [insert('alice', 'alice:1', 3)], text: 'more' },
      ],
      type: 'paragraph',
    },
  ]);

  await editor.dom.clickTextOffset({ offset: 1, path: [0, 2] });
  await editor.selection.select({
    anchor: { offset: 0, path: [0, 1] },
    focus: { offset: 3, path: [0, 1] },
  });
  await page.keyboard.press('Backspace');

  await expect
    .poll(async () => ({
      card: await page.evaluate(
        () => window.authoredProof!.cardOf('alice:1')?.id
      ),
      lit: await litTexts(root),
    }))
    .toEqual({ card: 'alice:2', lit: ['new', 'more'] });
  errors.assertNone();
});

test('shows a merged format card on the heading the decision did not write', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { editor, root } = await openReview(page, 'carol', LEVELS_AROUND_BOLD);
  const gutterOf = (index: number) =>
    root
      .locator('[data-editor-node="element"]')
      .nth(index)
      .evaluate((node) => getComputedStyle(node, '::after').backgroundColor);

  await page.evaluate(() =>
    window.authoredProof!.decide({ action: 'accept', changes: ['bob:1'] })
  );
  await expect
    .poll(() =>
      root
        .locator('[data-editor-node="element"]')
        .nth(1)
        .getAttribute('data-editor-authored-groups')
    )
    .toBe('alice:1');
  expect(await gutterOf(1)).toBe(await gutterOf(0));
  await editor.dom.clickTextOffset({ offset: 1, path: [1, 0] });

  expect({
    active: await page
      .locator('style[data-editor-suggestion-active]')
      .getAttribute('data-editor-suggestion-active'),
    lit: await litTexts(root),
  }).toEqual({ active: 'alice:1', lit: ['One bold', 'Two'] });
  errors.assertNone();
});

test('repaints every highlight of a card a decision merges in a block it does not write', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { root } = await openReview(page, 'carol', LEVELS_AROUND_BOLD);

  await page.evaluate(() =>
    window.authoredProof!.decide({ action: 'accept', changes: ['bob:1'] })
  );

  await expect
    .poll(async () => ({
      card: await page.evaluate(
        () => window.authoredProof!.cardOf('alice:2')?.id
      ),
      stale: await stalePaint(root),
    }))
    .toEqual({ card: 'alice:1', stale: [] });
  errors.assertNone();
});

for (const [oldest, ats, renamed] of [
  ['before the key', [1, 2, 3, 4], 'alice:2'],
  ['after the key', [4, 3, 2, 1], 'alice:1'],
] as const) {
  test(`repaints every highlight of a card another author’s key splits, with the oldest change ${oldest}`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { editor, root } = await openReview(
      page,
      'carol',
      ats.map((at, index) => ({
        authored: [insert('alice', `alice:${index}`, at)],
        children: [{ text: `line ${index}` }],
        type: 'paragraph',
      }))
    );

    await editor.dom.clickTextOffset({ offset: 2, path: [1, 0] });
    await page.keyboard.press('z');

    await expect
      .poll(async () => ({
        card: await page.evaluate(
          (id) => window.authoredProof!.cardOf(id)?.id,
          oldest === 'before the key' ? 'alice:3' : 'alice:0'
        ),
        stale: await stalePaint(root),
      }))
      .toEqual({ card: renamed, stale: [] });
    errors.assertNone();
  });
}

test('paints a bold toggle’s suggestion at once', async ({
  page,
}, testInfo) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto(PAGE, { waitUntil: 'commit' });
  const { container, editor, root } = await openDemo(page, FORMAT);

  await editor.selection.select({
    anchor: { offset: 7, path: [2, 0] },
    focus: { offset: 11, path: [2, 0] },
  });
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+B');
  const painted = await root
    .locator('[data-editor-node="text"]', { hasText: /^some$/ })
    .evaluate((node) => ({
      bold: getComputedStyle(node.querySelector('[data-editor-string]')!)
        .fontWeight,
      color: node.getAttribute('data-editor-authored-color'),
      kind: node.getAttribute('data-editor-authored-kind'),
    }));

  await container.screenshot({ path: testInfo.outputPath('bold-toggle.png') });
  expect(painted).toEqual({
    bold: '700',
    color: expect.stringMatching(/^[0-6]$/),
    kind: 'format',
  });
  errors.assertNone();
});
