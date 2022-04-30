const express = require('express');
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
//api
app.get('/',(req,res)=>{
    res.send('Running server');
});
app.listen(port,()=>{
    console.log('listening port ',port);
})



