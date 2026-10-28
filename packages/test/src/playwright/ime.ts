import type { Frame, Page } from '@playwright/test';

import { BROWSER_HANDLE_KEY } from './constants';

type CompositionSurface = Page | Frame;
type SyntheticCompositionEventType =
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate';

export const enableCompositionKeyEvents = async (
  surface: CompositionSurface
) => {
  await surface.evaluate(() => {
    const target = window as Window & {
      __EDITOR_BROWSER_COMPOSITION_KEY_EVENTS__?: boolean;
    };

    if (target.__EDITOR_BROWSER_COMPOSITION_KEY_EVENTS__) {
      return;
    }

    target.__EDITOR_BROWSER_COMPOSITION_KEY_EVENTS__ = true;

    window.addEventListener(
      'compositionstart',
      () => {
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Unidentified',
            keyCode: 220,
          })
        );
      },
      true
    );
  });
};

export const dispatchSyntheticCompositionEvent = async (
  surface: CompositionSurface,
  type: SyntheticCompositionEventType,
  text = ''
) => {
  await surface.evaluate(
    ({ data, eventType }) => {
      const active = document.activeElement as HTMLElement | null;

      if (!active) {
        throw new Error('Missing active editable selection for composition');
      }

      active.dispatchEvent(
        new CompositionEvent(eventType, {
          bubbles: true,
          cancelable: true,
          data,
        })
      );
    },
    { data: text, eventType: type }
  );
};

export const startSyntheticComposition = async (
  surface: CompositionSurface,
  text = ''
) => dispatchSyntheticCompositionEvent(surface, 'compositionstart', text);

export const updateSyntheticComposition = async (
  surface: CompositionSurface,
  text: string
) => dispatchSyntheticCompositionEvent(surface, 'compositionupdate', text);

