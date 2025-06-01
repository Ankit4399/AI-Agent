import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js"
import {inngest} from "../inngest/client.js"

export const Signup = async (req,res) =>{
    try {
        const {email,password,skills = []} = req.body;
        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({email,password : hashed,skills}).select("-password")
    
        //fire inngest  event
        await inngest.send({
            name : "user/signup",
            data : {email}
        });
    
        const token = jwt.sign({
            _id : user._id,
            role : user.role,
        },process.env.JWT_SECRET)

        res.json({user,token})

    } catch (error) {
        res.status(500).json({error : "Signup Failed", details : error.message})
    }
};

export const login = async (req,res)=>{
    const {email,password}  = req.body;
    try {
        const user = await User.findOne({email}).select("-password");
        if(!user){
           res.status(401).json({error : "user not found"})
        }
        const ispasswordCorect = await bcrypt.compare(password,user.password)
        if(!ispasswordCorect){
            return res.status(401).json({error : "Invalid credentials"})
        }
        const token = jwt.sign({
            _id : user._id,
            role : user.role,
        },process.env.JWT_SECRET)

        res.json({user,token})

    } catch (error) {
        res.status(500).json({error : "Login Failed", details : error.message})
    }
};

export const logout = async (req,res)=>{
    try {
        const token = req.headers.Authorization?.split(" ")[1];
    if(!token){
        res.status(401).json({error : "Unauthorized"})
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err) return res.status(401).json({error : "Unauthorized"})
    })
    res.json({message : "Logout successfully"})
    } catch (error) {
        res.status(500).json({error : "logout Failed", details : error.message})
    }
}

export const updateuser =  async(req,res)=>{
    const {skills : [] ,email, role} = req.body;
    if(req.user?.role !== "admin"){
        res.status(403).json({error : "Forbidden"});
    }
   try {
     const user = await User.findOne({email});
     if(!user){
         res.status(401).json({error : "user not found"})
     }
     await user.updateOne(
         {email},
         {skills : skills.Length ? skills : user.skills},
         {role}
     )
     return res.status(201).json({message : "user updated successfully"})
   } catch (error) {
    res.status(500).json({error : "update failed"})
   }
}

export const getusers =  async(req,res)=>{
    try {
        if(req.user?.role !== "admin"){
             return res.status(403).json({error : "Forbidden"});
        }
        const users = await User.find().select("-password");
        return res.json({users});

    } catch (error) {
        res.status(500).json({error : "getusers failed"})
    }
}