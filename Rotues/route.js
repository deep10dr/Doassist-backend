const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");
const transcription_data = require('../transcription.json');
const Signup = require('../model/signModel');
// Serve transcription results
router.get("/result",  (req, res) => {
        res.json(transcription_data);
    
});
router.post('/signup', async (req,res)=>{
    try {
        const {name,email,password,diseases} = req.body;
        const user = await Signup.findOne({email});
        if(!user){
          const savedData = new Signup({
            name,email,password,diseases
          })
        await savedData.save();

           return res.status(200).send('ok')
        }
        else{
            return res.send('found');
        }
        
    } catch (error) {
        console.log(error);
         res.send('not');
    }
     
})
router.post('/login', async (req,res)=>{
    try {
        const {email,password}  =req.body;
        const user = await Signup.findOne({email});
        if(user){
            if(user.password === password){
            res.status(200).json({message:'ok',email:user.email,name:user.name});
            console.log(user);
         }
        
            else{
                res.send('incorrect');
            }
        }
        else{
            res.send('not');
        }
        
        
    } catch (error) {
         res.send('not');
    }
     
})

module.exports = router;