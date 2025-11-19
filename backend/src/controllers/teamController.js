const User = require('../models/user');
const Team = require('../models/team');

/**
 * Récupère les membres de l'équipe de l'utilisateur connecté
 */
async function getTeamMembers(req, res) {
  try {
    console.log('=== GET TEAM MEMBERS CALLED ===');
    const userId = req.user && req.user.id;
    console.log('User ID:', userId);
    
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findByPk(userId, { attributes: ['id', 'teamId'] });
    console.log('User found:', user ? 'YES' : 'NO', 'teamId:', user?.teamId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.teamId) {
      console.log('User has no team - returning empty array');
      return res.json({ members: [] }); // Pas d'équipe
    }

    // Récupérer tous les membres de l'équipe
    const members = await User.findAll({
      where: { teamId: user.teamId },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']]
    });

    console.log('Found', members.length, 'team members');
    return res.json({ members });
  } catch (err) {
    console.error('ERROR in getTeamMembers:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Récupère les infos de l'équipe de l'utilisateur
 */
async function getMyTeam(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findByPk(userId, {
      include: [{
        model: Team,
        as: 'team',
        attributes: ['id', 'name', 'teamCode', 'createdById'],
        include: [{
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role']
        }]
      }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.team) return res.json({ team: null });

    return res.json({ team: user.team });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getTeamMembers, getMyTeam };
