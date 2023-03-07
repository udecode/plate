import React from 'react';
import { render } from '@testing-library/react';
import { isEqual, memoize } from 'lodash';
import { isBlock } from '../../../slate/src/interfaces/editor/isBlock';
import { setNodes } from '../../../slate/src/transforms/setNodes';
import { PlatePlugin } from '../types';
import { createPlateEditor } from '../utils/createPlateEditor';
import { Plate } from './Plate';

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
    //   const plugins: PlatePlugin[] = [
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
        if (
          isBlock(e, node) &&
          path?.length &&
          !isEqual((node as any).path, path)
        ) {
          setNodes(e, { path } as any, { at: path });
        }
      });

      const plugins: PlatePlugin[] = memoize((): PlatePlugin[] => [
        {
          key: 'a',
          withOverrides: (e) => {
            const { normalizeNode } = e;
            e.normalizeNode = (n) => {
              fn(e, n);
              normalizeNode(n);
            };
            return e;
          },
        },
      ])();

      const editor = createPlateEditor();

      render(
        <Plate
          editor={editor}
          plugins={plugins}
          initialValue={[{ children: [{ text: '' }] } as any]}
        />
      );

      expect(fn).not.toBeCalled();

      expect(editor.children).not.toStrictEqual([
        { children: [{ text: '' }], path: [0] },
      ]);
    });
  });

  describe('when renderAboveSlate renders null', () => {
    it('should not normalize editor children', () => {
      const plugins: PlatePlugin[] = [
        {
          key: 'a',
          renderAboveSlate: () => {
            return null;
          },
        },
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(<Plate editor={editor} initialValue={[{}] as any} />)
      ).not.toThrowError();
    });
  });

  describe('when renderAboveSlate renders children', () => {
    it("should not trigger plugin's normalize", () => {
      const plugins: PlatePlugin[] = [
        {
          key: 'a',
          renderAboveSlate: ({ children }) => {
            return <>{children}</>;
          },
        },
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(<Plate editor={editor} initialValue={[{}] as any} />)
      ).toThrowError();
    });
  });

  describe('when nested Plate', () => {
    it('should work', () => {
      const plugins: PlatePlugin[] = [
        {
          key: 'a',
          isElement: true,
          isVoid: true,
          component: ({ children, attributes }) => (
            <div {...attributes}>
              <Plate id="test" />
              {children}
            </div>
          ),
        },
      ];

      const editor = createPlateEditor({
        plugins,
      });

      expect(() =>
        render(
          <Plate
            editor={editor}
            initialValue={[{ type: 'a', children: [{ text: '' }] }] as any}
          />
        )
      ).not.toThrowError();
    });
  });
});
