import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.dirname(fileURLToPath(import.meta.url));

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const adminEmails = new Set(
  String(process.env.HOTEL_ADMIN_EMAILS || "")
    .split(",")
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
);

function isConfiguredValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return false;

  const candidate = normalized.replace(/^https?:\/\//i, "");
  return !/^(?:your\b|replace\b|placeholder\b|example\b|sample\b|todo\b|xxx\b|change[-_ ]?me\b|tu[-_ ]|pega[-_ ]?aqui|<)/i.test(candidate);
}

const supabaseUrlValid = (() => {
  if (!isConfiguredValue(SUPABASE_URL)) return false;
  try {
    const url = new URL(SUPABASE_URL);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
})();
const supabaseAuthConfigured =
  supabaseUrlValid && isConfiguredValue(SUPABASE_PUBLISHABLE_KEY);
const supabaseConfigured =
  supabaseAuthConfigured && isConfiguredValue(SUPABASE_SERVICE_ROLE_KEY);

const db = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.get("/", (req, res) => res.sendFile(path.join(root, "index.html")));
app.get("/index.html", (req, res) => res.sendFile(path.join(root, "index.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(root, "login.html")));
app.get("/admin.html", (req, res) => res.sendFile(path.join(root, "admin.html")));
app.get("/styles.css", (req, res) => res.sendFile(path.join(root, "styles.css")));
app.get("/scripts.js", (req, res) => res.sendFile(path.join(root, "scripts.js")));
app.use(express.static(path.join(root, "public")));

app.get("/api/config", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    supabaseUrl: SUPABASE_URL || "",
    supabasePublishableKey: SUPABASE_PUBLISHABLE_KEY || "",
    whatsapp: (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, ""),
    supabaseConfigured,
    supabaseAuthConfigured
  });
});

// Verifica que la sesión sea válida antes de aplicar la lista de administradores.
async function authenticate(req, res, next) {
  if (!supabaseConfigured) {
    return res.status(503).json({
      error: 'Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para habilitar la autenticación.'
    });
  }
  try {
    const header = req.get("authorization") || "";

    const match = header.match(/^Bearer\s+([^\s]+)$/i);

    if (!match) {
      return res.status(401).json({ error: "Debes iniciar sesión." });
    }

    const { data, error } = await db.auth.getUser(match[1]);

    if (error || !data.user) {
      return res.status(401).json({ error: "Sesión no válida." });
    }

    req.user = data.user;
    next();
  } catch {
    res.status(401).json({ error: "No se pudo verificar la sesión." });
  }
}

async function requireAdmin(req, res, next) {
  if (!adminEmails.size) {
    return res.status(503).json({
      error: "El acceso al panel no está configurado. Define HOTEL_ADMIN_EMAILS en el servidor."
    });
  }

  const email = String(req.user.email || "").trim().toLowerCase();
  if (!email || !adminEmails.has(email)) {
    return res.status(403).json({ error: "Este correo no tiene acceso al panel de alojamientos." });
  }

  next();
}

function validateHotel(body) {
  const { name, city, description, price, rating, image_url } = body;

  if (
    typeof name !== "string" || !name.trim() || name.length > 100 ||
    typeof city !== "string" || !city.trim() || city.length > 100 ||
    typeof description !== "string" || !description.trim() || description.length > 1000 ||
    !Number.isFinite(price) || price < 1000 || price > 100000000 ||
    !Number.isFinite(rating) || rating < 0 || rating > 5
  ) {
    return "Comprueba los campos del hotel.";
  }

  if (image_url != null && image_url !== "") {
    try {
      const parsed = new URL(image_url);
      if (parsed.protocol !== "https:") {
        return "La fotografía debe utilizar HTTPS.";
      }
    } catch {
      return "La URL de la fotografía no es válida.";
    }
  }

  return null;
}

app.get("/api/hotels", async (req, res) => {
  if (!supabaseConfigured) {
    res.set('Cache-Control', 'no-store');
    return res.json([]);
  }
  const { data, error } = await db
    .from("hotels")
    .select("id,name,city,description,price,rating,image_url")
    .eq("active", true)
    .order("name");

  if (error) return res.status(500).json({ error: "Error cargando hoteles." });

  res.set("Cache-Control", "no-store");
  res.json(data);
});

app.get("/api/admin/me", authenticate, requireAdmin, (req, res) => {
  res.json({ authorized: true });
});

app.get("/api/admin/hotels", authenticate, requireAdmin, async (req, res) => {
  const { data, error } = await db
    .from("hotels")
    .select("*")
    .order("name");

  if (error) return res.status(500).json({ error: "Error cargando hoteles." });
  res.json(data);
});

app.post("/api/admin/hotels", authenticate, requireAdmin, async (req, res) => {
  const invalid = validateHotel(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  const { name, city, description, price, rating, image_url } = req.body;

  const { data, error } = await db
    .from("hotels")
    .insert({
      name: name.trim(),
      city: city.trim(),
      description: description.trim(),
      price,
      rating,
      image_url: image_url || null
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: "No se pudo guardar el hotel." });

  res.status(201).json(data);
});

app.patch("/api/admin/hotels/:id", authenticate, requireAdmin, async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) {
    return res.status(400).json({ error: "ID no válido." });
  }

  const invalid = validateHotel(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  const { name, city, description, price, rating, image_url } = req.body;

  const { data, error } = await db
    .from("hotels")
    .update({
      name: name.trim(),
      city: city.trim(),
      description: description.trim(),
      price,
      rating,
      image_url: image_url || null
    })
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: "No se pudo actualizar." });
  if (!data) return res.status(404).json({ error: "Hotel no encontrado." });

  res.json(data);
});

app.delete("/api/admin/hotels/:id", authenticate, requireAdmin, async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) {
    return res.status(400).json({ error: "ID no válido." });
  }

  const { error } = await db
    .from("hotels")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: "No se pudo eliminar el hotel." });

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Hotelia disponible en http://localhost:${port}`);
});