import { useEffect } from 'react';
import { comboboxStore, IComboboxItem } from '@udecode/plate-combobox';
import { isDefined } from '@udecode/plate-common';

export const MentionComboboxEffect = () => {
  const search = comboboxStore.use.search();

  console.log('search', search);

  useEffect(() => {
    if (!isDefined(search)) return;

    const items: IComboboxItem[] = [
      {
        key: '1',
        text: 'one',
      },
    ].filter(
      (c) =>
        !isDefined(search) ||
        c.text?.toLowerCase().includes(search.toLowerCase())
    );

    comboboxStore.set.items(items);
  }, [search]);

  return null;
};
