import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(root, ".data");
const localUsersPath = path.join(dataDirectory, "users.json");
const localAvatarDirectory = path.join(dataDirectory, "profile-photos");
const scrypt = promisify(scryptCallback);

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
const avatarBucket = "hotelia-profile-photos";
const localSessions = new Map();
let userSaveQueue = Promise.resolve();

async function loadLocalUsers() {
  try {
    const users = JSON.parse(await readFile(localUsersPath, "utf8"));
    if (!Array.isArray(users)) throw new Error("Local account data is invalid.");
    return users;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveLocalUsers(users) {
  const pendingWrite = userSaveQueue.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    const temporaryPath = `${localUsersPath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(users), { mode: 0o600 });
    await rename(temporaryPath, localUsersPath);
  });
  userSaveQueue = pendingWrite.catch(() => {});
  await pendingWrite;
}

function publicLocalUser(user) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      first_name: user.firstName,
      last_name: user.lastName,
      cedula: user.cedula,
      avatar_url: user.avatarUrl || ""
    }
  };
}

function localSessionUser(req) {
  const match = (req.get("authorization") || "").match(/^Bearer\s+([a-f0-9]{64})$/i);
  if (!match) return null;
  const session = localSessions.get(match[1]);
  if (!session || session.expiresAt <= Date.now()) {
    localSessions.delete(match[1]);
    return null;
  }
  return session.userId;
}

async function requireLocalUser(req, res, next) {
  const userId = localSessionUser(req);
  if (!userId) return res.status(401).json({ error: "Inicia sesión para continuar." });

  try {
    const users = await loadLocalUsers();
    const user = users.find(entry => entry.id === userId);
    if (!user) return res.status(401).json({ error: "La cuenta local ya no existe." });
    req.localUser = user;
    next();
  } catch (error) {
    next(error);
  }
}
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'", "https://esm.sh"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        ...(supabaseUrlValid ? [new URL(SUPABASE_URL).origin] : [])
      ]
    }
  }
}));
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
    supabaseAuthConfigured,
    authProvider: supabaseAuthConfigured ? "supabase" : "local"
  });
});

app.post("/api/local-auth/register", async (req, res, next) => {
  const { email, password, firstName, lastName = "", cedula } = req.body || {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    normalizedEmail.length > 254 ||
    typeof password !== "string" || password.length < 6 || password.length > 128 ||
    typeof firstName !== "string" || !firstName.trim() || firstName.trim().length > 80 ||
    typeof lastName !== "string" || lastName.trim().length > 80 ||
    typeof cedula !== "string" || !cedula.trim() || cedula.trim().length > 20
  ) {
    return res.status(400).json({
      error: "Completa los campos correctamente. La contraseña debe tener entre 6 y 128 caracteres."
    });
  }

  try {
    const users = await loadLocalUsers();
    if (users.some(user => user.email === normalizedEmail)) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo. Inicia sesión." });
    }

    const salt = randomBytes(16).toString("hex");
    const passwordHash = (await scrypt(password, salt, 64)).toString("hex");
    const user = {
      id: randomUUID(),
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      cedula: cedula.trim(),
      passwordSalt: salt,
      passwordHash,
      avatarUrl: ""
    };
    users.push(user);
    await saveLocalUsers(users);

    const token = randomBytes(32).toString("hex");
    localSessions.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 86400000 });
    res.status(201).json({ token, user: publicLocalUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/local-auth/login", async (req, res, next) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res.status(400).json({ error: "Escribe tu correo y contraseña." });
  }

  try {
    const users = await loadLocalUsers();
    const user = users.find(entry => entry.email === email);
    if (!user || password.length > 128) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const passwordHash = (await scrypt(password, user.passwordSalt, 64)).toString("hex");
    const savedHash = Buffer.from(user.passwordHash, "hex");
    const candidateHash = Buffer.from(passwordHash, "hex");
    if (savedHash.length !== candidateHash.length ||
        !timingSafeEqual(savedHash, candidateHash)) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const token = randomBytes(32).toString("hex");
    localSessions.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 86400000 });
    res.json({ token, user: publicLocalUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/local-auth/me", requireLocalUser, (req, res) => {
  res.json({ user: publicLocalUser(req.localUser) });
});

app.post("/api/local-auth/logout", (req, res) => {
  const match = (req.get("authorization") || "").match(/^Bearer\s+([a-f0-9]{64})$/i);
  if (match) localSessions.delete(match[1]);
  res.json({ success: true });
});

app.post(
  "/api/local-auth/avatar",
  requireLocalUser,
  express.raw({ type: "image/jpeg", limit: "2mb" }),
  async (req, res, next) => {
    if (!Buffer.isBuffer(req.body) || req.body.length < 3 ||
        req.body[0] !== 0xff || req.body[1] !== 0xd8 || req.body[2] !== 0xff) {
      return res.status(400).json({ error: "Selecciona una imagen JPEG válida." });
    }

    try {
      await mkdir(localAvatarDirectory, { recursive: true });
      await writeFile(path.join(localAvatarDirectory, `${req.localUser.id}.jpg`), req.body);
      const users = await loadLocalUsers();
      const user = users.find(entry => entry.id === req.localUser.id);
      if (!user) return res.status(401).json({ error: "La cuenta local ya no existe." });
      user.avatarUrl = `/api/local-auth/avatar/${user.id}?updated=${Date.now()}`;
      await saveLocalUsers(users);
      res.json({ avatarUrl: user.avatarUrl });
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/local-auth/avatar/:id", async (req, res, next) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) {
    return res.status(400).json({ error: "ID de foto no válido." });
  }

  try {
    const image = await readFile(path.join(localAvatarDirectory, `${req.params.id}.jpg`));
    res.type("image/jpeg").set("Cache-Control", "public, max-age=3600").send(image);
  } catch (error) {
    if (error.code === "ENOENT") return res.sendStatus(404);
    next(error);
  }
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

app.post(
  "/api/profile/avatar",
  authenticate,
  express.raw({ type: "image/jpeg", limit: "2mb" }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length < 3 ||
        req.body[0] !== 0xff || req.body[1] !== 0xd8 || req.body[2] !== 0xff) {
      return res.status(400).json({ error: "Selecciona una imagen JPEG válida." });
    }

    try {
      const { data: buckets, error: listError } = await db.storage.listBuckets();
      if (listError) throw listError;

      const existingBucket = buckets.find(bucket => bucket.name === avatarBucket);
      if (!existingBucket) {
        const { error } = await db.storage.createBucket(avatarBucket, {
          public: true,
          fileSizeLimit: "2MB",
          allowedMimeTypes: ["image/jpeg"]
        });
        if (error) throw error;
      } else if (!existingBucket.public) {
        const { error } = await db.storage.updateBucket(avatarBucket, {
          public: true,
          fileSizeLimit: "2MB",
          allowedMimeTypes: ["image/jpeg"]
        });
        if (error) throw error;
      }

      const avatarPath = `${req.user.id}/avatar.jpg`;
      const { error: uploadError } = await db.storage
        .from(avatarBucket)
        .upload(avatarPath, req.body, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true
        });
      if (uploadError) throw uploadError;

      const { data: publicUrl } = db.storage
        .from(avatarBucket)
        .getPublicUrl(avatarPath);
      const avatarUrl = `${publicUrl.publicUrl}?updated=${Date.now()}`;
      const { error: metadataError } = await db.auth.admin.updateUserById(
        req.user.id,
        {
          user_metadata: {
            ...(req.user.user_metadata || {}),
            avatar_url: avatarUrl
          }
        }
      );
      if (metadataError) throw metadataError;

      res.json({ avatarUrl });
    } catch (error) {
      console.error("Could not save profile avatar:", error.message);
      res.status(500).json({
        error: "No se pudo guardar la foto. Revisa la configuración de Storage en Supabase e inténtalo otra vez."
      });
    }
  }
);

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
