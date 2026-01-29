/**
 * Creates chainable editor state.
 * https://remirror.io/blog/chainable-commands/
 * @param {*} transaction Transaction.
 * @param {*} state State
 * @returns Chainable editor state.
 */
export function chainableEditorState(transaction, state) {
  let { selection, doc, storedMarks } = transaction;

  return {
    ...state,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    plugins: state.plugins,
    schema: state.schema,
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
    get storedMarks() {
      return storedMarks;
    },
    get selection() {
      return selection;
    },
    get doc() {
      return doc;
    },
    get tr() {
      selection = transaction.selection;
      doc = transaction.doc;
      storedMarks = transaction.storedMarks;
      return transaction;
    },
  };
}
