import express from "express";
import productManager from "../productManager.js";

const viewsRouter = express.Router();
const pm = new productManager("./src/data/products.json");

viewsRouter.get("/", async (req, res) => {
  try {
    const products = await pm.getProducts();
    res.render("home", { title: "Home Page", products: products });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
viewsRouter.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await pm.getProducts();
    res.render("realTimeProducts", {
      title: "Real Time Products",
      products: products,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default viewsRouter;
