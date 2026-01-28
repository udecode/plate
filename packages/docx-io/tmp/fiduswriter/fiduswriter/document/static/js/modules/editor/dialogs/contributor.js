import {NodeSelection} from "prosemirror-state"
import {Dialog, addAlert} from "../../common"
import {contributorTemplate} from "./templates"
/*
    Source for email regexp:
    https://html.spec.whatwg.org/multipage/input.html#e-mail-state-(type%3Demail)
*/
const emailRegExp =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export class ContributorDialog {
    /**
     * @param {Object} node - The contributors_part node
     * @param {Object} view - The ProseMirror editor view
     * @param {Object|false} contributor - The contributor data if editing, false if adding
     */
    constructor(node, view, contributor = false) {
        this.node = node
        this.view = view
        this.contributor = contributor
        this.dialog = false
    }

    init() {
        const buttons = []
        // Add Update/Add button
        buttons.push({
            text: this.contributor ? gettext("Update") : gettext("Add"),
            classes: "fw-dark",
            click: () => {
                // Get form values
                let firstname = this.dialog.dialogEl.querySelector(
                        "input[name=firstname]"
                    ).value,
                    lastname = this.dialog.dialogEl.querySelector(
                        "input[name=lastname]"
                    ).value,
                    email =
                        this.dialog.dialogEl.querySelector(
                            "input[name=email]"
                        ).value,
                    institution = this.dialog.dialogEl.querySelector(
                        "input[name=institution]"
                    ).value

                firstname = firstname.length ? firstname : false
                lastname = lastname.length ? lastname : false
                institution = institution.length ? institution : false
                email = email.length ? email : false

                // Validate email format
                if (email && !emailRegExp.test(email)) {
                    addAlert("error", gettext("Email is in incorrect format!"))
                    return
                }

                this.dialog.close()

                // Don't create contributor if all fields are empty
                if (!firstname && !lastname && !institution && !email) {
                    // No data, don't insert.
                    return
                }

                const view = this.view,
                    newNode = view.state.schema.nodes.contributor.create({
                        firstname,
                        lastname,
                        email,
                        institution
                    })
                let tr

                // Check if we're editing an existing contributor based on current selection
                // This works for collaborative editing because we use current selection, not saved positions
                if (
                    this.contributor &&
                    view.state.selection.jsonID === "node" &&
                    view.state.selection.node.type.name === "contributor"
                ) {
                    // Editing: replace the selected contributor
                    tr = view.state.tr.replaceSelectionWith(newNode, false)
                    // Set selection to the updated contributor
                    tr.setSelection(
                        NodeSelection.create(tr.doc, view.state.selection.from)
                    )
                } else {
                    // Adding: find the insertion point based on current document state
                    // Adding: find the insertion point based on current document state
                    let posFrom, posTo
                    view.state.doc.descendants((node, pos) => {
                        // Find the contributors_part node to determine insertion position
                        if (node.attrs.id === this.node.attrs.id) {
                            posFrom = posTo = pos + node.nodeSize - 1
                            // - 1 to go to end of node contributors container node
                        }
                        if ("id" in node.attrs) {
                            return false
                        }
                    })
                    tr = view.state.tr.replaceRangeWith(posFrom, posTo, newNode)
                    // Set selection to the newly created contributor
                    tr.setSelection(NodeSelection.create(tr.doc, posFrom))
                }
                // Dispatch the transaction (both replacement and selection)
                view.dispatch(tr)
                return
            }
        })

        buttons.push({
            type: "cancel"
        })

        // Create and open the dialog

        this.dialog = new Dialog({
            id: "edit-contributor",
            title: `${this.contributor ? gettext("Update") : gettext("Add")} ${this.node.attrs.item_title.toLowerCase()}`,
            body: contributorTemplate({
                contributor: this.contributor ? this.contributor : {}
            }),
            width: 836,
            height: 360,
            buttons,
            // Focus the editor view when dialog closes
            onClose: () => this.view.focus(),
            // Don't restore previous active element (dialog handles focus)
            restoreActiveElement: false
        })

        this.dialog.open()
    }
}
