import { Router } from "express";
import { createShorten, getShorten, redirect } from "../controllers/url.controller.js";

const urlRoutes = Router();

urlRoutes.post('/urls/shorten',createShorten);
urlRoutes.get('/urls/:id',getShorten);
urlRoutes.get('/urls/open/:shortUrl',redirect);


export default urlRoutes;