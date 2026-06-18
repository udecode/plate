import type { PointerEvent } from 'react';
import { defineEditorExtension } from '@platejs/slate';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  Slate,
  useEditor,
  useElementPath,
  useSlateEditor,
} from '@platejs/slate-react';

import { Button, Icon, Toolbar } from './components';
import type {
  BlockQuoteElement,
  CustomEditor,
  CustomElement,
  CustomText,
  CustomValue,
  ParagraphElement as ParagraphElementType,
  SyncedBlockElement,
} from './custom-types.d';

let syncedBlockCopyId = 0;
let syncedBlockRootId = 0;

const paragraph = (text: string): ParagraphElementType => ({
  type: 'paragraph',
  children: [{ text }],
});

const nextSyncedBlockCopyId = () => {
  syncedBlockCopyId += 1;

  return `synced-copy:${syncedBlockCopyId}`;
};

const nextSyncedBlockRoot = () => {
  syncedBlockRootId += 1;

  return `synced-block:${syncedBlockRootId}:body`;
};

const createSyncedBlock = (
  bodyRoot: string,
  copyId = nextSyncedBlockCopyId()
): SyncedBlockElement => ({
  type: 'synced-block',
  childRoots: { body: bodyRoot },
  copyId,
  children: [{ text: '' }],
});

const createSyncedBlockBody = (
  first = 'Shared mission statement',
  second = 'Editing any copy updates every synced copy.'
): CustomValue => [paragraph(first), paragraph(second)];

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const getNextSiblingPath = (path: readonly number[]) => [
  ...path.slice(0, -1),
  (path.at(-1) ?? 0) + 1,
];

const SyncedBlocksExample = () => {
  const sharedBodyRoot = 'synced-block:shared:body';
  const separateBodyRoot = 'synced-block:separate:body';
  const editor = useSlateEditor({
    extensions: [syncedBlocks()],
    initialValue: {
      children: [
        paragraph('p1'),
        createSyncedBlock(sharedBodyRoot, 'original'),
        paragraph('Between synced copies.'),
        createSyncedBlock(separateBodyRoot, 'separate'),
        paragraph('Between synced documents.'),
        createSyncedBlock(sharedBodyRoot, 'copy'),
        paragraph('p2'),
      ],
      roots: {
        [sharedBodyRoot]: createSyncedBlockBody(),
        [separateBodyRoot]: createSyncedBlockBody(
          'Separate synced document',
          'This block proves a different synced root stays isolated.'
        ),
      },
    },
  });

  return (
    <Slate editor={editor}>
      <Toolbar>
        <InsertSyncedBlockButton />
      </Toolbar>

      <Editable
        aria-label="Synced blocks editor"
        placeholder="Write around synced blocks..."
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};

const syncedBlocks = () =>
  defineEditorExtension({
    name: 'synced-blocks',
    elements: [
      {
        type: 'synced-block',
        contentRoot: { slot: 'body' },
      },
    ],
  });

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'block-quote':
      return (
        <BlockQuote {...(props as RenderElementProps<BlockQuoteElement>)} />
      );
    case 'paragraph':
      return (
        <ParagraphElement
          {...(props as RenderElementProps<ParagraphElementType>)}
        />
      );
    case 'synced-block':
      return (
        <SyncedBlock {...(props as RenderElementProps<SyncedBlockElement>)} />
      );
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const renderLeaf = (props: RenderLeafProps<CustomText>) => <Leaf {...props} />;

const Leaf = ({ attributes, children, leaf }: RenderLeafProps<CustomText>) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockQuote = ({
  attributes,
  children,
}: RenderElementProps<BlockQuoteElement>) => (
  <blockquote {...attributes}>{children}</blockquote>
);

const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElementType>) => (
  <p {...attributes}>{children}</p>
);

const SyncedBlock = ({
  attributes,
  element,
  slots,
}: RenderElementProps<SyncedBlockElement>) => {
  const editor = useEditor<CustomEditor>();
  const path = useElementPath();
  const bodyRoot = element.childRoots.body;
  const isOriginal = element.copyId === 'original';

  const duplicate = () => {
    if (!path) {
      return;
    }

    editor.update((tx) => {
      tx.nodes.insert(createSyncedBlock(bodyRoot), {
        at: getNextSiblingPath(path),
      });
    });
  };

  const unsync = () => {
    if (!path) {
      return;
    }

    const nextRoot = nextSyncedBlockRoot();
    const body = editor.read((state) => state.value.root(bodyRoot));

    editor.update((tx) => {
      tx.roots.create(
        nextRoot,
        cloneValue(body.length > 0 ? [...body] : createSyncedBlockBody())
      );
      tx.nodes.set(
        {
          childRoots: { body: nextRoot },
          copyId: nextSyncedBlockCopyId(),
        } as Partial<SyncedBlockElement>,
        { at: path }
      );
    });
  };

  const keepEditorFocus = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <section
      {...attributes}
      className="slate-synced-blocks-synced-block"
      data-slate-synced-block
      data-slate-synced-root={bodyRoot}
    >
      <div
        className="slate-synced-blocks-synced-block-toolbar"
        contentEditable={false}
      >
        <span>{isOriginal ? 'Editing original' : 'Editing synced copy'}</span>
        <span className="slate-synced-blocks-synced-block-actions">
          <Button
            aria-label="Duplicate synced block"
            className="slate-synced-blocks-synced-block-button"
            onClick={duplicate}
            onPointerDown={keepEditorFocus}
          >
            <Icon>content_copy</Icon>
          </Button>
          <Button
            aria-label="Unsync synced block"
            className="slate-synced-blocks-synced-block-button"
            onClick={unsync}
            onPointerDown={keepEditorFocus}
          >
            <Icon>link_off</Icon>
          </Button>
        </span>
      </div>
      {slots.contentRoot('body', {
        ariaLabel: `Synced block ${element.copyId} content`,
        className: 'slate-synced-blocks-synced-block-body',
        placeholder: 'Empty synced block',
      })}
    </section>
  );
};

const InsertSyncedBlockButton = () => {
  const editor = useEditor<CustomEditor>();

  return (
    <Button
      aria-label="Insert synced block"
      className="slate-synced-blocks-synced-block-button"
      onClick={() => {
        const bodyRoot = nextSyncedBlockRoot();

        editor.update((tx) => {
          tx.roots.create(bodyRoot, createSyncedBlockBody());
          tx.nodes.insert(createSyncedBlock(bodyRoot));
        });
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      }}
    >
      <Icon>sync_alt</Icon>
    </Button>
  );
};

export default SyncedBlocksExample;
