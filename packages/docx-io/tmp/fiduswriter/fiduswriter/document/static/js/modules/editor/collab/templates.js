import {avatarTemplate, escapeText, localizeDate} from "../../common"
export const messageTemplate = ({message, theChatter}) =>
    `<div class="message" id="m${message.id}">
        <div class="comment-user">
            ${avatarTemplate({user: theChatter})}
            <h5 class="comment-user-name">${escapeText(theChatter.name)}</h5>
            <p class="comment-date">${localizeDate(new Date())}</p>
        </div>
        <div class="message-body">${escapeText(message.body)}</div>
    </div>`
