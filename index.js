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

//varify jWt
function JWTVarification(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'unauthorized access'});
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:'Forbidden access'})
        }
        console.log(decoded)
        req.decoded=decoded;
          next();
    })

    //console.log(authHeader)
  
}

const { route } = require('express/lib/application');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.ddqy0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try {
        await client.connect();
        //itemcollection
        const itemCollection = client.db("sports-gear-inventory").collection("item");
        const categoryCollection = client.db("sports-gear-inventory").collection("category");
   
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
       app.get('/myitem',JWTVarification,async(req,res)=>{
           const decodedEmail=req.decoded.email;
           
           //const authHeader=req.headers.authorization;
           //console.log(authHeader)
        const email=req.query.email;
        if(email===decodedEmail){
        const query={email:email};
        const cursor=itemCollection.find(query);
        const myitem=await cursor.toArray();
        console.log(myitem);
        res.send(myitem);
        }
        else{
            res.status(403).send({message:'forbidden'})
        }
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
                   quantity:data.quantities,
                   sold:data.solds
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
  
    // const cate=[
       
    //     {
            
    //         $lookup:
    //         {


    //             from:'item',
    //             localField:'category',
    //             foreignField:'category',
    //             as:'product'

    //         }
    //     },
    //     {
    //           $unwind:"$product"          
    //     },
    //   {
    //       $project:{
    //           _id:"$category",
    //           photo:"$photo",
    //           total:{$sum:"$item.quantity"}
    //       }
    //   }

            

    //     // {
    //     //     $group:{_id:"$category",quantity:{$sum:"$quantity"}}
    //     // }
        
    //     // ,{$group:{_id:"$category",total:{$sum:"$quantity"}}
    // //},
 

    // ]

    // const cat=[

    //     {
    //         $group:{_id:"$category","price":{"first":"$price"},total:{$sum:"$quantity"}}
    //     }
    // ]
    // categoryCollection.aggregate(cate).toArray(function(err,result){
    //      console.log(result);
    //      res.send(result);
    //  })
    //const query={};
    const cursor=categoryCollection.find();

    
    const category= await cursor.toArray();
    console.log(category);
    res.send(category);



});

app.get('/categorycount',(req,res)=>{
    const cate=[
        {
        $group:{
        _id: {category:'$category',categoryphoto:'$categoryphoto'},
        total: {
          $sum:'$quantity'
        },
        
        }
        
    
         
       
    }  
    ]
  const result=  itemCollection.aggregate(cate)
 result.toArray(function(cursorError,cursorDocs){
     console.log(cursorDocs)
     res.send(cursorDocs);
 })
    // .then(res => {
    //     console.log(res)
    //     res.send(res)
    //   res.forEach(order => console.log(JSON.stringify(order)));
    // }).catch(err => {
    //   console.log("Error: Update unsuccessfull.")
    // }).finally(() => {

    // })
    // return res.send({
    //     data:{
    //         cursor:cursor,
    //     }
    // })
   // res.send(cursor);
    //   itemCollection.aggregate(cate,function(err,result){
    //       console.log(result);
    //       res.send(result);
    //   });
   
    // const result= await resl.toArray();
    //    // console.log(result)
    //     res.send(result)
   
})
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



