const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.38uxi.mongodb.net/creativeAgency?retryWrites=true&w=majority`;

const port = 5000

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('addService'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send("hello from creative agency")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const serviceCollection = client.db("creativeAgency").collection("services");
  const adminCollection = client.db("creativeAgency").collection("admins");

  // adding ADMIN
  app.post('/addAdmin', (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0);
      })
  })

  // adding ORDER
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //loading ORDER
  app.get('/loadOrder', (req, res) => {
    const email = req.body.email;

    // adminCollection.find({ email: req.body.email })
    // .toArray((err, admins) => {
    //   const filter = {};
    //   if(admins.length === 0){
    //     filter.email = email;
    //   }
    //   ordersCollection.find(filter)
    //   .toArray((err, documents) => {
    //     res.send(documents)
    //   })

    // })

    ordersCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })



  // adding REVIEW
  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // loading review
  app.get('/loadReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/loadService', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // adding service by ADMIN
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    console.log(title, description, file);

    const filePath = `${__dirname}/addService/${file.name}`;
    file.mv(filePath, err => {
      if (err) {
        console.log(err);
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      var img = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      }

      serviceCollection.insertOne({ title, description, img })
        .then(result => {
          fs.remove(filePath, error => {
            if(error) { 
              console.log(error);
              res.status(500).send({ msg: 'failed to upload image' });
            }
            res.send(result.insertedCount > 0);
          })
        })
      // return res.send({name: file.name, path: `${file.name}`})
    })
  })

  app.get('/loadAllOrder', (req, res) => {
    ordersCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

});

app.listen(process.env.PORT || port)