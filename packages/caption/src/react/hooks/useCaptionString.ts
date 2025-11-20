import React from 'react';

import type { TCaptionElement } from 'platejs';

import { NodeApi } from 'platejs';
import { useElement } from 'platejs/react';

export const useCaptionString = () => {
  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } =
    useElement<TCaptionElement>();

  return React.useMemo(
    () => NodeApi.string(nodeCaption[0] as any) || '',
    [nodeCaption]
  );
};
