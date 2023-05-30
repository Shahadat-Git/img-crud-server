const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const dbOptions = {
    useNewUrlParser: true,
    autoIndex: false,
    poolSize: 5,
    connectTimeoutMS: 10000,
    family: 4,
    useUnifiedTopology: true
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@simple-crud-server.g8zjk15.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("itemsDB");
        const itemsCollection = database.collection("itemsCollection");

        app.get('/items', async (req, res) => {
            const cursor = itemsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)

            const query = { _id: new ObjectId(id) };
            const result = await itemsCollection.findOne(query);
            res.send(result);
        })

        app.post('/items', async (req, res) => {
            console.log(req.body)
            const item = req.body;

            const result = await itemsCollection.insertOne(item)

            res.send(result)
        })

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const item = req.body;
            console.log("update this", id)

            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: item.name,
                    link: item.link,
                },
            };
            const result = await itemsCollection.updateOne(query, updateDoc, options);

            res.send(result);

        })

        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            console.log("delete form db", id)
            const query = { _id: new ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);

            res.send(result)
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
});


app.listen(port, () => {
    console.log(`server running on port : ${port}`)
})