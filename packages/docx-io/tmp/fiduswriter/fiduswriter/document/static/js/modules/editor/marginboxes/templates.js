import {READ_ONLY_ROLES} from "../"
import {avatarTemplate, escapeText, localizeDate} from "../../common"
import {serializeHelp} from "../../document_template"
import {serializeComment} from "../comments/editors"

/** A template for an answer to a comment */
const answerCommentTemplate = ({
    answer,
    author,
    commentId,
    activeCommentAnswerId,
    active,
    user
}) =>
    `<div class="comment-item comment-answer collapse ${active ? "show" : ""}" id="comment-answer-${answer.id}">
        <div class="comment-user">
            ${author ? avatarTemplate({user: author}) : '<span class="fw-string-avatar"></span>'}
            <h5 class="comment-user-name">${escapeText(author ? author.name : answer.username)}</h5>
            <p class="comment-date">${localizeDate(answer.date)}</p>
        </div>
        ${
            active && answer.id === activeCommentAnswerId
                ? `<div class="comment-text-wrapper">
                <div class="comment-answer-form">
                    <div id="answer-editor"></div>
                </div>
           </div>`
                : `<div class="comment-text-wrapper">
               <p class="comment-p">${serializeComment(answer.answer).html}</p>
           </div>
        <div class="comment-collapsible-buttons">
                ${
                    serializeComment(answer.answer).text.length > 68
                        ? `<a type="button" class="comment-expand-compress show-more-less">${gettext("show more")}</a>`
                        : ""
                }
                </div>
           ${
               answer.user === user.id
                   ? `<span class="show-marginbox-options fa fa-ellipsis-v" data-id="${answer.id}" data-commentId="${commentId}" data-answer=${true}></span>`
                   : ""
           }`
        }
    </div>`

/** A template to show one individual comment */
const singleCommentTemplate = ({comment, author, active, editComment}) =>
    `<div class="comment-item">
        <div class="comment-user">
            ${author ? avatarTemplate({user: author}) : '<span class="fw-string-avatar"></span>'}
            <h5 class="comment-user-name">${escapeText(author ? author.name : comment.username)}</h5>
            <p class="comment-date">${localizeDate(comment.date)}</p>
        </div>
        <div class="comment-text-wrapper">
            ${
                active && editComment
                    ? '<div id="comment-editor"></div>'
                    : `<p class="comment-p">${serializeComment(comment.comment).html}</p>`
            }
        </div>
        <div class="comment-collapsible-buttons">
                ${
                    !editComment &&
                    serializeComment(comment.comment).text.length > 68
                        ? `<a type="button" class="comment-expand-compress show-more-less">${gettext("show more")}</a>`
                        : ""
                }
                ${
                    !active && comment.answers.length > 0
                        ? `<a type="button" class="comment-expand-compress replies">+${comment.answers.length} ${gettext("replies")}</a>`
                        : ""
                }
            </div>
    </div>`

/** A template for the editor of a first comment before it has been saved (not an answer to a comment). */
const firstCommentTemplate = ({comment, author}) =>
    `<div class="comment-item">
        <div class="comment-user">
            ${author ? avatarTemplate({user: author}) : '<span class="fw-string-avatar"></span>'}
            <h5 class="comment-user-name">${escapeText(author ? author.name : comment.username)}</h5>
            <p class="comment-date">${localizeDate(comment.date)}</p>
        </div>
        <div class="comment-text-wrapper">
            <div id="comment-editor"></div>
        </div>
    </div>`

const helpTemplate = ({help, filterOptions}) => {
    if (!filterOptions.help || !filterOptions.info) {
        return '<div class="margin-box help hidden"></div>'
    } else {
        return `<div class="margin-box help ${help.active ? "active" : ""}"><div class="help-text-wrapper">${serializeHelp(help.help)}</div></div>`
    }
}

const warningTemplate = ({warning, filterOptions}) => {
    if (!filterOptions.warning || !filterOptions.info) {
        return '<div class="margin-box warning hidden"></div>'
    } else {
        return `<div class="margin-box warning ${warning.active ? "active" : ""}"><div class="help-text-wrapper">${warning.warning}</div></div>`
    }
}

