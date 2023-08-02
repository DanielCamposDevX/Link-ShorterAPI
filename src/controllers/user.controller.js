import { signupSchema } from "../schemas/user.schema.js";
import db from "../database/database.connection.js";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

export async function signup(req, res) {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) { return res.send('Passwords dont match').status(403); }
    const validation = signupSchema.validate({ name, email, password }, { abortEarly: false });
    if (validation.error) { const errors = validation.error.details.map((detail) => detail.message); return res.status(422).send(errors); }
    try {
        const exist = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, name]);
        if (exist.rowCount > 0) {
            if (exist.rows[0].email === email) { return res.status(409).send("Email Already Exists"); }
            else { return res.status(409).send("Username Already Exists"); }
        }

        const cryptpass = bcrypt.hashSync(password, 10);
        await db.query('INSERT INTO users (email,username,password) VALUES($1,$2,$3)', [email, name, cryptpass]);
        return res.sendStatus(201);
    }
    catch (err) {
        return res.send('servererror').status(500);
    }
}

export async function signin(req, res) {
    const { email, password } = req.body;
    try {
        const login = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const id = login.rows[0].id;
        if (login.rowCount > 0 && bcrypt.compareSync(password, login.rows[0].password)) {
            const token = uuid();
            await db.query('INSERT INTO sessions ("userId","Token") VALUES($1,$2)', [id, token]);
            return res.status(200).send(token);
        }
        else {
            return res.status(401).send('Wrong email or Password');
        }
    }
    catch (err) {
        return res.status(500).send(err);
    }
}
