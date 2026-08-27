const initialDishes = [
  {
    name: "Avocado & Spinach Sourdough Toast",
    category: "Breakfast",
    description: "Creamy smashed avocado on whole grain sourdough, topped with baby spinach, poached egg, and hemp seeds. Rich in essential folate and choline.",
    prep_time_minutes: 10,
    calories: 360,
    protein_g: 14,
    carbs_g: 34,
    fat_g: 18,
    folate_mcg: 195,
    iron_mg: 3.4,
    calcium_mg: 85,
    dha_mg: 40,
    trimester_recommendation: "Trimester 1 & 2",
    dietary_tags: "Vegetarian, High Folate, Choline Boost",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Toast thick slice of artisan whole grain sourdough until golden crisp.",
      "In a small bowl, mash 1/2 ripe avocado with a squeeze of fresh lemon juice, sea salt, and black pepper.",
      "Lightly steam or wilt a handful of washed baby spinach in a pan (1 minute).",
      "Poach or soft-boil a pasture-raised egg to 160°F+ (safe cooked yolk for pregnancy).",
      "Spread avocado over toast, layer wilted spinach, place the egg, and sprinkle with toasted hemp seeds."
    ]),
    ingredients: JSON.stringify([
      "1 slice whole grain sourdough bread",
      "1/2 ripe Haas avocado",
      "1 cup fresh baby spinach",
      "1 organic pasture-raised egg",
      "1 tsp lemon juice",
      "1 tsp hemp seeds",
      "Pinch of pink Himalayan sea salt & black pepper"
    ]),
    is_favorite: 1
  },
  {
    name: "Wild Salmon & Quinoa Harvest Bowl",
    category: "Lunch",
    description: "Pan-seared Alaskan wild salmon over fluffy tri-color quinoa, roasted sweet potatoes, steamed broccoli florets, and a creamy tahini ginger drizzle.",
    prep_time_minutes: 20,
    calories: 510,
    protein_g: 36,
    carbs_g: 44,
    fat_g: 21,
    folate_mcg: 140,
    iron_mg: 4.8,
    calcium_mg: 130,
    dha_mg: 620,
    trimester_recommendation: "Trimester 2 & 3",
    dietary_tags: "High DHA, Rich in Iron, Gluten-Free",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Rinse and cook tri-color quinoa in vegetable broth according to package directions (15 min).",
      "Cube sweet potatoes and roast at 400°F (200°C) with 1 tsp olive oil for 18 minutes until tender.",
      "Season fresh wild salmon fillet with lemon, dill, and a dash of olive oil. Sear skin-side down for 4 mins, flip and cook through (internal temp 145°F).",
      "Lightly steam broccoli florets for 3-4 minutes until vibrant green.",
      "Assemble bowl: bed of quinoa, topped with salmon, sweet potatoes, broccoli, and drizzle with tahini dressing."
    ]),
    ingredients: JSON.stringify([
      "5 oz wild-caught Alaskan salmon fillet",
      "1/2 cup cooked tri-color quinoa",
      "1/2 medium sweet potato (cubed)",
      "1 cup broccoli florets",
      "1 tbsp creamy sesame tahini",
      "1 tsp grated fresh ginger",
      "1 tbsp extra virgin olive oil",
      "Fresh dill & lemon wedge"
    ]),
    is_favorite: 1
  },
  {
    name: "Greek Yogurt & Mixed Berry Chia Parfait",
    category: "Breakfast",
    description: "Creamy organic Greek yogurt layered with antioxidant-packed blackberries, blueberries, chia seeds, and raw pumpkin seeds for bone and digestive health.",
    prep_time_minutes: 5,
    calories: 280,
    protein_g: 20,
    carbs_g: 30,
    fat_g: 8,
    folate_mcg: 65,
    iron_mg: 2.1,
    calcium_mg: 320,
    dha_mg: 0,
    trimester_recommendation: "All Trimesters",
    dietary_tags: "High Calcium, Probiotic, Vegetarian",
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Spoon half of the Greek yogurt into a glass or bowl.",
      "Add a layer of mixed blueberries and blackberries.",
      "Sprinkle 1 tsp chia seeds and pumpkin seeds.",
      "Layer the remaining Greek yogurt and top with remaining berries, a drizzle of pure honey or maple syrup, and walnuts."
    ]),
    ingredients: JSON.stringify([
      "3/4 cup plain whole-milk Greek yogurt (pasteurized)",
      "1/2 cup organic mixed berries (blueberries, raspberries, blackberries)",
      "1 tbsp black chia seeds",
      "1 tbsp raw pumpkin seeds (pepitas)",
      "1 tsp pure honey or maple syrup",
      "1 tbsp crushed raw walnuts"
    ]),
    is_favorite: 0
  },
  {
    name: "Golden Lentil & Sweet Potato Coconut Curry",
    category: "Dinner",
    description: "Hearty red lentils simmered in mild coconut milk, turmeric, ginger, tomatoes, and tender baby kale. Packed with bioavailable non-heme iron and folate.",
    prep_time_minutes: 25,
    calories: 430,
    protein_g: 22,
    carbs_g: 56,
    fat_g: 12,
    folate_mcg: 260,
    iron_mg: 6.9,
    calcium_mg: 155,
    dha_mg: 0,
    trimester_recommendation: "Trimester 2",
    dietary_tags: "High Iron, High Folate, Vegan, Gluten-Free",
    image_url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "In a medium pot, sauté diced yellow onion, minced garlic, and fresh grated ginger in 1 tsp coconut oil.",
      "Add ground turmeric, cumin, and mild sweet curry powder. Stir for 30 seconds until aromatic.",
      "Add rinsed red lentils, diced sweet potato, canned crushed tomatoes, and light coconut milk with vegetable broth.",
      "Simmer covered on low heat for 18 minutes until lentils and potatoes are soft.",
      "Stir in baby kale or spinach in the last 2 minutes until wilted. Finish with a squeeze of fresh lime juice (Vitamin C enhances iron absorption!)."
    ]),
    ingredients: JSON.stringify([
      "1/2 cup dry red split lentils (rinsed)",
      "1 small sweet potato (peeled & diced)",
      "1/2 cup light coconut milk",
      "1 cup low-sodium vegetable broth",
      "1 cup chopped baby kale or spinach",
      "1/2 tsp ground turmeric",
      "1 clove garlic & 1/2 tsp grated ginger",
      "1/2 fresh lime juice"
    ]),
    is_favorite: 1
  },
  {
    name: "Berry & Kale Prenatal Glow Smoothie",
    category: "Snack",
    description: "Energizing cold smoothie blended with baby kale, frozen wild blueberries, banana, coconut water, and a scoop of pregnancy-safe plant protein.",
    prep_time_minutes: 5,
    calories: 230,
    protein_g: 12,
    carbs_g: 40,
    fat_g: 3,
    folate_mcg: 175,
    iron_mg: 3.1,
    calcium_mg: 180,
    dha_mg: 0,
    trimester_recommendation: "All Trimesters",
    dietary_tags: "Hydration Boost, High Folate, Vegan",
    image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Add coconut water or almond milk to the blender first.",
      "Add baby kale leaves, frozen banana slices, and wild frozen blueberries.",
      "Add flaxseed meal and unsweetened vanilla plant protein.",
      "Blend on high speed for 60 seconds until completely smooth and velvety.",
      "Pour into chilled glass and enjoy immediately."
    ]),
    ingredients: JSON.stringify([
      "1 cup unsweetened coconut water or fortified almond milk",
      "1 cup fresh baby kale or baby spinach",
      "1/2 cup frozen wild blueberries",
      "1/2 ripe banana",
      "1 tbsp ground golden flaxseed",
      "1 scoop pure unsweetened protein powder (optional)"
    ]),
    is_favorite: 0
  },
  {
    name: "Grilled Lemon Herb Chicken & Roasted Veggies",
    category: "Dinner",
    description: "Tender herb-marinated chicken breast served alongside roasted asparagus spears, zucchini, and steamed baby gold potatoes.",
    prep_time_minutes: 25,
    calories: 460,
    protein_g: 42,
    carbs_g: 32,
    fat_g: 16,
    folate_mcg: 125,
    iron_mg: 3.6,
    calcium_mg: 95,
    dha_mg: 30,
    trimester_recommendation: "Trimester 2 & 3",
    dietary_tags: "High Protein, Lean Energy, Gluten-Free",
    image_url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Marinate organic chicken breast in olive oil, lemon juice, minced rosemary, thyme, garlic, salt, and pepper for 15 mins.",
      "Toss asparagus and zucchini rounds with olive oil and sea salt.",
      "Grill or sear chicken in a grill pan over medium-high heat until fully cooked (165°F / 74°C internal temp).",
      "Roast vegetables in oven at 400°F (200°C) for 12 minutes.",
      "Serve hot with steamed baby gold potatoes seasoned with fresh parsley."
    ]),
    ingredients: JSON.stringify([
      "6 oz organic boneless skinless chicken breast",
      "8 fresh asparagus spears (trimmed)",
      "1/2 medium zucchini (sliced)",
      "3 small baby gold potatoes",
      "1 tbsp extra virgin olive oil",
      "1 tbsp fresh lemon juice",
      "Fresh rosemary & thyme leaves"
    ]),
    is_favorite: 0
  },
  {
    name: "Warm Oatmeal with Stewed Apples & Walnuts",
    category: "Breakfast",
    description: "Rolled oats cooked in almond milk, topped with cinnamon-stewed Honeycrisp apples, walnuts, and a splash of pure maple syrup. Soothing for morning digestion.",
    prep_time_minutes: 12,
    calories: 340,
    protein_g: 10,
    carbs_g: 52,
    fat_g: 11,
    folate_mcg: 70,
    iron_mg: 2.8,
    calcium_mg: 210,
    dha_mg: 0,
    trimester_recommendation: "Trimester 1 & 2",
    dietary_tags: "High Fiber, Gentle on Stomach, Vegetarian",
    image_url: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "In a small skillet, sauté diced apples with 1 tsp butter or coconut oil, cinnamon, and 1 tbsp water for 5 mins until soft.",
      "In a pot, bring almond milk to a gentle boil, add rolled oats and a pinch of salt.",
      "Simmer for 5-7 minutes stirring occasionally until creamy.",
      "Transfer oatmeal to bowl, spoon warm stewed apples over top, and garnish with chopped walnuts and maple syrup."
    ]),
    ingredients: JSON.stringify([
      "1/2 cup gluten-free rolled oats",
      "1 cup fortified almond milk",
      "1/2 Honeycrisp apple (cored and diced)",
      "1/2 tsp ground Ceylon cinnamon",
      "2 tbsp raw walnut halves",
      "1 tsp pure maple syrup"
    ]),
    is_favorite: 1
  },
  {
    name: "Mediterranean Chickpea & Shakshuka Skillet",
    category: "Lunch",
    description: "Pasture-raised eggs gently poached in rich spiced tomato-bell pepper stew with organic chickpeas and crumbled feta cheese. Exceptional choline and folate synergy.",
    prep_time_minutes: 18,
    calories: 410,
    protein_g: 21,
    carbs_g: 38,
    fat_g: 19,
    folate_mcg: 220,
    iron_mg: 4.5,
    calcium_mg: 210,
    dha_mg: 35,
    trimester_recommendation: "Trimester 2 & 3",
    dietary_tags: "Vegetarian, Choline Rich, High Iron",
    image_url: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Sauté diced red bell pepper, sweet onion, and garlic in extra virgin olive oil with cumin and smoked paprika.",
      "Pour in crushed plum tomatoes and drained chickpeas; simmer for 8 minutes until sauce thickens.",
      "Make small wells in sauce and crack 2 eggs. Cover pan and simmer until egg whites are set and yolks are cooked to 160°F+.",
      "Garnish with crumbled feta and fresh cilantro or parsley."
    ]),
    ingredients: JSON.stringify([
      "2 organic eggs",
      "1/2 cup cooked chickpeas",
      "1 cup crushed canned San Marzano tomatoes",
      "1/2 red bell pepper (diced)",
      "2 tbsp crumbled pasteurized feta cheese",
      "1 tbsp extra virgin olive oil",
      "Fresh cilantro & ground cumin"
    ]),
    is_favorite: 1
  },
  {
    name: "Creamy Butternut Squash & Bone Broth Bisque",
    category: "Dinner",
    description: "Silky roasted butternut squash pureed with collagen-rich bone broth, roasted garlic, and toasted pepitas. Calming for digestion and supports maternal joint elasticity.",
    prep_time_minutes: 20,
    calories: 320,
    protein_g: 18,
    carbs_g: 42,
    fat_g: 9,
    folate_mcg: 130,
    iron_mg: 3.2,
    calcium_mg: 160,
    dha_mg: 0,
    trimester_recommendation: "All Trimesters",
    dietary_tags: "Collagen Boost, High Vitamin A, Comfort Food",
    image_url: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    recipe_steps: JSON.stringify([
      "Roast cubed butternut squash with olive oil and sea salt until caramelized and soft (20 mins).",
      "Warm bone broth in a soup pot with sautéed shallots and garlic.",
      "Add roasted squash to pot and puree with an immersion blender until velvety smooth.",
      "Stir in a splash of coconut cream and top with roasted pumpkin seeds."
    ]),
    ingredients: JSON.stringify([
      "2 cups roasted butternut squash",
      "1.5 cups organic pasture-raised chicken bone broth",
      "2 tbsp unsweetened coconut cream",
      "1 tbsp roasted pumpkin seeds",
      "1 shallot & 2 roasted garlic cloves",
      "Pinch of nutmeg & sea salt"
    ]),
    is_favorite: 0
  }
];

