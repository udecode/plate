// This is a SW template file where more functionality can be added.
const secondary_cache_name = "secondary_cache"
const reg_exp_img = /(https?:\\/\\/.*\.(?:png|jpg|gif|jpeg))/ // eslint-disable-line
const reg_exp_font = /(https?:\\/\\/.*\.(?:woff|woff2|ttf))/ // eslint-disable-line
const reg_exp_docx = /(https?:\\/\\/.*\.(?:docx))/ // eslint-disable-line


self.addEventListener("activate", _event =>
    self.caches.keys().then((names) => {
        if (names == secondary_cache_name) {
            caches.delete(names)
        }
    })
)

self.addEventListener("fetch", (event) => {
    const url = event.request.url
    if ((reg_exp_img.test(url) || reg_exp_font.test(url) || reg_exp_docx.test(url)) && event.request.method == "GET") {
        event.respondWith(
            caches.match(event.request).then((resp) => {
                return resp || fetch(event.request).then((response) => {
                    const response_to_cache = response.clone()
                    return caches.open(secondary_cache_name).then((cache) => {
                        cache.put(event.request, response_to_cache)
                        return response
                    })
                })
            })
        )
    }
})
