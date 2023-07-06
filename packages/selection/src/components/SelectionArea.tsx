import React, { createRef, useEffect } from 'react';
import VanillaSelectionArea, {
  SelectionEvents,
  SelectionOptions,
} from '@viselect/vanilla';

export interface SelectionAreaProps
  extends Omit<Partial<SelectionOptions>, 'boundaries'>,
    React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onBeforeStart?: SelectionEvents['beforestart'];
  onStart?: SelectionEvents['start'];
  onMove?: SelectionEvents['move'];
  onStop?: SelectionEvents['stop'];

  /**
   * The boundaries of the selection area.
   * @boundaries ref of the selection area element.
   */
  getBoundaries?: (
    boundaries: SelectionOptions['boundaries']
  ) => SelectionOptions['boundaries'];
}

export function SelectionArea({
  onBeforeStart,
  onStart,
  onMove,
  onStop,
  children,
  selectionAreaClass,
  selectionContainerClass,
  container,
  document,
  selectables,
  startAreas,
  behaviour,
  features,
  getBoundaries = (boundaries) => boundaries,
  ...props
}: SelectionAreaProps) {
  const ref = createRef<HTMLDivElement>();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const opt = {
      selectionAreaClass,
      selectionContainerClass,
      container,
      document,
      selectables,
      startAreas,
      behaviour,
      features,
    };

    const areaBoundaries = ref.current as HTMLElement;

    const selection = new VanillaSelectionArea({
      boundaries: getBoundaries(areaBoundaries),
      ...opt,
    });

    onBeforeStart && selection.on('beforestart', onBeforeStart);
    onStart && selection.on('start', onStart);
    onMove && selection.on('move', onMove);
    onStop && selection.on('stop', onStop);

    return () => selection.destroy();
  }, []);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}

export { type ChangedElements, type SelectionEvent } from '@viselect/vanilla';
