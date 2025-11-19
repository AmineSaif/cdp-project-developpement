const { Sequelize } = require('sequelize');
require('dotenv').config();

// Liste des mots de passe communs à tester
const commonPasswords = [
  '', // pas de mot de passe
  'postgres',
  'password',
  'admin',
  'root',
  '123456',
  'postgres123',
  'admin123'
];

async function testConnection(password) {
  const sequelize = new Sequelize('postgres', 'postgres', password, {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  });
  
  try {
    await sequelize.authenticate();
    await sequelize.close();
    return true;
  } catch (error) {
    await sequelize.close();
    return false;
  }
}

async function findWorkingPassword() {
  console.log('🔍 Recherche du bon mot de passe PostgreSQL...\n');
  
  for (const password of commonPasswords) {
    const displayPassword = password === '' ? '(vide)' : password;
    process.stdout.write(`Essai avec le mot de passe: ${displayPassword}... `);
    
    const works = await testConnection(password);
    if (works) {
      console.log('✅ SUCCÈS !');
      console.log(`\n🎉 Mot de passe trouvé: ${displayPassword}`);
      console.log(`\nMettez à jour votre fichier .env avec:`);
      console.log(`DB_PASSWORD=${password}`);
      return password;
    } else {
      console.log('❌');
    }
  }
  
  console.log('\n😞 Aucun mot de passe commun ne fonctionne.');
  console.log('\nSolutions possibles:');
  console.log('1. Réinitialiser le mot de passe PostgreSQL via pgAdmin');
  console.log('2. Utiliser la commande ALTER USER en tant que superutilisateur');
  console.log('3. Modifier pg_hba.conf pour autoriser les connexions locales sans mot de passe');
  
  return null;
}

findWorkingPassword();