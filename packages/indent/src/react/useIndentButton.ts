import { useEditorPlugin } from '@platejs/core/react';

import { BaseIndentPlugin } from '../lib/BaseIndentPlugin';

export const useIndentButton = () => {
  const { update } = useEditorPlugin(BaseIndentPlugin);

  return {
    props: {
      onClick: () => {
        update.increase();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};

export const useOutdentButton = () => {
  const { update } = useEditorPlugin(BaseIndentPlugin);

  return {
    props: {
      onClick: () => {
        update.decrease();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
