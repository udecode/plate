/* allows cross domain web workers */
/* Taken from https://benohead.com/cross-domain-cross-browser-web-workers/ */
export const makeWorker = workerUrl => {
    const a = document.createElement("a")
    a.href = workerUrl // turn into absolute URL if needed.
    const blob = new Blob([`importScripts("${a.href}")`], {
            type: "application/javascript"
        }),
        blobUrl = window.URL.createObjectURL(blob),
        worker = new Worker(blobUrl)
    return worker
}
