const POLL_INTERVAL_MS = 4000;

function renderProducts(products) {
  const productsList = document.getElementById("productsList");
  if (!productsList) return;

  productsList.innerHTML = products
    .map(
      (p) => `
        <li data-id="${p.id}">
          ${p.name} - $${p.price}
          <button class="delete-btn" data-id="${p.id}">Eliminar</button>
        </li>
      `
    )
    .join("");
}

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    const { payload } = await res.json();
    renderProducts(payload);
  } catch (error) {
    console.error("Error al traer los productos:", error);
  }
}

// --- Agregar producto ---
const formNewProduct = document.getElementById("formNewProduct");
if (formNewProduct) {
  formNewProduct.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formNewProduct);
    const productData = Object.fromEntries(formData.entries());
    if (productData.price) productData.price = Number(productData.price);
    productData.available = formData.get("available") === "on";

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      formNewProduct.reset();
      fetchProducts();
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  });
}

// --- Eliminar producto ---
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const productId = e.target.dataset.id;
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  }
});

// --- Polling: mantenemos la lista actualizada sin websockets ---
if (document.getElementById("productsList")) {
  fetchProducts();
  setInterval(fetchProducts, POLL_INTERVAL_MS);
}
