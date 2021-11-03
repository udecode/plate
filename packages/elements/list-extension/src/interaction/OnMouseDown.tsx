import * as React from 'react';
import { getAbove } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_LIC } from '@udecode/plate-list';
import { SetStateAction } from 'jotai';
import { isEqual } from 'lodash';
import { ReactEditor } from 'slate-react';
import { LicSelection } from '../atoms/licSelection';

export const onMouseDown = (
  ev: React.MouseEvent,
  editor: SPEditor & ReactEditor,
  attributes: {
    'data-slate-node'?: 'element';
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
    ref: React.MutableRefObject<HTMLElement>;
  },
  setLicSelection: (update: SetStateAction<LicSelection | undefined>) => void
): void => {
  if (attributes.ref?.current) {
    const licType = editor && getPlatePluginType(editor, ELEMENT_LIC);

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
        setLicSelection((state) => {
          if (state) {
            if (isEqual(state.path, lic[1])) {
              return {
                ...state,
                level: !state.level,
              };
            }
          }

          return {
            path: lic[1],
            level: true,
          };
        });
      }
    } catch (e) {
      // something went wrong we can not recover from that
    }
  }
};