// Prenatal Nutrient Synergy Meal Combinations
const initialMealCombinations = [
  {
    name: "Iron & Vitamin C Power Duo",
    subtitle: "Triple Non-Heme Iron Absorption Plate",
    category: "Dinner",
    synergy_benefit: "Vitamin C in fresh citrus greens increases plant-based iron bioavailability from lentils by up to 300%.",
    calories: 540,
    protein_g: 28,
    folate_mcg: 380,
    iron_mg: 9.4,
    calcium_mg: 235,
    dha_mg: 0,
    main_dish_name: "Golden Lentil & Sweet Potato Coconut Curry",
    main_dish_id: 4,
    side_item_name: "Citrus Baby Spinach Salad with Lemon Vinaigrette",
    side_item_image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    tags: "High Iron, High Folate, Trimester 2 Essential"
  },
  {
    name: "Cognitive & Neural Growth Combo",
    subtitle: "DHA Omega-3 + Choline Brain Duo",
    category: "Lunch",
    synergy_benefit: "High DHA salmon paired with edamame provides complete essential amino acids and lipids for rapid fetal brain and retinal growth at Week 24.",
    calories: 680,
    protein_g: 48,
    folate_mcg: 290,
    iron_mg: 6.8,
    calcium_mg: 220,
    dha_mg: 660,
    main_dish_name: "Wild Salmon & Quinoa Harvest Bowl",
    main_dish_id: 2,
    side_item_name: "Steamed Organic Edamame with Sea Salt",
    side_item_image: "https://images.unsplash.com/photo-1546069901-d579c8f00db1?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    tags: "Brain Food, High DHA, Protein Packed"
  },
  {
    name: "Morning Vitality & Anti-Nausea Trio",
    subtitle: "Soothing Stomach & Steady Glucose Pairing",
    category: "Breakfast",
    synergy_benefit: "Soluble beta-glucan oats release sustained energy while natural gingerols settle maternal morning stomach sensitivity.",
    calories: 440,
    protein_g: 14,
    folate_mcg: 110,
    iron_mg: 3.8,
    calcium_mg: 380,
    dha_mg: 0,
    main_dish_name: "Warm Oatmeal with Stewed Apples & Walnuts",
    main_dish_id: 7,
    side_item_name: "Ginger Turmeric Golden Herbal Tea",
    side_item_image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
    tags: "Gentle Digestion, Nausea Relief, High Fiber"
  },
  {
    name: "Trimester 2 Bone & Skeleton Fortifier",
    subtitle: "Calcium + Magnesium + Vitamin D Synergy",
    category: "Breakfast",
    synergy_benefit: "High-bioavailability calcium from Greek yogurt paired with magnesium-rich Turkish figs supports baby's tooth bud and skeletal mineralization.",
    calories: 420,
    protein_g: 26,
    folate_mcg: 105,
    iron_mg: 3.2,
    calcium_mg: 540,
    dha_mg: 0,
    main_dish_name: "Greek Yogurt & Mixed Berry Chia Parfait",
    main_dish_id: 3,
    side_item_name: "Raw Roasted Almonds & Dried Sun Figs",
    side_item_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    tags: "50% Calcium RDA, Bone Strength, Probiotic"
  },
  {
    name: "Maternal Clean Energy & Glow Combo",
    subtitle: "Folate Synergy + Cellular Hydration",
    category: "Lunch",
    synergy_benefit: "Choline in egg yolk combined with leafy spinach folate and potassium from coconut water eliminates maternal afternoon fatigue.",
    calories: 590,
    protein_g: 26,
    folate_mcg: 370,
    iron_mg: 6.5,
    calcium_mg: 265,
    dha_mg: 40,
    main_dish_name: "Avocado & Spinach Sourdough Toast",
    main_dish_id: 1,
    side_item_name: "Berry & Kale Prenatal Glow Smoothie",
    side_item_image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    tags: "Energy Boost, 60% Folate RDA, Hydration"
  },
  {
    name: "Restful Evening Repair & Calming Plate",
    subtitle: "Lean Protein + Tryptophan Sleep Booster",
    category: "Dinner",
    synergy_benefit: "Lean poultry amino acids paired with complex sweet potato carbs encourage serotonin synthesis for deep, restorative maternal sleep.",
    calories: 560,
    protein_g: 46,
    folate_mcg: 185,
    iron_mg: 4.8,
    calcium_mg: 140,
    dha_mg: 30,
    main_dish_name: "Grilled Lemon Herb Chicken & Roasted Veggies",
    main_dish_id: 6,
    side_item_name: "Steamed Sweet Potato & Chamomile Infusion",
    side_item_image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
    tags: "Sleep Support, High Protein, Muscle Recovery"
  }
];

