const POLL_INTERVAL_MS = 4000;

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function renderProducts(products) {
  const productsList = document.getElementById("productsList");
  if (!productsList) return;

  productsList.innerHTML = products
    .map(
      (p) => `
        <div class="product-card" data-id="${p.id}">
          <div class="product-img">
            ${
              p.img
                ? `<img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" class="product-image">`
                : `<i class="fas fa-mug-hot"></i>`
            }
          </div>
          <div class="product-info">
            ${p.category ? `<div class="product-category">${escapeHtml(p.category)}</div>` : ""}
            <h3 class="product-title">${escapeHtml(p.name)}</h3>
            ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}
            <div class="product-price">$${escapeHtml(p.price)}</div>
            <div class="product-actions">
              <button class="cta-button delete-btn" data-id="${p.id}">Eliminar</button>
            </div>
          </div>
        </div>
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
    if (productData.stock) productData.stock = Number(productData.stock);
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
