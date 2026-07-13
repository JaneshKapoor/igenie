import puppeteer from "puppeteer-core";

const OUT = "/Users/janeshkapoor/Desktop/Janesh/development/igenie/docs/screens";
const BASE = "http://localhost:3013";

const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 2 });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(path, file, extra) {
  await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(4500); // let entrance animations + 3D genie settle
  if (extra) await extra();
  await page.screenshot({ path: `${OUT}/${file}`, type: "png" });
  console.log("saved", file);
}

// pre-set the goal so dashboard shows "Growing toward Own a Home"
await page.evaluateOnNewDocument(() => {
  localStorage.setItem(
    "igenie-store",
    JSON.stringify({ state: { goal: "home" }, version: 0 })
  );
});

await shoot("/", "landing.png");
await shoot("/onboarding", "onboarding.png");
await shoot("/dashboard", "dashboard-ember.png");

// level-up: click fast-forward, wait for celebration + Flame badge
await shoot("/dashboard", "dashboard-flame.png", async () => {
  const btns = await page.$$("button");
  for (const b of btns) {
    const t = await b.evaluate((el) => el.textContent);
    if (t?.includes("Fast-forward")) {
      await b.click();
      break;
    }
  }
  await sleep(2500);
});

// chat: open sheet, send a question, wait for the reply + rec card
await shoot("/dashboard", "chat.png", async () => {
  const btns = await page.$$("button");
  for (const b of btns) {
    const t = await b.evaluate((el) => el.textContent);
    if (t?.includes("Ask iGenie")) {
      await b.click();
      break;
    }
  }
  await sleep(800);
  await page.type('input[placeholder="Ask about your money…"]', "How do I level up my score?");
  await page.keyboard.press("Enter");
  await sleep(4000);
});

await browser.close();
console.log("done");
