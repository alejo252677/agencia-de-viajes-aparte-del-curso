const list = document.querySelector("#hotelList");
const statusText = document.querySelector("#status");
const searchForm = document.querySelector("#searchForm");
const maxPrice = document.querySelector("#maxPrice");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const navCartCount = document.querySelector("#navCartCount");
const cartTotal = document.querySelector("#cartTotal");
const reserveButton = document.querySelector("#reserveButton");
const reservationStatus = document.querySelector("#reservationStatus");
const catalogTitle = document.querySelector("#catalogTitle");
const routeLabel = document.querySelector("#routeLabel");
const airportField = document.querySelector("#airportField");
const startDateLabel = document.querySelector("#startDateLabel");
const endDateLabel = document.querySelector("#endDateLabel");
const pickupTimeField = document.querySelector("#pickupTimeField");
const arrivalTimeField = document.querySelector("#arrivalTimeField");
const guestsField = document.querySelector("#guestsField");
const flightMapSection = document.querySelector("#flightMapSection");
const routeLines = document.querySelector("#routeLines");
const routeMarkers = document.querySelector("#routeMarkers");
const routeChips = document.querySelector("#routeChips");

const cartKey = "hotelia-cart";
let destination = "";
let activeType = "hotel";
let usingDemoHotels = true;
let selectedAirport = "";
const demoHotels = [
  {
    id: "demo-cartagena",
    type: "hotel",
    name: "Casa Brisa del Caribe",
    city: "Cartagena, Colombia",
    description: "Hotel boutique de inspiración colonial con patio tropical, piscina y desayuno preparado con productos locales.",
    price: 285000,
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "demo-medellin",
    type: "hotel",
    name: "Mirador Verde Medellín",
    city: "Medellín, Colombia",
    description: "Alojamiento urbano rodeado de jardines, cerca de cafés, museos y transporte público.",
    price: 198000,
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "demo-salento",
    type: "hotel",
    name: "Refugio de la Montaña",
    city: "Salento, Colombia",
    description: "Casa de campo entre cafetales, con terraza panorámica y espacios tranquilos para explorar el valle.",
    price: 175000,
    rating: 4.9,
    image_url: "https://tse3.mm.bing.net/th/id/OIP.-PiV5szpI23-5yClTQd6NwHaE8?r=0&pid=Api&h=220&P=0"
  },
  {
    id: "demo-tokyo",
    type: "hotel",
    name: "Sakura House Shinjuku",
    city: "Tokio, Japón",
    description: "Hotel contemporáneo con habitaciones compactas y cómodas, a pocos pasos de restaurantes y trenes urbanos.",
    price: 620000,
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "demo-paris",
    type: "hotel",
    name: "Hôtel Lumière",
    city: "París, Francia",
    description: "Hospedaje de estilo clásico en una calle tranquila, ideal para recorrer mercados, jardines y museos.",
    price: 790000,
    rating: 4.5,
    image_url: "https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "demo-new-york",
    type: "hotel",
    name: "The Garden House",
    city: "Nueva York, Estados Unidos",
    description: "Hotel ficticio junto a parques y estaciones de metro, con habitaciones tranquilas para descansar después de explorar Manhattan.",
    price: 880000,
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "demo-rome",
    type: "hotel",
    name: "Casa Piazza Roma",
    city: "Roma, Italia",
    description: "Hospedaje de inspiración italiana cerca de plazas históricas, con desayuno de ejemplo y terraza para relajarse.",
    price: 720000,
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "demo-dubai",
    type: "hotel",
    name: "Desert Pearl Hotel",
    city: "Dubái, Emiratos Árabes Unidos",
    description: "Hotel de demostración con piscina, espacios luminosos y acceso sencillo a zonas comerciales y culturales.",
    price: 950000,
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80"
  }
];

