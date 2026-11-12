import type { ChangeClaim } from './grant';
import type { ChangeOwner } from './storage';

export const ownersToBind = (
  claims: readonly ChangeClaim[],
  bound: readonly ChangeOwner[],
  actor: string
): readonly ChangeOwner[] | null => {
  const owners = new Map(bound.map(({ author, change }) => [change, author]));
  const binds: ChangeOwner[] = [];

  for (const { author, change } of claims) {
    const owner = owners.get(change);

    if (owner === undefined) {
      if (author !== actor) return null;
      owners.set(change, author);
      binds.push({ author, change });
    } else if (owner !== author) {
      return null;
    }
  }

  return binds;
};

export const seedOwnersOf = (
  claims: readonly ChangeClaim[],
  decided: readonly string[]
): readonly ChangeOwner[] => {
  const owners = new Map<string, string | null>();

  for (const { author, change } of claims) {
    const owner = owners.get(change);

    if (owner !== undefined && owner !== author) {
      throw new Error(
        `Change ${change} is claimed by both ${owner} and ${author}.`
      );
    }
    owners.set(change, author);
  }
  for (const change of decided) {
    if (!owners.has(change)) owners.set(change, null);
  }

  return [...owners].map(([change, author]) => ({ author, change }));
};
