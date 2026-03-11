import { EventEditorStore } from './EventEditorStore';
import { getEventPlateId } from './getEventPlateId';

describe('getEventPlateId', () => {
  afterEach(() => {
    EventEditorStore.set('blur', null);
    EventEditorStore.set('focus', null);
    EventEditorStore.set('last', null);
  });

  it('prefers the explicit id first', () => {
    EventEditorStore.set('focus', 'focus-id');

    expect(getEventPlateId('explicit')).toBe('explicit');
  });

  it('falls back through focus, blur, last, and plate', () => {
    expect(getEventPlateId()).toBe('plate');

    EventEditorStore.set('last', 'last-id');
    expect(getEventPlateId()).toBe('last-id');

    EventEditorStore.set('blur', 'blur-id');
    expect(getEventPlateId()).toBe('blur-id');

    EventEditorStore.set('focus', 'focus-id');
    expect(getEventPlateId()).toBe('focus-id');
  });
});
