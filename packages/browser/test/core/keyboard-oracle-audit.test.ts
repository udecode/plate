import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const examplesDir = fileURLToPath(
  new URL('../../../../playwright/integration/examples/', import.meta.url)
);

const hasExampleSpecs = () => existsSync(examplesDir);

const classifiedInsertText = {
  'document-state.test.ts': {
    'keeps Cyrillic input stable with spellcheck enabled':
      'unicode text insertion guard',
  },
  'inlines.test.ts': {
    'types a fullwidth punctuation character after a toolbar link once':
      'unicode punctuation insertion guard',
  },
  'plaintext.test.ts': {
    'applies beforeinput target ranges for browser text substitutions':
      'beforeinput target-range setup',
    'applies delete target ranges over multi-code-unit graphemes exactly':
      'beforeinput target-range setup',
    'applies delete target ranges over preserved repeated spaces exactly':
      'beforeinput target-range setup',
    'applies deleteSoftLineBackward target ranges exactly':
      'beforeinput target-range setup',
    'applies deleteWord target ranges over tab whitespace exactly':
      'beforeinput target-range setup',
    'applies insertTranspose beforeinput as adjacent character transpose':
      'beforeinput target-range setup',
    'captures native beforeinput trace while inserting text':
      'native beforeinput trace',
    'copies a visually wrapped long paragraph without hard-wrap newlines':
      'long fixture setup',
    'deletes backward between identical adjacent characters':
      'native delete fixture setup',
    'deletes the current line backward without touching the previous block':
      'native delete fixture setup',
    'keeps Backspace in an empty first block from deleting it':
      'native delete fixture setup',
    'keeps Shift+ArrowLeft backward selection inside one paragraph':
      'native selection fixture setup',
    'keeps Shift+ArrowRight cross-block selection on real text':
      'native selection fixture setup',
    'keeps browser line-end movement within the current block':
      'native movement fixture setup',
    'keeps surrounding symbols in browser word movement':
      'native movement fixture setup',
    'moves ArrowLeft through ligature-prone repeated letters':
      'native movement fixture setup',
    'moves ArrowRight and ArrowLeft into a middle empty block':
      'native movement fixture setup',
    'moves ArrowRight out of an empty leading block':
      'native movement fixture setup',
    'moves word forward out of an empty leading block':
      'native movement fixture setup',
    'pastes at the clicked caret after Shift state is released':
      'paste fixture setup',
    'replaces a multi-paragraph selection with typed text':
      'fixture setup; replacement path uses keyboard.type',
    'supports WebKit hard-line backward delete without command errors':
      'native delete fixture setup',
  },
  'richtext.test.ts': {
    'applies native beforeinput history undo and redo':
      'native beforeinput history setup',
    'clears selected rich text formatting without dropping semantic blocks':
      'formatting fixture setup',
    'commits IME composition through an active mark before a formatted sibling':
      'IME fixture setup',
    'deletes rich text line selection after WebKit compositionend':
      'WebKit composition fixture setup',
    'exposes input intent for start insert, number insert, and delete':
      'native input-intent probe',
    'hides the visible caret after tabbing out of the editor':
      'visual caret fixture setup',
    'inserts text through browser input': 'browser input probe',
    'keeps caret editable after browser Backspace at selected text end':
      'browser delete recovery probe',
    'keeps caret editable after browser Backspace deletes selected range':
      'browser delete recovery probe',
    'keeps caret editable after browser Delete before trailing punctuation':
      'browser delete recovery probe',
    'keeps caret editable after browser Delete deletes selected range':
      'browser delete recovery probe',
    'keeps caret visible while typing in a scrollable editor ${scrollTarget}':
      'scrollable fixture setup',
    'keeps model and DOM coherent after persistent native word-delete':
      'native word-delete recovery probe',
    'keeps rendered DOM shape after repeated leaf-boundary word-delete':
      'native word-delete recovery probe',
    'keeps the visual caret after browser insertion at the selected text end':
      'browser insertion probe',
    'keeps the visual caret after browser insertion before trailing punctuation':
      'browser insertion probe',
    'keeps the visual caret after browser insertion inside a text leaf':
      'browser insertion probe',
    'opens a line with Mac Ctrl+O without moving past following text':
      'Mac line-open fixture setup',
    'opens and rejoins a line before emoji text': 'emoji fixture setup',
    'places a right-margin click at the multi-leaf text end':
      'browser insertion probe',
    'preserves the selected heading block after browser text replacement':
      'browser replacement probe',
    'removes the current block after browser triple click and Backspace':
      'browser delete recovery probe',
    'resolves ambiguous browser insertion at a mark boundary':
      'browser insertion probe',
    'syncs browser text mutations inside bold markup':
      'browser DOM-mutation probe',
    'syncs browser text mutations inside nested mark DOM':
      'browser DOM-mutation probe',
    'types at the browser-selected end of a block':
      'browser-selected insertion probe',
    'undoes inserted text': 'single-operation undo grouping',
  },
  'shadow-dom.test.ts': {
    __module_helper__: 'shadow-root fallback text insertion helper',
  },
} as const;

