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
  const api = {
    ...(editor.api ?? {}),
    footnote: {
      definitionText: () => {},
      hasDuplicateDefinitions: () => false,
      identifiers: () => [],
      isDuplicateDefinition: () => false,
      isResolved: () => false,
      nextId: () => '1',
      references: () => [],
      ...(editor.api?.footnote ?? {}),
    },
  };
  const tf = {
    ...(editor.tf ?? {}),
    footnote: {
      createDefinition: () => {},
      ...(editor.tf?.footnote ?? {}),
    },
    insert: {
      ...(editor.tf?.insert ?? {}),
    },
  };

  const pluginEditor = Object.assign(editor, {
    api,
    getApi: () => api,
    getTransforms: () => tf,
    tf,
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

const SlateElementMock = mock(
  ({ children, as: Comp = 'div', attributes, className, ...props }: any) => (
    <Comp {...attributes} {...props} className={className}>
      {children}
    </Comp>
  )
);

mock.module('platejs/react', () => ({
  PlateElement: PlateElementMock,
  toPlatePlugin: (plugin: unknown) => plugin,
  useEditorSelection: () => selection,
  useEditorSelector: (selector: any) => {
    const currentEditor = editorSelectorEditor
      ? withPluginEditor(editorSelectorEditor)
      : (lastPluginEditor ?? withPluginEditor({}));
    const api = {
      ...(currentEditor.api ?? {}),
      findPath: () => nodePath,
      footnote: {
        ...(lastPluginEditor?.api?.footnote ?? {}),
        ...(currentEditor.api?.footnote ?? {}),
      },
    };
    const tf = currentEditor.tf ?? {};

    return selector({
      ...currentEditor,
      api,
      getApi: () => api,
      getOption: currentEditor.getOption ?? (() => null),
      getTransforms: () => tf,
    });
  },
  useFocused: () => isFocused,
  useNavigationHighlight: (path?: number[]) => {
    const activeTarget = editorSelectorEditor?.getOption?.();

    if (!path || !activeTarget) return null;
    if (JSON.stringify(activeTarget.path) !== JSON.stringify(path)) return null;

    return activeTarget;
  },
  usePath: () => nodePath,
  useSelected: () => isSelected,
}));

mock.module('platejs/static', () => ({
  SlateElement: SlateElementMock,
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

mock.module('@/registry/ui/inline-combobox', () => ({
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
    SlateElementMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders the footnote reference label without duplicating the identifier text', async () => {
    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.container.textContent).toContain('[1]');
    expect(view.container.textContent).not.toContain('[1]1');
  });

  it('renders the static footnote reference label without duplicating the identifier text', async () => {
    const { FootnoteReferenceElementStatic } = await import(
      `./footnote-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElementStatic
        attributes={{}}
        editor={{} as any}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
      >
        <span />
      </FootnoteReferenceElementStatic>
    );

    expect(view.container.textContent).toBe('[1]');
  });

  it('uses mousedown for reference navigation so the editor can keep focus', async () => {
    const focusDefinition = mock();
    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    fireEvent.mouseDown(view.getByRole('button', { name: '[1]' }), {
      metaKey: true,
    });

    expect(focusDefinition).toHaveBeenCalledWith({ identifier: '1' });
  });

  it('prevents the follow-up click default on a meta-clicked reference button', async () => {
    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition: mock(),
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
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
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          tf: {
            footnote: {
              focusReference,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '2' } as any}
      >
        <p>Body</p>
      </FootnoteDefinitionElement>
    );

    fireEvent.mouseDown(
      view.getByRole('button', { name: 'Back to reference 2' })
    );

    expect(focusReference).toHaveBeenCalledWith({ identifier: '2' });
  });

  it('applies navigation highlight attrs to the current footnote target', async () => {
    nodePath = [1];
    editorSelectorEditor = {
      getOption: () => ({
        cycle: 1,
        duration: 800,
        path: [1],
        pulse: 3,
        variant: 'navigated',
      }),
    };

    const { FootnoteDefinitionElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          api: { footnote: { references: () => [] } },
          tf: { footnote: {} },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '2' } as any}
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
      getOption: () => ({
        cycle: 0,
        duration: 800,
        path: [0, 1],
        pulse: 4,
        variant: 'navigated',
      }),
    };

    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
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
      api: {
        findPath: () => [1],
        footnote: {
          references: () => [
            [{}, [0, 1]],
            [{}, [2, 1]],
          ],
        },
        parent: (path: number[]) => {
          if (path[0] === 0) {
            return [{ children: [{ text: 'First paragraph ref' }] }, [0]];
          }

          return [{ children: [{ text: 'Second paragraph ref' }] }, [2]];
        },
        string: (path: number[]) =>
          path[0] === 0 ? 'First paragraph ref' : 'Second paragraph ref',
      },
    };
    const { FootnoteDefinitionElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              references: () => [
                [{}, [0, 1]],
                [{}, [2, 1]],
              ],
            },
            parent: (path: number[]) => {
              if (path[0] === 0) {
                return [{ children: [{ text: 'First paragraph ref' }] }, [0]];
              }

              return [{ children: [{ text: 'Second paragraph ref' }] }, [2]];
            },
            string: (path: number[]) =>
              path[0] === 0 ? 'First paragraph ref' : 'Second paragraph ref',
          },
          tf: {
            footnote: {
              focusReference,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '2' } as any}
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
      identifier: '2',
      index: 1,
    });
  });

  it('renders a compact definition row instead of the old editor-definition chrome', async () => {
    const { FootnoteDefinitionElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          tf: { footnote: { focusReference: () => true } },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '2' } as any}
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
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          tf: { footnote: { focusReference: () => true } },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '2' } as any}
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
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
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
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    };

    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => false,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
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
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => {},
              hasDuplicateDefinitions: () => false,
              isResolved: () => false,
            },
          },
          tf: {
            footnote: {
              createDefinition,
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '3' } as any}
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

    expect(createDefinition).toHaveBeenCalledWith({ identifier: '3' });
  });

  it('mod-clicking an unresolved reference creates the missing definition', async () => {
    const createDefinition = mock();
    const focusDefinition = mock();
    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => {},
              hasDuplicateDefinitions: () => false,
              isResolved: () => false,
            },
          },
          tf: {
            footnote: {
              createDefinition,
              focusDefinition,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '9' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    fireEvent.mouseDown(view.getByRole('button', { name: '[9]' }), {
      metaKey: true,
    });

    expect(createDefinition).toHaveBeenCalledWith({ identifier: '9' });
    expect(focusDefinition).not.toHaveBeenCalled();
  });

  it('shows duplicate preview text without extra warning copy', async () => {
    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              definitionText: () => 'Preview',
              hasDuplicateDefinitions: () => true,
              isResolved: () => true,
            },
          },
          tf: {
            footnote: {
              focusDefinition: () => true,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '4' } as any}
      >
        <span />
      </FootnoteReferenceElement>
    );

    expect(view.container.textContent).not.toContain(
      'Multiple definitions share this identifier.'
    );
    expect(view.container.textContent).toContain('Preview');
  });

  it('renders later duplicate definitions with only a renumber repair action', async () => {
    nodePath = [5];
    editorSelectorEditor = {
      api: {
        findPath: () => [5],
        footnote: {
          isDuplicateDefinition: () => true,
          nextId: () => '7',
          references: () => [],
        },
      },
    };
    const normalizeDuplicateDefinition = mock();

    const { FootnoteDefinitionElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            footnote: {
              isDuplicateDefinition: () => true,
              nextId: () => '7',
              references: () => [],
            },
          },
          tf: {
            footnote: {
              focusReference: mock(),
              normalizeDuplicateDefinition,
            },
          },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '2' } as any}
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
      identifier: '7',
      path: [5],
    });
  });

  it('refreshes the hover preview when the definition text changes while open', async () => {
    const state = { preview: 'Old preview' };

    const editor = withPluginEditor({
      api: {
        footnote: {
          definitionText: () => state.preview,
          hasDuplicateDefinitions: () => false,
          isResolved: () => true,
        },
      },
      tf: {
        footnote: {
          focusDefinition: () => true,
        },
      },
    } as any);
    editorSelectorEditor = undefined;

    const { FootnoteReferenceElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const { container, rerender } = render(
      <FootnoteReferenceElement
        attributes={{}}
        editor={editor}
        element={{ children: [{ text: '' }], identifier: '1' } as any}
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
        element={{ children: [{ text: '' }], identifier: '1' } as any}
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
      api: {
        footnote: {
          isDuplicateDefinition: ({ path }: any) => path[0] === 2,
          references: () => [[{}, [0, 1]]],
        },
        parent: () => [{ children: [{ text: 'Reference paragraph' }] }, [0]],
        string: () => 'Reference paragraph',
      },
    };

    const { FootnoteDefinitionElement } = await import(
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteDefinitionElement
        attributes={{}}
        editor={withPluginEditor({
          tf: { footnote: { focusReference: mock() } },
        } as any)}
        element={{ children: [{ text: '' }], identifier: '3' } as any}
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
      `./footnote-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FootnoteInputElement
        attributes={{}}
        editor={withPluginEditor({
          api: {
            before: () => ({ offset: 0, path: [0, 0] }),
            footnote: {
              definitionText: ({ identifier }: any) =>
                identifier === '1' ? 'hello there' : 'another',
              identifiers: () => ['1', '2'],
              nextId: () => '3',
            },
            range: () => ({}),
            string: () => '[',
          },
          selection: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
          tf: {
            deleteBackward,
            insert: {
              footnote: insertFootnote,
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

    expect(deleteBackward).toHaveBeenCalledWith('character');
    expect(insertFootnote).toHaveBeenCalledWith({
      focusDefinition: false,
      identifier: '3',
    });
  });
});