export const commitSyntheticCompositionText = async (
  surface: CompositionSurface,
  committedText: string
) => {
  await surface.evaluate(
    async ({ finalText, key }) => {
      const active = document.activeElement as HTMLElement | null;

      if (!active) {
        throw new Error('Missing active editable selection for composition');
      }

      const root =
        active.closest<HTMLElement>('[data-editor="true"]') ?? active;
      const handle = (
        root as HTMLElement &
          Record<
            string,
            | {
                deleteFragment?: () => void;
                getSelection?: () => unknown;
                getText?: () => string;
                insertText?: (text: string) => void;
                setNativeDOMSelection?: (selection: unknown) => boolean;
              }
            | undefined
          >
      )[key];

      const modelSelection = handle?.getSelection?.();
      const isExpandedModelSelection = (selection: unknown) => {
        if (!selection || typeof selection !== 'object') {
          return false;
        }

        const range = selection as {
          anchor?: { offset?: unknown; path?: unknown };
          focus?: { offset?: unknown; path?: unknown };
        };

        return (
          JSON.stringify(range.anchor?.path) !==
            JSON.stringify(range.focus?.path) ||
          range.anchor?.offset !== range.focus?.offset
        );
      };

      if (modelSelection) {
        handle?.setNativeDOMSelection?.(modelSelection);
      }

      const modelTextBefore = handle?.getText?.();
      const didModelTextChange = () => {
        const modelText = handle?.getText?.();

        return (
          typeof modelTextBefore === 'string' &&
          typeof modelText === 'string' &&
          modelText !== modelTextBefore
        );
      };
      const waitForDeferredModelTextChange = async () => {
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((resolve) => {
            setTimeout(resolve, 0);
          });

          if (didModelTextChange()) {
            return true;
          }
        }

        return false;
      };
      const waitForRenderedModelText = async () => {
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise((resolve) => {
            setTimeout(resolve, 0);
          });

          const modelText = handle?.getText?.();
          const domText = root.textContent?.replace(/\uFEFF/g, '');

          if (
            typeof modelText === 'string' &&
            typeof domText === 'string' &&
            domText === modelText
          ) {
            return true;
          }
        }

        return false;
      };
      const selection = document.getSelection();
      const range =
        selection && selection.rangeCount > 0
          ? selection.getRangeAt(0).cloneRange()
          : null;
      const createInputEvent = (
        type: 'beforeinput' | 'input',
        inputType: string,
        data: string
      ) => {
        if (typeof InputEvent === 'function') {
          return new InputEvent(type, {
            bubbles: true,
            cancelable: type === 'beforeinput',
            data,
            inputType,
          });
        }

        const event = new Event(type, {
          bubbles: true,
          cancelable: type === 'beforeinput',
        }) as InputEvent;
        Object.defineProperties(event, {
          data: { value: data },
          inputType: { value: inputType },
        });

        return event;
      };
      const dispatchInputEvent = (
        type: 'beforeinput' | 'input',
        inputType: string,
        data: string
      ) => {
        const event = createInputEvent(type, inputType, data);
        active.dispatchEvent(event);

        return event;
      };

      const beforeInputEvent = dispatchInputEvent(
        'beforeinput',
        'insertFromComposition',
        finalText
      );
      let modelChanged = didModelTextChange();
      const semanticInsertText = handle?.insertText;
      const expandedModelSelection = isExpandedModelSelection(modelSelection);
      const isCoarsePointer =
        navigator.maxTouchPoints > 0 ||
        globalThis.matchMedia?.('(pointer: coarse)').matches;
      const preventedWithoutModelChange =
        beforeInputEvent.defaultPrevented && !modelChanged;
      const shouldUseSemanticTextFallback =
        !modelChanged &&
        !!semanticInsertText &&
        (expandedModelSelection ||
          (isCoarsePointer &&
            (preventedWithoutModelChange || !!modelSelection)));
      const shouldTrustDefaultPreventedExpandedComposition =
        preventedWithoutModelChange && expandedModelSelection;
      let didApplySemanticFallback = false;
      const applySemanticTextFallback = () => {
        if (expandedModelSelection) {
          handle?.deleteFragment?.();
        }

        semanticInsertText?.(finalText);
        didApplySemanticFallback = true;
      };

      if (shouldUseSemanticTextFallback) {
        applySemanticTextFallback();
      } else if (shouldTrustDefaultPreventedExpandedComposition) {
        modelChanged ||= await waitForDeferredModelTextChange();

        if (!modelChanged && semanticInsertText) {
          applySemanticTextFallback();
        }
      } else if (
        !shouldTrustDefaultPreventedExpandedComposition &&
        (!beforeInputEvent.defaultPrevented ||
          (!!handle && preventedWithoutModelChange))
      ) {
        if (!selection || !range) {
          throw new Error('Missing active editable selection for composition');
        }

        range.deleteContents();

        const textNode = document.createTextNode(finalText);

        range.insertNode(textNode);
        range.setStart(textNode, finalText.length);
        range.setEnd(textNode, finalText.length);
        selection.removeAllRanges();
        selection.addRange(range);

        dispatchInputEvent('input', 'insertFromComposition', finalText);
      }

      if (didApplySemanticFallback) {
        await waitForRenderedModelText();
      }

      active.dispatchEvent(
        new CompositionEvent('compositionend', {
          bubbles: true,
          cancelable: true,
          data: didApplySemanticFallback ? '' : finalText,
        })
      );
    },
    { finalText: committedText, key: BROWSER_HANDLE_KEY }
  );
};

type PreeditEngine = 'chromium' | 'firefox' | 'webkit';

type PreeditEvent =
  | { onlyWhenChanged?: true; type: 'compositionupdate' }
  | { type: 'compositionend' }
  | {
      cancelable: boolean;
      /** What the default action does to the composing text. */
      draws: 'commit' | 'erase' | 'preedit';
      inputType:
        | 'deleteCompositionText'
        | 'insertCompositionText'
        | 'insertFromComposition';
      inputLater?: true;
      /** `beforeinput`, then the draw and `input` unless it was cancelled. */
      type: 'edit';
    }
  | { inputType: 'insertCompositionText'; type: 'input' };

