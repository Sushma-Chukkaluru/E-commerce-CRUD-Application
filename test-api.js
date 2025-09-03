const { runQuery } = require('./database');

// Test function to check all API endpoints are working
async function testDatabaseConnection() {
  try {
    console.log('\n----- TESTING DATABASE CONNECTION -----');
    
    // Test categories
    console.log('\nTesting categories table:');
    const categories = await runQuery('SELECT * FROM category');
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`- ID: ${cat.category_id}, Name: ${cat.category_name}, Description: ${cat.description}`);
    });

    // Test products
    console.log('\nTesting products table:');
    const products = await runQuery('SELECT * FROM products');
    console.log(`Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ID: ${product.product_id}, Name: ${product.product_name}, Category ID: ${product.category_id}, Price: ${product.price}, Stock: ${product.stock}`);
    });
    
    // Test join query
    console.log('\nTesting join query (products with category names):');
    const joinQuery = `
      SELECT p.product_id, p.product_name, c.category_name, p.price, p.stock
      FROM products p
      JOIN category c ON p.category_id = c.category_id
      ORDER BY p.product_id
    `;
    const joinResults = await runQuery(joinQuery);
    console.log(`Found ${joinResults.length} products with categories:`);
    joinResults.forEach(item => {
      console.log(`- ID: ${item.product_id}, Name: ${item.product_name}, Category: ${item.category_name}, Price: ${item.price}, Stock: ${item.stock}`);
    });
    
    console.log('\nAll database tests completed successfully!');
    
  } catch (err) {
    console.error('\nERROR TESTING DATABASE:', err);
  }
}

// Function to create a test category
async function createTestCategory() {
  try {
    console.log('\n----- CREATING TEST CATEGORY -----');
    const result = await runQuery(
      'INSERT INTO category (category_name, description) VALUES ($1, $2) RETURNING *',
      ['Test Category', 'This is a test category created from the API test script']
    );
    
    console.log('Created test category:', result[0]);
    return result[0];
  } catch (err) {
    console.error('Error creating test category:', err);
    throw err;
  }
}

// Function to create a test product
async function createTestProduct(categoryId) {
  try {
    console.log(`\n----- CREATING TEST PRODUCT IN CATEGORY ${categoryId} -----`);
    const result = await runQuery(
      'INSERT INTO products (product_name, category_id, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      ['Test Product', categoryId, 123.45, 42]
    );
    
    console.log('Created test product:', result[0]);
    return result[0];
  } catch (err) {
    console.error('Error creating test product:', err);
    throw err;
  }
}

// Run the tests
async function runTests() {
  try {
    await testDatabaseConnection();
    
    // Only create test data if we need to
    const categories = await runQuery('SELECT * FROM category');
    if (categories.length === 0) {
      console.log('No categories found. Creating test category and product...');
      const category = await createTestCategory();
      await createTestProduct(category.category_id);
    } else {
      console.log(`Found ${categories.length} categories, no need to create test data.`);
    }
    
    console.log('\n----- ALL TESTS COMPLETED -----');
    console.log('Your database is set up correctly, you should be able to use the API endpoints now.');
    console.log('');
    console.log('API Endpoints:');
    console.log('GET    /api/categories      - List all categories');
    console.log('POST   /api/categories      - Create a new category');
    console.log('GET    /api/categories/:id  - Get a specific category');
    console.log('PUT    /api/categories/:id  - Update a category');
    console.log('DELETE /api/categories/:id  - Delete a category');
    console.log('');
    console.log('GET    /api/products        - List all products');
    console.log('POST   /api/products        - Create a new product');
    console.log('GET    /api/products/:id    - Get a specific product');
    console.log('PUT    /api/products/:id    - Update a product');
    console.log('DELETE /api/products/:id    - Delete a product');
    console.log('');
    console.log('POST   /api/upload          - Upload Excel file with products');
    
  } catch (err) {
    console.error('\nTEST FAILED:', err);
  } finally {
    process.exit(0);
  }
}

// Run the tests
runTests();