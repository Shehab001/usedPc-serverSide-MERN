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

    app.get("/allcategory", async (req, res) => {
      const query = {};
      const category = await allcategory.find(query).toArray();
      res.send(category);
    });

    app.get("/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);

      res.send(id);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Used-pc server is running");
});

app.listen(port, () => console.log(`used-laptop running on ${port}`));
