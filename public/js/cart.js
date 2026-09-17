function getStoredCartId() {
  try {
    return localStorage.getItem("cartId");
  } catch {
    return null;
  }
}

function setStoredCartId(id) {
  try {
    localStorage.setItem("cartId", id);
  } catch {
    // localStorage no disponible, seguimos sin persistir
  }
}

async function ensureCartId() {
  const existing = getStoredCartId();
  if (existing) {
    const res = await fetch(`/api/carts/${existing}`);
    if (res.ok) return existing;
  }
  const res = await fetch("/api/carts", { method: "POST" });
  const { payload } = await res.json();
  setStoredCartId(payload.id);
  return payload.id;
}

function updateCartCount(count) {
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count > 0 ? `(${count})` : "";
}

async function refreshCartLink() {
  const link = document.getElementById("cartLink");
  const cartId = getStoredCartId();
  if (!link) return;

  if (!cartId) {
    updateCartCount(0);
    return;
  }

  link.href = `/carts/${cartId}`;
  try {
    const res = await fetch(`/api/carts/${cartId}`);
    if (!res.ok) return;
    const { payload } = await res.json();
    const count = payload.products.reduce((sum, p) => sum + p.quantity, 0);
    updateCartCount(count);
  } catch (error) {
    console.error("Error al leer el carrito:", error);
  }
}

async function addToCart(productId) {
  try {
    const cartId = await ensureCartId();
    await fetch(`/api/carts/${cartId}/product/${productId}`, { method: "POST" });
    await refreshCartLink();
    alert("Producto agregado al carrito");
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    alert("No se pudo agregar el producto al carrito");
  }
}

async function updateQuantity(cid, pid, action) {
  try {
    const res = await fetch(`/api/carts/${cid}`);
    const { payload } = await res.json();
    const item = payload.products.find((p) => p.product.id === pid);
    if (!item) return;

    const quantity = Math.max(1, item.quantity + (action === "increase" ? 1 : -1));
    await fetch(`/api/carts/${cid}/products/${pid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    location.reload();
  } catch (error) {
    console.error("Error al actualizar la cantidad:", error);
  }
}

document.addEventListener("click", async (e) => {
  const addBtn = e.target.closest(".add-to-cart-btn");
  if (addBtn) {
    addToCart(addBtn.dataset.id);
    return;
  }

  const qtyBtn = e.target.closest(".qty-btn");
  if (qtyBtn) {
    updateQuantity(qtyBtn.dataset.cid, qtyBtn.dataset.pid, qtyBtn.dataset.action);
    return;
  }

  const removeBtn = e.target.closest(".remove-item-btn");
  if (removeBtn) {
    await fetch(`/api/carts/${removeBtn.dataset.cid}/products/${removeBtn.dataset.pid}`, {
      method: "DELETE",
    });
    location.reload();
    return;
  }

  const clearBtn = e.target.closest(".clear-cart-btn");
  if (clearBtn) {
    if (!confirm("¿Vaciar todo el carrito?")) return;
    await fetch(`/api/carts/${clearBtn.dataset.cid}`, { method: "DELETE" });
    location.reload();
  }
});

refreshCartLink();
