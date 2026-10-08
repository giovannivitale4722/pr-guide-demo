import express from "express";
import { loadConfig } from "./config.js";
import { linksRouter } from "./routes/links.js";

const config = loadConfig();
const app = express();

app.use(express.json());
app.use(linksRouter(config));

app.listen(config.port, () => {
  console.log(`shortlinks listening on ${config.baseUrl}`);
});
