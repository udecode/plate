import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

import { act, render } from "@testing-library/react";
import * as React from "react";

let clickOutside: () => void;
const floatingUpdate = mock();
const setFloating = mock();
let floatingOptions: { onOpenChange: (open: boolean) => void };
let editorFocused = true;
let selectedNodeCount = 0;
let selectionExpanded = true;
let selectionRange: unknown;
let toolbarOverlayOpenChange: (open: boolean) => void;

const selection = Object.assign(() => selectionRange, {
  isExpanded: () => selectionExpanded,
  nodes: () => Array.from({ length: selectedNodeCount }),
});

const editor = {
  read: {
    lastCommit: () => null,
    selection,
    text: { string: () => (selectionExpanded ? "selected" : "") },
  },
};

mock.module("@platejs/ai/react", () => ({
  AIChatPlugin: { name: "aiChat" },
}));

mock.module("@platejs/basic-nodes/react", () => ({
  BoldPlugin: { name: "bold" },
  CodePlugin: { name: "code" },
  ItalicPlugin: { name: "italic" },
  StrikethroughPlugin: { name: "strikethrough" },
  UnderlinePlugin: { name: "underline" },
}));

mock.module("@platejs/floating", () => ({
  flip: () => ({}),
  getSelectionBoundingClientRect: () => new DOMRect(),
  offset: () => ({}),
  useVirtualFloating: (options: typeof floatingOptions) => {
    floatingOptions = options;

    return {
      refs: { setFloating },
      style: {},
      update: floatingUpdate,
    };
  },
}));

mock.module("@udecode/cn", () => ({
  useComposedRef: () => mock(),
}));

mock.module("@udecode/react-utils", () => ({
  useComposedRef: () => mock(),
  useOnClickOutside: (callback: () => void) => {
    clickOutside = callback;

    return mock();
  },
  useStableFn: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

mock.module("@udecode/utils", () => ({
  isDefined: (value: unknown) => value !== undefined,
  mergeProps: (...values: object[]) => Object.assign({}, ...values),
}));

mock.module("platejs/react", () => ({
  definePlatePlugin: (name: string, definition: object) => ({
    ...definition,
    name,
  }),
  useEditor: () => editor,
  useEditorFocused: () => editorFocused,
  useEditorId: () => "editor-1",
  useEditorReadOnly: () => false,
  useEditorSelector: (
    selector: (editor: any, previous?: unknown) => unknown
  ) => {
    const previousRef = React.useRef<unknown>(undefined);
    const value = selector(editor, previousRef.current);

    previousRef.current = value;

    return value;
  },
  usePluginStore: () => false,
}));

mock.module("@/lib/utils", () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

mock.module("./link", () => ({
  linkPlugin: { name: "link" },
}));

const ButtonStub = ({ children }: React.PropsWithChildren) => (
  <button type="button">{children}</button>
);

mock.module("./ai-toolbar-button", () => ({ AIToolbarButton: ButtonStub }));
mock.module("./comment-toolbar-button", () => ({
  CommentToolbarButton: ButtonStub,
}));
mock.module("./equation-toolbar-button", () => ({
  InlineEquationToolbarButton: ButtonStub,
}));
mock.module("./link-toolbar-button", () => ({
  LinkToolbarButton: ButtonStub,
}));
mock.module("./mark-toolbar-button", () => ({ MarkToolbarButton: ButtonStub }));
mock.module("./more-toolbar-button", () => ({ MoreToolbarButton: ButtonStub }));
mock.module("./suggestion-toolbar-button", () => ({
  SuggestionToolbarButton: ButtonStub,
}));
mock.module("./turn-into-toolbar-button", () => ({
  TurnIntoToolbarButton: ButtonStub,
}));

mock.module("@/registry/components/editor/toolbar", () => ({
  Toolbar: ({
    children,
    onOverlayOpenChange,
    ...props
  }: React.ComponentProps<"div"> & {
    onOverlayOpenChange?: (open: boolean) => void;
  }) => {
    toolbarOverlayOpenChange = onOverlayOpenChange ?? (() => {});

    return <div {...props}>{children}</div>;
  },
  ToolbarButton: ({ children }: React.PropsWithChildren) => (
    <button type="button">{children}</button>
  ),
  ToolbarGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

describe("FloatingToolbar", () => {
  beforeEach(() => {
    editorFocused = true;
    selectedNodeCount = 0;
    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    floatingUpdate.mockClear();
    setFloating.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it("does not mount text toolbar work for node selections", async () => {
    selectedNodeCount = 2;

    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.queryByText("toolbar")).toBeNull();
    expect(floatingUpdate).not.toHaveBeenCalled();
  });

  it("allows the same range to reopen after a collapsed selection lifecycle", async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.getByText("toolbar")).toBeTruthy();

    act(() => floatingOptions.onOpenChange(false));
    expect(view.queryByText("toolbar")).toBeNull();

    selectionExpanded = false;
    selectionRange = null;
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.getByText("toolbar")).toBeTruthy();
  });

  it("opens after local editor focus returns from a collapsed popover selection", async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.getByText("toolbar")).toBeTruthy();

    editorFocused = false;
    selectionExpanded = false;
    selectionRange = {
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.queryByText("toolbar")).toBeNull();

    editorFocused = true;
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.queryByText("toolbar")).toBeNull();

    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 9, path: [0, 0] },
    };
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.getByText("toolbar")).toBeTruthy();
  });

  it("keeps an owned toolbar interaction open across editor blur", async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FloatingToolbar>
        <button type="button">toolbar action</button>
      </FloatingToolbar>
    );

    act(() => toolbarOverlayOpenChange(true));

    editorFocused = false;
    view.rerender(
      <FloatingToolbar>
        <button type="button">toolbar action</button>
      </FloatingToolbar>
    );

    expect(view.getByText("toolbar action")).toBeTruthy();

    act(() => clickOutside());

    expect(view.queryByText("toolbar action")).toBeNull();
  });
});
