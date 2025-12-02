const crypto = require('crypto');
const { Project } = require('../models');

/**
 * Génère un code projet unique (8 caractères hexadécimaux)
 */
async function generateUniqueProjectCode() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = crypto.randomBytes(4).toString('hex'); // 8 caractères hex
    
    const existing = await Project.findOne({ where: { projectCode: code } });
    
    if (!existing) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Impossible de générer un code projet unique après plusieurs tentatives');
}

module.exports = { generateUniqueProjectCode };
