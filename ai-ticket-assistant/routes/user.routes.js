import express from 'express';
import {auth} from '../middlewares/auth.middleware.js';
import { getusers, login, logout, Signup, updateuser } from '../controllers/user.controller.js';
const router  = express.Router();

router.post('/signup',Signup)
router.post('/login',login)

router.post('/logout',auth,logout);
router.put('/update-user',auth,updateuser)
router.get('/users',auth,getusers)



export default router;