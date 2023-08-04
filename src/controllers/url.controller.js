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
        await db.query('INSERT INTO urls ("shortURL",url,"visitCount","userId") VALUES($1,$2,$3,$4)',[shortUrl,url,null,userdata.userId]);
        const response = await db.query('SELECT id FROM urls WHERE "shortURL"=$1',[shortUrl]);
        return res.status(201).send({id:response.rows[0].id,shortUrl});
    }
    catch(err){
        return res.status(500).send(err);
    }
}

export async function getShorten(req,res){
    const { id } = req.params;
    try{
    const response = await db.query('SELECT id,"shortURL" AS "shortUrl",url FROM urls WHERE id=$1',[id]);
    if(response.rowCount > 0){
        return res.status(200).send(response.rows[0]);
    }
    else{
        return res.sendStatus(404);
    }}
    catch(err){
        res.status(500).send(err);
    }
    
}

export async function redirect(req,res){
    try{
    const { shortUrl } = req.params;
    const response = await db.query('SELECT url FROM urls WHERE "shortURL"=$1',[shortUrl]);
    if(response.rowCount == 0){return res.sendStatus(404)};
    const url = response.rows[0].url;
    res.redirect(url);
    }
    catch(err){
        res.status(500).send(err);
    }
}

export async function DeleteShort(req,res){
    const { id } = req.params;
    if(!id){ return res.sendStatus(404)};
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) { return res.status(401).send('Unauthorized') };
    try{
    const response = await db.query('SELECT "userId" FROM sessions WHERE "Token"=$1',[token]);
    if(response.rowCount == 0){ return res.status(401).send('Unauthorized') };
    const userId = response.rows[0].userId;
    const short = await db.query('SELECT "userId" FROM urls WHERE id=$1',[id])
    if(userId != short.rows[0].userId){return res.status(401).send('Unauthorized')};
    await db.query('DELETE FROM urls WHERE id=$1',[id]);
    return res.sendStatus(204);
    }
    catch(err){
        res.status(500).send(err);
    }
}

export async function getRanking(req,res){
    const query = `
    SELECT
    id,
    username AS name,
    "totalVisits" AS "visitCount",
    url_count AS "linksCount"
    FROM
    users
    ORDER BY
    "totalVisits" DESC
    LIMIT 10;
    `

    const ranking = db.query(query);
    return res.send(ranking.rows);
}

export async function getMe(req,res){
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) { return res.status(401).send('Unauthorized') };
    try{
    const response = await db.query('SELECT "userId" FROM sessions WHERE "Token"=$1;',[token]);
    if(response.rowCount == 0){ return res.status(401).send('Unauthorized') };
    const userdata = await db.query('SELECT id,username AS name,"totalVisits" AS "visitCount" FROM users;');
    const data = userdata.rows[0];
    const id = response.rows[0].userId
    const urls = await db.query('SELECT id,"shortURL" AS "shortUrl",url,"visitCount" FROM urls WHERE "userId"=$1',[id]);
    return res.send({data, shortenedUrls:urls.rows});
    }
    catch(err){
        res.status(500).send(err);
    }
}