const classifiedProjectGatedReturns = {
  'huge-document.test.ts': {
    'keeps repeated typing visible after manual scroll-away': {
      "if (testInfo.project.name === 'mobile') {":
        'mobile branch uses semantic insertText fallback before the same visibility assertions',
    },
  },
  'richtext.test.ts': {
    'does not duplicate native input handling after route remount': {
      "if (testInfo.project.name === 'mobile') {":
        'mobile branch uses semantic insertText fallback before the same remount assertions',
    },
  },
  'shadow-dom.test.ts': {
    __module_helper__: {
      "if (projectName === 'mobile') {":
        'mobile branch uses keyboard.type and rejoins the same shadow-DOM assertions',
      "if (browserName === 'webkit') {":
        'WebKit branch uses pressSequentially and rejoins the same shadow-DOM assertions',
    },
  },
} as const;

const testTitlePattern = /\btest\((['"`])([^'"`]+?)\1/;

const findInsertTextUsages = () => {
  const usages: Array<{
    file: string;
    line: number;
    source: string;
    title: string;
  }> = [];

  if (!hasExampleSpecs()) return usages;

  for (const file of readdirSync(examplesDir).sort()) {
    if (!file.endsWith('.test.ts') || file === 'pagination.test.ts') continue;

    const lines = readFileSync(join(examplesDir, file), 'utf8').split('\n');
    let title = '__module_helper__';

    lines.forEach((source, index) => {
      const match = source.match(testTitlePattern);

      if (match) {
        title = match[2];
      }

      if (source.includes('page.keyboard.insertText(')) {
        usages.push({
          file,
          line: index + 1,
          source: source.trim(),
          title,
        });
      }
    });
  }

  return usages;
};

const readIfBlock = (lines: string[], index: number) => {
  let block = '';
  let depth = 0;
  let inString: string | null = null;
  let escaped = false;
  let seenOpen = false;

  for (let lineIndex = index; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    block += `${line}\n`;

    for (const character of line) {
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === inString) {
          inString = null;
        }

        continue;
      }

      if (character === '"' || character === "'" || character === '`') {
        inString = character;
      } else if (character === '{') {
        depth += 1;
        seenOpen = true;
      } else if (character === '}') {
        depth -= 1;

        if (seenOpen && depth === 0) {
          return block;
        }
      }
    }
  }

  return block;
};

const hasProjectGatedReturn = (lines: string[], index: number) => {
  const branchBlock = readIfBlock(lines, index);

  return branchBlock.includes('test.skip')
    ? false
    : /\breturn\b/.test(branchBlock);
};

const findProjectGatedReturns = () => {
  const usages: Array<{
    file: string;
    line: number;
    source: string;
    title: string;
  }> = [];

  if (!hasExampleSpecs()) return usages;

  for (const file of readdirSync(examplesDir).sort()) {
    if (!file.endsWith('.test.ts') || file === 'pagination.test.ts') continue;

    const lines = readFileSync(join(examplesDir, file), 'utf8').split('\n');
    let title = '__module_helper__';

    lines.forEach((source, index) => {
      const match = source.match(testTitlePattern);

      if (match) {
        title = match[2];
      }

      if (
        !/^\s*if\s*\(/.test(source) ||
        !/(testInfo\.project\.name|browserName|projectName)/.test(source)
      ) {
        return;
      }

      if (!hasProjectGatedReturn(lines, index)) {
        return;
      }

      usages.push({
        file,
        line: index + 1,
        source: source.trim(),
        title,
      });
    });
  }

  return usages;
};

const readSkipCall = (lines: string[], index: number) => {
  let call = '';
  let depth = 0;
  let inString: string | null = null;
  let escaped = false;
  let seenOpen = false;

  for (let lineIndex = index; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const start = lineIndex === index ? line.indexOf('test.skip') : 0;
    const slice = line.slice(start);

    call += `${slice}\n`;

    for (const character of slice) {
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === inString) {
          inString = null;
        }

        continue;
      }

      if (character === '"' || character === "'" || character === '`') {
        inString = character;
      } else if (character === '(') {
        depth += 1;
        seenOpen = true;
      } else if (character === ')') {
        depth -= 1;

        if (seenOpen && depth === 0) {
          return call;
        }
      }
    }
  }

  return call;
};

