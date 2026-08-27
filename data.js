// data.js - Comprehensive medical dataset & pre-populated content for Male Unhealthy Dashboard

const INITIAL_HEALTH_PROFILE = {
  name: "Marcus Vance",
  age: 39,
  gender: "Male",
  heightCm: 180,
  weightKg: 91.5,
  targetWeightKg: 80.0,
  bmi: 28.2,
  bmiStatus: "Overweight (Visceral Fat Focus)",
  bloodPressure: "138/88 mmHg",
  bpStatus: "Stage 1 Pre-Hypertension",
  fastingGlucose: "114 mg/dL",
  glucoseStatus: "Pre-Diabetic Range",
  triglycerides: "215 mg/dL",
  hdl: "38 mg/dL",
  restingHeartRate: 78,
  primaryConditions: ["Non-Alcoholic Fatty Liver (NAFLD)", "Pre-Hypertension", "Visceral Adiposity"],
  dailyCalorieBurnTarget: 650,
  dailyStepTarget: 10000,
  dailyWaterTargetMl: 3500
};

// Meal Suggestions tailored for men reversing metabolic dysfunction, fatty liver, insulin resistance, and hypertension
const MEAL_SUGGESTIONS = [
  // Breakfast
  {
    id: "m_bf_1",
    type: "breakfast",
    title: "Mediterranean Spinach & Omega-3 Egg Scramble",
    tagline: "High Protein • Liver Detox • Anti-Inflammatory",
    description: "3 pasture-raised whole eggs with organic baby spinach, cherry tomatoes, extra virgin olive oil, and 1 slice of sprouted sourdough.",
    calories: 420,
    protein: 28,
    carbs: 18,
    fats: 26,
    glycemicIndex: "Low (GI 28)",
    benefits: ["Choline for liver fat clearance", "High lutein for cardiovascular protection", "Sustained morning satiety"],
    prepTime: "10 mins",
    icon: "🍳",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_bf_2",
    type: "breakfast",
    title: "Chia Seed & Wild Berry Protein Parfait",
    tagline: "Insulin Sensitizing • Zero Refined Sugar",
    description: "Unsweetened Greek yogurt (0% or 2%), chia seeds, ground flaxseed, organic blueberries, raw pumpkin seeds, and a scoop of unflavored whey isolate.",
    calories: 380,
    protein: 34,
    carbs: 22,
    fats: 14,
    glycemicIndex: "Very Low (GI 18)",
    benefits: ["Flax lignans boost testosterone balance", "Anthocyanins reduce arterial stiffness", "Rich in gut-healing probiotics"],
    prepTime: "5 mins",
    icon: "🫐",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_bf_3",
    type: "breakfast",
    title: "Avocado & Smoked Salmon Sprouted Rye Toast",
    tagline: "Cardio-Protective • Potassium Rich",
    description: "Cold-smoked wild Alaskan salmon on whole sprouted grain toast with mashed Hass avocado, lemon zest, and microgreens.",
    calories: 440,
    protein: 26,
    carbs: 24,
    fats: 24,
    glycemicIndex: "Low (GI 32)",
    benefits: ["EPA & DHA omega-3 reduces triglycerides", "Potassium counters high blood pressure sodium"],
    prepTime: "8 mins",
    icon: "🥑",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80"
  },

  // Lunch
  {
    id: "m_lu_1",
    type: "lunch",
    title: "Grilled Herb Chicken & Quinoa Superfood Bowl",
    tagline: "Lean Mass Preserving • Triglyceride Lowering",
    description: "200g grilled skinless chicken breast, tricolor quinoa, steamed broccoli florets, kale, hemp hearts, and lemon tahini dressing.",
    calories: 540,
    protein: 48,
    carbs: 38,
    fats: 18,
    glycemicIndex: "Low (GI 35)",
    benefits: ["Sulforaphane activates liver phase II detox", "Complete protein supports metabolic rate", "High fiber prevents glucose spikes"],
    prepTime: "15 mins",
    icon: "🥗",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_lu_2",
    type: "lunch",
    title: "Wild Salmon Poke with Edamame & Cauliflower Rice",
    tagline: "Low Carb • Fatty Liver Reversal",
    description: "Marinated wild sockeye salmon cubes over seasoned cauliflower rice, edamame, cucumber ribbons, avocado, and toasted sesame seeds.",
    calories: 490,
    protein: 42,
    carbs: 16,
    fats: 28,
    glycemicIndex: "Very Low (GI 15)",
    benefits: ["Dramatically reduces hepatic steatosis", "Astaxanthin provides mitochondrial defense"],
    prepTime: "12 mins",
    icon: "🐟",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_lu_3",
    type: "lunch",
    title: "Grass-Fed Beef Sirloin & Roasted Asparagus Salad",
    tagline: "Testosterone Support • Zinc & Iron Rich",
    description: "180g lean grass-fed beef strips, charred green asparagus spears, baby arugula, walnuts, and balsamic reduction.",
    calories: 520,
    protein: 44,
    carbs: 14,
    fats: 30,
    glycemicIndex: "Low (GI 20)",
    benefits: ["Bioavailable Zinc and Carnitine for hormonal vitality", "Asparagus acts as a natural vascular diuretic"],
    prepTime: "15 mins",
    icon: "🥩",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
  },

  // Snacks
  {
    id: "m_sn_1",
    type: "snacks",
    title: "Raw Almond & Walnut Metabolic Crunch",
    tagline: "Endothelial Repair • Healthy Fats",
    description: "Handful (35g) of raw unpasteurized almonds, English walnuts, and roasted pumpkin seeds with cinnamon dust.",
    calories: 210,
    protein: 7,
    carbs: 6,
    fats: 18,
    glycemicIndex: "Low (GI 12)",
    benefits: ["Arginine boosts nitric oxide for healthy blood pressure", "Zero insulin spike"],
    prepTime: "1 min",
    icon: "🥜",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_sn_2",
    type: "snacks",
    title: "Whey Isolate Green Detox Smoothie",
    tagline: "Rapid Muscle Protein • Liver Cleansing",
    description: "Cold water, 1 scoop clean whey isolate, organic celery, fresh cucumber, mint leaves, spirulina, and fresh lime juice.",
    calories: 160,
    protein: 27,
    carbs: 5,
    fats: 1,
    glycemicIndex: "Very Low (GI 8)",
    benefits: ["Glutathione precursors support liver enzyme normalization", "Hydrates cellular pathways"],
    prepTime: "3 mins",
    icon: "🥤",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_sn_3",
    type: "snacks",
    title: "Organic Cottage Cheese & Cucumber Dip with Flax Crackers",
    tagline: "Slow-Release Casein • Gut Friendly",
    description: "Low-fat probiotic cottage cheese blended with fresh dill and garlic, served with crunchy cucumber slices and flax crackers.",
    calories: 190,
    protein: 22,
    carbs: 8,
    fats: 6,
    glycemicIndex: "Low (GI 15)",
    benefits: ["Sustained amino acid elevation", "Garlic allicin lowers arterial resistance"],
    prepTime: "4 mins",
    icon: "🧀",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80"
  },

  // Dinner
  {
    id: "m_dn_1",
    type: "dinner",
    title: "Pan-Seared Halibut with Garlic Broccolini & Olive Tapenade",
    tagline: "Cardio-Metabolic Reset • Light & Digestible",
    description: "220g wild white halibut fillet, steamed tenderstem broccolini in olive oil, Kalamata olive tapenade, and roasted cherry tomatoes.",
    calories: 460,
    protein: 46,
    carbs: 12,
    fats: 22,
    glycemicIndex: "Very Low (GI 14)",
    benefits: ["High magnesium promotes restful REM sleep and BP regulation", "Zero heavy starches before bed"],
    prepTime: "18 mins",
    icon: "🍽️",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_dn_2",
    type: "dinner",
    title: "Turkey Breast & Vegetable Stir-Fry with Ginger Turmeric",
    tagline: "Anti-Inflammatory • High Thermic Effect",
    description: "Lean ground turkey breast wok-tossed with bok choy, shiitake mushrooms, bell peppers, fresh grated ginger, and turmeric root.",
    calories: 430,
    protein: 44,
    carbs: 15,
    fats: 16,
    glycemicIndex: "Low (GI 20)",
    benefits: ["Curcumin suppresses hepatic inflammatory cytokines", "Shiitake ergothioneine protects blood vessels"],
    prepTime: "15 mins",
    icon: "🥘",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "m_dn_3",
    type: "dinner",
    title: "Herbed Grass-Fed Lamb Cutlets with Roasted Zucchini",
    tagline: "Hormone Optimization • Iron & B12",
    description: "Grilled rosemary lamb cutlets (trimmed fat), grilled Mediterranean zucchini rounds, mint dressing, and side rocket salad.",
    calories: 480,
    protein: 40,
    carbs: 9,
    fats: 28,
    glycemicIndex: "Low (GI 10)",
    benefits: ["CLA (Conjugated Linoleic Acid) aids abdominal fat oxidation", "Rich in vital micronutrients for male energy"],
    prepTime: "20 mins",
    icon: "🍖",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
  }
];

