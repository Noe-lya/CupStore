import { supabase } from "./config/supabaseClient.js";

const TABLE = "carts";

function toCart(row) {
  return { id: row.id, products: row.products };
}

class CartManager {
  async getCarts() {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw new Error("Error al leer los carritos: " + error.message);
    return data.map(toCart);
  }

  // Compatibilidad con el resto del código, que trabaja con el array completo de carritos
  async readCarts() {
    return this.getCarts();
  }

  async writeCarts(carts) {
    for (const cart of carts) {
      const { error } = await supabase
        .from(TABLE)
        .update({ products: cart.products })
        .eq("id", cart.id);
      if (error) throw new Error("Error al guardar los carritos: " + error.message);
    }
  }

  async getCartById(cid) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", cid)
      .maybeSingle();

    if (error || !data) throw new Error("Carrito no encontrado");
    return toCart(data);
  }

  async createCart() {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ products: [] })
      .select()
      .single();

    if (error) throw new Error("Error al crear el carrito: " + error.message);
    return toCart(data);
  }

  async addProductToCart(cid, pid) {
    const cart = await this.getCartById(cid);

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", pid)
      .maybeSingle();
    if (productError || !product) throw new Error("Producto no encontrado");

    const productInCartIndex = cart.products.findIndex(
      (item) => item.product === pid
    );

    if (productInCartIndex !== -1) {
      cart.products[productInCartIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    const { error } = await supabase
      .from(TABLE)
      .update({ products: cart.products })
      .eq("id", cid);
    if (error) throw new Error("Error al actualizar el carrito: " + error.message);

    return cart;
  }
}

export default CartManager;
