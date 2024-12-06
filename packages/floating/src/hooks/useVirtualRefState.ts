import React, { useEffect } from 'react';

import type { Range } from 'slate';

import { useEditorRef } from '@udecode/plate-common/react';

import { type VirtualRef, createVirtualRef } from '../utils';

export const useVirtualRefState = ({ at }: { at?: Range | null }) => {
  const editor = useEditorRef();
  const [virtualRef, setVirtualRef] = React.useState<VirtualRef | undefined>();

  useEffect(() => {
    if (at) {
      setVirtualRef(createVirtualRef(editor, at));
    } else {
      setVirtualRef(undefined);
    }
  }, [at, editor]);

  return [virtualRef, setVirtualRef] as const;
};
