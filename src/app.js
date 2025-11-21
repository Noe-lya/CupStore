import express from "express";
import ProductManager from "./productManager.js";
import CartManager from "./cartManager.js";

const app = express();
app.use(express.json()); //habilito poder recibir data en formato json
const productManager = new ProductManager("./src/products.json");
const cartManager = new CartManager("./src/carts.json", "./src/products.json");
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Cup Store" });
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res
      .status(200)
      .json({ message: "Lista de productos", productos: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    await productManager.deleteProductById(pid);
    const products = await productManager.getProducts();
    res.status(200).json({
      message: `Producto con id: ${pid} eliminado`,
      productos: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const newProduct = req.body; //se envia informacion del producto en el body
    const products = await productManager.addProduct(newProduct);
    res.status(201).json({ message: "Producto agregado", productos: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const updates = req.body;
    const products = await productManager.setProductById(pid, updates);
    res.status(200).json({
      message: `Producto con id: ${pid} actualizado`,
      productos: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/carts", async (req, res) => {
  try {
    const carts = await cartManager.getCarts();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/carts/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const carts = await cartManager.readCarts();
    const cart = carts.find((c) => c.id === cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/carts", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/carts/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const updatedCart = await cartManager.addProductToCart(cid, pid);

    res.status(200).json({
      message: `Producto con id: ${pid} agregado al carrito con id: ${cid}`,
      cart: updatedCart,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(8081, () => {
  console.log("Servidor corriendo en el puerto 8081");
});
