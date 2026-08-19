import * as React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

let isFocused = false;
let isSelected = false;
let nodePath: number[] | undefined;
let selection: any;
let editorSelectorEditor: any;
let lastPluginEditor: any;

const withPluginEditor = <T extends Record<string, any>>(editor: T) => {
  const readState = {
    ...(editor.read ?? {}),
    footnote: {
      definitionText: () => {},
      hasDuplicateDefinitions: () => false,
      refs: () => [],
      isDuplicateDefinition: () => false,
      isResolved: () => false,
      nextRef: () => '1',
      references: () => [],
      ...(editor.read?.footnote ?? {}),
    },
    nodes: {
      ...(editor.read?.nodes ?? {}),
      parent: editor.read?.nodes?.parent ?? (() => {}),
    },
    points: {
      ...(editor.read?.points ?? {}),
      before: editor.read?.points?.before ?? (() => {}),
    },
    ranges: {
      ...(editor.read?.ranges ?? {}),
      get: editor.read?.ranges?.get ?? (() => {}),
    },
    selection: editor.read?.selection ?? (() => selection),
    text: {
      ...(editor.read?.text ?? {}),
      string: editor.read?.text?.string ?? (() => ''),
    },
  };
  const updateCommands = {
    ...(editor.update ?? {}),
    footnote: {
      createDefinition: () => {},
      focusDefinition: () => {},
      focusReference: () => {},
      normalizeDuplicateDefinition: () => {},
      ...(editor.update?.footnote ?? {}),
    },
  };

  const read = Object.assign(
    (callback: (state: typeof readState) => unknown) => callback(readState),
    readState
  );
  const update = Object.assign(
    (callback: (transaction: typeof updateCommands) => void) =>
      callback(updateCommands),
    updateCommands
  );
  const pluginEditor = Object.assign(editor, {
    plugin: () => ({
      api: editor.api ?? {},
      read: readState,
      update: updateCommands,
    }),
    read,
    update,
  });

  lastPluginEditor = pluginEditor;

  return pluginEditor;
};

const PlateElementMock = mock(
  ({ children, as: Comp = 'div', attributes, className, ...props }: any) => (
    <Comp {...attributes} {...props} className={className}>
      {children}
    </Comp>
  )
);

const PliteElementMock = mock(
  ({ children, as: Comp = 'div', attributes, className, ...props }: any) => (
    <Comp {...attributes} {...props} className={className}>
      {children}
    </Comp>
  )
);

mock.module('platejs/react', () => ({
  PlateElement: PlateElementMock,
  toPlatePlugin: (plugin: unknown) => plugin,
  useEditor: () => lastPluginEditor ?? withPluginEditor({}),
  useEditorPlugin: () => ({
    api: lastPluginEditor?.api ?? {},
    editor: lastPluginEditor ?? withPluginEditor({}),
    read: lastPluginEditor?.read?.footnote ?? {},
    update: lastPluginEditor?.update?.footnote ?? {},
  }),
  useEditorSelection: () => selection,
  useEditorSelector: (selector: any) => {
    const activePluginEditor = lastPluginEditor;
    const currentEditor = editorSelectorEditor
      ? withPluginEditor(editorSelectorEditor)
      : (lastPluginEditor ?? withPluginEditor({}));
    const read = {
      ...(currentEditor.read ?? {}),
      footnote: {
        ...(lastPluginEditor?.read?.footnote ?? {}),
        ...(currentEditor.read?.footnote ?? {}),
      },
    };

    const selectorEditor = withPluginEditor({ ...currentEditor, read });

    lastPluginEditor = activePluginEditor ?? selectorEditor;

    return selector(selectorEditor);
  },
  useEditorFocused: () => isFocused,
  useNavigationHighlight: (path?: number[]) => {
    const activeTarget = editorSelectorEditor?.navigationHighlight;

    if (!path || !activeTarget) return null;
    if (JSON.stringify(activeTarget.path) !== JSON.stringify(path)) return null;

    return activeTarget;
  },
  useElementSelected: () => isSelected,
}));

mock.module('platejs/static', () => ({
  PliteElement: PliteElementMock,
}));

