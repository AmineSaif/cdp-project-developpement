const sequelize = require('./src/config/database');

async function forceSync() {
  try {
    console.log('🔄 Forcing Sequelize to re-sync schema...');
    
    // Force drop and recreate ALL tables to ensure fresh schema
    await sequelize.drop({ cascade: true });
    console.log('✅ All tables dropped');
    
    // Force recreation
    await sequelize.sync({ force: true });
    console.log('✅ All tables recreated with fresh schema');
    
    console.log('🎯 New issues will now default to status: todo');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceSync();