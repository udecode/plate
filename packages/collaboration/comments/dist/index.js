'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCore = require('@udecode/plate-core');
var slate = require('slate');

function findSelectedThreadNodeEntry(editor) {
  const type = plateCore.getPluginType(editor, ELEMENT_THREAD);
  return plateCore.getAbove(editor, {
    match: {
      type
    }
  });
}

function* findThreadNodeEntries(editor) {
  const type = plateCore.getPluginType(editor, ELEMENT_THREAD);
  yield* plateCore.getNodes(editor, {
    at: [],
    match: {
      type
    }
  });
}

const ELEMENT_THREAD = 'thread';
const createThreadPlugin = plateCore.createPluginFactory({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  handlers: {
    onChange(editor) {
      return () => {
        const threadNodeEntries = findThreadNodeEntries(editor);

        for (const threadNodeEntry of threadNodeEntries) {
          threadNodeEntry[0].selected = false;
        }

        const threadNodeEntry = findSelectedThreadNodeEntry(editor);

        if (threadNodeEntry) {
          const {
            thread
          } = threadNodeEntry[0];

          if (thread) {
            threadNodeEntry[0].selected = true;
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
  plateCore.wrapNodes(editor, {
    type: plateCore.getPluginType(editor, ELEMENT_THREAD),
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
    const type = plateCore.getPluginType(editor, ELEMENT_THREAD);

    if (plateCore.isCollapsed(editor.selection)) {
      const threadLeaf = slate.Editor.leaf(editor, editor.selection);
      const [, inlinePath] = threadLeaf;
      slate.Transforms.select(editor, inlinePath);
    }

    const selectionLength = editor.selection.focus.offset - editor.selection.anchor.offset;
    plateCore.unwrapNodes(editor, {
      at: editor.selection,
      match: {
        type
      }
    });
    wrapThread(editor, {
      at: editor.selection,
      thread
    });
    slate.Transforms.select(editor, {
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
  plateCore.unwrapNodes(editor, {
    at: thread,
    match: {
      type: plateCore.getPluginType(editor, ELEMENT_THREAD)
    }
  });
}

function deleteThreadAtSelection(editor) {
  plateCore.unwrapNodes(editor, {
    at: editor.selection,
    match: {
      type: plateCore.getPluginType(editor, ELEMENT_THREAD)
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

exports.ELEMENT_THREAD = ELEMENT_THREAD;
exports.createThreadPlugin = createThreadPlugin;
exports.deleteThread = deleteThread;
exports.deleteThreadAtSelection = deleteThreadAtSelection;
exports.doesContactMatchString = doesContactMatchString;
exports.findSelectedThreadNodeEntry = findSelectedThreadNodeEntry;
exports.findThreadNodeEntries = findThreadNodeEntries;
exports.generateThreadLink = generateThreadLink;
exports.isFirstComment = isFirstComment;
exports.upsertThread = upsertThread;
exports.upsertThreadAtSelection = upsertThreadAtSelection;
exports.wrapThread = wrapThread;
//# sourceMappingURL=index.js.map
