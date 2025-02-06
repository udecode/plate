import { useEffect, useRef, useState } from 'react';

import { isHotkey } from '@udecode/plate';

import { ImagePreviewStore, useImagePreviewValue } from '../ImagePreviewStore';

export const useScaleInput = () => {
  const scale = useImagePreviewValue('scale');
  const isEditingScale = useImagePreviewValue('isEditingScale');

  const [value, setValue] = useState(scale * 100 + '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingScale) return;

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isEditingScale]);

  return {
    props: {
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isHotkey('enter')(e)) {
          if (Number(value) <= 50) {
            ImagePreviewStore.set('scale', 0.5);
            ImagePreviewStore.set('isEditingScale', false);

            return;
          }
          if (Number(value) >= 200) {
            ImagePreviewStore.set('scale', 2);
            ImagePreviewStore.set('isEditingScale', false);

            return;
          }

          ImagePreviewStore.set(
            'scale',
            Number((Number(value) / 100).toFixed(2))
          );
          ImagePreviewStore.set('isEditingScale', false);
        }
      },
    },
    ref: inputRef,
  };
};
