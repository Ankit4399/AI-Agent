import express from 'express'
import { getusers, login, logout, Signup, updateuser } from '../controllers/user.controller';
const router  = express.Router();

router.post('/signup',Signup)
router.post('/login',login)

router.post('/logout',auth,logout);
router.put('/update-user',auth,updateuser)
router.get('/users',auth,getusers)



export default router;