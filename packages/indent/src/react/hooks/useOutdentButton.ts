import type { InferPluginConfig } from '@platejs/core';
import { type PlateEditor, useEditorRef } from '@platejs/core/react';
import type { Value } from '@platejs/plite';

import type { BaseIndentPlugin } from '../../lib/BaseIndentPlugin';

export const useOutdentButton = () => {
  const editor =
    useEditorRef<
      PlateEditor<Value, InferPluginConfig<typeof BaseIndentPlugin>>
    >();

  return {
    props: {
      onClick: () => {
        editor.update.indent.decrease();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
