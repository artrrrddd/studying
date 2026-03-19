const { chromium } = require('playwright');
const ApiError = require('../exceptions/api-error');

class ScreenshotService {
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
    const browser = await chromium.launch({ headless: true });

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
