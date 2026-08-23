/**
 * Seeds a starter set of curated IngredientKnowledge reference entries.
 * Idempotent — upserts by `name`, safe to re-run.
 *
 * Usage: node scripts/seed-ingredient-knowledge.js
 * Requires MONGODB_URI in the environment (or edit the constant below for a one-off run).
 */
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in the environment.");
  process.exit(1);
}

const ENTRIES = [
  {
    name: "monosodium glutamate",
    aliases: ["msg", "e621", "ajinomoto"],
    category: "additive",
    eNumber: "E621",
    description: "A flavor enhancer that intensifies savory (umami) taste, widely used in packaged and restaurant food.",
    concerns: [
      "Some people report headaches or flushing after large amounts, though controlled studies haven't confirmed a consistent cause at normal food-use levels.",
      "Considered safe by major food safety bodies (FSSAI, FDA, EFSA) at typical intake.",
    ],
    relatedConditions: ["Hypertension"],
  },
  {
    name: "sodium benzoate",
    aliases: ["e211"],
    category: "preservative",
    eNumber: "E211",
    description: "A common preservative that stops mold and bacteria growth in acidic foods and drinks.",
    concerns: [
      "Can form small amounts of benzene, a substance of concern, when combined with vitamin C and exposed to heat or light.",
      "Some studies have linked combinations of preservatives and artificial colors to hyperactivity in children.",
    ],
    relatedConditions: ["Other"],
  },
  {
    name: "high fructose corn syrup",
    aliases: ["hfcs", "corn syrup"],
    category: "nutrient",
    description: "A liquid sweetener made from corn starch, common in sodas, sauces, and packaged sweets.",
    concerns: [
      "Linked to increased risk of weight gain, fatty liver, and blood sugar spikes when consumed regularly.",
      "A meaningful source of added sugar even when a product doesn't taste very sweet.",
    ],
    relatedConditions: ["Diabetes", "Obesity", "Liver Disease"],
  },
  {
    name: "aspartame",
    aliases: ["e951"],
    category: "additive",
    eNumber: "E951",
    description: "An artificial sweetener roughly 200 times sweeter than sugar, used in \"diet\" and \"sugar-free\" products.",
    concerns: [
      "Contains phenylalanine — unsafe for anyone with phenylketonuria (PKU).",
      "The WHO's cancer research arm classified it as \"possibly carcinogenic\" in 2023 based on limited evidence; major food safety bodies still consider it safe within recommended daily limits.",
    ],
    relatedConditions: ["Other"],
  },
  {
    name: "palm oil",
    aliases: ["palm kernel oil"],
    category: "nutrient",
    description: "A vegetable oil high in saturated fat, used widely as a cheap, shelf-stable fat in packaged snacks and baked goods.",
    concerns: ["High saturated fat content can raise LDL cholesterol with regular heavy use."],
    relatedConditions: ["Heart Disease", "Obesity"],
  },
  {
    name: "sodium nitrite",
    aliases: ["e250"],
    category: "preservative",
    eNumber: "E250",
    description: "A preservative used in cured and processed meats (bacon, sausages, deli meats) to prevent bacterial growth and preserve color.",
    concerns: [
      "Can form nitrosamines, especially when the meat is cooked at high heat — linked to increased long-term cancer risk with regular heavy consumption.",
      "Also a direct sodium source, relevant for blood pressure.",
    ],
    relatedConditions: ["Hypertension", "Other"],
  },
  {
    name: "partially hydrogenated oil",
    aliases: ["trans fat", "hydrogenated vegetable oil"],
    category: "nutrient",
    description: "An industrially processed fat that stays solid at room temperature, once common in baked goods and fried snacks for shelf life.",
    concerns: [
      "Raises LDL (\"bad\") cholesterol and lowers HDL (\"good\") cholesterol — one of the most well-established dietary risk factors for heart disease.",
      "Restricted or banned in many countries, including limits under India's FSSAI regulations.",
    ],
    relatedConditions: ["Heart Disease", "Obesity"],
  },
  {
    name: "tartrazine",
    aliases: ["e102", "yellow 5", "fd&c yellow no. 5"],
    category: "additive",
    eNumber: "E102",
    description: "A synthetic yellow food coloring used in snacks, drinks, and sweets.",
    concerns: [
      "Some studies have linked it to hyperactivity in children.",
      "Can trigger reactions in people with asthma or a sensitivity to aspirin.",
    ],
    relatedConditions: ["Other"],
  },
  {
    name: "carrageenan",
    aliases: ["e407"],
    category: "additive",
    eNumber: "E407",
    description: "A thickener and stabilizer derived from red seaweed, common in dairy alternatives, ice cream, and processed meats.",
    concerns: ["Some research suggests it can irritate the digestive tract in sensitive individuals."],
    relatedConditions: ["IBS", "GERD"],
  },
  {
    name: "sorbitol",
    aliases: ["e420"],
    category: "nutrient",
    eNumber: "E420",
    description: "A sugar alcohol used as a low-calorie sweetener, common in \"sugar-free\" gum, candy, and diabetic-friendly products.",
    concerns: ["Can cause bloating, gas, or a laxative effect, especially in larger amounts or in people with a sensitive gut."],
    relatedConditions: ["IBS", "Diabetes"],
  },
  {
    name: "casein",
    aliases: ["milk protein", "caseinate"],
    category: "allergen",
    description: "The main protein found in milk and dairy products.",
    concerns: ["A common dairy allergen, distinct from lactose — relevant even for lactose-free products that still contain milk protein."],
    relatedConditions: ["Other"],
  },
  {
    name: "gluten",
    aliases: ["wheat", "barley", "rye", "malt"],
    category: "allergen",
    description: "A protein found in wheat, barley, and rye that gives baked goods their structure.",
    concerns: [
      "Must be strictly avoided by anyone with Celiac Disease, where it triggers an autoimmune reaction that damages the gut.",
      "Can also cause digestive discomfort in non-celiac gluten sensitivity.",
    ],
    relatedConditions: ["Celiac Disease", "IBS"],
  },
  {
    name: "caffeine",
    aliases: [],
    category: "nutrient",
    description: "A natural stimulant found in coffee, tea, energy drinks, and some sodas and chocolate products.",
    concerns: [
      "Can raise blood pressure and heart rate temporarily — worth monitoring for anyone managing hypertension or a heart condition.",
      "Can disrupt sleep and worsen anxiety at higher intakes.",
    ],
    relatedConditions: ["Hypertension", "Heart Disease"],
  },
  {
    name: "xanthan gum",
    aliases: ["e415"],
    category: "additive",
    eNumber: "E415",
    description: "A common thickener and stabilizer used in sauces, dressings, and gluten-free baking.",
    concerns: ["Generally well tolerated, but can cause bloating or digestive discomfort for some people in larger amounts."],
    relatedConditions: ["IBS"],
  },
  {
    name: "potassium sorbate",
    aliases: ["e202"],
    category: "preservative",
    eNumber: "E202",
    description: "A widely used preservative that prevents mold and yeast growth in food, drinks, and personal care products.",
    concerns: ["Considered one of the safer common preservatives; mild skin or allergic reactions are rare but reported."],
    relatedConditions: ["Other"],
  },
];

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    const Ingredients = mongoose.connection.collection("ingredientknowledges");
    let upserted = 0;
    for (const entry of ENTRIES) {
      await Ingredients.updateOne(
        { name: entry.name },
        { $set: { ...entry, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      upserted++;
    }
    console.log(`Seeded/updated ${upserted} IngredientKnowledge entries.`);
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
