const { Client, User, Project } = require('../models');

/**
 * Créer un nouveau client
 * POST /api/clients
 */
exports.createClient = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const client = await Client.create({
      name,
      ownerId: userId
    });

    res.status(201).json({ client, message: 'Client créé avec succès' });
  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
};

/**
 * Lister mes clients
 * GET /api/clients
 */
exports.listMyClients = async (req, res) => {
  try {
    const userId = req.user.id;

    const clients = await Client.findAll({
      where: { ownerId: userId },
      include: [
        { 
          model: Project, 
          as: 'projects',
          attributes: ['id', 'name', 'projectCode', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ clients });
  } catch (error) {
    console.error('Erreur liste clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
};

/**
 * Obtenir un client par ID
 * GET /api/clients/:id
 */
exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const client = await Client.findOne({
      where: { id, ownerId: userId },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { 
          model: Project, 
          as: 'projects',
          attributes: ['id', 'name', 'description', 'projectCode', 'createdAt']
        }
      ]
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Erreur récupération client:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du client' });
  }
};

/**
 * Mettre à jour un client
 * PATCH /api/clients/:id
 */
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const client = await Client.findOne({
      where: { id, ownerId: userId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    await client.update({ name });

    res.json({ client, message: 'Client mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour client:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
  }
};

/**
 * Supprimer un client
 * DELETE /api/clients/:id
 */
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const client = await Client.findOne({
      where: { id, ownerId: userId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    await client.destroy();

    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression client:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
};
