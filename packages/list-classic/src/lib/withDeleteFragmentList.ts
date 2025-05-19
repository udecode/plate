import {
  type OverrideEditor,
  type SlateEditor,
  type TRange,
  deleteMerge,
} from '@udecode/plate';

import { type ListConfig, BaseListItemPlugin } from './BaseListPlugin';
import { getHighestEmptyList } from './queries/getHighestEmptyList';
import { hasListChild } from './queries/hasListChild';
import { isAcrossListItems } from './queries/isAcrossListItems';

const getLiStart = (editor: SlateEditor) => {
  const start = editor.api.start(editor.selection as TRange);

  return editor.api.above({
    at: start,
    match: { type: editor.getType(BaseListItemPlugin) },
  });
};

export const withDeleteFragmentList: OverrideEditor<ListConfig> = ({
  editor,
  tf: { deleteFragment },
}) => ({
  transforms: {
    deleteFragment(direction) {
      const deleteFragmentList = () => {
        let deleted = false;

        editor.tf.withoutNormalizing(() => {
          // Selection should be across list items
          if (!isAcrossListItems(editor)) return;

          /**
           * Check if the end li can be deleted (if it has no sublist). Store
           * the path ref to delete it after deleteMerge.
           */
          const end = editor.api.end(editor.selection as TRange);
          const liEnd = editor.api.above({
            at: end,
            match: { type: editor.getType(BaseListItemPlugin) },
          });
          const liEndCanBeDeleted = liEnd && !hasListChild(editor, liEnd[0]);
          const liEndPathRef = liEndCanBeDeleted
            ? editor.api.pathRef(liEnd![1])
            : undefined;

          // use deleteFragment when selection wrapped around list
          if (!getLiStart(editor) || !liEnd) {
            deleted = false;

            return;
          }

          /** Delete fragment and move end block children to start block */
          deleteMerge(editor);

          const liStart = getLiStart(editor);

          if (liEndPathRef) {
            const liEndPath = liEndPathRef.unref()!;
            const listStart = liStart && editor.api.parent(liStart[1]);

            const deletePath = getHighestEmptyList(editor, {
              diffListPath: listStart?.[1],
              liPath: liEndPath,
            });

            if (deletePath) {
              editor.tf.removeNodes({ at: deletePath });
            }

            deleted = true;
          }
        });

        return deleted;
      };

      if (deleteFragmentList()) return;

      deleteFragment(direction);
    },
  },
});
