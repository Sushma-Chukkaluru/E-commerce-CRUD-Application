# E-commerce CRUD Application

A web application for managing categories and products with Excel file upload and basic CRUD functionality.

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript

## Features

- Category management (Create, Read, Update, Delete)
- Product management (Create, Read, Update, Delete)
- Excel file upload for batch product import
- Data validation
- Responsive design

## Requirements

- Node.js (v12 or higher)
- NPM (v6 or higher)
- PostgreSQL (v10 or higher)

## Setup Instructions

1. Clone the repository
   ```
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Database Setup
   The application uses PostgreSQL. Make sure you have a PostgreSQL server running with these parameters:
   - Host: localhost
   - User: postgres
   - Password: postgres
   - Database: postgres
   - Port: 5432

4. Make sure uploads directory exists
   ```
   mkdir -p uploads
   ```

5. Start the application
   ```
   npm start
   ```

6. The application will run on http://localhost:3000

## Testing the Database and API

1. Run the test script to verify database connectivity:
   ```
   node test-api.js
   ```

2. Create a sample Excel file for testing uploads:
   ```
   node create-sample-excel.js
   ```
   This will create a file called `sample-products.xlsx` in your project directory.

## API Endpoints

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a specific category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get a specific product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Excel Upload

- `POST /api/upload` - Upload an Excel file with product data

## Postman Collection

A Postman collection is included in the repository: `ecommerce-api.postman_collection.json`. You can import this into Postman to test all the API endpoints.

## Excel File Format for Upload

The Excel file must have a sheet named "Products" with the following columns:
- `product_name` (e.g., "Laptop")
- `category_name` (e.g., "Electronics", must exist in Category table)
- `price` (e.g., 999.99)
- `stock` (e.g., 50)

Example for Excel file data format:

| product_name | category_name | price | stock |
|--------------|--------------|-------|-------|
| Gaming Laptop | Electronics | 1499.99 | 10 |
| Wireless Mouse | Electronics | 29.99 | 50 |

## Important Notes

1. Ensure your Excel file columns match exactly (no trailing spaces)
2. The category names in your Excel file must match exactly with categories in the database
3. Prices must be greater than 0
4. Stock values must be 0 or greater

## Troubleshooting

If you encounter any issues with the API endpoints, try:

1. Check the server logs for any error messages
2. Verify your PostgreSQL database is running
3. Run the test script to verify database connectivity
4. Make sure your category names in Excel upload match exactly with the categories in the database
5. Use the `sample-products.xlsx` file to test uploads

## Limitations

- No user authentication/authorization
- No image upload functionality for products
- Limited error handling for network issues
- No pagination for large data sets