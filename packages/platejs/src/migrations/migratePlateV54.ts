import { MAIN_ROOT_KEY, SelectionApi } from '../facade';
import { attachDocumentMigrationSelectionMapper } from '../internal/plugin/documentMigrationSelection.internal';
import { mapDocumentSelection } from '../internal/plugin/pipePrepareDocument';
import type { DocumentMigration } from '../lib/editor/documentMigrations';
import { migratePlateV54Ast } from './migratePlateV54Ast.internal';
import { migratePlateV54CodeBlocks } from './migratePlateV54CodeBlocks.internal';
import { migratePlateV54Profile } from './migratePlateV54Profile.internal';

/** Upgrade the frozen first-party Plate v53 document profile to v54. */
export const migratePlateV54: DocumentMigration = (context) => {
  const profile = migratePlateV54Profile(context);
  const ast = migratePlateV54Ast({ ...context, document: profile });
  const codeBlocks = migratePlateV54CodeBlocks({
    ...context,
    document: ast,
  });
  const mapCodeBlockSelection = codeBlocks.mapSelection;

  if (!mapCodeBlockSelection) return codeBlocks.document;

  return attachDocumentMigrationSelectionMapper(
    codeBlocks.document,
    (selection, mapped) => {
      const root = SelectionApi.root(selection) ?? MAIN_ROOT_KEY;
      const astSelection = mapDocumentSelection(
        context.editor,
        selection,
        context.document,
        ast,
        root
      );

      return mapCodeBlockSelection(astSelection, mapped);
    }
  );
};
