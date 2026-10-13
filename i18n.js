'use strict';
/* PieFit translations. STR = UI strings, EXTH = Thai exercise instructions, LADTH = Thai path titles. */
const STR = {en:{
  tab_home:'Home', tab_lib:'Exercises', tab_prog:'Progress', tab_more:'More',
  home_sub:'Rings, TRX & gym workout tracker', back:'Back', done:'Done', start:'Start workout', next:'Next', prev:'Prev', finish:'Finish',
  m_chest:'Chest', m_shoulders:'Shoulders', m_triceps:'Triceps', m_lats:'Lats', m_upperback:'Upper back', m_biceps:'Biceps',
  m_core:'Core', m_glutes:'Glutes', m_quads:'Quads', m_hamstrings:'Hamstrings', m_calves:'Calves',
  eq_rings:'Rings', eq_trx:'TRX', eq_abwheel:'Ab wheel', eq_barbell:'Barbell', eq_dumbbell:'Dumbbells', eq_machine:'Machine',
  eq_cable:'Cable', eq_bar:'Pull-up bar', eq_floor:'Bodyweight',
  k_strength:'Strength', k_hold:'Static hold', k_skill:'Skill', lvl_1:'Beginner', lvl_2:'Intermediate', lvl_3:'Advanced',
  g_general:'General fitness', g_muscle:'Build muscle', g_strength:'Get stronger',
  x_new:'New', x_regular:'Some experience', x_exp:'Experienced',
  v_rings:'Rings', v_gym:'Gym',
  s_push:'Push', sn_push:'Chest · shoulders · triceps', s_pull:'Pull', sn_pull:'Back · biceps · rear delts',
  s_legs:'Legs + Core', sn_legs:'Quads · glutes · hamstrings · calves · abs', s_skills:'Skills & Holds', sn_skills:'Static holds · skin the cat · lever work',
  s_full:'Full Body', sn_full:'Everything, short and simple', s_auto:'Smart: lagging muscles', sn_auto:'Built from this week\'s gaps, skips muscles that are still recovering',
  s_cal:'Calibration test', sn_cal:'Find your starting point: one test set per exercise',
  u_reps:'Reps', u_sec:'Seconds', per_db:'/ dumbbell', weight:'Weight', range:'Range',
  ob_sub:'Let\'s set things up. You can change all of this later in More → Settings.', language:'Language',
  ob_where:'Where are you training today?', ob_where_note:'Rings or TRX at home, or a gym. Every exercise can be swapped for one that trains the same muscles.',
  ob_exp:'Training experience', ob_goal:'Your goal', ob_skip:'Skip the test for now',
  cal_card_title:'Calibration test', cal_card_body:'Do one test set of a few key exercises so the app knows your starting point. It then suggests reps and weights that fit you, instead of guessing.',
  cal_start:'Start calibration', cal_intro:'One test set per exercise. Do as many clean reps as you can (or hold as long as you can) and stop when your form breaks. If you pass a step, the next step of that path is added so you land at the right level.',
  test_once:'1 test set', test_title:'Test set', test_bw:'Do as many clean reps as you can. Stop as soon as your form breaks, then enter the number.',
  test_hold:'Hold as long as you can with good form. Use the timer, then save.',
  test_load:'Pick a weight you think you can lift about 10 times. Do as many clean reps as you can (stop at 15), then enter the weight and reps.',
  result_reps:'Reps you did', result_sec:'Seconds you held', save_test:'Save test result', test_saved:'Test saved. Plan updated.',
  test_first:'First time? Do a test set first', test_this:'Test this exercise',
  resume_title:'Workout in progress', resume:'Resume', discard:'Discard', discard_confirm:'Discard the unfinished workout? Logged sets are kept.',
  ex_of:'exercise {0} of {1}', suggest_today:'Suggested today', focus:'Focus: {0}', week_progress:'This week', still_needed:'Still needed (sets):',
  all_done:'All weekly targets reached', recovering:'Recovering (trained in the last 48h): {0}', all_sessions:'All sessions',
  n_ex:'{0} exercises', n_sets:'{0} sets', last:'last: {0}', not_done:'not done yet', today_l:'today', days_ago:'{0} d ago', retest:'Retest',
  recent_warn:'Trained in the last 48h: {0}. Fine for light work, but consider another session for heavy sets.',
  skills_gym:'Ring skills have no equivalent here. Use "Add exercise" to build the day yourself.',
  swap:'Swap', swap_hint:'Same muscles, other equipment', remove:'Remove', add_ex:'Add exercise', add_hint:'Search or filter by muscle',
  search:'Search exercises…', all_muscles:'All muscles', all_eq:'All equipment', all_types:'All types', no_match:'No matching exercises.',
  how_to:'How to do it', fig_note:'Simplified side-view drawing. Check a video for details such as grip and hand position.',
  caution:'Caution', mastered:'Mastered', locked:'Locked', master_first:'Master first: {0}', goal_to_master:'Goal to master',
  goal_text:'{0} sets × {1} in {2} sessions in a row (fastest ≈ {3} wk at 3 sessions/week, most people need longer)',
  streak:'Streak: {0} / {1} sessions',
  today_plan:'Today\'s plan', easier:'Too hard? Easier version',
  sg_add:'You hit the top of the range on every set last time. Add {0} kg.', sg_reduce:'Last time several sets missed the range. Weight reduced about 10%.',
  sg_same:'Same weight as last time. Aim for one more rep.', sg_fromtest:'Based on your calibration test.',
  sg_first:'No data yet. Start light: if set 1 feels easy, add weight.', sg_first_bw:'No data yet. Start at the bottom of the range.',
  sg_bw_top:'All sets at the top last time. Make it harder (slower reps, harder variation).',
  sg_bw_top_path:'All sets at the top. Keep this up to master the step and unlock the next one.',
  sg_bw_low:'Below the range last time. Try the easier version for now.', sg_bw_more:'Aim for one more rep than last time.',
  sg_cal_low:'Your test was below the range. The easier version is a better start.',
  sg_low_adj:'Below the range for now. Make it easier (more upright body, higher rings/straps, smaller range) and add a rep each session.',
  cal_low_adj:'Below the range: make it easier (more upright, higher rings) and build up from your result.',
  hold_start:'Start hold timer', hold_stop:'Stop', log_set:'Log set {0}', all_sets_done:'All sets done', edit:'Edit',
  del_confirm:'Delete this set?', rest:'Rest', skip:'Skip rest', quit_confirm:'End the workout now? Logged sets are kept.',
  workout_done:'Workout done', cal_done:'Calibration done', sets:'sets', minutes:'minutes', volume_kg:'kg volume',
  cal_results:'Your starting point', cal_passed:'Passed: marked as mastered, next step unlocked.',
  cal_load_res:'Suggested working weight: {0} for the bottom of the rep range.', cal_low:'Below the range: start with the easier version.',
  cal_ok:'Good starting point. Plans will build from here.',
  lib_title:'Exercises', your_history:'Your history', baseline:'Baseline', no_history:'No sets logged yet.', video:'Watch video references',
  p_week:'This week', p_hist:'History', p_base:'Baseline', last7:'Last 7 days · {0} sets · {1} training days',
  target_note:'Recommended sets per muscle per week for this goal, scaled for "{0}". Use − / + to set your own.',
  muscles_week:'Sets this week / target', custom_rec:'custom · recommended {0}',
  count_note:'Primary muscle = 1 set, secondary = ½ set. Rings, TRX and gym all count together. ⏳ = trained in the last 48h.',
  reset_targets:'Reset to recommended', target_disclaimer:'Recommended targets are general starting points, not personal advice. More is not always better, adjust to your recovery.',
  no_sets:'No sets logged yet. Start a workout from Home.',
  base_intro:'Your calibration results compared with your best since then (estimated 1-rep max for weighted lifts).',
  e1rm:'est. 1RM {0} kg', best_since:'Best since: {0}', no_since:'No sets since the test yet.', no_base:'No tests yet. Run the calibration test to set your starting point.',
  paths:'Progression paths', paths_sub:'What is unlocked and what comes next', paths_intro:'Reach the goal of each step to unlock the next one. Tap a name for the guide.',
  needs:'Needs: {0}', manual:'marked manually', by_test:'by test', undo:'Undo', can_do:'I can do this',
  paths_note:'A session counts when you log at least the goal sets with at least the goal reps/seconds on the same day. One weaker session resets the streak. Goals are guidelines, not a guarantee you are ready.',
  guide:'Beginner guide', guide_sub:'How to start and how to progress', settings:'Settings', settings_sub:'Language, experience, rest alerts',
  backup:'Backup', backup_note:'Your data lives only on this device. Export a backup file now and then (for example to Google Drive), and import it on a new phone.',
  export:'Export backup', import:'Import backup', exported:'Backup file saved', import_bad:'This is not a PieFit backup file.',
  import_confirm:'Replace all current data with this backup ({0} sets)?', import_ok:'Backup imported',
  install:'Install on your phone', install_note:'iPhone: open in Safari → Share → Add to Home Screen. Android: open in Chrome → ⋮ menu → Install app. After installing, it works offline.',
  exp_note:'Changes the recommended weekly sets.', ring_mode:'Ring progression', guided:'Guided', free:'Free',
  guided_note:'Ring sessions only give you exercises you have unlocked.', free_note:'Every exercise is available, no gating.',
  rest_alert:'Rest timer alert', on:'On', off:'Off', rest_note:'Sound and vibration when rest is over. Rest length depends on the exercise (60s-2.5min).',
  danger:'Data', clear_all:'Delete all data', clear_confirm:'Delete all sets, tests and progression? This cannot be undone. Export a backup first if unsure.',
  cleared:'All data deleted', offline_note:'works offline, data stays on this device',
  news_mastered:'🎉 {0} mastered', news_unlocked:'unlocked: {0}',
  guide_html:`<div class="card"><h3>Start here</h3><ul class="cues">
    <li>Run the <b>calibration test</b> first so the app knows your level</li>
    <li>Train 3 days a week with a rest day between. <b>Full Body</b> or the suggested session on Home is a good default</li>
    <li>Stop each set with about 2 reps left in the tank, no grinding to failure</li>
    <li>Rest timers are set per exercise: longer for heavy compound lifts, shorter for small muscles</li></ul></div>
  <div class="card"><h3>How progress works</h3><ul class="cues">
    <li><b>Weights:</b> when every set reaches the top of the rep range, the app adds weight next time. If you miss the range, it lowers the weight</li>
    <li><b>Bodyweight:</b> add a rep each session until you hit the top of the range, then move to the next step of the path</li>
    <li><b>Ring paths:</b> reach a step's goal in 2-3 sessions in a row to unlock the next one</li>
    <li>If form breaks, use "Too hard?" or Swap during a workout, no shame</li></ul></div>
  <div class="card"><h3>Weekly volume and recovery</h3><ul class="cues">
    <li>The Progress tab counts sets per muscle per week against your target</li>
    <li>Give a muscle about 48 hours before training it hard again (⏳ on Home)</li></ul></div>
  <div class="card"><h3>Rings & TRX basics</h3><ul class="cues">
    <li>Hang rings or TRX from a sturdy anchor, check straps and buckles before every session</li>
    <li>For rows and push-ups: more upright = easier, more horizontal = harder</li>
    <li>Rings are unstable, expect lower reps than on the floor at first</li>
    <li>Sharp joint pain (shoulder, elbow, wrist) = stop and go easier. Muscle burn is fine</li></ul></div>
  <div class="card"><small>These are general guidelines, not medical advice. Adjust to how you feel.</small></div>`
}, th:{
  tab_home:'หน้าหลัก', tab_lib:'ท่าออกกำลัง', tab_prog:'ความคืบหน้า', tab_more:'เพิ่มเติม',
  home_sub:'บันทึกการซ้อม ห่วง TRX และยิม', back:'กลับ', done:'เสร็จ', start:'เริ่มซ้อม', next:'ถัดไป', prev:'ก่อนหน้า', finish:'จบการซ้อม',
  m_chest:'อก', m_shoulders:'ไหล่', m_triceps:'หลังแขน', m_lats:'ปีก (หลังกว้าง)', m_upperback:'หลังบน', m_biceps:'หน้าแขน',
  m_core:'แกนกลาง/หน้าท้อง', m_glutes:'ก้น', m_quads:'ต้นขาหน้า', m_hamstrings:'ต้นขาหลัง', m_calves:'น่อง',
  eq_rings:'ห่วง', eq_trx:'TRX', eq_abwheel:'ล้อหน้าท้อง', eq_barbell:'บาร์เบล', eq_dumbbell:'ดัมเบล', eq_machine:'เครื่อง',
  eq_cable:'เคเบิล', eq_bar:'บาร์โหน', eq_floor:'น้ำหนักตัว',
  k_strength:'ท่าแรง', k_hold:'ค้างนิ่ง', k_skill:'ท่าทักษะ', lvl_1:'มือใหม่', lvl_2:'กลาง', lvl_3:'สูง',
  g_general:'ฟิตทั่วไป', g_muscle:'สร้างกล้าม', g_strength:'เพิ่มแรง',
  x_new:'มือใหม่', x_regular:'มีประสบการณ์บ้าง', x_exp:'ซ้อมประจำ',
  v_rings:'ห่วง', v_gym:'ยิม',
  s_push:'วันดัน (Push)', sn_push:'อก · ไหล่ · หลังแขน', s_pull:'วันดึง (Pull)', sn_pull:'หลัง · หน้าแขน · ไหล่หลัง',
  s_legs:'ขา + แกนกลาง', sn_legs:'ต้นขา · ก้น · น่อง · หน้าท้อง', s_skills:'ทักษะ & ค้างท่า', sn_skills:'ค้างนิ่ง · skin the cat · lever',
  s_full:'ทั้งตัว (Full Body)', sn_full:'ครบทุกส่วน สั้นและง่าย', s_auto:'อัจฉริยะ: กล้ามที่ยังขาด', sn_auto:'สร้างจากกล้ามที่ยังไม่ถึงเป้าสัปดาห์นี้ และข้ามกล้ามที่ยังพักฟื้น',
  s_cal:'ทดสอบวัดระดับ', sn_cal:'หาจุดเริ่มต้นของคุณ: ทดสอบท่าละ 1 เซ็ต',
  u_reps:'ครั้ง', u_sec:'วินาที', per_db:'/ ข้าง', weight:'น้ำหนัก', range:'ช่วง',
  ob_sub:'มาตั้งค่ากันก่อน เปลี่ยนทีหลังได้ที่ เพิ่มเติม → ตั้งค่า', language:'ภาษา',
  ob_where:'วันนี้ซ้อมที่ไหน?', ob_where_note:'ห่วงหรือ TRX ที่บ้าน หรือที่ยิม ทุกท่าสลับเป็นท่าอื่นที่ใช้กล้ามเดียวกันได้',
  ob_exp:'ประสบการณ์การซ้อม', ob_goal:'เป้าหมาย', ob_skip:'ข้ามการทดสอบไปก่อน',
  cal_card_title:'ทดสอบวัดระดับ', cal_card_body:'ทำท่าหลักๆ ท่าละ 1 เซ็ตทดสอบ ให้แอปรู้จุดเริ่มต้นของคุณ แล้วแอปจะแนะนำจำนวนครั้งและน้ำหนักที่เหมาะกับคุณ แทนการเดา',
  cal_start:'เริ่มทดสอบ', cal_intro:'ทดสอบท่าละ 1 เซ็ต ทำให้ได้มากที่สุดแบบฟอร์มดี (หรือค้างให้นานที่สุด) แล้วหยุดทันทีเมื่อฟอร์มเริ่มเสีย ถ้าผ่านขั้นไหน แอปจะเพิ่มขั้นถัดไปของเส้นทางนั้นให้ทดสอบต่อ เพื่อให้เริ่มที่ระดับที่ใช่',
  test_once:'ทดสอบ 1 เซ็ต', test_title:'เซ็ตทดสอบ', test_bw:'ทำให้ได้มากที่สุดแบบฟอร์มดี หยุดทันทีเมื่อฟอร์มเสีย แล้วใส่จำนวนครั้ง',
  test_hold:'ค้างให้นานที่สุดแบบฟอร์มดี ใช้ตัวจับเวลา แล้วกดบันทึก',
  test_load:'เลือกน้ำหนักที่คิดว่ายกได้ประมาณ 10 ครั้ง ทำให้ได้มากที่สุดแบบฟอร์มดี (ไม่เกิน 15 ครั้ง) แล้วใส่น้ำหนักกับจำนวนครั้ง',
  result_reps:'ทำได้กี่ครั้ง', result_sec:'ค้างได้กี่วินาที', save_test:'บันทึกผลทดสอบ', test_saved:'บันทึกผลทดสอบแล้ว ปรับแผนให้แล้ว',
  test_first:'ครั้งแรก? ทำเซ็ตทดสอบก่อน', test_this:'ทดสอบท่านี้',
  resume_title:'มีการซ้อมค้างอยู่', resume:'ซ้อมต่อ', discard:'ทิ้ง', discard_confirm:'ทิ้งการซ้อมที่ค้างไว้? เซ็ตที่บันทึกแล้วยังอยู่',
  ex_of:'ท่าที่ {0} จาก {1}', suggest_today:'แนะนำวันนี้', focus:'เน้น: {0}', week_progress:'สัปดาห์นี้', still_needed:'ยังขาด (เซ็ต):',
  all_done:'ถึงเป้าทุกกล้ามแล้วสัปดาห์นี้', recovering:'กำลังพักฟื้น (เล่นใน 48 ชม.): {0}', all_sessions:'เซสชันทั้งหมด',
  n_ex:'{0} ท่า', n_sets:'{0} เซ็ต', last:'ล่าสุด: {0}', not_done:'ยังไม่เคยทำ', today_l:'วันนี้', days_ago:'{0} วันก่อน', retest:'ทดสอบใหม่',
  recent_warn:'เล่นไปแล้วใน 48 ชม.: {0} เล่นเบาๆ ได้ แต่ถ้าจะเล่นหนัก ลองเลือกเซสชันอื่นก่อน',
  skills_gym:'ท่าทักษะห่วงไม่มีท่าเทียบเท่าที่นี่ ใช้ "เพิ่มท่า" จัดวันซ้อมเองได้',
  swap:'สลับท่า', swap_hint:'กล้ามเดียวกัน อุปกรณ์อื่น', remove:'ลบ', add_ex:'เพิ่มท่า', add_hint:'ค้นหา หรือกรองตามกล้ามเนื้อ',
  search:'ค้นหาท่า…', all_muscles:'ทุกกล้ามเนื้อ', all_eq:'ทุกอุปกรณ์', all_types:'ทุกประเภท', no_match:'ไม่พบท่าที่ตรงกัน',
  how_to:'วิธีทำ', fig_note:'ภาพจำลองด้านข้างแบบง่าย รายละเอียดเช่นการจับและตำแหน่งมือ ดูวิดีโอเพิ่มได้',
  caution:'ข้อควรระวัง', mastered:'ผ่านแล้ว', locked:'ล็อกอยู่', master_first:'ต้องผ่านก่อน: {0}', goal_to_master:'เป้าหมายเพื่อผ่านขั้นนี้',
  goal_text:'{0} เซ็ต × {1} ติดกัน {2} ครั้ง (เร็วสุดประมาณ {3} สัปดาห์ถ้าซ้อม 3 ครั้ง/สัปดาห์ ส่วนใหญ่ใช้นานกว่านั้น)',
  streak:'ทำต่อเนื่อง: {0} / {1} ครั้ง',
  today_plan:'แผนวันนี้', easier:'ยากไป? ใช้ท่าง่ายกว่า',
  sg_add:'ครั้งก่อนทำได้ถึงจำนวนสูงสุดครบทุกเซ็ต เพิ่ม {0} kg', sg_reduce:'ครั้งก่อนหลายเซ็ตไม่ถึงช่วงที่กำหนด ลดน้ำหนักลงประมาณ 10%',
  sg_same:'น้ำหนักเท่าครั้งก่อน ตั้งเป้าเพิ่มอีก 1 ครั้ง', sg_fromtest:'คำนวณจากผลทดสอบของคุณ',
  sg_first:'ยังไม่มีข้อมูล เริ่มเบาๆ ถ้าเซ็ตแรกง่ายไป ค่อยเพิ่มน้ำหนัก', sg_first_bw:'ยังไม่มีข้อมูล เริ่มที่จำนวนต่ำสุดของช่วง',
  sg_bw_top:'ครั้งก่อนทำได้สูงสุดทุกเซ็ต ทำให้ยากขึ้น (ทำช้าลง หรือใช้ท่าที่ยากกว่า)',
  sg_bw_top_path:'ทำได้สูงสุดทุกเซ็ตแล้ว ทำแบบนี้ต่อเพื่อผ่านขั้นนี้และปลดล็อกขั้นถัดไป',
  sg_bw_low:'ครั้งก่อนต่ำกว่าช่วงที่กำหนด ลองใช้ท่าง่ายกว่าไปก่อน', sg_bw_more:'ตั้งเป้าเพิ่มจากครั้งก่อนอีก 1 ครั้ง',
  sg_cal_low:'ผลทดสอบต่ำกว่าช่วงที่กำหนด เริ่มจากท่าง่ายกว่าจะดีกว่า',
  sg_low_adj:'ตอนนี้ยังต่ำกว่าช่วง ปรับให้ง่ายขึ้น (ยืนตัวตรงขึ้น ตั้งห่วง/สายให้สูงขึ้น หรือลงไม่สุด) แล้วเพิ่มทีละครั้งในแต่ละการซ้อม',
  cal_low_adj:'ต่ำกว่าช่วงที่กำหนด: ปรับให้ง่ายขึ้น (ยืนตัวตรงขึ้น ตั้งห่วงสูงขึ้น) แล้วค่อยๆ เพิ่มจากผลที่ทำได้',
  hold_start:'เริ่มจับเวลาค้าง', hold_stop:'หยุด', log_set:'บันทึกเซ็ตที่ {0}', all_sets_done:'ครบทุกเซ็ตแล้ว', edit:'แก้ไข',
  del_confirm:'ลบเซ็ตนี้?', rest:'พัก', skip:'ข้ามการพัก', quit_confirm:'จบการซ้อมตอนนี้? เซ็ตที่บันทึกแล้วยังอยู่',
  workout_done:'ซ้อมเสร็จแล้ว', cal_done:'ทดสอบเสร็จแล้ว', sets:'เซ็ต', minutes:'นาที', volume_kg:'kg รวม',
  cal_results:'จุดเริ่มต้นของคุณ', cal_passed:'ผ่าน: นับว่าผ่านขั้นนี้แล้ว และปลดล็อกขั้นถัดไป',
  cal_load_res:'น้ำหนักแนะนำสำหรับซ้อม: {0} ที่จำนวนต่ำสุดของช่วง', cal_low:'ต่ำกว่าช่วงที่กำหนด: เริ่มจากท่าง่ายกว่า',
  cal_ok:'จุดเริ่มต้นที่ดี แผนจะต่อยอดจากตรงนี้',
  lib_title:'ท่าออกกำลัง', your_history:'ประวัติของคุณ', baseline:'ผลทดสอบตั้งต้น', no_history:'ยังไม่มีเซ็ตที่บันทึก', video:'ดูวิดีโออ้างอิง',
  p_week:'สัปดาห์นี้', p_hist:'ประวัติ', p_base:'เทียบจุดเริ่ม', last7:'7 วันล่าสุด · {0} เซ็ต · ซ้อม {1} วัน',
  target_note:'จำนวนเซ็ตต่อกล้ามต่อสัปดาห์ที่แนะนำสำหรับเป้าหมายนี้ ปรับตามระดับ "{0}" กด − / + เพื่อตั้งเองได้',
  muscles_week:'เซ็ตสัปดาห์นี้ / เป้า', custom_rec:'ตั้งเอง · ค่าแนะนำ {0}',
  count_note:'กล้ามหลัก = 1 เซ็ต กล้ามรอง = ½ เซ็ต นับรวมห่วง TRX และยิม ⏳ = เล่นไปใน 48 ชม.',
  reset_targets:'กลับไปใช้ค่าแนะนำ', target_disclaimer:'ค่าแนะนำเป็นจุดเริ่มต้นทั่วไป ไม่ใช่คำแนะนำเฉพาะบุคคล เยอะกว่าไม่ได้ดีกว่าเสมอ ปรับตามการฟื้นตัวของคุณ',
  no_sets:'ยังไม่มีเซ็ตที่บันทึก เริ่มซ้อมได้จากหน้าหลัก',
  base_intro:'ผลทดสอบตั้งต้นเทียบกับผลดีที่สุดหลังจากนั้น (ท่าใช้น้ำหนักเทียบด้วยค่าประมาณ 1RM)',
  e1rm:'1RM ประมาณ {0} kg', best_since:'ดีที่สุดหลังทดสอบ: {0}', no_since:'ยังไม่มีเซ็ตหลังทดสอบ', no_base:'ยังไม่มีผลทดสอบ ทำการทดสอบวัดระดับเพื่อตั้งจุดเริ่มต้น',
  paths:'เส้นทางพัฒนา', paths_sub:'อะไรปลดล็อกแล้ว และขั้นต่อไปคืออะไร', paths_intro:'ทำให้ถึงเป้าของแต่ละขั้นเพื่อปลดล็อกขั้นถัดไป แตะชื่อท่าเพื่อดูวิธีทำ',
  needs:'ต้องผ่าน: {0}', manual:'กดเอง', by_test:'จากการทดสอบ', undo:'ยกเลิก', can_do:'ทำได้แล้ว',
  paths_note:'การซ้อมจะนับเมื่อบันทึกครบจำนวนเซ็ตและจำนวนครั้ง/วินาทีตามเป้าในวันเดียวกัน ถ้ามีครั้งที่ทำได้น้อยกว่าเป้า จะเริ่มนับใหม่ เป้าหมายเป็นแนวทาง ไม่ได้รับประกันว่าพร้อมแล้ว',
  guide:'คู่มือมือใหม่', guide_sub:'เริ่มยังไง และพัฒนาต่อยังไง', settings:'ตั้งค่า', settings_sub:'ภาษา ประสบการณ์ เสียงเตือนพัก',
  backup:'สำรองข้อมูล', backup_note:'ข้อมูลอยู่ในเครื่องนี้เท่านั้น ควร export ไฟล์สำรองเป็นระยะ (เช่นเก็บใน Google Drive) แล้ว import ในมือถือเครื่องใหม่ได้',
  export:'Export ไฟล์สำรอง', import:'Import ไฟล์สำรอง', exported:'บันทึกไฟล์สำรองแล้ว', import_bad:'ไฟล์นี้ไม่ใช่ไฟล์สำรองของ PieFit',
  import_confirm:'แทนที่ข้อมูลทั้งหมดด้วยไฟล์สำรองนี้ ({0} เซ็ต)?', import_ok:'นำเข้าข้อมูลแล้ว',
  install:'ติดตั้งบนมือถือ', install_note:'iPhone: เปิดใน Safari → ปุ่มแชร์ → เพิ่มลงในหน้าจอโฮม  Android: เปิดใน Chrome → เมนู ⋮ → ติดตั้งแอป ติดตั้งแล้วใช้ออฟไลน์ได้',
  exp_note:'มีผลกับจำนวนเซ็ตต่อสัปดาห์ที่แนะนำ', ring_mode:'ระบบพัฒนาท่าห่วง', guided:'แบบนำทาง', free:'อิสระ',
  guided_note:'เซสชันห่วงจะให้เฉพาะท่าที่ปลดล็อกแล้ว', free_note:'ใช้ได้ทุกท่า ไม่มีการล็อก',
  rest_alert:'เตือนเมื่อหมดเวลาพัก', on:'เปิด', off:'ปิด', rest_note:'มีเสียงและสั่นเมื่อหมดเวลาพัก เวลาพักขึ้นกับท่า (60 วินาที - 2.5 นาที)',
  danger:'ข้อมูล', clear_all:'ลบข้อมูลทั้งหมด', clear_confirm:'ลบทุกเซ็ต ผลทดสอบ และความคืบหน้า? ย้อนกลับไม่ได้ ถ้าไม่แน่ใจให้ export สำรองก่อน',
  cleared:'ลบข้อมูลทั้งหมดแล้ว', offline_note:'ใช้ออฟไลน์ได้ ข้อมูลอยู่ในเครื่องนี้',
  news_mastered:'🎉 ผ่านขั้น {0} แล้ว', news_unlocked:'ปลดล็อก: {0}',
  guide_html:`<div class="card"><h3>เริ่มต้นตรงนี้</h3><ul class="cues">
    <li>ทำ <b>ทดสอบวัดระดับ</b> ก่อน ให้แอปรู้ระดับของคุณ</li>
    <li>ซ้อมสัปดาห์ละ 3 วัน เว้นวันพักระหว่างกัน ใช้ <b>Full Body</b> หรือเซสชันที่แอปแนะนำในหน้าหลัก</li>
    <li>หยุดแต่ละเซ็ตตอนที่ยังเหลือแรงอีกประมาณ 2 ครั้ง ไม่ต้องฝืนจนหมดแรง</li>
    <li>เวลาพักตั้งตามท่า: ท่าใหญ่ที่ใช้น้ำหนักหนักพักนานกว่า ท่าเล็กพักสั้นกว่า</li></ul></div>
  <div class="card"><h3>ระบบพัฒนาทำงานยังไง</h3><ul class="cues">
    <li><b>ท่าใช้น้ำหนัก:</b> เมื่อทำได้ถึงจำนวนสูงสุดของช่วงครบทุกเซ็ต แอปจะเพิ่มน้ำหนักให้ครั้งหน้า ถ้าไม่ถึงช่วง แอปจะลดน้ำหนัก</li>
    <li><b>ท่าน้ำหนักตัว:</b> เพิ่มทีละครั้งในแต่ละการซ้อม จนถึงจำนวนสูงสุดของช่วง แล้วขยับไปขั้นถัดไปของเส้นทาง</li>
    <li><b>เส้นทางท่าห่วง:</b> ทำให้ถึงเป้าของขั้นนั้นติดกัน 2-3 ครั้ง เพื่อปลดล็อกขั้นถัดไป</li>
    <li>ถ้าฟอร์มเริ่มเสีย กด "ยากไป?" หรือ "สลับท่า" ระหว่างซ้อมได้เลย ไม่ต้องอาย</li></ul></div>
  <div class="card"><h3>ปริมาณต่อสัปดาห์และการพักฟื้น</h3><ul class="cues">
    <li>แท็บความคืบหน้านับเซ็ตของแต่ละกล้ามต่อสัปดาห์เทียบกับเป้า</li>
    <li>ให้กล้ามเนื้อมัดเดิมพักประมาณ 48 ชม. ก่อนเล่นหนักอีกครั้ง (⏳ ในหน้าหลัก)</li></ul></div>
  <div class="card"><h3>พื้นฐานห่วงและ TRX</h3><ul class="cues">
    <li>แขวนห่วงหรือ TRX กับจุดยึดที่แข็งแรง เช็กสายและหัวล็อกก่อนซ้อมทุกครั้ง</li>
    <li>ท่าดึง/ท่าดันแบบเอียงตัว: ตัวตั้งตรงมาก = ง่าย ตัวขนานพื้นมาก = ยาก</li>
    <li>ห่วงไม่นิ่ง ช่วงแรกจะทำได้น้อยกว่าบนพื้นเป็นเรื่องปกติ</li>
    <li>ปวดแหลมที่ข้อต่อ (ไหล่ ศอก ข้อมือ) = หยุดแล้วลดความยาก ส่วนแสบกล้ามเป็นเรื่องปกติ</li></ul></div>
  <div class="card"><small>ทั้งหมดนี้เป็นแนวทางทั่วไป ไม่ใช่คำแนะนำทางการแพทย์ ปรับตามความรู้สึกของร่างกาย</small></div>`
}};

