'use strict';
/* PieFit Universal Balance, Skills & Adaptive 30-Day Journey Engine:
   - Full-Body Balance Index across 6 chains (Chest, Lats, Upper Back, Shoulders, Legs, Core)
   - All 14 Calisthenics & Gymnastic Rings ladders with video tutorials and animated cues
   - 30-Day Adaptive Journey with Rolling Queue, Daily Action Missions, and Direct Workout Integration
   - 100% Tactile Button Interface (Zero Browser Prompts).
   Loaded before app.js; operates using PieFit globals (store, t, EX, LOG, LADDERS, MASTERED, go). */
const Challenge = (() => {
  const KEY_CHALLENGE = 'challenge_state_v4';

  // 6 Master Movement Chains
  const CHAINS = {
    hpush: {
      id: 'hpush',
      nameTh: 'อก & ดันแนวนอน',
      nameEn: 'Chest & Horizontal Push',
      icon: '🛡️',
      targetSets: 8,
      primaryMuscle: 'chest',
      matchPats: ['hpush'],
      matchMuscles: ['chest'],
      rebalanceAdviceTh: 'แนะนำเติม Bench Press, Ring Push-up หรือ Dips',
      rebalanceAdviceEn: 'Add Bench Press, Ring Push-ups or Dips'
    },
    vpull: {
      id: 'vpull',
      nameTh: 'ปีก & ดึงแนวตั้ง',
      nameEn: 'Lats & Vertical Pull',
      icon: '🧗',
      targetSets: 8,
      primaryMuscle: 'lats',
      matchPats: ['vpull'],
      matchMuscles: ['lats'],
      rebalanceAdviceTh: 'แนะนำเติม Lat Pulldown หรือ Pull-up บนบาร์/ห่วง',
      rebalanceAdviceEn: 'Add Lat Pulldowns or Pull-ups'
    },
    hpull: {
      id: 'hpull',
      nameTh: 'หลังกลาง & ดึงแนวนอน',
      nameEn: 'Upper Back & Row',
      icon: '🚣',
      targetSets: 8,
      primaryMuscle: 'upperback',
      matchPats: ['hpull', 'reardelt'],
      matchMuscles: ['upperback'],
      rebalanceAdviceTh: 'แนะนำเติม Barbell Row, Ring Row หรือ Cable Row',
      rebalanceAdviceEn: 'Add Barbell Rows, Ring Rows or Cable Rows'
    },
    vpush: {
      id: 'vpush',
      nameTh: 'ไหล่ & ดันแนวตั้ง',
      nameEn: 'Shoulders & Overhead Push',
      icon: '👑',
      targetSets: 8,
      primaryMuscle: 'shoulders',
      matchPats: ['vpush', 'lateral'],
      matchMuscles: ['shoulders'],
      rebalanceAdviceTh: 'แนะนำเติม Overhead Press หรือ Pike Push-up',
      rebalanceAdviceEn: 'Add Overhead Press or Pike Push-ups'
    },
    legs: {
      id: 'legs',
      nameTh: 'ขา & สะโพก',
      nameEn: 'Legs & Lower Body',
      icon: '🦵',
      targetSets: 8,
      primaryMuscle: 'quads',
      matchPats: ['squat', 'lunge', 'hinge', 'legcurl', 'legext', 'calf', 'hipext'],
      matchMuscles: ['quads', 'glutes', 'hamstrings'],
      rebalanceAdviceTh: 'แนะนำเติม Squat, Split Squat หรือ Leg Press',
      rebalanceAdviceEn: 'Add Squats, Split Squats or Leg Press'
    },
    core: {
      id: 'core',
      nameTh: 'แกนกลางลำตัว',
      nameEn: 'Core & Abs',
      icon: '🧱',
      targetSets: 8,
      primaryMuscle: 'core',
      matchPats: ['core'],
      matchMuscles: ['core'],
      rebalanceAdviceTh: 'แนะนำเติม Ab Wheel, Hanging Leg Raise หรือ L-Sit',
      rebalanceAdviceEn: 'Add Ab Wheel, Hanging Leg Raises or L-Sit'
    }
  };

  // 30 Structured Daily Missions with clear Action Plans and Direct Session Links
  const MISSIONS = [
    // Phase 1: Foundation & Baseline (Days 1-7)
    { day: 1, type: 'test', sess: 'cal', titleTh: 'ทดสอบความสมดุลตั้งต้น (Baseline Test)', titleEn: 'Baseline Balance Test',
      descTh: 'ทำแบบทดสอบเพื่อดูระดับแรงเริ่มต้นในท่าหลัก ระบบจะจำค่าเพื่อนำไปคำนวณความสมดุลและเทียบใน Day 30',
      descEn: 'Perform baseline test sets to calibrate your starting level across movement chains.',
      tipTh: '💡 ทำท่าด้วยฟอร์มที่ถูกต้องที่สุด หยุดเมื่อฟอร์มเริ่มแกว่ง', tipEn: '💡 Maintain strict form, stop when technique breaks.' },

    { day: 2, type: 'rest', sess: null, titleTh: 'พักฟื้นร่างกาย & ก้าวเดิน 8,000 ก้าว', titleEn: 'Active Recovery & 8,000 Steps',
      descTh: 'พักฟื้นกล้ามเนื้อ ดื่มน้ำให้ถึงเป้าหมาย และเดินสะสมก้าวเบาๆ ช่วยกระตุ้นการไหลเวียนโลหิต',
      descEn: 'Active recovery day. Hit your water target and walk 8,000 steps to flush out soreness.',
      tipTh: '💡 การเดินเป็นการฟื้นฟูที่ดีที่สุดโดยไม่สร้างความล้าให้กล้ามเนื้อ', tipEn: '💡 Walking is the best active recovery without nervous system fatigue.' },

    { day: 3, type: 'workout', sess: 'full', titleTh: 'Full Body A: อก + หลัง + ขา', titleEn: 'Full Body A: Chest, Back, Legs',
      descTh: 'กระตุ้นกล้ามเนื้อมัดใหญ่ทั่วร่างกาย เลือกฝึกเต็มรูปแบบ 45 นาที หรือเซฟแรงเน้นต่อเนื่อง 15 นาที',
      descEn: 'Full body activation focusing on horizontal push, rows and squats.',
      tipTh: '💡 โฟกัสการล็อกสะบักและการเกร็งหน้าท้องทุกท่า', tipEn: '💡 Lock your core and pack your shoulders on every rep.' },

    { day: 4, type: 'rest', sess: 'yoga', titleTh: 'ยืดเหยียด & คลายข้อต่อ (Mobility)', titleEn: 'Joint Mobility & Stretching',
      descTh: 'เปิดข้อไหล่ ยืดสะโพก และผ่อนคลายกล้ามเนื้อหลัง เพื่อให้พร้อมสำหรับการฝึกวันถัดไป',
      descEn: 'Shoulder mobility, hip openers and gentle stretching to prepare for tomorrow.',
      tipTh: '💡 หายใจเข้า-ออกลึกๆ ช้าๆ ระหว่างยืดกล้ามเนื้อ', tipEn: '💡 Breathe slowly and deeply into tight areas.' },

    { day: 5, type: 'workout', sess: 'full', titleTh: 'Full Body B: ปีก + ไหล่ + แกนกลาง', titleEn: 'Full Body B: Pull, Shoulders, Core',
      descTh: 'เน้นแรงดึงแนวตั้ง (Pull-up) และแรงดันไหล่ (Overhead) พร้อมเกร็งแกนกลาง',
      descEn: 'Focus on vertical pulling (pull-ups), overhead pressing, and anti-extension core.',
      tipTh: '💡 จังหวะดึงข้อ ให้ดึงข้อศอกลงหาเอว ไม่ใช้แรงเหวี่ยง', tipEn: '💡 Drive your elbows down toward your hips on pull-ups.' },

    { day: 6, type: 'rest', sess: null, titleTh: 'พักผ่อนเต็มที่ & โฟกัสโปรตีน', titleEn: 'Rest & Protein Synthesis',
      descTh: 'ให้เวลากล้ามเนื้อซ่อมแซม ทานโปรตีนให้ถึงเป้าหมายที่คำนวณไว้',
      descEn: 'Rest day. Focus on reaching your daily protein target for muscle repair.',
      tipTh: '💡 การนอนหลับ 7–8 ชม. คือช่วงที่กล้ามเนื้อสร้างตัวได้มากที่สุด', tipEn: '💡 7-8 hours of sleep is when growth hormone peaks.' },

    { day: 7, type: 'review', sess: null, titleTh: 'เช็กความสมดุลสัปดาห์ที่ 1', titleEn: 'Week 1 Balance Review',
      descTh: 'ตรวจสอบดัชนี Balance Index ว่ามีกลุ่มกล้ามเนื้อส่วนไหนตามหลัง พร้อมวางแผนสัปดาห์ที่ 2',
      descEn: 'Check your weekly Balance Index. See which chains need attention next week.',
      tipTh: '💡 ผ่านสัปดาห์แรกสำเร็จแล้ว! ความสม่ำเสมอคือกุญแจสำคัญ', tipEn: '💡 Week 1 complete! Consistency builds momentum.' },

    // Phase 2: Nutrition & Rebalancing (Days 8-14)
    { day: 8, type: 'workout', sess: 'push', titleTh: 'Push & Core: อก + ไหล่ + หน้าท้อง', titleEn: 'Push & Core Focus',
      descTh: 'เน้นแรงผลักทั้งแนวนอนและแนวตั้ง Bench Press / Ring Push-up / Pike Push-up',
      descEn: 'Horizontal and vertical pressing: Bench Press, Ring Push-ups and Dips.',
      tipTh: '💡 กางศอกไม่เกิน 45 องศาเพื่อเซฟข้อต่อหัวไหล่', tipEn: '💡 Keep elbows ~45 degrees from ribs to protect shoulders.' },

    { day: 9, type: 'rest', sess: null, titleTh: 'พักฟื้น & ดื่มน้ำให้ถึงเป้า', titleEn: 'Recovery & Hydration',
      descTh: 'ดื่มน้ำให้ครบ 2.5–3 ลิตร ช่วยหล่อลื่นข้อต่อและลดอาการตึงของกล้ามเนื้อ',
      descEn: 'Stay hydrated to lubricate joints and speed up recovery.',
      tipTh: '💡 ดื่มน้ำจิบบ่อยๆ ตลอดวัน ดีกว่าดื่มครั้งละมากๆ', tipEn: '💡 Sip water steadily throughout the day.' },

    { day: 10, type: 'workout', sess: 'pull', titleTh: 'Pull & Row: ปีก + หลังกลาง + หน้าแขน', titleEn: 'Pull & Row Strength',
      descTh: 'สร้างความแข็งแรงของหลัง ดึงข้อ (Pull-up) และดึงแนวนอน (Barbell Row / Ring Row)',
      descEn: 'Upper back and lat development: Pull-ups, Lat Pulldowns and Rows.',
      tipTh: '💡 บีบสะบักเข้าหากันในจังหวะดึงสุด ค้างไว้ 1 วินาที', tipEn: '💡 Squeeze shoulder blades together at top of each row.' },

    { day: 11, type: 'rest', sess: 'yoga', titleTh: 'ยืดเหยียดผ่อนคลาย (Active Recovery)', titleEn: 'Mobility & Foam Rolling',
      descTh: 'ยืดกล้ามเนื้อหลังและอก ช่วยคลายความตึงและเปิดมุมการเคลื่อนไหว',
      descEn: 'Gentle stretching for chest and back to release tension.',
      tipTh: '💡 ยืดเบาๆ ไม่กระตุกตัว ค้างไว้ท่าละ 20–30 วินาที', tipEn: '💡 Hold stretches gently for 20-30s without bouncing.' },

    { day: 12, type: 'workout', sess: 'legs', titleTh: 'Legs & Lower: ขา + สะโพก + แกนกลาง', titleEn: 'Legs & Lower Body',
      descTh: 'เติมความแข็งแรงช่วงล่างเพื่อความสมดุล Squat, Split Squat, Romanian Deadlift',
      descEn: 'Build lower body symmetry: Squats, Bulgarian Split Squats and Core.',
      tipTh: '💡 ลงลึกเท่าที่หลังยังตรง ไม่งอตัว', tipEn: '💡 Squat as deep as comfortable while maintaining a neutral spine.' },

    { day: 13, type: 'rest', sess: null, titleTh: 'พักฟื้นเต็มที่ & นอนหลับ 8 ชม.', titleEn: 'Rest & Deep Sleep',
      descTh: 'พักผ่อนเตรียมรับมือกับสัปดาห์ที่ 3 ทานอาหารที่มีประโยชน์',
      descEn: 'Deep sleep and recovery day. Fuel your body with nutritious whole foods.',
      tipTh: '💡 งดเล่นมือถือก่อนนอน 30 นาที ช่วยให้หลับลึกขึ้น', tipEn: '💡 Turn off screens 30 min before bed for deeper rest.' },

    { day: 14, type: 'review', sess: null, titleTh: 'สรุปผลครึ่งทาง 30 วัน!', titleEn: 'Halfway Mark Review (Day 14)',
      descTh: 'ยินดีด้วย! คุณเดินทางมาถึงครึ่งทางแล้ว เช็กคะแนนความสมดุลและสถิติที่พัฒนาขึ้น',
      descEn: 'Congratulations on reaching the halfway mark! Review your balance progression.',
      tipTh: '💡 คุณมาได้ไกลมากแล้ว ลุยต่ออีกแค่ 16 วัน!', tipEn: '💡 You have built a solid foundation. 16 days to the finish line!' },

    // Phase 3: Form Mastery & Skill Lock (Days 15-21)
    { day: 15, type: 'workout', sess: 'skills', titleTh: 'Ring & Bodyweight Skills: ทักษะห่วง', titleEn: 'Ring Skills & Holds',
      descTh: 'ฝึกท่าค้างตัวและทักษะห่วงยิมนาสติก Support Hold, L-Sit, False Grip, Pike',
      descEn: 'Static gymnastics holds: Ring Support, L-Sit, False Grip conditioning.',
      tipTh: '💡 เกร็งตัวให้เป็นเส้นตรงเหมือนท่อนไม้ (Hollow body)', tipEn: '💡 Maintain full body tension: point toes and lock glutes.' },

    { day: 16, type: 'rest', sess: null, titleTh: 'พักข้อต่อ & เดินสะสมก้าว', titleEn: 'Joint Rest & Steps',
      descTh: 'ให้ข้อศอกและข้อมือได้พักฟื้นจากการรับน้ำหนักบนห่วง',
      descEn: 'Give wrists and elbows time to adapt to ring leverage loads.',
      tipTh: '💡 นวดคลึงปลายแขนและข้อมือเบาๆ ช่วยคลายความตึง', tipEn: '💡 Gentle wrist circles and forearm massages help circulation.' },

    { day: 17, type: 'workout', sess: 'push', titleTh: 'Push Hypertrophy: ปั๊มกล้ามอก & ไหล่', titleEn: 'Push Hypertrophy',
      descTh: 'สร้างกล้ามเนื้ออกและหลังแขน คุมจังหวะลงช้าๆ 2–3 วินาที (Eccentric tempo)',
      descEn: 'Chest and triceps hypertrophy with controlled 2-3s lowering phase.',
      tipTh: '💡 จังหวะลงช้าๆ จะกระตุ้นการสร้างกล้ามเนื้อได้ดีที่สุด', tipEn: '💡 Slow eccentrics trigger maximal muscle fiber recruitment.' },

    { day: 18, type: 'rest', sess: 'yoga', titleTh: 'ยืดเหยียด & คลายเส้น (Yoga Flow)', titleEn: 'Yoga & Flow',
      descTh: 'เปิดคลาสโยคะสั้นๆ ในแอพ ทำตามเพื่อคลายความเมื่อยล้า',
      descEn: 'Follow along with a short yoga session to open up the body.',
      tipTh: '💡 ปล่อยวางความตึงเครียด หายใจเข้าลึกๆ', tipEn: '💡 Relax your neck and drop your shoulders.' },

    { day: 19, type: 'workout', sess: 'pull', titleTh: 'Pull & Lat Power: ปีกกว้าง & หลังหนา', titleEn: 'Pull & Lat Power',
      descTh: 'พัฒนาแรงดึงให้เฉียบคม Pull-up, Inverted Row, Facepull',
      descEn: 'Explosive pulling power and rear delt stability.',
      tipTh: '💡 อกแตะบาร์ หรือดึงห่วงชิดอก ค้างไว้เสี้ยววินาที', tipEn: '💡 Aim chest-to-bar for full range of motion.' },

    { day: 20, type: 'workout', sess: 'legs', titleTh: 'Legs & Core Stability: ขา & แกนกลาง', titleEn: 'Legs & Core Stability',
      descTh: 'สควอท ลันจ์ และฝึกแกนกลางต่อต้านการหมุน (Anti-rotation)',
      descEn: 'Unilateral leg strength (Split squats) and core bracing.',
      tipTh: '💡 ฝึกขาทีละข้างช่วยแก้ปัญหาแรงสองข้างไม่เท่ากัน', tipEn: '💡 Single-leg work corrects side-to-side strength imbalances.' },

    { day: 21, type: 'review', sess: null, titleTh: 'เช็กความสมดุลสัปดาห์ที่ 3', titleEn: 'Week 3 Balance Review',
      descTh: 'สัปดาห์นี้ครบทุกมิติไหม? ตรวจสอบและเตรียมพร้อมสู่สัปดาห์แห่งความเข้มข้นสูงสุด',
      descEn: 'Review week 3 symmetry. Ready yourself for peak week ahead.',
      tipTh: '💡 ร่างกายคุณเริ่มคุ้นเคยและแข็งแรงขึ้นอย่างเห็นได้ชัด', tipEn: '💡 Your joints and muscles are now well-adapted to the load.' },

    // Phase 4: Peak Full-Body Strength (Days 22-28)
    { day: 22, type: 'workout', sess: 'full', titleTh: 'Peak Full Body: รวมพลังทุกส่วน', titleEn: 'Peak Full Body Session',
      descTh: 'เซสชันรวมความแข็งแกร่ง อก หลัง ไหล่ ขา จัดเต็มเพื่อรีดสมรรถนะสูงสุด',
      descEn: 'High-volume full body session testing total strength endurance.',
      tipTh: '💡 พักระหว่างเซ็ตให้เต็มที่ 90–120 วินาทีก่อนเริ่มเซ็ตถัดไป', tipEn: '💡 Rest 90-120s between heavy sets for full ATP recovery.' },

    { day: 23, type: 'rest', sess: null, titleTh: 'พักฟื้นเชิงลึก & เติมสารอาหาร', titleEn: 'Deep Recovery Day',
      descTh: 'นอนหลับให้เพียงพอ ทานคาร์โบไฮเดรตเชิงซ้อนและโปรตีนเพื่อเติมไกลโคเจน',
      descEn: 'Replenish glycogen stores with whole carbs and quality protein.',
      tipTh: '💡 ดื่มน้ำให้เพียงพอเพื่อช่วยลำเลียงสารอาหารสู่กล้ามเนื้อ', tipEn: '💡 Hydration delivers amino acids to recovering muscles.' },

    { day: 24, type: 'workout', sess: 'push', titleTh: 'Upper Push Focus: ดันอก & ไหล่เข้มข้น', titleEn: 'Upper Push Peak',
      descTh: 'ท้าทายจำนวนครั้งสูงสุดในเซ็ตสุดท้ายของท่าดัน',
      descEn: 'Push your limits on final sets with great technical execution.',
      tipTh: '💡 ไม่ฝืนจนฟอร์มเสีย ปลอดภัยไว้ก่อนเสมอ', tipEn: '💡 Leave 1 rep in reserve: never sacrifice form for an extra rep.' },

    { day: 25, type: 'workout', sess: 'pull', titleTh: 'Upper Pull Focus: ดึงปีก & หลังเข้มข้น', titleEn: 'Upper Pull Peak',
      descTh: 'ทดสอบแรงดึงสูงสุด Pull-up และ Row เต็มช่วงการเคลื่อนไหว',
      descEn: 'Maximal strict pull-ups and heavy controlled rows.',
      tipTh: '💡 ล็อกลำตัวให้นิ่งที่สุด ใช้เฉพาะกล้ามเนื้อหลังดึง', tipEn: '💡 Eliminate swinging: strict pulls build the most muscle.' },

    { day: 26, type: 'rest', sess: 'yoga', titleTh: 'ยืดเหยียดผ่อนคลายเต็มตัว', titleEn: 'Full Body Mobility',
      descTh: 'ผ่อนคลายกล้ามเนื้อทั่วร่างกาย ลดความตึงก่อนเข้าสู่โค้งสุดท้าย',
      descEn: 'Full-body release to dissipate fatigue before final test.',
      tipTh: '💡 ผ่อนคลายกล้ามเนื้อหน้าผาก คอ และไหล่', tipEn: '💡 Release all tension from neck and jaw.' },

    { day: 27, type: 'workout', sess: 'legs', titleTh: 'Lower Body Finale: ขา & แกนกลางรอบสุดท้าย', titleEn: 'Lower Body Finale',
      descTh: 'ปิดท้ายเซสชันขาของโปรแกรม 30 วัน สควอทและท่าแกนกลางอย่างมั่นคง',
      descEn: 'Final lower body session of the 30-day program.',
      tipTh: '💡 ดันสะโพกและส้นเท้าให้มั่นคง', tipEn: '💡 Drive through mid-foot and squeeze glutes at the top.' },

    { day: 28, type: 'rest', sess: null, titleTh: 'วันพักผ่อนเตรียมพร้อมสำหรับ Final Test', titleEn: 'Pre-Test Rest Day',
      descTh: 'พักเต็มที่ ไม่ทำกิจกรรมหนัก เพื่อให้ร่างกายสดชื่น 100% สำหรับวันทดสอบใหญ่',
      descEn: 'Zero heavy fatigue today. Recharge 100% for the Grand Finale.',
      tipTh: '💡 เตรียมตัว เตรียมใจ วันทดสอบใหญ่ใกล้เข้ามาแล้ว!', tipEn: '💡 Rest up: you are about to see how much you have grown.' },

    // Phase 5: The Grand Finale (Days 29-30)
    { day: 29, type: 'rest', sess: 'yoga', titleTh: 'วอร์มอัปเบาๆ & ทบทวนฟอร์ม', titleEn: 'Light Prep & Mobility',
      descTh: 'ขยับข้อต่อเบาๆ ยืดเหยียดพอให้เลือดไหลเวียน พักผ่อนให้เต็มอิ่ม',
      descEn: 'Light movement and stretching to stay loose and energized.',
      tipTh: '💡 นอนหลับแต่หัวค่ำ เพื่อพลังงานเต็มร้อยในวันพรุ่งนี้', tipEn: '💡 Get to bed early for peak performance tomorrow.' },

    { day: 30, type: 'test', sess: 'cal', titleTh: '🏆 The Grand Finale: Final Retest วันที่ 30!', titleEn: '🏆 The Grand Finale Retest (Day 30)',
      descTh: 'วันแห่งชัยชนะ! ทดสอบวัดผลความสมดุลและสถิติเทียบกับ Day 1 ดูว่าคุณแข็งแกร่งขึ้นแค่ไหน!',
      descEn: 'The victory day! Retest your max performance and celebrate your 30-day transformation!',
      tipTh: '💡 ทำให้เต็มที่! 30 วันที่ผ่านมาพิสูจน์แล้วว่าคุณทำได้!', tipEn: '💡 Give it your best! 30 days of discipline will speak for itself!' }
  ];

const escH = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  let STATE = {
    startDate: Date.now(),
    days: {} // { 1..30: { status: 'full'|'low'|'rest', date: '...', note: '...' } }
  };

  function load() {
    const s = store.get(KEY_CHALLENGE, null);
    if (s && typeof s === 'object') STATE = Object.assign({}, STATE, s);
    if (!STATE.startDate) STATE.startDate = Date.now();
    resolveLaunch();
  }

  // Launching a session only records an intent. The day counts as done once a set is logged after the launch,
  // so tapping Start and then leaving never marks a mission complete.
  function resolveLaunch() {
    const l = STATE.launched;
    if (!l) return;
    const logs = (typeof LOG !== 'undefined' && Array.isArray(LOG)) ? LOG : [];
    if (logs.some(x => x.t > l.t)) {
      if (!STATE.days) STATE.days = {};
      const prev = STATE.days[l.day] || {};
      STATE.days[l.day] = { status: l.mode === 'low' ? 'low' : 'full', date: new Date().toLocaleDateString(), note: prev.note || '' };
      delete STATE.launched;
      save();
    }
  }

  function save() {
    store.set(KEY_CHALLENGE, STATE);
  }

  /* ---------- Adaptive Rolling Queue: Find Current Active Milestone ---------- */
  function getActiveMilestone() {
    resolveLaunch();
    if (!STATE.days) return 1;
    for (let i = 1; i <= 30; i++) {
      const d = STATE.days[i];
      if (!d || !d.status) return i;
    }
    return 30;
  }

  function completedCount() {
    if (!STATE.days) return 0;
    return Object.values(STATE.days).filter(d => d && (d.status === 'full' || d.status === 'low' || d.status === 'rest')).length;
  }

  /* ---------- Balance Engine Calculation ---------- */
  function calcBalance() {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const since7d = Date.now() - 7 * 86400000;
    const allLogs = (typeof LOG !== 'undefined' && Array.isArray(LOG)) ? LOG : [];

    const stats = {};
    let totalScoreSum = 0;
    const laggingChains = [];
    let totalPushSets = 0;
    let totalPullSets = 0;

    Object.values(CHAINS).forEach(ch => {
      let weeklySets = 0;
      allLogs.forEach(l => {
        if (l.t < since7d) return;
        const x = (typeof EX !== 'undefined' && EX[l.ex]) ? EX[l.ex] : null;
        if (!x) return;

        const isMatch = (ch.matchPats && ch.matchPats.includes(x.pat)) ||
                        (x.p && x.p.some(m => ch.matchMuscles && ch.matchMuscles.includes(m)));
        if (isMatch) weeklySets++;
      });

      const target = ch.targetSets || 8;
      const ratio = Math.min(1, weeklySets / target);
      totalScoreSum += ratio;

      let status = 'balanced';
      if (weeklySets >= target) status = 'balanced';
      else if (weeklySets >= 4) status = 'moderate';
      else {
        status = 'lagging';
        laggingChains.push(ch);
      }

      if (ch.id === 'hpush' || ch.id === 'vpush') totalPushSets += weeklySets;
      if (ch.id === 'vpull' || ch.id === 'hpull') totalPullSets += weeklySets;

      stats[ch.id] = { weeklySets, target, ratio, status };
    });

    const overallScore = Math.round((totalScoreSum / 6) * 100);

    let adviceTh = '';
    let adviceEn = '';
    let badgeTh = '🟢 สมดุลดี';
    let badgeEn = '🟢 Balanced';

    if (overallScore < 50) {
      badgeTh = '🔴 ไม่สมดุล';
      badgeEn = '🔴 Imbalanced';
    } else if (overallScore < 80) {
      badgeTh = '🟡 ปานกลาง';
      badgeEn = '🟡 Moderate';
    }

    if (laggingChains.length > 0) {
      const namesTh = laggingChains.slice(0, 2).map(c => c.nameTh).join(' และ ');
      const namesEn = laggingChains.slice(0, 2).map(c => c.nameEn).join(' & ');
      const exTipTh = laggingChains[0].rebalanceAdviceTh;
      const exTipEn = laggingChains[0].rebalanceAdviceEn;

      adviceTh = `💡 แนะนำเติมเซ็ต: ${namesTh} (${exTipTh})`;
      adviceEn = `💡 Rebalance Advice: Focus on ${namesEn} (${exTipEn})`;
    } else if (totalPushSets > totalPullSets * 1.6 && totalPullSets > 0) {
      adviceTh = '⚠️ สัดส่วนท่าดันมากกว่าท่าดึงมากเกินไป: แนะนำเพิ่มเซ็ตดึง (Pull/Row) เพื่อป้องกันไหล่ห่อ';
      adviceEn = '⚠️ Push volume outweighs Pull: Add more rows and pull-ups to protect shoulders';
    } else if (totalPullSets > totalPushSets * 1.6 && totalPushSets > 0) {
      adviceTh = '⚠️ สัดส่วนท่าดึงมากกว่าท่าดันมากเกินไป: แนะนำเพิ่มเซ็ตดัน (Push/Dips) เพื่อสร้างสมดุล';
      adviceEn = '⚠️ Pull volume outweighs Push: Add more push-ups and pressing';
    } else {
      adviceTh = '🎉 ยอดเยี่ยมมาก! พัฒนากล้ามเนื้อได้สมดุลครบทั้ง 6 รูปแบบการเคลื่อนไหว';
      adviceEn = '🎉 Outstanding! Your body is developing in balanced harmony across all 6 chains';
    }

    return { overallScore, badgeTh, badgeEn, adviceTh, adviceEn, stats, laggingChains };
  }

  /* ---------- Minimal, Clear & Actionable Home Screen Banner ---------- */
  function homeBannerHTML() {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const b = calcBalance();
    const curMilestone = getActiveMilestone();
    const misObj = MISSIONS[curMilestone - 1] || MISSIONS[0];
    const completed = completedCount();
    const pct = Math.round((completed / 30) * 100);

    const isWorkout = misObj.type === 'workout' || misObj.type === 'test';

    return `
      <div class="card hl sess" id="ch_banner_btn" style="padding:14px;margin-bottom:10px;cursor:pointer">
        <!-- Top row: Status & Active Milestone -->
        <div class="row">
          <span class="emoji" style="background:var(--card);font-size:26px">${isWorkout ? '🏋️' : '🧘'}</span>
          <div class="grow">
            <div class="row">
              <b style="font-size:15px">${isTh ? `ภารกิจ Day ${curMilestone}/30` : `Mission Day ${curMilestone}/30`}</b>
              <span class="tag" style="background:var(--accent);color:#fff;font-weight:700">${b.overallScore}% ${isTh ? 'สมดุล' : 'balance'}</span>
            </div>
            <b style="display:block;margin-top:2px;font-size:14px;color:var(--accent)">
              ${isTh ? misObj.titleTh : misObj.titleEn}
            </b>
            <small style="display:block;color:var(--mute);margin-top:2px;font-size:12px">
              ${isTh ? misObj.descTh : misObj.descEn}
            </small>
          </div>
          <span class="go">›</span>
        </div>

        <!-- Progress bar -->
        <div style="margin-top:10px">
          <div class="row" style="font-size:11px;color:var(--mute);margin-bottom:4px">
            <span class="grow">${isTh ? 'ความก้าวหน้ารอบ 30 วัน' : 'Progress'}</span>
            <b>${completed}/30 ${isTh ? 'สำเร็จ' : 'done'} (${pct}%)</b>
          </div>
          <div class="track" style="height:6px"><div class="fill ok" style="width:${pct}%"></div></div>
        </div>

        <!-- 1-line Smart Advice Footer -->
        <div style="margin-top:8px;padding:6px 10px;background:var(--bg);border-radius:8px;font-size:11px;color:var(--ink)">
          ${isTh ? b.adviceTh : b.adviceEn}
        </div>
      </div>
    `;
  }

  function bindHomeBanner(root) {
    const el = root || document.getElementById('app');
    if (!el) return;
    const btn = el.querySelector('#ch_banner_btn');
    if (btn) btn.onclick = () => openJourneyModal();
  }

  /* ---------- Full Interactive Hub (Balance, Skills, 30-Day Adaptive Journey) ---------- */
  function openJourneyModal(targetEl) {
    const isInline = !!(targetEl && (targetEl.nodeType || typeof targetEl.innerHTML === 'string'));
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = isInline ? targetEl : document.createElement('div');
    if (!isInline) m.className = 'modal';

    let currentTab = 'roadmap'; // default to 'roadmap' (daily missions) | 'balance' | 'skills'

    function renderModal() {
      m.innerHTML = `
        <div class="${isInline ? '' : 'sheet'}" style="${isInline ? '' : 'max-width:520px'}">
          <div class="row" style="margin-bottom:12px">
            <h2 style="margin:0;font-size:20px" class="grow">🏆 ${isTh ? 'ภารกิจ 30 วัน & ความสมดุล' : '30-Day Journey & Balance'}</h2>
            ${isInline ? '' : '<button class="chip mini" id="jm_close">✕</button>'}
          </div>

          <!-- 3 Tabs -->
          <div class="seg" style="margin:0 0 14px">
            <button class="${currentTab === 'roadmap' ? 'on' : ''}" id="jtab_roadmap" style="font-size:13px;padding:10px 4px">🗺️ ${isTh ? 'ภารกิจ 30 วัน' : '30-Day Missions'}</button>
            <button class="${currentTab === 'balance' ? 'on' : ''}" id="jtab_balance" style="font-size:13px;padding:10px 4px">⚖️ ${isTh ? 'ความสมดุล 6 ด้าน' : 'Body Balance'}</button>
            <button class="${currentTab === 'skills' ? 'on' : ''}" id="jtab_skills" style="font-size:13px;padding:10px 4px">🎯 ${isTh ? 'ท่าห่วง & สกิล' : 'Ring Skills'}</button>
          </div>

          <div id="jtab_content"></div>
        </div>
      `;

      const clBtn = m.querySelector('#jm_close');
      if (clBtn) clBtn.onclick = () => m.remove();

      m.querySelector('#jtab_roadmap').onclick = () => { currentTab = 'roadmap'; renderModal(); };
      m.querySelector('#jtab_balance').onclick = () => { currentTab = 'balance'; renderModal(); };
      m.querySelector('#jtab_skills').onclick = () => { currentTab = 'skills'; renderModal(); };

      const contentBox = m.querySelector('#jtab_content');
      if (currentTab === 'roadmap') {
        renderRoadmapTab(contentBox);
      } else if (currentTab === 'balance') {
        renderBalanceTab(contentBox);
      } else {
        renderSkillsTab(contentBox);
      }
    }

    /* Tab 1: 30-Day Adaptive Roadmap with Daily Missions & Direct Action */
    function renderRoadmapTab(box) {
      const curMilestone = getActiveMilestone();
      const misObj = MISSIONS[curMilestone - 1] || MISSIONS[0];
      const completed = completedCount();
      const pct = Math.round((completed / 30) * 100);
      const isWorkout = misObj.type === 'workout' || misObj.type === 'test';

      const PHASES = [
        { num: 1, days: [1,2,3,4,5,6,7], titleTh: 'สัปดาห์ที่ 1 · วางรากฐาน & ทดสอบ Day 1', titleEn: 'Week 1 · Foundation & Day 1 Test' },
        { num: 2, days: [8,9,10,11,12,13,14], titleTh: 'สัปดาห์ที่ 2 · เติมส่วนที่ขาด & วินัยโภชนาการ', titleEn: 'Week 2 · Rebalance & Nutrition' },
        { num: 3, days: [15,16,17,18,19,20,21], titleTh: 'สัปดาห์ที่ 3 · พัฒนาฟอร์ม & ล็อคความสมดุล', titleEn: 'Week 3 · Form Control & Balance' },
        { num: 4, days: [22,23,24,25,26,27,28], titleTh: 'สัปดาห์ที่ 4 · เร่งความเข้มข้นสูงสุด (Peak)', titleEn: 'Week 4 · Peak Intensity' },
        { num: 5, days: [29,30], titleTh: 'สัปดาห์ที่ 5 · The Final Test Day 30!', titleEn: 'Week 5 · The Grand Finale Test Day 30!' }
      ];

      box.innerHTML = `
        <!-- Active Milestone Hero Card -->
        <div class="card hl" style="margin-bottom:14px;padding:14px;border:2px solid var(--accent)">
          <div class="row">
            <span class="emoji" style="font-size:30px">${isWorkout ? '🏋️' : '🧘'}</span>
            <div class="grow">
              <span class="tag" style="background:var(--accent);color:#fff;font-weight:700">${isTh ? 'หมุดหมายปัจจุบัน' : 'Current'} Day ${curMilestone}/30</span>
              <h3 style="margin:4px 0 2px;font-size:16px">${isTh ? misObj.titleTh : misObj.titleEn}</h3>
              <small style="display:block;color:var(--mute)">${isTh ? misObj.descTh : misObj.descEn}</small>
            </div>
          </div>

          <div style="margin:8px 0;padding:6px 10px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--ink)">
            ${isTh ? misObj.tipTh : misObj.tipEn}
          </div>

          <!-- Direct Action Buttons -->
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
            ${isWorkout ? `
              <button class="btn" id="hero_start_wo" style="background:var(--ok);color:#fff;min-height:46px;padding:12px;font-size:15px">
                ▶ ${isTh ? 'ฝึกเต็มรูปแบบ (45 นาที)' : 'Full Workout (45m)'}
              </button>
              <button class="btn ghost" id="hero_start_low" style="border:2px solid var(--accent);color:var(--accent);min-height:44px;padding:10px;font-size:14px">
                ⚡ ${isTh ? 'เซฟแรงเน้นต่อเนื่อง (15 นาที)' : 'Quick Win Habit (15m)'}
              </button>
            ` : (misObj.sess === 'yoga' ? `
              <button class="btn" id="hero_start_yoga" style="min-height:46px">
                🧘 ${isTh ? 'เปิดเซสชันยืดเหยียด' : 'Start Stretch Session'}
              </button>
            ` : `
              <button class="btn ghost" id="hero_mark_rest" style="background:var(--bg);min-height:46px">
                ✓ ${isTh ? 'พักผ่อนตามแผนวันนี้' : 'Rest Done for Today'}
              </button>
            `)}
          </div>
        </div>

        <!-- 30-Day Grid with Status Indicators -->
        <div class="row" style="font-size:12px;color:var(--mute);margin-bottom:6px">
          <span class="grow">${isTh ? 'ความก้าวหน้าทั้งหมด' : '30-Day Grid'}: <b>${completed}/30 ${isTh ? 'สำเร็จ' : 'done'} (${pct}%)</b></span>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          ${PHASES.map(phase => `
            <div class="card" style="padding:10px 12px;margin:0">
              <b style="font-size:12px;color:var(--accent)">${isTh ? phase.titleTh : phase.titleEn}</b>
              <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px">
                ${phase.days.map(dNum => {
                  const log = (STATE.days || {})[dNum];
                  const isCur = dNum === curMilestone;
                  const isDone = log && (log.status === 'full' || log.status === 'low');
                  const isRest = log && log.status === 'rest';

                  let bg = 'var(--bg)';
                  let color = 'var(--mute)';
                  let border = '1px solid var(--line)';
                  if (isDone) {
                    bg = 'var(--ok)'; color = '#fff'; border = '1px solid var(--ok)';
                  } else if (isRest) {
                    bg = 'var(--line)'; color = 'var(--ink)';
                  }
                  if (isCur) {
                    border = '2px solid var(--accent)';
                  }

                  return `
                    <button class="chip" data-day="${dNum}" style="width:100%;height:40px;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${bg};color:${color};border:${border};border-radius:8px;cursor:pointer">
                      <b style="font-size:11px">${dNum}</b>
                      <small style="font-size:9px;line-height:1">${isDone ? (log.status === 'low' ? 'LOW' : '✓') : (isRest ? (isTh ? 'พัก' : 'REST') : (dNum === 1 ? 'START' : (dNum === 30 ? 'FINAL' : '○')))}</small>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="row gap" style="margin-top:14px">
          <button class="btn ghost small grow" id="ch_reset_btn" style="color:var(--mute)">🔄 ${isTh ? 'เริ่ม 30 วันรอบใหม่' : 'Restart 30 Days'}</button>
        </div>
      `;

      // Hero Start Workout buttons
      const bWoFull = box.querySelector('#hero_start_wo');
      if (bWoFull) {
        bWoFull.onclick = () => {
          if (!isInline && typeof m.remove === 'function') m.remove();
          startDailySession(misObj.sess || 'full', 45, curMilestone, 'full');
        };
      }
      const bWoLow = box.querySelector('#hero_start_low');
      if (bWoLow) {
        bWoLow.onclick = () => {
          if (!isInline && typeof m.remove === 'function') m.remove();
          startDailySession(misObj.sess || 'full', 15, curMilestone, 'low');
        };
      }
      const bYoga = box.querySelector('#hero_start_yoga');
      if (bYoga) {
        bYoga.onclick = () => {
          if (!isInline && typeof m.remove === 'function') m.remove();
          if (typeof go === 'function') go('yoga', { name: 'ysess', id: 'post_full' });
        };
      }
      const bMarkRest = box.querySelector('#hero_mark_rest');
      if (bMarkRest) {
        bMarkRest.onclick = () => {
          if (!STATE.days) STATE.days = {};
          STATE.days[curMilestone] = { status: 'rest', date: new Date().toLocaleDateString() };
          save();
          renderModal();
          if (typeof render === 'function') render();
        };
      }

      // Reset button
      const rBtn = box.querySelector('#ch_reset_btn');
      if (rBtn) {
        rBtn.onclick = () => {
          if (confirm(isTh ? 'ต้องการเริ่ม 30-Day Challenge รอบใหม่หรือไม่?' : 'Restart 30-Day Journey?')) {
            STATE.startDate = Date.now();
            STATE.days = {};
            delete STATE.launched;
            save();
            renderModal();
            if (typeof render === 'function') render();
          }
        };
      }

      // Day buttons click -> Opens Detailed Mission & Tactile Actions Sheet
      box.querySelectorAll('[data-day]').forEach(btn => {
        btn.onclick = () => {
          const dNum = parseInt(btn.dataset.day, 10);
          openDayDetailSheet(dNum);
        };
      });

      function openDayDetailSheet(dNum) {
        const mis = MISSIONS[dNum - 1] || MISSIONS[0];
        const curLog = (STATE.days || {})[dNum] || {};
        const isMisWo = mis.type === 'workout' || mis.type === 'test';

        const ds = document.createElement('div');
        ds.className = 'modal';

        ds.innerHTML = `
          <div class="sheet" style="max-width:420px">
            <div class="row" style="margin-bottom:8px">
              <span class="tag" style="background:var(--accent);color:#fff">Day ${dNum}/30</span>
              <h3 style="margin:0" class="grow">${isTh ? mis.titleTh : mis.titleEn}</h3>
              <button class="chip mini" id="ds_close">✕</button>
            </div>

            <p style="margin:4px 0 10px;font-size:13px;color:var(--ink);line-height:1.4">
              ${isTh ? mis.descTh : mis.descEn}
            </p>

            <div style="margin-bottom:12px;padding:6px 10px;background:var(--bg);border-radius:8px;font-size:12px">
              ${isTh ? mis.tipTh : mis.tipEn}
            </div>

            <b style="font-size:13px;display:block;margin-bottom:6px">${isTh ? 'บันทึกสถานะของวันนี้:' : 'Select Result:'}</b>

            <div style="display:flex;flex-direction:column;gap:8px">
              ${isMisWo ? `
                <button class="btn" id="ds_start_now" style="background:var(--ok);color:#fff;margin-bottom:8px">
                  ▶ ${isTh ? 'ฝึกเต็มรูปแบบ (45 นาที)' : 'Full Workout (45m)'}
                </button>
                <button class="btn ghost" id="ds_start_low" style="border:2px solid var(--accent);color:var(--accent)">
                  ⚡ ${isTh ? 'ฝึกด่วนเซฟแรง (15 นาที)' : 'Quick Session (15m)'}
                </button>
              ` : ''}

              <div class="row gap" style="flex-wrap:wrap">
                <button class="btn ghost small grow" id="ds_set_full" style="background:${curLog.status === 'full' ? 'var(--ok)' : 'transparent'};color:${curLog.status === 'full' ? '#fff' : 'inherit'}">
                  ✓ ${isTh ? 'ซ้อมเต็มที่' : 'Full Done'}
                </button>
                <button class="btn ghost small grow" id="ds_set_low" style="background:${curLog.status === 'low' ? 'var(--accent)' : 'transparent'};color:${curLog.status === 'low' ? '#fff' : 'inherit'}">
                  ⚡ ${isTh ? 'เซฟแรง' : 'Quick Win'}
                </button>
                <button class="btn ghost small grow" id="ds_set_rest" style="background:${curLog.status === 'rest' ? 'var(--line)' : 'transparent'}">
                  🛌 ${isTh ? 'วันพัก' : 'Rest Day'}
                </button>
              </div>

              ${curLog.status ? `
                <button class="chip" id="ds_clear" style="margin-top:4px;color:var(--mute)">
                  ✕ ${isTh ? 'ล้างสถานะของวันนี้' : 'Clear status'}
                </button>
              ` : ''}
            </div>

            <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">
              <small>${isTh ? 'บันทึกเพิ่มเติมหรือสถิติ PR (ไม่บังคับ):' : 'Notes/PR details:'}</small>
              <div class="row gap" style="margin-top:4px">
                <input class="inp" id="ds_note" placeholder="${isTh ? 'เช่น ดึงข้อ 8 ครั้ง / Bench 60kg' : 'e.g. Pull-up 8 reps'}" value="${escH(curLog.note || '')}" style="margin:0">
                <button class="btn small w-auto" id="ds_savenote">${isTh ? 'บันทึก' : 'Save'}</button>
              </div>
            </div>
          </div>
        `;

        ds.querySelector('#ds_close').onclick = () => ds.remove();

        // Direct Workout Launch from Sheet
        const bStartNow = ds.querySelector('#ds_start_now');
        if (bStartNow) {
          bStartNow.onclick = () => {
            ds.remove();
            if (!isInline && typeof m.remove === 'function') m.remove();
            startDailySession(mis.sess || 'full', 45, dNum, 'full');
          };
        }
        const bStartLowNow = ds.querySelector('#ds_start_low');
        if (bStartLowNow) {
          bStartLowNow.onclick = () => {
            ds.remove();
            if (!isInline && typeof m.remove === 'function') m.remove();
            startDailySession(mis.sess || 'full', 15, dNum, 'low');
          };
        }

        const markDay = st => {
          if (!STATE.days) STATE.days = {};
          const noteVal = ds.querySelector('#ds_note').value.trim();
          STATE.days[dNum] = { status: st, date: new Date().toLocaleDateString(), note: noteVal };
          save();
          ds.remove();
          renderModal();
          if (typeof render === 'function') render();
        };

        ds.querySelector('#ds_set_full').onclick = () => markDay('full');
        ds.querySelector('#ds_set_low').onclick = () => markDay('low');
        ds.querySelector('#ds_set_rest').onclick = () => markDay('rest');

        const clrBtn = ds.querySelector('#ds_clear');
        if (clrBtn) {
          clrBtn.onclick = () => {
            if (STATE.days) delete STATE.days[dNum];
            save();
            ds.remove();
            renderModal();
            if (typeof render === 'function') render();
          };
        }

        ds.querySelector('#ds_savenote').onclick = () => {
          if (!STATE.days) STATE.days = {};
          const st = curLog.status || 'full';
          const noteVal = ds.querySelector('#ds_note').value.trim();
          STATE.days[dNum] = { status: st, date: new Date().toLocaleDateString(), note: noteVal };
          save();
          ds.remove();
          renderModal();
          if (typeof render === 'function') render();
        };

        document.body.appendChild(ds);
      }
    }

    /* Tab 2: 6-Dimension Balance Wheel */
    function renderBalanceTab(box) {
      const b = calcBalance();

      box.innerHTML = `
        <div class="card hl" style="margin-bottom:12px;padding:14px">
          <div class="row">
            <div class="grow">
              <small>${isTh ? 'ดัชนีความสมดุลรอบด้าน (สัปดาห์นี้)' : 'Full-Body Balance Index'}</small>
              <h2 style="margin:2px 0 0;font-size:26px">${b.overallScore}% <span style="font-size:16px">${isTh ? b.badgeTh : b.badgeEn}</span></h2>
            </div>
            <span class="emoji" style="font-size:32px">⚖️</span>
          </div>

          <div class="track big" style="margin:10px 0 8px">
            <div class="fill ${b.overallScore >= 80 ? 'ok' : ''}" style="width:${b.overallScore}%"></div>
          </div>

          <div style="padding:8px 10px;background:var(--bg);border-radius:10px;font-size:13px;line-height:1.4">
            ${isTh ? b.adviceTh : b.adviceEn}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px">
          ${Object.values(CHAINS).map(ch => {
            const st = b.stats[ch.id] || { weeklySets: 0, target: 8, ratio: 0, status: 'lagging' };
            const pct = Math.round(st.ratio * 100);

            let statusTag = `<span class="tag" style="background:#e03131;color:#fff">${isTh ? '🔴 ตามหลัง' : 'Lagging'}</span>`;
            if (st.status === 'balanced') statusTag = `<span class="tag" style="background:var(--ok);color:#fff">${isTh ? '🟢 สมดุลดี' : 'Balanced'}</span>`;
            else if (st.status === 'moderate') statusTag = `<span class="tag" style="background:#f59f00;color:#fff">${isTh ? '🟡 ปานกลาง' : 'Moderate'}</span>`;

            return `
              <div class="card" style="margin:0;padding:12px;border-left:4px solid ${st.status === 'balanced' ? 'var(--ok)' : (st.status === 'moderate' ? '#f59f00' : '#e03131')}">
                <div class="row">
                  <span style="font-size:22px">${ch.icon}</span>
                  <div class="grow">
                    <div class="row">
                      <b style="font-size:15px">${isTh ? ch.nameTh : ch.nameEn}</b>
                      ${statusTag}
                    </div>
                    <small style="color:var(--mute)">${isTh ? ch.rebalanceAdviceTh : ch.rebalanceAdviceEn}</small>
                  </div>
                  <div style="text-align:right">
                    <b style="font-size:16px">${st.weeklySets}</b><small>/${st.target} ${isTh ? 'เซ็ต' : 'sets'}</small>
                  </div>
                </div>

                <div class="track" style="margin-top:6px;height:6px">
                  <div class="fill ${st.status === 'balanced' ? 'ok' : ''}" style="width:${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    /* Tab 3: All Calisthenics & Ring Ladders from data.js with Video Tutorials */
    function renderSkillsTab(box) {
      if (typeof LADDERS === 'undefined' || !Array.isArray(LADDERS)) {
        box.innerHTML = `<small>${isTh ? 'กำลังโหลดข้อมูลท่า...' : 'Loading...'}</small>`;
        return;
      }

      box.innerHTML = `
        <p class="sub" style="margin:0 0 10px;font-size:13px">
          ${isTh ?
            'รายการสเต็ปการปลดล็อกท่า Calisthenics และห่วงยิมนาสติกทั้งหมด (แตะที่ชื่อท่าเพื่อเปิดดู <b>คลิปสอนวิดีโอ & เทคนิค</b>):' :
            'Full progression paths for Gymnastic Rings and Calisthenics (Tap exercise name for <b>video tutorial & cues</b>):'}
        </p>

        <div style="display:flex;flex-direction:column;gap:10px">
          ${LADDERS.map(([title, ids]) => {
            const pathTitle = typeof ladTitle === 'function' ? ladTitle(title) : title;
            return `
              <div class="card" style="margin:0;padding:12px">
                <b style="font-size:15px;color:var(--accent)">🤸 ${pathTitle}</b>

                <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
                  ${ids.map((id, idx) => {
                    const x = (typeof EX !== 'undefined' && EX[id]) ? EX[id] : { name: id };
                    const isMastered = (typeof MASTERED !== 'undefined' && MASTERED[id]);

                    return `
                      <div class="row" style="background:var(--bg);padding:8px 10px;border-radius:10px;gap:8px">
                        <span class="num" style="background:${isMastered ? 'var(--ok)' : 'var(--card)'};color:${isMastered ? '#fff' : 'inherit'}">
                          ${isMastered ? '✓' : idx + 1}
                        </span>

                        <div class="grow" style="cursor:pointer" data-view-ex="${id}">
                          <b style="font-size:14px;color:var(--ink)">${x.name}</b>
                          <small style="display:block;color:var(--mute)">
                            ${x.rx ? `${isTh ? 'เป้าหมาย' : 'Goal'}: ${escH(x.rx)}` : ''} · <a href="#" style="text-decoration:none;font-weight:600">▶ ${isTh ? 'ดูคลิปสอน & เทคนิค' : 'Video & cues'}</a>
                          </small>
                        </div>

                        <button class="chip ${isMastered ? 'on' : ''}" data-toggle-master="${id}" style="font-size:11px;padding:2px 8px">
                          ${isMastered ? (isTh ? '✓ ผ่านแล้ว' : 'Mastered') : (isTh ? '+ ทำได้แล้ว' : 'Can do')}
                        </button>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      box.querySelectorAll('[data-view-ex]').forEach(el => {
        el.onclick = () => {
          const id = el.dataset.viewEx;
          if (!isInline && typeof m.remove === 'function') m.remove();
          if (typeof go === 'function') go('lib', { name: 'detail', id, from: 'paths' });
        };
      });

      box.querySelectorAll('[data-toggle-master]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.toggleMaster;
          if (typeof MASTERED !== 'undefined') {
            if (MASTERED[id]) delete MASTERED[id];
            else MASTERED[id] = { t: Date.now(), manual: true };
            if (typeof persist === 'function') persist();
            renderModal();
            if (typeof render === 'function') render();
          }
        };
      });
    }

    renderModal();
    if (!isInline) document.body.appendChild(m);
  }

  // Directly starts a session inside PieFit app!
  function startDailySession(sessionId, budgetMinutes, dayNum, mode) {
    if (typeof go === 'function') {
      // Record the intended mode; resolveLaunch() completes the day once training is logged
      STATE.launched = { day: dayNum, mode, t: Date.now() };
      save();

      // Launch session in PieFit
      go('home', { name: 'session', s: sessionId, budget: budgetMinutes });
    }
  }

  return {
    load,
    save,
    homeBannerHTML,
    bindHomeBanner,
    openJourneyModal,
    renderView: (box) => openJourneyModal(box),
    calcBalance,
    getActiveMilestone,
    startDailySession,
    get chains() { return CHAINS; },
    get missions() { return MISSIONS; },
    get state() { return STATE; },
    resolveLaunch
  };
})();
