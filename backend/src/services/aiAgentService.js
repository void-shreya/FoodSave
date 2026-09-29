const db = require('../models/db');

/**
 * FoodSave AI Knowledge Base & Safety Matrix
 */
const SAFETY_KNOWLEDGE = {
  dangerZone: {
    minC: 4,
    maxC: 60,
    minF: 40,
    maxF: 140,
    maxHours: 2,
    rule: 'The "Temperature Danger Zone" is 4°C to 60°C (40°F - 140°F). Cooked perishable foods must not remain at room temperature for more than 2 hours before chilling or serving.'
  },
  categories: {
    'Cooked Meals': {
      recommendedShelfLifeHours: 8,
      maxShelfLifeHours: 24,
      storage: 'Keep piping hot above 60°C or rapid-chill below 4°C within 2 hours of cooking.',
      reheatGuideline: 'Must be reheated thoroughly to an internal core temperature of at least 75°C (165°F) before distribution.',
      packaging: 'Sealed food-grade aluminum catering trays, heat-resistant BPA-free containers with tight lids.'
    },
    'Bakery & Bread': {
      recommendedShelfLifeHours: 36,
      maxShelfLifeHours: 72,
      storage: 'Ambient dry storage. Keep away from direct sunlight and humidity. Bread with custard or cream fillings requires continuous refrigeration below 4°C.',
      packaging: 'Clean food-grade paper bakery bags, clear ventilated boxes, or sealed bread crates.'
    },
    'Fruits & Vegetables': {
      recommendedShelfLifeHours: 48,
      maxShelfLifeHours: 96,
      storage: 'Chilled between 2°C to 7°C for leafy greens, berries, and cut vegetables. Dry cool pantry for root crops and bananas.',
      packaging: 'Clean ventilated produce crates or food-grade biodegradable bags. Avoid completely airtight bags for raw greens.'
    },
    'Dairy Products': {
      recommendedShelfLifeHours: 48,
      maxShelfLifeHours: 72,
      storage: 'Continuous strict refrigeration between 1°C and 4°C. Never freeze in retail cardboard cartons.',
      packaging: 'Original commercial pasteurized seals intact. Discard any bloated, dented, or unsealed packs.'
    },
    'Packaged & Dry Goods': {
      recommendedShelfLifeHours: 720, // 30 days
      maxShelfLifeHours: 2160,
      storage: 'Cool, dry, pest-free ambient storage off the floor.',
      packaging: 'Original manufacturer unopened packaging with legible lot codes and best-by dates.'
    },
    'Beverages': {
      recommendedShelfLifeHours: 48,
      maxShelfLifeHours: 120,
      storage: 'Refrigerate fresh fruit juices and dairy blends. Ambient storage acceptable for sealed shelf-stable beverages.',
      packaging: 'Commercial sealed bottles or cans with intact seals.'
    }
  },
  prohibitedItems: [
    'Raw poultry, raw ground meats, or unpasteurized raw milk products without commercial refrigeration transfer protocols',
    'Partially eaten or unconsumed food returned from customer dining tables / buffet plate scrapings',
    'Home-canned or vacuum-sealed foods prepared without commercial food safety licenses',
    'Canned items with bulging lids, severe seam dents, rust, or leaking seals',
    'Food past its regulatory expiration date or displaying unusual odors, discoloration, or mold'
  ],
  allergens: [
    'Milk',
    'Eggs',
    'Fish (e.g., bass, flounder, cod)',
    'Crustacean shellfish (e.g., crab, lobster, shrimp)',
    'Tree nuts (e.g., almonds, walnuts, pecans)',
    'Peanuts',
    'Wheat / Gluten',
    'Soybeans',
    'Sesame'
  ]
};

/**
 * Intelligent NLP & Intent Classifier for FoodSave
 */
