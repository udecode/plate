import { Editor, Transforms } from 'slate';
import { insertMention } from './transforms';

interface Options {
  chars: any[];
  index: number;
  target: any;
  setIndex: any;
  setTarget: any;
}

export const onKeyDownMention = (
  e: any,
  editor: Editor,
  { chars, index, target, setIndex, setTarget }: Options
) => {
  if (target) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
        setIndex(prevIndex);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
        setIndex(nextIndex);
        break;
      }
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        Transforms.select(editor, target);
        insertMention(editor, chars[index]);
        setTarget(null);
        break;
      case 'Escape':
        e.preventDefault();
        setTarget(null);
        break;
      default:
        break;
    }
  }
};
