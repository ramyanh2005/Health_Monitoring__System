export const initialUserData = {
  name: "Margaret Thompson",
  age: 72,
  tier: "Senior Member",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
  doctor: "Dr. Elizabeth Vance, MD (Geriatric Wellness)",
  primaryClinic: "Evergreen Community Health",
  medicalConditions: ["Mild Hypertension", "Knee Osteoarthritis"],
  allergies: ["Penicillin", "Sulfa drugs"],
  bloodType: "A+",
  emergencyContact: {
    name: "Sarah Miller",
    relation: "Daughter",
    phone: "(555) 382-9912",
    altPhone: "(555) 714-2200",
    notifyOnSOS: true
  }
};

export const initialDailyGoals = {
  stepsGoal: 6000,
  stepsCurrent: 4250,
  caloriesBurnGoal: 450,
  caloriesBurnCurrent: 310,
  waterGlassesGoal: 8,
  waterGlassesCurrent: 5,
  activeMinutesGoal: 30,
  activeMinutesCurrent: 18,
};

export const initialMealsData = [
  {
    id: "meal-1",
    type: "Breakfast",
    time: "8:15 AM",
    title: "Warm Berry Oatmeal & Toasted Walnuts",
    description: "Steel-cut rolled oats simmered with almond milk, topped with wild blueberries, cinnamon, and omega-rich walnuts.",
    calories: 340,
    protein: 12,
    carbs: 52,
    fat: 10,
    fiber: 9,
    image: "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&q=80&w=600",
    recipe: {
      prepTime: "5 mins",
      cookTime: "10 mins",
      servings: 1,
      seniorBenefits: "High soluble fiber helps maintain healthy cholesterol levels and supports smooth digestion.",
      ingredients: [
        "1/2 cup rolled oats (low GI)",
        "1 cup unsweetened almond or oat milk",
        "1/2 cup fresh or frozen blueberries (antioxidant-packed)",
        "1 tbsp crushed raw walnuts",
        "1/4 tsp ground Ceylon cinnamon",
        "1 tsp pure maple syrup (optional)"
      ],
      instructions: [
        "In a small non-stick saucepan, combine rolled oats and almond milk over medium heat.",
        "Bring to a gentle simmer, stirring frequently for 5-7 minutes until creamy.",
        "Remove from heat and stir in cinnamon and half of the blueberries.",
        "Pour into a warm bowl. Garnish with remaining blueberries and crushed walnuts for a pleasant crunch."
      ]
    }
  },
  {
    id: "meal-2",
    type: "Lunch",
    time: "12:45 PM",
    title: "Mediterranean Salmon & Quinoa Bowl",
    description: "Pan-seared Alaskan salmon fillet served over fluffy herb quinoa, cucumber, cherry tomatoes, and lemon-tahini dressing.",
    calories: 490,
    protein: 34,
    carbs: 38,
    fat: 18,
    fiber: 7,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    recipe: {
      prepTime: "10 mins",
      cookTime: "12 mins",
      servings: 1,
      seniorBenefits: "Rich in Omega-3 fatty acids to soothe joint inflammation and nurture cognitive memory.",
      ingredients: [
        "1 fillet (4 oz) wild-caught salmon",
        "3/4 cup cooked organic quinoa",
        "1/2 cup English cucumber, diced",
        "1/2 cup sweet cherry tomatoes, halved",
        "1 cup baby spinach leaves",
        "1 tbsp extra virgin olive oil & squeeze of fresh lemon juice",
        "Pinch of sea salt and freshly cracked black pepper"
      ],
      instructions: [
        "Season salmon lightly with black pepper, a pinch of salt, and lemon zest.",
        "Heat olive oil in a skillet over medium heat. Sear salmon skin-side down for 4 minutes, flip and cook 3 minutes until tender.",
        "Arrange fresh baby spinach and warm quinoa in a bowl.",
        "Top with cucumber, cherry tomatoes, and the salmon fillet. Drizzle with lemon olive oil dressing."
      ]
    }
  },
  {
    id: "meal-3",
    type: "Dinner",
    time: "6:15 PM",
    title: "Hearty Lentil & Garden Vegetable Stew",
    description: "Slow-simmered brown lentils with sweet carrots, celery, zucchini, and aromatic rosemary in rich vegetable broth.",
    calories: 360,
    protein: 18,
    carbs: 54,
    fat: 5,
    fiber: 14,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600",
    recipe: {
      prepTime: "15 mins",
      cookTime: "30 mins",
      servings: 2,
      seniorBenefits: "Plant-based potassium and magnesium help naturally regulate blood pressure.",
      ingredients: [
        "1 cup brown lentils, rinsed",
        "2 medium carrots, sliced into rounds",
        "2 stalks celery, chopped",
        "1 small zucchini, diced",
        "1/2 yellow onion, finely diced",
        "3 cups low-sodium vegetable broth",
        "1 sprig fresh rosemary or 1/2 tsp dried thyme",
        "1 tbsp olive oil"
      ],
      instructions: [
        "In a soup pot, heat olive oil over medium heat and sauté onions, carrots, and celery until softened (5 mins).",
        "Add brown lentils, diced zucchini, fresh herbs, and vegetable broth.",
        "Bring to a boil, then reduce heat to low, cover with a lid, and simmer gently for 25 minutes until lentils are tender.",
        "Ladle into bowls and serve with a slice of whole grain sourdough bread."
      ]
    }
  },
  {
    id: "meal-4",
    type: "Snack",
    time: "3:30 PM",
    title: "Greek Yogurt with Golden Honey & Almonds",
    description: "Creamy probiotic Greek yogurt with a drizzle of wildflower honey and lightly toasted sliced almonds.",
    calories: 170,
    protein: 14,
    carbs: 16,
    fat: 5,
    fiber: 2,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
    recipe: {
      prepTime: "3 mins",
      cookTime: "0 mins",
      servings: 1,
      seniorBenefits: "Packed with active live probiotics for digestive comfort and bioavailable calcium for strong bones.",
      ingredients: [
        "3/4 cup plain non-fat or low-fat Greek yogurt",
        "1 tsp pure golden wildflower honey",
        "1 tbsp sliced almonds, lightly toasted",
        "Pinch of ground cinnamon"
      ],
      instructions: [
        "Spoon Greek yogurt into a dessert bowl.",
        "Drizzle raw golden honey on top in a spiral.",
        "Scatter crunchy almond slices and dust lightly with fragrant cinnamon."
      ]
    }
  }
];

