// Conectamos WebSocket con el cliente
const socket = io();

// --- Agregar producto ---
const formNewProduct = document.getElementById("formNewProduct");
if (formNewProduct) {
  formNewProduct.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formNewProduct);
    const productData = {};
    formData.forEach((value, key) => {
      productData[key] = value;
    });
    socket.emit("newProduct", productData);
  });
}

// --- Recibir nuevo producto y renderizarlo con data-id ---
socket.on("productAdded", (newProduct) => {
  const productsList = document.getElementById("productsList");
  if (productsList && newProduct?.id != null) {
    // ✅ Incluimos data-id en el <li> y en el botón
    productsList.innerHTML += `
      <li data-id="${newProduct.id}">
        ${newProduct.name} - $${newProduct.price}
        <button class="delete-btn" data-id="${newProduct.id}">Eliminar</button>
      </li>
    `;
  }
});

// --- Eliminar producto (enviar ID como STRING) ---
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const productId = e.target.dataset.id; // 👈 ya es string
    console.log("🗑️ Eliminar producto con ID (string):", productId);
    socket.emit("deleteProduct", { id: productId }); // ✅ sin parseInt
  }
});

// --- Eliminar del DOM ---
socket.on("productDeleted", (productId) => {
  console.log("🧹 Eliminando del DOM producto ID:", productId);
  const li = document.querySelector(`li[data-id="${productId}"]`);
  if (li) {
    li.remove();
    console.log(`Producto ${productId} eliminado del DOM`);
  } else {
    console.debug(
      `Producto ${productId} no encontrado en el DOM (ya eliminado o no presente)`
    );
  }
});
