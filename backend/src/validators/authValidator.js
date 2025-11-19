const { body, validationResult } = require('express-validator');

const registerRules = [
  body('name').isString().isLength({ min: 2 }).withMessage('name must be at least 2 chars'),
  body('email').isEmail().withMessage('invalid email'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 chars')
];

const loginRules = [
  body('email').isEmail().withMessage('invalid email'),
  body('password').exists().withMessage('password required')
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

module.exports = { registerRules, loginRules, handleValidation };