const LADTH = {
  'Pull-up path':'เส้นทางดึงข้อ (Pull-up)', 'Push-up path':'เส้นทางวิดพื้น (Push-up)', 'Overhead push path':'เส้นทางดันเหนือหัว',
  'Core path':'เส้นทางแกนกลาง', 'L-sit path':'เส้นทาง L-sit', 'Front lever path':'เส้นทาง Front lever', 'Back lever path':'เส้นทาง Back lever',
  'Muscle-up path':'เส้นทาง Muscle-up', 'Static holds path':'เส้นทางค้างนิ่ง', 'Legs path':'เส้นทางขา', 'Ab wheel path':'เส้นทางล้อหน้าท้อง'
};

const HOLD_WARN_TH = 'ท่านี้ใช้หัวไหล่หนัก: ทำเท่าที่รู้สึกสบาย แขนเหยียดตรง และหยุดทันทีถ้าปวดแหลมที่ไหล่หรือศอก ค่อยๆ เพิ่มทีละสัปดาห์';
const EXTH = {
  pushup:{cues:['ห่วงสูงประมาณเข่า มืออยู่ใต้ไหล่','ลำตัวเป็นเส้นตรง เกร็งก้น','ตอนดันขึ้นสุดหมุนห่วงออกเล็กน้อย','ตอนลง ศอกกางประมาณ 45° จากลำตัว'],
    prog:'ง่ายขึ้น: วิดพื้นบนพื้น หรือปรับห่วงให้สูงขึ้น  ยากขึ้น: ยกเท้าสูง, RTO push-up'},
  pike:{cues:['สะโพกสูง ห่วงอยู่ใต้ไหล่','ศีรษะลงไประหว่างห่วง','ดันกลับขึ้นโดยไม่ยักไหล่']},
  dip:{cues:['เริ่มจากท่า support แขนเหยียดล็อก หมุนห่วงออก','เอนตัวไปข้างหน้าเล็กน้อย ลงอย่างควบคุม','ห่วงชิดลำตัว','ดันขึ้นแล้วล็อกศอกอีกครั้ง'],
    prog:'ง่ายขึ้น: ค้าง support ก่อน แล้วฝึกลงช้าๆ หรือใช้เท้าช่วย'},
  tricep:{cues:['ห่วงสูงประมาณเอว เอนตัวไปข้างหน้า','ศอกแคบและนิ่ง','เหยียดแขนสุด ลำตัวเกร็งตรง']},
  row:{cues:['ห่วงสูงประมาณเอว ตัวอยู่ใต้ห่วง','บีบสะบักก่อน แล้วค่อยงอศอก','ดึงห่วงมาที่อกล่าง','ลำตัวตรงเหมือนแพลงก์'],
    prog:'ง่ายขึ้น: ยืนตัวตรงขึ้น  ยากขึ้น: ยกเท้าสูง'},
  pullup:{cues:['เริ่มจากห้อยตัวแขนตรง ไหล่ตึง','ดึงศอกลงไปทางสะโพก','ดึงจนห่วงถึงอก คางพ้นมือ','ลงจนสุดอย่างควบคุม'],
    prog:'ง่ายขึ้น: ring row, ใช้ยางช่วย  ยากขึ้น: ดึงจนห่วงถึงอก, L-sit pull-up'},
  facepull:{cues:['ห่วงสูง เอนตัวไปข้างหลัง ลำตัวตรง','ดึงมือมาทางหน้า ศอกสูงและกว้าง','จบที่มืออยู่ข้างหู นิ้วโป้งชี้ไปข้างหลัง']},
  curl:{cues:['เอนตัวไปข้างหลัง แขนเหยียด หงายมือ','งอแขนดึงมือมาทางหน้าผาก','ศอกอยู่สูงนิ่ง ลำตัวเกร็ง']},
  fallout:{cues:['ห่วงต่ำ เริ่มจากแพลงก์บนแขน เกร็งก้น','ยื่นแขนไปข้างหน้าโดยลำตัวยังตรง','หยุดก่อนหลังล่างแอ่น','ดึงกลับด้วยหน้าท้องและปีก'],
    prog:'ง่ายขึ้น: ทำจากท่าคุกเข่า  ยากขึ้น: ทำจากเท้า ยื่นไกลขึ้น'},
  hollow:{cues:['กดหลังล่างติดพื้น','ยกขาและไหล่ขึ้นจากพื้นเล็กน้อย','แขนเหยียดเหนือหัว ซี่โครงกดลง']},
  support:{cues:['แขนเหยียดตรง หมุนห่วงออก','กดไหล่ลงห่างจากหู','ลำตัวโค้งแบบ hollow ขาชิดกัน']},
  split:{cues:['วางเท้าหลังในสายห่วง','หน้าแข้งขาหน้าเกือบตั้งฉาก ลำตัวตั้งตรง','ย่อลงจนเข่าหลังเกือบแตะพื้น','ดันขึ้นด้วยส้นเท้าขาหน้า']},
  hamcurl:{cues:['นอนหงาย วางส้นเท้าในห่วง','ยกสะโพกขึ้นเป็นสะพาน','งอเข่าดึงส้นเท้ามาหาก้น สะโพกยังยกอยู่','เหยียดกลับช้าๆ']},
  lsit:{cues:['อยู่ในท่า support กดไหล่ลง','ขาเหยียดตรง ขนานพื้น','เริ่มจากงอเข่าก่อน แล้วค่อยพัฒนา']},
  inclinepush:{cues:['ห่วงสูงประมาณอก ยิ่งสูงยิ่งง่าย','ลำตัวเป็นเส้นตรงตั้งแต่ส้นเท้าถึงหัว','ลดอกลงระหว่างห่วง ศอกกางประมาณ 45°','ถอยเท้าไปข้างหลังหรือลดห่วงลงเพื่อพัฒนา'],
    prog:'พัฒนา: ลดห่วงลงทีละนิดทุกสัปดาห์ จนสูงระดับเข่า (Ring Push-up)'},
  negpull:{cues:['กระโดดหรือเหยียบขึ้นให้คางพ้นห่วง','ลดตัวลงให้ช้าที่สุด ตั้งเป้า 4-5 วินาที','ลงจนแขนเหยียดสุด แล้วขึ้นใหม่','กดไหล่ลง ไม่ยักไหล่'],
    prog:'พัฒนา: เมื่อทำลงช้าได้ 3 เซ็ต × 5 สบายๆ ลองดึงแบบมีตัวช่วย (เท้าวางเก้าอี้) แล้วค่อยดึงเต็ม'},
  pikefloor:{cues:['มือวางพื้น สะโพกสูงเป็นรูปตัว V คว่ำ','ลดศีรษะลงหาพื้น','ดันกลับขึ้น แล้วค่อยพัฒนาไปยกเท้าสูงหรือใช้ห่วง']},
  tucksit:{cues:['แขนเหยียดตรง หมุนห่วงออก กดไหล่ลง','ดึงเข่าทั้งสองขึ้นหาอก','ถ้ายังทำ support ไม่ได้ ให้เท้าแตะพื้นไว้']},
  ringsquat:{cues:['จับห่วงระดับอก แขนเหยียด','นั่งลงไปข้างหลัง เข่าชี้ไปทางปลายเท้า','ใช้ห่วงแค่ช่วยทรงตัว ให้ขาทำงาน','พัฒนาไป split squat แล้ว Bulgarian split squat']},
  falloutknee:{cues:['คุกเข่า แขนท่อนล่างวางบนห่วง เกร็งก้น','กลิ้งห่วงไปข้างหน้าเท่าที่หลังยังตรง','ดึงกลับด้วยหน้าท้องและปีก แล้วค่อยลองจากเท้า']},
  deadhang:{cues:['ห้อยตัวจากห่วง แขนเหยียดตรง','กดไหล่ลงห่างจากหูเล็กน้อย (active hang)','ลำตัวนิ่ง หายใจปกติ']},
  rtosupport:{cues:['ขึ้นท่า support แขนเหยียดก่อน','หมุนห่วงออกจนฝ่ามือหันไปข้างหน้า','ล็อกศอก กดไหล่ลง','ลำตัว hollow ขาชิดกัน'],
    prog:'พัฒนา: ค้างให้ได้ 30 วินาที แล้วเพิ่ม L-sit หรือ Ring Planche Lean'},
  falsegrip:{cues:['วางข้อมือบนห่วง ให้ห่วงพาดโคนฝ่ามือ','ห้อยตัวแขนเหยียด นิ้วโป้งพับทับ','การจับแบบนี้เป็นพื้นฐานของ muscle-up','ข้อมือและแขนท่อนล่างล้าเร็ว ทำเซ็ตสั้นๆ']},
  tucklever:{cues:['ห้อยจากห่วง แขนเหยียด','ดึงไหล่ลงและไปข้างหลัง ยกสะโพกขึ้น','หลังขนานพื้น พับเข่าแน่น','ห้ามงอศอก'],
    prog:'พัฒนา: advanced tuck → ยื่นขาข้างเดียว → กางขา → front lever เต็ม'},
  frontlever:{cues:['ลำตัวตรงขนานพื้น แขนเหยียด หน้าหงาย','กดไหล่ลงแรงๆ สะโพกระดับเดียวกับไหล่','เกร็งก้น ขาชิดกัน']},
  planchelean:{cues:['ท่าวิดพื้นด้านบนบนห่วง (หรือพื้น)','หมุนห่วงออก เอนไหล่ไปข้างหน้าเลยมือ','ลำตัวตรง เกร็งก้น ดันสะบักออก'],
    prog:'พัฒนา: เอนไกลขึ้น แล้วค่อยฝึก tuck planche บนพื้นหรือ parallettes'},
  germanhang:{warn:HOLD_WARN_TH, cues:['เริ่มจากห้อยกลับหัว (สะโพกอยู่เหนือหัว)','ลดสะโพกลง ปล่อยขาลงไปด้านหลัง','แขนเหยียดตรง ลงเท่าที่สบาย','ออกจากท่าทางเดิมที่เข้ามา']},
  tuckback:{warn:HOLD_WARN_TH, cues:['จาก German hang ยกสะโพกขึ้นจนลำตัวขนานพื้น หน้าคว่ำ','พับเข่า แขนเหยียด','เกร็งก้น ไม่ให้สะโพกตก'],
    prog:'พัฒนา: advanced tuck → ขาข้างเดียว → กางขา → back lever เต็ม'},
  skincat:{warn:HOLD_WARN_TH, cues:['ห้อยจากห่วง พับเข่าเข้าหาอก','หมุนตัวไปข้างหลัง สะโพกข้ามหัวเป็นท่าห้อยกลับหัว','ลงช้าๆ สู่ German hang เท่าที่สบาย','หมุนกลับอย่างควบคุม'],
    prog:'ฝึก dead hang และห้อยกลับหัวก่อน ทำท่านี้ให้คล่องก่อนฝึก back lever'},
  muscleup:{warn:'ท่าขั้นสูง ควรดึงข้อบนห่วงแบบ strict ได้ประมาณ 8 ครั้ง และ dip ลึกได้ 10 ครั้ง พร้อมจับ false grip ได้มั่นคงก่อน',
    cues:['เริ่มด้วย false grip','ดึงแบบระเบิดแรง ให้ห่วงมาถึงอกล่าง','ช่วงเปลี่ยนท่า เอนตัวข้ามห่วงไปข้างหน้า','ดันขึ้นจนแขนเหยียดในท่า support แล้วลงอย่างควบคุม']},
  flye:{warn:'เป็นแรงกดที่ไหล่และเอ็นหน้าแขนสูง เริ่มจากตั้งห่วงสูงและกางแขนแค่ช่วงสั้นๆ',
    cues:['ท่าแพลงก์บนห่วง แขนเหยียด งอศอกเล็กน้อย','กางแขนออกกว้าง ลำตัวยังเกร็งตรง','บีบอกดึงห่วงกลับมาชิดกัน']},
  bbbench:{cues:['เท้าวางมั่น บีบสะบักติดม้านั่ง','ลดบาร์ลงกลางอก ศอกประมาณ 45°','ดันขึ้นและเยื้องไปทางไหล่เล็กน้อย','น้ำหนักหนักควรมีคนช่วยหรือใช้แร็กกันตก']},
  dbbench:{cues:['ดัมเบลอยู่เหนืออก บีบสะบัก','ลดลงจนศอกต่ำกว่าม้านั่งเล็กน้อย','ดันขึ้นและเข้าหากันเล็กน้อย','น้ำหนักนับต่อข้าง']},
  machpress:{cues:['ปรับเบาะให้ด้ามจับอยู่ระดับกลางอก','ดันไปข้างหน้าโดยไม่ยักไหล่','คุมจังหวะตอนกลับ ไม่ปล่อยให้น้ำหนักกระแทก']},
  floorpush:{cues:['มืออยู่ใต้ไหล่ ลำตัวเป็นเส้นตรง','ลดอกลงหาพื้น ศอกประมาณ 45°','ดันกลับขึ้น ไม่ให้สะโพกตก']},
  dbshoulder:{cues:['ดัมเบลระดับไหล่ กดซี่โครงลง','ดันขึ้นตรงจนแขนเหยียด','ลงอย่างควบคุม ไม่แอ่นหลังล่าง','น้ำหนักนับต่อข้าง']},
  machshoulder:{cues:['ปรับเบาะให้ด้ามจับเริ่มที่ระดับไหล่','ดันขึ้นโดยไม่ล็อกศอกแรง','คุมจังหวะตอนลง']},
  bbohp:{cues:['บาร์อยู่ระดับไหปลาร้า เกร็งก้นและหน้าท้อง','ดันขึ้นตรง ศีรษะลอดผ่านช่วงบน','ไม่เอนหลัง กดซี่โครงลง']},
  lateral:{cues:['งอศอกเล็กน้อย ยกแขนออกด้านข้างถึงระดับไหล่','นำด้วยศอก ไม่เหวี่ยง','ลงช้าๆ','น้ำหนักนับต่อข้าง']},
  pushdown:{cues:['ศอกแนบลำตัว','กดลงจนแขนเหยียดตรง','ให้มือขึ้นแค่ระดับอก']},
  dbtriext:{cues:['ถือดัมเบลลูกเดียวด้วยสองมือเหนือหัว','ลดลงไปหลังศีรษะ ศอกชี้ไปข้างหน้า','เหยียดจนแขนตรง']},
  latpull:{cues:['จับกว้างกว่าไหล่เล็กน้อย','ดึงบาร์มาที่อกบน ศอกลงและไปข้างหลัง','คุมบาร์ตอนกลับขึ้น ไหล่ยังกดลง']},
  cablerow:{cues:['นั่งตัวตรง เอนได้เล็กน้อย','ดึงด้ามจับมาที่ท้อง บีบสะบัก','ปล่อยแขนเหยียดอย่างควบคุม']},
  bbrow:{cues:['พับสะโพกไปข้างหน้า หลังตรง บาร์ต่ำกว่าเข่า','ดึงบาร์มาที่ซี่โครงล่าง','ไม่กระชากด้วยหลังล่าง','ใช้น้ำหนักเบาจนพับสะโพกได้มั่นคง']},
  dbrow:{cues:['มือและเข่าวางบนม้านั่ง (หรือพับสะโพกสองมือ) หลังตรง','ดึงดัมเบลมาที่สะโพก ศอกชิดลำตัว','ลงจนสุด ไม่บิดตัว','น้ำหนักนับต่อข้าง']},
  pullupbar:{cues:['ห้อยแขนเหยียด ไหล่ตึง','ดึงอกขึ้นหาบาร์','ลงจนสุดอย่างควบคุม','ง่ายขึ้น: เครื่อง assisted pull-up หรือยางช่วย']},
  cablefacepull:{cues:['ตั้งเคเบิลระดับหน้า ใช้ด้ามเชือก','ดึงมาทางหน้า ศอกสูงและกว้าง','ค้างแล้วบีบไหล่หลัง']},
  dbcurl:{cues:['ศอกแนบลำตัว','งอแขนขึ้นโดยไม่เหวี่ยงตัว','ลงช้าๆ จนแขนเหยียด','น้ำหนักนับต่อข้าง']},
  bbsquat:{cues:['บาร์วางบนหลังบน เท้ากว้างประมาณไหล่','เกร็งท้อง นั่งลงไปข้างหลัง','เข่าชี้ตามปลายเท้า ลึกตามที่ร่างกายทำได้','ใช้ safety bar หรือคนช่วย ค่อยๆ เพิ่มน้ำหนัก']},
  goblet:{cues:['ถือดัมเบลลูกเดียวที่อก','นั่งลงระหว่างเข่า อกตั้ง','ดันขึ้นด้วยเท้าทั้งฝ่า']},
  legpress:{cues:['เท้ากว้างประมาณไหล่ วางกลางแท่น','ลงจนเข่าประมาณ 90° และสะโพกยังติดเบาะ','ดันขึ้นโดยไม่ล็อกเข่า']},
  legext:{cues:['เบาะรองอยู่ที่หน้าแข้งล่าง หลังพิงเบาะ','เหยียดขาจนตรง บีบต้นขาหน้า','ลงช้าๆ']},
  legcurl:{cues:['กดสะโพกติดเบาะ','งอเข่าดึงส้นเท้าเข้าหาก้น','ลงช้าๆ ไม่ปล่อยน้ำหนักตก']},
  rdl:{cues:['เข่างอเล็กน้อย ดันสะโพกไปข้างหลัง','บาร์เลื่อนตามต้นขา หลังตรง','หยุดเมื่อตึงต้นขาหลัง แล้วดันสะโพกกลับมาข้างหน้า']},
  dbsplit:{cues:['เท้าหลังวางบนม้านั่ง เท้าหน้าห่างพอ','ลงจนเข่าหลังเกือบแตะพื้น','ดันขึ้นด้วยส้นเท้าขาหน้า','น้ำหนักนับต่อข้าง']},
  hipthrust:{cues:['หลังบนพิงม้านั่ง บาร์อยู่บนสะโพก (มีแผ่นรอง)','ดันสะโพกขึ้นจนลำตัวขนานพื้น','ก้มคางเล็กน้อย บีบก้นด้านบน']},
  hangleg:{cues:['ห้อยแขนเหยียด ไหล่ตึง','ยกขาขึ้น (เริ่มแบบงอเข่า) โดยไม่แกว่ง','ลงช้าๆ']},
  plank:{cues:['ศอกอยู่ใต้ไหล่ ลำตัวเป็นเส้นตรง','เกร็งก้นและหน้าท้อง ไม่ตกหรือโก่ง','หายใจสม่ำเสมอ']},
  slrdl:{cues:['ยืนขาเดียว งอเข่าเล็กน้อย','พับสะโพก ขาอีกข้างยื่นไปข้างหลังเป็นแนวเดียวกับลำตัว','สะโพกตรง หลังตรง','ยืนกลับขึ้นด้วยการบีบก้นขาที่ยืน']},
  calfraise:{cues:['ปลายเท้าวางบนขั้นบันไดหรือพื้น','เขย่งให้สูงที่สุด ค้างด้านบน','ลงช้าๆ ถ้าทำบนขั้นให้ส้นเท้าต่ำกว่าขั้น']},
  machcalf:{cues:['ไหล่อยู่ใต้เบาะ ปลายเท้าบนแท่น','เขย่งให้สูงที่สุด ค้างไว้','ลงช้าๆ จนยืดสุด']},
  trxrow:{cues:['ปรับสายสั้น เอนตัวไปข้างหลัง แขนเหยียด ฝ่ามือหันเข้าหากัน','ลำตัวเป็นเส้นตรง ส้นเท้าติดพื้น','ดึงอกเข้าหาด้ามจับ บีบสะบัก','เดินเท้าไปข้างหน้าเพื่อให้ยากขึ้น']},
  trxpush:{cues:['หันหลังให้จุดยึด แขนเหยียดตรงระดับอก','เอนตัวเป็นแพลงก์ ลดอกลงระหว่างมือ','อย่าให้สายถูแขน','เดินเท้าถอยเข้าหาจุดยึดเพื่อให้ยากขึ้น']},
  trxsquat:{cues:['หันหน้าเข้าจุดยึด ถือด้ามจับระดับอก','นั่งลงไปข้างหลัง ใช้สายแค่ช่วยทรงตัว','ดันขึ้นด้วยเท้าทั้งฝ่า']},
  trxlunge:{cues:['หันหลังให้จุดยึด เท้าหลังวางในที่รองเท้า','ย่อลงตรงๆ จนต้นขาหน้าเกือบขนานพื้น','เข่าหน้าชี้ตามปลายเท้า ดันขึ้นด้วยส้นเท้าหน้า']},
  trxhamcurl:{cues:['นอนหงาย ส้นเท้าในที่รองเท้าใต้จุดยึด','ยกสะโพกเป็นสะพาน','งอเข่าดึงส้นเท้าหาก้น สะโพกยังยก','เหยียดกลับช้าๆ']},
  trxcurl:{cues:['หันหน้าเข้าจุดยึด เอนหลัง แขนเหยียด หงายมือ','งอแขนดึงมือมาทางหน้าผาก ศอกอยู่สูง','ลงอย่างควบคุม ลำตัวเกร็ง']},
  trxface:{cues:['หันหน้าเข้าจุดยึด เอนหลัง แขนเหยียด','ดึงด้ามจับมาทางหน้า ศอกสูงและกว้าง','ค้างแล้วบีบไหล่หลัง']},
  trxtricep:{cues:['หันหลังให้จุดยึด แขนเหยียดเหนือหัว เอนตัวไปข้างหน้า','งอเฉพาะศอก มือมาทางหน้าผาก','เหยียดแขนสุด ลำตัวเกร็ง']},
  trxfallout:{cues:['หันหลังให้จุดยึด แขนเหยียดไปข้างหน้า','เอนตัวไปข้างหน้าพร้อมยกแขนขึ้นเหนือหัว ลำตัวยังตรง','หยุดก่อนหลังล่างแอ่น ดึงกลับด้วยหน้าท้อง']},
  trxpike:{cues:['เท้าวางในที่รองเท้า เริ่มจากแพลงก์แขนเหยียด','ยกสะโพกขึ้นหาเพดาน ขาเหยียด','ลดกลับเป็นแพลงก์ตรงอย่างควบคุม']},
  wheelknee:{cues:['คุกเข่า ล้ออยู่ใต้ไหล่ เกร็งก้น','กลิ้งไปข้างหน้าเท่าที่หลังล่างยังตรง','ดึงกลับด้วยหน้าท้อง ไม่พับสะโพกก่อน','ใช้เบาะรองเข่า']},
  wheelstand:{warn:'หนักมากสำหรับหลังล่าง ทำ rollout จากเข่าให้ได้ 3 เซ็ต × 12 ก่อน',
    cues:['เริ่มจากยืน พับตัวลงจับล้อ','กลิ้งออกจนลำตัวเกือบตรง หลังตรง','ดึงกลับด้วยหน้าท้อง']}
};

