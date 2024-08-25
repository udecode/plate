import {
  type ExtendConfig,
  type OmitFirst,
  bindFirst,
} from '@udecode/plate-common';
import { toTPlatePlugin } from '@udecode/plate-common/react';

import {
  type LinkConfig as BaseLinkConfig,
  LinkPlugin as BaseLinkPlugin,
  type TLinkElement,
} from '../lib';
import { getLinkAttributes } from './utils';

export type FloatingLinkMode = '' | 'edit' | 'insert';

export type LinkConfig = ExtendConfig<
  BaseLinkConfig,
  {
    /**
     * Default HTML attributes for link elements.
     *
     * @default { }
     */
    defaultLinkAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    isEditing: boolean;
    mode: FloatingLinkMode;
    mouseDown: boolean;
    newTab: boolean;
    openEditorId: null | string;
    text: string;
    triggerFloatingLinkHotkeys?: string;
    updated: boolean;
    url: string;
  } & LinkSelectors,
  {
    floatingLink: {
      hide: () => void;
      reset: () => void;
      show: (mode: FloatingLinkMode, editorId: string) => void;
    };
    link: {
      getAttributes: OmitFirst<typeof getLinkAttributes>;
    };
  }
>;

export type LinkSelectors = {
  isOpen?: (editorId: string) => boolean;
};

/** Enables support for hyperlinks. */
export const LinkPlugin = toTPlatePlugin<LinkConfig>(BaseLinkPlugin, {
  options: {
    defaultLinkAttributes: {},
    isEditing: false,
    mode: '' as FloatingLinkMode,
    mouseDown: false,
    newTab: false,
    openEditorId: null,
    text: '',
    triggerFloatingLinkHotkeys: 'meta+k, ctrl+k',
    updated: false,
    url: '',
  },
})
  .extendEditorApi<Partial<LinkConfig['api']>>(({ editor }) => ({
    link: {
      getAttributes: bindFirst(getLinkAttributes, editor),
    },
  }))
  .extendEditorApi<Partial<LinkConfig['api']>>(({ setOptions }) => ({
    floatingLink: {
      hide: () => {
        setOptions({
          isEditing: false,
          mode: '' as FloatingLinkMode,
          mouseDown: false,
          newTab: false,
          openEditorId: null,
          text: '',
          updated: false,
          url: '',
        });
      },
      reset: () => {
        setOptions({
          isEditing: false,
          mode: '' as FloatingLinkMode,
          mouseDown: false,
          newTab: false,
          text: '',
          updated: false,
          url: '',
        });
      },
      show: (mode: FloatingLinkMode, editorId: string) => {
        setOptions({
          isEditing: false,
          mode,
          openEditorId: editorId,
        });
      },
    },
  }))
  .extendOptions(({ getOptions }) => ({
    isOpen: (editorId: string) => getOptions().openEditorId === editorId,
  }))
  .extend(({ api }) => ({
    node: {
      props: ({ element }) => ({
        nodeProps: api.link.getAttributes(element as TLinkElement),
      }),
    },
  }));
