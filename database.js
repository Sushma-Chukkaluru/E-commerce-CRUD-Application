const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  port: 5432
});

// Initialize the database with tables
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log("Creating tables if they don't exist...");

    // Create Category table
    await client.query(`
      CREATE TABLE IF NOT EXISTS category (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      );
    `);

    // Create Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        category_id INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES category(category_id)
      );
    `);
    
    // Check if we need to insert sample data
    const result = await client.query('SELECT COUNT(*) as count FROM category');
    
    // If no categories exist, insert sample data
    if (parseInt(result.rows[0].count) === 0) {
      console.log("No categories found, inserting sample data...");
      await insertSampleData(client);
    } else {
      console.log(`Found ${result.rows[0].count} existing categories, skipping sample data insertion`);
    }
    
    return true;
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Insert sample data
async function insertSampleData(client) {
  try {
    // Start a transaction
    await client.query('BEGIN');

    const categories = [
      { name: 'Electronics', description: 'Gadgets, computers, and related accessories.' },
      { name: 'Apparel', description: 'Clothing, shoes, and fashion accessories.' },
      { name: 'Books', description: 'Fiction, non-fiction, and educational materials.' }
    ];

    // Insert categories
    for (const cat of categories) {
      await client.query(
        'INSERT INTO category (category_name, description) VALUES ($1, $2)',
        [cat.name, cat.description]
      );
    }

    const products = [
      { name: 'Laptop X1', category_id: 1, price: 1200.00, stock: 15 },
      { name: 'Smartphone Y2', category_id: 1, price: 699.99, stock: 30 },
      { name: 'T-Shirt Basic', category_id: 2, price: 25.99, stock: 150 },
      { name: 'Jeans Classic', category_id: 2, price: 59.99, stock: 75 },
      { name: 'The Great Novel', category_id: 3, price: 19.50, stock: 80 }
    ];

    // Insert products
    for (const product of products) {
      await client.query(
        'INSERT INTO products (product_name, category_id, price, stock) VALUES ($1, $2, $3, $4)',
        [product.name, product.category_id, product.price, product.stock]
      );
    }

    // Commit the transaction
    await client.query('COMMIT');
    console.log("Sample data inserted successfully");
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting sample data:', err);
    throw err;
  }
}

// For testing/debugging: direct query function
async function runQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error running query:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Export pool and init function
module.exports = {
  pool,
  initializeDatabase,
  runQuery
};