const playwright = require('playwright');
const playwrightCore = require('playwright-core');
const chromium = require('@sparticuz/chromium');
const ApiError = require('../exceptions/api-error');

class ScreenshotService {
  async launchBrowser() {
    if (process.env.VERCEL === '1' || process.env.AWS_REGION) {
      const executablePath = await chromium.executablePath();

      return playwrightCore.chromium.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
    }

    return playwright.chromium.launch({ headless: true });
  }

  getAppBaseUrl(requestBaseUrl) {
    if (process.env.CLIENT_BASE_URL) {
      return process.env.CLIENT_BASE_URL.replace(/\/$/, '');
    }

    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:5173';
    }

    if (!requestBaseUrl) {
      throw ApiError.BadRequest('Base URL is not configured');
    }

    return requestBaseUrl.replace(/\/$/, '');
  }

  async renderLessonPng({ lessonId, requestBaseUrl }) {
    const appBaseUrl = this.getAppBaseUrl(requestBaseUrl);
    const targetUrl = `${appBaseUrl}/export/lessons/${lessonId}`;
    const browser = await this.launchBrowser();

    try {
      const page = await browser.newPage({
        viewport: { width: 1296, height: 1800 },
        deviceScaleFactor: 2,
      });

      await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const exportRoot = page.locator('[data-export-root]');
      const readyRoot = page.locator('[data-export-root][data-export-ready="true"]');
      await exportRoot.waitFor({ state: 'visible', timeout: 15000 });
      await readyRoot.waitFor({ state: 'attached', timeout: 15000 });

      return await exportRoot.screenshot({
        type: 'png',
      });
    } catch (e) {
      throw ApiError.BadRequest(`Failed to render lesson image: ${e.message}`);
    } finally {
      await browser.close();
    }
  }
}

module.exports = new ScreenshotService();
