const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Get all categories
router.get('/', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM category ORDER BY category_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  const { category_name, description } = req.body;
  
  // Validate input
  if (!category_name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  
  try {
    // Check for duplicate (case-insensitive)
    const checkResult = await pool.query(
      'SELECT * FROM category WHERE LOWER(category_name) = LOWER($1)', 
      [category_name]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Category name already exists" });
    }
    
    // Insert the category
    const insertResult = await pool.query(
      'INSERT INTO category (category_name, description) VALUES ($1, $2) RETURNING *', 
      [category_name, description || null]
    );
    
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific category
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM category WHERE category_id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  const { category_name, description } = req.body;
  
  // Validate input
  if (!category_name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  
  try {
    // Check if category exists
    const categoryResult = await pool.query(
      'SELECT * FROM category WHERE category_id = $1',
      [req.params.id]
    );
    
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Check for duplicate name (excluding current category)
    const duplicateResult = await pool.query(
      'SELECT * FROM category WHERE LOWER(category_name) = LOWER($1) AND category_id != $2',
      [category_name, req.params.id]
    );
    
    if (duplicateResult.rows.length > 0) {
      return res.status(400).json({ error: "Category name already exists" });
    }
    
    // Update the category
    const updateResult = await pool.query(
      'UPDATE category SET category_name = $1, description = $2 WHERE category_id = $3 RETURNING *',
      [category_name, description || null, req.params.id]
    );
    
    res.json(updateResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    // Check if there are products using this category
    const productResult = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
      [req.params.id]
    );
    
    if (parseInt(productResult.rows[0].count) > 0) {
      return res.status(400).json({
        error: "Cannot delete category because it has associated products"
      });
    }
    
    // Delete the category
    const deleteResult = await pool.query(
      'DELETE FROM category WHERE category_id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json({ deleted: true, changes: deleteResult.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;