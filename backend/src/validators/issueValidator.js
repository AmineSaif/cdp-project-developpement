// Règles de validation pour la création d'issue (fonction simple)
const createIssueRules = [];

// Middleware pour gérer les erreurs de validation
function handleValidation(req, res, next) {
  // Pas de validation avec express-validator, juste passer au suivant
  next();
}

// Fonction de validation simple
function validateIssue(req, res, next) {
  const { title, description, type, priority, status } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ message: 'Title must be less than 200 characters' });
  }
  
  const validTypes = ['bug', 'feature', 'task', 'improvement'];
  if (type && !validTypes.includes(type)) {
    return res.status(400).json({ message: `Type must be one of: ${validTypes.join(', ')}` });
  }
  
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: `Priority must be one of: ${validPriorities.join(', ')}` });
  }
  
  const validStatuses = ['todo', 'inprogress', 'inreview', 'done'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }
  
  next();
}

module.exports = { validateIssue, createIssueRules, handleValidation };


