'use client';

import {SearchHighlightLeaf} from "@/registry/default/plate-ui/search-highlight-leaf";
import {Plate, PlateContent, createPlatePlugin, usePlateEditor} from "@udecode/plate-core/react";
import {useEffect, useLayoutEffect, useMemo, useState} from "react";
import {createEditor} from "slate";
import {withHistory} from "slate-history";
import {Editable, Slate, withReact} from "slate-react";

const blocks = 5;
const charsPerBlock = 200;
const plateUseSearchHighlightLeaf = true;

const makeParagraph = () => ({
  type: 'p',
  children: [{
    text: 'a'.repeat(charsPerBlock),
  }],
});

const value = Array.from(Array(blocks).keys()).map(makeParagraph);

const decorate = ([node, path]) => {
  if ('text' in node) {
    return Array.from(Array(node.text.length).keys()).map(offset => ({
      anchor: { path, offset },
      focus: { path, offset: offset + 1 },
      highlight: true,
    }));
  }
  return [];
};

let onRender = () => {};

const awaitRender = () => new Promise<void>((resolve) => {
  onRender = resolve;
});

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

function getStandardDeviation (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

const useMeasure = () => {
  const [shouldDecorate, setShouldDecorate] = useState(false);

  const measure = async () => {
    const times = [];
    for (let i = 0; i < 10; i++) {
      const before = performance.now();
      setShouldDecorate(true);
      await awaitRender();
      const after = performance.now();
      setShouldDecorate(false);
      await awaitRender();
      await wait(200);
      times.push(after - before);
    }
    console.log(times.reduce((a, b) => a + b) / times.length, getStandardDeviation(times));
  };

  useEffect(onRender);

  return [shouldDecorate, measure];
};

const Leaf = ({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      {...(leaf.highlight && { 'data-cy': 'search-highlighted' })}
      style={{
        fontWeight: leaf.bold && 'bold',
        backgroundColor: leaf.highlight && '#ffeeba',
      }}
    >
      {children}
    </span>
  )
};

const SlateDemo = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [shouldDecorate, measure] = useMeasure();

  return (
    <div>
      <button type="button" onClick={measure}>Measure</button>
      <Slate editor={editor} initialValue={value}>
        <Editable
          decorate={shouldDecorate ? decorate : undefined}
          renderLeaf={props => <Leaf {...props} />}
        />
      </Slate>
    </div>
  );
};

const DecoratePlugin = createPlatePlugin({
  key: 'highlight',
  node: plateUseSearchHighlightLeaf
    ? { isLeaf: true, component: SearchHighlightLeaf }
    : undefined,
  decorate: ({ entry, getOptions }) => {
    const { shouldDecorate } = getOptions();
    return shouldDecorate ?  decorate(entry) : [];
  },
  options: {
    shouldDecorate: false,
  },
});

const PlateDemo = () => {
  const editor = usePlateEditor({
    plugins: [DecoratePlugin],
    value,
  });

  const [shouldDecorate, measure] = useMeasure();

  useLayoutEffect(() => {
    editor.setOption(DecoratePlugin, 'shouldDecorate', shouldDecorate);
    editor.api.redecorate();
  }, [shouldDecorate]);

  return (
    <div>
      <button type="button" onClick={measure}>Measure</button>
      <Plate editor={editor}>
        <PlateContent
          renderLeaf={plateUseSearchHighlightLeaf ? undefined : (props => <Leaf {...props} />)}
        />
      </Plate>
    </div>
  );
};

const Page = () => {
  return (
    <div className="grid grid-cols-2 gap-5 p-5">
      <SlateDemo />
      <PlateDemo />
    </div>
  );
};

export default Page;
