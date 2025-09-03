const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Get all products with category name
router.get('/', async (_, res) => {
  try {
    const query = `
      SELECT p.product_id, p.product_name, p.category_id, c.category_name, p.price, p.stock 
      FROM products p
      JOIN category c ON p.category_id = c.category_id
      ORDER BY p.product_id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT p.product_id, p.product_name, p.category_id, c.category_name, p.price, p.stock 
      FROM products p
      JOIN category c ON p.category_id = c.category_id
      WHERE p.product_id = $1
    `;
    
    const result = await pool.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  const { product_name, category_id, price, stock } = req.body;
  
  // Validate input
  if (!product_name || !category_id || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "Product name, category ID, price, and stock are required" });
  }
  
  if (parseFloat(price) <= 0) {
    return res.status(400).json({ error: "Price must be greater than 0" });
  }
  
  if (parseInt(stock) < 0) {
    return res.status(400).json({ error: "Stock cannot be negative" });
  }
  
  try {
    // Check if category exists
    const categoryResult = await pool.query(
      'SELECT * FROM category WHERE category_id = $1',
      [category_id]
    );
    
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: "Category does not exist" });
    }
    
    // Insert the product
    const insertResult = await pool.query(
      'INSERT INTO products (product_name, category_id, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_name, category_id, price, stock]
    );
    
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  const { product_name, category_id, price, stock } = req.body;
  
  // Validate input
  if (!product_name || !category_id || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "Product name, category ID, price, and stock are required" });
  }
  
  if (parseFloat(price) <= 0) {
    return res.status(400).json({ error: "Price must be greater than 0" });
  }
  
  if (parseInt(stock) < 0) {
    return res.status(400).json({ error: "Stock cannot be negative" });
  }
  
  try {
    // Check if product exists
    const productResult = await pool.query(
      'SELECT * FROM products WHERE product_id = $1',
      [req.params.id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Check if category exists
    const categoryResult = await pool.query(
      'SELECT * FROM category WHERE category_id = $1',
      [category_id]
    );
    
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: "Category does not exist" });
    }
    
    // Update the product
    const updateResult = await pool.query(
      'UPDATE products SET product_name = $1, category_id = $2, price = $3, stock = $4 WHERE product_id = $5 RETURNING *',
      [product_name, category_id, price, stock, req.params.id]
    );
    
    res.json(updateResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE product_id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ deleted: true, changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;