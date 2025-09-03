const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Register routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Serve HTML pages
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/categories', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'categories.html'));
});

app.get('/products', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

// Handle 404
app.use((_, res) => {
  res.status(404).send('Page not found');
});

// Handle errors
app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).send('Server error: ' + err.message);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});