// Health conditions list for male wellness
const HEALTH_CONDITIONS = [
  {
    id: "fatty_liver",
    name: "Non-Alcoholic Fatty Liver (NAFLD)",
    category: "Metabolic & Hepatic",
    severity: "Common / Reversible",
    icon: "🫀",
    summary: "Excess fat buildup in liver cells causing elevated ALT/AST, sluggish metabolism, and abdominal fullness.",
    recommendedSpecialties: ["Hepatology", "Gastroenterology", "Metabolic Nutritionist"],
    lifestyleFocus: "Eliminate high fructose corn syrup, reduce refined carbohydrates, daily 45-min brisk walking, omega-3 supplementation."
  },
  {
    id: "hypertension",
    name: "Hypertension / High Blood Pressure",
    category: "Cardiovascular",
    severity: "High Priority",
    icon: "💓",
    summary: "Elevated systolic (>130 mmHg) or diastolic (>80 mmHg) putting strain on arterial walls, kidneys, and heart muscle.",
    recommendedSpecialties: ["Cardiologist", "Hypertension Specialist", "Vascular Physician"],
    lifestyleFocus: "DASH diet protocol, 3500ml daily hydration, potassium-rich whole foods, stress-reduction breathing, 10k daily steps."
  },
  {
    id: "diabetes",
    name: "Type 2 Diabetes & Pre-Diabetes (Insulin Resistance)",
    category: "Endocrine & Metabolic",
    severity: "High Priority",
    icon: "🩸",
    summary: "Impaired glucose clearance causing fasting blood sugar >100 mg/dL, HbA1c elevation, energy crashes, and visceral fat storage.",
    recommendedSpecialties: ["Endocrinologist", "Diabetologist", "Lifestyle Medicine Specialist"],
    lifestyleFocus: "Strict low glycemic whole foods, post-meal 15-minute walks, resistance strength training, intermittent fasting."
  },
  {
    id: "cholesterol",
    name: "High Cholesterol & Hypertriglyceridemia",
    category: "Cardiovascular & Lipidology",
    severity: "Moderate to High",
    icon: "🧪",
    summary: "Elevated Triglycerides (>150 mg/dL), ApoB, or oxidized LDL with low HDL (<40 mg/dL), elevating plaque buildup risk.",
    recommendedSpecialties: ["Preventive Cardiologist", "Lipid Specialist", "Clinical Dietitian"],
    lifestyleFocus: "Eliminate trans fats and ultra-processed seed oils, wild oily fish 3x weekly, soluble oat beta-glucan and psyllium husk."
  },
  {
    id: "visceral_fat",
    name: "Visceral Obesity & Metabolic Syndrome",
    category: "Body Composition & Metabolic",
    severity: "Moderate to High",
    icon: "⚖️",
    summary: "Deep intra-abdominal fat surrounding internal organs that secretes inflammatory cytokines, driving systemic resistance.",
    recommendedSpecialties: ["Bariatric & Metabolic Physician", "Sports Medicine Doctor", "Exercise Physiologist"],
    lifestyleFocus: "Consistent 500-650 kcal daily active burn deficit, progressive overload resistance training, high protein (1.6g/kg)."
  },
  {
    id: "low_testosterone",
    name: "Low Testosterone & Male Hormonal Fatigue",
    category: "Andrology & Hormone Health",
    severity: "Quality of Life & Metabolic",
    icon: "⚡",
    summary: "Suboptimal free and total testosterone levels associated with visceral fat, brain fog, reduced libido, and loss of lean muscle mass.",
    recommendedSpecialties: ["Andrologist", "Urologist", "Men's Health Specialist"],
    lifestyleFocus: "Prioritize 7-8 hours deep sleep, optimize dietary zinc/magnesium/vitamin D3, compound resistance lifts, reduce visceral adipose."
  },
  {
    id: "gout",
    name: "Gout & Hyperuricemia (High Uric Acid)",
    category: "Rheumatology & Renal",
    severity: "Painful Acute / Chronic",
    icon: "🦶",
    summary: "Uric acid crystal deposition in joints (especially big toe and ankles) triggered by purines, alcohol, and dehydration.",
    recommendedSpecialties: ["Rheumatologist", "Internal Medicine", "Renal Specialist"],
    lifestyleFocus: "Abundant water intake (minimum 3.5L/day), eliminate beer and high-fructose beverages, tart cherry extract, moderate organ meats."
  },
  {
    id: "gerd",
    name: "Acid Reflux (GERD) & Gut Dysbiosis",
    category: "Gastroenterology",
    severity: "Chronic Discomfort",
    icon: "🔥",
    summary: "Heartburn, regurgitation, and stomach irritation often worsened by visceral abdominal pressure, late meals, and fatty fried foods.",
    recommendedSpecialties: ["Gastroenterologist", "Digestive Health Specialist"],
    lifestyleFocus: "Avoid eating within 3 hours of sleep, smaller portion sizes, elevate head of bed, eliminate deep-fried and ultra-processed items."
  },
  {
    id: "sleep_apnea",
    name: "Obstructive Sleep Apnea & Chronic Snoring",
    category: "Pulmonology & Sleep Medicine",
    severity: "High Cardiovascular Risk",
    icon: "💤",
    summary: "Nighttime airway collapse leading to oxygen desaturation, morning headaches, daytime fatigue, and high blood pressure spikes.",
    recommendedSpecialties: ["Sleep Medicine Specialist", "Pulmonologist", "ENT Surgeon"],
    lifestyleFocus: "Weight reduction protocol, side sleeping position, sleep study evaluation, zero alcohol within 4 hours of bed."
  }
];

