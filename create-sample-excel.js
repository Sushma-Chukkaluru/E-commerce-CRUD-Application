const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create a sample Excel file for testing the upload
function createSampleExcelFile() {
  try {
    console.log('Creating sample Excel file for testing...');

    // Sample data
    const data = [
      {
        product_name: 'Gaming Laptop',
        category_name: 'Electronics',
        price: 1499.99,
        stock: 10
      },
      {
        product_name: 'Wireless Mouse',
        category_name: 'Electronics',
        price: 29.99,
        stock: 50
      },
      {
        product_name: 'Summer T-Shirt',
        category_name: 'Apparel',
        price: 19.99,
        stock: 100
      },
      {
        product_name: 'Programming Book',
        category_name: 'Books',
        price: 39.99,
        stock: 25
      },
      {
        product_name: 'Bluetooth Speaker',
        category_name: 'Electronics',
        price: 89.99,
        stock: 15
      }
    ];

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    // Define the filePath
    const filePath = path.join(__dirname, 'sample-products.xlsx');
    
    // Write to file
    XLSX.writeFile(wb, filePath);
    
    console.log(`Sample Excel file created successfully at: ${filePath}`);
    console.log('You can use this file to test the upload functionality.');
    console.log('The file contains 5 products in 3 different categories.');
    
    return filePath;
  } catch (err) {
    console.error('Error creating sample Excel file:', err);
  }
}

// Create the file
createSampleExcelFile();