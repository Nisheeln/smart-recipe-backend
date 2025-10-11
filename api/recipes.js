const { OpenAI } = require("openai");

module.exports = async function (req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // <- now this will find the key

    const { ingredients, difficulty, time, dietaryPreference } = req.body;
    if (!ingredients || ingredients.length === 0)
      return res.status(400).json({ error: "Ingredients are required" });

    const prompt = `
Generate 10 unique recipes with:
- Ingredients: ${ingredients.join(", ")}
- Difficulty: ${difficulty || "Medium"}
- Cooking time: ${time || 30} minutes
- Dietary: ${dietaryPreference || "any"}

Return strict JSON:
{
  "recipes": [
    {
      "title": "string",
      "cuisine": "string",
      "difficulty": "string",
      "cook_time": number,
      "ingredients": ["ingredient1", "ingredient2"],
      "steps": ["step1", "step2"],
      "nutrition": { "calories": number, "protein": number }
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful recipe generator assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recipes", details: err.message });
  }
};