// Comprehensive Prenatal Movement & Exercise Library
const initialExercises = [
  {
    name: "Cat-Cow Spine & Sacroiliac Release",
    category: "Mobility",
    trimester_safe: "All Trimesters",
    duration_minutes: 5,
    intensity: "Gentle",
    equipment: "Yoga Mat",
    benefits: "Gently mobilizes the lumbar spine, relieves sacroiliac tension, and encourages baby into an optimal anterior fetal position.",
    cues: "Inhale as you gently drop the belly and look slightly up; exhale as you round the spine upward, drawing baby gently in toward your heart.",
    steps: JSON.stringify([
      "Start on hands and knees with wrists under shoulders and knees directly under hips.",
      "Keep knees slightly wider than hip-width to accommodate your growing belly.",
      "Inhale: Soften your belly downward, open your chest, and look forward without arching your neck.",
      "Exhale: Gently round your spine toward the ceiling, tucking your chin and engaging your deep transverse abdominals.",
      "Repeat smoothly for 10-12 slow, rhythmic breath cycles (3 to 5 minutes)."
    ]),
    safety_tips: "Avoid over-arching the lower back (excessive extension) to protect lax lumbar ligaments.",
    calories_burn: 20,
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Kegel & Pelvic Floor Diaphragm Sync",
    category: "Pelvic Floor",
    trimester_safe: "All Trimesters",
    duration_minutes: 4,
    intensity: "Gentle",
    equipment: "Chair or Cushion",
    benefits: "Strengthens and coordinates the pelvic floor muscles to support bladder control, prevent prolapse, and build pushing endurance for labor.",
    cues: "Inhale to completely relax and expand the pelvic floor; exhale to gently lift and draw inward (like sipping through a straw).",
    steps: JSON.stringify([
      "Sit upright comfortably on a birth ball, chair, or yoga block with feet flat on the floor.",
      "Inhale deeply into your ribcage and belly, allowing your pelvic floor to relax and soften down completely.",
      "Exhale slowly through pursed lips, gently engaging the muscles you would use to stop the flow of urine or hold back gas.",
      "Hold the gentle lift for 3 to 5 seconds without holding your breath.",
      "Release fully for 5 seconds between contractions. Complete 10 repetitions."
    ]),
    safety_tips: "Never tighten your buttocks, thighs, or hold your breath while performing pelvic floor contractions.",
    calories_burn: 12,
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Supported Deep Squats with Yoga Block",
    category: "Labor Prep",
    trimester_safe: "Trimester 2 & 3",
    duration_minutes: 8,
    intensity: "Moderate",
    equipment: "Yoga Block or Low Stool",
    benefits: "Strengthens quadriceps, glutes, and pelvic floor while widening the pelvic outlet by up to 28% to prepare for labor.",
    cues: "Keep chest proud, heels grounded, and send knees tracking outward in the same direction as your second toe.",
    steps: JSON.stringify([
      "Stand with feet slightly wider than shoulder-width, toes turned outward at a 45-degree angle.",
      "Place a yoga block vertically behind your heels for optional seated support.",
      "Hold hands together at your chest or hold a sturdy chair or door frame for balance.",
      "Inhale as you lower your hips back and down into a deep squat, resting gently on the block if needed.",
      "Exhale and press through your heels to return to standing, squeezing your glutes at the top."
    ]),
    safety_tips: "If you experience pubic bone pain (Symphysis Pubis Dysfunction), reduce squat depth and keep legs closer together.",
    calories_burn: 40,
    image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Wall Angels & Postural Scapular Retraction",
    category: "Strength",
    trimester_safe: "All Trimesters",
    duration_minutes: 6,
    intensity: "Gentle",
    equipment: "Flat Wall",
    benefits: "Opens tight pectoral muscles and strengthens upper back rhomboids to counteract rounded shoulder posture from growing breast tissue.",
    cues: "Press the back of your head, mid-back, and elbows against the wall while keeping your tailbone neutral.",
    steps: JSON.stringify([
      "Stand with your back against a flat wall, feet placed about 6 inches out from the baseboard.",
      "Bring your arms up into a 'goalpost' or 'W' position, with elbows and backs of hands touching the wall.",
      "Inhale: Slide your arms slowly upward along the wall into a 'V' shape without letting your lower back arch off the wall.",
      "Exhale: Slowly draw your elbows back down to your sides, squeezing your shoulder blades together.",
      "Perform 3 sets of 10 controlled repetitions."
    ]),
    safety_tips: "Do not let your ribs flare open; keep your core softly engaged to support your spine.",
    calories_burn: 25,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Brisk Prenatal Outdoor Stroll & Interval Walk",
    category: "Cardio",
    trimester_safe: "All Trimesters",
    duration_minutes: 20,
    intensity: "Moderate",
    equipment: "Supportive Walking Shoes",
    benefits: "Enhances cardiovascular stamina, regulates maternal blood sugar, oxygenates placental circulation, and boosts mood endorphins.",
    cues: "Maintain an upright posture, swing arms naturally, and follow the 'Talk Test' (ability to speak in full sentences without gasping).",
    steps: JSON.stringify([
      "Start with 3 minutes of gentle walking to warm up your ankles, calves, and hips.",
      "Increase to a brisk, purposeful stride for 14 minutes with deep rhythmic nasal breathing.",
      "Keep shoulders relaxed and chest open.",
      "Finish with 3 minutes of gentle slowing cool-down walking.",
      "Hydrate with 250ml of electrolyte water immediately following the walk."
    ]),
    safety_tips: "Walk on flat, even terrain to prevent tripping as your center of gravity shifts in Trimester 2.",
    calories_burn: 95,
    image_url: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Side-Lying Clamshell & Gluteus Medius Activation",
    category: "Strength",
    trimester_safe: "All Trimesters",
    duration_minutes: 7,
    intensity: "Gentle",
    equipment: "Yoga Mat & Pillow",
    benefits: "Strengthens lateral hip stabilizers (gluteus medius) to prevent pregnancy pelvic girdle pain (PGP) and hip ache while sleeping.",
    cues: "Keep hips stacked vertically one on top of the other; do not let your top hip roll backward.",
    steps: JSON.stringify([
      "Lie on your left side with your head supported on a pillow and knees bent at a 90-degree angle.",
      "Keep feet together and rest your top hand on your hip to ensure your pelvis stays steady.",
      "Exhale: Lift your top right knee upward like a clamshell opening, keeping feet touching.",
      "Pause at the top for 1 second, then inhale as you slowly lower your knee.",
      "Perform 12 to 15 reps on the left side, then roll over to your right side and repeat."
    ]),
    safety_tips: "Place a small pillow under your belly for support if lying on your side creates belly pull.",
    calories_burn: 30,
    image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
  }
];

