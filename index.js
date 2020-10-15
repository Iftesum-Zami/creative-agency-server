const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.38uxi.mongodb.net/creativeAgency?retryWrites=true&w=majority`;

const port = 5000

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send("hello from doctors portal")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");

  // adding order
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.get('/loadOrder', (req, res) => {
    ordersCollection.find({email: req.query.email})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  // adding review
  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.get('/loadReview', (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

});

app.listen(process.env.PORT || port)