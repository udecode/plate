import React from 'react';
import { render } from '@testing-library/react';
import {
  createEditor,
  Descendant,
  Editor,
  NodeEntry,
  Transforms,
  Selection,
} from 'slate';
import { Plate } from './Plate';
import { PlatePlugin, TEditor } from '../types';
import { isEqual, memoize } from 'lodash';

describe('Plate', () => {
  it('should render', () => {
    render(<Plate />);

    expect(1).toBe(1);
  });
});

describe('Plate', () => {
  it('should trigger normalize if normalizeInitialValue set', () => {
    const fn = jest.fn((e: TEditor, [node, path]: NodeEntry) => {
      if (
        Editor.isBlock(e, node) &&
        path?.length &&
        !isEqual((node as any).path, path)
      ) {
        Transforms.setNodes(e, { path } as any, { at: path });
      }
    });

    const plugins: PlatePlugin[] = memoize((): PlatePlugin[] => [
      {
        withOverrides: (e) => {
          const { normalizeNode } = e;
          e.normalizeNode = (n: NodeEntry) => {
            fn(e, n);
            normalizeNode(n);
          };
          return e;
        },
      },
    ])();

    const editor = createEditor();

    render(
      <Plate
        editor={editor as any}
        plugins={plugins}
        normalizeInitialValue
        initialValue={[{ children: [{ text: '' }] }]}
      />
    );

    expect(fn).toBeCalled();

    expect(editor.children).toStrictEqual([
      { children: [{ text: '' }], path: [0] },
    ]);
  });

  it('should not trigger normalize if normalizeInitialValue is not set to true', () => {
    const fn = jest.fn((e: TEditor, [node, path]: NodeEntry) => {
      if (
        Editor.isBlock(e, node) &&
        path?.length &&
        !isEqual((node as any).path, path)
      ) {
        Transforms.setNodes(e, { path } as any, { at: path });
      }
    });

    const plugins: PlatePlugin[] = memoize((): PlatePlugin[] => [
      {
        withOverrides: (e) => {
          const { normalizeNode } = e;
          e.normalizeNode = (n: NodeEntry) => {
            fn(e, n);
            normalizeNode(n);
          };
          return e;
        },
      },
    ])();

    const editor = createEditor();

    render(
      <Plate
        editor={editor as any}
        plugins={plugins}
        initialValue={[{ children: [{ text: '' }] }]}
      />
    );

    expect(fn).not.toBeCalled();

    expect(editor.children).not.toStrictEqual([
      { children: [{ text: '' }], path: [0] },
    ]);
  });
});
