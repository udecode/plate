import castArray from 'lodash/castArray';
import { Editor, Element, Transforms, Path, NodeEntry, Ancestor } from 'slate';
import { ELEMENT_BLOCKQUOTE, AutoformatRule } from '../..';
import { getAbove, getChildren, getLastChildPath, getParent } from '../../common/queries';
import { getBlockquote } from './queries/getBlockquote';
import { insertBlockquoteItem } from './transforms/insertBlockquoteItem';

/**
 * Enables formating block inside blockquote
 */
export const withBlockquote = ({ rules }: {rules: Array<Pick<AutoformatRule, 'type' | 'markup' | 'preFormat' | 'format'>>}) => <
    T extends Editor
>(
    editor: T
) => {
    const { insertText } = editor;

    const isBlockQuoteElement = (element: Element | any): element is Element => {
        return element?.type === ELEMENT_BLOCKQUOTE || false;
    }

    editor.insertText = (text) => {

        const res = getBlockquote(editor, { at: editor.selection}) as NodeEntry<Ancestor>;

        if (!res) return insertText(text);

        for (const {
            type,
            markup,
            preFormat,
            format,
        } of rules) {

            const markups = castArray(markup);

            if (!markups.includes(text)) continue;

            insertBlockquoteItem(editor, res, {type, children: [ { text: '' }]});
     
            format?.(editor);

            return;

        };

        insertText(text);
    }
    return editor;
};
