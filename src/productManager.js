import { supabase } from "./config/supabaseClient.js";

const TABLE = "products";

// Convierte una fila de la tabla ({ id, data }) al formato plano que ya usa el resto de la app
function toProduct(row) {
  return { id: row.id, ...row.data };
}

class ProductManager {
  async addProduct(newProduct) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ data: newProduct })
      .select()
      .single();

    if (error) throw new Error("Error al añadir el nuevo producto: " + error.message);
    return toProduct(data);
  }

  async getProducts() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error("Error al traer los productos: " + error.message);
    return data.map(toProduct);
  }

  async getProductById(pid) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", pid)
      .maybeSingle();

    if (error) {
      throw new Error("Error al obtener el producto de ID: " + pid + error.message);
    }
    return data ? toProduct(data) : null;
  }

  async setProductById(pid, updates) {
    const existing = await this.getProductById(pid);
    if (!existing) throw new Error("Producto no encontrado");

    const { id, ...currentData } = existing;
    const mergedData = { ...currentData, ...updates };

    const { error } = await supabase
      .from(TABLE)
      .update({ data: mergedData })
      .eq("id", pid);

    if (error) throw new Error("Error al actualizar un producto: " + error.message);
    return this.getProducts();
  }

  async deleteProductById(pid) {
    const { error } = await supabase.from(TABLE).delete().eq("id", pid);

    if (error) throw new Error("Error al borrar un producto: " + error.message);
    console.log(` Producto con ID "${pid}" eliminado.`);
  }
}

export default ProductManager;