const demoCars = [
  {
    id: "car-bogota",
    type: "car",
    name: "Compacto urbano",
    city: "Bogotá, Colombia",
    description: "Auto compacto ficticio para recorrer la ciudad, con aire acondicionado y espacio para cuatro viajeros.",
    price: 165000,
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "car-miami",
    type: "car",
    name: "SUV familiar",
    city: "Miami, Estados Unidos",
    description: "SUV de demostración con espacio para equipaje y grupo familiar. Incluye kilometraje ilimitado ficticio.",
    price: 310000,
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "car-madrid",
    type: "car",
    name: "Híbrido ejecutivo",
    city: "Madrid, España",
    description: "Vehículo híbrido de ejemplo para escapadas alrededor de Madrid, cómodo y de bajo consumo.",
    price: 275000,
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "car-tokyo",
    type: "car",
    name: "Hatchback práctico",
    city: "Tokio, Japón",
    description: "Auto compacto ficticio para una excursión fuera de la ciudad, con transmisión automática y GPS de ejemplo.",
    price: 295000,
    rating: 4.5,
    image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80"
  }
];

const demoFlights = [
  {
    id: "flight-bogota-madrid",
    type: "flight",
    name: "Bogotá → Madrid",
    city: "Colombia → España",
    origin: "Bogotá",
    destination: "Madrid",
    mapX: 504,
    mapY: 139,
    description: "Vuelo redondo ficticio en clase económica. Precio promocional ilustrativo por viajero, no disponible para compra.",
    price: 2508000,
    originalPrice: 2850000,
    discount: 12,
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flight-medellin-miami",
    type: "flight",
    name: "Medellín → Miami",
    city: "Colombia → Estados Unidos",
    origin: "Medellín",
    destination: "Miami",
    mapX: 280,
    mapY: 174,
    description: "Ruta ficticia con tarifa redonda promocional de demostración por viajero.",
    price: 1478400,
    originalPrice: 1680000,
    discount: 12,
    rating: 4.5,
    image_url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flight-bogota-tokyo",
    type: "flight",
    name: "Bogotá → Tokio",
    city: "Colombia → Japón",
    origin: "Bogotá",
    destination: "Tokio",
    mapX: 811,
    mapY: 151,
    description: "Itinerario de larga distancia totalmente ficticio, precio de ejemplo ida y vuelta por persona.",
    price: 5192000,
    originalPrice: 5900000,
    discount: 12,
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flight-bogota-paris",
    type: "flight",
    name: "Bogotá → París",
    city: "Colombia → Francia",
    origin: "Bogotá",
    destination: "París",
    mapX: 520,
    mapY: 123,
    description: "Vuelo redondo de demostración a París. Tarifa ficticia de promoción por viajero.",
    price: 2816000,
    originalPrice: 3200000,
    discount: 12,
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flight-bogota-new-york",
    type: "flight",
    name: "Bogotá → Nueva York",
    city: "Colombia → Estados Unidos",
    origin: "Bogotá",
    destination: "Nueva York",
    mapX: 273,
    mapY: 135,
    description: "Tarifa ficticia ida y vuelta en clase económica, con descuento de ejemplo por viajero.",
    price: 1980000,
    originalPrice: 2250000,
    discount: 12,
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flight-bogota-london",
    type: "flight",
    name: "Bogotá → Londres",
    city: "Colombia → Reino Unido",
    origin: "Bogotá",
    destination: "Londres",
    mapX: 488,
    mapY: 111,
    description: "Vuelo internacional completamente ficticio, con tarifa redonda de demostración por viajero.",
    price: 3036000,
    originalPrice: 3450000,
    discount: 12,
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flight-bogota-sydney",
    type: "flight",
    name: "Bogotá → Sídney",
    city: "Colombia → Australia",
    origin: "Bogotá",
    destination: "Sídney",
    mapX: 811,
    mapY: 298,
    description: "Ruta de larga distancia ficticia, precio promocional ilustrativo ida y vuelta por viajero.",
    price: 5632000,
    originalPrice: 6400000,
    discount: 12,
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80"
  }
];