// ---- sound + bodyweight (calisthenics) additions
Object.assign(STR.en, {
  home_sub:'Rings, TRX, bodyweight & gym tracker', v_cali:'Bodyweight',
  ob_where_note:'Rings or TRX at home, bodyweight (floor + pull-up bar), or a gym. Every exercise can be swapped for one that trains the same muscles.',
  up_next:'Up next', set_n:'Set {0}', v_go:'Rest over. {0}, go!', v_rest_over:'Rest over', v_done:'Workout done. Great job!',
  v_level:'Level up!', v_hold:'Time!',
  snd_title:'Sound', snd_sfx:'Sound effects', snd_sfx_note:'Set logged, countdown ticks in the last 3 seconds of rest, a "go" chime when rest is over, and a fanfare when you finish.',
  snd_vol:'Volume', vol_low:'Low', vol_mid:'Medium', vol_high:'High',
  snd_voice:'Voice cues', snd_voice_note:'Speaks short cues such as "Rest over. Set 2, go!" using the phone\'s built-in voice.', snd_voice_lang:'Voice language',
  snd_vib:'Vibration', snd_music:'Workout music',
  mus_chill:'Chill', mus_focus:'Focus', mus_power:'Power',
  snd_music_note:'A simple beat generated by the app, works offline. It pauses when the screen is off. For real songs, play Spotify or YouTube Music alongside and keep this off. On some iPhones the app sounds briefly lower other music, and the ring/silent switch can mute app sounds.',
  snd_try:'Try the sounds', try_rest:'Rest over', try_done:'Workout done', try_voice:'Voice', try_music:'Music (12s)'
});
Object.assign(STR.th, {
  home_sub:'บันทึกการซ้อม ห่วง TRX บอดี้เวท และยิม', v_cali:'บอดี้เวท',
  ob_where_note:'ห่วงหรือ TRX ที่บ้าน บอดี้เวท (พื้น + บาร์โหน) หรือที่ยิม ทุกท่าสลับเป็นท่าอื่นที่ใช้กล้ามเดียวกันได้',
  up_next:'ต่อไป', set_n:'เซ็ตที่ {0}', v_go:'หมดเวลาพัก {0} ลุย!', v_rest_over:'หมดเวลาพัก', v_done:'ซ้อมเสร็จแล้ว เก่งมาก',
  v_level:'ผ่านขั้นแล้ว เยี่ยม!', v_hold:'ครบเวลาแล้ว',
  snd_title:'เสียง', snd_sfx:'เสียงเอฟเฟกต์', snd_sfx_note:'เสียงตอนบันทึกเซ็ต เสียงนับถอยหลัง 3 วินาทีสุดท้ายของการพัก เสียงเริ่มเมื่อหมดเวลาพัก และเสียงฉลองเมื่อซ้อมเสร็จ',
  snd_vol:'ระดับเสียง', vol_low:'เบา', vol_mid:'กลาง', vol_high:'ดัง',
  snd_voice:'เสียงพูดบอก', snd_voice_note:'พูดสั้นๆ เช่น "Rest over. Set 2, go!" ด้วยเสียงอ่านของมือถือ ค่าเริ่มต้นเป็นภาษาอังกฤษเพราะฟังเป็นธรรมชาติกว่า', snd_voice_lang:'ภาษาเสียงพูด',
  snd_vib:'การสั่น', snd_music:'เพลงระหว่างซ้อม',
  mus_chill:'ชิล', mus_focus:'โฟกัส', mus_power:'พลัง',
  snd_music_note:'เป็นจังหวะที่แอปสร้างขึ้นเอง ใช้ออฟไลน์ได้ และจะหยุดเมื่อปิดหน้าจอ ถ้าอยากฟังเพลงจริง เปิด Spotify หรือ YouTube Music คู่กัน แล้วปิดเพลงในแอปไว้ บาง iPhone เสียงแอปอาจทำให้เพลงอื่นเบาลงชั่วครู่ และสวิตช์ปิดเสียงอาจปิดเสียงแอปด้วย',
  snd_try:'ลองฟังเสียง', try_rest:'หมดเวลาพัก', try_done:'ซ้อมเสร็จ', try_voice:'เสียงพูด', try_music:'เพลง (12 วินาที)'
});
Object.assign(LADTH, {'Bar pull-up path':'เส้นทางดึงข้อบนบาร์', 'Dip path':'เส้นทาง Dip', 'Handstand path':'เส้นทางตั้งศอก/Handstand'});
Object.assign(EXTH, {
  australian:{cues:['บาร์ต่ำระดับสะโพก ห้อยตัวอยู่ใต้บาร์ แขนเหยียด','ลำตัวตรงตั้งแต่ส้นเท้าถึงหัว','ดึงอกขึ้นหาบาร์ บีบสะบัก','งอเข่าให้ง่ายขึ้น ยกเท้าสูงให้ยากขึ้น']},
  negbar:{cues:['กระโดดหรือเหยียบขึ้นให้คางพ้นบาร์','ลดตัวลงให้ช้าที่สุด ตั้งเป้า 4-5 วินาที','ลงจนแขนเหยียดสุด','กดไหล่ลง ไม่ยักไหล่']},
  chinup:{cues:['หงายฝ่ามือเข้าหาตัว จับกว้างเท่าไหล่','ดึงจนคางพ้นบาร์','ลงจนสุดอย่างควบคุม']},
  bardip:{cues:['เริ่มจากแขนเหยียดล็อกบนบาร์คู่ กดไหล่ลง','เอนตัวไปข้างหน้าเล็กน้อย ลงจนไหล่ต่ำกว่าศอกเล็กน้อย','ดันกลับขึ้นจนแขนเหยียด','ง่ายขึ้น: dip บนม้านั่ง หรือฝึกลงช้าๆ']},
  diamond:{cues:['มือชิดกันใต้อก นิ้วโป้งและนิ้วชี้แตะกันเป็นรูปเพชร','ศอกชิดลำตัว','ลดอกลงหามือ แล้วดันขึ้น','ง่ายขึ้น: ทำจากเข่า']},
  bwsquat:{cues:['เท้ากว้างประมาณไหล่ ปลายเท้าแบะออกเล็กน้อย','นั่งลงไปข้างหลัง อกตั้ง ยื่นแขนไปข้างหน้าช่วยทรงตัว','ลงให้ลึกเท่าที่หลังยังตรง แล้วดันขึ้น']},
  revlunge:{cues:['ก้าวเท้าหนึ่งไปข้างหลัง ย่อจนเข่าทั้งสองประมาณ 90°','เข่าหน้าอยู่เหนือเท้า ลำตัวตั้งตรง','ดันส้นเท้าหน้าเพื่อยืนกลับ']},
  glutebridge:{cues:['นอนหงาย งอเข่า เท้าวางราบ','ดันสะโพกขึ้นจนลำตัวตรงจากเข่าถึงไหล่','บีบก้นด้านบน แล้วลงช้าๆ','ยากขึ้น: ทำขาเดียว']},
  handstand:{warn:'ฝึกวิธีลงให้ปลอดภัยก่อน (หมุนตัวออกด้านข้าง หรือค่อยๆ เดินเท้าลง) หยุดถ้าเจ็บข้อมือหรือไหล่',
    cues:['มือกว้างประมาณไหล่ ห่างกำแพงประมาณหนึ่งฝ่ามือ','เตะขาขึ้น หรือเดินเท้าขึ้นกำแพง','ดันพื้นออก แขนล็อก ซี่โครงเก็บ','เริ่มจากค้างสั้นๆ แล้วค่อยเพิ่ม']}
});

