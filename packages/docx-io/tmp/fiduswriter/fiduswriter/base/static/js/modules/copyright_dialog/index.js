import {edtfParse} from "biblatex-csl-converter"
import deepEqual from "fast-deep-equal"
import {Dialog, findTarget, isActivationEvent} from "../common"
import {
    copyrightTemplate,
    licenseInputTemplate,
    licenseSelectTemplate
} from "./templates"

export const LICENSE_URLS = [
    ["CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"],
    ["CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"],
    ["CC BY-ND 4.0", "https://creativecommons.org/licenses/by-nd/4.0/"],
    ["CC BY-NC 4.0", "https://creativecommons.org/licenses/by-nc/4.0/"],
    ["CC BY-NC-SA 4.0", "https://creativecommons.org/licenses/by-nc-sa/4.0/"],
    ["CC BY-NC-ND 4.0", "https://creativecommons.org/licenses/by-nc-nd/4.0/"],
    ["CC0", "https://creativecommons.org/publicdomain/zero/1.0/"]
]

function getLicenseTitle(url) {
    const license = LICENSE_URLS.find(license => license[1] === url)
    return license ? license[0] : ""
}

export class CopyrightDialog {
    constructor(copyright) {
        this.copyright = copyright
        this.origCopyright = copyright
        this.dialog = false
    }

    getCurrentValue() {
        this.copyright = {}
        const holder = this.dialog.dialogEl.querySelector(".holder").value
        this.copyright.holder = holder.length ? holder : false
        const year = this.dialog.dialogEl.querySelector(".year").value
        this.copyright.year = year.length
            ? Math.max(0, Math.min(Number.parseInt(year) || 0, 2100))
            : false
        this.copyright.freeToRead = this.dialog.dialogEl.querySelector(
            ".free-to-read:checked"
        )
            ? true
            : false
        const licenseStartDates = Array.from(
            this.dialog.dialogEl.querySelectorAll(".license-start")
        ).map(el => el.value)
        this.copyright.licenses = Array.from(
            this.dialog.dialogEl.querySelectorAll(".license")
        )
            .map((el, index) => {
                if (!el.value.length) {
                    return false
                } else {
                    const url = el.value,
                        title = el.matches("select")
                            ? getLicenseTitle(url)
                            : el.parentElement.parentElement.querySelector(
                                  ".license-title"
                              ).value,
                        returnValue = {url, title},
                        startDate = edtfParse(licenseStartDates[index])
                    if (
                        startDate.valid &&
                        startDate.type === "Date" &&
                        !startDate.uncertain &&
                        !startDate.approximate &&
                        startDate.values.length === 3
                    ) {
                        returnValue.start = startDate.cleanedString
                    }
                    return returnValue
                }
            })
            .filter(license => license)
    }

    init() {
        return new Promise(resolve => {
            const buttons = []
            buttons.push({
                text: gettext("Change"),
                classes: "fw-dark",
                click: () => {
                    this.dialog.close()
                    this.getCurrentValue()
                    if (deepEqual(this.copyright, this.origCopyright)) {
                        // No change.
                        resolve(false)
                    }
                    resolve(this.copyright)
                }
            })

            buttons.push({
                type: "cancel"
            })

            this.dialog = new Dialog({
                width: 940,
                height: 300,
                id: "configure-copyright",
                title: gettext("Set copyright information"),
                body: copyrightTemplate(this.copyright),
                buttons
            })

            this.dialog.open()
            this.bind()
        })
    }

    bind() {
        this.dialog.dialogEl.addEventListener("click", event =>
            this.handleActivation(event)
        )
        this.dialog.dialogEl.addEventListener("keydown", event =>
            this.handleActivation(event)
        )
    }

    handleActivation(event) {
        if (!isActivationEvent(event)) {
            return
        }
        const el = {}
        switch (true) {
            case findTarget(event, ".type-switch", el): {
                const url =
                    el.target.nextElementSibling.querySelector(".license").value
                if (el.target.classList.contains("value1")) {
                    el.target.classList.add("value2")
                    el.target.classList.remove("value1")
                    const title = getLicenseTitle(url)
                    el.target.nextElementSibling.innerHTML =
                        licenseInputTemplate({
                            url,
                            title
                        })
                } else {
                    el.target.classList.add("value1")
                    el.target.classList.remove("value2")
                    el.target.nextElementSibling.innerHTML =
                        licenseSelectTemplate({
                            url
                        })
                }
                break
            }
            case findTarget(event, ".fa-plus-circle", el): {
                this.getCurrentValue()
                this.dialog.dialogEl.querySelector(
                    "#configure-copyright"
                ).innerHTML = copyrightTemplate(this.copyright)
                break
            }
            case findTarget(event, ".fa-minus-circle", el): {
                const tr = el.target.closest("tr")
                tr.parentElement.removeChild(tr)
                this.getCurrentValue()

                this.dialog.dialogEl.querySelector(
                    "#configure-copyright"
                ).innerHTML = copyrightTemplate(this.copyright)
                break
            }
            default:
                break
        }
    }
}
