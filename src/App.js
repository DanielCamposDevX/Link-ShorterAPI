import express from "express";
import cors from "cors";
import router from "./routes/index.routes.js";
import { sessionHandler } from "./controllers/user.controller.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

setInterval(sessionHandler,600000);


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})