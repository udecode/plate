import React from 'react';

import { renderHook } from '@testing-library/react-hooks';

import {
  PlateController,
  usePlateControllerEditorStore,
} from './plateControllerStore';

const createWrapper =
  (props: Omit<React.ComponentProps<typeof PlateController>, 'children'>) =>
  // eslint-disable-next-line react/display-name
  ({ children }: any) => (
    <PlateController {...props}>{children}</PlateController>
  );

describe('plateControllerStore', () => {
  describe('usePlateControllerEditorStore', () => {
    describe('with an id', () => {
      const MATCHING_STORE = '2' as any;

      const wrapper = createWrapper({
        activeId: '1',
        editorStores: {
          '1': '1' as any,
          '2': MATCHING_STORE,
          '3': '3' as any,
          '4': null,
        },
        primaryEditorIds: ['3'],
      });

      describe('when the id exists', () => {
        it('returns the editor store', () => {
          const { result } = renderHook(
            () => usePlateControllerEditorStore('2'),
            { wrapper }
          );
          expect(result.current).toBe(MATCHING_STORE);
        });
      });

      describe('when the id does not exist', () => {
        it('returns null', () => {
          const { result } = renderHook(
            () => usePlateControllerEditorStore('5'),
            { wrapper }
          );
          expect(result.current).toBeNull();
        });
      });

      describe('when the id maps to null', () => {
        it('returns null', () => {
          const { result } = renderHook(
            () => usePlateControllerEditorStore('4'),
            { wrapper }
          );
          expect(result.current).toBeNull();
        });
      });
    });

    describe('without an id', () => {
      describe('when an id is active', () => {
        describe('when the active id exists', () => {
          const ACTIVE_STORE = '2' as any;

          const wrapper = createWrapper({
            activeId: '2',
            editorStores: {
              '1': '1' as any,
              '2': ACTIVE_STORE,
              '3': '3' as any,
              '4': null,
            },
            primaryEditorIds: ['3'],
          });

          it('returns the active editor store', () => {
            const { result } = renderHook(
              () => usePlateControllerEditorStore(),
              { wrapper }
            );
            expect(result.current).toBe(ACTIVE_STORE);
          });
        });

        describe('when the active id does not exist', () => {
          const PRIMARY_STORE = '3' as any;

          const wrapper = createWrapper({
            activeId: '5',
            editorStores: {
              '1': '1' as any,
              '2': '2' as any,
              '3': PRIMARY_STORE,
              '4': null,
            },
            primaryEditorIds: ['3'],
          });

          it('returns the primary editor store', () => {
            const { result } = renderHook(
              () => usePlateControllerEditorStore(),
              { wrapper }
            );
            expect(result.current).toBe(PRIMARY_STORE);
          });
        });

        describe('when the active id maps to null', () => {
          const PRIMARY_STORE = '3' as any;

          const wrapper = createWrapper({
            activeId: '4',
            editorStores: {
              '1': '1' as any,
              '2': '2' as any,
              '3': PRIMARY_STORE,
              '4': null,
            },
            primaryEditorIds: ['3'],
          });

          it('returns the primary editor store', () => {
            const { result } = renderHook(
              () => usePlateControllerEditorStore(),
              { wrapper }
            );
            expect(result.current).toBe(PRIMARY_STORE);
          });
        });
      });

      describe('when there is no active id', () => {
        describe('when there are primary editor ids', () => {
          const EXPECTED_STORE = '3' as any;

          const wrapper = createWrapper({
            activeId: null,
            editorStores: {
              '1': '1' as any,
              '2': null,
              '3': EXPECTED_STORE,
              '4': '4' as any,
            },
            primaryEditorIds: ['2', '5', '3', '4'],
          });

          it('returns the first extant primary editor store', () => {
            const { result } = renderHook(
              () => usePlateControllerEditorStore(),
              { wrapper }
            );
            expect(result.current).toBe(EXPECTED_STORE);
          });
        });

        describe('when all primary editor ids map to null', () => {
          const wrapper = createWrapper({
            activeId: null,
            editorStores: {
              '1': '1' as any,
              '2': null,
              '3': null,
              '4': '4' as any,
            },
            primaryEditorIds: ['2', '5', '3'],
          });

          it('returns null', () => {
            const { result } = renderHook(
              () => usePlateControllerEditorStore(),
              { wrapper }
            );
            expect(result.current).toBeNull();
          });
        });

        describe('when there are no primary editor ids', () => {
          const wrapper = createWrapper({
            activeId: null,
            editorStores: {
              '1': '1' as any,
              '2': null,
              '3': null,
              '4': '4' as any,
            },
            primaryEditorIds: [],
          });

          it('returns null', () => {
            const { result } = renderHook(
              () => usePlateControllerEditorStore(),
              { wrapper }
            );
            expect(result.current).toBeNull();
          });
        });
      });
    });
  });
});
