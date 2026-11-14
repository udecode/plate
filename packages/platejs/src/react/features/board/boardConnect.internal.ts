import {
  BaseBoardArrowPlugin,
  type BoardPlace,
} from '../../../features/board/lib';
import type { BoardBox, BoardShapeLayout } from './boardIndex.internal';
import { previewArrowLine } from './boardPreview.internal';
import type { BoardViewCore } from './boardView.internal';
import { activeElementOf } from './boardVoice.internal';

type Connect = { aim?: string; line: SVGLineElement; start: string };

const centerOf = (box: BoardBox): BoardPlace => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

export const attachBoardConnect = (host: HTMLElement, core: BoardViewCore) => {
  const { index } = core;
  let connect: Connect | null = null;

  const bindable = (id: string | undefined) => {
    const layout = id === undefined ? undefined : index.byId(id);

    return layout?.kind === 'arrow' ? undefined : layout;
  };

  const draw = ({ aim, line, start }: Connect) => {
    const from = bindable(start);
    const to = bindable(aim) ?? from;

    if (!from || !to) return;

    const [a, b] = [centerOf(from.box), centerOf(to.box)];

    line.setAttribute('x1', String(a.x));
    line.setAttribute('y1', String(a.y));
    line.setAttribute('x2', String(b.x));
    line.setAttribute('y2', String(b.y));
  };

  const follow = () => {
    if (!connect) return;
    if (!core.writable() || !bindable(connect.start)) {
      core.cancelInteraction();

      return;
    }
    if (!bindable(connect.aim)) connect.aim = undefined;
    draw(connect);
  };

  const sayAim = ({ aim, start }: Connect) => {
    const target = bindable(aim);
    const from = bindable(start);

    if (target) core.voice.aim(target.key);
    else if (from) core.voice.connecting(from.key);
  };

  const aimAt = (target: BoardShapeLayout) => {
    if (!connect) return;
    connect.aim = target.id;
    draw(connect);
    if (!core.inView(target)) {
      core.reveal([index.entries().findIndex(({ key }) => key === target.key)]);
    }
    core.voice.aim(target.key);
  };

  // A window that loses focus fires focusout with no relatedTarget and keeps
  // its active element, so the connect goes on when the window comes back.
  const onFocusOut = ({ relatedTarget }: FocusEvent) => {
    const next =
      relatedTarget instanceof Node ? relatedTarget : activeElementOf(host);

    if (connect && !host.contains(next)) core.cancelInteraction();
  };

  host.addEventListener('focusout', onFocusOut);

  return {
    active: () => !!connect,
    aimAt,
    candidates: () =>
      index
        .entries()
        .flatMap((entry) =>
          entry.id === connect?.start || entry.kind === 'arrow'
            ? []
            : (index.layout(entry.key) ?? [])
        ),
    detach: () => {
      host.removeEventListener('focusout', onFocusOut);
    },
    finish: () => {
      if (!connect) return;

      const { start } = connect;
      const target = bindable(connect.aim);

      if (!target) {
        sayAim(connect);

        return;
      }
      core.cancelInteraction();
      core.insertAndSelect((tx) =>
        tx
          .plugin(BaseBoardArrowPlugin)
          .insert({ end: target.id, start }, { board: core.board })
      );
    },
    aimFrom: () => bindable(connect?.aim) ?? bindable(connect?.start),
    sayAim: () => {
      if (connect) sayAim(connect);
    },
    start: (from: BoardShapeLayout) => {
      const next: Connect = {
        line: previewArrowLine(
          core.zoomLayer(),
          centerOf(from.box),
          index.entries().length + 1
        ),
        start: from.id,
      };

      core.replaceInteraction({
        cancel: () => {
          next.line.ownerSVGElement?.remove();
          if (connect === next) connect = null;
          core.voice.repeatSelection();
        },
        follow,
        kind: 'connect',
        start: from.id,
      });
      connect = next;
      core.voice.connecting(from.key);
    },
  };
};
