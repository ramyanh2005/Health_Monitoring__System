// Bloom Health — AI Doula & Maternal Health Chatbot Engine
// Clinical grounding based on ACOG, RCOG, and AAP Prenatal Standards

const pregnancyMilestones = {
  1: { month: 1, weeks: "Weeks 1-4", trimester: 1, size: "a poppy seed", keyFact: "Blastocyst implants into the uterine lining. The neural tube (future brain and spinal cord) begins forming. Critical time for 600µg/day folate intake." },
  2: { month: 2, weeks: "Weeks 5-8", trimester: 1, size: "a raspberry", keyFact: "Heart begins beating around 100-160 BPM. Tiny limb buds appear. Morning nausea often peaks as hCG levels rise." },
  3: { month: 3, weeks: "Weeks 9-13", trimester: 1, size: "a sweet lime", keyFact: "Fingers, toes, and facial features defined. Major organ structures are in place. Trimester 1 screening & NIPT testing window." },
  4: { month: 4, weeks: "Weeks 14-17", trimester: 2, size: "an avocado", keyFact: "Welcome to the energetic Trimester 2! Baby can make sucking motions. Energy often returns and nausea subsides." },
  5: { month: 5, weeks: "Weeks 18-22", trimester: 2, size: "a bell pepper", keyFact: "Anatomy scan (20-week ultrasound) window. First fetal movements ('quickening') felt like gentle flutters or bubbles." },
  6: { month: 6, weeks: "Weeks 23-27", trimester: 2, size: "an ear of corn", keyFact: "Auditory system is functioning—baby can hear your voice and heartbeat! REM sleep cycles and lung surfactant production begin." },
  7: { month: 7, weeks: "Weeks 28-31", trimester: 3, size: "an eggplant", keyFact: "Entering Trimester 3! Baby can open and close their eyes. Brain tissue expanding rapidly. Start daily fetal kick counting." },
  8: { month: 8, weeks: "Weeks 32-36", trimester: 3, size: "a butternut squash", keyFact: "Bones harden (except skull plates for birth). Rapid maternal weight gain as baby puts on protective fat. Group B Strep screening." },
  9: { month: 9, weeks: "Weeks 37-40", trimester: 3, size: "a small watermelon", keyFact: "Full term! Baby drops into pelvic inlet ('lightening'). Practice contractions (Braxton Hicks) prepare cervix for labor." }
};

function getWeekDetails(week) {
  const w = parseInt(week, 10) || 24;
  let month = Math.min(9, Math.max(1, Math.ceil(w / 4.44)));
  if (w <= 4) month = 1;
  else if (w <= 8) month = 2;
  else if (w <= 13) month = 3;
  else if (w <= 17) month = 4;
  else if (w <= 22) month = 5;
  else if (w <= 27) month = 6;
  else if (w <= 31) month = 7;
  else if (w <= 36) month = 8;
  else month = 9;

  let trimester = 1;
  if (w >= 14 && w <= 27) trimester = 2;
  if (w >= 28) trimester = 3;

  const milestone = pregnancyMilestones[month];
  return { week: w, month, trimester, ...milestone };
}

/**
 * Generate Clinical AI Doula Response
 */
