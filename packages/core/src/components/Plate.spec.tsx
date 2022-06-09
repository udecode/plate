import React, { useEffect, useState } from 'react';
import { render } from '@testing-library/react';
import { isEqual, memoize } from 'lodash';
import { isBlock } from '../slate/editor/isBlock';
import { setNodes } from '../slate/transforms/setNodes';
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

  describe('adding a Plate instance', () => {
    it('should render', () => {
      const error = jest.spyOn(global.console, 'error');

      const PlateContainer = () => {
        const id = 'main';
        const [count, setCount] = useState(1);

        useEffect(() => {
          setCount(count + 1);
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
          <>
            {[...Array(count)].map((x, i) => (
              <Plate key={`${id}-${i}`} id={`${id}-${i}`} />
            ))}
          </>
        );
      };

      render(<PlateContainer />);

      expect(error).not.toHaveBeenCalled();
    });
  });
});
