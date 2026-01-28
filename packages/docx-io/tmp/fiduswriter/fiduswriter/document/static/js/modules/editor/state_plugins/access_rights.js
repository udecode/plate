import {Plugin, PluginKey} from "prosemirror-state"
import {COMMENT_ONLY_ROLES, READ_ONLY_ROLES} from ".."

const key = new PluginKey("accessRights")

export const accessRightsPlugin = options =>
    new Plugin({
        key,
        filterTransaction: (tr, _state) => {
            let allowed = true
            const remote = tr.getMeta("remote")
            if (remote) {
                return allowed
            }

            if (
                READ_ONLY_ROLES.includes(
                    options.editor.docInfo.access_rights
                ) &&
                tr.docChanged
            ) {
                // User only has read access. Don't allow anything.
                allowed = false
            } else if (
                COMMENT_ONLY_ROLES.includes(
                    options.editor.docInfo.access_rights
                )
            ) {
                //User has a comment-only role (commentator, editor or reviewer)

                //Check all transaction steps. If step type not allowed = prohibit
                //check if in allowed array. if false - exit loop
                if (
                    !tr.steps.every(
                        step =>
                            (step.jsonID === "addMark" ||
                                step.jsonID === "removeMark") &&
                            step.mark.type.name === "comment"
                    )
                ) {
                    allowed = false
                }
            }

            return allowed
        }
    })
