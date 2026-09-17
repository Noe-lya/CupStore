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
              <button class="cta-button add-to-cart-btn" data-id="${p.id}">Agregar al carrito</button>
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

// --- Polling: mantenemos la lista actualizada sin websockets ---
if (document.getElementById("productsList")) {
  fetchProducts();
  setInterval(fetchProducts, POLL_INTERVAL_MS);
}
