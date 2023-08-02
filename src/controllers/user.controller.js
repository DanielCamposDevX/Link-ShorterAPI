import { signupSchema } from "../schemas/user.schema.js";
import db from "../database/database.connection.js";


export async function signup(req, res) {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) { return res.send('Passwords dont match').status(403) };
    if (!name || !email || !password || !confirmPassword) { return res.send('Fill all informations').status(403) };
    
    const validation = signupSchema.validate({ name, email, password }, { abortEarly: False });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try{
        const exist = await db.query('SELECT * FROM users WHERE email= $1',[email]);
        if(exist.rows.length === 0){ return res.send("Email Already Exists").status(409)};

        await db.query('INSERT INTO users (email,username,password) VALUES($1,$2,$3)',[email,name,password]);
    }
    catch(err){
        return res.send(err).status(500)
    }

}