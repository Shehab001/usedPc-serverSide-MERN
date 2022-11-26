const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

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

    app.get("/allcategory", async (req, res) => {
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
      const product = await productdetails.find(query).toArray();
      res.send(product);
    });

    app.post("/order", async (req, res) => {
      const data = req.body;
      //console.log(data);
      const result = await order.insertOne(data);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Used-pc server is running");
});

app.listen(port, () => console.log(`used-laptop running on ${port}`));
