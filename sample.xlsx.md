# Sample Excel File Structure

This markdown file represents the structure of a sample Excel file for importing products.

## Sheet Name: "Products"

| product_name | category_name | price | stock |
|--------------|--------------|-------|-------|
| Gaming Laptop | Electronics | 1499.99 | 10 |
| Wireless Mouse | Electronics | 29.99 | 50 |
| Bluetooth Speaker | Electronics | 79.99 | 25 |
| Running Shoes | Apparel | 89.99 | 30 |
| Winter Jacket | Apparel | 129.99 | 15 |
| Fitness Tracker | Electronics | 59.99 | 40 |
| Cookbook | Books | 24.99 | 60 |
| Science Fiction Novel | Books | 14.99 | 45 |
| Graphic T-shirt | Apparel | 19.99 | 100 |
| Desk Lamp | Electronics | 34.99 | 20 |

## Notes:
1. The actual file would be a .xlsx file
2. The "category_name" must match an existing category in the database
3. The "price" must be greater than 0
4. The "stock" must be greater than or equal to 0

In a real implementation, you would need to create this file using a library like XLSX, ExcelJS, or a spreadsheet application.