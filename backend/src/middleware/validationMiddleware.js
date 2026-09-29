const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(422).json({
      success: false,
      message: formattedErrors[0]?.message || 'Validation failed for request data',
      error: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = {
  validate
};