Object.assign(STR.en, {
  snd_theme:'Sound style', th_classic:'Classic', th_arcade:'8-bit game', th_coach:'Coach',
  snd_events:'Pick a style, or choose the sound for each moment. ▶ to listen.',
  ev_go:'Rest over', ev_log:'Set logged', ev_exdone:'All sets done', ev_finish:'Workout done', ev_level:'Level up / PR',
  var_chime:'Chime', var_arcade:'8-bit', var_whistle:'Whistle', var_bell:'Boxing bell', var_brass:'Fanfare', var_sparkle:'Sparkle',
  var_pop:'Pop', var_blip:'8-bit blip', var_click:'Click'
});
Object.assign(STR.th, {
  snd_theme:'สไตล์เสียง', th_classic:'คลาสสิก', th_arcade:'เกม 8-bit', th_coach:'โค้ช',
  snd_events:'เลือกสไตล์สำเร็จรูป หรือเลือกเสียงแยกตามแต่ละช่วง กด ▶ เพื่อลองฟัง',
  ev_go:'หมดเวลาพัก', ev_log:'บันทึกเซ็ต', ev_exdone:'ครบทุกเซ็ต', ev_finish:'ซ้อมเสร็จ', ev_level:'ผ่านขั้น / สถิติใหม่',
  var_chime:'กริ๊ง', var_arcade:'เกม 8-bit', var_whistle:'นกหวีด', var_bell:'ระฆังมวย', var_brass:'แตรฉลอง', var_sparkle:'วิบวับ',
  var_pop:'ป๊อป', var_blip:'บี๊บ 8-bit', var_click:'คลิก'
});