const commentTemplate = ({
    comment,
    view,
    active,
    editComment,
    activeCommentAnswerId,
    user,
    docInfo,
    filterOptions
}) => {
    if (
        !filterOptions.comments ||
        (filterOptions.commentsOnlyMajor && !comment.isMajor) ||
        (!filterOptions.commentsResolved && comment.resolved) ||
        (filterOptions.commentsAuthor &&
            comment.user !== filterOptions.commentsAuthor) ||
        (filterOptions.assigned &&
            comment.assignedUser !== filterOptions.assigned) ||
        comment.hidden
    ) {
        return '<div class="margin-box comment hidden"></div>'
    }
    const author =
            comment.user === docInfo.owner.id
                ? docInfo.owner
                : docInfo.owner.contacts.find(
                      contact =>
                          contact.id === comment.user && contact.type === "user"
                  ),
        assignedUser = comment.assignedUser
            ? comment.assignedUser === docInfo.owner.id
                ? docInfo.owner
                : docInfo.owner.contacts.find(
                      contact =>
                          contact.id === comment.assignedUser &&
                          contact.type === "user"
                  ) || {
                      name: comment.assignedUsername || ""
                  }
            : false,
        assignedUsername = assignedUser ? assignedUser.name : false
    return `
        <div id="margin-box-${comment.id}" data-view="${view}" data-id="${comment.id}" data-user-id="${comment.user}"
            class="margin-box comment ${active ? "active" : "inactive"} ${comment.resolved ? "resolved" : ""} ${comment.isMajor === true ? "comment-is-major-bgc" : ""}">
<div class="comment-answer-container">
${
    comment.comment.length === 0
        ? firstCommentTemplate({comment, author})
        : singleCommentTemplate({comment, user, author, active, editComment})
}
    ${
        assignedUsername
            ? `<div class="assigned-user">${gettext("Assigned to")} <em>${escapeText(assignedUsername)}</em></div>`
            : ""
    }
    ${
        comment.answers
            ? comment.answers
                  .map(answer =>
                      answerCommentTemplate({
                          answer,
                          author:
                              answer.user === docInfo.owner.id
                                  ? docInfo.owner
                                  : docInfo.owner.contacts.find(
                                        contact =>
                                            contact.id === answer.user &&
                                            contact.type === "user"
                                    ),
                          commentId: comment.id,
                          active,
                          activeCommentAnswerId,
                          user,
                          docInfo
                      })
                  )
                  .join("")
            : ""
    }
    ${
        comment.id > 0 &&
        ((comment.user === user.id &&
            !READ_ONLY_ROLES.includes(docInfo.access_rights)) ||
            docInfo.access_rights === "write") &&
        !editComment
            ? `<span class="show-marginbox-options comment-option fas fa-ellipsis-v" data-id="${comment.id}" data-commentUser="${comment.user}"
></span>`
            : ""
    }
    </div>
    ${
        active &&
        !activeCommentAnswerId &&
        !editComment &&
        0 < comment.comment.length &&
        !READ_ONLY_ROLES.includes(docInfo.access_rights)
            ? `<div class="comment-item comment-answer comment-answer-editor">
                <div id="answer-editor"></div>
            </div>`
            : ""
    }
    </div>
`
}

const ACTIONS = {
    insertion: gettext("Insertion"),
    deletion: gettext("Deletion"),
    format_change: gettext("Format change"),
    block_change: gettext("Block change"),
    insertion_paragraph: gettext("New paragraph"),
    insertion_heading: gettext("New heading"),
    insertion_citation: gettext("Inserted citation"),
    insertion_blockquote: gettext("Wrapped into blockquote"),
    insertion_code_block: gettext("Added code block"),
    insertion_figure: gettext("Inserted figure"),
    insertion_list_item: gettext("New list item"),
    insertion_table: gettext("Inserted table"),
    insertion_keyword: gettext("New keyword: %(keyword)s"),
    deletion_paragraph: gettext("Merged paragraph"),
    deletion_heading: gettext("Merged heading"),
    deletion_citation: gettext("Deleted citation"),
    deletion_blockquote: gettext("Unwrapped blockquote"),
    deletion_code_block: gettext("Removed code block"),
    deletion_figure: gettext("Deleted figure"),
    deletion_list_item: gettext("Lifted list item"),
    deletion_table: gettext("Delete table"),
    deletion_keyword: gettext("Deleted keyword: %(keyword)s"),
    block_change_paragraph: gettext("Changed into paragraph"),
    block_change_heading: gettext("Changed into heading %(level)s"),
    block_change_code_block: gettext("Changed into code block")
}

