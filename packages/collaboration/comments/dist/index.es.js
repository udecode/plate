import { createPluginFactory, unwrapNodes, getPluginType, getAbove, wrapNodes, isCollapsed, findNode, getNodes } from '@udecode/plate-core';
import { Range, Editor, Transforms } from 'slate';

const ELEMENT_THREAD = 'thread';
const createThreadPlugin = createPluginFactory({
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

function findSelectedThreadNodeEntry(editor) {
  return getAbove(editor, {
    match: {
      type: getPluginType(editor, ELEMENT_THREAD)
    }
  });
}

function isThread(editor, node) {
  return node.type === getPluginType(editor, ELEMENT_THREAD);
}

const wrapWithThread = (editor, {
  at,
  thread,
  elementProps
}) => {
  wrapNodes(editor, {
    type: getPluginType(editor, ELEMENT_THREAD),
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
  const type = getPluginType(editor, ELEMENT_THREAD);
  const isRange = Range.isRange(at);

  if (isRange && isCollapsed(at)) {
    const threadLeaf = Editor.leaf(editor, at);
    const [, inlinePath] = threadLeaf;
    Transforms.select(editor, inlinePath);
  }

  wrapWithThread(editor, {
    at,
    thread,
    elementProps
  });
  unwrapNodes(editor, {
    at,
    match: {
      type
    }
  });

  if (isRange) {
    const threadNodeEntry = findNode(editor, {
      at: [],

      match(node) {
        return isThread(editor, node) && node.thread.id === thread.id;
      }

    });
    const [, threadPath] = threadNodeEntry;
    Transforms.select(editor, threadPath);
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
  const type = getPluginType(editor, ELEMENT_THREAD);
  yield* getNodes(editor, {
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

export { ELEMENT_THREAD, createThreadPlugin, deleteThread, deleteThreadAtSelection, deselectThread, doesContactMatchString, findSelectedThreadNodeEntry, findThreadNodeEntries, generateThreadLink, isFirstComment, selectThread, upsertThread, upsertThreadAtSelection, wrapWithThread };
//# sourceMappingURL=index.es.js.map