function generateChatResponse(userMessage, userProfile = {}) {
  const query = (userMessage || '').toLowerCase().trim();
  const week = userProfile.pregnancy_week || 24;
  const month = userProfile.pregnancy_month || 6;
  const name = userProfile.name || 'Sarah';

  // 1. RED FLAG EMERGENCY SYMPTOMS
  if (
    query.includes('bleeding') || 
    query.includes('spotting') || 
    query.includes('fluid leak') || 
    query.includes('water broke') || 
    query.includes('faint') || 
    query.includes('dizziness') || 
    query.includes('chest pain') || 
    query.includes('calf pain') || 
    query.includes('no movement') || 
    query.includes('stopped kicking') ||
    query.includes('decreased movement')
  ) {
    return {
      reply: `⚠️ **Important Clinical Notice for ${name}:**\n\nSymptoms such as vaginal bleeding, sudden amniotic fluid leakage, chest pain, or a noticeable decrease in fetal movement require **immediate evaluation** by your healthcare team.\n\n📞 **Action Steps:**\n1. Contact **${userProfile.primary_clinic_name || 'your primary OB/GYN clinic'}** immediately.\n2. For 24/7 emergency triage, call your hospital labor line or **911**.\n3. Rest on your left side and do not delay medical assessment.`,
      category: 'emergency',
      isEmergency: true,
      suggestedActions: ['Call Doctor', '24/7 Triage Line', 'View Clinics']
    };
  }

  // 2. FOOD SAFETY & CHEESES / SUSHI / CAFFEINE
  if (query.includes('cheese') || query.includes('feta') || query.includes('goat cheese') || query.includes('brie')) {
    return {
      reply: `🧀 **Cheese Safety in Pregnancy:**\n\n- **Safe:** Any cheese made from **pasteurized milk** (including pasteurized feta, goat cheese, mozzarella, cheddar, parmesan, and ricotta).\n- **Avoid:** Cheeses made with *raw (unpasteurized) milk* or unpasteurized soft mold-ripened cheeses (like unpasteurized Brie, Camembert, or Roquefort) due to the risk of *Listeria monocytogenes*.\n\n💡 *Tip:* In the US and Europe, most store-bought feta and goat cheeses are clearly labeled **"Pasteurized"** and are completely safe for you and baby!`,
      category: 'nutrition',
      suggestedActions: ['Browse Safe Dishes', 'Folate Recipes', 'Hydration Tips']
    };
  }

  if (query.includes('sushi') || query.includes('raw fish') || query.includes('salmon') || query.includes('fish')) {
    return {
      reply: `🍣 **Seafood & Fish Guidelines:**\n\n- **Encouraged (2-3 servings/week):** Low-mercury cooked fish like **Wild Salmon, Sardines, Trout, and Cod**. These are packed with **DHA (Omega-3)** essential for baby's developing brain and eyes at Week ${week}.\n- **Avoid:** Raw/undercooked fish (standard sushi/sashimi) and high-mercury predatory fish (Shark, Swordfish, King Mackerel, Bigeye Tuna).\n\n💡 *Craving sushi?* Enjoy cooked California rolls, cooked salmon rolls, or avocado/cucumber rolls!`,
      category: 'nutrition',
      suggestedActions: ['Wild Salmon Power Bowl', 'DHA Nutrient Filter']
    };
  }

  if (query.includes('coffee') || query.includes('caffeine') || query.includes('tea')) {
    return {
      reply: `☕ **Caffeine Guidelines (ACOG Standard):**\n\n- Pregnant women can safely consume up to **200 mg of caffeine per day** (equivalent to about one 12-ounce cup of brewed coffee).\n- Remember that chocolate, colas, energy drinks, and green/black teas also contribute to daily caffeine intake.\n- *Herbal Teas:* Ginger, peppermint, and rooibos teas are wonderful caffeine-free alternatives for soothing nausea and digestion!`,
      category: 'nutrition'
    };
  }

  // 3. SYMPTOMS (LEG CRAMPS, HEARTBURN, MORNING SICKNESS, BACK PAIN)
  if (query.includes('leg cramp') || query.includes('calf cramp') || query.includes('cramps at night')) {
    return {
      reply: `🦵 **Managing Nighttime Pregnancy Leg Cramps:**\n\nLeg cramps are very common in Month ${month} (Trimester ${week >= 28 ? 3 : 2}) due to fatigue, uterine pressure on pelvic veins, and electrolyte balance.\n\n✨ **Natural Relief Strategies:**\n1. **Flex, Don't Point:** When a cramp strikes, immediately flex your foot upward (toes toward your shin).\n2. **Magnesium & Potassium:** Enjoy potassium-rich bananas, sweet potatoes, and magnesium-rich pumpkin seeds, almonds, or leafy greens.\n3. **Active Hydration:** Aim for your daily 2.5L goal. Dehydration is the #1 trigger for spasms.\n4. **Calf Stretching:** Do 3 minutes of gentle wall calf stretches before bed.`,
      category: 'symptoms',
      suggestedActions: ['Log Hydration', 'Gentle Movement Studio']
    };
  }

  if (query.includes('heartburn') || query.includes('acid reflux') || query.includes('indigestion')) {
    return {
      reply: `🔥 **Soothing Pregnancy Heartburn:**\n\nAs progesterone relaxes the esophageal sphincter and baby pushes upward against your stomach, heartburn can flare up.\n\n✨ **Quick Remedies:**\n- Eat **5–6 smaller meals** throughout the day instead of 2–3 large ones.\n- Avoid lying down for at least 60–90 minutes after eating.\n- Sip warm almond milk, chamomile tea, or a small spoonful of Greek yogurt.\n- Elevate your head and torso slightly with extra pillows at night.`,
      category: 'symptoms'
    };
  }

  // 4. CONTRACTIONS & 5-1-1 RULE
  if (query.includes('contraction') || query.includes('5-1-1') || query.includes('labor') || query.includes('braxton hicks')) {
    return {
      reply: `⏱️ **Understanding Contractions & The 5-1-1 Clinical Rule:**\n\n- **Braxton Hicks (Practice):** Irregular, painless or mild tightening, often stop when you change positions, walk, or drink water.\n- **True Labor Contractions:** Regular, progressively stronger, closer together, and do not fade with rest.\n\n🚨 **The 5-1-1 Rule to Head to Hospital / Call Midwife:**\n- **5:** Contractions are **5 minutes apart** (from start of one to start of the next)\n- **1:** Each contraction lasts for **1 full minute** (60 seconds)\n- **1:** This consistent rhythm has continued for **1 whole hour**\n\n*Note:* If your water breaks or you experience bright red bleeding, contact triage immediately regardless of contraction frequency!`,
      category: 'labor',
      suggestedActions: ['View Clinics Directory', 'Call Triage Hotline']
    };
  }

  // 5. BABY DEVELOPMENT & CURRENT WEEK / MONTH
  if (query.includes('baby') || query.includes('month') || query.includes('week') || query.includes('size') || query.includes('development') || query.includes('milestone')) {
    const details = getWeekDetails(week);
    return {
      reply: `👶 **Baby's Development at Week ${details.week} (Month ${details.month}, Trimester ${details.trimester}):**\n\n- **Size Comparison:** Baby is the size of **${details.size}** (~11.8 inches, 1.3 lbs)!\n- **Anatomy & Senses:** ${details.keyFact}\n- **What You Might Feel:** Stronger kicks and turns as baby responds to familiar voices, warm baths, and maternal movement.\n\n🌟 *Recommendation for Week ${details.week}:* Keep up your daily prenatal vitamins with folate and DHA, and enjoy 20–30 minutes of gentle movement today!`,
      category: 'milestones',
      suggestedActions: ['Explore Exercises', 'Log Movement Session']
    };
  }

  // 6. EXERCISE & MOVEMENT SAFETY
  if (query.includes('exercise') || query.includes('workout') || query.includes('squat') || query.includes('yoga') || query.includes('run')) {
    return {
      reply: `🧘 **ACOG Pregnancy Movement Guidelines:**\n\n- **Weekly Target:** 150 minutes per week of moderate-intensity aerobic exercise (e.g., 30 mins x 5 days).\n- **The "Talk Test":** You should be able to carry on a comfortable conversation without gasping for breath.\n- **Safe Moves:** Prenatal yoga, Cat-Cow spine releases, supported deep squats with a yoga block, brisk walking, and swimming.\n- **What to Avoid:** Heavy contact sports, hot yoga, and lying flat on your back after Week 16.\n\n🌸 *Check out the **Exercises** tab in Bloom for 6 guided prenatal routines!*`,
      category: 'exercise',
      suggestedActions: ['Open Exercise Studio', 'ACOG Safety Protocol']
    };
  }

  // 7. DEFAULT NURTURING AI DOULA RESPONSE
  return {
    reply: `🌸 **Hello ${name}! I'm your Bloom AI Doula & Midwife Assistant.**\n\nAt **Week ${week} (Month ${month})**, you are doing an extraordinary job nurturing your baby!\n\nI can help you with:\n- 🥗 **Nutrition & Cravings** (Safe cheeses, seafood, folate & iron foods)\n- 🩺 **Prenatal Symptoms** (Leg cramps, heartburn, fatigue, back relief)\n- 🧘 **ACOG Exercise Guidelines** (Safe workouts & pelvic floor health)\n- ⏱️ **Labor Prep & Contraction Timing** (5-1-1 rule, hospital triage)\n- 🌽 **Baby Development & Growth Milestones**\n\nWhat question or doubt can I help you with today?`,
    category: 'general',
    suggestedActions: ['Is feta cheese safe?', 'How to stop leg cramps?', 'Baby development at Week 24', 'What is the 5-1-1 rule?']
  };
}

module.exports = {
  getWeekDetails,
  generateChatResponse
};
