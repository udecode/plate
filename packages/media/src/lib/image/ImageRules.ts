import {
  createRuleFactory,
  getInjectedPlugins,
  pipeInsertDataQuery,
} from 'platejs';

import { BaseImagePlugin } from './BaseImagePlugin';
import { insertImage, insertImageFromFiles } from './transforms';
import { isImageUrl } from './utils/isImageUrl';

type ImageFileMatch = {
  files: FileList;
};

type ImageUrlMatch = {
  text: string;
};

export const ImageRules = {
  embed: createRuleFactory<{}, {}, ImageUrlMatch>({
    type: 'insertData',
    resolve: ({ editor, text }) => {
      if (editor.getOptions(BaseImagePlugin).disableEmbedInsert) return;
      if (!text || !isImageUrl(text)) return;

      return { text };
    },
    apply: ({ editor }, match) => {
      insertImage(editor, match.text);

      return true;
    },
  }),
  upload: createRuleFactory<{}, {}, ImageFileMatch>({
    type: 'insertData',
    resolve: ({ data, editor, text }) => {
      if (editor.getOptions(BaseImagePlugin).disableUploadInsert) return;
      if (text) return;
      if (!data.files || data.files.length === 0) return;

      const plugin = editor.getPlugin(BaseImagePlugin);
      const injectedPlugins = getInjectedPlugins(editor, plugin);

      if (
        !pipeInsertDataQuery(editor, injectedPlugins, {
          data: text ?? '',
          dataTransfer: data,
          mimeType: 'text/plain',
        })
      ) {
        return;
      }

      return { files: data.files };
    },
    apply: ({ editor }, match) => {
      insertImageFromFiles(editor, match.files);

      return true;
    },
  }),
};
