-- Schema for E-commerce CRUD application

-- Create Category table
CREATE TABLE IF NOT EXISTS category (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  category_id INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES category(category_id)
);