const airportTaxis = [
  { code: "BOG", airport: "Bogotá — El Dorado", city: "Bogotá, Colombia", price: 65000 },
  { code: "MDE", airport: "Medellín — José María Córdova", city: "Rionegro / Medellín, Colombia", price: 115000 },
  { code: "CLO", airport: "Cali — Alfonso Bonilla Aragón", city: "Palmira / Cali, Colombia", price: 85000 },
  { code: "CTG", airport: "Cartagena — Rafael Núñez", city: "Cartagena, Colombia", price: 45000 },
  { code: "BAQ", airport: "Barranquilla — Ernesto Cortissoz", city: "Soledad / Barranquilla, Colombia", price: 65000 },
  { code: "BGA", airport: "Bucaramanga — Palonegro", city: "Lebrija / Bucaramanga, Colombia", price: 90000 }
];

const demoTaxis = airportTaxis.map(({ code, airport, city, price }) => ({
  id: `taxi-${code.toLowerCase()}`,
  type: "taxi",
  name: `Traslado desde ${airport}`,
  airport,
  city,
  description: "Servicio de traslado de ejemplo desde el aeropuerto hacia el destino que indiques. Tarifa ilustrativa por trayecto; disponibilidad, operador y precio final deben confirmarse directamente.",
  price,
  rating: 4.7,
  image_url: "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1000&q=80"
}));

let items = [...demoHotels, ...demoCars, ...demoFlights, ...demoTaxis];

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
    if (!Array.isArray(saved)) return [];

    return saved.filter(item => {
      const type = item?.type || "hotel";
      return item && item.id != null &&
        ["hotel", "car", "flight", "taxi"].includes(type) &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) && Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0;
    }).map(item => ({
      ...item,
      type: item.type || "hotel",
      price: Number(item.price),
      quantity: Number(item.quantity),
      dateStart: typeof item.dateStart === "string" ? item.dateStart : item.checkin || "",
      dateEnd: typeof item.dateEnd === "string" ? item.dateEnd : item.checkout || "",
      guests: Math.max(1, Number(item.guests) || 1),
      city: typeof item.city === "string" ? item.city : "",
      airport: typeof item.airport === "string" ? item.airport : "",
      pickupTime: typeof item.pickupTime === "string" ? item.pickupTime : "",
      arrivalTime: typeof item.arrivalTime === "string" ? item.arrivalTime : "",
      originalPrice: Number(item.originalPrice) || Number(item.price),
      discount: Number(item.discount) || 0
    }));
  } catch {
    return [];
  }
}

let cart = readCart();

function money(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

function safeText(value) {
  return String(value ?? "");
}

function normalizeSearch(value) {
  return safeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function getDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? Math.round((end - start) / 86400000)
    : 0;
}

function bookingDetails() {
  const dateStart = document.querySelector("#dateStart").value;
  const dateEnd = document.querySelector("#dateEnd").value;
  const dateEndRequired = activeType !== "taxi";
  const days = dateEndRequired ? getDays(dateStart, dateEnd) : Boolean(dateStart);
  const pickupTime = document.querySelector("#pickupTime").value;
  const arrivalTime = document.querySelector("#arrivalTime").value;
  const tripDestination = document.querySelector("#destination").value.trim();

  if (!days) {
    reservationStatus.textContent = dateEndRequired
      ? "Selecciona fechas válidas: el regreso debe ser posterior a la salida."
      : "Selecciona la fecha de recogida del taxi.";
    return null;
  }

  if ((activeType === "car" || activeType === "taxi") &&
      (!pickupTime || !arrivalTime)) {
    reservationStatus.textContent = "Indica la hora de recogida y la hora prevista de llegada.";
    return null;
  }

  if (activeType === "taxi" && !tripDestination) {
    reservationStatus.textContent = "Escribe el destino para el traslado desde el aeropuerto.";
    document.querySelector("#destination").focus();
    return null;
  }

  if ((activeType === "taxi" || (activeType === "car" && dateStart === dateEnd)) &&
      arrivalTime <= pickupTime) {
    reservationStatus.textContent = "La hora de llegada o devolución debe ser posterior a la recogida.";
    return null;
  }

  return {
    dateStart,
    dateEnd: dateEndRequired ? dateEnd : "",
    guests: Math.max(1, Number(document.querySelector("#guests").value) || 1),
    pickupTime: activeType === "car" || activeType === "taxi" ? pickupTime : "",
    arrivalTime: activeType === "car" || activeType === "taxi" ? arrivalTime : "",
    airport: activeType === "taxi" ? document.querySelector("#airport").value : "",
    destination: tripDestination
  };
}

function itemTotal(item) {
  if (item.type === "flight") return item.price * item.guests * item.quantity;
  if (item.type === "taxi") return item.price * item.quantity;
  return item.price * getDays(item.dateStart, item.dateEnd) * item.quantity;
}

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const booking = bookingDetails();
  if (!booking) return;

  const existing = cart.find(entry =>
    String(entry.id) === String(item.id) &&
    entry.dateStart === booking.dateStart &&
    entry.dateEnd === booking.dateEnd &&
    entry.guests === booking.guests &&
    entry.pickupTime === booking.pickupTime &&
    entry.arrivalTime === booking.arrivalTime &&
    entry.airport === booking.airport &&
    entry.destination === booking.destination
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      type: item.type,
      name: safeText(item.name),
      city: safeText(item.city),
      airport: booking.airport || safeText(item.airport),
      price: Number(item.price),
      originalPrice: Number(item.originalPrice) || Number(item.price),
      discount: Number(item.discount) || 0,
      quantity: 1,
      dateStart: booking.dateStart,
      dateEnd: booking.dateEnd,
      guests: booking.guests,
      pickupTime: booking.pickupTime,
      arrivalTime: booking.arrivalTime,
      destination: booking.destination
    });
  }

  reservationStatus.textContent = `${safeText(item.name)} se agregó a tus reservaciones.`;
  saveCart();
}

