import { act, render } from '@testing-library/react';
import type { Value, Element as PliteElementNode } from 'plitejs';
import React from 'react';

import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  moveNodes as editorMoveNodes,
} from '../../src/internal';
import {
  createEditor,
  type Editor,
  Editable,
  Plite,
  PliteElement,
  useEditorContext,
} from '../../src/react';
import { EditorContext, ElementContext } from '../../src/react/context';
import { createFastDOMSelectionRange } from '../../src/react/editable/fast-dom-selection-range';
import {
  usePliteNodeRef,
  getPliteNodeElementByPath,
  getPliteNodePathFromDOMElement,
  syncPliteNodePathBindingsToDOM,
} from '../../src/react/hooks/use-plite-node-ref';
import type { EditorContextValue } from '../../src/react/plugin/with-react';

const readElement = (editor: Editor, path: number[]) =>
  editor.read((state) => state.nodes.get(path))![0] as PliteElementNode;

describe('PliteElement node ref binding', () => {
  test('keeps repeated nested-path synchronization free of attribute mutations and repairs stale attributes', () => {
    const editor = createEditor<Value>({
      initialValue: [
        {
          type: 'block',
          children: [{ type: 'block', children: [{ text: 'one' }] }],
        },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [0, 0]);
    if (!nodeKey) throw new Error('Missing nested node key');
    const BoundNode = () => (
      <div data-testid="bound-node" ref={usePliteNodeRef(nodeKey)} />
    );
    const rendered = render(
      <EditorContext value={editor as unknown as EditorContextValue}>
        <BoundNode />
      </EditorContext>
    );
    const element = rendered.getByTestId('bound-node');
    const observer = new MutationObserver(() => {});
    observer.observe(element, { attributes: true });
    try {
      syncPliteNodePathBindingsToDOM(editor, [nodeKey]);
      syncPliteNodePathBindingsToDOM(editor, [nodeKey]);
      expect(observer.takeRecords()).toHaveLength(0);
      expect(element.getAttribute('data-plite-path')).toBe('0,0');
      expect(getPliteNodePathFromDOMElement(element)).toEqual([0, 0]);

      element.setAttribute('data-plite-path', '9,9');
      element.setAttribute('data-plite-node-key', 'stale');
      observer.takeRecords();
      syncPliteNodePathBindingsToDOM(editor, [nodeKey]);
      expect(
        observer.takeRecords().map((record) => record.attributeName)
      ).toEqual(['data-plite-path', 'data-plite-node-key']);
      expect(element.getAttribute('data-plite-path')).toBe('0,0');
      expect(element.getAttribute('data-plite-node-key')).toBe(nodeKey);
      expect(getPliteNodePathFromDOMElement(element)).toEqual([0, 0]);
    } finally {
      observer.disconnect();
    }
  });

  test.each([
    { records: 1, detachBeforeLookup: false },
    { records: 2, detachBeforeLookup: false },
    { records: 1, detachBeforeLookup: true },
    { records: 2, detachBeforeLookup: true },
  ])(
    'resolves $records flow records in their mounted view without path scans (detach before lookup: $detachBeforeLookup)',
    async ({ records, detachBeforeLookup }) => {
      // The deferred renderer guard must not warm the DOM lookup caches.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const children = [
        { text: 'one', token: 1 },
        { text: 'two', token: 2 },
      ].slice(0, records);
      const editor = createEditor<Value>({
        initialValue: [{ type: 'paragraph', children }],
      });
      const views: Array<ReturnType<typeof useEditorContext>> = [];
      const renderElement: NonNullable<
        React.ComponentProps<typeof Editable>['renderElement']
      > = ({ attributes, children: content }) => (
        <div {...attributes}>{content}</div>
      );
      const View = ({ index }: { index: number }) => {
        const view = useEditorContext();
        React.useLayoutEffect(() => {
          views[index] = view;
        }, [index, view]);

        return (
          <Editable
            domStrategy="full"
            id={`flow-view-${index}`}
            renderElement={renderElement}
          />
        );
      };
      const tree = (secondView: boolean) => (
        <Plite editor={editor}>
          <View index={0} />
          {secondView && (
            <Plite editor={editor}>
              <View index={1} />
            </Plite>
          )}
        </Plite>
      );
      const queries = vi.spyOn(HTMLElement.prototype, 'querySelectorAll');
      const rendered = render(tree(true));
      const roots = [0, 1].map((index) =>
        rendered.container.querySelector(`#flow-view-${index}`)!
      );
      const hosts = roots.map((root) =>
        root.querySelector('[data-plite-text-flow-host]')
      );
      const expectPoints = (viewIndex: number, texts: string[]) => {
        const root = roots[viewIndex];
        const host = root.querySelector('[data-plite-text-flow-host]');
        expect(host).not.toBeNull();
        expect(host?.hasAttribute('data-plite-path')).toBe(records === 1);
        texts.forEach((text, index) => {
          const point = views[viewIndex].api.dom.resolveDOMPoint({
            path: [0, index],
            offset: 1,
          });
          expect.soft(point).not.toBeNull();
          if (point) {
            expect.soft(root.contains(point[0])).toBe(true);
            expect.soft(point[0].textContent).toBe(text);
            expect.soft(point[1]).toBe(1);
          }
        });
      };
      const expectNoPathScans = () => {
        const scans = queries.mock.calls.filter(
          ([selector], index) =>
            selector.startsWith('[data-plite-path=') &&
            roots.some((root) => root === queries.mock.contexts[index])
        );
        expect.soft(scans).toEqual([]);
      };

      try {
        expect(views[0]).not.toBe(views[1]);
        expect(views[0].read.children()).toBe(views[1].read.children());
        if (!detachBeforeLookup) {
          expectPoints(
            0,
            children.map(({ text }) => text)
          );
          expectPoints(
            1,
            children.map(({ text }) => text)
          );
          expectNoPathScans();
          await act(async () => {
            editor.update.text.insert('!', { at: { path: [0, 0], offset: 3 } });
          });
          const texts = children.map(({ text }, index) =>
            index === 0 ? `${text}!` : text
          );
          expectPoints(0, texts);
          expectPoints(1, texts);
        }
        rendered.rerender(tree(false));
        expect(roots[1].isConnected).toBe(false);
        expect(roots[0].querySelector('[data-plite-text-flow-host]')).toBe(
          hosts[0]
        );
        expectPoints(
          0,
          children.map(({ text }, index) =>
            !detachBeforeLookup && index === 0 ? `${text}!` : text
          )
        );
        expectNoPathScans();
      } finally {
        rendered.unmount();
        queries.mockRestore();
        vi.useRealTimers();
      }
    }
  );

  test('keeps every DOM binding for a shared editor path', () => {
    const editor = createEditor<Value>({
      initialValue: [{ type: 'block', children: [{ text: 'one' }] }],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    const renderElement = (testId: string) => (
      <EditorContext value={editor as unknown as EditorContextValue}>
        <ElementContext
          value={{ element: readElement(editor, [0]), nodeKey, path: [0] }}
        >
          <PliteElement data-testid={testId}>content</PliteElement>
        </ElementContext>
      </EditorContext>
    );

    const first = render(renderElement('first'));
    const second = render(renderElement('second'));

    expect(getPliteNodeElementByPath(editor, [0])).toBeNull();

    second.unmount();

    expect(getPliteNodeElementByPath(editor, [0])).toBe(
      first.getByTestId('first')
    );
  });

  test('resolves selection endpoints inside the requested sibling DOM root', () => {
    const editor = createEditor<Value>({
      initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    });
    const rendered = render(
      <Plite editor={editor}>
        <Editable id="first-root" />
        <Editable id="second-root" />
      </Plite>
    );
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    for (const id of ['first-root', 'second-root']) {
      const editorElement = rendered.container.querySelector<HTMLElement>(
        `#${id}`
      )!;
      const range = createFastDOMSelectionRange({
        editor,
        editorElement,
        selection,
      });
      expect(range).not.toBeNull();
      expect(editorElement.contains(range!.startContainer)).toBe(true);
      expect(editorElement.contains(range!.endContainer)).toBe(true);
      expect(range!.toString()).toBe('on');
    }
  });

  test('does not export a sibling selection during the unfocused phase of keyboard transfer', () => {
    const editor = createEditor<Value>({
      initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    });
    const tree = (tick: number) => (
      <Plite editor={editor}>
        <Editable data-tick={tick} id="native-transfer" />
        <Editable data-tick={tick} id="target-transfer" />
      </Plite>
    );
    const rendered = render(tree(0));
    const target =
      rendered.container.querySelector<HTMLElement>('#target-transfer')!;
    act(() => {
      target.focus();
      editor.update.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
    act(() => target.blur());
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    const write = vi.spyOn(selection, 'setBaseAndExtent');
    try {
      rendered.rerender(tree(1));
      expect(write).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(document.body);
    } finally {
      write.mockRestore();
    }
  });

  test('rebinds DOM maps when a stable node key moves to another path', () => {
    const editor = createEditor<Value>({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    const renderElement = (path: number[]) => (
      <EditorContext value={editor as unknown as EditorContextValue}>
        <ElementContext
          value={{ element: readElement(editor, path), nodeKey, path }}
        >
          <PliteElement data-testid="bound-element">content</PliteElement>
        </ElementContext>
      </EditorContext>
    );

    const rendered = render(renderElement([0]));
    const element = rendered.getByTestId('bound-element');

    expect(getPliteNodeElementByPath(editor, [0])).toBe(element);
    expect(getPliteNodePathFromDOMElement(element)).toEqual([0]);

    act(() => {
      editorMoveNodes(editor, { at: [0], to: [2] });
    });

    expect(editorGetPathByNodeKey(editor, nodeKey)).toEqual([1]);

    rendered.rerender(renderElement([1]));

    expect(rendered.getByTestId('bound-element')).toBe(element);
    expect(element.getAttribute('data-plite-path')).toBe('1');
    expect(getPliteNodeElementByPath(editor, [0])).toBe(null);
    expect(getPliteNodeElementByPath(editor, [1])).toBe(element);
    expect(getPliteNodePathFromDOMElement(element)).toEqual([1]);
  });

  test('ignores stale path map entries after a DOM node is rebound', () => {
    const editor = createEditor<Value>({
      initialValue: [{ type: 'block', children: [{ text: 'one' }] }],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    render(
      <EditorContext value={editor as unknown as EditorContextValue}>
        <ElementContext
          value={{ element: readElement(editor, [0]), nodeKey, path: [0] }}
        >
          <PliteElement data-testid="bound-element">content</PliteElement>
        </ElementContext>
      </EditorContext>
    );

    const element = getPliteNodeElementByPath(editor, [0]);

    expect(element).toBeTruthy();

    element?.setAttribute('data-plite-path', '1');

    expect(getPliteNodeElementByPath(editor, [0])).toBe(null);
  });

  test('repairs a stale declarative path after an external rerender', () => {
    const editor = createEditor<Value>({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);
    const pliteNode = readElement(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    const BoundNode = ({ revision }: { revision: number }) => {
      const ref = usePliteNodeRef(nodeKey, { path: [0], pliteNode });

      return (
        <div
          data-plite-path="0"
          data-revision={revision}
          data-testid="bound-node"
          ref={ref}
        />
      );
    };
    const renderNode = (revision: number) => (
      <EditorContext value={editor as unknown as EditorContextValue}>
        <BoundNode revision={revision} />
      </EditorContext>
    );
    const rendered = render(renderNode(0));
    const element = rendered.getByTestId('bound-node');

    act(() => {
      editorMoveNodes(editor, { at: [0], to: [2] });
      syncPliteNodePathBindingsToDOM(editor, [nodeKey]);
    });

    expect(element.getAttribute('data-plite-path')).toBe('1');
    element.setAttribute('data-plite-path', '0');
    rendered.rerender(renderNode(1));

    expect(element.getAttribute('data-plite-path')).toBe('1');
    expect(getPliteNodePathFromDOMElement(element)).toEqual([1]);
  });
});
