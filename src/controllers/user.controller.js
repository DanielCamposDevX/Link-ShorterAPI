import { signupSchema } from "../schemas/user.schema.js";
import db from "../database/database.connection.js";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

export async function signup(req, res) {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.send('Passwords dont match').status(403);
    }

    const validation = signupSchema.validate({ name, email, password }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const exist = await db.query('SELECT * FROM users WHERE email= $1', [email]);
        if (exist.rowCount > 0) { return res.status(409).send("Email Already Exists"); };
        const exist2 = await db.query('SELECT * FROM users WHERE username= $1', [name]);
        if (exist2.rowCount > 0) { return res.status(409).send("Username Already Exists"); };
        const cryptpass = bcrypt.hashSync(password, 10);
        await db.query('INSERT INTO users (email,username,password) VALUES($1,$2,$3)', [email, name, cryptpass]);
        return res.sendStatus(201);
    }
    catch (err) {
        return res.send('servererror').status(500)
    }

}