import type { Exercise } from '../types/exercise';

export const EXERCISES_DATA: Exercise[] = [
  {
    id: 'ex_shoulder_rolls',
    title: 'Seated Shoulder Rolls',
    category: 'seated',
    difficulty: 'Gentle',
    durationMinutes: 5,
    mobilityRequirement: 'Wheelchair / Seated Friendly',
    equipment: 'Sturdy chair or wheelchair',
    image: '/assets/exercises/shoulder_rolls.jpg',
    calorieEstimate: '~15-20 kcal (gentle circulation)',
    shortDescription: 'Gentle cyclical shoulder rotations to release upper back tension, neck stiffness, and stimulate blood flow.',
    howToPerformGuide: {
      postureSetup: 'Sit comfortably with spine tall against your wheelchair backrest. Rest hands loosely on thighs.',
      breathingRhythm: 'Inhale as your shoulders rise upward toward ears; exhale smoothly as you roll them down and back.',
      targetMuscles: ['Upper Trapezius', 'Rhomboids', 'Levator Scapulae', 'Rotator Cuff'],
      commonMistakes: 'Avoid hunching your neck forward or performing rapid jerking motions.'
    },
    safetyNotes: [
      'Stop if you experience pain, dizziness, or sharp shoulder clicking.',
      'Maintain an upright, comfortable spinal posture throughout.',
      'Consult a healthcare professional before starting new physical activity if you have medical restrictions.'
    ],
    benefits: [
      'Relieves upper back and neck tension',
      'Improves shoulder joint lubrication & mobility',
      'Enhances sitting posture and breathing ease'
    ],
    icon: 'RotateCw',
    suitableMobility: ['Wheelchair user', 'Limited mobility', 'Upper-body mobility', 'Independent walking', 'Assisted walking', 'Bed-rest / Low mobility'],
    steps: [
      {
        stepNumber: 1,
        title: 'Neutral Sitting Posture Setup',
        instruction: 'Sit comfortably with your back supported. Rest your hands gently on your thighs. Take a slow, deep breath in and exhale smoothly.',
        durationSec: 30,
        tip: 'Keep your shoulders relaxed and down away from your ears.'
      },
      {
        stepNumber: 2,
        title: 'Forward Shoulder Rolls',
        instruction: 'Gently lift your shoulders up toward your ears, roll them forward, down, and back in a smooth, continuous circle. Breathe naturally.',
        durationSec: 90,
        tip: 'Make small circles first, only expanding the range if comfortable.'
      },
      {
        stepNumber: 3,
        title: 'Backward Scapular Rolls',
        instruction: 'Reverse the direction. Lift shoulders up, roll them backward, squeeze shoulder blades gently together, and let them drop softly.',
        durationSec: 90,
        tip: 'Focus on gentle rhythm rather than speed.'
      },
      {
        stepNumber: 4,
        title: 'Relaxation & Cool Down',
        instruction: 'Let your arms hang comfortably or rest on your lap. Close your eyes for 3 calming breaths.',
        durationSec: 90,
        tip: 'Notice any lightness in your neck and shoulder area.'
      }
    ]
  },
  {
    id: 'ex_arm_raises',
    title: 'Seated Arm Raises & Overhead Reach',
    category: 'seated',
    difficulty: 'Easy',
    durationMinutes: 8,
    mobilityRequirement: 'Wheelchair / Upper-Body Friendly',
    equipment: 'None (Optional light resistance band)',
    image: '/assets/exercises/arm_raises.jpg',
    calorieEstimate: '~25-35 kcal',
    shortDescription: 'Gentle overhead or forward arm reaches to expand lung capacity, open the rib cage, and mobilize shoulder joints.',
    howToPerformGuide: {
      postureSetup: 'Sit tall with engaging core muscles. Place palms resting on knees facing inward.',
      breathingRhythm: 'Inhale deeply as you raise arms upward; exhale slowly as you lower them back to lap.',
      targetMuscles: ['Deltoids (Anterior & Lateral)', 'Pectoralis Major', 'Serratus Anterior'],
      commonMistakes: 'Do not arch your lower back or strain past a comfortable pain-free height.'
    },
    safetyNotes: [
      'Lift arms only within your pain-free range of motion. Do not force overhead reach.',
      'Keep movements slow and controlled.',
      'Stop if you feel lightheaded or sharp joint strain.'
    ],
    benefits: [
      'Expands rib cage for deeper breathing',
      'Strengthens upper chest and deltoid muscles',
      'Boosts upper-body daily mobility and stamina'
    ],
    icon: 'ArrowUpCircle',
    suitableMobility: ['Wheelchair user', 'Limited mobility', 'Upper-body mobility', 'Independent walking', 'Assisted walking'],
    steps: [
      {
        stepNumber: 1,
        title: 'Setup & Diaphragmatic Breath',
        instruction: 'Sit tall with engaging core muscles. Place palms resting on knees facing inward.',
        durationSec: 30,
        tip: 'Keep your chin level and gaze straight ahead.'
      },
      {
        stepNumber: 2,
        title: 'Front Raises with Inhale',
        instruction: 'Inhale and smoothly raise both arms forward and upward to shoulder height (or higher if comfortable). Exhale as you slowly lower.',
        durationSec: 150,
        tip: 'Keep elbows soft and not locked.'
      },
      {
        stepNumber: 3,
        title: 'Lateral Arm Openings',
        instruction: 'Bring arms out to the sides at chest height, opening the chest gently. Inhale open, exhale bring hands together.',
        durationSec: 150,
        tip: 'Feel the gentle expansion across your chest.'
      },
      {
        stepNumber: 4,
        title: 'Resting Breath',
        instruction: 'Lower hands to your lap. Take 4 deep, grounding breaths.',
        durationSec: 150,
        tip: 'Allow heart rate and muscles to settle comfortably.'
      }
    ]
  },
  {
    id: 'ex_wrist_fingers',
    title: 'Wrist Rotations & Hand Mobility',
    category: 'seated',
    difficulty: 'Gentle',
    durationMinutes: 5,
    mobilityRequirement: 'Seated / Low Impact',
    equipment: 'None',
    image: '/assets/exercises/wrist_mobility.jpg',
    calorieEstimate: '~10-15 kcal',
    shortDescription: 'Essential joint mobility for wheelchair users, keyboard users, and anyone needing forearm & dexterity relief.',
    howToPerformGuide: {
      postureSetup: 'Rest forearms on armrests or table in front of you with wrists free to move.',
      breathingRhythm: 'Breathe smoothly and continuously throughout the hand movements.',
      targetMuscles: ['Wrist Flexors & Extensors', 'Interossei & Lumbrical Hand Muscles'],
      commonMistakes: 'Avoid gripping tightly or rotating with jerky movements.'
    },
    safetyNotes: [
      'Perform without jerking or excessive speed.',
      'If you have arthritis, keep movements slow and within gentle comfort range.'
    ],
    benefits: [
      'Relieves wrist tension and carpal strain',
      'Maintains hand flexibility and grip comfort',
      'Aids circulation in fingers and forearms'
    ],
    icon: 'Hand',
    suitableMobility: ['Wheelchair user', 'Limited mobility', 'Upper-body mobility', 'Independent walking', 'Assisted walking', 'Bed-rest / Low mobility'],
    steps: [
      {
        stepNumber: 1,
        title: 'Gentle Wrist Circles',
        instruction: 'Extend arms forward or rest forearms on armrests. Slowly rotate both wrists in clockwise circles 10 times, then counter-clockwise.',
        durationSec: 90,
        tip: 'Keep fingers soft and un-clenched.'
      },
      {
        stepNumber: 2,
        title: 'Fingers Open & Squeeze',
        instruction: 'Spread all fingers wide like a star, hold for 2 seconds, then make a gentle, soft fist. Repeat 10 times.',
        durationSec: 90,
        tip: 'Feel the stretch between each finger.'
      },
      {
        stepNumber: 3,
        title: 'Prayer Stretch & Shake Out',
        instruction: 'Bring palms together in front of chest, lower wrists gently toward stomach until mild stretch in forearms. Shake hands out gently.',
        durationSec: 120,
        tip: 'Do not force the wrist angle.'
      }
    ]
  },
  {
    id: 'ex_box_breathing',
    title: 'Mindful Box Breathing & Relaxation',
    category: 'breathing',
    difficulty: 'Gentle',
    durationMinutes: 5,
    mobilityRequirement: 'All Mobility Levels',
    equipment: 'Quiet space & comfortable seat or bed',
    image: '/assets/exercises/box_breathing.jpg',
    calorieEstimate: 'Calming / Parasympathetic activation',
    shortDescription: 'Regulated 4-4-4-4 breathing technique to lower resting heart rate, ease tension, and restore calm.',
    howToPerformGuide: {
      postureSetup: 'Sit comfortably with eyes gently closed or soft gaze, un-clenching jaw and releasing shoulders.',
      breathingRhythm: '4 counts Inhale, 4 counts Gentle Hold, 4 counts Exhale, 4 counts Rest.',
      targetMuscles: ['Diaphragm', 'Intercostal Muscles', 'Vagus Nerve Stimulation'],
      commonMistakes: 'Do not force air in or hold breath if you feel lightheaded.'
    },
    safetyNotes: [
      'Do not hold your breath to the point of discomfort or dizziness.',
      'If breath retention causes anxiety or lightheadedness, switch to continuous gentle breathing.'
    ],
    benefits: [
      'Reduces nervous system stress and cortisol',
      'Supports oxygenation and circulation',
      'Improves mental clarity and relaxation'
    ],
    icon: 'Wind',
    suitableMobility: ['Wheelchair user', 'Limited mobility', 'Assisted walking', 'Independent walking', 'Upper-body mobility', 'Bed-rest / Low mobility', 'Other'],
    steps: [
      {
        stepNumber: 1,
        title: 'Settle & Release Posture',
        instruction: 'Close your eyes or soften your gaze. Let your jaw un-clench, drop your shoulders, and exhale all air completely.',
        durationSec: 30,
        tip: 'Place one hand on your belly if comfortable.'
      },
      {
        stepNumber: 2,
        title: 'Inhale 4 Seconds',
        instruction: 'Slowly breathe in through your nose for a count of 1... 2... 3... 4... feeling belly expand gently.',
        durationSec: 60,
        tip: 'Fill the lower lungs smoothly without strain.'
      },
      {
        stepNumber: 3,
        title: 'Hold 4 Seconds',
        instruction: 'Hold your breath gently and calmly for 1... 2... 3... 4...',
        durationSec: 60,
        tip: 'Keep throat and face relaxed.'
      },
      {
        stepNumber: 4,
        title: 'Exhale 4 Seconds',
        instruction: 'Release breath slowly through mouth or nose for 1... 2... 3... 4...',
        durationSec: 60,
        tip: 'Feel all physical tension leaving your body.'
      },
      {
        stepNumber: 5,
        title: 'Rest & Complete Cycle',
        instruction: 'Pause for 4 seconds, then repeat the 4-part cycle smoothly for the remaining duration.',
        durationSec: 90,
        tip: 'Allow yourself to feel completely grounded and calm.'
      }
    ]
  },
  {
    id: 'ex_range_motion_neck',
    title: 'Range-of-Motion Neck & Cervical Release',
    category: 'mobility',
    difficulty: 'Gentle',
    durationMinutes: 6,
    mobilityRequirement: 'All Mobility Levels',
    equipment: 'Chair or supported posture',
    image: '/assets/exercises/neck_stretch.jpg',
    calorieEstimate: '~15 kcal',
    shortDescription: 'Careful lateral neck tilts and gentle chin tucks to relieve cervical spine stiffness and sitting fatigue.',
    howToPerformGuide: {
      postureSetup: 'Sit upright with shoulders relaxed down away from ears. Keep eyes level with horizon.',
      breathingRhythm: 'Exhale as you tilt gently into stretch, inhale as you return to center.',
      targetMuscles: ['Sternocleidomastoid', 'Scalenes', 'Splenius Capitis'],
      commonMistakes: 'Never roll head in a full backward circle or jerk neck quickly.'
    },
    safetyNotes: [
      'Never roll neck all the way backward in full circles.',
      'Stop immediately if you experience sharp pinching or tingling in hands.'
    ],
    benefits: [
      'Releases cervical spine compression',
      'Relieves tension headache triggers',
      'Improves lateral visual field turning comfort'
    ],
    icon: 'Activity',
    suitableMobility: ['Wheelchair user', 'Limited mobility', 'Assisted walking', 'Independent walking', 'Upper-body mobility', 'Bed-rest / Low mobility'],
    steps: [
      {
        stepNumber: 1,
        title: 'Gentle Chin Tucks',
        instruction: 'Draw your chin straight backward slightly (like making a gentle double chin). Hold for 3 seconds, release. Repeat 5 times.',
        durationSec: 90,
        tip: 'This strengthens deep cervical flexors.'
      },
      {
        stepNumber: 2,
        title: 'Side-to-Side Ear Tilts',
        instruction: 'Gently lower your right ear toward your right shoulder until a mild stretch is felt on the left side. Hold for 15s. Repeat on opposite side.',
        durationSec: 120,
        tip: 'Keep opposite shoulder grounded down.'
      },
      {
        stepNumber: 3,
        title: 'Slow Head Turns',
        instruction: 'Slowly turn head to look over right shoulder, pause 3s, then slowly turn to look over left shoulder.',
        durationSec: 150,
        tip: 'Move only within a comfortable 70% range.'
      }
    ]
  },
  {
    id: 'ex_seated_leg_circulation',
    title: 'Seated Leg Circulation & Ankle Pumps',
    category: 'mobility',
    difficulty: 'Easy',
    durationMinutes: 7,
    mobilityRequirement: 'Lower Body / Seated Mobility',
    equipment: 'Chair or wheelchair',
    image: '/assets/exercises/leg_circulation.jpg',
    calorieEstimate: '~20-30 kcal',
    shortDescription: 'Promotes venous return, reduces swelling in ankles and calves, and maintains lower limb joint mobility.',
    howToPerformGuide: {
      postureSetup: 'Sit upright with knees at approximately 90 degrees or supported on a footrest block.',
      breathingRhythm: 'Maintain natural rhythmic breathing while pumping ankles.',
      targetMuscles: ['Gastrocnemius', 'Soleus', 'Tibialis Anterior', 'Quadriceps'],
      commonMistakes: 'Avoid holding your breath or over-extending knee joints.'
    },
    safetyNotes: [
      'Adapt to your level of lower extremity sensation and mobility.',
      'If you have edema or DVT history, adhere strictly to your physical therapist guidelines.'
    ],
    benefits: [
      'Reduces dependent lower leg swelling (edema)',
      'Promotes healthy vascular blood flow',
      'Maintains ankle dorsiflexion flexibility'
    ],
    icon: 'Footprints',
    suitableMobility: ['Limited mobility', 'Assisted walking', 'Independent walking', 'Upper-body mobility', 'Other'],
    steps: [
      {
        stepNumber: 1,
        title: 'Ankle Point & Flex',
        instruction: 'With feet resting or slightly elevated, point your toes forward away from you, then flex toes back toward your shins. 15 times each leg.',
        durationSec: 120,
        tip: 'Feel calf muscles engaging softly.'
      },
      {
        stepNumber: 2,
        title: 'Ankle Circles',
        instruction: 'Lift one foot slightly off the floor and trace smooth circles in the air with big toe. 10 clockwise, 10 counter-clockwise. Switch sides.',
        durationSec: 150,
        tip: 'You can support your thigh with your hands if needed.'
      },
      {
        stepNumber: 3,
        title: 'Seated Gentle Knee Extensions',
        instruction: 'Slowly straighten one knee until lower leg is parallel to floor, hold 2s, slowly lower. Alternate legs 8-10 times.',
        durationSec: 150,
        tip: 'Engage quadriceps gently at the top.'
      }
    ]
  }
];
