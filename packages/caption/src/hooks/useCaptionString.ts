import React from 'react';

import { useElement } from '@udecode/plate-common';
import { getNodeString } from '@udecode/plate-common/server';

import type { TCaptionElement } from '../TCaptionElement';

export const useCaptionString = () => {
  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } =
    useElement<TCaptionElement>();

  return React.useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);
};