Object.assign(STR.en, {
  wake_title:'Keep screen on during workouts', rest_late:'Rest ended {0}s ago',
  wake_note:'Stops the screen from turning off while a workout is open, so the rest alarm rings on time. Uses a bit more battery. If you leave the app anyway, the timer stays correct and alerts you as soon as you come back.'
});
Object.assign(STR.th, {
  wake_title:'ให้จอเปิดค้างระหว่างซ้อม', rest_late:'หมดเวลาพักไปแล้ว {0} วินาที',
  wake_note:'จอจะไม่ดับเองระหว่างเปิดหน้าซ้อม เสียงเตือนพักจึงดังตรงเวลา กินแบตเพิ่มนิดหน่อย ถ้าออกจากแอปไป ตัวจับเวลายังนับถูก และจะเตือนทันทีที่กลับเข้าแอป'
});

Object.assign(STR.en, {
  notif_title:'PieFit · Rest over', export_fail:'Could not share the backup file.',
  apk_title:'Android app', apk_get:'Download the Android app (APK)',
  apk_note:'The Android app can alert you when rest is over even with the screen off. Download, open the file, and allow "Install unknown apps" for your browser if asked. Your data here does not move automatically: Export here, then Import in the app.',
  apk_update:'To update, download the latest APK and install it over this one. Your data is kept.'
});
Object.assign(STR.th, {
  notif_title:'PieFit · หมดเวลาพัก', export_fail:'แชร์ไฟล์สำรองไม่สำเร็จ',
  apk_title:'แอป Android', apk_get:'ดาวน์โหลดแอป Android (APK)',
  apk_note:'แอป Android เตือนหมดเวลาพักได้แม้ปิดจออยู่ ดาวน์โหลดแล้วเปิดไฟล์ ถ้าเครื่องถาม ให้อนุญาต "ติดตั้งแอปที่ไม่รู้จัก" สำหรับเบราว์เซอร์ ข้อมูลในเว็บจะไม่ย้ายไปเอง ให้ Export ที่นี่ แล้ว Import ในแอป',
  apk_update:'อัปเดต: ดาวน์โหลด APK ล่าสุดแล้วติดตั้งทับได้เลย ข้อมูลยังอยู่'
});
