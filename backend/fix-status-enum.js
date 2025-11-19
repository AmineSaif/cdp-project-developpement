const sequelize = require('./src/config/database');

async function fixStatusEnum() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🔄 Fixing status ENUM...');
    
    // 1. Clean up any existing temp type
    console.log('1. Cleaning up existing temp type...');
    await sequelize.query(`DROP TYPE IF EXISTS enum_issues_status_new;`);
    
    console.log('2. Adding new ENUM type...');
    await sequelize.query(`
      CREATE TYPE enum_issues_status_new AS ENUM ('todo','inprogress','inreview','done');
    `);
    
    // 3. Remove the old default value
    console.log('3. Removing old default value...');
    await sequelize.query(`ALTER TABLE issues ALTER COLUMN status DROP DEFAULT;`);
    
    // 4. Update the column to use the new type with data conversion
    console.log('4. Converting existing data...');
    await sequelize.query(`
      ALTER TABLE issues 
      ALTER COLUMN status TYPE enum_issues_status_new 
      USING CASE 
        WHEN status = 'open' THEN 'todo'::enum_issues_status_new
        WHEN status = 'in_progress' THEN 'inprogress'::enum_issues_status_new
        WHEN status = 'closed' THEN 'done'::enum_issues_status_new
        ELSE 'todo'::enum_issues_status_new
      END;
    `);
    
    // 5. Set the new default value
    console.log('5. Setting new default value...');
    await sequelize.query(`
      ALTER TABLE issues ALTER COLUMN status SET DEFAULT 'todo'::enum_issues_status_new;
    `);
    
    // 6. Drop the old enum type
    console.log('6. Dropping old ENUM type...');
    await sequelize.query(`DROP TYPE enum_issues_status;`);
    
    // 7. Rename the new type
    console.log('7. Renaming new ENUM type...');
    await sequelize.query(`ALTER TYPE enum_issues_status_new RENAME TO enum_issues_status;`);
    
    console.log('✅ Status ENUM fixed successfully!');
    console.log('📊 New status values: todo, inprogress, inreview, done');
    console.log('🎯 Default value: todo');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixStatusEnum();