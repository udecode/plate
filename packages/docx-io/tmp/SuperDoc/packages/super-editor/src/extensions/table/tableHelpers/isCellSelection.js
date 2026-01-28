import { CellSelection } from 'prosemirror-tables';

export const isCellSelection = (value) => value instanceof CellSelection;
