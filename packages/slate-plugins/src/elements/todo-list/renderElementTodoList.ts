import { getRenderElement, setDefaults } from "@udecode/slate-plugins-common";
import { DEFAULTS_TODO_LIST } from "./defaults";
import { TodoListRenderElementOptions } from "./types";

export const renderElementTodoList = (
  options?: TodoListRenderElementOptions
) => {
  const { todo_li } = setDefaults(options, DEFAULTS_TODO_LIST);

  return getRenderElement(todo_li);
};
