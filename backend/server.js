const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie("wesupply_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function authMiddleware(req, res, next) {
  const token = req.cookies.wesupply_auth;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/", (_req, res) => {
  res.json({ message: "WeSupply backend is running" });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = createAuthToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create account", details: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createAuthToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to log in", details: error.message });
  }
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.sub]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
});

app.post("/auth/logout", (_req, res) => {
  res.clearCookie("wesupply_auth");
  return res.json({ message: "Logged out" });
});

app.post("/meal-plan/generate", authMiddleware, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const { profile, prompt } = req.body;

  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ error: "Profile payload is required" });
  }

  if (!apiKey) {
    return res.status(503).json({ error: "Gemini API key is not configured on the backend" });
  }

  const defaultPrompt = [
    "Create a practical personalized 7-day meal plan from this user profile.",
    "Return concise day-by-day meals (breakfast, lunch, dinner, snack), short prep notes, and a simple grocery list.",
    "Keep the format clear and readable.",
    `Profile JSON: ${JSON.stringify(profile)}`,
  ].join("\n");

  const promptText = typeof prompt === "string" && prompt.trim().length > 0 ? prompt : defaultPrompt;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    const responseJson = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const providerError = responseJson?.error?.message || "Gemini request failed";
      return res.status(502).json({ error: providerError });
    }

    const mealPlan = responseJson?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim();

    if (!mealPlan) {
      return res.status(502).json({ error: "Gemini returned an empty meal plan" });
    }

    return res.json({ mealPlan, model });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate meal plan", details: error.message });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
