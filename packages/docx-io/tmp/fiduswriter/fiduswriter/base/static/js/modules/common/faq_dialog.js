import {escapeText} from "./basic"
import {Dialog} from "./dialog"
import {ensureCSS} from "./network"

const faqTemplate = ({escapedQuestions}) =>
    `<div class="faq">
    <ol class="faq-list">
        ${escapedQuestions
            .map(
                question => `<li class="faq-item">
                <div>
                    <div class="faq-question fw-button fw-light"><i class="fas fa-plus-circle"></i>${question[0]}</div>
                    <div class="faq-answer" style="display: none;">${question[1]}</div>
                </div>
            </li>`
            )
            .join("")}
    </ol>
</div>`

export class faqDialog {
    constructor({title = "", questions = []}) {
        ensureCSS(staticUrl("css/faq_dialog.css"))
        const escapedQuestions = []

        questions.forEach(q => {
            const question = escapeText(q[0])
            let answer
            q[1] = escapeText(q[1])
            if (q[q.length - 1].hasImage) {
                answer = interpolate(...q.slice(1, q.length), true)
            } else {
                answer = q[1]
            }
            escapedQuestions.push([question, answer])
        })

        this.faqDialog = new Dialog({
            title: title,
            body: faqTemplate({escapedQuestions}),
            height: 600,
            width: 900,
            buttons: []
        })
    }

    open() {
        this.faqDialog.open()
        this.faqDialog.dialogEl
            .querySelectorAll(".faq-question")
            .forEach(element => {
                element.addEventListener("click", () => {
                    const iconEle = element.firstElementChild
                    const answerEle = element.nextElementSibling
                    if (answerEle.style.display == "") {
                        iconEle.classList.remove("fa-minus-circle")
                        iconEle.classList.add("fa-plus-circle")
                        answerEle.style.display = "none"
                    } else if (answerEle.style.display == "none") {
                        iconEle.classList.remove("fa-plus-circle")
                        iconEle.classList.add("fa-minus-circle")
                        answerEle.style.display = ""
                    }
                })
            })
    }
}
