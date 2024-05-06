import React from 'react';

import VanillaSelectionArea, {
  type SelectionEvents,
  type SelectionOptions,
} from '@viselect/vanilla';

export interface SelectionAreaProps
  extends Omit<Partial<SelectionOptions>, 'boundaries'>,
    React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * The boundaries of the selection area.
   *
   * @boundaries ref of the selection area element.
   */
  getBoundaries?: (
    boundaries: SelectionOptions['boundaries']
  ) => SelectionOptions['boundaries'];
  onBeforeStart?: SelectionEvents['beforestart'];
  onMove?: SelectionEvents['move'];
  onStart?: SelectionEvents['start'];

  onStop?: SelectionEvents['stop'];
}

export function SelectionArea({
  behaviour,
  children,
  container,
  document,
  features,
  getBoundaries = (boundaries) => boundaries,
  onBeforeStart,
  onMove,
  onStart,
  onStop,
  selectables,
  selectionAreaClass,
  selectionContainerClass,
  startAreas,
  ...props
}: SelectionAreaProps) {
  const ref = React.createRef<HTMLDivElement>();

  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    const opt = {
      behaviour,
      container,
      document,
      features,
      selectables,
      selectionAreaClass,
      selectionContainerClass,
      startAreas,
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