const findWeakSkipReasons = () => {
  const skipReasonPattern = /test\.skip\s*\([\s\S]*?,\s*(['"`])([^'"`]+)\1/;
  const weakReasonPattern =
    /\b(flaky|todo|fixme|temporary|temporar(?:y|ily)?|broken|fails?|disabled|workaround|skip for now)\b/i;
  const issues: Array<{
    file: string;
    line: number;
    reason: string;
    source: string;
  }> = [];

  if (!hasExampleSpecs()) return issues;

  for (const file of readdirSync(examplesDir).sort()) {
    if (!file.endsWith('.test.ts') || file === 'pagination.test.ts') continue;

    const lines = readFileSync(join(examplesDir, file), 'utf8').split('\n');

    lines.forEach((source, index) => {
      if (!source.includes('test.skip')) return;

      const call = readSkipCall(lines, index);
      const reason = call.match(skipReasonPattern)?.[2];

      if (!reason || weakReasonPattern.test(reason)) {
        issues.push({
          file,
          line: index + 1,
          reason: reason ?? '<missing literal reason>',
          source: call.replace(/\s+/g, ' ').trim(),
        });
      }
    });
  }

  return issues;
};

describe('keyboard oracle audit', () => {
  test('classifies every low-level Playwright text insertion in example specs', () => {
    const unclassified = findInsertTextUsages().filter(
      ({ file, title }) =>
        !(
          file in classifiedInsertText &&
          title in
            classifiedInsertText[file as keyof typeof classifiedInsertText]
        )
    );

    expect(unclassified).toEqual([]);
  });

  test('keeps classifications tied to live low-level insertions', () => {
    if (!hasExampleSpecs()) {
      expect(hasExampleSpecs()).toBe(false);
      return;
    }

    const liveKeys = new Set(
      findInsertTextUsages().map(({ file, title }) => `${file} :: ${title}`)
    );
    const stale = Object.entries(classifiedInsertText).flatMap(
      ([file, titles]) =>
        Object.keys(titles)
          .map((title) => `${file} :: ${title}`)
          .filter((key) => !liveKeys.has(key))
    );

    expect(stale).toEqual([]);
  });

  test('classifies every project-gated return branch in example specs', () => {
    const unclassified = findProjectGatedReturns().filter(
      ({ file, source, title }) =>
        !(
          file in classifiedProjectGatedReturns &&
          title in
            classifiedProjectGatedReturns[
              file as keyof typeof classifiedProjectGatedReturns
            ] &&
          source in
            classifiedProjectGatedReturns[
              file as keyof typeof classifiedProjectGatedReturns
            ][
              title as keyof (typeof classifiedProjectGatedReturns)[keyof typeof classifiedProjectGatedReturns]
            ]
        )
    );

    expect(unclassified).toEqual([]);
  });

  test('detects project-gated returns after longer branch setup', () => {
    expect(
      hasProjectGatedReturn(
        [
          "if (testInfo.project.name === 'mobile') {",
          "  await editor.assert.text('same setup')",
          '  await editor.selection.select({',
          '    anchor: { path: [0, 0], offset: 0 },',
          '    focus: { path: [0, 0], offset: 0 },',
          '  })',
          "  await editor.insertText('x')",
          '  return',
          '}',
        ],
        0
      )
    ).toBe(true);
  });

  test('keeps project-gated return classifications tied to live branches', () => {
    if (!hasExampleSpecs()) {
      expect(hasExampleSpecs()).toBe(false);
      return;
    }

    const liveKeys = new Set(
      findProjectGatedReturns().map(
        ({ file, source, title }) => `${file} :: ${title} :: ${source}`
      )
    );
    const stale = Object.entries(classifiedProjectGatedReturns).flatMap(
      ([file, titles]) =>
        Object.entries(titles).flatMap(([title, sources]) =>
          Object.keys(sources)
            .map((source) => `${file} :: ${title} :: ${source}`)
            .filter((key) => !liveKeys.has(key))
        )
    );

    expect(stale).toEqual([]);
  });

  test('keeps example spec skips scoped and explicitly justified', () => {
    expect(findWeakSkipReasons()).toEqual([]);
  });
});
