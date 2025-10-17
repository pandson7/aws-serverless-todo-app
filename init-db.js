const mysql = require('mysql2/promise');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

async function getDbCredentials() {
  const command = new GetSecretValueCommand({
    SecretId: 'arn:aws:secretsmanager:us-east-1:945972242554:secret:TodoDbSecret101620251947D45-tEh8LbKSANWF-zOufax'
  });
  
  const response = await secretsClient.send(command);
  return JSON.parse(response.SecretString);
}

async function initializeDatabase() {
  try {
    console.log('Getting database credentials...');
    const credentials = await getDbCredentials();
    
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: 'todoappstack-101620251947-tododatabase101620251947-86pwr44te4q1.cc8wcfvahavj.us-east-1.rds.amazonaws.com',
      user: credentials.username,
      password: credentials.password,
      database: 'todoapp'
    });
    
    console.log('Creating todos table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )
    `);
    
    console.log('Database initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

initializeDatabase();