export const exercisesData = [
  {
    id: "ex-1",
    title: "Gentle Chair Yoga & Spine Lengthening",
    category: "Flexibility & Posture",
    duration: 15,
    difficulty: "Gentle",
    difficultyLevel: "easy",
    caloriesBurn: 65,
    isSuggested: true,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    benefits: "Improves spinal mobility, relieves lower back tension, and expands chest breathing safely while seated.",
    safetyTip: "Keep both feet flat on the floor and maintain a straight but relaxed spine.",
    steps: [
      { name: "Seated Mountain Breath", timeSec: 90, desc: "Sit tall with hands on your knees. Inhale deeply through your nose for 4 counts, exhale smoothly through your mouth." },
      { name: "Gentle Seated Cat-Cow", timeSec: 120, desc: "Inhale while gently arching your back and looking up. Exhale while rounding your spine and tucking your chin." },
      { name: "Seated Side Stretch", timeSec: 120, desc: "Hold the chair with your left hand, raise your right arm overhead, and gently lean to the left. Switch sides." },
      { name: "Seated Gentle Torso Twist", timeSec: 120, desc: "Place your right hand on your left knee and gently turn your upper body to the left. Hold for 5 slow breaths, then repeat on right." },
      { name: "Shoulder Rolls & Neck Release", timeSec: 90, desc: "Slowly roll your shoulders up, back, and down 5 times. Gently tilt your ear towards each shoulder." }
    ]
  },
  {
    id: "ex-2",
    title: "Morning Joint Mobility Routine",
    category: "Mobility",
    duration: 10,
    difficulty: "Gentle",
    difficultyLevel: "easy",
    caloriesBurn: 45,
    isSuggested: true,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600",
    benefits: "Warms up synovial fluid in shoulders, hips, wrists, and ankles to eliminate morning stiffness.",
    safetyTip: "Move slowly and never force any joint through pain.",
    steps: [
      { name: "Wrist & Finger Circles", timeSec: 60, desc: "Gently circle both wrists clockwise, then counter-clockwise. Open and close your fingers smoothly." },
      { name: "Ankle Rotations & Flexes", timeSec: 90, desc: "While seated or holding a counter, point toes down, pull toes up, and roll ankles in gentle circles." },
      { name: "Gentle Arm Circles", timeSec: 90, desc: "Extend arms to the side at shoulder height. Make 10 small forward circles, then 10 backward circles." },
      { name: "Seated Knee Extensions", timeSec: 120, desc: "Slowly straighten one leg out in front of you, hold for 2 seconds, and lower. Alternate legs 10 times." },
      { name: "Deep Morning Oxygen Reach", timeSec: 60, desc: "Inhale deeply as you sweep both arms up overhead. Exhale and release your arms down." }
    ]
  },
  {
    id: "ex-3",
    title: "Tai Chi for Balance & Fall Prevention",
    category: "Balance & Stability",
    duration: 20,
    difficulty: "Gentle",
    difficultyLevel: "easy",
    caloriesBurn: 85,
    isSuggested: true,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600",
    benefits: "Strengthens stabilizing leg muscles, enhances center-of-gravity awareness, and calms the mind.",
    safetyTip: "Perform near a sturdy wall or sturdy dining chair for balance support if needed.",
    steps: [
      { name: "Centering & Rooting Stance", timeSec: 120, desc: "Stand with feet shoulder-width apart, knees slightly soft. Rest your weight evenly on both feet." },
      { name: "Parting the Wild Horse's Mane", timeSec: 180, desc: "Slowly step forward with your left foot while sweeping your left palm upward and right palm down. Shift weight gracefully." },
      { name: "Wave Hands Like Clouds", timeSec: 180, desc: "Move your hands in gentle overlapping circular waves across your chest while softly shifting weight from left to right." },
      { name: "Golden Rooster Balance Stand", timeSec: 120, desc: "Shift weight to right leg, softly lift left heel (or knee slightly) for 5 seconds. Use chair support as needed." },
      { name: "Closing the Qi", timeSec: 90, desc: "Slowly raise both hands to chest level, palms down, and gently push energy down to your abdomen as you exhale." }
    ]
  },
  {
    id: "ex-4",
    title: "Gentle Water Aerobics & Joint Glide",
    category: "Low-Impact Cardio",
    duration: 25,
    difficulty: "Moderate",
    difficultyLevel: "medium",
    caloriesBurn: 115,
    isSuggested: true,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=600",
    benefits: "Zero gravity buoyant support eliminates knee and hip pressure while providing smooth water resistance.",
    safetyTip: "Stay in chest-deep water and keep movements smooth and continuous.",
    steps: [
      { name: "Water Walking & Arm Sweeps", timeSec: 240, desc: "Walk forward and backward across the shallow end while scooping water with cupped hands." },
      { name: "Pool Wall Flutter Kicks", timeSec: 180, desc: "Hold onto the pool ledge and gently kick your legs behind you to tone quadriceps and glutes." },
      { name: "Water Jumping Jacks (Low Impact)", timeSec: 180, desc: "Step right foot out while raising arms, step back, then step left foot out without bouncing." },
      { name: "Treading Water Arm Press", timeSec: 180, desc: "Stand steady and push pool water down and forward using palms to engage triceps and back." }
    ]
  },
  {
    id: "ex-5",
    title: "Seated Resistance Band Strength",
    category: "Strength & Resistance",
    duration: 18,
    difficulty: "Moderate",
    difficultyLevel: "medium",
    caloriesBurn: 80,
    isSuggested: false,
    image: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&q=80&w=600",
    benefits: "Builds upper body and back muscle tone safely without heavy weights or joint strain.",
    safetyTip: "Use a yellow or green (light resistance) band and check for tears before beginning.",
    steps: [
      { name: "Band Chest Pull-Aparts", timeSec: 120, desc: "Hold band in front of chest with both hands. Slowly pull hands outward until band touches chest." },
      { name: "Seated Band Rows", timeSec: 150, desc: "Loop band around feet. Hold ends and pull elbows straight back, squeezing shoulder blades together." },
      { name: "Seated Bicep Curls", timeSec: 120, desc: "Anchor band beneath feet. Hold handles and curl hands upward towards shoulders." },
      { name: "Overhead Band Stretch", timeSec: 90, desc: "Hold band wide overhead and gently pull hands outward while taking deep breaths." }
    ]
  },
  {
    id: "ex-6",
    title: "Indoor Power Walking & Arm Swings",
    category: "Low-Impact Cardio",
    duration: 20,
    difficulty: "Moderate",
    difficultyLevel: "medium",
    caloriesBurn: 95,
    isSuggested: false,
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600",
    benefits: "Boosts heart circulation, burns calories, and triggers natural endorphins.",
    safetyTip: "Wear supportive walking shoes with non-slip soles on level indoor flooring.",
    steps: [
      { name: "Easy Pace Warm-Up March", timeSec: 180, desc: "March in place or around your living room at an easy, conversational pace." },
      { name: "Brisk Walk with High Knee Lifts", timeSec: 240, desc: "Pick up your tempo, swinging your arms rhythmically from shoulders to hips." },
      { name: "Side-to-Side Step Touches", timeSec: 180, desc: "Step wide to the right, tap left foot, step wide to the left, tap right foot." },
      { name: "Cool Down Stride & Calf Stretch", timeSec: 180, desc: "Slow down your steps, take deep breaths, and gently stretch calves against a wall." }
    ]
  },
  {
    id: "ex-7",
    title: "Standing Calf & Ankle Stabilizer",
    category: "Balance & Stability",
    duration: 12,
    difficulty: "Gentle",
    difficultyLevel: "easy",
    caloriesBurn: 40,
    isSuggested: false,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
    benefits: "Strengthens lower leg muscles crucial for stepping onto curbs and uneven ground without tripping.",
    safetyTip: "Hold onto a sturdy kitchen counter or back of a heavy sofa.",
    steps: [
      { name: "Double Heel Raises", timeSec: 90, desc: "Holding counter, rise up onto the balls of your feet, hold for 2 seconds, and slowly lower." },
      { name: "Toe Lift Rockers", timeSec: 90, desc: "Shift weight back slightly onto your heels and lift your toes off the ground." },
      { name: "Single Leg Stance Practice", timeSec: 120, desc: "Lift one foot slightly off the floor and balance on the other leg for 15 seconds. Switch legs." },
      { name: "Tandem Heel-to-Toe Stand", timeSec: 120, desc: "Place one foot directly in front of the other like walking on a tightrope. Hold for 20 seconds." }
    ]
  },
  {
    id: "ex-8",
    title: "Mindful Deep Breathing & Relaxation",
    category: "Mindfulness & Vitals",
    duration: 10,
    difficulty: "Gentle",
    difficultyLevel: "easy",
    caloriesBurn: 25,
    isSuggested: false,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
    benefits: "Triggers the parasympathetic nervous system, lowers elevated blood pressure, and reduces stress.",
    safetyTip: "Sit in a comfortable supportive armchair or recline comfortably.",
    steps: [
      { name: "Diaphragmatic Belly Breathing", timeSec: 150, desc: "Place one hand on your belly and one on your chest. Feel your belly rise on inhale and fall on exhale." },
      { name: "4-7-8 Calming Breath Technique", timeSec: 180, desc: "Inhale through nose for 4 seconds, gently hold for 7 seconds, exhale through mouth with whoosh for 8 seconds." },
      { name: "Progressive Muscle Softening", timeSec: 180, desc: "Consciously release tension from forehead, jaw, neck, shoulders, and hands with each long exhale." }
    ]
  }
];