const PREEDIT_STEP: readonly PreeditEvent[] = [
  { type: 'compositionupdate' },
  {
    cancelable: false,
    draws: 'preedit',
    inputType: 'insertCompositionText',
    type: 'edit',
  },
];

/**
 * The events each engine sends for a preedit step and for the commit, after
 * one `compositionstart`. Chromium's order is a CDP trace of Chromium 149.
 * Firefox's is Gecko's `TextComposition::DispatchCompositionEvent` and
 * `EditorBase::OnCompositionChange` with
 * `dom.input_events.dispatch_before_compositionend` on, and WebKit's is
 * `Editor::setComposition` with its
 * `fast/events/input-events-ime-composition` layout test.
 */
const PREEDIT_EVENT_ORDER: Record<
  PreeditEngine,
  Readonly<{ commit: readonly PreeditEvent[]; step: readonly PreeditEvent[] }>
> = {
  chromium: {
    commit: [
      { type: 'compositionupdate' },
      {
        cancelable: false,
        draws: 'commit',
        inputType: 'insertCompositionText',
        type: 'edit',
      },
      { type: 'compositionend' },
    ],
    step: PREEDIT_STEP,
  },
  firefox: {
    commit: [
      { onlyWhenChanged: true, type: 'compositionupdate' },
      {
        cancelable: false,
        draws: 'commit',
        inputLater: true,
        inputType: 'insertCompositionText',
        type: 'edit',
      },
      { type: 'compositionend' },
      { inputType: 'insertCompositionText', type: 'input' },
    ],
    step: PREEDIT_STEP,
  },
  webkit: {
    commit: [
      {
        cancelable: false,
        draws: 'erase',
        inputType: 'deleteCompositionText',
        type: 'edit',
      },
      {
        cancelable: true,
        draws: 'commit',
        inputType: 'insertFromComposition',
        type: 'edit',
      },
      { type: 'compositionend' },
    ],
    step: PREEDIT_STEP,
  },
};

const PREEDIT_STATE_KEY = '__EDITOR_BROWSER_PREEDIT__';

