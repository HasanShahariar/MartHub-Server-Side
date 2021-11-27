const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');
// var admin = require("firebase-admin");
// const { initializeApp } = require('firebase-admin/app');
require('dotenv').config();
const cors = require('cors')
const port = process.env.PORT || 4000;

//FIREBASE ADMIN INITIALIZATION
// var serviceAccount = require('./fir-authentication-e3422-firebase-adminsdk-9043x-87077f3b85.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

//middleware
app.use(cors());
app.use(express.json());
const ObjectId = require('mongodb').ObjectId;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rroqn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function verifyToken(req, res, next) {
//   console.log("in verificationToken");
//   if (req.headers?.authorization?.startsWith('Bearer ')) {
//     const idToken = req.headers.authorization.split('Bearer ')[1];
//     try {
//       const decodedUser = await admin.auth().verifyIdToken(idToken)
//       req.decodedUserEmail = decodedUser.email;
//     }
//     catch {
//       console.log("decoded user not found");
//     }
//   }


//   next();
// }

async function run() {
  try {
    await client.connect();
    const database = client.db("NicheProducts");
    const usersCollection = database.collection("user");
    const ordersCollection = database.collection("orders");
    const offersCollection = database.collection("offers");
    const reviewCollection = database.collection("review");
    
    const exploreCollection = database.collection("explore");

    //ALL APIS
    
    //BANNER EXPLORE API first 10
    app.get('/explore/id', async (req, res) => {
      const cursor = exploreCollection.find({}).limit(6);
      const explore = await cursor.toArray();
      res.send(explore);
    });
    //BANNER EXPLORE API ALL
    app.get('/explore', async (req, res) => {
      const cursor = exploreCollection.find({});
      const explore = await cursor.toArray();
      res.send(explore);
    });

    //GET REVIEW API
    app.get('/review', async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    // GET USER API 
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
    });
    // GET OFFERS API 
    app.get('/offers', async (req, res) => {
      const cursor = offersCollection.find({});
      const offers = await cursor.toArray();
      res.send(offers);
    });

    // GET ORDERS API
    app.get('/orders', async (req, res) => {
      const email = req.query.email;
    
        const cursor = ordersCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders); 
    });   

    // EXPLORE API WITH ID
    app.get('/explore/:id', async (req, res) => {
      console.log("in explore id");
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      console.log("explore with id");
      const product = await exploreCollection.findOne(query)
      console.log("load user id", id);
      res.send(product)

    });

    // GET ORDER API
    app.get('/orders/:userEmail', async (req, res) => {
      const email = req.params.userEmail;
      // console.log(email);

      const cursor = ordersCollection.find({ email: email });
      const orders = await cursor.toArray();
      res.send(orders);
      // console.log(orders);
    });

    // UPDATE API PUT

    app.put('/order/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Shipped"
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options)
      console.log("update", id);
      res.send(result)
    });


    // USER UPDATE ADMIN API
    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          type: "admin"
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      console.log("update", id);
      res.send(result)
    });

    // User POST API
    app.post('/user', async (req, res) => {
      const newUser = req.body;
      newUser.createdAt = new Date();
      const result = await usersCollection.insertOne(newUser);
      res.json(result);
      console.log(`A user was inserted with the _id: ${result.insertedId}`);
    })
    //  POST API
    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      newOrder.createdAt = new Date();
      console.log(newOrder);
      const result = await ordersCollection.insertOne(newOrder);
      res.json(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    })

    // ADD PRODUCT ADMIN API
    app.post('/explore', async (req, res) => {
      const newProduct = req.body;
      newProduct.createdAt = new Date();
      console.log(newProduct);
      const result = await exploreCollection.insertOne(newProduct);
      res.json(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    })

    //POST REVIEW API
    app.post('/review', async (req, res) => {
      console.log("in post review");
      const newOrder = req.body;
      newOrder.createdAt = new Date();
      console.log(newOrder);
      const result = await reviewCollection.insertOne(newOrder);
      res.json(result);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    })

    // DELETE ORDER 
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query)
      console.log("deleteing", id);
      res.json(result)
    })

    // DELETE PRODUCT 
    app.delete('/explore/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await exploreCollection.deleteOne(query)
      console.log("deleteing", id);
      res.json(result)
    })

    app.get('/', (req, res) => {
      res.send("Running server");
    })
    app.listen(port, () => {
      console.log("Listening to port", port);

    });


  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);