export const initialMedications = [
  {
    id: "med-1",
    name: "Lisinopril",
    dosage: "10 mg (1 tablet)",
    time: "8:00 AM",
    slot: "Morning",
    purpose: "Blood Pressure Regulation",
    instructions: "Take with a full glass of water with breakfast",
    taken: true,
    refillDaysLeft: 18
  },
  {
    id: "med-2",
    name: "Vitamin D3 + Calcium",
    dosage: "2000 IU / 600 mg",
    time: "8:00 AM",
    slot: "Morning",
    purpose: "Bone & Joint Strength",
    instructions: "Take with meal for optimal absorption",
    taken: true,
    refillDaysLeft: 45
  },
  {
    id: "med-3",
    name: "CoQ10 (Ubiquinol)",
    dosage: "100 mg (1 softgel)",
    time: "1:00 PM",
    slot: "Afternoon",
    purpose: "Cardiovascular Energy",
    instructions: "Take after lunch",
    taken: true,
    refillDaysLeft: 30
  },
  {
    id: "med-4",
    name: "Metformin ER",
    dosage: "500 mg (1 tablet)",
    time: "6:30 PM",
    slot: "Evening",
    purpose: "Blood Sugar Balance",
    instructions: "Take with dinner",
    taken: false,
    refillDaysLeft: 12
  },
  {
    id: "med-5",
    name: "Melatonin Gentle Sleep",
    dosage: "3 mg (1 gummy)",
    time: "9:30 PM",
    slot: "Bedtime",
    purpose: "Restful Night Sleep",
    instructions: "Take 30 minutes before sleep",
    taken: false,
    refillDaysLeft: 22
  }
];

