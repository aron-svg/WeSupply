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

function toSafeNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toMealCount(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (parsed === 3 || parsed === 4 || parsed === 5) {
    return parsed;
  }
  return 3;
}

function buildMealPlanPrompt(profile) {
  const userName = profile.fullName || profile.user || "Aron";
  const mainGoal = profile.mainGoal || "Lose Weight";
  const age = toSafeNumber(profile.age, 25);
  const heightValue = toSafeNumber(profile.heightValue, 180);
  const weightValue = toSafeNumber(profile.weightValue, 70);
  const activityLevel = profile.activityLevel || "little to no exercise";
  const budgetAmount = toSafeNumber(profile.budgetAmount, 75);
  const budgetCadence = profile.budgetCadence || "weekly";
  const weeklyBudget = budgetCadence === "monthly" ? budgetAmount / 4 : budgetAmount;
  const dailyBudget = weeklyBudget / 7;
  const dietaryRestrictions = profile.dietaryRestrictions || "none";
  const expectedCalories = Math.round(
    toSafeNumber(profile.expectedCalorieIntake, toSafeNumber(profile.calculatedIntake, 1875))
  );
  const mealCount = toMealCount(profile.numberOfMeals);

  return [
    "Role: Expert nutritionist and private AI chef.",
    "Goal: Generate a strict, balanced and personalized DAILY meal plan.",
    "",
    "User Data (Variables):",
    `- User: ${userName}`,
    `- Main Goal: ${mainGoal}`,
    `- Profile: ${profile.gender || "male"}, ${age} years old, ${heightValue} ${profile.heightUnit || "cm"}, ${weightValue} ${profile.weightUnit || "kg"}, ${activityLevel}.`,
    `- Weekly Budget: ${weeklyBudget.toFixed(2)}`,
    `- Dietary Restrictions: ${dietaryRestrictions}`,
    `- Daily Target Calories: ${expectedCalories} kcal/day`,
    `- Number of meals requested: ${mealCount} meals/day`,
    "",
    "Production Rules:",
    `1. Calorie split: divide ${expectedCalories} kcal intelligently across exactly ${mealCount} meals.`,
    `2. Budget: every meal must stay economical to respect ${dailyBudget.toFixed(2)} per day.`,
    "3. No pork: strictly avoid pork and pork-derived ingredients.",
    "4. For each dish, include a youtube_search_link in this format:",
    '   https://www.youtube.com/results?search_query=[Nom+de+la+recette+saine+facile]',
    "",
    "Output format requirements:",
    "- Return STRICT JSON only.",
    "- No markdown, no explanations, no code fences.",
    "- Keep exact keys and structure below.",
    "",
    JSON.stringify(
      {
        user: userName,
        daily_goal_kcal: expectedCalories,
        number_of_meals: mealCount,
        meals: [
          {
            meal_index: 1,
            label: "Petit-dejeuner",
            recipe_name: "Nom du plat",
            calories: Math.round(expectedCalories / mealCount),
            macros: { p: "25g", c: "40g", f: "15g" },
            ingredients: ["ingredient 1", "ingredient 2"],
            cooking_time: "10 min",
            youtube_search_link:
              "https://www.youtube.com/results?search_query=recette+healthy+nom+du+plat",
          },
        ],
      },
      null,
      2
    ),
  ].join("\n");
}

app.post("/meal-plan/generate", authMiddleware, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const { profile, prompt } = req.body;

  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ error: "Profile payload is required" });
  }

  if (!apiKey) {
    return res.status(503).json({ error: "Gemini API key is not configured on the backend" });
  }

  const defaultPrompt = buildMealPlanPrompt(profile);

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
          generationConfig: {
            responseMimeType: "application/json",
          },
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

    let parsedMealPlan = mealPlan;
    try {
      parsedMealPlan = JSON.parse(mealPlan);
    } catch (_error) {
      // Keep raw text if provider did not return valid JSON.
    }

    return res.json({ mealPlan: parsedMealPlan, model });
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