// Curated Specialists Database
const DOCTORS_DATABASE = [
  {
    id: "doc_1",
    name: "Dr. Arthur Vance, MD, FACC",
    title: "Senior Consultant Interventional Cardiologist",
    specialty: "Cardiovascular Health & Hypertension",
    conditionIds: ["hypertension", "cholesterol", "visceral_fat"],
    experience: "18+ years experience",
    degrees: "MD, Harvard Medical School • Fellow, American College of Cardiology",
    hospital: "Metropolitan Heart & Vascular Institute",
    location: "Downtown Medical Pavilion, Suite 402",
    rating: 4.95,
    reviewsCount: 342,
    fee: "$180",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Tomorrow at 10:00 AM", "Thursday at 2:30 PM", "Friday at 11:15 AM"],
    about: "Specializes in reversing arterial stiffness, aggressive lipid optimization, hypertension management, and preventive cardiac scans for working men."
  },
  {
    id: "doc_2",
    name: "Dr. Elena Rostova, MD, PhD",
    title: "Chief of Hepatology & Liver Metabolic Disorders",
    specialty: "Hepatology & Gastroenterology",
    conditionIds: ["fatty_liver", "gerd", "cholesterol"],
    experience: "15+ years experience",
    degrees: "MD, Johns Hopkins • PhD in Hepatic Lipid Metabolism",
    hospital: "Advanced Digestive & Liver Health Center",
    location: "Westside Health Sciences Complex, Bldg B",
    rating: 4.98,
    reviewsCount: 289,
    fee: "$195",
    avatar: "https://images.unsplash.com/photo-1594824813589-4b68e9e4f2ff?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Today at 4:00 PM", "Wednesday at 9:00 AM", "Monday at 1:45 PM"],
    about: "Pioneering therapeutic regimens for non-alcoholic fatty liver reversal, elevated liver enzymes (ALT/AST), and comprehensive gut biome restoration."
  },
  {
    id: "doc_3",
    name: "Dr. Nathanial Cole, MD, FACE",
    title: "Specialist Endocrinologist & Diabetologist",
    specialty: "Diabetes, Insulin Resistance & Metabolism",
    conditionIds: ["diabetes", "fatty_liver", "visceral_fat", "low_testosterone"],
    experience: "21+ years experience",
    degrees: "MD, Stanford University • Fellow, American Association of Clinical Endocrinology",
    hospital: "Endocrine & Metabolic Wellness Clinic",
    location: "Midtown Medical Plaza, Floor 6",
    rating: 4.92,
    reviewsCount: 410,
    fee: "$175",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Tomorrow at 11:30 AM", "Friday at 3:00 PM", "Saturday at 10:00 AM"],
    about: "Expert in reversing insulin resistance, continuous glucose monitoring (CGM) optimization, pre-diabetes management, and metabolic syndrome recovery."
  },
  {
    id: "doc_4",
    name: "Dr. Harrison Sterling, MD, FACS",
    title: "Director of Men's Health & Andrology",
    specialty: "Andrology, Urology & Male Hormones",
    conditionIds: ["low_testosterone", "visceral_fat", "sleep_apnea"],
    experience: "16+ years experience",
    degrees: "MD, Columbia University • Fellowship in Male Reproductive & Endocrine Medicine",
    hospital: "Apex Men's Vitality & Urological Institute",
    location: "Park Avenue Medical Tower, Suite 810",
    rating: 4.97,
    reviewsCount: 315,
    fee: "$210",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Wednesday at 2:00 PM", "Thursday at 10:45 AM", "Friday at 4:15 PM"],
    about: "Focuses on optimizing male hormonal health, testosterone restoration protocols, adrenal fatigue, and sexual longevity in high-stress professional men."
  },
  {
    id: "doc_5",
    name: "Dr. Rachel Thorne, MD, FACR",
    title: "Consultant Rheumatologist & Joint Health Specialist",
    specialty: "Rheumatology & Uric Acid Disorders",
    conditionIds: ["gout", "hypertension", "visceral_fat"],
    experience: "14+ years experience",
    degrees: "MD, UCLA David Geffen School of Medicine • Board Certified Rheumatologist",
    hospital: "Metropolitan Arthritis & Metabolic Center",
    location: "Crestview Health Center, Suite 215",
    rating: 4.89,
    reviewsCount: 198,
    fee: "$165",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Tomorrow at 1:15 PM", "Thursday at 9:30 AM", "Next Tuesday at 11:00 AM"],
    about: "Expert in acute and chronic gout treatment, rapid uric acid crystallization prevention, dietary purine management, and systemic inflammation reduction."
  },
  {
    id: "doc_6",
    name: "Dr. Julian Montgomery, MD, FCCP",
    title: "Pulmonary & Sleep Medicine Director",
    specialty: "Sleep Apnea & Respiratory Wellness",
    conditionIds: ["sleep_apnea", "hypertension", "visceral_fat"],
    experience: "19+ years experience",
    degrees: "MD, University of Michigan • American Board of Sleep Medicine",
    hospital: "Precision Sleep & Pulmonary Institute",
    location: "Oakridge BioHealth Campus, Bldg C",
    rating: 4.94,
    reviewsCount: 260,
    fee: "$190",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Today at 5:00 PM", "Friday at 1:00 PM", "Saturday at 11:30 AM"],
    about: "Specialized in home and clinical sleep apnea titration, CPAP-free alternative therapies, nocturnal hypoxia correction, and restorative sleep protocols."
  },
  {
    id: "doc_7",
    name: "Dr. Marcus Sterling, RD, CSSD, CSCS",
    title: "Clinical Sports Dietitian & Metabolic Coach",
    specialty: "Preventive Nutrition & Visceral Fat Reduction",
    conditionIds: ["visceral_fat", "fatty_liver", "diabetes", "cholesterol", "hypertension"],
    experience: "12+ years experience",
    degrees: "MS Clinical Nutrition, NYU • Board Certified Sports Dietitian",
    hospital: "Metabolic Transformation Lab",
    location: "Skyline Fitness & Medical Hub, Suite 305",
    rating: 4.96,
    reviewsCount: 388,
    fee: "$140",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80",
    availableSlots: ["Tomorrow at 8:30 AM", "Wednesday at 12:00 PM", "Thursday at 5:30 PM"],
    about: "Designs personalized nutrition and exercise blueprints for men with demanding careers aiming to cut visceral belly fat without sacrificing muscle."
  }
];