mock.module('@/components/ui/hover-card', () => ({
  HoverCard: ({ children, onOpenChange }: any) => {
    React.useEffect(() => {
      onOpenChange?.(true);
    }, [onOpenChange]);

    return <div>{children}</div>;
  },
  HoverCardContent: ({ children }: any) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: any) => <>{children}</>,
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverAnchor: ({ children }: any) => <>{children}</>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

mock.module('@/components/ui/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children, onMouseDown, onSelect }: any) => (
    <button
      type="button"
      onMouseDown={onMouseDown}
      onClick={() => onSelect?.()}
    >
      {children}
    </button>
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }

    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  },
}));

mock.module('@/registry/components/editor/inline-combobox', () => ({
  InlineCombobox: ({ children }: any) => <div>{children}</div>,
  InlineComboboxContent: ({ children }: any) => <div>{children}</div>,
  InlineComboboxEmpty: ({ children }: any) => <div>{children}</div>,
  InlineComboboxGroup: ({ children }: any) => <div>{children}</div>,
  InlineComboboxInput: () => <input />,
  InlineComboboxItem: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

mock.module('is-hotkey', () => ({
  default: () => () => false,
  isHotkey: () => () => false,
  isKeyHotkey: () => () => false,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('footnote node rendering', () => {
  beforeEach(() => {
    isFocused = false;
    isSelected = false;
    nodePath = undefined;
    selection = undefined;
    editorSelectorEditor = undefined;
    lastPluginEditor = undefined;
    PlateElementMock.mockClear();
    PliteElementMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders the footnote reference label without duplicating the ref text', async () => {
    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.container.textContent).toContain('[1]');
    expect(view.container.textContent).not.toContain('[1]1');
  });

  it('renders the static footnote reference label without duplicating the ref text', async () => {
    const { FootnoteReferenceElementStatic } = await import(
      `./footnote-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElementStatic
        attributes={{}}
        editor={{} as any}
        element={{ children: [{ text: '' }], ref: '1' } as any}
      >
        <span />
      </FootnoteReferenceElementStatic>
    );

    expect(view.container.textContent).toBe('[1]');
  });

  it('uses mousedown for reference navigation so the editor can keep focus', async () => {
    const focusDefinition = mock();
    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    fireEvent.mouseDown(view.getByRole('button', { name: '[1]' }), {
      metaKey: true,
    });

    expect(focusDefinition).toHaveBeenCalledWith({ ref: '1' });
  });

  it('prevents the follow-up click default on a meta-clicked reference button', async () => {
    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition: mock(),
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    const button = view.getByRole('button', { name: '[1]' });
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
    });

    button.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('uses mousedown for backlink navigation so the editor can keep focus', async () => {
    const focusReference = mock();
    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          update: {
            footnote: {
              focusReference,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '2' } as any}
        path={nodePath}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    fireEvent.mouseDown(
      view.getByRole('button', { name: 'Back to reference 2' })
    );

    expect(focusReference).toHaveBeenCalledWith({ ref: '2' });
  });

  it('applies navigation highlight attrs to the current footnote target', async () => {
    nodePath = [1];
    editorSelectorEditor = {
      navigationHighlight: {
        cycle: 1,
        duration: 800,
        path: [1],
        pulse: 3,
        variant: 'navigated',
      },
    };

    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          read: { footnote: { references: () => [] } },
          update: { footnote: {} },
        } as any)}
        element={{ children: [{ text: '' }], ref: '2' } as any}
        path={nodePath}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    const element = view.container.querySelector('[data-nav-highlight]');

    expect(element?.getAttribute('data-nav-highlight')).toBe('navigated');
    expect(element?.getAttribute('data-nav-pulse')).toBe('3');
    expect(element?.className).toContain('bg-(--color-highlight)');
  });

  it('applies navigation highlight attrs to the current footnote reference target', async () => {
    nodePath = [0, 1];
    editorSelectorEditor = {
      navigationHighlight: {
        cycle: 0,
        duration: 800,
        path: [0, 1],
        pulse: 4,
        variant: 'navigated',
      },
    };

    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '1' } as any}
        path={nodePath}
      >
        <span />
      </FootnoteReferenceElement>
    );

    const element = view.container.querySelector('[data-nav-highlight]');
    const button = view.getByRole('button', { name: '[1]' });

    expect(element?.getAttribute('data-nav-highlight')).toBe('navigated');
    expect(element?.getAttribute('data-nav-pulse')).toBe('4');
    expect(button.className).toContain('bg-(--color-highlight)');
  });

  it('opens a multi-reference picker instead of jumping blindly to the first reference', async () => {
    const focusReference = mock();
    editorSelectorEditor = {
      read: {
        footnote: {
          references: () => [
            [{}, [0, 1]],
            [{}, [2, 1]],
          ],
        },
        nodes: {
          parent: (path: number[]) => {
            if (path[0] === 0) {
              return [{ children: [{ text: 'First paragraph ref' }] }, [0]];
            }

            return [{ children: [{ text: 'Second paragraph ref' }] }, [2]];
          },
        },
        text: {
          string: (path: number[]) =>
            path[0] === 0 ? 'First paragraph ref' : 'Second paragraph ref',
        },
      },
    };
    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              references: () => [
                [{}, [0, 1]],
                [{}, [2, 1]],
              ],
            },
            nodes: {
              parent: (path: number[]) => {
                if (path[0] === 0) {
                  return [{ children: [{ text: 'First paragraph ref' }] }, [0]];
                }

                return [{ children: [{ text: 'Second paragraph ref' }] }, [2]];
              },
            },
            text: {
              string: (path: number[]) =>
                path[0] === 0 ? 'First paragraph ref' : 'Second paragraph ref',
            },
          },
          update: {
            footnote: {
              focusReference,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '2' } as any}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    fireEvent.mouseDown(
      view.getByRole('button', { name: 'Back to reference 2' })
    );

    expect(focusReference).not.toHaveBeenCalled();
    expect(view.container.textContent).toContain('First paragraph ref');
    expect(view.container.textContent).toContain('Second paragraph ref');

    fireEvent.click(view.getByRole('button', { name: /Second paragraph ref/ }));

    expect(focusReference).toHaveBeenCalledWith({
      ref: '2',
      index: 1,
    });
  });

  it('renders a compact definition row instead of the old editor chrome', async () => {
    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          update: { footnote: { focusReference: () => true } },
        } as any)}
        element={{ children: [{ text: '' }], ref: '2' } as any}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    expect(view.container.textContent).not.toContain('Footnote 2');
    expect(view.container.textContent).not.toContain('Back to reference');
    expect(
      view.getByRole('button', { name: 'Back to reference 2' }).textContent
    ).toBe('2');
  });

  it('renders the definition body only once', async () => {
    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          update: { footnote: { focusReference: () => true } },
        } as any)}
        element={{ children: [{ text: '' }], ref: '2' } as any}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    expect(view.container.textContent).toContain('Body');
    expect(view.container.textContent?.match(/Body/g)?.length).toBe(1);
  });

  it('shows a visible selected outline on the reference when the atom is selected', async () => {
    isFocused = true;
    isSelected = true;

    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '1' } as any}
        path={nodePath}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.getByRole('button', { name: '[1]' }).className).toContain(
      'ring-2'
    );
  });

  it('shows a visible selected outline when the collapsed selection is inside the inline-void child', async () => {
    isFocused = true;
    nodePath = [0, 1];
    selection = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    };

    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '1' } as any}
        path={nodePath}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.getByRole('button', { name: '[1]' }).className).toContain(
      'ring-2'
    );
  });

  it('shows an unresolved hover state when the definition is missing', async () => {
    const createDefinition = mock();
    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => {},
              hasDuplicateDefinitions: () => false,
              isResolved: () => false,
            },
          },
          update: {
            footnote: {
              createDefinition,
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '3' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.container.textContent).not.toContain(
      'Missing footnote definition.'
    );

    fireEvent.mouseDown(
      view.getByRole('button', { name: 'Create definition for [^3]' })
    );

    expect(createDefinition).toHaveBeenCalledWith({ ref: '3' });
  });

  it('mod-clicking an unresolved reference creates the missing definition', async () => {
    const createDefinition = mock();
    const focusDefinition = mock();
    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => {},
              hasDuplicateDefinitions: () => false,
              isResolved: () => false,
            },
          },
          update: {
            footnote: {
              createDefinition,
              focusDefinition,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '9' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    fireEvent.mouseDown(view.getByRole('button', { name: '[9]' }), {
      metaKey: true,
    });

    expect(createDefinition).toHaveBeenCalledWith({ ref: '9' });
    expect(focusDefinition).not.toHaveBeenCalled();
  });

  it('shows duplicate preview text without extra warning copy', async () => {
    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => true,
              isResolved: () => true,
            },
          },
          update: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '4' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.container.textContent).not.toContain(
      'Multiple definitions share this ref.'
    );
    expect(view.container.textContent).toContain('Preview');
  });

  it('renders later duplicate definitions with only a renumber repair action', async () => {
    nodePath = [5];
    editorSelectorEditor = {
      read: {
        footnote: {
          isDuplicateDefinition: () => true,
          nextRef: () => '7',
          references: () => [],
        },
      },
    };
    const normalizeDuplicateDefinition = mock();

    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              isDuplicateDefinition: () => true,
              nextRef: () => '7',
              references: () => [],
            },
          },
          update: {
            footnote: {
              focusReference: mock(),
              normalizeDuplicateDefinition,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], ref: '2' } as any}
        path={nodePath}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    expect(
      view.queryByRole('button', { name: 'Back to reference 2' })
    ).toBeNull();
    expect(view.container.textContent).not.toContain(
      'Duplicate footnote definition.'
    );
    expect(
      view.getByRole('button', { name: 'Renumber to [^7]' })
    ).toBeDefined();

    fireEvent.mouseDown(view.getByRole('button', { name: 'Renumber to [^7]' }));

    expect(normalizeDuplicateDefinition).toHaveBeenCalledWith({
      ref: '7',
      path: [5],
    });
  });

  it('refreshes the hover preview when the definition text changes while open', async () => {
    const state = { preview: 'Old preview' };

    const editor = withPluginEditor({
      read: {
        footnote: {
          definitionText: () => state.preview,
          hasDuplicateDefinitions: () => false,
          isResolved: () => true,
        },
      },
      update: {
        footnote: {
          focusDefinition: () => true,
        },
      },
    } as any);
    editorSelectorEditor = undefined;

    const { FootnoteReferenceElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const { container, rerender } = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={editor}
        element={{ children: [{ text: '' }], ref: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Old preview');
    });

    state.preview = 'New preview';

    rerender(
      <FootnoteReferenceElement
        attributes={{}}
        editor={editor}
        element={{ children: [{ text: '' }], ref: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('New preview');
    });
  });

  it('uses the current element path for duplicate-state lookup', async () => {
    nodePath = [1];
    editorSelectorEditor = {
      read: {
        footnote: {
          isDuplicateDefinition: ({ path }: any) => path[0] === 2,
          references: () => [[{}, [0, 1]]],
        },
        nodes: {
          parent: () => [{ children: [{ text: 'Reference paragraph' }] }, [0]],
        },
        text: {
          string: () => 'Reference paragraph',
        },
      },
    };

    const { FootnoteDefinitionElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          update: { footnote: { focusReference: mock() } },
        } as any)}
        element={{ children: [{ text: '' }], ref: '3' } as any}
        path={nodePath}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    expect(view.container.textContent).not.toContain(
      'Duplicate footnote definition.'
    );
    expect(
      view.getByRole('button', { name: 'Back to reference 3' })
    ).toBeDefined();
  });

  it('lists the next free footnote first in the inline combobox', async () => {
    const insertFootnote = mock();
    const deleteBackward = mock();
    const { FootnoteInputElement } = await import(
      `./footnote?test=${Math.random().toString(36).slice(2)}`
    );

    selection = {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    const view = render(
      <FootnoteInputElement
        attributes={{}}
        editor={withPluginEditor({
          read: {
            footnote: {
              definitionText: ({ ref }: any) =>
                ref === '1' ? 'hello there' : 'another',
              refs: () => ['1', '2'],
              nextRef: () => '3',
            },
            points: {
              before: () => ({ offset: 0, path: [0, 0] }),
            },
            ranges: {
              get: () => ({}),
            },
            text: {
              string: () => '[',
            },
          },
          update: {
            footnote: {
              insert: insertFootnote,
            },
            text: {
              deleteBackward,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }] } as any}
      >
        <span />
      </FootnoteInputElement>
    );

    const buttons = view.getAllByRole('button');

    expect(buttons[0].textContent).toContain('[^3]');
    expect(buttons[1].textContent).toContain('[^1]');
    expect(buttons[2].textContent).toContain('[^2]');

    fireEvent.click(buttons[0]!);

    expect(deleteBackward).not.toHaveBeenCalled();
    expect(insertFootnote).toHaveBeenCalledWith({
      focusDefinition: false,
      ref: '3',
      trigger: '[',
    });
  });
});