class AiAgentService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || null;
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Main entrypoint to answer user questions
   * @param {Object} params
   * @param {string} params.message - The user's query
   * @param {Array} params.history - Previous messages in chat
   * @param {Object} params.userContext - Authenticated user info (role, name)
   */
  async processQuery({ message, history = [], userContext = null }) {
    const trimmed = (message || '').trim();
    if (!trimmed) {
      return {
        reply: "Hello! I am your FoodSave AI Assistant. How can I help you today with food donations, safety guidelines, volunteer pickups, or community impact?",
        suggestedQuestions: [
          "How do I donate surplus food?",
          "What are the food safety rules?",
          "How can I volunteer to pick up meals?",
          "Show me current platform impact"
        ],
        actions: [
          { label: "Browse Available Food", path: "/donations" },
          { label: "Check Our Impact", path: "/impact" }
        ],
        modelUsed: "FoodSave-Assistant-v1"
      };
    }

    // Try External LLM if configured
    if (this.geminiApiKey) {
      try {
        const geminiReply = await this.callGemini({ message: trimmed, history, userContext });
        if (geminiReply) return geminiReply;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local FoodSave NLP engine:', err.message);
      }
    }

    if (this.openaiApiKey) {
      try {
        const openaiReply = await this.callOpenAI({ message: trimmed, history, userContext });
        if (openaiReply) return openaiReply;
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to local FoodSave NLP engine:', err.message);
      }
    }

    // High-performance Built-in FoodSave Knowledge Engine
    return await this.generateIntelligentResponse({ message: trimmed, history, userContext });
  }

  /**
   * Built-in FoodSave Autonomous Response Engine
   */
  async generateIntelligentResponse({ message, history, userContext }) {
    const q = message.toLowerCase();
    const role = userContext?.role || 'guest';
    const userName = userContext?.name || 'Friend';

    // Fetch live system statistics & available food for live grounding
    const impact = await db.getImpactMetrics();
    const stats = await db.getPlatformStats();
    const availableDonations = (await db.listDonations({ status: 'AVAILABLE' })).donations || [];
    const categories = await db.listCategories();

    // 1. GREETING & INTRO
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|what can you do)/i.test(q)) {
      return {
        reply: `👋 **Hello ${userName !== 'Friend' ? userName : 'there'}! Welcome to FoodSave.**\n\nI am your **FoodSave AI Assistant**, dedicated to helping our community *"Save Food, Share Hope, and Reduce Waste."*\n\nHere is how I can support you:\n- 🍲 **Food Safety & Quality Guidelines**: Temperature rules, storage limits, and allergen disclosures.\n- 📦 **Food Donors**: How to post surplus meals, packaging protocols, and auto-expiry.\n- 🚚 **Volunteers**: How to claim donations, coordinate pickups, and provide delivery verification.\n- 🏢 **NGOs & Shelters**: How to partner, request meal drops, and protect beneficiary dignity.\n- 📊 **Real-time Platform Data**: Query live saved meals (${impact.mealsRescued.toLocaleString()}+), active listings, and CO₂ offsets.\n\nWhat would you like to explore?`,
        suggestedQuestions: [
          "How do I donate surplus food?",
          "Are there available donations right now?",
          "What are the food safety guidelines?",
          "How does volunteer pickup work?"
        ],
        actions: [
          { label: "Find Food", path: "/donations" },
          { label: "Our Impact", path: "/impact" },
          { label: "Partner NGOs", path: "/ngo" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 2. LIVE IMPACT & METRICS
    if (/impact|metrics|how many meals|stats|statistics|co2|carbon|numbers|rescued so far|saved so far/i.test(q)) {
      return {
        reply: `📊 **FoodSave Live Community Impact Metrics**\n\nHere is our real-time impact to date:\n\n- 🍽️ **Meals Rescued & Shared**: **${impact.mealsRescued.toLocaleString()}** nutritious servings\n- ⚖️ **Weight Diverted from Landfills**: **${impact.kgRescued.toLocaleString()} kg** (${(impact.kgRescued * 2.20462).toFixed(1)} lbs)\n- 🌿 **CO₂ Emissions Prevented**: **${impact.co2SavedKg.toLocaleString()} kg CO₂e**\n- 👥 **Individuals & Families Nourished**: **${impact.peopleServed.toLocaleString()}+** people\n- 🤝 **Ecosystem Partners**: **${impact.activeDonors}** active donors, **${impact.activeVolunteers}** registered volunteers, and **${impact.ngosOnboarded}** verified NGOs.\n\nEvery meal donated directly combats food insecurity and reduces greenhouse gas emissions!`,
        suggestedQuestions: [
          "How can I donate food?",
          "How is CO2 savings calculated?",
          "Are there any donations waiting for pickup?"
        ],
        actions: [
          { label: "View Full Impact Page", path: "/impact" },
          { label: "Donate Food", path: "/donations/create" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 3. AVAILABLE DONATIONS RIGHT NOW (LIVE DATA LOOKUP)
    if (/available|current donations|any food|listings|find food|near me|active donations|what donations/i.test(q)) {
      if (availableDonations.length === 0) {
        return {
          reply: `🔍 **Active Donations Status**\n\nAll current food listings have been claimed or delivered right now! Thank you to our incredible network of volunteers.\n\nIf you have surplus food from a kitchen, catering event, or grocery, you can list it immediately to feed people in need.`,
          suggestedQuestions: [
            "How do I list surplus food?",
            "Notify me when food is available",
            "View partner NGOs"
          ],
          actions: [
            { label: "Create a Donation", path: "/donations/create" },
            { label: "View NGOs", path: "/ngo" }
          ],
          modelUsed: "FoodSave-Engine"
        };
      }

      const listHighlights = availableDonations.slice(0, 3).map((d, idx) => {
        const hoursLeft = Math.max(0, Math.round((new Date(d.expiry_time) - new Date()) / (1000 * 3600)));
        return `${idx + 1}. **${d.title}**\n   - 📦 Quantity: **${d.quantity} ${d.quantity_unit}** (${d.food_category})\n   - 📍 Location: ${d.pickup_city || 'San Francisco'} (${d.pickup_address})\n   - ⏳ Expiry: ~**${hoursLeft} hours remaining**\n   - 🌱 Dietary: ${d.vegetarian ? 'Vegetarian' : 'Standard'}${d.vegan ? ' (Vegan)' : ''}`;
      }).join('\n\n');

      return {
        reply: `🍲 **Currently Available Donations (${availableDonations.length} Active)**\n\nHere are some of the fresh food listings ready for pickup right now:\n\n${listHighlights}\n\nVolunteers and NGOs can claim these items immediately to arrange transit to local shelters.`,
        suggestedQuestions: [
          "How do I claim a donation?",
          "What equipment do volunteers need?",
          "How long does pickup take?"
        ],
        actions: [
          { label: "Browse All Listings", path: "/donations" },
          { label: "Volunteer Sign In", path: "/login" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 4. FOOD SAFETY & TEMPERATURE GUIDELINES
    if (/safety|temperature|danger zone|safe to eat|spoiled|bacteria|storage|reheat|cooked food|how long.*keep|shelf life/i.test(q)) {
      return {
        reply: `🛡️ **FoodSave Food Safety & Hygiene Standards**\n\nWe prioritize food safety above all else. Here are the core regulations:\n\n1. **The 2-Hour / 4-Hour Temperature Rule**:\n   - **Danger Zone**: 4°C to 60°C (40°F - 140°F).\n   - Cooked food must be kept above 60°C (140°F) or rapidly cooled to below 4°C (40°F) within **2 hours**.\n   - Cooked food kept in the danger zone for more than 4 hours must be discarded.\n\n2. **Mandatory Safety Confirmation**:\n   - Every donor must check the food safety warranty affirming the food was prepared in a sanitary kitchen, kept at safe temperatures, and is within edible shelf life.\n\n3. **Proper Reheating**:\n   - Any pre-cooked dish must be reheated to a minimum core temperature of **75°C (165°F)** before serving to beneficiaries.\n\n4. **Automated Expiry**:\n   - Listings on FoodSave have strict expiration times and are automatically marked \`EXPIRED\` by our background cron system once the deadline passes.\n\nWould you like guidance for a specific food category (Cooked Meals, Bakery, Produce, Dairy)?`,
        suggestedQuestions: [
          "How to safely store Cooked Meals?",
          "What packaging should I use?",
          "What items cannot be donated?"
        ],
        actions: [
          { label: "List Food Safely", path: "/donations/create" },
          { label: "View Safety Rules", path: "/donations" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 5. PACKAGING & CONTAINERS
    if (/packag|container|box|aluminum|foil|lid|how to pack/i.test(q)) {
      return {
        reply: `📦 **Food Packaging & Hygiene Protocols**\n\nTo ensure dignity and safety for recipients:\n\n- **Prepared / Hot Meals**: Use food-grade aluminum catering trays with crimped lids, or durable leakproof BPA-free deli containers.\n- **Bakery Items**: Clean paper bread bags, cardboard bakery boxes, or clear ventilated clamshell containers.\n- **Fresh Produce**: Breathable clean produce crates or ventilated paper/plastic bags.\n- **Labeling Requirements**:\n  - Clearly label the dish name.\n  - Mark the exact preparation date and time.\n  - Note any potential major allergens (Dairy, Nuts, Gluten, Eggs, etc.).\n  - Mark "Keep Refrigerated" or "Serve Immediately".`,
        suggestedQuestions: [
          "What food items are prohibited?",
          "How do volunteers transport food?",
          "How do I list surplus food?"
        ],
        actions: [
          { label: "Create Donation Listing", path: "/donations/create" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 6. PROHIBITED FOOD ITEMS
    if (/prohibit|cannot donate|banned|allowed|what can i not|what food.*accept/i.test(q)) {
      return {
        reply: `🚫 **Items That Cannot Be Donated on FoodSave**\n\nTo safeguard vulnerable communities, the following items are strictly prohibited:\n\n${SAFETY_KNOWLEDGE.prohibitedItems.map(item => `❌ ${item}`).join('\n')}\n\n✅ **Acceptable Items**: Freshly cooked catering surplus, untouched commercial kitchen preparations, day-end bakery items, fresh uncut produce, and sealed packaged dry goods.`,
        suggestedQuestions: [
          "Can I donate cooked rice and curry?",
          "Can I donate bakery bread?",
          "What if food is near expiration?"
        ],
        actions: [
          { label: "Browse Allowed Categories", path: "/donations" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 7. ALLERGENS
    if (/allergen|allergy|nuts|gluten|dairy|peanut|vegan|vegetarian|dietary/i.test(q)) {
      return {
        reply: `⚠️ **Allergen Transparency on FoodSave**\n\nFood allergies can be life-threatening. FoodSave enforces strict allergen declarations:\n\n- Donors **must disclose** if food contains any of the **9 major allergens**:\n  ${SAFETY_KNOWLEDGE.allergens.map(a => `• ${a}`).join(', ')}.\n- **Dietary Badges**: Listings clearly indicate whether food is **Vegetarian**, **Vegan**, or **Allergen-Free**.\n- Volunteers and NGOs can filter listings directly by dietary criteria so sensitive shelters receive suitable items.`,
        suggestedQuestions: [
          "How do NGOs filter for vegetarian meals?",
          "What food safety checks exist?",
          "How do I create a donation?"
        ],
        actions: [
          { label: "Filter Food Listings", path: "/donations" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 8. HOW TO DONATE FOOD (DONOR FLOW)
    if (/how to donate|how do i donate|post food|list food|restaurant.*surplus|caterer|donor/i.test(q)) {
      return {
        reply: `👨‍🍳 **How to Donate Food on FoodSave (3 Simple Steps)**\n\n1. **Sign Up as a Donor**:\n   - Register as an individual donor, restaurant, catering business, bakery, or hostel.\n2. **List Your Surplus**:\n   - Click **"+ Donate Food"**.\n   - Enter title, food category, quantity (servings/kg), preparation time, and expiration time.\n   - Confirm the mandatory **Food Safety Warranty**.\n3. **Hand Over to Volunteer / NGO**:\n   - When an authorized volunteer or NGO claims your donation, you will receive an instant notification.\n   - Hand over the packaged food and verify pickup!`,
        suggestedQuestions: [
          "Is donating food safe from liability?",
          "Can I cancel a donation if plans change?",
          "What happens if no volunteer claims it?"
        ],
        actions: [
          { label: "Create Donation Listing", path: "/donations/create" },
          { label: "View My Donations", path: "/my-donations" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 9. HOW TO VOLUNTEER & PICKUP (VOLUNTEER FLOW)
    if (/volunteer|pickup|courier|transport|deliver|how to collect|bicycle|car/i.test(q)) {
      return {
        reply: `🚴 **How Volunteering Works on FoodSave**\n\nVolunteers are the vital bridge between surplus kitchens and hungry bellies!\n\n1. **Sign Up as a Volunteer**:\n   - Create an account with the "Volunteer" role.\n2. **Claim an Available Donation**:\n   - Browse the **Find Food** page and click **"Request Pickup"** on any active listing.\n   - Once claimed, the item is reserved exclusively for you (row-locked to prevent double-booking).\n3. **Collect & Verify**:\n   - Travel to the pickup address with clean, insulated bags.\n   - Confirm the food looks and smells fresh.\n   - Mark **"Collected"** in your Pickups dashboard.\n4. **Deliver with Proof**:\n   - Transport directly to the designated NGO community dining hall or shelter.\n   - Upload a delivery photo proof or note, and mark **"Delivered"**!`,
        suggestedQuestions: [
          "Do I need a car or can I use a bike?",
          "What if the food appears spoiled upon pickup?",
          "How do I see my active pickups?"
        ],
        actions: [
          { label: "Find Donations to Pick Up", path: "/donations" },
          { label: "My Pickups Dashboard", path: "/pickups" },
          { label: "Delivery Records", path: "/deliveries" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 10. NGOS & BENEFICIARIES (NGO FLOW)
    if (/ngo|shelter|charity|beneficiar|register ngo|community kitchen|people in need/i.test(q)) {
      return {
        reply: `🤝 **For NGOs & Community Shelters**\n\nFoodSave empowers verified NGOs and soup kitchens to secure free, reliable, nutritious meals:\n\n- **Direct Claims**: Registered NGOs can claim large batches of food directly for their community kitchens.\n- **Beneficiary Tracking**: NGOs can register groups of people in need (e.g., senior centers, children's homes, low-income families) with headcount tracking while strictly protecting recipient personal privacy.\n- **Verification**: NGOs submit their registration credentials to receive verified status from platform administrators.`,
        suggestedQuestions: [
          "How do we get verified as an NGO?",
          "How do we manage beneficiaries?",
          "Can we request regular recurring pickups?"
        ],
        actions: [
          { label: "View Partner NGOs", path: "/ngo" },
          { label: "Manage Beneficiaries", path: "/ngo/beneficiaries" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 11. PRIVACY & BENEFICIARY SAFETY
    if (/privacy|confidential|beneficiary data|vulnerable|is it safe/i.test(q)) {
      return {
        reply: `🔒 **Privacy & Dignity Protection on FoodSave**\n\nProtecting vulnerable populations is fundamental to our mission:\n\n- **Anonymized Beneficiaries**: Beneficiary entries use group categories (e.g., "Downtown Senior Residence", "Youth Center") and aggregated headcount numbers without recording individual recipient IDs or sensitive personal records.\n- **Encrypted & Role-Guarded**: Donor pickup details and NGO shelter delivery points are restricted to verified volunteers and authenticated stakeholders.\n- **Zero Commercial Data Selling**: FoodSave is a humanitarian zero-waste initiative. We never monetize or sell user data.`,
        suggestedQuestions: [
          "Who can see my pickup address?",
          "How do volunteer background checks work?",
          "How does FoodSave prevent waste?"
        ],
        actions: [
          { label: "Explore Platform Security", path: "/impact" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 12. CANCELLATION & PROBLEMS
    if (/cancel|cannot pick up|late|report|problem|complaint|issue/i.test(q)) {
      return {
        reply: `⚠️ **Managing Cancellations & Issues**\n\n- **Donors**: You can cancel an active donation from your **"My Donations"** screen at any time before it has been marked collected.\n- **Volunteers**: If an emergency prevents you from completing a pickup, notify the platform promptly so the donation can be released back to the community.\n- **Report Quality Concerns**: If any food fails inspection, volunteers can file a report from their dashboard. Our trust & safety team reviews every report.`,
        suggestedQuestions: [
          "How do I submit a report?",
          "What if food is spoiled upon arrival?",
          "How do I contact support?"
        ],
        actions: [
          { label: "My Donations", path: "/my-donations" },
          { label: "Pickups", path: "/pickups" }
        ],
        modelUsed: "FoodSave-Engine"
      };
    }

    // 13. SOUGHT CATEGORY ADVICE (Cooked, Bakery, Produce, Dairy, etc.)
    const matchedCategory = categories.find(c => q.includes(c.name.toLowerCase()));
    if (matchedCategory) {
      const guide = SAFETY_KNOWLEDGE.categories[matchedCategory.name];
      if (guide) {
        return {
          reply: `🍲 **Safety Guidelines for ${matchedCategory.name}**\n\n- **Optimal Safe Time**: Within ~${guide.recommendedShelfLifeHours} hours of preparation (Max limit: ${guide.maxShelfLifeHours} hours under proper conditions).\n- **Temperature & Storage**: ${guide.storage}\n- **Packaging Recommendation**: ${guide.packaging}\n${guide.reheatGuideline ? `- **Reheating**: ${guide.reheatGuideline}\n` : ''}\nWould you like to list surplus ${matchedCategory.name} now?`,
          suggestedQuestions: [
            `Donate ${matchedCategory.name}`,
            "What packaging is required?",
            "View allergen checklist"
          ],
          actions: [
            { label: `Donate ${matchedCategory.name}`, path: "/donations/create" },
            { label: "Browse Listings", path: "/donations" }
          ],
          modelUsed: "FoodSave-Engine"
        };
      }
    }

    // 14. DEFAULT CONTEXTUAL ASSISTANCE
    return {
      reply: `I can certainly help you with that! At **FoodSave**, we empower restaurants, caterers, volunteers, and NGOs to rescue food and eliminate hunger.\n\nCould you clarify if you are asking as a **Food Donor**, a **Volunteer Courier**, an **NGO Shelter**, or looking for **Food Safety Regulations**? \n\nYou can also click any of the quick suggestions below:`,
      suggestedQuestions: [
        "How do I donate food safely?",
        "Are there available meals right now?",
        "How does volunteer delivery work?",
        "What are the 9 major allergens?",
        "Show current platform impact"
      ],
      actions: [
        { label: "Browse Food Donations", path: "/donations" },
        { label: "View Live Impact", path: "/impact" },
        { label: "Sign Up / Log In", path: "/login" }
      ],
      modelUsed: "FoodSave-Engine"
    };
  }

  /**
   * Automated Food Safety Evaluation Matrix
   */
  async evaluateFoodSafety(data) {
    const {
      food_category,
      prepared_at,
      expiry_time,
      contains_allergens,
      allergen_details,
      quantity,
      quantity_unit
    } = data;

    let score = 100;
    const warnings = [];
    const recommendations = [];

    const now = new Date();
    const prepDate = prepared_at ? new Date(prepared_at) : now;
    const expDate = expiry_time ? new Date(expiry_time) : new Date(now.getTime() + 6 * 3600 * 1000);

    const elapsedHours = (now.getTime() - prepDate.getTime()) / (3600 * 1000);
    const remainingHours = (expDate.getTime() - now.getTime()) / (3600 * 1000);

    // Rule 1: Expiry in the past or before prep
    if (expDate <= prepDate) {
      score -= 50;
      warnings.push("Expiration date cannot be earlier than or equal to preparation time.");
    }

    if (remainingHours <= 0) {
      score -= 40;
      warnings.push("This food has already reached its expiration timestamp.");
    } else if (remainingHours < 2) {
      score -= 15;
      warnings.push("Only less than 2 hours remaining until expiration. Urgent pickup is critical.");
    }

    // Rule 2: Cooked meals shelf-life check
    if (food_category === 'Cooked Meals') {
      if (elapsedHours > 6) {
        score -= 20;
        warnings.push("Cooked food prepared more than 6 hours ago requires verified cold storage (< 4°C).");
      }
      recommendations.push("Ensure food is kept above 60°C or refrigerated under 4°C during staging.");
      recommendations.push("Recipient should reheat to at least 75°C (165°F) before eating.");
    }

    // Rule 3: Allergens disclosure
    if (contains_allergens && (!allergen_details || allergen_details.trim().length === 0)) {
      score -= 20;
      warnings.push("Allergens are flagged as present, but no specific allergen names were entered.");
    } else if (contains_allergens) {
      recommendations.push(`Clearly label packaging with identified allergens: "${allergen_details}".`);
    }

    // Category specific tips
    const catGuide = SAFETY_KNOWLEDGE.categories[food_category];
    if (catGuide) {
      recommendations.push(catGuide.storage);
      recommendations.push(`Packaging: ${catGuide.packaging}`);
    }

    let status = 'APPROVED';
    if (score < 50 || remainingHours <= 0) {
      status = 'REJECTED';
    } else if (score < 80) {
      status = 'CAUTION';
    }

    return {
      safetyScore: Math.max(0, score),
      status,
      warnings,
      recommendations,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Gemini 1.5/2.0 Integration via REST
   */
  async callGemini({ message, history, userContext }) {
    const impact = await db.getImpactMetrics();
    const systemPrompt = `You are the FoodSave AI Assistant, a food-rescue, food-safety, and hunger-relief expert assistant.
Platform tagline: "Save Food. Share Hope. Reduce Waste."
Current platform metrics:
- Meals Rescued: ${impact.mealsRescued}
- Food Saved: ${impact.kgRescued} kg
- CO2 Saved: ${impact.co2SavedKg} kg
- People Served: ${impact.peopleServed}
- Active Donors: ${impact.activeDonors}, Volunteers: ${impact.activeVolunteers}, NGOs: ${impact.ngosOnboarded}

Food Safety Guidelines:
- Danger zone: 4°C to 60°C (40°F - 140°F). Max 2 hours at room temp.
- Reheat temperature: 75°C (165°F).
- Mandatory safety warranty for donors.
- All 9 major allergens must be disclosed.

Keep responses concise, warm, helpful, structured with markdown bullet points, and encouraging. Never recommend spoiled or unsafe food.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...history.slice(-4).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('Empty Gemini response');

    return {
      reply: replyText,
      suggestedQuestions: [
        "What are the food safety guidelines?",
        "How do I donate surplus meals?",
        "How can I volunteer to pick up food?",
        "Check platform impact stats"
      ],
      actions: [
        { label: "Browse Donations", path: "/donations" },
        { label: "Our Impact", path: "/impact" }
      ],
      modelUsed: "Gemini-1.5-Flash"
    };
  }

  /**
   * OpenAI API Integration via REST
   */
  async callOpenAI({ message, history, userContext }) {
    const impact = await db.getImpactMetrics();
    const systemPrompt = `You are the FoodSave AI Assistant for a food rescue app ("Save Food. Share Hope. Reduce Waste.").
Meals saved: ${impact.mealsRescued}, CO2 saved: ${impact.co2SavedKg}kg.
Provide accurate food safety rules (temperature danger zone 4C-60C, max 2h), donation steps, and volunteer delivery instructions. Be concise, polite, and markdown formatted.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI HTTP error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content;
    if (!replyText) throw new Error('Empty OpenAI response');

    return {
      reply: replyText,
      suggestedQuestions: [
        "What are the food safety rules?",
        "How do I donate surplus food?",
        "How can I volunteer to pick up food?"
      ],
      actions: [
        { label: "Browse Donations", path: "/donations" },
        { label: "Our Impact", path: "/impact" }
      ],
      modelUsed: "GPT-4o-mini"
    };
  }

  /**
   * Categorized Quick Prompts for customers
   */
  getQuickPrompts() {
    return [
      {
        category: "Food Safety & Regulations",
        icon: "ShieldCheck",
        prompts: [
          "What is the Temperature Danger Zone for cooked food?",
          "How long can cooked meals safely be kept before distribution?",
          "What food packaging materials are required?",
          "What food items are strictly prohibited on FoodSave?"
        ]
      },
      {
        category: "Food Donors",
        icon: "Utensils",
        prompts: [
          "How do I create and publish a surplus food listing?",
          "What happens if no volunteer claims my donation before expiry?",
          "Can restaurants and bakeries donate every day?",
          "How do I disclose allergens properly?"
        ]
      },
      {
        category: "Volunteers & Couriers",
        icon: "Truck",
        prompts: [
          "How do I claim a donation for pickup?",
          "What should I do if the food seems questionable upon pickup?",
          "How do I submit proof of delivery to the shelter?",
          "Can I volunteer using a bicycle or walking?"
        ]
      },
      {
        category: "Community Impact & Live Data",
        icon: "Sparkles",
        prompts: [
          "Are there any available food donations right now?",
          "How many meals has FoodSave rescued so far?",
          "How is environmental CO2 reduction calculated?",
          "How are vulnerable people's privacy protected?"
        ]
      }
    ];
  }
}

module.exports = new AiAgentService();
