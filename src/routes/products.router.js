import express from "express";
import ProductManager from "../productManager.js";

const productsRouter = express.Router();
const pm = new ProductManager("./src/data/products.json");

productsRouter.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Parsear valores
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    // Validar entradas
    if (isNaN(limitNum) || isNaN(pageNum) || limitNum <= 0 || pageNum <= 0) {
      return res
        .status(400)
        .json({ status: "error", error: "Parámetros inválidos" });
    }

    let products = await pm.getProducts();

    // Filtrado por query
    if (query) {
      const isAvailability = query === "true" || query === "false";
      if (isAvailability) {
        const available = query === "true";
        products = products.filter((p) => p.available === available);
      } else {
        // Buscar por categoría
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
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Links
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const prevLink = hasPrevPage
      ? `${baseUrl}?limit=${limitNum}&page=${pageNum - 1}&sort=${
          sort || ""
        }&query=${query || ""}`
      : null;
    const nextLink = hasNextPage
      ? `${baseUrl}?limit=${limitNum}&page=${pageNum + 1}&sort=${
          sort || ""
        }&query=${query || ""}`
      : null;

    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    res.json({
      status: "success",
      payload: paginatedProducts,
      totalPages,
      prevPage: hasPrevPage ? pageNum - 1 : null,
      nextPage: hasNextPage ? pageNum + 1 : null,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Endpoint para obtener un producto por ID
productsRouter.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await pm.getProductById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    }
    res.json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default productsRouter;