// Clinical ACOG & RCOG Prenatal Exercise Guidelines
const prenatalExerciseGuidelines = {
  golden_rules: [
    {
      title: "The Talk Test Rule",
      icon: "record_voice_over",
      description: "Exercise at a moderate intensity where you can hold a natural conversation without breathlessness (RPE 12-14 on the Borg scale)."
    },
    {
      title: "Avoid Supine (Flat on Back) after Week 16",
      icon: "do_not_disturb_on",
      description: "Lying flat on your back compresses the Inferior Vena Cava, reducing blood and oxygen return to your heart and baby. Use incline or side-lying setups."
    },
    {
      title: "Active Thermoregulation & Hydration",
      icon: "water_drop",
      description: "Drink 250ml water before, during, and after movement. Avoid heated workout rooms (hot yoga) to keep maternal core temperature below 38.3°C (101°F)."
    },
    {
      title: "Joint Laxity & Relaxin Awareness",
      icon: "accessibility_new",
      description: "The pregnancy hormone relaxin loosens ligaments in preparation for birth. Avoid aggressive ballistic stretching or high-impact jarring jumping."
    },
    {
      title: "Protect Against Diastasis Recti",
      icon: "shield",
      description: "Avoid standard sit-ups, traditional crunches, and full front planks. Focus on gentle transverse abdominal hugging and pelvic floor coordination."
    }
  ],
  warning_signs: [
    "Vaginal bleeding or amniotic fluid leakage",
    "Dizziness, lightheadedness, or feeling faint",
    "Shortness of breath prior to beginning physical exertion",
    "Chest pain, heart palpitations, or unexplained muscle weakness",
    "Calf pain, tenderness, redness, or localized swelling (possible DVT)",
    "Regular, painful uterine contractions before 37 weeks",
    "Decreased or absent fetal movements after exercise session"
  ],
  trimester_2_focus: {
    week_target: "Week 24 (Trimester 2)",
    weekly_frequency: "150 minutes of moderate aerobic activity per week (30 mins x 5 days)",
    key_adaptations: [
      "Center of gravity is shifting forward as your belly grows; incorporate stability-focused moves.",
      "Pelvic floor pressure increases; alternate standing exercises with seated birth-ball movements.",
      "Blood volume has expanded by 40-50%; stay hydrated to avoid postural hypotension."
    ]
  }
};

