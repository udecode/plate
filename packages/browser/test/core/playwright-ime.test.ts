import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import type { Frame, Page } from '@playwright/test';

import {
  composeText,
  enableCompositionKeyEvents,
} from '../../src/playwright/ime';

const createPage = () =>
  ({
    context: () => ({
      browser: () => ({
        browserType: () => ({
          name: () => 'chromium',
        }),
      }),
      newCDPSession: async () => {
        throw new Error('CDP should not be used for synthetic composition');
      },
    }),
    evaluate: async () => {
      throw new Error('Synthetic composition evaluated in the top-level page');
    },
  }) as unknown as Page;

const createSurface = () =>
  ({
    evaluate: async <Result, Arg>(callback: (arg: Arg) => Result, arg: Arg) =>
      callback(arg),
  }) as unknown as Frame;

describe('playwright IME helpers', () => {
  beforeAll(() => {
    if (!GlobalRegistrator.isRegistered) {
      GlobalRegistrator.register();
    }
  });

  afterAll(async () => {
    if (GlobalRegistrator.isRegistered) {
      await GlobalRegistrator.unregister();
    }
  });

  test('runs synthetic composition against the resolved editor surface', async () => {
    document.body.innerHTML = '<div contenteditable="true">hello</div>';

    const active = document.querySelector('div')!;
    const text = active.firstChild as Text;
    const range = document.createRange();
    const selection = window.getSelection()!;
    const events: string[] = [];

    active.addEventListener('compositionstart', (event) => {
      events.push(event.type);
    });
    active.addEventListener('compositionupdate', (event) => {
      events.push(event.type);
    });
    active.addEventListener('compositionend', (event) => {
      events.push(event.type);
    });
    active.addEventListener('beforeinput', (event) => {
      events.push(
        `${event.type}:${(event as InputEvent).inputType}:${(event as InputEvent).data}`
      );
    });
    active.addEventListener('input', (event) => {
      events.push(
        `${event.type}:${(event as InputEvent).inputType}:${(event as InputEvent).data}`
      );
    });

    active.focus();
    range.setStart(text, 1);
    range.setEnd(text, 4);
    selection.removeAllRanges();
    selection.addRange(range);

    await composeText(createPage(), createSurface(), ['é'], 'é', {
      transport: 'synthetic',
    });

    expect(active.textContent).toBe('héo');
    expect(events).toEqual([
      'compositionstart',
      'compositionupdate',
      'beforeinput:insertFromComposition:é',
      'input:insertFromComposition:é',
      'compositionend',
    ]);
  });

  test('does not mutate DOM when synthetic composition beforeinput is handled', async () => {
    document.body.innerHTML = '<div contenteditable="true">hello</div>';

    const active = document.querySelector('div')!;
    const text = active.firstChild as Text;
    const range = document.createRange();
    const selection = window.getSelection()!;
    const events: string[] = [];

    active.addEventListener('beforeinput', (event) => {
      const inputEvent = event as InputEvent;
      events.push(`${event.type}:${inputEvent.inputType}:${inputEvent.data}`);
      event.preventDefault();
    });
    active.addEventListener('input', (event) => {
      events.push(
        `${event.type}:${(event as InputEvent).inputType}:${(event as InputEvent).data}`
      );
    });
    active.addEventListener('compositionend', (event) => {
      events.push(event.type);
    });

    active.focus();
    range.setStart(text, 1);
    range.setEnd(text, 4);
    selection.removeAllRanges();
    selection.addRange(range);

    await composeText(createPage(), createSurface(), ['é'], 'é', {
      transport: 'synthetic',
    });

    expect(active.textContent).toBe('hello');
    expect(events).toEqual([
      'beforeinput:insertFromComposition:é',
      'compositionend',
    ]);
  });

  test('creates a DOM composition fallback when beforeinput is handled without a model change', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">hello</div>';

    const active = document.querySelector('div')! as HTMLDivElement & {
      __slateBrowserHandle?: { getText: () => string };
    };
    const text = active.firstChild as Text;
    const range = document.createRange();
    const selection = window.getSelection()!;
    const events: string[] = [];

    active.__slateBrowserHandle = {
      getText: () => 'hello',
    };
    active.addEventListener('beforeinput', (event) => {
      const inputEvent = event as InputEvent;
      events.push(`${event.type}:${inputEvent.inputType}:${inputEvent.data}`);
      event.preventDefault();
    });
    active.addEventListener('input', (event) => {
      events.push(
        `${event.type}:${(event as InputEvent).inputType}:${(event as InputEvent).data}`
      );
    });
    active.addEventListener('compositionend', (event) => {
      events.push(event.type);
    });

    active.focus();
    range.setStart(text, 1);
    range.setEnd(text, 4);
    selection.removeAllRanges();
    selection.addRange(range);

    await composeText(createPage(), createSurface(), ['é'], 'é', {
      transport: 'synthetic',
    });

    expect(active.textContent).toBe('héo');
    expect(events).toEqual([
      'beforeinput:insertFromComposition:é',
      'input:insertFromComposition:é',
      'compositionend',
    ]);
  });

  test('dispatches input when desktop synthetic composition falls back to DOM repair', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">hello</div>';

    const active = document.querySelector('div')! as HTMLDivElement & {
      __slateBrowserHandle?: {
        getText: () => string;
        insertText: (text: string) => void;
      };
    };
    const text = active.firstChild as Text;
    const range = document.createRange();
    const selection = window.getSelection()!;
    const events: string[] = [];
    let insertedText: string | null = null;

    active.__slateBrowserHandle = {
      getText: () => 'hello',
      insertText: (nextText: string) => {
        insertedText = nextText;
        active.textContent = `h${nextText}o`;
      },
    };
    active.addEventListener('beforeinput', (event) => {
      const inputEvent = event as InputEvent;
      events.push(`${event.type}:${inputEvent.inputType}:${inputEvent.data}`);
      event.preventDefault();
    });
    active.addEventListener('input', (event) => {
      events.push(
        `${event.type}:${(event as InputEvent).inputType}:${(event as InputEvent).data}`
      );
    });
    active.addEventListener('compositionend', (event) => {
      events.push(event.type);
    });

    active.focus();
    range.setStart(text, 1);
    range.setEnd(text, 4);
    selection.removeAllRanges();
    selection.addRange(range);

    await composeText(createPage(), createSurface(), ['é'], 'é', {
      transport: 'synthetic',
    });

    expect(insertedText).toBe(null);
    expect(active.textContent).toBe('héo');
    expect(events).toEqual([
      'beforeinput:insertFromComposition:é',
      'input:insertFromComposition:é',
      'compositionend',
    ]);
  });

  test('projects model selection before synthetic composition fallback edits the DOM', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">This is editable rich</div>';

    const active = document.querySelector('div')! as HTMLDivElement & {
      __slateBrowserHandle?: {
        getSelection: () => unknown;
        getText: () => string;
        setNativeDOMSelection: (selection: unknown) => boolean;
      };
    };
    const text = active.firstChild as Text;
    const range = document.createRange();
    const selection = window.getSelection()!;
    let projected = false;

    active.__slateBrowserHandle = {
      getSelection: () => ({
        anchor: { offset: 'This is '.length, path: [0, 0] },
        focus: { offset: 'This is '.length, path: [0, 0] },
      }),
      getText: () => 'This is editable rich',
      setNativeDOMSelection: () => {
        const projectedRange = document.createRange();

        projected = true;
        projectedRange.setStart(text, 'This is '.length);
        projectedRange.setEnd(text, 'This is '.length);
        selection.removeAllRanges();
        selection.addRange(projectedRange);

        return true;
      },
    };
    active.addEventListener('beforeinput', (event) => {
      event.preventDefault();
    });

    active.focus();
    range.setStart(text, 'This is '.length);
    range.setEnd(text, 'This is editable '.length);
    selection.removeAllRanges();
    selection.addRange(range);

    await composeText(createPage(), createSurface(), ['e'], 'e', {
      transport: 'synthetic',
    });

    expect(active.textContent).toBe('This is eeditable rich');
    expect(projected).toBe(true);
  });

  test('uses semantic fallback for mobile synthetic composition when a Slate handle is available', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">This is editable rich</div>';

    const originalMaxTouchPoints = navigator.maxTouchPoints;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    });

    try {
      const active = document.querySelector('div')! as HTMLDivElement & {
        __slateBrowserHandle?: {
          getSelection: () => unknown;
          getText: () => string;
          insertText: (text: string) => void;
          setNativeDOMSelection: (selection: unknown) => boolean;
        };
      };
      const text = active.firstChild as Text;
      const range = document.createRange();
      const selection = window.getSelection()!;
      let insertedText: string | null = null;

      active.__slateBrowserHandle = {
        getSelection: () => ({
          anchor: { offset: 'This is '.length, path: [0, 0] },
          focus: { offset: 'This is '.length, path: [0, 0] },
        }),
        getText: () => 'This is editable rich',
        insertText: (nextText: string) => {
          insertedText = nextText;
          active.textContent = `This is ${nextText}editable rich`;
        },
        setNativeDOMSelection: () => true,
      };
      active.addEventListener('beforeinput', (event) => {
        event.preventDefault();
      });

      active.focus();
      range.setStart(text, 'This is '.length);
      range.setEnd(text, 'This is editable '.length);
      selection.removeAllRanges();
      selection.addRange(range);

      await composeText(createPage(), createSurface(), ['e'], 'e', {
        transport: 'synthetic',
      });

      expect(insertedText).toBe('e');
      expect(active.textContent).toBe('This is eeditable rich');
    } finally {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        configurable: true,
        value: originalMaxTouchPoints,
      });
    }
  });

  test('keeps unhandled mobile synthetic composition on the DOM input path', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">hello</div>';

    const originalMaxTouchPoints = navigator.maxTouchPoints;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    });

    try {
      const active = document.querySelector('div')! as HTMLDivElement & {
        __slateBrowserHandle?: {
          getText: () => string;
          insertText: (text: string) => void;
        };
      };
      const text = active.firstChild as Text;
      const range = document.createRange();
      const selection = window.getSelection()!;
      const events: string[] = [];
      let insertedText: string | null = null;

      active.__slateBrowserHandle = {
        getText: () => 'hello',
        insertText: (nextText: string) => {
          insertedText = nextText;
        },
      };
      active.addEventListener('beforeinput', (event) => {
        const inputEvent = event as InputEvent;
        events.push(`${event.type}:${inputEvent.inputType}:${inputEvent.data}`);
      });
      active.addEventListener('input', (event) => {
        events.push(
          `${event.type}:${(event as InputEvent).inputType}:${(event as InputEvent).data}`
        );
      });

      active.focus();
      range.setStart(text, 1);
      range.setEnd(text, 4);
      selection.removeAllRanges();
      selection.addRange(range);

      await composeText(createPage(), createSurface(), ['é'], 'é', {
        transport: 'synthetic',
      });

      expect(insertedText).toBe(null);
      expect(active.textContent).toBe('héo');
      expect(events).toEqual([
        'beforeinput:insertFromComposition:é',
        'input:insertFromComposition:é',
      ]);
    } finally {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        configurable: true,
        value: originalMaxTouchPoints,
      });
    }
  });

  test('uses semantic fallback for unhandled mobile synthetic composition with a Slate selection handle', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">This is editable rich</div>';

    const originalMaxTouchPoints = navigator.maxTouchPoints;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    });

    try {
      const active = document.querySelector('div')! as HTMLDivElement & {
        __slateBrowserHandle?: {
          getSelection: () => unknown;
          getText: () => string;
          insertText: (text: string) => void;
          setNativeDOMSelection: (selection: unknown) => boolean;
        };
      };
      const text = active.firstChild as Text;
      const range = document.createRange();
      const selection = window.getSelection()!;
      let insertedText: string | null = null;

      active.__slateBrowserHandle = {
        getSelection: () => ({
          anchor: { offset: 'This is '.length, path: [0, 0] },
          focus: { offset: 'This is '.length, path: [0, 0] },
        }),
        getText: () => 'This is editable rich',
        insertText: (nextText: string) => {
          insertedText = nextText;
          active.textContent = `This is ${nextText}editable rich`;
        },
        setNativeDOMSelection: () => true,
      };

      active.focus();
      range.setStart(text, 'This is '.length);
      range.setEnd(text, 'This is editable '.length);
      selection.removeAllRanges();
      selection.addRange(range);

      await composeText(createPage(), createSurface(), ['e'], 'e', {
        transport: 'synthetic',
      });

      expect(insertedText).toBe('e');
      expect(active.textContent).toBe('This is eeditable rich');
    } finally {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        configurable: true,
        value: originalMaxTouchPoints,
      });
    }
  });

  test('uses semantic mobile fallback when model selection has no native DOM range', async () => {
    document.body.innerHTML =
      '<div data-slate-editor="true" contenteditable="true">This is editable rich</div>';

    const originalMaxTouchPoints = navigator.maxTouchPoints;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    });

    try {
      const active = document.querySelector('div')! as HTMLDivElement & {
        __slateBrowserHandle?: {
          getSelection: () => unknown;
          getText: () => string;
          insertText: (text: string) => void;
          setNativeDOMSelection: (selection: unknown) => boolean;
        };
      };
      const selection = window.getSelection()!;
      let insertedText: string | null = null;

      active.__slateBrowserHandle = {
        getSelection: () => ({
          anchor: { offset: 'This is '.length, path: [0, 0] },
          focus: { offset: 'This is '.length, path: [0, 0] },
        }),
        getText: () => 'This is editable rich',
        insertText: (nextText: string) => {
          insertedText = nextText;
          active.textContent = `This is ${nextText}editable rich`;
        },
        setNativeDOMSelection: () => false,
      };

      active.focus();
      selection.removeAllRanges();

      await composeText(createPage(), createSurface(), ['e'], 'e', {
        transport: 'synthetic',
      });

      expect(insertedText).toBe('e');
      expect(active.textContent).toBe('This is eeditable rich');
    } finally {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        configurable: true,
        value: originalMaxTouchPoints,
      });
    }
  });

  test('installs composition key events once on the resolved editor surface', async () => {
    document.body.innerHTML = '<div contenteditable="true">hello</div>';

    const active = document.querySelector('div')!;
    const keydownEvents: string[] = [];

    active.addEventListener('keydown', (event) => {
      keydownEvents.push(`${event.key}:${event.keyCode}`);
    });
    active.focus();

    await enableCompositionKeyEvents(createSurface());
    await enableCompositionKeyEvents(createSurface());
    window.dispatchEvent(
      new CompositionEvent('compositionstart', {
        bubbles: true,
        data: 'é',
      })
    );

    expect(keydownEvents).toEqual(['Unidentified:220']);
  });
});