function renderCart() {
  if (!cartItems || !cartCount || !cartTotal) return;

  cartItems.replaceChildren();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + itemTotal(item), 0);
  cartCount.textContent = String(count);
  if (navCartCount) navCartCount.textContent = String(count);
  cartTotal.textContent = money(total);

  if (!cart.length) {
    const empty = document.createElement("li");
    empty.textContent = "Tu carrito está vacío. Agrega un hotel, auto, vuelo o taxi.";
    cartItems.append(empty);
    return;
  }

  cart.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "cart-item";

    const summary = document.createElement("span");
    const labels = { hotel: "Hospedaje", car: "Auto", flight: "Vuelo", taxi: "Taxi aeropuerto" };
    const details = item.type === "taxi"
      ? `${item.airport} · ${item.dateStart} · recogida ${item.pickupTime} · llegada estimada ${item.arrivalTime} · destino ${item.destination}`
      : item.type === "car"
        ? `${item.city} · ${item.dateStart} a ${item.dateEnd} · recogida ${item.pickupTime} · devolución ${item.arrivalTime}`
        : item.type === "flight"
          ? `${item.city} · ${item.dateStart} a ${item.dateEnd} · ${item.guests} viajero(s)`
          : `${item.city} · ${item.dateStart} a ${item.dateEnd} · ${item.guests} huésped(es)`;
    summary.textContent = `${labels[item.type]}: ${item.name} · ${details} · ${item.quantity} unidad(es)`;

    const price = document.createElement("strong");
    price.textContent = money(itemTotal(item));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Quitar";
    remove.setAttribute("aria-label", `Quitar ${item.name} de reservaciones`);
    remove.addEventListener("click", () => {
      if (item.quantity > 1) item.quantity -= 1;
      else cart.splice(index, 1);
      reservationStatus.textContent = "Se actualizó el carrito de reservaciones.";
      saveCart();
    });

    row.append(summary, price, remove);
    cartItems.append(row);
  });
}

function typeLabel(type) {
  return {
    hotel: "alojamientos",
    car: "autos",
    flight: "pasajes",
    taxi: "taxis de aeropuerto"
  }[type] || "opciones";
}

function updateCatalogHeading() {
  const headings = {
    hotel: "Opciones de hospedaje",
    car: "Alquila un auto",
    flight: "Pasajes de ejemplo",
    taxi: "Traslados en aeropuertos de Colombia"
  };
  catalogTitle.textContent = headings[activeType];
}

