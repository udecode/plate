import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const ImagePlaceholderPluginKey = new PluginKey('ImagePlaceholder');

export const ImagePlaceholderPlugin = () => {
  return new Plugin({
    key: ImagePlaceholderPluginKey,

    state: {
      init() {
        return DecorationSet.empty;
      },

      apply(tr, set) {
        // For reference.
        // let diffStart = tr.doc.content.findDiffStart(oldState.doc.content);
        // let diffEnd = oldState.doc.content.findDiffEnd(tr.doc.content);
        // let map = diffEnd && diffStart
        //   ? new StepMap([diffStart, diffEnd.a - diffStart, diffEnd.b - diffStart])
        //   : new StepMap([0, 0, 0]);
        // let pmMapping = new Mapping([map]);
        // let set = value.map(pmMapping, tr.doc);
        ///

        // Adjust decoration positions to changes made by the transaction
        set = set.map(tr.mapping, tr.doc);

        // See if the transaction adds or removes any placeholders
        let action = tr.getMeta(ImagePlaceholderPluginKey);

        if (action?.type === 'add') {
          let widget = document.createElement('placeholder');
          let deco = Decoration.widget(action.pos, widget, {
            id: action.id,
          });
          set = set.add(tr.doc, [deco]);
        } else if (action?.type === 'remove') {
          set = set.remove(set.find(null, null, (spec) => spec.id == action.id));
        }
        return set;
      },
    },

    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
};

export const findPlaceholder = (state, id) => {
  let decos = ImagePlaceholderPluginKey.getState(state);
  let found = decos?.find(null, null, (spec) => spec.id === id);
  return found?.length ? found[0].from : null;
};
