import express from "express";
import CartManager from "../cartManager.js";
import ProductManager from "../productManager.js";

const cartRouter = express.Router();
const cm = new CartManager("./src/data/carts.json", "./src/data/products.json");
const pm = new ProductManager("./src/data/products.json");

// Obtener carrito con productos "populados"
cartRouter.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cm.getCartById(cid);

    // Simular populate: reemplazar IDs por objetos completos
    const populatedProducts = [];
    for (const item of cart.products) {
      const product = await pm.getProductById(item.product);
      if (product) {
        populatedProducts.push({ ...item, product }); // ahora 'product' es el objeto completo
      }
    }

    res.json({
      status: "success",
      payload: { ...cart, products: populatedProducts },
    });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

// Crear carrito
cartRouter.post("/", async (req, res) => {
  try {
    const newCart = await cm.createCart();
    res.status(201).json({ status: "success", payload: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Agregar producto a carrito (ya lo tenías, pero lo dejamos)
cartRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cm.addProductToCart(cid, pid);
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

//Eliminar un producto del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const carts = await cm.readCarts();
    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    carts[cartIndex].products = carts[cartIndex].products.filter(
      (p) => p.product !== pid
    );
    await cm.writeCarts(carts);
    res.json({ status: "success", message: "Producto eliminado del carrito" });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

//Reemplazar todos los productos del carrito
cartRouter.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // [{ product: "id1", quantity: 2 }, ...]

    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: "error",
        error: "El cuerpo debe contener un arreglo 'products'",
      });
    }

    // Validar que todos los productos existan
    const allProducts = await pm.getProducts();
    const productIds = allProducts.map((p) => p.id);
    for (const item of products) {
      if (!productIds.includes(item.product)) {
        return res.status(400).json({
          status: "error",
          error: `Producto ${item.product} no existe`,
        });
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return res
          .status(400)
          .json({ status: "error", error: "Cantidad inválida" });
      }
    }

    const carts = await cm.readCarts();
    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    carts[cartIndex].products = products;
    await cm.writeCarts(carts);
    res.json({ status: "success", payload: carts[cartIndex] });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

//Actualizar cantidad de un producto específico
cartRouter.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        status: "error",
        error: "Cantidad debe ser un número positivo",
      });
    }

    const carts = await cm.readCarts();
    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    const productIndex = carts[cartIndex].products.findIndex(
      (p) => p.product === pid
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ status: "error", error: "Producto no está en el carrito" });
    }

    carts[cartIndex].products[productIndex].quantity = quantity;
    await cm.writeCarts(carts);
    res.json({ status: "success", payload: carts[cartIndex] });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

// Vaciar carrito
cartRouter.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const carts = await cm.readCarts();
    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) throw new Error("Carrito no encontrado");

    carts[cartIndex].products = [];
    await cm.writeCarts(carts);
    res.json({ status: "success", message: "Carrito vaciado" });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

export default cartRouter;
