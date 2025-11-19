const crypto = require('crypto');

/**
 * Génère un code d'équipe unique (8 caractères alphanumériques)
 */
function generateTeamCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Génère un code d'équipe et vérifie qu'il est unique
 */
async function generateUniqueTeamCode() {
  const Team = require('../models/team');
  let teamCode;
  let isUnique = false;
  
  while (!isUnique) {
    teamCode = generateTeamCode();
    const existing = await Team.findOne({ where: { teamCode } });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return teamCode;
}

module.exports = { generateTeamCode, generateUniqueTeamCode };
