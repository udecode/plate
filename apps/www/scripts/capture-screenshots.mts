import puppeteer from "puppeteer"

const BLOCKS = [
  // "demo-sidebar",
]

try {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
  })

  console.info("☀️ Capturing screenshots for light theme")
  for (const block of BLOCKS) {
    const pageUrl = `http://localhost:3000/blocks/default/${block}`
    console.info(`- ${block}`)

    const page = await browser.newPage()
    await page.goto(pageUrl, {
      waitUntil: "networkidle2",
    })

    // Hide Tailwind indicator
    await page.evaluate(() => {
      const indicator = document.querySelector("[data-tailwind-indicator]")
      if (indicator) {
        indicator.remove()
      }
    })

    await page.screenshot({
      path: `./public/images/blocks/${block}.png`,
    })
  }

  console.info("🌙 Capturing screenshots for dark theme")
  for (const block of BLOCKS) {
    const pageUrl = `http://localhost:3000/blocks/default/${block}`
    console.info(`- ${block}`)

    const page = await browser.newPage()
    await page.goto(pageUrl, {
      waitUntil: "networkidle2",
    })

    // Hide Tailwind indicator
    await page.evaluate(() => {
      const indicator = document.querySelector("[data-tailwind-indicator]")
      if (indicator) {
        indicator.remove()
      }
    })

    // Set theme to dark
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark")
    })

    await page.screenshot({
      path: `./public/images/blocks/${block}-dark.png`,
    })
  }

  await browser.close()
  console.info("✅ Done!")
} catch (error) {
  console.error(error)
  process.exit(1)
}