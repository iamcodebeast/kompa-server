// const puppeteer = require("puppeteer");
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");

module.exports = async function takeScreenshot(address, content) {
    const browser = await puppeteer.launch({
        executablePath: executablePath(),
        defaultViewport: {
            width: 1000,
            height: 1000,
            isLandscape: true,
        },
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto(address, { waitUntil: "networkidle2" });

    const [button] = await page.$x(
        "//button[contains(., 'Accept all cookies')]"
    );
    if (button) {
        await button.click();
    }

    const selector = ".XKUIhQ.ae4Kr3A.WIjutQ.M70QQA";

    // canva button
    await page.evaluate(
        (selector) =>
            document.querySelectorAll(selector).forEach((el) => {
                el.remove();
            }),
        selector
    );

    const selector2 = ".vbAyBg.J_jiHQ.WIjutQ.M70QQA";

    // canva floating bottom bar
    await page.evaluate(
        (selector2) =>
            document.querySelectorAll(selector2).forEach((el) => {
                el.remove();
            }),
        selector2
    );

    // change data
    await page.evaluate((content) => {
        let textElement = document.querySelectorAll("span");
        Array.from(textElement).forEach((el) => {
            Object.keys(content).forEach((keyContent) => {
                let key = `<${keyContent}>`;
                if (el.textContent === key) {
                    el.textContent = content[keyContent];
                }
            });
        });
    }, content);

    if (content["photo"]) {
        console.log("masuk image");

        await page.evaluate(async (content) => {
            const selectors = Array.from(document.querySelectorAll("img"));
            selectors.forEach((el) => {
                if (
                    el.src.includes(
                        "https://media-private.canva.com/ONmBw/MAFXvVONmBw/1/s.jpg"
                    )
                ) {
                    el.src = content["photo"];
                }
            });
            await Promise.all(
                selectors.map((img) => {
                    if (img.complete) return;
                    return new Promise((resolve, reject) => {
                        img.addEventListener("load", resolve);
                        img.addEventListener("error", reject);
                    });
                })
            );
        }, content);
    }

    const screenshot = await page.screenshot({
        omitBackground: true,
        encoding: "binary",
    });

    await browser.close();

    return { screenshot };
};