const FORMAT_MARK_NAMES = {
    em: gettext("Emphasis"),
    strong: gettext("Strong"),
    underline: gettext("Underline")
}

const formatChangeTemplate = ({before, after}) => {
    let returnText = ""
    if (before.length) {
        returnText += `<div class="format-change-info"><b>${gettext("Removed")}:</b> ${before.map(markName => FORMAT_MARK_NAMES[markName]).join(", ")}</div>`
    }
    if (after.length) {
        returnText += `<div class="format-change-info"><b>${gettext("Added")}:</b> ${after.map(markName => FORMAT_MARK_NAMES[markName]).join(", ")}</div>`
    }
    return returnText
}

const BLOCK_NAMES = {
    paragraph: gettext("Paragraph"),
    heading1: gettext("Heading 1"),
    heading2: gettext("Heading 2"),
    heading3: gettext("Heading 3"),
    heading4: gettext("Heading 4"),
    heading5: gettext("Heading 5"),
    heading6: gettext("Heading 6"),
    code_block: gettext("Code block"),
    ordered_list: gettext("Ordered list"),
    bullet_list: gettext("Bullet list")
}

const blockChangeTemplate = ({before}, node) =>
    `<div class="format-change-info"><b>${gettext("Was")}:</b> ${BLOCK_NAMES[before.type]}${before.type === "ordered_list" && node.type.name === "ordered_list" ? `, ${gettext("start")}: ${before.attrs.order}` : ""}</div>`

const trackTemplate = ({type, data, node, active, docInfo, filterOptions}) => {
    if (
        !filterOptions.track ||
        (filterOptions.trackAuthor && data.user !== filterOptions.trackAuthor)
    ) {
        return '<div class="margin-box track hidden"></div>'
    }

    const author =
            data.user === docInfo.owner.id
                ? docInfo.owner
                : docInfo.owner.contacts.find(
                      contact =>
                          contact.id === data.user && contact.type === "user"
                  ),
        nodeActionType = `${type}_${node.type.name}`

    return `
        <div class="margin-box track ${active ? "active" : "inactive"}" data-type="${type}">
            <div class="track-${type}">
                <div class="comment-user">
                    ${author ? avatarTemplate({user: author}) : '<span class="fw-string-avatar"></span>'}
                    <h5 class="comment-user-name">${escapeText(author ? author.name : data.username)}</h5>
                    <p class="comment-date">${node.type.name === "text" ? `${gettext("ca.")} ` : ""}${localizeDate(data.date * 60000, "minutes")}</p>
                </div>
                <div class="track-title">
                    ${interpolate(ACTIONS[nodeActionType] ? ACTIONS[nodeActionType] : ACTIONS[type], node.attrs, true)}
                </div>
                ${type === "format_change" ? formatChangeTemplate(data) : type === "block_change" ? blockChangeTemplate(data, node) : ""}
            </div>
            ${
                docInfo.access_rights === "write"
                    ? `<div class="track-ctas">
                        <button class="track-accept fw-button fw-dark" type="submit" data-type="${type}">${gettext("Accept")}</button>
                        <button class="track-reject fw-button fw-orange" type="submit" data-type="${type}">${gettext("Reject")}</button>
                    </div>`
                    : ""
            }

        </div>`
}

