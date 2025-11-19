const sequelize = require('./src/config/database');
const Issue = require('./src/models/issue');
const User = require('./src/models/user');

async function resetSchema() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🗑️ Dropping existing tables with cascade...');
    await sequelize.drop({ cascade: true });
    
    console.log('🏗️ Creating fresh schema...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Schema updated successfully!');
    console.log('📊 Issue status values: todo, inprogress, inreview, done');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetSchema();