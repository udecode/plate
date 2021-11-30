import { ListItemMarkerSelection } from '@udecode/plate-list';
import { SetStateAction, useAtom } from 'jotai';
import { listItemMarkerSelectionAtomFamily, Param } from '../atoms';

export const useListItemMarkerSelection = (
  id: string
): [
  ListItemMarkerSelection | undefined,
  {
    setMarkerSelection: (
      param: SetStateAction<ListItemMarkerSelection | undefined>
    ) => void;
    removeMarkerSelection: (param: Param) => void;
  }
] => {
  const [markerSelection, setMarkerSelection] = useAtom(
    listItemMarkerSelectionAtomFamily({ id })
  );

  return [
    markerSelection,
    {
      setMarkerSelection,
      removeMarkerSelection: listItemMarkerSelectionAtomFamily.remove,
    },
  ];
};
