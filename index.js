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
console.log(client);
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
async function run() {
  try {
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Used-pc server is running");
});

app.listen(port, () => console.log(`used-pc running on ${port}`));
