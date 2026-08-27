import type { MealSuggestion } from '../types/meal';
import type { DietaryPreference } from '../types/user';

export const MEALS_DATABASE: Record<DietaryPreference, MealSuggestion[]> = {
  Vegetarian: [
    {
      id: 'meal_veg_breakfast',
      type: 'breakfast',
      title: 'Vegetable Upma & Warm Turmeric Milk',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'i1', name: 'Vegetable Semolina / Oats Upma (with carrots, peas, beans, cashews)', portion: '1 medium bowl', benefits: 'Sustained complex energy & gentle fiber' },
        { id: 'i2', name: 'Fresh Papaya / Apple slices', portion: '1 cup', benefits: 'Digestive enzymes & Vitamin C' },
        { id: 'i3', name: 'Warm Herbal Tea or Golden Turmeric Milk', portion: '150 ml', benefits: 'Calcium & gentle anti-inflammatory warmth' }
      ],
      caloriesApprox: 380,
      dietaryTags: ['Vegetarian', 'Balanced'],
      guidanceTip: 'Rich in soluble fiber which aids gentle digestion, gut motility, and steady morning energy without sluggishness.',
      isLogged: false
    },
    {
      id: 'meal_veg_lunch',
      type: 'lunch',
      title: 'Wholesome Thali: Moong Dal, Steamed Rice, Phulkas & Spinach Sabzi',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'i4', name: 'Yellow Moong Dal / Toor Dal with cumin tadka', portion: '1 katori (150g)', benefits: 'Clean, easily digestible plant protein (12g)' },
        { id: 'i5', name: 'Soft Whole Wheat Phulkas or Steamed Basmati Rice', portion: '2 chapatis or 1 small cup', benefits: 'Complex carbohydrates & B-vitamins' },
        { id: 'i6', name: 'Sautéed Spinach & Lauki (Bottle Gourd) Sabzi', portion: '1 katori', benefits: 'Hydrating micronutrients, iron & magnesium' },
        { id: 'i7', name: 'Fresh Probiotic Curd / Dahi with roasted jeera', portion: '1 small cup', benefits: 'Gut microbiome support & active cultures' }
      ],
      caloriesApprox: 520,
      dietaryTags: ['Vegetarian', 'Balanced'],
      guidanceTip: 'A balanced traditional plate providing 18g+ gentle protein with healthy gut probiotics for optimal digestive transit.',
      isLogged: false
    },
    {
      id: 'meal_veg_snack',
      type: 'snack',
      title: 'Roasted Foxnuts (Makhana), Nuts & Fresh Fruit Bowl',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'i8', name: 'Lightly roasted Foxnuts (Makhana) with rock salt & pepper', portion: '1 bowl (30g)', benefits: 'Low-calorie calcium, potassium & magnesium crunch' },
        { id: 'i9', name: 'Soaked Almonds & Walnuts', portion: '4-5 nuts', benefits: 'Healthy brain omega-3s & joint lubrication' },
        { id: 'i10', name: 'Herbal Chamomile or Ginger Green Tea', portion: '1 warm cup', benefits: 'Hydrating & tension-relieving' }
      ],
      caloriesApprox: 180,
      dietaryTags: ['Vegetarian', 'Low-Sodium'],
      guidanceTip: 'Light afternoon snack that prevents evening fatigue and brain fog without causing heavy bloating.',
      isLogged: false
    },
    {
      id: 'meal_veg_dinner',
      type: 'dinner',
      title: 'Light Spiced Paneer / Tofu Curry & Soft Multigrain Roti',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'i11', name: 'Paneer or Tofu Bhurji / Light Curry with bell peppers', portion: '1 katori (120g)', benefits: 'High protein (16g) for overnight tissue repair' },
        { id: 'i12', name: 'Soft Jowar or Multigrain Phulka', portion: '1-2 rotis', benefits: 'Easy on evening digestive transit' },
        { id: 'i13', name: 'Warm Clear Vegetable Soup with herbs', portion: '1 warm bowl', benefits: 'Hydration, electrolytes & satiety' }
      ],
      caloriesApprox: 440,
      dietaryTags: ['Vegetarian', 'Balanced'],
      guidanceTip: 'A lighter dinner enjoyed 2-3 hours before bedtime promotes deep restorative sleep and optimal nighttime recovery.',
      isLogged: false
    }
  ],
  Vegan: [
    {
      id: 'meal_vgn_breakfast',
      type: 'breakfast',
      title: 'Warm Oatmeal with Berries & Sprouted Moong',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'v1', name: 'Rolled Oats in Almond Milk with chia seeds & berries', portion: '1 bowl', benefits: 'Heart-healthy beta-glucan fiber' },
        { id: 'v2', name: 'Steamed Sprouted Moong with lemon juice & cucumber', portion: '1/2 bowl', benefits: 'Bioavailable vegan protein' }
      ],
      caloriesApprox: 360,
      dietaryTags: ['Vegan', 'Balanced'],
      guidanceTip: 'Plant-powered vitality with high mineral density and gut-soothing soluble fiber.',
      isLogged: false
    },
    {
      id: 'meal_vgn_lunch',
      type: 'lunch',
      title: 'Chickpea & Tomato Stew with Quinoa & Steamed Greens',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'v3', name: 'Mild Chickpea & Tomato Stew', portion: '1 large katori', benefits: 'Fiber-rich protein and zinc' },
        { id: 'v4', name: 'Fluffy Quinoa or Brown Rice', portion: '1 cup', benefits: 'Complete essential amino acids' },
        { id: 'v5', name: 'Steamed Broccoli & Carrots with olive oil drizzle', portion: '1 cup', benefits: 'Vitamins A, C & K' }
      ],
      caloriesApprox: 510,
      dietaryTags: ['Vegan', 'Balanced'],
      guidanceTip: 'Nutrient-rich vegan lunch with all 9 essential amino acids.',
      isLogged: false
    },
    {
      id: 'meal_vgn_snack',
      type: 'snack',
      title: 'Roasted Foxnuts & Guacamole with Cucumber Sticks',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'v6', name: 'Mashed Avocado with lime & cilantro', portion: '2 tbsp', benefits: 'Monounsaturated healthy fats' },
        { id: 'v7', name: 'Crunchy cucumber and carrot batons', portion: '1 cup', benefits: 'Hydrating cellular electrolytes' }
      ],
      caloriesApprox: 160,
      dietaryTags: ['Vegan', 'Low-Sodium'],
      guidanceTip: 'Healthy fats support vitamin absorption and joint lubrication.',
      isLogged: false
    },
    {
      id: 'meal_vgn_dinner',
      type: 'dinner',
      title: 'Tofu & Mixed Veggie Stir-fry with Sweet Potato',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'v8', name: 'Grilled firm Tofu cubes with bok choy & mushrooms', portion: '150g', benefits: 'Clean protein with minimal carbs' },
        { id: 'v9', name: 'Roasted Mashed Sweet Potato', portion: '1 small', benefits: 'Potassium and soothing complex carbs' }
      ],
      caloriesApprox: 420,
      dietaryTags: ['Vegan', 'Balanced'],
      guidanceTip: 'Light, nutrient-dense evening dinner that prevents overnight reflux.',
      isLogged: false
    }
  ],
  'Non-Vegetarian': [
    {
      id: 'meal_nv_breakfast',
      type: 'breakfast',
      title: 'Soft Eggs with Multigrain Toast & Fresh Fruit',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'nv1', name: '2 Eggs (Softly scrambled with herbs)', portion: '2 whole eggs', benefits: 'Complete choline & high biological value protein' },
        { id: 'nv2', name: 'Toasted Multigrain bread', portion: '1-2 slices', benefits: 'Steady carbohydrate delivery' },
        { id: 'nv3', name: 'Fresh Orange or Kiwi segments', portion: '1 fruit', benefits: 'Vitamin C & electrolyte balance' }
      ],
      caloriesApprox: 390,
      dietaryTags: ['Non-Vegetarian', 'Balanced'],
      guidanceTip: 'High morning satiety to fuel your upper body mobility exercises.',
      isLogged: false
    },
    {
      id: 'meal_nv_lunch',
      type: 'lunch',
      title: 'Grilled Herb Chicken / Fish with Steamed Rice & Salad',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'nv4', name: 'Tender Grilled Chicken Breast or Fish Fillet (mildly spiced)', portion: '120g', benefits: 'Lean protein for muscle maintenance' },
        { id: 'nv5', name: 'Steamed Basmati / Brown Rice', portion: '1 cup', benefits: 'Digestible energy' },
        { id: 'nv6', name: 'Mixed cucumber, tomato & lettuce salad', portion: '1 bowl', benefits: 'Natural hydration & prebiotic fiber' }
      ],
      caloriesApprox: 540,
      dietaryTags: ['Non-Vegetarian', 'Balanced'],
      guidanceTip: 'Provides rich omega fatty acids and essential minerals for muscle wellness.',
      isLogged: false
    },
    {
      id: 'meal_nv_snack',
      type: 'snack',
      title: 'Greek Yogurt with Crushed Walnuts & Makhana',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'nv7', name: 'Plain Greek Yogurt', portion: '1 cup (150g)', benefits: 'High protein & active cultures' },
        { id: 'nv8', name: 'Handful of Walnuts and roasted makhana', portion: '1 small bowl', benefits: 'Satiating healthy fats' }
      ],
      caloriesApprox: 200,
      dietaryTags: ['Non-Vegetarian', 'Balanced'],
      guidanceTip: 'Smooth and soothing afternoon protein boost.',
      isLogged: false
    },
    {
      id: 'meal_nv_dinner',
      type: 'dinner',
      title: 'Steamed Fish / Egg Curry with Warm Phulkas & Broth',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'nv9', name: 'Mild Egg Curry or Steamed Fish in aromatic tomato gravy', portion: '1 bowl', benefits: 'Gentle night-time protein' },
        { id: 'nv10', name: 'Soft Whole Wheat Phulkas', portion: '2 rotis', benefits: 'Easy on digestive transit' },
        { id: 'nv11', name: 'Clear Vegetable Broth', portion: '1 small cup', benefits: 'Soothes gut lining' }
      ],
      caloriesApprox: 450,
      dietaryTags: ['Non-Vegetarian', 'Balanced'],
      guidanceTip: 'Easy-to-digest lean dinner supporting overnight muscle recovery.',
      isLogged: false
    }
  ],
  'Low-Sodium': [
    {
      id: 'meal_ls_breakfast',
      type: 'breakfast',
      title: 'Oatmeal with Sliced Papaya & Flaxseeds',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'ls1', name: 'Steel-cut oats cooked with cinnamon & crushed nuts', portion: '1 bowl', benefits: 'Zero added salt, potassium-rich' },
        { id: 'ls2', name: 'Fresh sliced papaya & ground flaxseed', portion: '1 cup', benefits: 'Potassium to balance sodium levels' }
      ],
      caloriesApprox: 340,
      dietaryTags: ['Low-Sodium', 'Balanced'],
      guidanceTip: 'Naturally low in sodium to support optimal blood pressure and reduce fluid retention.',
      isLogged: false
    },
    {
      id: 'meal_ls_lunch',
      type: 'lunch',
      title: 'Herbed Rice with Low-Sodium Dal & Lemon Zest',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'ls3', name: 'Moong Dal prepared with fresh herbs, garlic & lemon (minimal salt)', portion: '1 cup', benefits: 'Clean protein with herbs replacing salt' },
        { id: 'ls4', name: 'Steamed Brown Rice with fresh coriander', portion: '1 cup', benefits: 'Complex slow carbs' },
        { id: 'ls5', name: 'Steamed Zucchini & Carrots', portion: '1 cup', benefits: 'High water volume and potassium' }
      ],
      caloriesApprox: 480,
      dietaryTags: ['Low-Sodium', 'Vegetarian'],
      guidanceTip: 'Flavored with lemon juice, coriander, and garlic rather than table salt.',
      isLogged: false
    },
    {
      id: 'meal_ls_snack',
      type: 'snack',
      title: 'Roasted Makhana & Fresh Fruit Plate',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'ls6', name: 'Fresh crisp apple and pear slices', portion: '1.5 cups', benefits: 'Natural hydration and pectin' },
        { id: 'ls7', name: 'Roasted unsalted foxnuts & pumpkin seeds', portion: '1 bowl', benefits: 'Magnesium and zinc' }
      ],
      caloriesApprox: 150,
      dietaryTags: ['Low-Sodium', 'Vegan'],
      guidanceTip: 'Helps flush excess fluids naturally.',
      isLogged: false
    },
    {
      id: 'meal_ls_dinner',
      type: 'dinner',
      title: 'Herb-Roasted Paneer / Tofu with Steamed Pumpkin Mash',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'ls8', name: 'Paneer or Tofu cubes seasoned with rosemary and black pepper', portion: '100g', benefits: 'High protein, low sodium seasoning' },
        { id: 'ls9', name: 'Mashed Yellow Pumpkin with nutmeg', portion: '1 cup', benefits: 'Gentle, soothing night starch' }
      ],
      caloriesApprox: 400,
      dietaryTags: ['Low-Sodium', 'Balanced'],
      guidanceTip: 'A soothing dinner that supports resting cardiovascular relaxation.',
      isLogged: false
    }
  ],
  'Gluten-Free': [
    {
      id: 'meal_gf_breakfast',
      type: 'breakfast',
      title: 'Ragi Idli with Coconut Chutney & Fruit',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'gf1', name: 'Steamed Gluten-Free Ragi & Rice Idlis', portion: '3 idlis', benefits: 'High calcium and gentle starch' },
        { id: 'gf2', name: 'Mild Coconut-Coriander Chutney', portion: '2 tbsp', benefits: 'Healthy medium-chain triglycerides' },
        { id: 'gf3', name: 'Fresh Fruit segments', portion: '1/2 cup', benefits: 'Antioxidants & polyphenols' }
      ],
      caloriesApprox: 370,
      dietaryTags: ['Gluten-Free', 'Vegetarian'],
      guidanceTip: '100% naturally gluten-free millet breakfast offering superior bone-strengthening calcium.',
      isLogged: false
    },
    {
      id: 'meal_gf_lunch',
      type: 'lunch',
      title: 'Jowar Roti with Rajma & Cucumber Raita',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'gf4', name: 'Soft Kidney Bean (Rajma) Curry', portion: '1 katori', benefits: 'High iron, zinc and plant protein' },
        { id: 'gf5', name: 'Fresh Jowar (Sorghum) Rotis or Steamed Rice', portion: '2 rotis or 1 cup', benefits: 'Gluten-free gut harmony' },
        { id: 'gf6', name: 'Cooling Cucumber & Mint Raita', portion: '1 cup', benefits: 'Hydrating digestive enzymes' }
      ],
      caloriesApprox: 510,
      dietaryTags: ['Gluten-Free', 'Vegetarian'],
      guidanceTip: 'Comfort food reformulated with naturally gluten-free ancient grains.',
      isLogged: false
    },
    {
      id: 'meal_gf_snack',
      type: 'snack',
      title: 'Roasted Makhana & Fresh Fruit Infusion',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'gf7', name: 'Crispy roasted foxnuts with almonds', portion: '1 bowl', benefits: 'Satiating energy crunch' },
        { id: 'gf8', name: 'Herbal tea or green tea', portion: '1 warm cup', benefits: 'Antioxidant refresh' }
      ],
      caloriesApprox: 190,
      dietaryTags: ['Gluten-Free', 'Vegetarian'],
      guidanceTip: 'Quick gluten-free snack with zero digestive distress.',
      isLogged: false
    },
    {
      id: 'meal_gf_dinner',
      type: 'dinner',
      title: 'Moong Dal Khichdi with Steamed Greens & Ghee',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'gf9', name: 'Moong Dal & Rice Khichdi with a dash of pure ghee', portion: '1.5 cups', benefits: 'Ultimate easy-to-digest soothing complete protein' },
        { id: 'gf10', name: 'Steamed Green Beans with sesame seeds', portion: '1 katori', benefits: 'Fiber and minerals' }
      ],
      caloriesApprox: 420,
      dietaryTags: ['Gluten-Free', 'Vegetarian'],
      guidanceTip: 'Traditional healing khichdi that lets your body rest comfortably all night.',
      isLogged: false
    }
  ],
  'Diabetic-Friendly': [
    {
      id: 'meal_df_breakfast',
      type: 'breakfast',
      title: 'Besan Chilla (Gram Flour Crepe) with Mint Dip',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'df1', name: 'Chickpea flour (Besan) Chilla with grated veggies', portion: '2 medium chillas', benefits: 'Low glycemic index, sustained blood sugar' },
        { id: 'df2', name: 'Homemade mint and coriander dip', portion: '2 tbsp', benefits: 'Zero added sugar, digestion aid' },
        { id: 'df3', name: 'Warm Cinnamon Green Tea', portion: '1 cup', benefits: 'Natural insulin sensitivity support' }
      ],
      caloriesApprox: 350,
      dietaryTags: ['Diabetic-Friendly', 'Vegetarian'],
      guidanceTip: 'Low GI protein prevents morning blood glucose spikes.',
      isLogged: false
    },
    {
      id: 'meal_df_lunch',
      type: 'lunch',
      title: 'Methi Roti with Black Chana Curry & Salad',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'df4', name: 'Spiced Black Chickpeas (Kala Chana) curry', portion: '1 katori (150g)', benefits: 'High complex fiber and slow-release glucose' },
        { id: 'df5', name: 'Fenugreek-infused Whole Wheat Phulka', portion: '2 rotis', benefits: 'Fenugreek helps regulate carbohydrate absorption' },
        { id: 'df6', name: 'Large bowl of sliced radish, cucumber, tomato with lemon', portion: '1 bowl', benefits: 'Fiber cushion before meals' }
      ],
      caloriesApprox: 480,
      dietaryTags: ['Diabetic-Friendly', 'Vegetarian'],
      guidanceTip: 'High-fiber lunch that stabilizes post-prandial glucose curves.',
      isLogged: false
    },
    {
      id: 'meal_df_snack',
      type: 'snack',
      title: 'Roasted Makhana & Bengal Gram with Green Tea',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'df7', name: 'Roasted dry Bengal gram & makhana', portion: '1 bowl (40g)', benefits: 'Very low GI, protein & magnesium' },
        { id: 'df8', name: 'Unsweetened brewed ginger tea', portion: '1 cup', benefits: 'Metabolic warmth' }
      ],
      caloriesApprox: 140,
      dietaryTags: ['Diabetic-Friendly', 'Vegetarian'],
      guidanceTip: 'Ideal afternoon snack for zero blood sugar fluctuations.',
      isLogged: false
    },
    {
      id: 'meal_df_dinner',
      type: 'dinner',
      title: 'Grilled Paneer / Mushroom Tikka with Soup',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'df9', name: 'Grilled Cottage Cheese / Tofu & Mushroom skewers', portion: '150g', benefits: 'High protein, near-zero glycemic impact' },
        { id: 'df10', name: 'Warm bowl of Vegetable & Lentil broth', portion: '1 large bowl', benefits: 'Filling, hydrating, comforting' }
      ],
      caloriesApprox: 390,
      dietaryTags: ['Diabetic-Friendly', 'Balanced'],
      guidanceTip: 'Low-carb dinner ensuring stable fasting blood sugar levels overnight.',
      isLogged: false
    }
  ],
  Balanced: [
    {
      id: 'meal_bal_breakfast',
      type: 'breakfast',
      title: 'Vegetable Upma & Fresh Fruit Bowl',
      suggestedTime: '8:00 AM - 9:00 AM',
      image: '/assets/meals/upma.jpg',
      items: [
        { id: 'b1', name: 'Warm vegetable upma with chia seeds', portion: '1 bowl', benefits: 'Sustained energy' },
        { id: 'b2', name: 'Fresh sliced papaya & apple', portion: '1 cup', benefits: 'Fiber and antioxidants' }
      ],
      caloriesApprox: 370,
      dietaryTags: ['Balanced'],
      guidanceTip: 'Harmonious start for smooth, steady vitality.',
      isLogged: false
    },
    {
      id: 'meal_bal_lunch',
      type: 'lunch',
      title: 'Balanced Thali: Lentils, Rice, Seasonal Greens & Curd',
      suggestedTime: '1:00 PM - 2:00 PM',
      image: '/assets/meals/thali.jpg',
      items: [
        { id: 'b3', name: 'Mixed Lentil (Panchmel) Dal', portion: '1 cup', benefits: 'Broad spectrum plant amino acids' },
        { id: 'b4', name: 'Steamed Rice and 1 Soft Phulka', portion: '1 portion', benefits: 'Sustained daily carbs' },
        { id: 'b5', name: 'Gourd and Green Beans Sabzi', portion: '1 cup', benefits: 'Hydrating micronutrients' },
        { id: 'b6', name: 'Probiotic Curd', portion: '1/2 cup', benefits: 'Digestive harmony' }
      ],
      caloriesApprox: 520,
      dietaryTags: ['Balanced'],
      guidanceTip: 'Comprehensive macronutrient distribution for steady physical wellness.',
      isLogged: false
    },
    {
      id: 'meal_bal_snack',
      type: 'snack',
      title: 'Crispy Roasted Makhana & Mixed Nuts',
      suggestedTime: '4:30 PM - 5:30 PM',
      image: '/assets/meals/snack.jpg',
      items: [
        { id: 'b7', name: 'Roasted Foxnuts with Himalayan salt', portion: '1 bowl', benefits: 'Mineral crunch' },
        { id: 'b8', name: 'Almonds and walnuts', portion: '1 tbsp', benefits: 'Vital healthy omega-3s' }
      ],
      caloriesApprox: 170,
      dietaryTags: ['Balanced'],
      guidanceTip: 'Gentle snack for sustained afternoon vitality.',
      isLogged: false
    },
    {
      id: 'meal_bal_dinner',
      type: 'dinner',
      title: 'Light Paneer & Vegetable Stew with Soft Roti',
      suggestedTime: '7:30 PM - 8:30 PM',
      image: '/assets/meals/dinner.jpg',
      items: [
        { id: 'b9', name: 'Aromatic vegetable and lentil stew with paneer', portion: '1 large bowl', benefits: 'Nutrient-rich and easy to digest' },
        { id: 'b10', name: 'Soft Multigrain Phulka', portion: '2 rotis', benefits: 'Clean night fuel' }
      ],
      caloriesApprox: 430,
      dietaryTags: ['Balanced'],
      guidanceTip: 'Light evening meal promoting peaceful, restorative rest.',
      isLogged: false
    }
  ]
};