function setActiveService(type) {
  activeType = type;
  document.querySelectorAll(".service-tab").forEach(button => {
    const active = button.dataset.service === type;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const dateStartLabelText = {
    hotel: "Entrada",
    car: "Fecha de recogida",
    flight: "Fecha de salida",
    taxi: "Fecha de recogida"
  }[type];
  const dateEndLabelText = {
    hotel: "Salida",
    car: "Fecha de devolución",
    flight: "Fecha de regreso",
    taxi: "Fecha de llegada"
  }[type];
  startDateLabel.childNodes[0].textContent = `${dateStartLabelText} `;
  endDateLabel.childNodes[0].textContent = `${dateEndLabelText} `;
  endDateLabel.hidden = type === "taxi";
  document.querySelector("#dateEnd").required = type !== "taxi";

  routeLabel.childNodes[0].textContent =
    type === "taxi" ? "Destino del taxi " :
    type === "flight" ? "Origen o destino " : "Destino ";
  document.querySelector("#destination").placeholder =
    type === "taxi" ? "Ej. Centro, Bogotá" :
    type === "flight" ? "Ej. Madrid, España" : "Ej. Tokio, Japón";
  document.querySelector("#destination").required = type === "taxi";

  airportField.hidden = type !== "taxi";
  pickupTimeField.hidden = type !== "car" && type !== "taxi";
  arrivalTimeField.hidden = type !== "car" && type !== "taxi";
  document.querySelector("#pickupTime").required = type === "car" || type === "taxi";
  document.querySelector("#arrivalTime").required = type === "car" || type === "taxi";
  guestsField.hidden = type === "taxi";
  document.querySelector("#guests").required = type !== "taxi";
  document.querySelector("#arrivalTimeField").childNodes[0].textContent =
    type === "car" ? "Hora de devolución " : "Hora de llegada estimada ";

  flightMapSection.hidden = type !== "flight";
  if (type === "taxi") {
    document.querySelector("#serviceHint").textContent =
      "Horarios de solicitud en formato 24 h. La disponibilidad, tarifa y operador deben confirmarse directamente con el aeropuerto o proveedor; esta web no garantiza el servicio.";
  } else if (type === "flight") {
    document.querySelector("#serviceHint").textContent =
      "Rutas y descuentos ficticios, solo ilustrativos. No son ofertas vigentes ni disponibilidad en vivo; confirma con la aerolínea.";
  } else if (type === "car") {
    document.querySelector("#serviceHint").textContent =
      "Indica fecha y hora de recogida y devolución. Tarifas e imágenes de ejemplo, no disponibles para reservar realmente.";
  } else {
    document.querySelector("#serviceHint").textContent =
      "Precios, rutas y servicios de ejemplo. No se procesan pagos ni se confirman reservas reales.";
  }

  updateCatalogHeading();
  renderItems();
}

function renderFlightMap() {
  routeLines.replaceChildren();
  routeMarkers.replaceChildren();
  routeChips.replaceChildren();

  const svgNamespace = "http://www.w3.org/2000/svg";
  const bogota = { x: 238, y: 242 };

  function makeSvgElement(name, attributes, text) {
    const element = document.createElementNS(svgNamespace, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (text) element.textContent = text;
    return element;
  }

  routeMarkers.append(
    makeSvgElement("circle", { cx: bogota.x, cy: bogota.y, r: 7, class: "map-origin" }),
    makeSvgElement("text", { x: bogota.x - 42, y: bogota.y + 23, class: "map-label map-origin-label" }, "Colombia")
  );

  demoFlights.forEach(flight => {
    const origin = flight.origin === "Medellín" ? { x: 226, y: 227 } : bogota;
    const curveHeight = Math.max(34, Math.abs(origin.x - flight.mapX) * 0.16);
    const controlX = (origin.x + flight.mapX) / 2;
    const controlY = Math.min(origin.y, flight.mapY) - curveHeight;

    routeLines.append(
      makeSvgElement("path", {
        d: `M ${origin.x} ${origin.y} Q ${controlX} ${controlY} ${flight.mapX} ${flight.mapY}`,
        class: "map-route"
      })
    );
    routeMarkers.append(
      makeSvgElement("circle", {
        cx: flight.mapX,
        cy: flight.mapY,
        r: 5,
        class: "map-marker"
      }),
      makeSvgElement("text", {
        x: flight.mapX + 8,
        y: flight.mapY - 8,
        class: "map-label"
      }, flight.destination)
    );

    const routeButton = document.createElement("button");
    routeButton.type = "button";
    routeButton.className = "route-chip";
    routeButton.textContent = flight.name;
    routeButton.addEventListener("click", () => {
      setActiveService("flight");
      document.querySelector("#destination").value = flight.destination;
      destination = flight.destination;
      renderItems();
      document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
    });
    routeChips.append(routeButton);
  });
}

function renderItems() {
  const priceLimit = Number(maxPrice.value);
  const normalizedDestination = normalizeSearch(destination);
  const results = items.filter(item => {
    const matchesType = item.type === activeType;
    const matchesPrice = Number(item.price) <= priceLimit;
    const searchable = normalizeSearch(`${item.name} ${item.city} ${item.description}`);
    const airportCode = selectedAirport.match(/\(([A-Z]{3})\)/)?.[1];
    const matchesAirport = item.type !== "taxi" ||
      item.id === `taxi-${(airportCode || "").toLowerCase()}`;
    return matchesType && matchesPrice &&
      matchesAirport &&
      (!normalizedDestination || item.type === "taxi" || searchable.includes(normalizedDestination) ||
        (item.type === "taxi" && normalizeSearch(item.destination).includes(normalizedDestination)));
  });

  list.replaceChildren();
  updateCatalogHeading();

  if (!results.length) {
    statusText.textContent = `No encontramos ${typeLabel(activeType)} con esos filtros. Prueba otro destino o precio.`;
    return;
  }

  statusText.textContent = activeType === "hotel" && !usingDemoHotels
    ? `${results.length} alojamiento(s) encontrado(s).`
    : `${results.length} ${typeLabel(activeType)} de demostración.`;

  results.forEach(item => {
    const card = document.createElement("article");
    card.className = "hotel-card";

    const image = document.createElement("img");
    image.src = item.image_url || "";
    image.alt = `Imagen de ${safeText(item.name)}`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.alt = "Imagen no disponible";
    }, { once: true });

    const info = document.createElement("div");
    info.className = "hotel-info";

    const badge = document.createElement("span");
    badge.className = "service-badge";
    badge.textContent = {
      hotel: "Alojamiento",
      car: "Alquiler de auto · tarifa ficticia por día",
      flight: `Ticket · descuento ilustrativo ${item.discount}%`,
      taxi: "Taxi aeropuerto · tarifa ficticia por trayecto"
    }[item.type];

    const title = document.createElement("h3");
    title.textContent = safeText(item.name);

    const city = document.createElement("p");
    city.className = "item-location";
    city.textContent = `📍 ${safeText(item.city)}`;

    const description = document.createElement("p");
    description.textContent = safeText(item.description).trim() || "Descripción no disponible.";

    const price = document.createElement("p");
    price.className = "hotel-price";
    const unit = {
      hotel: "por noche",
      car: "por día",
      flight: "por viajero · ida y vuelta",
      taxi: "por trayecto (estimado)"
    }[item.type];
    if (item.type === "flight") {
      const oldPrice = document.createElement("span");
      oldPrice.className = "old-price";
      oldPrice.textContent = `${money(item.originalPrice)} `;
      const discountedPrice = document.createElement("strong");
      discountedPrice.textContent = `${money(item.price)} ${unit}`;
      const discountTag = document.createElement("span");
      discountTag.className = "discount-label";
      discountTag.textContent = `-${item.discount}%`;
      price.append(oldPrice, discountedPrice, discountTag);
    } else {
      price.textContent = `${money(item.price)} ${unit}`;
    }

    const actions = document.createElement("div");
    actions.className = "hotel-actions";

    const rating = document.createElement("span");
    rating.textContent = `⭐ ${Number(item.rating).toFixed(1)}`;

    const reserve = document.createElement("button");
    reserve.type = "button";
    reserve.className = "primary";
    reserve.textContent = "Agregar a reservaciones";
    reserve.addEventListener("click", () => addToCart(item));

    const locationLink = document.createElement("a");
    locationLink.className = "secondary-link";
    locationLink.textContent = item.type === "taxi"
      ? "Ver aeropuerto"
      : item.type === "hotel" ? "Ver en Google Maps" : "Ver sitio";
    locationLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${safeText(item.name)} ${safeText(item.city)}`)}`;
    locationLink.target = "_blank";
    locationLink.rel = "noopener noreferrer";

    actions.append(rating, reserve, locationLink);
    info.append(badge, title, city, description, price, actions);
    card.append(image, info);
    list.append(card);
  });
}

async function loadItems() {
  statusText.textContent = "Buscando opciones de viaje...";

  try {
    const response = await fetch("/api/hotels");
    if (!response.ok) throw new Error("No se pudo consultar el catálogo de hoteles.");

    const result = await response.json();
    const databaseHotels = Array.isArray(result)
      ? result.map(hotel => ({ ...hotel, type: "hotel" }))
      : [];
    usingDemoHotels = databaseHotels.length === 0;
    const hotelItems = usingDemoHotels ? demoHotels : databaseHotels;
    items = [...hotelItems, ...demoCars, ...demoFlights, ...demoTaxis];
  } catch (error) {
    usingDemoHotels = true;
    items = [...demoHotels, ...demoCars, ...demoFlights, ...demoTaxis];
    console.error(error);
  }

  renderItems();
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!bookingDetails()) return;

  destination = document.querySelector("#destination").value.trim();
  selectedAirport = document.querySelector("#airport").value;
  reservationStatus.textContent = "";
  renderItems();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
});

