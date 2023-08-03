import db from "../database/database.connection.js";
import { urlSchema } from "../schemas/url.schema.js";
import { nanoid } from "nanoid";

export async function createShorten(req, res) {
    const { authorization } = req.headers;
    const { url } = req.body;
    const token = authorization?.replace("Bearer ", "");
    if (!token) { return res.status(401).send('Unauthorized') };
    const validation = urlSchema.validate(url, { abortEarly: false });
    if (validation.error) { const errors = validation.error.details.map((detail) => detail.message); return res.status(422).send(errors); };
    try{
        const user = await db.query('SELECT * FROM sessions WHERE "Token"= $1',[token]);
        if(user.rowCount == 0){return res.status(401).send('Unauthorized')};
        const userdata = user.rows[0];
        const shortUrl = nanoid(10);
        await db.query('INSERT INTO urls ("shortURL",url,"visitCount","userID") VALUES($1,$2,$3,$4)',[shortUrl,url,null,userdata.userId]);
        const response = await db.query('SELECT id FROM urls WHERE "shortURL"=$1',[shortUrl]);
        return res.status(201).send({id:response.rows[0].id,shortUrl});
    }
    catch(err){
        return res.status(500).send(err);
    }
}

export async function getShorten(req,res){
    const { id } = req.params;
    const response = await db.query('SELECT id,"shortURL" AS "shortUrl",url FROM urls WHERE id=$1',[id]);
    if(response.rowCount > 0){
        return res.status(200).send(response.rows[0]);
    }
    else{
        return res.sendStatus(404);
    }
}

export async function redirect(req,res){
    const { shortUrl } = req.params;
    const response = await db.query('SELECT url FROM urls WHERE "shortURL"=$1',[shortUrl]);
    if(response.rowCount == 0){return res.sendStatus(404)};
    const url = response.rows[0].url;
    res.send(url);
    ///res.redirect(url);
}