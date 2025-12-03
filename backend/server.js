// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const FAKE_STORE_API = process.env.FAKE_STORE_API || 'https://fakestoreapi.com';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

const dataPath = path.join(__dirname, 'data.json');

let productsCache = null;
let carts = {};
let users = [];

// To load data from data.json
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(raw);
      carts = data.carts || {};
      productsCache = data.products || null;
      users = data.users || [];
      console.log('Loaded persisted data from', DATA_FILE);
    } else {
      persistData();
    }
  } catch (err) {
    console.error('Failed to load data.json', err.message);
  }
};

// Save Data
const persistData = () => {
  try {
    const data = { carts, products: productsCache, users };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist data.json', err.message);
  }
};

loadData();

// Product Prices
function makeOffersForProduct(product) {
  const base = Number(product.price) || 0;
  const idNum = Number(product.id) || 0;
  const amazonModifier = 0.97 + ((idNum % 5) * 0.003);
  const ebayModifier = 0.92 + ((idNum % 7) * 0.004);

  const amazonPrice = Number((base * amazonModifier).toFixed(2));
  const ebayPrice = Number((base * ebayModifier).toFixed(2));

  return [
    {
      vendor: 'amazon',
      price: amazonPrice,
      vendorUrl: `${FAKE_STORE_API}/products/${product.id}?vendor=amazon`,
      shipping: amazonPrice > 50 ? 'Free' : '$4.99',
      condition: 'new',
      sellerRating: 4.6,
    },
    {
      vendor: 'ebay',
      price: ebayPrice,
      vendorUrl: `${FAKE_STORE_API}/products/${product.id}?vendor=ebay`,
      shipping: ebayPrice > 40 ? 'Free' : '$5.99',
      condition: 'used - like new',
      sellerRating: 4.2,
    },
  ];
}

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const existing = users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const id = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const newUser = { id, email: String(email).toLowerCase(), name: name || '', passwordHash };

    users.push(newUser);
    // Creates empty cart for new user
    if (!carts[id]) carts[id] = { items: [] };

    persistData();

    // If there is no password
    res.json({ id: newUser.id, email: newUser.email, name: newUser.name });
  } catch (err) {
    console.error('/auth/signup error', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error('/auth/login error', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// To get products
app.get('/products', async (req, res) => {
  try {
    if (!productsCache) {
      const resp = await axios.get(`${FAKE_STORE_API}/products`);
      productsCache = resp.data;
      persistData();
    }
    const enriched = (productsCache || []).map((p) => {
      const offers = makeOffersForProduct(p);
      const cheapest = Math.min(...offers.map((o) => o.price));
      return {
        id: p.id,
        title: p.title,
        image: p.image,
        category: p.category,
        basePrice: p.price,
        cheapestOffer: cheapest,
        offerCount: offers.length,
      };
    });
    res.json(enriched);
  } catch (err) {
    console.error('GET /products error', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// gets a specific product
app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    let prod = null;
    if (productsCache) {
      prod = productsCache.find((x) => String(x.id) === String(id));
    }
    if (!prod) {
      const resp = await axios.get(`${FAKE_STORE_API}/products/${id}`);
      prod = resp.data;
    }
    const offers = makeOffersForProduct(prod);
    res.json({ ...prod, offers });
  } catch (err) {
    console.error('GET /products/:id error', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// fetches categories from the api
app.get('/categories', async (req, res) => {
  try {
    const resp = await axios.get(`${FAKE_STORE_API}/products/categories`);
    res.json(resp.data);
  } catch (err) {
    console.error('GET /categories error', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// fetches products from a specific category
app.get('/products/category/:cat', async (req, res) => {
  const cat = req.params.cat;
  try {
    const resp = await axios.get(`${FAKE_STORE_API}/products/category/${encodeURIComponent(cat)}`);
    const enriched = (resp.data || []).map((p) => {
      const offers = makeOffersForProduct(p);
      const cheapest = Math.min(...offers.map((o) => o.price));
      return {
        id: p.id,
        title: p.title,
        image: p.image,
        category: p.category,
        basePrice: p.price,
        cheapestOffer: cheapest,
        offerCount: offers.length,
      };
    });
    res.json(enriched);
  } catch (err) {
    console.error('GET /products/category error', err.message);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// gets user
app.get('/users/:id', (req, res) => {
  const userId = req.params.id; // ✅ don't parseInt
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read user data' });

    try {
      const fileData = JSON.parse(data);
      const usersFromFile = fileData.users || [];
      
      console.log("📌 Looking for user:", userId); // ✅ add this log

      const user = usersFromFile.find(u => String(u.id) === String(userId));

      if (!user) {
        console.log("❌ User not found in data.json");
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid user data format' });
    }
  });
});

// updates user's dp
app.put('/users/:id', (req, res) => {
  const userId = req.params.id; // ✅ use string
  const { profilePic } = req.body;

  if (!profilePic) {
    return res.status(400).json({ error: 'profilePic is required in body' });
  }

  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read user data' });

    try {
      const fileData = JSON.parse(data);
      const usersFromFile = fileData.users || [];
      const userIndex = usersFromFile.findIndex(u => String(u.id) === String(userId));

      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      usersFromFile[userIndex].profilePic = profilePic;

      fileData.users = usersFromFile;
      fs.writeFile(dataPath, JSON.stringify(fileData, null, 2), (writeErr) => {
        if (writeErr) return res.status(500).json({ error: 'Failed to save updated user data' });

        const { password, ...safeUser } = usersFromFile[userIndex];
        res.json({ success: true, user: safeUser });
      });
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in data file' });
    }
  });
});

// gets user's cart
app.get('/cart/:userId', async (req, res) => {
  const userId = req.params.userId;
  const cart = carts[userId] || { items: [] };
  res.json(cart);
});

// increases or decreases items in the cart
app.post('/cart/add', async (req, res) => {
  const { userId, product, quantity = 1, vendor, offerPrice } = req.body;
  if (!userId || !product || !product.id || !vendor || typeof offerPrice === 'undefined') {
    return res.status(400).json({ error: 'Missing userId, product, vendor or offerPrice' });
  }

  if (!carts[userId]) carts[userId] = { items: [] };

  const existingIndex = carts[userId].items.findIndex(
    (it) =>
      String(it.product.id) === String(product.id) &&
      String(it.vendor) === String(vendor) &&
      Number(it.offerPrice) === Number(offerPrice)
  );

  if (existingIndex >= 0) {
    carts[userId].items[existingIndex].quantity += quantity;
  } else {
    carts[userId].items.push({ product, quantity, vendor, offerPrice });
  }

  persistData();
  res.json(carts[userId]);
});

// removes items from the cart
app.post('/cart/remove', (req, res) => {
  const { userId, productId, vendor, offerPrice } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'Missing userId or productId' });
  }
  if (!carts[userId]) return res.json({ items: [] });

  carts[userId].items = carts[userId].items.filter((it) => {
    if (String(it.product.id) !== String(productId)) return true;
    if (vendor && String(it.vendor) !== String(vendor)) return true;
    if (typeof offerPrice !== 'undefined' && Number(it.offerPrice) !== Number(offerPrice)) return true;
    return false;
  });

  persistData();
  res.json(carts[userId]);
});

// clear cart
app.post('/cart/clear', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  carts[userId] = { items: [] };
  persistData();
  res.json(carts[userId]);
});

// confirm server is running
app.get('/', (req, res) => {
  res.json({ ok: true, source: 'proxy-server', fakeStore: FAKE_STORE_API });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://10.99.120.246:${PORT}`);
});
