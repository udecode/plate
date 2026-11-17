import { type Selection, SelectionApi } from '../..';
import type { DOMPhaseScheduler } from '../../dom/internal';

type Press = {
  readonly before: Selection;
  readonly holds: Set<object>;
  place: (() => void) | null;
  released: boolean;
};

const noop = () => {};

export class PressFence {
  private press: Press | null = null;

  private readonly schedule: DOMPhaseScheduler['schedule'];

  private readonly selection: () => Selection;

  private readonly publish: () => void;

  get isOpen() {
    return this.press !== null;
  }

  constructor(
    schedule: DOMPhaseScheduler['schedule'],
    selection: () => Selection,
    publish: () => void
  ) {
    this.schedule = schedule;
    this.selection = selection;
    this.publish = publish;
  }

  open() {
    this.press = {
      before: this.selection(),
      holds: new Set(),
      place: null,
      released: false,
    };
  }

  cancel() {
    this.press = null;
  }

  hold() {
    const { press } = this;

    if (!press) return noop;
    const hold = {};

    press.holds.add(hold);

    return () => {
      if (press.holds.delete(hold)) this.settle(press);
    };
  }

  /** The release turn ends after every listener of the mouseup and its click. */
  release() {
    const { press } = this;

    if (!press || press.released) return;
    press.released = true;
    this.schedule('model', 'press-fence-release-turn', this.hold(), {
      timing: 'timeout',
    });
  }

  awaitCollapse(place: () => void) {
    if (this.press) this.press.place = place;
  }

  private settle(press: Press) {
    if (this.press !== press || !press.released || press.holds.size > 0) {
      return;
    }
    const unchanged = () => SelectionApi.equals(this.selection(), press.before);

    if (press.place && unchanged()) {
      const { place } = press;

      press.place = null;
      place();
      if (unchanged()) {
        this.cancel();
        return;
      }
    }
    this.schedule(
      'post-selection',
      'press-fence-publish',
      () => {
        if (this.press !== press) return;
        this.cancel();
        this.publish();
      },
      { key: 'press-fence-publish', timing: 'microtask' }
    );
  }
}
