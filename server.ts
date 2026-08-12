import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware with larger limit for base64 image uploads
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint 1: Analyze Food Image
app.post("/api/analyze-food", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg", notes = "" } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const ai = getGeminiClient();

    // Clean base64 string if it contains data URL prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are a world-class nutritionist and expert in Kurdish, Middle Eastern, and International cuisine.
Analyze this food image in high detail with maximum accuracy for calorie and macronutrient determination.
Identify the food items visible, taking into special consideration traditional Kurdish cooking styles and recipes (e.g. use of Kurdish butter/ghee/روغنی زەرد, lamb/beef fat ratio, rice oil absorption, dolma meat/rice filling, shfta frying, kebab fat content, stews like bamia/fasolia/qaysi, Tashrib bread soaking in broth, Kurdish flatbread/tir bread, etc.).

Calculate accurate nutritional estimates:
- Food Name in Kurdish (Sorani/کوردی) and English
- Estimated portion weight in grams (e.g. 250)
- Total Calories (kcal)
- Protein (grams)
- Carbohydrates (grams)
- Fats (grams)
- Fiber (grams)
- Health Score (integer from 1 to 10)
- Ingredients list (in Kurdish Sorani and English)
- Nutritional advice/tips (in Kurdish Sorani and English)
- Macro suitability tags (e.g. "High Protein", "Kurdish Special", "Low Carb", "Healthy Fats", "Balanced Meal")

User additional note or context: "${notes}"

Return strictly valid JSON corresponding to the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodNameKu: { type: Type.STRING, description: "Name of food in Kurdish Sorani" },
            foodNameEn: { type: Type.STRING, description: "Name of food in English" },
            estimatedWeightGrams: { type: Type.NUMBER, description: "Estimated weight in grams" },
            calories: { type: Type.NUMBER, description: "Total calories in kcal" },
            proteinGrams: { type: Type.NUMBER, description: "Protein in grams" },
            carbsGrams: { type: Type.NUMBER, description: "Carbohydrates in grams" },
            fatGrams: { type: Type.NUMBER, description: "Fats in grams" },
            fiberGrams: { type: Type.NUMBER, description: "Dietary fiber in grams" },
            healthScore: { type: Type.NUMBER, description: "Health score out of 10" },
            ingredientsKu: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients in Kurdish",
            },
            ingredientsEn: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients in English",
            },
            adviceKu: { type: Type.STRING, description: "Nutritional tip or advice in Kurdish" },
            adviceEn: { type: Type.STRING, description: "Nutritional tip or advice in English" },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Health tags like High Protein, Low Carb, Healthy Fats",
            },
          },
          required: [
            "foodNameKu",
            "foodNameEn",
            "estimatedWeightGrams",
            "calories",
            "proteinGrams",
            "carbsGrams",
            "fatGrams",
            "healthScore",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response received from Gemini AI");
    }

    const data = JSON.parse(response.text);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error analyzing food image:", err);
    return res.status(500).json({
      error: "شکستی هێنا لە شیکارکردنی وێنەکە. تکایە دڵنیابەوە لە هەبوونی کلیل یان وێنەکە ڕوونتر بێت.",
      details: err.message,
    });
  }
});

// API Endpoint 2: Smart Text Food Query / Search
app.post("/api/search-food", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert nutritionist and master of Kurdish and Middle Eastern culinary nutrition.
The user is searching for a food item or describing a meal in Kurdish or English: "${query}".

Identify the exact meal or food items described and calculate precise nutritional values (accounting for traditional Kurdish preparation methods, oil/ghee content, and realistic portion sizes):
- Name in Kurdish (Sorani/کوردی) and English
- Estimated portion description in Kurdish (e.g. "١ قاپ (٢٥٠گ)" or "١ سیخ (١٥٠گ)") and English
- Calories (kcal), Protein (g), Carbs (g), Fat (g), Fiber (g)
- Short nutritional insight/tip in Kurdish Sorani and English.

Return strictly JSON matching schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodNameKu: { type: Type.STRING },
            foodNameEn: { type: Type.STRING },
            portionDescriptionKu: { type: Type.STRING },
            portionDescriptionEn: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            proteinGrams: { type: Type.NUMBER },
            carbsGrams: { type: Type.NUMBER },
            fatGrams: { type: Type.NUMBER },
            fiberGrams: { type: Type.NUMBER },
            insightKu: { type: Type.STRING },
            insightEn: { type: Type.STRING },
          },
          required: ["foodNameKu", "foodNameEn", "calories", "proteinGrams", "carbsGrams", "fatGrams"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error searching food:", err);
    return res.status(500).json({ error: err.message });
  }
});

// API Endpoint 3: Generate Custom AI Meal Plan
app.post("/api/generate-meal-plan", async (req, res) => {
  try {
    const { targetCalories, targetProtein, targetCarbs, targetFat, goal, dietPreference = "Standard" } = req.body;

    const ai = getGeminiClient();

    const prompt = `Generate a delicious, realistic 1-day meal plan suited for Kurdish / Mediterranean / Middle Eastern or General preferences.
Target Daily Macros:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein} g
- Carbs: ${targetCarbs} g
- Fat: ${targetFat} g
Fitness Goal: ${goal}
Diet Preference: ${dietPreference}

Provide 4 meals (Breakfast, Lunch, Dinner, Snack).
For each meal include:
- Meal name in Kurdish and English
- Description & ingredients in Kurdish and English
- Calories, Protein, Carbs, Fat
- Preparation tip in Kurdish and English.

Return strictly JSON matching schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleKu: { type: Type.STRING },
            titleEn: { type: Type.STRING },
            summaryKu: { type: Type.STRING },
            summaryEn: { type: Type.STRING },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mealType: { type: Type.STRING, description: "Breakfast, Lunch, Dinner, or Snack" },
                  mealTypeKu: { type: Type.STRING, description: "بەیانیان, نیوەڕوان, ئێواران, یان ژەمی سووک" },
                  nameKu: { type: Type.STRING },
                  nameEn: { type: Type.STRING },
                  descriptionKu: { type: Type.STRING },
                  descriptionEn: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  proteinGrams: { type: Type.NUMBER },
                  carbsGrams: { type: Type.NUMBER },
                  fatGrams: { type: Type.NUMBER },
                  prepTipKu: { type: Type.STRING },
                  prepTipEn: { type: Type.STRING },
                },
                required: ["mealType", "nameKu", "nameEn", "calories", "proteinGrams", "carbsGrams", "fatGrams"],
              },
            },
          },
          required: ["titleKu", "titleEn", "meals"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error generating meal plan:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Vite or Static files handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
