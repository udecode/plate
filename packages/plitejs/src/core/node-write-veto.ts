import type { AnyEditor, RootKey } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Path } from '../interfaces/path';
import { definePluginPoint } from './plugin-point';
import { getPluginContributions } from './plugin-registry';
import { EditorRefusalError } from './refusal';

/**
 * A local write that changes what `node` is or what holds it, before it
 * applies: `retype` sets its `type` to `type`, `wrap` puts it in a new
 * element, and `unwrap` removes it and keeps its children: an unwrap moves
 * them into its parent and a merge into its previous sibling. A merge also
 * asks it for each ancestor it empties and removes. A lift asks it too unless
 * it takes the last of several children, since lifting any other child
 * removes the holder or splits it in two.
 */
export type NodeWriteVetoInput = Readonly<
  {
    node: Element;
    path: Path;
    root: RootKey;
  } & ({ kind: 'retype'; type: string } | { kind: 'unwrap' | 'wrap' })
>;

/**
 * Return true to refuse the whole update that makes the write. Remote imports
 * and history replays never consult it.
 */
export type NodeWriteVeto = (input: NodeWriteVetoInput) => boolean;

/** Contribute a veto that refuses a retype, wrap or unwrap of a node. */
export const nodeWriteVeto =
  definePluginPoint<NodeWriteVeto>('node.write.veto');

export const refuseVetoedWrite = (
  editor: AnyEditor,
  input: NodeWriteVetoInput
) => {
  for (const veto of getPluginContributions(editor, nodeWriteVeto)) {
    if (!veto(input)) continue;

    throw new EditorRefusalError(
      {
        kind: input.kind,
        path: input.path,
        reason: 'node-write-veto',
        root: input.root,
      },
      `A plugin refused to ${input.kind} the "${input.node.type}" element at [${input.path.join(',')}] of root "${input.root}".`
    );
  }
};
