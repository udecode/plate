import { type ExtendConfig, type OmitFirst, bindFirst } from '@udecode/plate';
import { toTPlatePlugin } from '@udecode/plate/react';

import { type BaseLinkConfig, BaseLinkPlugin } from '../lib';
import { getLinkAttributes } from '../lib/utils';

export type FloatingLinkMode = '' | 'edit' | 'insert';

export type LinkConfig = ExtendConfig<
  BaseLinkConfig,
  {
    isEditing: boolean;
    mode: FloatingLinkMode;
    mouseDown: boolean;
    newTab: boolean;
    openEditorId: string | null;
    text: string;
    updated: boolean;
    url: string;
    /**
     * Default HTML attributes for link elements.
     *
     * @default { }
     */
    triggerFloatingLinkHotkeys?: string;
  },
  {
    floatingLink: {
      hide: () => void;
      reset: () => void;
      show: (mode: FloatingLinkMode, editorId: string) => void;
    };
    link: {
      getAttributes: OmitFirst<typeof getLinkAttributes>;
    };
  },
  {},
  {
    isOpen?: (editorId: string) => boolean;
  }
>;

/** Enables support for hyperlinks. */
export const LinkPlugin = toTPlatePlugin<LinkConfig>(BaseLinkPlugin, {
  options: {
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
  .extendSelectors<LinkConfig['selectors']>(({ getOptions }) => ({
    isOpen: (editorId) => getOptions().openEditorId === editorId,
  }));
