import fs from "fs/promises";
import crypto from "crypto";

class CartManager {
  constructor(cartsPath, productsPath) {
    this.cartsPath = cartsPath;
    this.productsPath = productsPath;
  }

  generateId() {
    return crypto.randomUUID();
  }

  async readCarts() {
    try {
      const data = await fs.readFile(this.cartsPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.writeFile(this.cartsPath, "[]", "utf-8");
        return [];
      }
      throw new Error("Error al leer los carritos: " + error.message);
    }
  }

  async readProducts() {
    try {
      const data = await fs.readFile(this.productsPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error("Error al leer los productos: " + error.message);
    }
  }

  async writeCarts(carts) {
    await fs.writeFile(this.cartsPath, JSON.stringify(carts, null, 2), "utf-8");
  }

  // ✅ CORREGIDO: Métodos públicos requeridos
  async getCarts() {
    return await this.readCarts();
  }

  async getCartById(cid) {
    const carts = await this.readCarts();
    const cart = carts.find((cart) => cart.id === cid);
    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  async createCart() {
    const carts = await this.readCarts();
    const newCart = {
      id: this.generateId(),
      products: [],
    };
    carts.push(newCart);
    await this.writeCarts(carts);
    return newCart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.readCarts();
    const cartIndex = carts.findIndex((cart) => cart.id === cid);

    if (cartIndex === -1) {
      throw new Error("Carrito no encontrado");
    }

    const products = await this.readProducts();
    const productExists = products.some((p) => p.id === pid);
    if (!productExists) {
      throw new Error("Producto no encontrado");
    }

    const cart = carts[cartIndex];
    const productInCartIndex = cart.products.findIndex(
      (item) => item.product === pid
    );

    if (productInCartIndex !== -1) {
      cart.products[productInCartIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.writeCarts(carts);
    return cart;
  }
}

export default CartManager;
