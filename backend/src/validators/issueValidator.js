const { body, validationResult } = require('express-validator');

const createIssueRules = [
  body('title').isString().isLength({ min: 3 }).withMessage('title must be at least 3 chars'),
  body('type').optional().isIn(['bug','feature','task']).withMessage('invalid type'),
  body('priority').optional().isIn(['low','medium','high','critical']).withMessage('invalid priority')
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

module.exports = { createIssueRules, handleValidation };
