import React from 'react';

import { render } from '@testing-library/react';
import { type Value, isBlock, setNodes } from '@udecode/slate';
import isEqual from 'lodash/isEqual.js';
import memoize from 'lodash/memoize.js';

import { type PlatePlugins, createPlugin } from '../../shared';
import { createPlateEditor } from '../utils';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

describe('Plate', () => {
  describe('when normalizeInitialValue false', () => {
    // it('should trigger normalize if normalizeInitialValue set', () => {
    //   const fn = jest.fn((e: TEditor<V>, [node, path]) => {
    //     if (
    //       isBlock(e, node) &&
    //       path?.length &&
    //       !isEqual((node as any).path, path)
    //     ) {
    //       setNodes(e, { path } as any, { at: path });
    //     }
    //   });
    //
    //   const plugins: PlatePluginList = [
    //     {
    //       key: 'a',
    //       withOverrides: (e) => {
    //         const { normalizeNode } = e;
    //         e.normalizeNode = (n: TNodeEntry) => {
    //           fn(e, n);
    //           normalizeNode(n);
    //         };
    //         return e;
    //       },
    //     },
    //   ];
    //
    //   const component = (
    //     <Plate
    //       plugins={plugins}
    //       normalizeInitialValue
    //       initialValue={[{ children: [{ text: '' }] }]}
    //     />
    //   );
    //
    //   render(component);

    // expect(fn).toBeCalled();

    //   expect(getPlateEditorRef().children).toStrictEqual([
    //     { children: [{ text: '' }], path: [0] },
    //   ]);
    // });

    it('should not trigger normalize if normalizeInitialValue is not set to true', () => {
      const fn = jest.fn((e, [node, path]) => {
        if (isBlock(e, node) && path?.length && !isEqual(node.path, path)) {
          setNodes(e, { path }, { at: path });
        }
      });

      const plugins: PlatePlugins = memoize(
        (): PlatePlugins => [
          createPlugin({
            key: 'a',
            withOverrides: ({ editor }) => {
              const { normalizeNode } = editor;
              editor.normalizeNode = (n) => {
                fn(editor, n);
                normalizeNode(n);
              };

              return editor;
            },
          }),
        ]
      )();

      const editor = createPlateEditor({
        plugins,
      });

      render(
        <Plate
          editor={editor}
          initialValue={[{ children: [{ text: '' }] }] as Value}
        >
          <PlateContent />
        </Plate>
      );

      expect(fn).not.toHaveBeenCalled();

      expect(editor.children).not.toStrictEqual([
        { children: [{ text: '' }], path: [0] },
      ]);
    });
  });

  describe('when renderAboveSlate renders null', () => {
    it('should not normalize editor children', () => {
      const plugins: PlatePlugins = [
        createPlugin({
          key: 'a',
          renderAboveSlate: () => {
            return null;
          },
        }),
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate editor={editor} initialValue={[{}] as any}>
            <PlateContent />
          </Plate>
        )
      ).not.toThrow();
    });
  });

  describe('when renderAboveSlate renders children', () => {
    it("should not trigger plugin's normalize", () => {
      const plugins: PlatePlugins = [
        createPlugin({
          key: 'a',
          renderAboveSlate: ({ children }) => {
            return <>{children}</>;
          },
        }),
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate editor={editor} initialValue={[{}] as Value}>
            <PlateContent />
          </Plate>
        )
      ).toThrow();
    });
  });

  describe('when nested Plate', () => {
    it('should work', () => {
      const nestedEditor = createPlateEditor({
        id: 'test',
      });

      const plugins: PlatePlugins = [
        createPlugin({
          component: ({ attributes, children }) => (
            <div {...attributes}>
              <Plate editor={nestedEditor}>
                <PlateContent id="test" />
              </Plate>
              {children}
            </div>
          ),
          isElement: true,
          isVoid: true,
          key: 'a',
        }),
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate
            editor={editor}
            initialValue={[{ children: [{ text: '' }], type: 'a' }] as Value}
          >
            <PlateContent />
          </Plate>
        )
      ).not.toThrow();
    });
  });
});