// Curated Specialized Clinics & Diagnostic Centers
const CLINICS_DATABASE = [
  {
    id: "clinic_1",
    name: "Metropolitan Advanced Diagnostics & Liver FibroScan Center",
    category: "Liver & Digestive Center",
    conditionIds: ["fatty_liver", "gerd", "cholesterol"],
    address: "742 Lexington Ave, Floor 3, Medical District",
    distance: "1.8 miles away",
    phone: "(555) 349-2810",
    rating: 4.9,
    hours: "Mon-Fri: 7:00 AM - 6:30 PM | Sat: 8:00 AM - 2:00 PM",
    testsOffered: ["Non-Invasive Liver FibroScan (CAP Score)", "Full Hepatic Lipid Panel", "Comprehensive Abdominal Ultrasound", "Gut Microbiome Assay"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "clinic_2",
    name: "Apex Cardiovascular & Coronary Calcium (CAC) Institute",
    category: "Heart & Vascular Hospital Center",
    conditionIds: ["hypertension", "cholesterol", "visceral_fat"],
    address: "1280 Health Parkway, Suite 500",
    distance: "3.2 miles away",
    phone: "(555) 782-9900",
    rating: 4.95,
    hours: "Mon-Sat: 6:30 AM - 7:00 PM",
    testsOffered: ["Zero-Contrast Coronary Artery Calcium (CAC) Scan", "24-Hour Ambulatory Blood Pressure Holter", "Carotid Artery Intima-Media Thickness (CIMT)", "High-Sensitivity CRP"],
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "clinic_3",
    name: "Men's Endocrine & Hormonal Optimization Lab",
    category: "Men's Vitality & Hormone Specialty Clinic",
    conditionIds: ["low_testosterone", "diabetes", "visceral_fat", "sleep_apnea"],
    address: "450 Broadway Medical Tower, Suite 700",
    distance: "2.4 miles away",
    phone: "(555) 492-1130",
    rating: 4.88,
    hours: "Mon-Fri: 8:00 AM - 6:00 PM",
    testsOffered: ["Complete Male Hormone Panel (Free/Total T, SHBG, Estradiol)", "DEXA Visceral Fat & Lean Mass Scan", "Continuous Glucose Monitor (CGM) Fitting", "Thyroid & Adrenal Profile"],
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "clinic_4",
    name: "BioMetabolic & Renal Diagnostic Pavilion",
    category: "Diabetes, Gout & Kidney Specialty Center",
    conditionIds: ["gout", "diabetes", "hypertension", "fatty_liver"],
    address: "910 Grand Concourse, Floor 2",
    distance: "4.1 miles away",
    phone: "(555) 621-8840",
    rating: 4.85,
    hours: "Mon-Fri: 7:30 AM - 5:30 PM",
    testsOffered: ["Serum Uric Acid & Kidney Microalbuminuria Panel", "Fasting Insulin & HOMA-IR Calculation", "Oral Glucose Tolerance Test (OGTT)", "Metabolic Rate Calorimetry"],
    image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=500&auto=format&fit=crop&q=80"
  }
];

// Preloaded 7-day historical tracking data for smooth charts on day 1
const HISTORICAL_DATA_7_DAYS = [
  {
    dayLabel: "Mon (Aug 20)",
    dateString: "2026-08-20",
    caloriesBurned: 520,
    calorieTarget: 650,
    steps: 8450,
    stepTarget: 10000,
    waterMl: 2750,
    waterTarget: 3500,
    mealsLogged: 3,
    caloriesEaten: 1850,
    recoveryScore: 78
  },
  {
    dayLabel: "Tue (Aug 21)",
    dateString: "2026-08-21",
    caloriesBurned: 680,
    calorieTarget: 650,
    steps: 10890,
    stepTarget: 10000,
    waterMl: 3500,
    waterTarget: 3500,
    mealsLogged: 4,
    caloriesEaten: 1980,
    recoveryScore: 94
  },
  {
    dayLabel: "Wed (Aug 22)",
    dateString: "2026-08-22",
    caloriesBurned: 490,
    calorieTarget: 650,
    steps: 7600,
    stepTarget: 10000,
    waterMl: 2500,
    waterTarget: 3500,
    mealsLogged: 3,
    caloriesEaten: 2150,
    recoveryScore: 72
  },
  {
    dayLabel: "Thu (Aug 23)",
    dateString: "2026-08-23",
    caloriesBurned: 710,
    calorieTarget: 650,
    steps: 11400,
    stepTarget: 10000,
    waterMl: 3750,
    waterTarget: 3500,
    mealsLogged: 4,
    caloriesEaten: 1920,
    recoveryScore: 96
  },
  {
    dayLabel: "Fri (Aug 24)",
    dateString: "2026-08-24",
    caloriesBurned: 590,
    calorieTarget: 650,
    steps: 9200,
    stepTarget: 10000,
    waterMl: 3100,
    waterTarget: 3500,
    mealsLogged: 4,
    caloriesEaten: 2040,
    recoveryScore: 84
  },
  {
    dayLabel: "Sat (Aug 25)",
    dateString: "2026-08-25",
    caloriesBurned: 820,
    calorieTarget: 650,
    steps: 13500,
    stepTarget: 10000,
    waterMl: 4000,
    waterTarget: 3500,
    mealsLogged: 4,
    caloriesEaten: 2100,
    recoveryScore: 98
  },
  {
    dayLabel: "Today (Aug 26)",
    dateString: "2026-08-26",
    caloriesBurned: 380,
    calorieTarget: 650,
    steps: 6420,
    stepTarget: 10000,
    waterMl: 2250,
    waterTarget: 3500,
    mealsLogged: 2,
    caloriesEaten: 1210,
    recoveryScore: 81
  }
];

// Sample initial food plate uploads
const SAMPLE_FOOD_PLATES = [
  {
    id: "plate_1",
    mealType: "breakfast",
    mealName: "Mediterranean Spinach & Egg Scramble",
    timestamp: "8:15 AM",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
    estimatedCalories: 420,
    aiAnalysis: {
      healthGrade: "A+",
      verdict: "Optimal Hepato-Protective Breakfast",
      proteinGrams: 28,
      carbsGrams: 18,
      fatGrams: 26,
      highlights: [
        "Rich in dietary choline for liver fat breakdown",
        "High bioavailable lutein & zeaxanthin for vascular health",
        "Zero added sugars or refined high-fructose syrups"
      ]
    }
  },
  {
    id: "plate_2",
    mealType: "lunch",
    mealName: "Grilled Chicken & Steamed Broccoli Quinoa Bowl",
    timestamp: "1:10 PM",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    estimatedCalories: 540,
    aiAnalysis: {
      healthGrade: "A",
      verdict: "High-Satiety Metabolic Fuel",
      proteinGrams: 48,
      carbsGrams: 38,
      fatGrams: 18,
      highlights: [
        "Cruciferous sulforaphane stimulates liver glutathione pathways",
        "Low glycemic complex carbohydrates prevent insulin spikes",
        "Sufficient lean protein to preserve metabolic muscle mass"
      ]
    }
  }
];

// Workout calorie burn presets for quick logging
const WORKOUT_PRESETS = [
  { name: "Brisk Power Walking (45 min)", calories: 240, steps: 5200, icon: "🚶‍♂️" },
  { name: "High-Intensity Interval Training (HIIT 25 min)", calories: 310, steps: 2200, icon: "⚡" },
  { name: "Heavy Compound Weight Training (50 min)", calories: 350, steps: 1800, icon: "🏋️‍♂️" },
  { name: "Stationary Cycling / Spin (40 min)", calories: 380, steps: 0, icon: "🚴‍♂️" },
  { name: "Zone 2 Cardiovascular Jogging (30 min)", calories: 330, steps: 4100, icon: "🏃‍♂️" },
  { name: "Swimming Laps (35 min)", calories: 290, steps: 0, icon: "🏊‍♂️" },
  { name: "Incline Treadmill Walk (30 min)", calories: 280, steps: 3600, icon: "⛰️" }
];
