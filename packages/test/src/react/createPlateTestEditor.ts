import {
  act,
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react';
import { parseHotkey } from 'is-hotkey';
import {
  type BasePluginInput,
  type CreateEditorOptions,
  type Editor,
  type EditorApplicationSchema,
  type PluginInput,
  type Value,
  createEditor,
} from 'platejs/react';
import React from 'react';

import { EditorTest } from './PlateTest';

export type EditorTestHarnessOptions = {
  componentProps?: Partial<React.ComponentProps<typeof EditorTest>>;
  debug?: boolean;
  testID?: string;
};

type ClipboardDataType = 'image/png' | 'text/html' | 'text/plain';
type SharedPluginReference = Exclude<PluginInput, readonly unknown[]>;

type PasteOptions = {
  types?: ClipboardDataType[];
};

export type EditorTestActions = {
  deleteBackward: () => Promise<void>;
  deleteEntireSoftline: () => Promise<void>;
  deleteForward: () => Promise<void>;
  deleteHardLineBackward: () => Promise<void>;
  deleteHardLineForward: () => Promise<void>;
  deleteSoftLineBackward: () => Promise<void>;
  deleteSoftLineForward: () => Promise<void>;
  deleteWordBackward: () => Promise<void>;
  deleteWordForward: () => Promise<void>;
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

export type EditorTestRenderResult = RenderResult;

export type ReactTestEditor<
  V extends Value = Value,
  TPlugins extends readonly SharedPluginReference[] = readonly [],
  TSchema extends EditorApplicationSchema | undefined = undefined,
> = Editor<
  V,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
>;

type PlatePluginsFromTuple<TPlugins extends readonly SharedPluginReference[]> =
  [TPlugins[number]] extends [BasePluginInput]
    ? Extract<TPlugins, readonly BasePluginInput[]>
    : [Extract<TPlugins[number], BasePluginInput>] extends [never]
      ? readonly []
      : number extends TPlugins['length']
        ? ReadonlyArray<Extract<TPlugins[number], BasePluginInput>>
        : TPlugins extends readonly [infer TPlugin, ...infer TRest]
          ? TPlugin extends BasePluginInput
            ? readonly [
                TPlugin,
                ...PlatePluginsFromTuple<
                  Extract<TRest, readonly SharedPluginReference[]>
                >,
              ]
            : PlatePluginsFromTuple<
                Extract<TRest, readonly SharedPluginReference[]>
              >
          : readonly [];

type RuntimePluginsFromTuple<
  TPlugins extends readonly SharedPluginReference[],
> = [TPlugins[number]] extends [BasePluginInput]
  ? readonly []
  : [Extract<TPlugins[number], BasePluginInput>] extends [never]
    ? TPlugins
    : number extends TPlugins['length']
      ? ReadonlyArray<Exclude<TPlugins[number], BasePluginInput>>
      : TPlugins extends readonly [infer TPlugin, ...infer TRest]
        ? TPlugin extends BasePluginInput
          ? RuntimePluginsFromTuple<
              Extract<TRest, readonly SharedPluginReference[]>
            >
          : TPlugin extends SharedPluginReference
            ? readonly [
                TPlugin,
                ...RuntimePluginsFromTuple<
                  Extract<TRest, readonly SharedPluginReference[]>
                >,
              ]
            : RuntimePluginsFromTuple<
                Extract<TRest, readonly SharedPluginReference[]>
              >
        : readonly [];

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

export const createTestEditor = async <
  V extends Value = Value,
  const TPlugins extends readonly SharedPluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<V, TPlugins, TSchema>,
  harnessOptions: EditorTestHarnessOptions = {}
): Promise<
  [
    ReactTestEditor<V, TPlugins, TSchema>,
    EditorTestActions,
    EditorTestRenderResult,
  ]
> => {
  const {
    componentProps = {},
    debug = false,
    testID = 'plite-content-editable',
  } = harnessOptions;
  const editor = createEditor(options as any) as unknown as ReactTestEditor<
    V,
    TPlugins,
    TSchema
  >;
  const plateProps = {
    ...componentProps,
    editor,
    suppressInstanceWarning: true,
  };
  const rendered = render(React.createElement(EditorTest, plateProps as any));

  await act(async () => rendered);

  const element = rendered.getByTestId(testID);

  Object.defineProperty(element, 'isContentEditable', {
    configurable: true,
    value: true,
  });

  if (debug) {
    editor.subscribeCommit((commit) => {
      console.info('EDITOR COMMIT', JSON.stringify(commit, null, 2));
    });
  }

  const triggerKeyboardEvent = async (hotkey: string) =>
    act(async () => {
      const eventProps = parseHotkey(hotkey);
      const values = hotkey.split('+');
      const eventInit = {
        bubbles: true,
        key: values.at(-1),
        ...eventProps,
      };

      Reflect.set(eventInit, 'keyCode', Reflect.get(eventProps, 'which'));

      fireEvent(element, new KeyboardEvent('keydown', eventInit));
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
        rendered.rerender(React.createElement(EditorTest, plateProps as any));
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
  ] as [
    ReactTestEditor<V, TPlugins, TSchema>,
    EditorTestActions,
    EditorTestRenderResult,
  ];
};