export const initialMilestones = [
  {
    id: "ms-1",
    title: "7-Day Step Streak",
    desc: "Achieved daily walking goal 7 days in a row!",
    date: "August 24, 2026",
    category: "Steps",
    icon: "Footprints",
    achieved: true,
    rewardText: "Gold Walking Star"
  },
  {
    id: "ms-2",
    title: "Hydration Champion",
    desc: "Drank all 8 glasses of water for 5 consecutive days.",
    date: "August 22, 2026",
    category: "Hydration",
    icon: "Droplets",
    achieved: true,
    rewardText: "Blue Water Drop"
  },
  {
    id: "ms-3",
    title: "Gentle Yogi Master",
    desc: "Completed 10 Chair Yoga and mobility sessions this month.",
    date: "August 19, 2026",
    category: "Exercise",
    icon: "Sparkles",
    achieved: true,
    rewardText: "Silver Lotus"
  },
  {
    id: "ms-4",
    title: "Nutrition Explorer",
    desc: "Logged 20 colorful, balanced home-cooked meals with photos.",
    date: "August 15, 2026",
    category: "Nutrition",
    icon: "Utensils",
    achieved: true,
    rewardText: "Golden Plate"
  },
  {
    id: "ms-5",
    title: "30-Day Vitality Hero",
    desc: "Stay active 25 out of 30 days.",
    date: "In Progress (21/25 days)",
    category: "Streak",
    icon: "Award",
    achieved: false,
    rewardText: "Grand Vitality Medal"
  }
];

export const historicalTrendsData = {
  daily: {
    labels: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
    steps: [320, 1450, 2600, 3400, 4250, 4250],
    water: [1, 2, 4, 5, 5, 5],
    calories: [40, 120, 190, 240, 310, 310]
  },
  weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun (Today)"],
    steps: [5400, 6100, 5800, 6300, 4900, 5600, 4250],
    water: [8, 8, 7, 8, 8, 7, 5],
    calories: [420, 460, 430, 480, 390, 440, 310]
  },
  monthly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4 (Current)"],
    steps: [38500, 41200, 39800, 32450],
    water: [54, 56, 52, 44],
    calories: [2900, 3150, 3050, 2470]
  }
};
