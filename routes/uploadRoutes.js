const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { pool } = require('../database');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(_, __, cb) {
    cb(null, 'uploads/');
  },
  filename: function(_, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(_, file, cb) {
    // Only allow xlsx files
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file.originalname.split('.').pop() !== 'xlsx') {
      return cb(new Error('Only .xlsx files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload Excel file and process
router.post('/', upload.single('excel_file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or file type not allowed' });
  }
  
  const filePath = path.join(__dirname, '..', req.file.path);
  console.log('File path:', filePath);
  
  try {
    // Read Excel file with all available options to ensure it's parsed correctly
    const workbook = xlsx.readFile(filePath, {
      type: 'binary',
      cellDates: true
    });
    
    console.log('Excel file read successfully. Sheets:', workbook.SheetNames);
    
    // Check if "Products" sheet exists
    if (!workbook.SheetNames.includes('Products')) {
      console.log('No "Products" sheet found');
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Excel file must contain a sheet named exactly "Products" (case-sensitive)' });
    }
    
    const worksheet = workbook.Sheets['Products'];
    
    if (!worksheet || !worksheet['!ref']) {
      console.log('Products sheet is empty or invalid');
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Products sheet is empty or has invalid structure' });
    }
    
    console.log('Products sheet range:', worksheet['!ref']);
    
    // Try to parse as JSON with column headers
    let productData;
    try {
      productData = xlsx.utils.sheet_to_json(worksheet);
      console.log('Parsed product count:', productData.length);
      console.log('First product (sample):', productData.length > 0 ? JSON.stringify(productData[0]) : 'No products');
    } catch (err) {
      console.log('Error parsing sheet to JSON:', err.message);
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Failed to parse Excel sheet: ' + err.message });
    }
    
    if (!productData || productData.length === 0) {
      console.log('No product data found after parsing');
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No data found in Products sheet' });
    }
    
    // Get all available columns in Excel
    const firstRow = productData[0];
    const availableColumns = Object.keys(firstRow);
    console.log('Available columns in Excel:', availableColumns);
    
    // Create a mapping for column names
    const columnMap = {};
    availableColumns.forEach(col => {
      const colTrimmed = col.trim().toLowerCase();
      columnMap[colTrimmed] = col;
    });
    
    console.log('Column mapping:', columnMap);
    
    // Process and validate the product data
    try {
      const result = await processProducts(productData, columnMap);
      fs.unlinkSync(filePath);
      res.json(result);
    } catch (err) {
      console.error('Error processing products:', err);
      fs.unlinkSync(filePath);
      res.status(400).json({ error: err.message });
    }
    
  } catch (err) {
    console.error('Error processing Excel file:', err);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Error processing Excel file: ' + err.message });
  }
});

// Process and validate products from Excel
async function processProducts(products, columnMap) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const errors = [];
    let processedCount = 0;
    
    // Get all categories
    const categoryResult = await client.query('SELECT * FROM category');
    const categories = categoryResult.rows;
    
    if (categories.length === 0) {
      throw new Error('No categories found in the database. Please add categories first.');
    }
    
    console.log('Available categories:', categories.map(c => c.category_name).join(', '));
    
    // Create a map of category names to IDs (case insensitive)
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.category_name.toLowerCase()] = cat.category_id;
    });
    
    // Check which required columns are available
    const requiredFields = ['product_name', 'category_name', 'price', 'stock'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!columnMap[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required columns: ${missingFields.join(', ')}. Please ensure your Excel has these exact columns (spaces are trimmed).`);
    }
    
    // Column accessor helpers to handle space issues
    const getProductName = product => String(product[columnMap['product_name']] || '').trim();
    const getCategoryName = product => String(product[columnMap['category_name']] || '').trim();
    const getPrice = product => {
      const priceRaw = product[columnMap['price']];
      return typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw).replace(/[^\d.-]/g, '') || '0');
    };
    const getStock = product => {
      const stockRaw = product[columnMap['stock']];
      return typeof stockRaw === 'number' ? stockRaw : parseInt(String(stockRaw).replace(/[^\d-]/g, '') || '0');
    };
    
    // Validate and insert each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const rowNum = i + 2; // Excel rows are 1-based, plus header row
      
      // Extract values
      const productName = getProductName(product);
      const categoryName = getCategoryName(product);
      const price = getPrice(product);
      const stock = getStock(product);
      
      console.log(`Processing row ${rowNum}: name=${productName}, category=${categoryName}, price=${price}, stock=${stock}`);
      
      // Check required fields
      if (!productName || !categoryName) {
        errors.push(`Row ${rowNum}: Missing product_name or category_name`);
        continue;
      }
      
      // Validate price
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Price must be a number greater than 0`);
        continue;
      }
      
      // Validate stock
      if (isNaN(stock) || stock < 0) {
        errors.push(`Row ${rowNum}: Stock must be a number greater than or equal to 0`);
        continue;
      }
      
      // Check if category exists (case insensitive)
      const categoryNameLower = categoryName.toLowerCase();
      if (!categoryMap[categoryNameLower]) {
        errors.push(`Row ${rowNum}: Category "${categoryName}" does not exist. Available categories: ${categories.map(c => c.category_name).join(', ')}`);
        continue;
      }
      
      // All validations passed, insert the product
      const categoryId = categoryMap[categoryNameLower];
      
      try {
        console.log(`Inserting: ${productName}, category_id: ${categoryId}, price: ${price}, stock: ${stock}`);
        
        await client.query(
          'INSERT INTO products (product_name, category_id, price, stock) VALUES ($1, $2, $3, $4)',
          [productName, categoryId, price, stock]
        );
        processedCount++;
      } catch (err) {
        console.error('Database error:', err);
        errors.push(`Row ${rowNum}: Database error: ${err.message}`);
      }
    }
    
    console.log(`Processing complete. Processed: ${processedCount}, Errors: ${errors.length}`);
    
    // If there were errors but some products were inserted
    if (errors.length > 0 && processedCount > 0) {
      await client.query('COMMIT');
      throw new Error(`Uploaded ${processedCount} products with ${errors.length} errors: ${errors.join('; ')}`);
    }
    
    // If all products had errors
    if (products.length === errors.length) {
      await client.query('ROLLBACK');
      throw new Error(`No valid products found. Errors: ${errors.join('; ')}`);
    }
    
    // If all products were inserted successfully
    await client.query('COMMIT');
    return { 
      success: true, 
      message: `Successfully uploaded ${processedCount} products` 
    };
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = router;