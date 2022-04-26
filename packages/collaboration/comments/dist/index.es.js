import { getPluginType, getAbove, getNodes, createPluginFactory, wrapNodes, isCollapsed, unwrapNodes } from '@udecode/plate-core';
import { Transforms, Editor } from 'slate';

function findSelectedThreadNodeEntry(editor) {
  const type = getPluginType(editor, ELEMENT_THREAD);
  return getAbove(editor, {
    match: {
      type
    }
  });
}

function* findThreadNodeEntries(editor) {
  const type = getPluginType(editor, ELEMENT_THREAD);
  yield* getNodes(editor, {
    at: [],
    match: {
      type
    }
  });
}

const ELEMENT_THREAD = 'thread';
const createThreadPlugin = createPluginFactory({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  handlers: {
    onChange(editor) {
      return () => {
        const threadNodeEntries = findThreadNodeEntries(editor);

        for (const threadNodeEntry of threadNodeEntries) {
          Transforms.setNodes(editor, {
            selected: false
          }, {
            at: threadNodeEntry[1]
          });
        }

        const threadNodeEntry = findSelectedThreadNodeEntry(editor);

        if (threadNodeEntry) {
          const {
            thread
          } = threadNodeEntry[0];

          if (thread) {
            Transforms.setNodes(editor, {
              selected: true
            }, {
              at: threadNodeEntry[1]
            });
          }
        }
      };
    }

  }
});

const wrapThread = (editor, {
  at,
  thread
}) => {
  wrapNodes(editor, {
    type: getPluginType(editor, ELEMENT_THREAD),
    thread,
    selected: false,
    children: []
  }, {
    at,
    split: true
  });
};

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */

const upsertThreadAtSelection = (editor, thread) => {
  if (editor.selection) {
    const type = getPluginType(editor, ELEMENT_THREAD);

    if (isCollapsed(editor.selection)) {
      const threadLeaf = Editor.leaf(editor, editor.selection);
      const [, inlinePath] = threadLeaf;
      Transforms.select(editor, inlinePath);
    }

    const selectionLength = editor.selection.focus.offset - editor.selection.anchor.offset;
    unwrapNodes(editor, {
      at: editor.selection,
      match: {
        type
      }
    });
    wrapThread(editor, {
      at: editor.selection,
      thread
    });
    Transforms.select(editor, {
      anchor: editor.selection.anchor,
      focus: {
        offset: selectionLength,
        path: editor.selection.anchor.path
      }
    });
    return findSelectedThreadNodeEntry(editor);
  }
};

function upsertThread(editor, thread) {
  return upsertThreadAtSelection(editor, thread);
}

function deleteThread(editor, thread) {
  unwrapNodes(editor, {
    at: thread,
    match: {
      type: getPluginType(editor, ELEMENT_THREAD)
    }
  });
}

function deleteThreadAtSelection(editor) {
  unwrapNodes(editor, {
    at: editor.selection,
    match: {
      type: getPluginType(editor, ELEMENT_THREAD)
    }
  });
}

function isFirstComment(thread, comment) {
  return thread.comments.indexOf(comment) === 0;
}

function generateThreadLink(thread) {
  const url = new URL(window.location.href);
  url.searchParams.set('thread', thread.id);
  return url.toString();
}

function doesContactMatchString(matchString, contact) {
  return contact.name.startsWith(matchString) || contact.email.startsWith(matchString);
}

export { ELEMENT_THREAD, createThreadPlugin, deleteThread, deleteThreadAtSelection, doesContactMatchString, findSelectedThreadNodeEntry, findThreadNodeEntries, generateThreadLink, isFirstComment, upsertThread, upsertThreadAtSelection, wrapThread };
//# sourceMappingURL=index.es.js.map
