'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCore = require('@udecode/plate-core');
var slate = require('slate');

function createNullUser() {
  return {
    id: '',
    name: ''
  };
}

const ELEMENT_THREAD = 'thread';
const createThreadPlugin = plateCore.createPluginFactory({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  handlers: {
    onChange(editor) {
      return () => {// const threadNodeEntries = findThreadNodeEntries(editor);
        // for (const threadNodeEntry of threadNodeEntries) {
        //   deselectThread(editor, threadNodeEntry);
        // }
        //
        // const threadNodeEntry = findSelectedThreadNodeEntry(editor);
        // if (threadNodeEntry) {
        //   const { thread } = threadNodeEntry[0];
        //   if (thread) {
        //     selectThread(editor, threadNodeEntry);
        //   }
        // }
      };
    }

  }
});

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

function findSelectedThreadNodeEntry(editor) {
  return plateCore.getAbove(editor, {
    match: {
      type: plateCore.getPluginType(editor, ELEMENT_THREAD)
    }
  });
}

function isThread(editor, node) {
  return node.type === plateCore.getPluginType(editor, ELEMENT_THREAD);
}

const wrapWithThread = (editor, {
  at,
  thread,
  elementProps
}) => {
  plateCore.wrapNodes(editor, {
    type: plateCore.getPluginType(editor, ELEMENT_THREAD),
    thread,
    selected: false,
    children: [],
    ...elementProps
  }, {
    at,
    split: true
  });
};

function upsertThread(editor, {
  at,
  thread,
  elementProps
}) {
  const type = plateCore.getPluginType(editor, ELEMENT_THREAD);
  const isRange = slate.Range.isRange(at);

  if (isRange && plateCore.isCollapsed(at)) {
    const threadLeaf = slate.Editor.leaf(editor, at);
    const [, inlinePath] = threadLeaf;
    slate.Transforms.select(editor, inlinePath);
  }

  wrapWithThread(editor, {
    at,
    thread,
    elementProps
  });
  plateCore.unwrapNodes(editor, {
    at,
    match: {
      type
    }
  });

  if (isRange) {
    const threadNodeEntry = plateCore.findNode(editor, {
      at: [],

      match(node) {
        return isThread(editor, node) && node.thread.id === thread.id;
      }

    });
    const [, threadPath] = threadNodeEntry;
    slate.Transforms.select(editor, threadPath);
  }

  return findSelectedThreadNodeEntry(editor);
}

function deselectThread(editor, threadEntry) {
  const [threadNode, threadPath] = threadEntry;

  if (threadNode.selected) {
    upsertThread(editor, {
      thread: threadNode.thread,
      at: threadPath,
      elementProps: {
        selected: false
      }
    });
  }
}

function selectThread(editor, threadEntry) {
  const [threadNode, threadPath] = threadEntry;

  if (!threadNode.selected) {
    upsertThread(editor, {
      thread: threadNode.thread,
      at: threadPath,
      elementProps: {
        selected: true
      }
    });
  }
}

const upsertThreadAtSelection = (editor, thread) => {
  const {
    selection
  } = editor;

  if (selection) {
    return upsertThread(editor, {
      thread,
      at: selection
    });
  }
};

function* findThreadNodeEntries(editor) {
  const type = plateCore.getPluginType(editor, ELEMENT_THREAD);
  yield* plateCore.getNodes(editor, {
    at: [],
    match: {
      type
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
exports.createNullUser = createNullUser;
exports.createThreadPlugin = createThreadPlugin;
exports.deleteThread = deleteThread;
exports.deleteThreadAtSelection = deleteThreadAtSelection;
exports.deselectThread = deselectThread;
exports.doesContactMatchString = doesContactMatchString;
exports.findSelectedThreadNodeEntry = findSelectedThreadNodeEntry;
exports.findThreadNodeEntries = findThreadNodeEntries;
exports.generateThreadLink = generateThreadLink;
exports.isFirstComment = isFirstComment;
exports.selectThread = selectThread;
exports.upsertThread = upsertThread;
exports.upsertThreadAtSelection = upsertThreadAtSelection;
exports.wrapWithThread = wrapWithThread;
//# sourceMappingURL=index.js.map
