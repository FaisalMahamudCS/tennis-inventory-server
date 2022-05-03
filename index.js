const express = require('express');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const cors=require('cors');
const app=express();
const jwt=require('jsonwebtoken');
require('dotenv').config();
const port=process.env.PORT || 5000;

//middlewares
//cross platform
app.use(cors());
//json response
app.use(express.json());

//mongodb


const { route } = require('express/lib/application');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.ddqy0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try {
        await client.connect();
        //itemcollection
        const itemCollection = client.db("sports-gear-inventory").collection("item");
       app.get('/item',async(req,res)=>{
           const query={};
           const cursor=itemCollection.find(query);
           const item=await cursor.toArray();
           console.log(item);
           res.send(item);
       })
       //all item view
       //add item
       app.post('/item',async(req,res)=>{
           const item=req.body;
           const result=await itemCollection.insertOne(item);
           res.send(result);
       })

       //find item of the single user
       app.get('/myitem',async(req,res)=>{
        const email=req.query.email;
        const query={email:email};
        const cursor=itemCollection.find(query);
        const myitem=await cursor.toArray();
        console.log(myitem);
        res.send(myitem);
    })
//delete item
app.delete('/item/:id', async (req, res) => {
    const id = req.params.id;
     const query = { _id: ObjectId(id) };
     const result = await itemCollection.deleteOne(query);
     res.send(result);
console.log(result);


});


       //single item view
       app.get('/item/:id',async(req,res)=>{
           const id=req.params.id;
           const query={ _id:ObjectId(id)};
           const result =await itemCollection.findOne(query);
           res.send(result);
       })

       //update delivery item on Click
       app.put('/item/:id',async(req,res)=>{
           const id=req.params.id;
          const data=req.body;
           console.log(data)
          //const quantity=data.quantit;
           const filter={
               _id:ObjectId(id)
          };
           const options={upsert:true};
           const updateDoc={
              $set:{
                   quantity:data.quantities
              },
              

           };
           const resultQuantity=await itemCollection.updateOne(filter,updateDoc,options);
           res.send({resultQuantity:'success'});
           console.log(resultQuantity)
       })

       //get auth token
       app.post('/login',async(req,res)=>{
           const user=req.body;
           const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
               expiresIn:'1d'
           });
           res.send({accessToken});
       })

app.get('/category',async(req,res)=>{
 
    const cat=[
        {
            $group:{_id:{category:"$category",image:"$image"},total:{$sum:"$quantity"}}
        }
    ]
    const result=await itemCollection.aggregate(cat).toArray();
 console.log(result);
    res.send(result);


});
//update restock
app.put('/restock/:id',async(req,res)=>{
    const id=req.params.id;
   const data=req.body;
    console.log(data)
   //const quantity=data.quantit;
    const filter={
        _id:ObjectId(id)
   };
    const options={upsert:true};
    const updateDoc={
       $set:{
            quantity:data.restock
       },
       

    };
    const resultQuantity=await itemCollection.updateOne(filter,updateDoc,options);
    res.send({resultQuantity:'success'});
    console.log(resultQuantity)
})



    }
    finally{

    }
    
   
}
run().catch(console.dir);

// client.connect(err => {
//   const itemCollection = client.db("sports-gear-inventory").collection("item");
//  console.log('connected to db')
//   // perform actions on the collection object
// //  client.close();
// });


//api
app.get('/',(req,res)=>{
    res.send('Running server');
});
app.listen(port,()=>{
    console.log('listening port ',port);
})



