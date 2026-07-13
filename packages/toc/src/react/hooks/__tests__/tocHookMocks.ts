import * as actualPlatejsReact from '../../../../../core/src/react';

import * as actualGetHeadingListModule from '../../../internal/getHeadingList';
import * as actualUtils from '../../utils';

export const checkInMock = mock(() => false);
export const getHeadingListMock = mock(() => []);
export const heightToTopMock = mock(() => 40);
export const useContentControllerMock = mock();
export const useContentObserverMock = mock();
export const useEditorPluginMock = mock();
export const useEditorRefMock = mock();
export const useEditorSelectorMock = mock();
export const useEditorScrollElementMock = mock();
export const useTocControllerMock = mock();

export const registerSharedTocHookMocks = () => {
  mock.module('@platejs/core/react', () => ({
    ...actualPlatejsReact,
    useEditorScrollElement: useEditorScrollElementMock,
    useEditorPlugin: useEditorPluginMock,
    useEditorRef: useEditorRefMock,
    useEditorSelector: useEditorSelectorMock,
  }));

  mock.module('../../../internal/getHeadingList', () => ({
    ...actualGetHeadingListModule,
    getHeadingList: getHeadingListMock,
  }));

  mock.module('../../utils', () => ({
    ...actualUtils,
    checkIn: checkInMock,
    heightToTop: heightToTopMock,
  }));
};

export const resetSharedTocHookMocks = () => {
  checkInMock.mockReset();
  checkInMock.mockReturnValue(false);
  getHeadingListMock.mockReset();
  getHeadingListMock.mockReturnValue([]);
  heightToTopMock.mockReset();
  heightToTopMock.mockReturnValue(40);
  useContentControllerMock.mockReset();
  useContentObserverMock.mockReset();
  useEditorPluginMock.mockReset();
  useEditorRefMock.mockReset();
  useEditorSelectorMock.mockReset();
  useEditorScrollElementMock.mockReset();
  useTocControllerMock.mockReset();
};
