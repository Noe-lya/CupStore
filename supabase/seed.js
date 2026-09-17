import "dotenv/config";
import ProductManager from "../src/productManager.js";

const products = [
  {
    name: "Botella Aeroligth",
    price: 120,
    description:
      "Más liviana para que llegues más lejos. La botella térmica Aerolight™ Fast Flow es moderna, práctica y con estilo, pensada para tu hidratación diaria.",
    category: "Bottle",
    img: "/img/aeroligth.PNG",
    stock: 5,
    available: true,
  },
  {
    name: "Vaso Quencher",
    price: 100,
    description:
      "Construido con acero inoxidable, nuestro vaso Quencher ofrece la máxima hidratación con menos recargas. El asa ergonómica incluye inserciones de agarre cómodo para transportarlo con facilidad, y la base angosta se adapta a casi cualquier portavasos de vehículo.",
    category: "Cup",
    img: "/img/quencher.png",
    stock: 5,
    available: true,
  },
  {
    name: "Botella IceFlow FlipStraw",
    price: 110,
    description:
      "Hidratación de otro nivel. La botella IceFlow Flip Straw 2.0 de 710ml cuenta con la tecnología premium AeroLight™, que la hace un 33% más ligera que las botellas estándar de acero inoxidable. Su aislamiento de acero ultraligero mantiene tu agua helada durante horas.",
    category: "Bottle",
    img: "/img/flipStraw.png",
    stock: 5,
    available: true,
  },
  {
    name: "Taza de café + plato",
    price: 90,
    description:
      "Comenza el día con un capuchino perfectamente espumado o una taza de café o té recién hecho. Para mayor paz y tranquilidad, la taza cuenta con una base de silicona antideslizante que suaviza el sonido. El asa circular está diseñada para beber cómodamente, mientras que el aislamiento al vacío de doble pared de acero inoxidable, mantiene su bebida caliente favorita a la temperatura ideal.",
    category: "Cup",
    img: "/img/taza.png",
    stock: 5,
    available: true,
  },
];

const pm = new ProductManager();

for (const product of products) {
  const created = await pm.addProduct(product);
  console.log(`Creado: ${created.name} (${created.id})`);
}