maxPrice.addEventListener("change", renderItems);
document.querySelectorAll(".service-tab").forEach(button => {
  button.addEventListener("click", () => {
    destination = "";
    document.querySelector("#destination").value = "";
    reservationStatus.textContent = "";
    setActiveService(button.dataset.service);
  });
});
document.querySelector("#airport").addEventListener("change", event => {
  selectedAirport = event.target.value;
  if (activeType === "taxi") renderItems();
});

reserveButton.addEventListener("click", () => {
  if (!cart.length) {
    reservationStatus.textContent = "Agrega un hotel, auto, vuelo o taxi antes de revisar tus reservaciones.";
    return;
  }

  if (cart.some(item => item.type === "taxi"
    ? !item.dateStart || !item.pickupTime || !item.arrivalTime || !item.destination
    : !getDays(item.dateStart, item.dateEnd))) {
    reservationStatus.textContent = "Hay una reservación con fechas, horario o destino incompletos. Quítala y agrégala de nuevo.";
    return;
  }

  const total = cart.reduce((sum, item) => sum + itemTotal(item), 0);
  reservationStatus.textContent = `Resumen demostrativo listo para ${cart.length} servicio(s). Total estimado: ${money(total)} COP. No se realizó ningún pago ni reserva real.`;
});

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(today.getDate() + 2);
const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
document.querySelector("#dateStart").value = formatDate(tomorrow);
document.querySelector("#dateEnd").value = formatDate(dayAfter);
document.querySelector("#dateStart").min = formatDate(today);
document.querySelector("#dateEnd").min = formatDate(tomorrow);

document.querySelector("#dateStart").addEventListener("change", event => {
  const nextDate = new Date(`${event.target.value}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  document.querySelector("#dateEnd").min = formatDate(nextDate);
  if (document.querySelector("#dateEnd").value <= event.target.value) {
    document.querySelector("#dateEnd").value = formatDate(nextDate);
  }
});

document.querySelector("#pickupTime").value = "09:00";
document.querySelector("#arrivalTime").value = "10:00";
selectedAirport = document.querySelector("#airport").value;
renderFlightMap();
setActiveService(activeType);

fetch("/api/config")
  .then(response => response.ok ? response.json() : {})
  .then(config => {
    if (config.whatsapp) {
      const link = document.querySelector("#whatsappLink");
      if (link) link.href = `https://wa.me/${config.whatsapp}`;
    }
  })
  .catch(error => console.error("No se pudo cargar la configuración de contacto.", error));

renderCart();
loadItems();
