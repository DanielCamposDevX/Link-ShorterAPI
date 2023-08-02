import { Router } from "express";
import { signin, signup } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.post('/signup',signup)
userRoutes.post('/signin',signin)




export default userRoutes;