import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import {engine} from "express-handlebars";
import productsRouter from "./routes/products.router.js";
import viewsRouter from "./routes/views.router.js";
import cartRouter from "./routes/cart.router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

//habilitamos la carpeta public para archivos estaticos
app.use(express.static(path.join(__dirname, "..", "public")));
//habilitamos poder recibir data desde formularios y JSON
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//handlebars config
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: (a, b) => a === b,
    },
  }),
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

//endpoints
app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

// En Vercel el archivo api/index.js importa `app` y lo usa como handler;
// localmente (o en un host tradicional) levantamos el servidor normalmente.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

export default app;
