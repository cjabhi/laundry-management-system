const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
  res.json({ message: "Backend working ✅" });
});

// Add Customer
app.post('/customers', (req,res)=>{
  const { name, phone, address } = req.body;
  if(!name || !phone) return res.status(400).json({message:"Name & phone required"});

  db.query(
    "INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)",
    [name, phone, address],
    (err,result)=>{
      if(err) return res.status(500).json(err);
      res.json({message:"Customer added", id: result.insertId});
    }
  );
});

// List customers
app.get('/customers',(req,res)=>{
  db.query("SELECT * FROM customers",(err,rows)=>{
    if(err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Create order
app.post('/orders',(req,res)=>{
  const { customer_id, service_name, quantity } = req.body;
  if(quantity<=0){
    return res.status(400).json({message:"Quantity can not be zero or less"});
  }
  if(!customer_id || !service_name || !quantity)
    return res.status(400).json({message:"All fields mandatory"});

  db.query(
    "INSERT INTO orders (customer_id, service_name, quantity) VALUES (?, ?, ?)",
    [customer_id, service_name, quantity],
    (err,result)=>{
      if(err) return res.status(500).json(err);
      res.json({message:"Order created", id: result.insertId});
    }
  );
});

// List orders
app.get('/orders',(req,res)=>{
  const sql = `
    SELECT o.*, c.name AS customer_name
    FROM orders o JOIN customers c ON o.customer_id = c.id
  `;
  db.query(sql,(err,rows)=>{
    if(err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Update status
app.put('/orders/:id',(req,res)=>{
  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [req.body.status, req.params.id],
    (err)=>{
      if(err) return res.status(500).json(err);
      res.json({message:"Status updated"});
    }
  );
});

app.listen(process.env.PORT,()=>{
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
