import React from 'react';
import { render } from '@testing-library/react';
import { isEqual, memoize } from 'lodash';
import { isBlock } from '../../../slate/src/interfaces/editor/isBlock';
import { setNodes } from '../../../slate/src/interfaces/transforms/setNodes';
import {
  PlatePlugin,
  PlateRenderElementProps,
  PlateRenderLeafProps,
} from '../types';
import { createPluginFactory } from '../utils';
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

  describe('User-defined attributes', () => {
    const ParagraphElement = ({
      attributes,
      children,
      nodeProps,
    }: PlateRenderElementProps) => (
      <p {...attributes} {...nodeProps} data-testid="paragraph">
        {children}
      </p>
    );

    const BoldLeaf = ({
      attributes,
      children,
      nodeProps,
    }: PlateRenderLeafProps) => (
      <strong {...attributes} {...nodeProps} data-testid="bold">
        {children}
      </strong>
    );

    const getParagraphPlugin = (dangerouslyAllowAttributes: boolean) =>
      createPluginFactory({
        component: ParagraphElement,
        dangerouslyAllowAttributes: dangerouslyAllowAttributes
          ? ['data-my-paragraph-attribute']
          : undefined,
        isElement: true,
        key: 'p',
      });

    const getBoldPlugin = (dangerouslyAllowAttributes: boolean) =>
      createPluginFactory({
        component: BoldLeaf,
        dangerouslyAllowAttributes: dangerouslyAllowAttributes
          ? ['data-my-bold-attribute']
          : undefined,
        isLeaf: true,
        key: 'bold',
      });

    const initialValue = [
      {
        attributes: {
          'data-my-paragraph-attribute': 'hello',
          'data-unpermitted-paragraph-attribute': 'world',
        },
        children: [
          {
            attributes: {
              'data-my-bold-attribute': 'hello',
              'data-unpermitted-bold-attribute': 'world',
            },
            bold: true,
            text: 'My bold paragraph',
          },
        ],
        type: 'p',
      },
    ];

    const Editor = ({
      dangerouslyAllowAttributes,
    }: {
      dangerouslyAllowAttributes: boolean;
    }) => {
      const plugins = [
        getParagraphPlugin(dangerouslyAllowAttributes)(),
        getBoldPlugin(dangerouslyAllowAttributes)(),
      ];

      return <Plate initialValue={initialValue} plugins={plugins} />;
    };

    it('renders no user-defined attributes by default', () => {
      const { getByTestId } = render(
        <Editor dangerouslyAllowAttributes={false} />
      );

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual(['slateNode', 'testid']);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual(['slateLeaf', 'testid']);
    });

    it('renders allowed user-defined attributes', () => {
      const { getByTestId } = render(<Editor dangerouslyAllowAttributes />);

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual([
        'slateNode',
        'myParagraphAttribute',
        'testid',
      ]);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual([
        'slateLeaf',
        'myBoldAttribute',
        'testid',
      ]);
    });
  });
});
