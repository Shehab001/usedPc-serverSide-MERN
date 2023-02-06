const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ConnectionClosedEvent,
} = require("mongodb");
const query = require("express/lib/middleware/query");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();
const stripe = require("stripe")(
  "sk_test_51LVKw8GSGClrvX9q7T97oJnASQEho0USM91MWBTKyIQj8sJMyqBUTjtzwvHZxgI5UQThfQ365RaTYwsHBJb9c17L00ilwp1Ynb"
);

// app.post("/create-payment-intent", async (req, res) => {
//   const booking = req.body;
//   const price = booking.price;
//   const amount = price * 100;

//   // Create a PaymentIntent with the order amount and currency
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amount,
//     currency: "usd",
//     payment_methods_type: ["card"],
//   });

//   res.send({
//     clientSecret: paymentIntent.client_secret,
//   });
// });

//used-pc
//S7LWJAfdHcg_Qup

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://used-pc:S7LWJAfdHcg_Qup@cluster0.8lf54jt.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//console.log(client);

async function run() {
  try {
    const allcategory = client.db("used-pc").collection("category");
    const productdetails = client.db("used-pc").collection("product");
    const order = client.db("used-pc").collection("order");
    const user = client.db("used-pc").collection("user");
    const payment = client.db("used-pc").collection("payment");

    function jwtVerify(req, res, next) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(401).send({ message: "Unauthorized" });
      }
      // verify a token symmetric
      jwt.verify(token, "SECRET", function (err, decoded) {
        if (err) {
          res.status(401).send({ message: "Unauthorized" });
        }
        req.decoded = decoded;
        next();
      });
      // console.log(token);
    }
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;
      //console.log(amount);
      //console.log(price);
      if (price === undefined) {
        return;
      }
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.get("/allcategory", jwtVerify, async (req, res) => {
      //console.log(req.headers.authorization);
      /*const decoded = req.decoded;

      if (decoded.email != req.query.email) {
        res.status(401).send({ message: "Unauthorized" });
      }
      */
      //console.log(decoded);
      const query = {};
      const category = await allcategory.find(query).toArray();
      res.send(category);
    });

    app.get("/productdetails/:id", async (req, res) => {
      let name = req.params.id;

      if (name[0] == "d") {
        name = "D" + name.substring(1);
      } else if (name[0] == "a") {
        name = "A" + name.substring(1);
      } else if (name[0] == "h") {
        name = "H" + name.substring(1);
      }

      const query = { name: name };
      // console.log(query);
      const product = await productdetails
        .find({
          $and: [
            { name: name },
            { left: { $gt: 0 } },
            { verify: { $eq: "yes" } },
          ],
        })
        .toArray();
      //const product = await productdetails.find(query).toArray();
      res.send(product);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "SECRET", { expiresIn: 50000 });
      // console.log(token);
      res.send({ token });
    });

    app.post("/order", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await order.insertOne(data);

      // const result = await order.deleteMany(query);
      const result1 = productdetails.updateOne(
        {
          pname: data.itemname,
        },
        {
          $inc: {
            left: -1,
          },
        }
      );
      //console.log(result1);
      res.send(result);
    });

    app.get("/showadvertise", async (req, res) => {
      // const query = { advertise: "Yes" };
      const query = {
        $and: [
          {
            left: {
              $gt: 0,
            },
            advertise: "Yes",
          },
        ],
      };
      const product = await productdetails.find(query).toArray();

      res.send(product);
      console.log(product);
    });

    app.post("/saveuser", async (req, res) => {
      const data = req.body;
      // console.log(data.email);
      const query = { name: data.email };
      const update = { $set: data };
      const options = { upsert: true };
      const result = await user.updateOne(query, update, options);

      // const result = await user.insertOne(data);
      res.send(result);
    });

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const query = { uid: id };
      const usr = await user.find(query).toArray();
      res.send(usr);
    });

    app.get("/myorder/:id", async (req, res) => {
      const email = req.params.id;
      //console.log(email);
      const query = { useremail: email };
      const result = await order.find(query).toArray();
      res.send(result);
    });
    app.post("/payment", async (req, res) => {
      const info = req.body;
      console.log(info);
      const query = {
        _id: ObjectId(info.id),
      };
      const update = { $set: info };
      const options = { upsert: true };
      const result = await order.updateOne(query, update, options);
      res.send(result);
    });

    app.post("/updatepayment", async (req, res) => {
      const info = req.body;
      //console.log(info);
      const query = {
        $and: [{ itemname: info.itemname }, { useremail: info.useremail }],
      };
      const update = { $set: { status: "paid" } };
      const options = { upsert: true };
      const result = await order.updateOne(query, update, options);
      res.send(result);
    });
    app.get("/sellerproduct/:id", async (req, res) => {
      const email = req.params.id;
      //console.log(email);
      const query = { email: email };
      const result = await productdetails.find(query).toArray();
      res.send(result);
    });
    app.post("/addproduct", async (req, res) => {
      const data = req.body;
      //console.log(data);
      const result = await productdetails.insertOne(data);
      res.send(result);
    });

    app.get("/sadvertise/:id", async (req, res) => {
      const id = req.params.id;
      console.log("sadvertise", id);
      const query = { _id: ObjectId(id) };
      const update = { $set: { advertise: "Yes" } };
      const options = { upsert: true };
      const result = await productdetails.updateOne(query, update, options);
      res.send(result);
    });
    app.get("/deleteproduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await productdetails.deleteOne(query);
      res.send(result);
    });
    app.get("/admin", async (req, res) => {
      // console.log("hlw");
      const query = {};
      const result = await user.find(query).toArray();
      res.send(result);
    });
    app.get("/deleteuserr/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await user.deleteOne(query);
      res.send(result);
    });
    app.get("/allproduct", async (req, res) => {
      const query = {};
      const result = await productdetails.find(query).toArray();
      res.send(result);
    });
    app.get("/verify/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const update = { $set: { verify: "yes" } };
      const options = { upsert: true };
      const result = await productdetails.updateOne(query, update, options);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Used-pc server is running");
});

//others stripe method
// app.post("/paymentstripe", async (req, res) => {
//   let status, error;

//   const { token, amount } = req.body;
//   console.log(token.id, amount);
//   try {
//     await stripe.charges.create({
//       source: token.id,
//       amount,
//       currency: "usd",
//     });
//     status = "success";
//   } catch (err) {
//     console.log(err);
//     status = "200";
//   }
//   res.send(status);
// });

app.listen(port, () => console.log(`used-laptop running on ${port}`));
