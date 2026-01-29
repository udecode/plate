import {noSpaceTmp} from "../../common"

const CSS_COLORS = [
    "0,119,190",
    "217,58,50",
    "0,0,160",
    "119,190,0",
    "97,255,105",
    "173,216,230",
    "128,0,128",
    "128,128,128",
    "255,165,0"
]

/* Create a CSS stylesheet for the colors of all users. */
export class ModCollabColors {
    constructor(mod) {
        mod.colors = this
        this.mod = mod
        this.userColorStyle = false
        this.colorIds = []
        this.setup()
    }

    setup() {
        const styleContainers = document.createElement("temp")
        styleContainers.innerHTML =
            '<style type="text/css" id="user-colors"></style>'
        while (styleContainers.firstElementChild) {
            document.body.appendChild(styleContainers.firstElementChild)
        }
        this.userColorStyle = document.getElementById("user-colors")
    }

    ensureUserColor(userId) {
        /* We assign a color to each user. This color stays even if the user
         * disconnects or the participant list is being updated.
         */
        if (!this.colorIds.includes(userId)) {
            this.colorIds.push(userId)
            this.provideUserColorStyles()
        }
    }

    // Ensure that there are at least the given number of user color styles.
    provideUserColorStyles() {
        this.userColorStyle.innerHTML = this.colorIds
            .map((id, index) => {
                const color =
                    index < CSS_COLORS.length
                        ? CSS_COLORS[index]
                        : `${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)}`
                return noSpaceTmp`
                span.user-${id} {
                    border-color: rgba(${color},1);
                    text-decoration-color: rgba(${color},1);
                }
                span.user-${id}.insertion {
                    color: rgba(${color},1);
                }
                .user-bg-${id} {
                    background-color: rgba(${color},0.2);
                }`
            })
            .join("\n")
    }
}
