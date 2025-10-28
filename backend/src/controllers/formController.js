const formService = require('../services/formService');

class FormController {
  async getFormTypes(req, res, next) {
    try {
      const forms = formService.getFormTypes();
      
      res.json({
        success: true,
        forms
      });
    } catch (error) {
      next(error);
    }
  }

  async submitForm(req, res, next) {
    try {
      const { formTitle, formType, googleFormUrl } = req.body;
      const result = await formService.submitForm(
        req.userId,
        formType,
        formTitle,
        googleFormUrl
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserForms(req, res, next) {
    try {
      const forms = await formService.getUserForms(req.userId);
      
      res.json({
        success: true,
        forms
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FormController();