// Curated Prenatal Clinics & Healthcare Providers
const initialClinics = [
  {
    name: "St. Jude Maternal & Fetal Health Center",
    doctor_name: "Dr. Evelyn Reed, MD, FACOG",
    specialty: "Lead Obstetrician & Maternal-Fetal Specialist",
    clinic_type: "OB/GYN",
    phone: "(555) 234-8901",
    emergency_phone: "(555) 234-8999",
    address: "742 Evergreen Medical Plaza, Suite 400, Seattle, WA",
    website: "https://stjude-maternal.example.com",
    next_appointment: "2026-09-04 10:30 AM",
    appointment_purpose: "26-Week Glucose Screening & Fundal Height Check",
    notes: "Review recent iron and ferritin lab panel. Bring hospital pre-registration forms.",
    is_primary: 1,
    image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Blossom Natural Midwifery & Birth Center",
    doctor_name: "Clara Jenkins, MS, CNM",
    specialty: "Certified Nurse-Midwife & Doula Director",
    clinic_type: "Midwifery",
    phone: "(555) 876-5432",
    emergency_phone: "(555) 876-5400",
    address: "128 Rosewood Lane, Seattle, WA",
    website: "https://blossom-birth.example.com",
    next_appointment: "2026-09-18 02:00 PM",
    appointment_purpose: "Birth Plan Consultation & Waterbirth Preparation",
    notes: "Discuss natural pain management strategies, breathing techniques, and labor support partner role.",
    is_primary: 0,
    image_url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Cedar Sinai Labor & Delivery Emergency Pavilion",
    doctor_name: "Dr. Marcus Vance, MD (On-Duty Chief)",
    specialty: "Hospital 24/7 Labor Triage & NICU Level IV",
    clinic_type: "Hospital L&D",
    phone: "(555) 911-4000",
    emergency_phone: "(555) 911-4911",
    address: "500 University Boulevard, Tower B Floor 3, Seattle, WA",
    website: "https://cedarsinai-maternal.example.com",
    next_appointment: "2026-10-15 09:00 AM",
    appointment_purpose: "Hospital Labor & Delivery Room Tour & Triage Walkthrough",
    notes: "24/7 Direct line for contractions under 5 mins, fluid leakage, or reduced fetal movement.",
    is_primary: 0,
    image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Apex 4D Fetal Ultrasound & Anatomy Imaging Lab",
    doctor_name: "Dr. Alana Chen, RDMS",
    specialty: "Prenatal Diagnostic Sonography",
    clinic_type: "Ultrasound Imaging",
    phone: "(555) 432-1098",
    emergency_phone: "(555) 432-1000",
    address: "320 Westlake Ave N, Suite 210, Seattle, WA",
    website: "https://apex-fetal-imaging.example.com",
    next_appointment: "2026-09-25 11:15 AM",
    appointment_purpose: "Trimester 2 Growth Scan & 4D Fetal Facial Imaging",
    notes: "Drink 1 glass of cold apple juice 20 mins prior to stimulate gentle movement.",
    is_primary: 0,
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
  }
];

const initialTip = {
  title: "Folate & Hydration Synergy",
  category: "Trimester 2 Nutrition",
  advice: "At Week 24, your baby's brain and nervous system are growing rapidly. Pairing folate-rich leafy greens with vitamin C (like lemon juice or bell peppers) boosts plant-based iron absorption by up to 3x."
};

module.exports = { 
  initialDishes, 
  initialMealCombinations, 
  initialExercises, 
  prenatalExerciseGuidelines, 
  initialClinics,
  initialTip 
};

