import express from "express";
import ProductManager from "../productManager.js";

const viewsRouter = express.Router();
const pm = new ProductManager("./src/data/products.json");

viewsRouter.get("/", async (req, res) => {
  try {
    const products = await pm.getProducts();
    res.render("home", { title: "Home Page", products });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// NUEVA RUTA: /products
viewsRouter.get("/products", async (req, res) => {
  try {
    // Usamos los mismos parámetros que la API
    const { limit = 10, page = 1, sort, query } = req.query;

    let products = await pm.getProducts();

    // Filtrado
    if (query) {
      const isAvailability = query === "true" || query === "false";
      if (isAvailability) {
        const available = query === "true";
        products = products.filter((p) => p.available === available);
      } else {
        products = products.filter(
          (p) => p.category?.toLowerCase() === query.toLowerCase()
        );
      }
    }

    // Ordenamiento
    if (sort === "asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      products.sort((a, b) => b.price - a.price);
    }

    // Paginación
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const total = products.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    res.render("products", {
      products: paginatedProducts,
      totalPages,
      currentPage: pageNum,
      hasPrevPage,
      hasNextPage,
      prevPage: pageNum - 1,
      nextPage: pageNum + 1,
      query: query || "",
      sort: sort || "",
      limit: limitNum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: error.message });
  }
});

// Detalle de producto
viewsRouter.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await pm.getProductById(pid);
    if (!product) return res.status(404).render("404");
    res.render("productDetail", { product });
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

// Vista de carrito
viewsRouter.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const carts = await fs.readFile("./src/data/carts.json", "utf8");
    const cartsData = JSON.parse(carts);
    const cart = cartsData.find((c) => c.id === cid);
    if (!cart) return res.status(404).render("404");

    // Populate manual
    const productsData = await pm.getProducts();
    const populatedProducts = cart.products
      .map((item) => {
        const prod = productsData.find((p) => p.id === item.product);
        return { ...item, details: prod };
      })
      .filter((item) => item.details); // solo si existe

    res.render("cart", { cartId: cid, products: populatedProducts });
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

export default viewsRouter;
