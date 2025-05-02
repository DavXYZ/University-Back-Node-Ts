import { AppDataSource } from '../data-source';

const dropTable = async () => {
  const tableName = process.argv[2]; // Get the table name from the command line argument

  if (!tableName) {
    console.error('Please provide a table name. Example: npm run drop:table products');
    process.exit(1);
  }

  try {
    await AppDataSource.initialize();
    console.log(`Database connected successfully. Dropping data from ${tableName}...`);

    await AppDataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    
    console.log(`All data from ${tableName} has been removed.`);
    process.exit(0);
  } catch (error) {
    console.error('Error dropping table data:', error);
    process.exit(1);
  }
};

dropTable();
