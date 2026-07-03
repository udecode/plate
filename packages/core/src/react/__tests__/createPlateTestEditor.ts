import type { Value } from '@platejs/plite';
import { applyOperation } from '@platejs/plite/internal';

import { act, fireEvent, render } from '@testing-library/react';
import { parseHotkey } from 'is-hotkey';
import React from 'react';

import { PlateTest } from '../components/PlateTest';
import { type CreatePlateEditorOptions, createPlateEditor } from '../editor';

type PlateTestEditorPluginInput = { key: string };

type PlateTestHarnessOptions = {
  componentProps?: Partial<React.ComponentProps<typeof PlateTest>>;
  debug?: boolean;
  strict?: boolean;
  testID?: string;
};

type ClipboardDataType = 'image/png' | 'text/html' | 'text/plain';

type PasteOptions = {
  types?: ClipboardDataType[];
};

type PlateTestActions = {
  deleteBackward: () => Promise<void>;
  deleteEntireSoftline: () => Promise<void>;
  deleteForward: () => Promise<void>;
  deleteHardLineBackward: () => Promise<void>;
  deleteHardLineForward: () => Promise<void>;
  deleteSoftLineBackward: () => Promise<void>;
  deleteSoftLineForward: () => Promise<void>;
  deleteWordBackward: () => Promise<void>;
  deleteWordForward: () => Promise<void>;
  isApple: () => boolean;
  paste: (payload: string, options?: PasteOptions) => Promise<void>;
  pressEnter: () => Promise<void>;
  redo: () => Promise<void>;
  rerender: () => void;
  selectAll: () => Promise<void>;
  triggerKeyboardEvent: (hotkey: string) => Promise<void>;
  type: (text: string) => Promise<void>;
  typeSpace: () => Promise<void>;
  undo: () => Promise<void>;
};

type PlateTestRenderResult = ReturnType<typeof render>;

const APPLE_PLATFORM_RE = /Mac|iPhone|iPad|iPod/;

const isApplePlatform = () =>
  typeof navigator !== 'undefined' &&
  APPLE_PLATFORM_RE.test(navigator.platform);

const fireBeforeInput = (element: HTMLElement, init: InputEventInit): void => {
  fireEvent(
    element,
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      ...init,
    })
  );
};

/**
 * Plate-owned test harness where:
 *
 * - `Component`: `PlateTest`
 * - `editor`: `createPlateEditor`
 */
export const createPlateTestEditor = async <
  V extends Value = Value,
  const TPlugins extends readonly PlateTestEditorPluginInput[] = readonly [],
>(
  options: CreatePlateEditorOptions<V, TPlugins>,
  buildTestHarnessOptions: PlateTestHarnessOptions = {}
) => {
  const {
    componentProps = {},
    debug = false,
    strict: _strict = false,
    testID = 'plite-content-editable',
  } = buildTestHarnessOptions;
  const editor = createPlateEditor<V, TPlugins>(options);
  const plateProps = {
    ...componentProps,
    editor,
    suppressInstanceWarning: true,
  };
  const rendered = render(React.createElement(PlateTest, plateProps as any));

  await act(async () => rendered);

  const element = rendered.getByTestId(testID);

  Object.defineProperty(element, 'isContentEditable', {
    configurable: true,
    value: true,
  });

  if (debug) {
    const apply = (operation: Parameters<typeof applyOperation>[1]) =>
      applyOperation(editor, operation);

    (editor as unknown as { apply: typeof apply }).apply = (operation) => {
      // eslint-disable-next-line no-console
      console.log('OPERATION APPLIED', JSON.stringify(operation, null, 2));
      apply(operation);
    };
  }

  const triggerKeyboardEvent = async (hotkey: string) =>
    act(async () => {
      const eventProps = parseHotkey(hotkey);
      const values = hotkey.split('+');

      fireEvent(
        element,
        new KeyboardEvent('keydown', {
          bubbles: true,
          key: values.at(-1),
          keyCode: eventProps.which,
          ...eventProps,
        })
      );
    });

  const type = async (text: string) =>
    act(async () => {
      fireBeforeInput(element, {
        data: text,
        inputType: 'insertText',
      });
    });

  const paste = async (payload: string, pasteOptions: PasteOptions = {}) =>
    act(async () => {
      const types = pasteOptions.types ?? ['text/html'];
      const event = new Event('paste', {
        bubbles: true,
        cancelable: true,
        composed: true,
      }) as Event & {
        clipboardData: {
          getData: () => string;
          types: ClipboardDataType[];
        };
      };

      event.clipboardData = {
        getData: () => payload,
        types,
      };

      fireEvent(element, event);
    });

  const optionalHistoryEditor = editor as typeof editor & {
    redo?: () => void;
    undo?: () => void;
  };

  return [
    editor,
    {
      deleteBackward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteContentBackward' });
        }),
      deleteEntireSoftline: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteEntireSoftLine' });
        }),
      deleteForward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteContentForward' });
        }),
      deleteHardLineBackward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteHardLineBackward' });
        }),
      deleteHardLineForward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteHardLineForward' });
        }),
      deleteSoftLineBackward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteSoftLineBackward' });
        }),
      deleteSoftLineForward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteSoftLineForward' });
        }),
      deleteWordBackward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteWordBackward' });
        }),
      deleteWordForward: async () =>
        act(async () => {
          fireBeforeInput(element, { inputType: 'deleteWordForward' });
        }),
      isApple: isApplePlatform,
      paste,
      pressEnter: async () => {
        await triggerKeyboardEvent('Enter');

        await act(async () => {
          fireBeforeInput(element, { inputType: 'insertParagraph' });
        });
      },
      redo: async () => {
        optionalHistoryEditor.redo?.();
      },
      rerender: () => {
        rendered.rerender(React.createElement(PlateTest, plateProps as any));
      },
      selectAll: async () =>
        act(async () => {
          editor.update.selection.set([]);
        }),
      triggerKeyboardEvent,
      type,
      typeSpace: () => type(' '),
      undo: async () => {
        optionalHistoryEditor.undo?.();
      },
    },
    rendered,
  ] as [typeof editor, PlateTestActions, PlateTestRenderResult];
};