const dispatchPreeditEvents = async (
  surface: CompositionSurface,
  {
    events,
    start,
    text,
  }: { events: readonly PreeditEvent[]; start: boolean; text: string }
) => {
  await surface.evaluate(
    ({ entries, isStart, key, value }) => {
      type Composition = { node: Text; start: number; text: string };
      const state = window as unknown as Record<
        string,
        Composition | undefined
      >;
      const active = document.activeElement as HTMLElement | null;
      const selection = document.getSelection();

      if (!active || !selection || selection.rangeCount === 0) {
        throw new Error('Missing active editable selection for composition');
      }
      if (isStart) {
        state[key] = undefined;
        active.dispatchEvent(
          new CompositionEvent('compositionstart', {
            bubbles: true,
            cancelable: true,
            data: selection.toString(),
          })
        );
      }

      const drawnText = state[key]?.text;
      const targetRange = () => {
        const composition = state[key];

        if (!composition) return selection.getRangeAt(0);

        const range = document.createRange();

        range.setStart(composition.node, composition.start);
        range.setEnd(
          composition.node,
          composition.start + composition.text.length
        );
        return range;
      };
      // The first draw replaces the selection, as the browser's first
      // composition change does.
      const openComposition = (): Composition => {
        const range = selection.getRangeAt(0);

        range.deleteContents();
        if (range.startContainer instanceof Text) {
          return {
            node: range.startContainer,
            start: range.startOffset,
            text: '',
          };
        }

        const node = document.createTextNode('');

        range.insertNode(node);
        return { node, start: 0, text: '' };
      };
      const draw = (data: string) => {
        const composition = state[key] ?? openComposition();

        if (!composition.node.isConnected) {
          throw new Error('The composing text node left the document');
        }
        composition.node.replaceData(
          composition.start,
          composition.text.length,
          data
        );
        composition.text = data;
        state[key] = composition;

        const caret = composition.start + data.length;

        selection.setBaseAndExtent(
          composition.node,
          caret,
          composition.node,
          caret
        );
      };
      const createInputEvent = (
        type: 'beforeinput' | 'input',
        init: InputEventInit,
        range?: Range
      ) => {
        const event = new InputEvent(type, { bubbles: true, ...init });
        const ranges = range ? [new StaticRange(range)] : [];

        Object.defineProperty(event, 'getTargetRanges', {
          value: () => ranges,
        });
        return event;
      };

      for (const entry of entries) {
        if (entry.type === 'compositionupdate') {
          if (!entry.onlyWhenChanged || drawnText !== value) {
            active.dispatchEvent(
              new CompositionEvent('compositionupdate', {
                bubbles: true,
                cancelable: true,
                data: value,
              })
            );
          }
        } else if (entry.type === 'compositionend') {
          state[key] = undefined;
          active.dispatchEvent(
            new CompositionEvent('compositionend', {
              bubbles: true,
              cancelable: true,
              data: value,
            })
          );
        } else if (entry.type === 'input') {
          active.dispatchEvent(
            createInputEvent('input', {
              data: value,
              inputType: entry.inputType,
              isComposing: false,
            })
          );
        } else {
          const data = entry.draws === 'erase' ? null : value;
          const init = { data, inputType: entry.inputType, isComposing: true };
          const beforeInput = createInputEvent(
            'beforeinput',
            { ...init, cancelable: entry.cancelable },
            targetRange()
          );

          active.dispatchEvent(beforeInput);
          if (!beforeInput.defaultPrevented) {
            draw(data ?? '');
            if (!entry.inputLater) {
              active.dispatchEvent(createInputEvent('input', init));
            }
          }
        }
      }
    },
    { entries: events, isStart: start, key: PREEDIT_STATE_KEY, value: text }
  );
};

const isPreeditEngine = (name: string | undefined): name is PreeditEngine =>
  !!name && name in PREEDIT_EVENT_ORDER;

export const composeText = async (
  page: Page,
  surface: CompositionSurface,
  steps: readonly string[],
  committedText: string,
  {
    transport = 'native',
  }: {
    transport?: 'native' | 'preedit' | 'synthetic';
  } = {}
) => {
  const browserName = page.context().browser()?.browserType().name();

  if (transport === 'preedit') {
    if (!isPreeditEngine(browserName)) {
      throw new Error(`No preedit event order for ${browserName}`);
    }
    const order = PREEDIT_EVENT_ORDER[browserName];

    for (const [index, text] of steps.entries()) {
      await dispatchPreeditEvents(surface, {
        events: order.step,
        start: index === 0,
        text,
      });
    }
    await dispatchPreeditEvents(surface, {
      events: order.commit,
      start: steps.length === 0,
      text: committedText,
    });

    return;
  }
  if (browserName !== 'chromium' || transport === 'synthetic') {
    await startSyntheticComposition(surface, steps[0] ?? '');

    for (const text of steps) {
      await updateSyntheticComposition(surface, text);
    }

    await commitSyntheticCompositionText(surface, committedText);

    return;
  }

  const client = await page.context().newCDPSession(page);

  for (const text of steps) {
    await client.send('Input.imeSetComposition', {
      selectionStart: text.length,
      selectionEnd: text.length,
      text,
    });
  }

  await client.send('Input.insertText', {
    text: committedText,
  });
};

export const composeTextDirect = async (page: Page, committedText: string) => {
  await page.keyboard.insertText(committedText);
};
