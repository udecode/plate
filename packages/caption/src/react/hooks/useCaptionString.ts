import React from 'react';

import { useElement } from '@platejs/core/react';
import { NodeApi } from '@platejs/plite';
import type { TCaptionElement } from '@platejs/utils';

const emptyCaption = { text: '' };

export const useCaptionString = () => {
  const { caption: nodeCaption = [emptyCaption] } =
    useElement<TCaptionElement>();

  return React.useMemo(
    () => NodeApi.string(nodeCaption[0] ?? emptyCaption) || '',
    [nodeCaption]
  );
};
