-- Sample data for E-commerce CRUD application

-- Insert sample categories
INSERT INTO category (category_name, description) 
VALUES ('Electronics', 'Gadgets, computers, and related accessories.');

INSERT INTO category (category_name, description) 
VALUES ('Apparel', 'Clothing, shoes, and fashion accessories.');

INSERT INTO category (category_name, description) 
VALUES ('Books', 'Fiction, non-fiction, and educational materials.');

-- Insert sample products
INSERT INTO products (product_name, category_id, price, stock) 
VALUES ('Laptop X1', 1, 1200.00, 15);

INSERT INTO products (product_name, category_id, price, stock) 
VALUES ('Smartphone Y2', 1, 699.99, 30);

INSERT INTO products (product_name, category_id, price, stock) 
VALUES ('T-Shirt Basic', 2, 25.99, 150);

INSERT INTO products (product_name, category_id, price, stock) 
VALUES ('Jeans Classic', 2, 59.99, 75);

INSERT INTO products (product_name, category_id, price, stock) 
VALUES ('The Great Novel', 3, 19.50, 80);