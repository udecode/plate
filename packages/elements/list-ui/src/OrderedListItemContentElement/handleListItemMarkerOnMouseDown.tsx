import * as React from 'react';
import { getAbove } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  getPlatePluginType,
  PlateEditor,
} from '@udecode/plate-core';
import {
  ELEMENT_LIC,
  KEY_LIST,
  ListItemMarkerSelection,
  WithListOptions,
} from '@udecode/plate-list';
import { SetStateAction } from 'jotai';
import { isEqual } from 'lodash';
import { ReactEditor } from 'slate-react';

export const handleListItemMarkerOnMouseDown = (
  ev: React.MouseEvent,
  editor: PlateEditor & ReactEditor,
  attributes: {
    'data-slate-node'?: 'element';
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
    ref: React.MutableRefObject<HTMLElement>;
  },
  setMarkerSelection: (
    update: SetStateAction<ListItemMarkerSelection | undefined>
  ) => void
): void => {
  if (attributes.ref?.current) {
    const licType = editor && getPlatePluginType(editor, ELEMENT_LIC);
    const { marks }: WithListOptions = editor
      ? getPlatePluginOptions<Required<WithListOptions>>(editor, KEY_LIST)
      : {};

    if (!marks?.length) {
      return;
    }

    try {
      const point = ReactEditor.toSlatePoint(
        editor,
        [attributes.ref.current, 0],
        { exactMatch: false, suppressThrow: false }
      );
      const lic = getAbove(editor, {
        at: point,
        match: { type: licType },
      });

      if (lic) {
        setMarkerSelection((state) => {
          if (state) {
            if (isEqual(state.path, lic[1])) {
              return {
                ...state,
                depth: !state.depth,
              };
            }
          }

          return {
            path: lic[1],
            depth: true,
          };
        });
      }
    } catch (e) {
      // something went wrong we can not recover from that
    }
  }
};
