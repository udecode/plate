import {convertDataURIToBlob} from "../../common"

export function svg2png(blob) {
    const img = document.createElement("img")
    const src = URL.createObjectURL(blob)
    img.src = src
    img.setAttribute("style", "position:fixed;left:-200vw;")
    return new Promise(resolve => {
        img.onload = function onload() {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const ratio = Math.min(
                Math.min(img.width, img.height) / img.width,
                Math.min(img.width, img.height) / img.height
            )
            const width = img.width * ratio
            const height = img.height * ratio
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            const src = canvas.toDataURL("image/png")
            img.parentElement.removeChild(img)
            URL.revokeObjectURL(src)
            const pngBlob = convertDataURIToBlob(src)
            resolve({blob: pngBlob, width, height})
        }
        document.body.appendChild(img)
    })
}