export const marginboxFilterTemplate = ({
    marginBoxes,
    filterOptions,
    pastParticipants
}) => {
    const comments = marginBoxes.find(box => box.type === "comment")
    const tracks = marginBoxes.find(box =>
        ["insertion", "deletion", "format_change", "block_change"].includes(
            box.type
        )
    )
    const help = marginBoxes.find(box => box.type === "help")
    const warning = marginBoxes.find(box => box.type === "warning")
    let filterHTML = ""
    if (comments || filterOptions.commentsOnlyMajor) {
        filterHTML += `<div id="margin-box-filter-comments" class="margin-box-filter-button${filterOptions.comments ? "" : " disabled"}">
            <span class="label">${gettext("Comments")}</span>
            <span class="show-marginbox-options fa fa-ellipsis-v"></span>
            <div class="marginbox-options fw-pulldown fw-right"><ul>
                <li>
                    <span class="fw-pulldown-item show-marginbox-options-submenu" title="${gettext("Author")}">
                        ${gettext("Author")}
                        <span class="fw-icon-right"><i class="fa fa-caret-right"></i></span>
                    </span>
                    <div class="fw-pulldown marginbox-options-submenu">
                        <ul>
                            <li><span class="fw-pulldown-item margin-box-filter-comments-author${filterOptions.commentsAuthor === 0 ? " selected" : ""}" data-id="0" title="${gettext("Show comments from all authors.")}">
                                ${gettext("Any")}
                            </span></li>
                        ${pastParticipants
                            .map(
                                user => `<li><span class="fw-pulldown-item margin-box-filter-comments-author${filterOptions.commentsAuthor === user.id ? " selected" : ""}" data-id="${user.id}" title="${gettext("Show comments of ")} ${escapeText(user.name)}">
                                    ${escapeText(user.name)}
                                </span></li>`
                            )
                            .join("")}
                        </ul>
                    </div>
                </li>
                <li>
                    <span class="fw-pulldown-item show-marginbox-options-submenu" title="${gettext("Assignee")}">
                        ${gettext("Assignee")}
                        <span class="fw-icon-right"><i class="fa fa-caret-right"></i></span>
                    </span>
                    <div class="fw-pulldown marginbox-options-submenu">
                        <ul>
                            <li><span class="fw-pulldown-item margin-box-filter-comments-assigned${filterOptions.assigned === 0 ? " selected" : ""}" data-id="0" title="${gettext("Show comments from all authors.")}">
                                ${gettext("Any/None")}
                            </span></li>
                        ${pastParticipants
                            .map(
                                user => `<li><span class="fw-pulldown-item margin-box-filter-comments-assigned${filterOptions.assigned === user.id ? " selected" : ""}" data-id="${user.id}" title="${gettext("Show comments of ")} ${escapeText(user.name)}">
                                    ${escapeText(user.name)}
                                </span></li>`
                            )
                            .join("")}
                        </ul>
                    </div>
                </li>
                <li>
                    <span class="fw-pulldown-item margin-box-filter-check">
                        <input type="checkbox" class="fw-check fw-label-check"${filterOptions.commentsOnlyMajor ? " checked" : ""} id="margin-box-filter-comments-only-major">
                        <label for="margin-box-filter-comments-only-major">${gettext("Only major comments")}</label>
                    </span>
                </li>
                <li>
                    <span class="fw-pulldown-item margin-box-filter-check">
                        <input type="checkbox" class="fw-check fw-label-check"${filterOptions.commentsResolved ? " checked" : ""} id="margin-box-filter-comments-resolved">
                        <label for="margin-box-filter-comments-resolved">${gettext("Resolved comments")}</label>
                    </span>
                </li>
            </ul></div>
        </div>`
    }
    if (tracks) {
        filterHTML += `<div id="margin-box-filter-track" class="margin-box-filter-button${filterOptions.track ? "" : " disabled"}">
            <span class="label">${gettext("Tracking")}</span><span class="show-marginbox-options fa fa-ellipsis-v"></span>
            <div class="marginbox-options fw-pulldown fw-right"><ul>
                <li>
                    <span class="fw-pulldown-item show-marginbox-options-submenu" title="${gettext("Author")}">
                        ${gettext("Author")}
                        <span class="fw-icon-right"><i class="fa fa-caret-right"></i></span>
                    </span>
                    <div class="fw-pulldown marginbox-options-submenu">
                        <ul>
                            <li><span class="fw-pulldown-item margin-box-filter-track-author${filterOptions.trackAuthor === 0 ? " selected" : ""}" data-id="0" title="${gettext("Show track changes from all authors.")}">
                                ${gettext("Any")}
                            </span></li>
                        ${pastParticipants
                            .map(
                                user => `<li><span class="fw-pulldown-item margin-box-filter-track-author${filterOptions.trackAuthor === user.id ? " selected" : ""}" data-id="${user.id}" title="${gettext("Show track changes of ")} ${escapeText(user.name)}">
                                    ${escapeText(user.name)}
                                </span></li>`
                            )
                            .join("")}
                        </ul>
                    </div>
                </li>
            </ul></div>
        </div>`
    }
    if (help || warning) {
        filterHTML += `<div id="margin-box-filter-info" class="margin-box-filter-button${filterOptions.info ? "" : " disabled"}">
            <span class="label">${gettext("Informational")}</span>
            <span class="show-marginbox-options fa fa-ellipsis-v"></span>
            <div class="marginbox-options fw-pulldown fw-right"><ul>
                <li>
                <span class="fw-pulldown-item margin-box-filter-check">
                    <input type="checkbox" class="fw-check fw-label-check"${filterOptions.help ? " checked" : ""} id="margin-box-filter-info-help">
                    <label for="margin-box-filter-info-help">${gettext("Instructions")}</label>
                </span>
                </li>
                <li>
                <span class="fw-pulldown-item margin-box-filter-check">
                    <input type="checkbox" class="fw-check fw-label-check"${filterOptions.warning ? " checked" : ""} id="margin-box-filter-info-warning">
                    <label for="margin-box-filter-info-warning">${gettext("Warnings")}</label>
                </span>
                </li>
            </ul></div>
        </div>`
    }
    return filterHTML
}

