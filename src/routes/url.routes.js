import { Router } from "express";
import { DeleteShort, createShorten, getShorten, redirect } from "../controllers/url.controller.js";

const urlRoutes = Router();

urlRoutes.post('/urls/shorten',createShorten);
urlRoutes.get('/urls/:id',getShorten);
urlRoutes.get('/urls/open/:shortUrl',redirect);
urlRoutes.delete('/urls/:id',DeleteShort)


export default urlRoutes;