import type { InkBox } from '../../../features/ink/lib/inkMatch.internal';
import {
  INK_MOVE_TOLERANCE,
  type InkLayerOrigin,
  type InkMeasuredBlock,
  measureInkBlock,
} from './inkMeasure.internal';
import type { InkLayoutChange } from './inkWatch.internal';

const near = (a: number, b: number) => Math.abs(a - b) <= INK_MOVE_TOLERANCE;

export const createInkLayouts = () => {
  let kept = new WeakMap<Element, InkMeasuredBlock>();

  return {
    changed: (change: InkLayoutChange, within?: Element) => {
      if (change === 'boxes') return;
      if (!within) {
        kept = new WeakMap();

        return;
      }
      for (let node: Element | null = within; node; node = node.parentElement) {
        kept.delete(node);
      }
      if (change === 'styles') {
        for (const inner of within.querySelectorAll('*')) kept.delete(inner);
      }
    },
    measure: (
      element: Element,
      text: string,
      box: InkBox,
      origin: InkLayerOrigin
    ): InkMeasuredBlock | undefined => {
      const layout = kept.get(element);

      if (
        layout &&
        near(layout.box.width, box.width) &&
        near(layout.box.height, box.height)
      ) {
        return layout.movedTo(box, origin);
      }

      const measured = measureInkBlock(element, text, origin);

      if (measured) kept.set(element, measured);

      return measured;
    },
  };
};