/** A template to display all the margin boxes (comments, deletion/insertion notifications) */
export const marginBoxesTemplate = ({
    marginBoxes,
    editComment,
    activeCommentAnswerId,
    user,
    docInfo,
    filterOptions
}) =>
    `<div id="margin-box-container"><div>${marginBoxes
        .map(mBox => {
            let returnValue = ""
            switch (mBox.type) {
                case "comment":
                    returnValue = commentTemplate({
                        comment: mBox.data,
                        view: mBox.view,
                        active: mBox.active,
                        activeCommentAnswerId,
                        editComment,
                        user,
                        docInfo,
                        filterOptions
                    })
                    break
                case "insertion":
                case "deletion":
                case "format_change":
                case "block_change":
                    returnValue = trackTemplate({
                        type: mBox.type,
                        node: mBox.node,
                        data: mBox.data,
                        active: mBox.active,
                        docInfo,
                        filterOptions
                    })
                    break
                case "help":
                    returnValue = helpTemplate({help: mBox.data, filterOptions})
                    break
                case "warning":
                    returnValue = warningTemplate({
                        warning: mBox.data,
                        filterOptions
                    })
                    break
                default:
                    break
            }
            return returnValue
        })
        .join("")}</div></div>`

export const marginBoxOptions = (comment, user, docInfo) => {
    return `<div class="comment-answer-options marginbox-options fw-pulldown">
                ${
                    !comment.answer
                        ? `<ul>
                    ${
                        comment.user === user.id
                            ? `<li><span class="fw-pulldown-item edit-comment" data-id="${comment.id}" title="${gettext("Edit")}">
                                    ${gettext("Edit")}
                                </span></li>`
                            : ""
                    }
                <li>
                    <span class="fw-pulldown-item show-marginbox-options-submenu" title="${gettext("Assign comment to user")}">
                        ${gettext("Assign to")}
                        <span class="fw-icon-right"><i class="fa fa-caret-right"></i></span>
                    </span>
                    <div class="fw-pulldown marginbox-options-submenu">
                        <ul>
                            <li><span class="fw-pulldown-item unassign-comment" data-id="${comment.id}" title="${gettext("Remove user assignment from comment")}">${gettext("No-one")}</span></li>
                        ${docInfo.owner.contacts
                            .concat(docInfo.owner)
                            .filter(contact => contact.type !== "userinvite")
                            .map(
                                user =>
                                    `<li><span class="fw-pulldown-item assign-comment" data-id="${comment.id}" data-user="${user.id}" data-username="${escapeText(user.name)}" title="${gettext("Assign comment to")} ${escapeText(user.name)}">${escapeText(user.name)}</span></li>`
                            )
                            .join("")}
                        </ul>
                    </div>
                </li>
                <li>
                    ${
                        comment.resolved
                            ? `<span class="fw-pulldown-item recreate-comment" data-id="${comment.id}" title="${gettext("Recreate comment")}">${gettext("Recreate")}</span>`
                            : `<span class="fw-pulldown-item resolve-comment" data-id="${comment.id}" title="${gettext("Resolve comment")}">${gettext("Resolve")}</span>`
                    }

                </li>
                <li>
                    <span class="fw-pulldown-item delete-comment" data-id="${comment.id}" title="${gettext("Delete comment")}">${gettext("Delete")}</span>
                </li>
            </ul>`
                        : `<ul>
                <li><span class="fw-pulldown-item edit-comment-answer" data-id="${comment.commentId}" data-answer="${comment.id}" title="${gettext("Edit")}">
                ${gettext("Edit")}
                </span></li>
                <li><span class="fw-pulldown-item delete-comment-answer" data-id="${comment.commentId}" data-answer="${comment.id}" title="${gettext("Delete")}">
                ${gettext("Delete")}
                </span></li>
           </ul>`
                }
            </div>`
}
