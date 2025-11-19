const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la connexion
const sequelize = new Sequelize('postgres', 'postgres', '', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

async function initializeDatabase() {
  try {
    console.log('Tentative de connexion à PostgreSQL...');
    
    // Test de connexion
    await sequelize.authenticate();
    console.log('✓ Connexion réussie à PostgreSQL');
    
    // Créer la base de données si elle n'existe pas
    console.log('Création de la base de données saas_dev...');
    await sequelize.query('CREATE DATABASE saas_dev;').catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Base de données saas_dev existe déjà');
      } else {
        throw err;
      }
    });
    
    console.log('✓ Base de données initialisée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    
    // Si l'erreur est liée à l'authentification, essayons différents mots de passe
    if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Problème d\'authentification détecté. Solutions possibles:');
      console.log('1. Réinitialiser le mot de passe PostgreSQL');
      console.log('2. Modifier pg_hba.conf pour autoriser la connexion locale');
      console.log('3. Utiliser l\'utilisateur Windows actuel');
      
      // Essayons avec l'utilisateur Windows
      try {
        const windowsSeq = new Sequelize('postgres', process.env.USERNAME, '', {
          host: 'localhost',
          port: 5432,
          dialect: 'postgres',
          logging: false
        });
        
        await windowsSeq.authenticate();
        console.log('✓ Connexion réussie avec l\'utilisateur Windows');
        
        // Mettre à jour le .env
        console.log('Mise à jour de la configuration...');
        // (ici on pourrait écrire dans le .env)
        
      } catch (winError) {
        console.log('❌ Connexion avec l\'utilisateur Windows échouée aussi');
      }
    }
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();