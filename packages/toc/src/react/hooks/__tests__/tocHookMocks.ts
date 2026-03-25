import * as actualPlatejs from 'platejs';
import * as actualPlatejsReact from 'platejs/react';

import * as actualGetHeadingListModule from '../../../internal/getHeadingList';
import * as actualUtils from '../../utils';

export const checkInMock = mock(() => false);
export const getHeadingListMock = mock(() => []);
export const heightToTopMock = mock(() => 40);
export const nodeGetMock = mock(() => ({ id: 'node' }));
export const useContentControllerMock = mock();
export const useContentObserverMock = mock();
export const useEditorPluginMock = mock();
export const useEditorRefMock = mock();
export const useEditorSelectorMock = mock();
export const useScrollRefMock = mock();
export const useTocControllerMock = mock();

export const registerSharedTocHookMocks = () => {
  mock.module('platejs', () => ({
    ...actualPlatejs,
    KEYS: {
      ...actualPlatejs.KEYS,
      blockSelection: 'blockSelection',
    },
    NodeApi: {
      ...actualPlatejs.NodeApi,
      get: nodeGetMock,
    },
  }));

  mock.module('platejs/react', () => ({
    ...actualPlatejsReact,
    useEditorPlugin: useEditorPluginMock,
    useEditorRef: useEditorRefMock,
    useEditorSelector: useEditorSelectorMock,
    useScrollRef: useScrollRefMock,
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
  nodeGetMock.mockReset();
  nodeGetMock.mockImplementation(() => ({ id: 'node' }));
  useContentControllerMock.mockReset();
  useContentObserverMock.mockReset();
  useEditorPluginMock.mockReset();
  useEditorRefMock.mockReset();
  useEditorSelectorMock.mockReset();
  useScrollRefMock.mockReset();
  useTocControllerMock.mockReset();
};
