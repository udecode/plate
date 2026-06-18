import type { Frame, Page } from '@playwright/test';

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
      __SLATE_BROWSER_COMPOSITION_KEY_EVENTS__?: boolean;
    };

    if (target.__SLATE_BROWSER_COMPOSITION_KEY_EVENTS__) {
      return;
    }

    target.__SLATE_BROWSER_COMPOSITION_KEY_EVENTS__ = true;

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
    async ({ finalText }) => {
      const active = document.activeElement as HTMLElement | null;

      if (!active) {
        throw new Error('Missing active editable selection for composition');
      }

      const root =
        active.closest<HTMLElement>('[data-slate-editor="true"]') ?? active;
      const handle = (
        root as HTMLElement & {
          __slateBrowserHandle?: {
            deleteFragment?: () => void;
            getSelection?: () => unknown;
            getText?: () => string;
            insertText?: (text: string) => void;
            setNativeDOMSelection?: (selection: unknown) => boolean;
          };
        }
      ).__slateBrowserHandle;

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
          await new Promise((resolve) => setTimeout(resolve, 0));

          if (didModelTextChange()) {
            return true;
          }
        }

        return false;
      };
      const waitForRenderedModelText = async () => {
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 0));

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
        globalThis.matchMedia?.('(pointer: coarse)').matches === true;
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
        modelChanged = modelChanged || (await waitForDeferredModelTextChange());

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
    { finalText: committedText }
  );
};

export const composeText = async (
  page: Page,
  surface: CompositionSurface,
  steps: readonly string[],
  committedText: string,
  {
    transport = 'native',
  }: {
    transport?: 'native' | 'synthetic';
  } = {}
) => {
  const browserName = page.context().browser()?.browserType().name();

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
