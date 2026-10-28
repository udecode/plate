import type { ConstructionSlot } from '../../core/content-completion';
import { canonicalRecordJson } from '../../core/record-store';
import type { Element } from '../../interfaces/element';
import { type ReserveRecord, reserveIdOf } from '../facts/records';
import { type AuthoredMember, readMembers, type ReserveMember } from './marks';

/**
 * A stored spare a build can take: a container's member, whose `type` is the
 * container type it was stored for, or a root's record, whose `type` is null.
 */
export type Spare = Readonly<{
  built?: true;
  node: Element;
  slot: ConstructionSlot;
  type: string | null;
}>;

export const slotKeyOf = (slot: ConstructionSlot) =>
  'prefix' in slot ? `p${slot.prefix}` : `m${slot.min}`;

/** One key per container type and slot, which every spare stored for it shares. */
export const spareKeyOf = ({ slot, type }: Pick<Spare, 'slot' | 'type'>) =>
  `${type ?? ''}\u0000${slotKeyOf(slot)}`;

export const sparesIn = (node: unknown): readonly ReserveMember[] =>
  readMembers(node).filter(
    (member): member is ReserveMember => member.kind === 'reserve'
  );

export const spareFits = (spare: Spare, nodeType: string) =>
  !spare.built && spare.node.type === nodeType;

/**
 * The node a build of a `nodeType` element at `slot` of a `type` container
 * takes from `spares`, as a copy with its slot's key, or null when none is
 * left. It takes a spare that fits, as `spareFits` reads it, of
 * a slot `used` does not name: at a prefix index the one for that index,
 * below a minimum the one of the lowest ordinal that still has one,
 * whichever ordinal the build asks for, and between two peers' spares for
 * one slot the one whose node comes first in canonical JSON. It adds the
 * taken slot's key to `used`.
 */
export const takeSpare = (
  spares: readonly Spare[],
  type: string | null,
  nodeType: string,
  slot: ConstructionSlot,
  used: Set<string>
): Readonly<{ key: string; node: Element }> | null => {
  let taken: Readonly<{ json: string; key: string; spare: Spare }> | null =
    null;

  for (const spare of spares) {
    if (
      spare.type !== type ||
      ('prefix' in slot
        ? !('prefix' in spare.slot) || spare.slot.prefix !== slot.prefix
        : !('min' in spare.slot))
    ) {
      continue;
    }

    const key = spareKeyOf(spare);

    if (used.has(key) || !spareFits(spare, nodeType)) continue;

    const json = canonicalRecordJson(spare.node);
    const ordinal = 'min' in spare.slot ? spare.slot.min : 0;
    const best = taken && 'min' in taken.spare.slot ? taken.spare.slot.min : 0;

    if (!taken || ordinal < best || (ordinal === best && json < taken.json)) {
      taken = { json, key, spare };
    }
  }

  if (!taken) return null;
  used.add(taken.key);

  return { key: taken.key, node: structuredClone(taken.spare.node) };
};

export const putRootSpares = (
  records: readonly ReserveRecord[],
  keeps: boolean,
  built: ReadonlySet<string>,
  writes: Map<string, string | null>
) => {
  for (const record of records) {
    if (!keeps) writes.set(reserveIdOf(record), null);
    else if (
      !record.built &&
      built.has(spareKeyOf({ slot: record.slot, type: null }))
    ) {
      const done = { ...record, built: true as const };

      writes.set(reserveIdOf(record), null);
      writes.set(reserveIdOf(done), canonicalRecordJson(done));
    }
  }
};

export const withBuiltSpares = (
  members: readonly AuthoredMember[],
  keys: ReadonlySet<string> | undefined
): readonly AuthoredMember[] =>
  keys && keys.size > 0
    ? members.map((member) =>
        member.kind === 'reserve' &&
        !member.built &&
        keys.has(spareKeyOf(member))
          ? { ...member, built: true as const }
          : member
      )
    : members;
