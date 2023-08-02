import { Router } from "express";
import { signup } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.post('/signup',signup)




export default userRoutes;