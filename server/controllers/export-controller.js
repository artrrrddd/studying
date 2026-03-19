const screenshotService = require('../service/screenshot-service');

class ExportController {
  async lessonImage(req, res, next) {
    try {
      const buffer = await screenshotService.renderLessonPng({
        lessonId: req.params.id,
        requestBaseUrl: `${req.protocol}://${req.get('host')}`,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(buffer);
    } catch (e) {
      return next(e);
    }
  }
}

module.exports = new ExportController();
