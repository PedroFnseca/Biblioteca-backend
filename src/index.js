import { config } from "dotenv";
import express from "express";
import routes from "./routes.js";
import cors from "cors";
import logger from "./utils/Logger.js";

config(); // Carrega as variáveis de ambiente do .env

const api = express();
const port = process.env.PORT || 3333;

api.use(logger)
api.use(cors());
api.use(express.json());

api.use("/", routes);

api.listen(port, () => {
  console.log(`server is running in ${port}`);
});
