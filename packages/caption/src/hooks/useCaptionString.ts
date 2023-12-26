import React from 'react';
import { getNodeString, useElement } from '@udecode/plate-common';

import { TCaptionElement } from '../TCaptionElement';

export const useCaptionString = () => {
  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } =
    useElement<TCaptionElement>();

  return React.useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);
};
