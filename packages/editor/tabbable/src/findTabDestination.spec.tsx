/** @jsx jsx */

import { getNode, PlateEditor, TNode } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '@udecode/plate-ui/src/index';
import {
  findTabDestination,
  FindTabDestinationOptions,
} from './findTabDestination';
import { TabbableEntry } from './types';

jsx;

describe('findTabDestination', () => {
  const editor = createPlateUIEditor({
    editor: ((
      <editor>
        <hp>Line 1</hp>
        <element type="my-void" void>
          <htext />
        </element>
        <hp>Line 2</hp>
        <hp>Line 3</hp>
        <element type="my-void" void>
          <htext />
          <cursor />
        </element>
        <element type="my-void" void>
          <htext />
        </element>
        <hp>Line 4</hp>
      </editor>
    ) as any) as PlateEditor,
  });

  const voidPath1 = [1];
  const voidSlateNode1 = getNode(editor, voidPath1) as TNode;
  const voidDOMNode1 = document.createElement('div') as HTMLElement;

  const voidPath2 = [4];
  const voidSlateNode2 = getNode(editor, voidPath2) as TNode;
  const voidDOMNode2a = document.createElement('div') as HTMLElement;
  const voidDOMNode2b = document.createElement('div') as HTMLElement;

  const voidPath3 = [5];
  const voidSlateNode3 = getNode(editor, voidPath3) as TNode;
  const voidDOMNode3 = document.createElement('div') as HTMLElement;

  const tabbableEntries = [
    { slateNode: voidSlateNode1, domNode: voidDOMNode1, path: voidPath1 },
    { slateNode: voidSlateNode2, domNode: voidDOMNode2a, path: voidPath2 },
    { slateNode: voidSlateNode2, domNode: voidDOMNode2b, path: voidPath2 },
    { slateNode: voidSlateNode3, domNode: voidDOMNode3, path: voidPath3 },
  ] as TabbableEntry[];

  const defaultOptions = {
    tabbableEntries,
    activeTabbableEntry: tabbableEntries[1],
    direction: 'forward',
  } as FindTabDestinationOptions;

  describe('when first of multiple tabbables with the same path is active', () => {
    const activeOverride = {} as any;

    describe('when direction is forward', () => {
      const directionOverride = {} as any;

      it('should return the next tabbable with the same path', () => {
        const tabDestination = findTabDestination(editor, {
          ...defaultOptions,
          ...activeOverride,
          ...directionOverride,
        });

        expect(tabDestination).toEqual({
          type: 'dom-node',
          domNode: voidDOMNode2b,
        });
      });
    });

    describe('when direction is backward', () => {
      const directionOverride = { direction: 'backward' } as any;

      it('should return the path of the tabbable', () => {
        const tabDestination = findTabDestination(editor, {
          ...defaultOptions,
          ...activeOverride,
          ...directionOverride,
        });

        expect(tabDestination).toEqual({
          type: 'path',
          path: voidPath2.concat(0),
        });
      });
    });
  });

  describe('when last of multiple tabbables with the same path is active', () => {
    const activeOverride = { activeTabbableEntry: tabbableEntries[2] } as any;

    describe('when direction is forward', () => {
      const directionOverride = {} as any;

      it('should return the path after that of the tabbable', () => {
        const tabDestination = findTabDestination(editor, {
          ...defaultOptions,
          ...activeOverride,
          ...directionOverride,
        });

        expect(tabDestination).toEqual({
          type: 'path',
          path: [5, 0],
        });
      });
    });

    describe('when direction is backward', () => {
      const directionOverride = { direction: 'backward' } as any;

      it('should return the previous tabbable with the same path', () => {
        const tabDestination = findTabDestination(editor, {
          ...defaultOptions,
          ...activeOverride,
          ...directionOverride,
        });

        expect(tabDestination).toEqual({
          type: 'dom-node',
          domNode: voidDOMNode2a,
        });
      });
    });
  });

  describe('when no tabbable is active', () => {
    const activeOverride = { activeTabbableEntry: null } as any;

    describe('when selection is between two tabbables', () => {
      const editorWithSelection = {
        ...editor,
        selection: {
          anchor: { path: [2, 0], offset: 0 },
          focus: { path: [2, 0], offset: 0 },
        },
      } as PlateEditor;

      describe('when direction is forward', () => {
        const directionOverride = {} as any;

        it('should return the next tabbable', () => {
          const tabDestination = findTabDestination(editorWithSelection, {
            ...defaultOptions,
            ...activeOverride,
            ...directionOverride,
          });

          expect(tabDestination).toEqual({
            type: 'dom-node',
            domNode: voidDOMNode2a,
          });
        });
      });

      describe('when direction is backward', () => {
        const directionOverride = { direction: 'backward' } as any;

        it('should return the previous tabbable', () => {
          const tabDestination = findTabDestination(editorWithSelection, {
            ...defaultOptions,
            ...activeOverride,
            ...directionOverride,
          });

          expect(tabDestination).toEqual({
            type: 'dom-node',
            domNode: voidDOMNode1,
          });
        });
      });
    });

    describe('when selection is before the first tabbable', () => {
      const editorWithSelection = {
        ...editor,
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      } as PlateEditor;

      describe('when direction is backward', () => {
        const directionOverride = { direction: 'backward' } as any;

        it('should return null', () => {
          const tabDestination = findTabDestination(editorWithSelection, {
            ...defaultOptions,
            ...activeOverride,
            ...directionOverride,
          });

          expect(tabDestination).toBeNull();
        });
      });
    });

    describe('when selection is after the last tabbable', () => {
      const editorWithSelection = {
        ...editor,
        selection: {
          anchor: { path: [6, 0], offset: 0 },
          focus: { path: [6, 0], offset: 0 },
        },
      } as PlateEditor;

      describe('when direction is forward', () => {
        const directionOverride = {} as any;

        it('should return null', () => {
          const tabDestination = findTabDestination(editorWithSelection, {
            ...defaultOptions,
            ...activeOverride,
            ...directionOverride,
          });

          expect(tabDestination).toBeNull();
        });
      });
    });
  });
});
