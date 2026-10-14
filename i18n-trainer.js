'use strict';
/* PieFit translations for the personal-trainer features: readiness, effort, weekly plan, time budget, routines,
   deload, review, goals, body log, form check and the AI coach. */
Object.assign(STR.en, {
  cancel:'Cancel',
  ar_shoulder:'Shoulder', ar_elbow:'Elbow', ar_wrist:'Wrist', ar_lowerback:'Lower back', ar_knee:'Knee', ar_hip:'Hip',
  ck_title:'How do you feel today?', ck_sub:'Takes 5 seconds. The plan adapts to your answers.',
  ck_sleep:'Sleep last night', ck_sleep0:'Poor', ck_sleep1:'OK', ck_sleep2:'Good',
  ck_energy:'Energy', ck_en0:'Low', ck_en1:'Normal', ck_en2:'High',
  ck_sore:'Muscle soreness', ck_so0:'Very sore', ck_so1:'A bit', ck_so2:'None',
  ck_pain:'Any joint pain today? (exercises that load it will be swapped)', ck_go:'Start', ck_skip:'Skip check-in',
  ck_swapped:'Swapped exercises to protect: {0}',
  rpe_q:'How hard was this set?', rpe_1:'Easy', rpe_2:'OK', rpe_3:'Hard', rpe_4:'Failure', rpe_edit:'Effort 1-4 (1 easy, 2 ok, 3 hard, 4 failure)',
  sg_hard_keep:'You hit the top of the range, but some sets were to failure. Keep this weight until it feels controlled.',
  sg_easy_add:'Last time felt easy on every set. Add {0} kg.',
  sg_bw_hard:'All sets at the top, but you went to failure. Repeat this until it feels controlled.',
  sg_bw_easy:'Last time felt easy. Aim for two more reps.',
  sg_deload:'Deload week:', sg_lowday:'Easy day:', sg_plateau:'No progress in the last 3 sessions: try a variation (Swap) or slower reps.',
  tag_deload:'🛌 Deload', tag_low:'🌙 Easy day', tag_high:'⚡ Feeling strong',
  tb_title:'Time available', tb_any:'Any', tb_est:'≈ {0} min', tb_superset:'Superset', tb_sets:'2 sets per exercise', tb_drop:'some exercises left out',
  rt_warm:'Warm-up', rt_cool:'Cool-down', rt_skip:'Skip', rt_start:'Start', rt_done:'Done',
  pl_title:'Weekly plan', pl_sub:'Your training days, place and time', pl_intro:'Pick your training days. The app rotates sessions and moves missed ones to the next day.',
  pl_train:'Train', pl_rest:'Rest', pl_rotation:"This week's rotation", pl_none:'No training days yet.',
  pl_rot_note:'Sessions are done in this order. If you miss a day, the next one moves forward.', pl_toomany:'7 days a week leaves no rest day. Consider 4-6.',
  pl_today:'Planned for today', pl_missed:'Catch up: {0} missed this week', pl_done_today:"Today's workout is done",
  pl_next:'Next: {0}', pl_week_done:'All planned workouts done this week',
  dl_title:'Time for a deload week?', dl_weeks:'You have trained {0} weeks in a row. A lighter week (fewer sets, about 15% less weight) helps you recover and come back stronger.',
  dl_tired:'Your check-ins show low readiness several times this week. A lighter week may help.',
  dl_stall:'{0} exercises have stopped progressing. A lighter week often breaks a plateau.',
  dl_start:'Start a deload week', dl_stop:'End', dl_on:'Deload week until {0}', dl_session:'Deload week: 2 sets per exercise and lighter weights.',
  in_title:'Coach', in_more:'Weekly review', in_deload_on:'Deload week is on until {0}. Train light and sleep well.',
  in_gap:'{0} days since your last workout. Even a short session keeps the habit going.',
  in_pr:'New best this week: {0}', in_morepull:'You did more pushing ({0} sets) than pulling ({1}). Add some rows or pull-ups for healthy shoulders.',
  in_morepush:'Pulling ({1} sets) is well ahead of pushing ({0}). Balance it with some pressing.',
  in_plateau:'{0} has not improved in 3 sessions. Try a variation or a different rep range.',
  in_failure:'Many sets went to failure this week. Stopping 1-2 reps short usually gives better progress and recovery.',
  in_easy:'Most sets felt easy this week. You are ready for more weight or harder variations.',
  in_lag:"Behind on this week's target: {0}", in_goal_behind:'Goal "{0}" is behind schedule.',
  in_tired:'Readiness has been low lately. Prioritise sleep and keep sessions shorter.',
  in_good:'You are on track. Keep going!', in_start:'Start with the calibration test, then your first workout.',
  p_review:'Review', p_goals:'Goals', p_body:'Body',
  rv_workouts:'workouts', rv_vs:'Previous 7 days: {0} workouts · {1} sets · {2} kg', rv_plan:'Weekly plan', rv_plan_n:'{0} of {1} planned workouts done',
  rv_balance:'Push / pull balance', rv_balance_n:'Push {0} sets · Pull {1} sets', rv_ready:'Readiness', rv_ready_n:'Average {0} of 6 from {1} check-ins',
  rv_prs:'New bests', rv_coach:'Coach notes',
  gl_intro:'Set a target with a date. The app tracks your best in the last 4 weeks and estimates when you will get there.',
  gl_none:'No goals yet.', gl_add:'Add a goal', gl_pick:'Goal exercise', gl_pick_hint:'Pick the exercise for this goal',
  gl_t_reps:'Target reps in one set', gl_t_hold:'Target seconds', gl_t_weight:'Target weight (kg)', gl_t_wreps:'For how many reps', gl_deadline:'Deadline',
  gl_save:'Save goal', gl_bad:'Enter a target and a future date', gl_del:'Delete this goal?', gl_target:'Target', gl_by:'by', gl_now:'Now',
  gl_eta:'at this pace ≈ {0}', gl_done:'Reached', gl_ontrack:'On track', gl_behind:'Behind', gl_late:'Past deadline', gl_early:'Too early to tell',
  pf_title:'Body profile & limitations', pf_sub:'Injuries, joints to protect, warm-up', pf_intro:'Mark joints that need care. Sessions swap out exercises that put a lot of stress on them.',
  pf_limits:'Protect these joints', pf_limits_note:'For today-only pain, use the check-in before a workout instead.',
  pf_avoided:'Exercises that will be swapped', pf_routine:'Warm-up and cool-down', pf_swapped:'Swapped to protect {0}', pf_dropped:'left out',
  pf_disclaimer:'This is not medical advice. For pain that is sharp, lasting or getting worse, see a doctor or physiotherapist.',
  bd_add:'Add measurement', bd_weight:'Weight', bd_waist:'Waist', bd_save:'Save', bd_saved:'Saved', bd_empty:'Enter weight or waist',
  bd_nodata:'No data yet', bd_change:'{0} over {1} days', bd_history:'History', bd_photos:'Progress photos',
  bd_photo_note:'Photos stay on this phone only. They are not included in backups. Same place, light and pose each time makes comparing easier.',
  bd_photo_add:'Take or add a photo', bd_photo_saved:'Photo saved', bd_photo_fail:'Could not save the photo', bd_compare:'Compare two photos',
  bd_nophoto:'No photos yet.', bd_need2:'Add at least 2 photos to compare', bd_pick1:'Tap the first photo', bd_pick2:'Now tap the second photo',
  fc_btn:'Form check', fc_auto:'Records your set, counts reps and checks your form on this phone. Nothing is uploaded.',
  fc_manual_only:'Automatic checks are not available for this exercise yet. You can record, replay in slow motion and use the checklist.',
  fc_setup:'How to place the phone', fc_tip1:'Side view, 2-3 m away, phone at about hip height', fc_tip2:'Your whole body must be in the frame for the whole set',
  fc_tip3:'Good light, plain background. Swinging rings or baggy clothes can confuse the detection',
  fc_camera:'Camera', fc_file:'Video file', fc_start:'Start recording', fc_stop:'Stop', fc_loading:'Loading the pose model (first time only, about 10 MB)…',
  fc_loadfail:'Could not load the pose model. Recording and replay still work.', fc_offline:'Offline: the pose model is downloaded the first time you use it.',
  fc_nocam:'No camera access. Allow the camera for this site, or use a video file.', fc_nobody:'Step back so your whole body is visible',
  fc_goodrep:'good rep', fc_reps_res:'{0} reps counted · {1} with good form', fc_hold_res:'{0}s in good position (of {1}s)', fc_norep:'No full reps detected.',
  fc_accuracy:'Automatic checks are an estimate. Use them as a helper, together with the replay.',
  fc_use:'Use {0} in the log', fc_used:'Value filled in. Check it, then log the set.', fc_replay:'Replay', fc_frame:'frame', fc_save:'Save video to this phone',
  fc_check:'Check yourself', fc_again:'Record again',
  fi_depth:'go lower', fi_lock:'not fully extended', fi_sag:'hips sagging', fi_pike:'hips too high', fi_lean:'leaning forward a lot',
  fi_chin:'chin not over the bar', fi_top:'pull higher', fi_squeeze:'pull further', fi_hold_bad:'position breaking',
  fv_depth:'Lower', fv_lock:'Lock out', fv_sag:'Hips up', fv_pike:'Hips down', fv_lean:'Chest up', fv_chin:'Chin over', fv_top:'Higher', fv_squeeze:'Further',
  ai_title:'AI coach', ai_sub_on:'Ask about your training', ai_sub_off:'Optional: uses your own Claude API key',
  ai_setup:'The AI coach uses Claude Haiku with your own Anthropic API key. Each question costs a fraction of a cent on your account. Create a key at console.anthropic.com and set a monthly spend limit there.',
  ai_consent:'I understand that my training summary (sets, weights, check-ins, goals, body weight) is sent to Anthropic with each question. Photos and videos are never sent.',
  ai_enable:'Save key and turn on', ai_badkey:'That does not look like an Anthropic API key (sk-ant-…)', ai_need_consent:'Tick the box to continue',
  ai_hello:'Ask anything about your training. The coach sees your last 4 weeks.', ai_placeholder:'Ask your coach…',
  ai_privacy:'The key is stored only on this phone and is not included in backups. Your training summary is sent to Anthropic with each question.',
  ai_clear:'Clear chat', ai_off:'Remove key', ai_off_confirm:'Remove the API key from this phone?', ai_ask:'Ask', ai_review:'Ask the AI coach about this week',
  ai_q_week:'How did my training go this week, and what should I focus on next week?', ai_q_next:'What should I do in my next workout?',
  ai_q_stuck:'Which exercise is stuck and how do I get it moving again?', ai_q_form:'Give me 3 technique tips for my main exercises.',
  ai_err_key:'The API key was rejected. Check it in More → AI coach.', ai_err_rate:'Too many requests right now. Try again in a minute.',
  ai_err_net:'No internet connection.', ai_err_api:'The AI service returned an error ({0}). Try again later.', ai_err_load:'Could not reach the AI service.',
  ai_err_refusal:'The coach could not answer that one. Try asking differently.'
});
Object.assign(STR.th, {
  cancel:'ยกเลิก',
  ar_shoulder:'ไหล่', ar_elbow:'ศอก', ar_wrist:'ข้อมือ', ar_lowerback:'หลังล่าง', ar_knee:'เข่า', ar_hip:'สะโพก',
  ck_title:'วันนี้รู้สึกยังไง?', ck_sub:'ใช้เวลา 5 วินาที แผนจะปรับตามคำตอบ',
  ck_sleep:'เมื่อคืนนอนหลับ', ck_sleep0:'แย่', ck_sleep1:'พอได้', ck_sleep2:'ดี',
  ck_energy:'พลังงาน', ck_en0:'ต่ำ', ck_en1:'ปกติ', ck_en2:'เต็มที่',
  ck_sore:'ปวดเมื่อยกล้าม', ck_so0:'ปวดมาก', ck_so1:'นิดหน่อย', ck_so2:'ไม่ปวด',
  ck_pain:'วันนี้เจ็บข้อต่อไหม? (ท่าที่ลงน้ำหนักตรงนั้นจะถูกสลับ)', ck_go:'เริ่ม', ck_skip:'ข้ามการเช็ก',
  ck_swapped:'สลับท่าเพื่อเลี่ยง: {0}',
  rpe_q:'เซ็ตนี้หนักแค่ไหน?', rpe_1:'ง่าย', rpe_2:'พอดี', rpe_3:'หนัก', rpe_4:'หมดแรง', rpe_edit:'ความหนัก 1-4 (1 ง่าย, 2 พอดี, 3 หนัก, 4 หมดแรง)',
  sg_hard_keep:'ทำได้ถึงจำนวนสูงสุด แต่บางเซ็ตหมดแรง ใช้น้ำหนักนี้ต่อจนกว่าจะคุมได้สบาย',
  sg_easy_add:'ครั้งก่อนง่ายทุกเซ็ต เพิ่ม {0} kg',
  sg_bw_hard:'ทำได้สูงสุดทุกเซ็ต แต่หมดแรง ทำแบบนี้ซ้ำจนกว่าจะคุมได้สบาย',
  sg_bw_easy:'ครั้งก่อนง่าย ตั้งเป้าเพิ่มอีก 2 ครั้ง',
  sg_deload:'สัปดาห์พักฟื้น:', sg_lowday:'วันเบา:', sg_plateau:'3 ครั้งล่าสุดไม่พัฒนา ลองท่าแบบอื่น (สลับท่า) หรือทำช้าลง',
  tag_deload:'🛌 สัปดาห์พักฟื้น', tag_low:'🌙 วันเบา', tag_high:'⚡ วันพร้อม',
  tb_title:'เวลาที่มี', tb_any:'ไม่จำกัด', tb_est:'≈ {0} นาที', tb_superset:'ซูเปอร์เซ็ต', tb_sets:'ท่าละ 2 เซ็ต', tb_drop:'ตัดบางท่าออก',
  rt_warm:'วอร์มอัพ', rt_cool:'คูลดาวน์', rt_skip:'ข้าม', rt_start:'เริ่ม', rt_done:'เสร็จ',
  pl_title:'แผนรายสัปดาห์', pl_sub:'วันซ้อม ที่ซ้อม และเวลา', pl_intro:'เลือกวันที่ซ้อม แอปจะหมุนเวียนเซสชันให้ ถ้าขาดวันไหนก็เลื่อนไปวันถัดไป',
  pl_train:'ซ้อม', pl_rest:'พัก', pl_rotation:'ลำดับเซสชันสัปดาห์นี้', pl_none:'ยังไม่ได้เลือกวันซ้อม',
  pl_rot_note:'ทำตามลำดับนี้ ถ้าขาดวัน เซสชันถัดไปจะเลื่อนขึ้นมา', pl_toomany:'ซ้อม 7 วันไม่มีวันพัก แนะนำ 4-6 วัน',
  pl_today:'แผนวันนี้', pl_missed:'ตามให้ทัน: ขาดไป {0} ครั้งสัปดาห์นี้', pl_done_today:'ซ้อมวันนี้เสร็จแล้ว',
  pl_next:'ครั้งต่อไป: {0}', pl_week_done:'ซ้อมครบตามแผนสัปดาห์นี้แล้ว',
  dl_title:'ถึงเวลาสัปดาห์พักฟื้นหรือยัง?', dl_weeks:'คุณซ้อมติดกันมา {0} สัปดาห์ สัปดาห์เบา (เซ็ตน้อยลง น้ำหนักลดประมาณ 15%) ช่วยให้ร่างกายฟื้นตัวและกลับมาแรงขึ้น',
  dl_tired:'การเช็กความพร้อมสัปดาห์นี้ต่ำหลายครั้ง สัปดาห์เบาอาจช่วยได้',
  dl_stall:'มี {0} ท่าที่หยุดพัฒนา สัปดาห์เบามักช่วยให้ผ่านจุดตันได้',
  dl_start:'เริ่มสัปดาห์พักฟื้น', dl_stop:'จบ', dl_on:'สัปดาห์พักฟื้นถึง {0}', dl_session:'สัปดาห์พักฟื้น: ท่าละ 2 เซ็ต และน้ำหนักเบาลง',
  in_title:'โค้ช', in_more:'สรุปรายสัปดาห์', in_deload_on:'สัปดาห์พักฟื้นถึง {0} ซ้อมเบาๆ และนอนให้พอ',
  in_gap:'ห่างจากการซ้อมครั้งล่าสุด {0} วันแล้ว ซ้อมสั้นๆ ก็ช่วยรักษานิสัยได้',
  in_pr:'สถิติใหม่สัปดาห์นี้: {0}', in_morepull:'สัปดาห์นี้ดัน ({0} เซ็ต) มากกว่าดึง ({1}) เพิ่มท่า row หรือดึงข้อเพื่อสุขภาพหัวไหล่',
  in_morepush:'ดึง ({1} เซ็ต) มากกว่าดัน ({0}) ค่อนข้างเยอะ เพิ่มท่าดันให้สมดุล',
  in_plateau:'{0} ไม่พัฒนามา 3 ครั้ง ลองท่าแบบอื่นหรือเปลี่ยนช่วงจำนวนครั้ง',
  in_failure:'สัปดาห์นี้หลายเซ็ตทำจนหมดแรง หยุดก่อนหมดแรง 1-2 ครั้งมักพัฒนาและฟื้นตัวดีกว่า',
  in_easy:'สัปดาห์นี้ส่วนใหญ่ง่าย พร้อมเพิ่มน้ำหนักหรือใช้ท่าที่ยากขึ้นแล้ว',
  in_lag:'ยังห่างเป้าสัปดาห์นี้: {0}', in_goal_behind:'เป้าหมาย "{0}" ช้ากว่ากำหนด',
  in_tired:'ช่วงนี้ความพร้อมต่ำ ให้ความสำคัญกับการนอน และซ้อมให้สั้นลง',
  in_good:'มาถูกทางแล้ว ไปต่อ!', in_start:'เริ่มจากทดสอบวัดระดับ แล้วซ้อมครั้งแรก',
  p_review:'สรุป', p_goals:'เป้าหมาย', p_body:'ร่างกาย',
  rv_workouts:'ครั้ง', rv_vs:'7 วันก่อนหน้า: {0} ครั้ง · {1} เซ็ต · {2} kg', rv_plan:'แผนรายสัปดาห์', rv_plan_n:'ทำแล้ว {0} จาก {1} ครั้งตามแผน',
  rv_balance:'สมดุลดัน / ดึง', rv_balance_n:'ดัน {0} เซ็ต · ดึง {1} เซ็ต', rv_ready:'ความพร้อม', rv_ready_n:'เฉลี่ย {0} จาก 6 จาก {1} ครั้งที่เช็ก',
  rv_prs:'สถิติใหม่', rv_coach:'โค้ชแนะนำ',
  gl_intro:'ตั้งเป้าพร้อมวันที่ แอปติดตามผลดีที่สุดใน 4 สัปดาห์ล่าสุด และประเมินว่าจะถึงเป้าเมื่อไหร่',
  gl_none:'ยังไม่มีเป้าหมาย', gl_add:'เพิ่มเป้าหมาย', gl_pick:'ท่าของเป้าหมาย', gl_pick_hint:'เลือกท่าที่ต้องการตั้งเป้า',
  gl_t_reps:'เป้าจำนวนครั้งต่อเซ็ต', gl_t_hold:'เป้าวินาที', gl_t_weight:'เป้าน้ำหนัก (kg)', gl_t_wreps:'ที่กี่ครั้ง', gl_deadline:'ภายในวันที่',
  gl_save:'บันทึกเป้าหมาย', gl_bad:'ใส่เป้าและวันที่ในอนาคต', gl_del:'ลบเป้าหมายนี้?', gl_target:'เป้า', gl_by:'ภายใน', gl_now:'ตอนนี้',
  gl_eta:'ถ้าเร็วเท่านี้ ≈ {0}', gl_done:'ถึงแล้ว', gl_ontrack:'ทันกำหนด', gl_behind:'ช้ากว่ากำหนด', gl_late:'เลยกำหนดแล้ว', gl_early:'ยังเร็วไปที่จะบอก',
  pf_title:'โปรไฟล์ร่างกาย & ข้อจำกัด', pf_sub:'อาการบาดเจ็บ ข้อต่อที่ต้องระวัง วอร์มอัพ', pf_intro:'เลือกข้อต่อที่ต้องระวัง เซสชันจะสลับท่าที่ลงน้ำหนักตรงนั้นมากออกให้',
  pf_limits:'ข้อต่อที่ต้องระวัง', pf_limits_note:'ถ้าเจ็บแค่วันนี้ ให้ใช้การเช็กความพร้อมก่อนซ้อมแทน',
  pf_avoided:'ท่าที่จะถูกสลับออก', pf_routine:'วอร์มอัพและคูลดาวน์', pf_swapped:'สลับท่าเพื่อเลี่ยง{0}', pf_dropped:'ตัดออก',
  pf_disclaimer:'นี่ไม่ใช่คำแนะนำทางการแพทย์ ถ้าเจ็บแหลม เจ็บนาน หรือเจ็บมากขึ้น ให้ไปพบแพทย์หรือนักกายภาพบำบัด',
  bd_add:'เพิ่มการวัด', bd_weight:'น้ำหนัก', bd_waist:'รอบเอว', bd_save:'บันทึก', bd_saved:'บันทึกแล้ว', bd_empty:'ใส่น้ำหนักหรือรอบเอว',
  bd_nodata:'ยังไม่มีข้อมูล', bd_change:'{0} ใน {1} วัน', bd_history:'ประวัติ', bd_photos:'รูปเทียบความคืบหน้า',
  bd_photo_note:'รูปเก็บในมือถือเครื่องนี้เท่านั้น ไม่รวมในไฟล์สำรอง ถ่ายที่เดิม แสงเดิม ท่าเดิมทุกครั้งจะเทียบง่ายขึ้น',
  bd_photo_add:'ถ่ายหรือเพิ่มรูป', bd_photo_saved:'บันทึกรูปแล้ว', bd_photo_fail:'บันทึกรูปไม่สำเร็จ', bd_compare:'เทียบสองรูป',
  bd_nophoto:'ยังไม่มีรูป', bd_need2:'เพิ่มรูปอย่างน้อย 2 รูปเพื่อเทียบ', bd_pick1:'แตะรูปแรก', bd_pick2:'แตะรูปที่สอง',
  fc_btn:'เช็กฟอร์ม', fc_auto:'อัดเซ็ตของคุณ นับครั้ง และเช็กฟอร์มในมือถือเครื่องนี้ ไม่มีการอัปโหลด',
  fc_manual_only:'ท่านี้ยังเช็กอัตโนมัติไม่ได้ แต่ยังอัด ดูย้อนแบบสโลว์ และใช้เช็กลิสต์ได้',
  fc_setup:'วิธีวางมือถือ', fc_tip1:'ถ่ายด้านข้าง ห่าง 2-3 เมตร มือถือสูงประมาณสะโพก', fc_tip2:'ต้องเห็นทั้งตัวตลอดทั้งเซ็ต',
  fc_tip3:'แสงพอ พื้นหลังเรียบ ห่วงที่แกว่งหรือเสื้อหลวมอาจทำให้จับผิด',
  fc_camera:'กล้อง', fc_file:'ไฟล์วิดีโอ', fc_start:'เริ่มอัด', fc_stop:'หยุด', fc_loading:'กำลังโหลดโมเดลจับท่าทาง (ครั้งแรกครั้งเดียว ประมาณ 10 MB)…',
  fc_loadfail:'โหลดโมเดลจับท่าทางไม่ได้ แต่ยังอัดและดูย้อนได้', fc_offline:'ออฟไลน์อยู่: โมเดลจะโหลดในครั้งแรกที่ใช้',
  fc_nocam:'ใช้กล้องไม่ได้ อนุญาตกล้องให้เว็บนี้ หรือใช้ไฟล์วิดีโอแทน', fc_nobody:'ถอยออกไปให้เห็นทั้งตัว',
  fc_goodrep:'ฟอร์มดี', fc_reps_res:'นับได้ {0} ครั้ง · ฟอร์มดี {1} ครั้ง', fc_hold_res:'ท่าถูก {0} วินาที (จาก {1} วินาที)', fc_norep:'ยังจับไม่ได้ว่าครบครั้ง',
  fc_accuracy:'การเช็กอัตโนมัติเป็นค่าประมาณ ใช้เป็นตัวช่วยคู่กับการดูวิดีโอย้อนหลัง',
  fc_use:'ใส่ {0} ลงบันทึก', fc_used:'ใส่ค่าให้แล้ว ตรวจดูแล้วกดบันทึกเซ็ต', fc_replay:'ดูย้อน', fc_frame:'เฟรม', fc_save:'บันทึกวิดีโอลงมือถือ',
  fc_check:'เช็กด้วยตัวเอง', fc_again:'อัดใหม่',
  fi_depth:'ลงให้ลึกกว่านี้', fi_lock:'เหยียดไม่สุด', fi_sag:'สะโพกตก', fi_pike:'สะโพกโก่งสูง', fi_lean:'ตัวเอนไปข้างหน้ามาก',
  fi_chin:'คางไม่พ้นบาร์', fi_top:'ดึงให้สูงกว่านี้', fi_squeeze:'ดึงให้สุดกว่านี้', fi_hold_bad:'ท่าเริ่มเสีย',
  fv_depth:'ลงอีก', fv_lock:'เหยียดสุด', fv_sag:'ยกสะโพก', fv_pike:'ลดสะโพก', fv_lean:'ยกอก', fv_chin:'คางพ้นบาร์', fv_top:'ดึงสูงอีก', fv_squeeze:'ดึงอีก',
  ai_title:'โค้ช AI', ai_sub_on:'ถามเรื่องการซ้อมของคุณ', ai_sub_off:'ตัวเลือกเสริม: ใช้ Claude API key ของคุณเอง',
  ai_setup:'โค้ช AI ใช้ Claude Haiku ผ่าน API key ของคุณเอง แต่ละคำถามมีค่าใช้จ่ายเล็กน้อยมากในบัญชีของคุณ สร้าง key ได้ที่ console.anthropic.com และควรตั้งวงเงินต่อเดือนไว้ที่นั่น',
  ai_consent:'ฉันเข้าใจว่าสรุปการซ้อม (เซ็ต น้ำหนัก การเช็กความพร้อม เป้าหมาย น้ำหนักตัว) จะถูกส่งไปที่ Anthropic ทุกครั้งที่ถาม โดยไม่ส่งรูปและวิดีโอ',
  ai_enable:'บันทึก key และเปิดใช้', ai_badkey:'ดูไม่เหมือน Anthropic API key (sk-ant-…)', ai_need_consent:'ติ๊กช่องยอมรับก่อน',
  ai_hello:'ถามอะไรก็ได้เรื่องการซ้อม โค้ชเห็นข้อมูล 4 สัปดาห์ล่าสุดของคุณ', ai_placeholder:'ถามโค้ช…',
  ai_privacy:'key เก็บในมือถือเครื่องนี้เท่านั้น ไม่รวมในไฟล์สำรอง และสรุปการซ้อมจะถูกส่งไปที่ Anthropic ทุกครั้งที่ถาม',
  ai_clear:'ล้างแชต', ai_off:'ลบ key', ai_off_confirm:'ลบ API key ออกจากมือถือเครื่องนี้?', ai_ask:'ถาม', ai_review:'ถามโค้ช AI เรื่องสัปดาห์นี้',
  ai_q_week:'สัปดาห์นี้ซ้อมเป็นยังไงบ้าง และสัปดาห์หน้าควรเน้นอะไร?', ai_q_next:'ซ้อมครั้งต่อไปควรทำอะไร?',
  ai_q_stuck:'ท่าไหนติดตัน และจะทำให้พัฒนาต่อได้ยังไง?', ai_q_form:'ขอเทคนิค 3 ข้อสำหรับท่าหลักของฉัน',
  ai_err_key:'API key ถูกปฏิเสธ ตรวจที่ เพิ่มเติม → โค้ช AI', ai_err_rate:'มีคำขอมากเกินไป ลองใหม่อีกสักนาที',
  ai_err_net:'ไม่มีอินเทอร์เน็ต', ai_err_api:'บริการ AI ตอบกลับผิดพลาด ({0}) ลองใหม่ภายหลัง', ai_err_load:'เชื่อมต่อบริการ AI ไม่ได้',
  ai_err_refusal:'โค้ชตอบคำถามนี้ไม่ได้ ลองถามแบบอื่น'
});

// ---- yoga & stretching
Object.assign(STR.en, {
  tab_yoga:'Yoga', yg_title:'Yoga & stretching', yg_sub:'Every pose has 3 depths. Pick yours; the app remembers it.',
  yg_week:'Stretching this week', yg_week_note:'A few short sessions a week help mobility, ring skills and recovery.',
  yg_sessions:'Sessions', yg_n_poses:'{0} poses', yg_profile:'Your flexibility', yg_profile_note:'Average depth level of the poses for each area (from your saved levels).',
  yg_poses:'Pose library', yg_bothsides:'both sides', yg_sides:'sides', yg_yours:'Your level', yg_pick:'Use this level',
  yg_safety:'Stretch to a mild pull, never to sharp pain. Breathe slowly and do not bounce.',
  yg_level_note:'levels can be changed during the session', yg_start:'Start session', yg_side1:'first side', yg_side2:'second side',
  yg_pause:'Pause', yg_resume:'Resume', yg_how:'How did "{0}" feel?', yg_hard:'Too tight', yg_ok:'Just right', yg_easy:'Easy',
  yg_up:'Next time: {0}', yg_down:'Stepped down to: {0}', yg_easy_once:'Noted. One more easy time and this pose levels up.',
  yg_quit:'End the session now?', yg_done:'Session done', yg_poses_done:'poses',
  yv_switch:'Switch sides', yv_next:'Next: {0}',
  rv_yoga:'Stretching & yoga', rv_yoga_n:'{0} minutes in the last 7 days',
  in_stretch:'No stretching this week yet. Try the "After training" session (8 min).'
});
Object.assign(STR.th, {
  tab_yoga:'โยคะ', yg_title:'โยคะ & ยืดเหยียด', yg_sub:'ทุกท่ามี 3 ระดับความลึก เลือกระดับของคุณ แอปจะจำไว้',
  yg_week:'ยืดเหยียดสัปดาห์นี้', yg_week_note:'ยืดสั้นๆ ไม่กี่ครั้งต่อสัปดาห์ ช่วยเรื่องความยืดหยุ่น ท่าห่วง และการฟื้นตัว',
  yg_sessions:'เซสชัน', yg_n_poses:'{0} ท่า', yg_profile:'ความยืดหยุ่นของคุณ', yg_profile_note:'ระดับความลึกเฉลี่ยของท่าในแต่ละส่วน (จากระดับที่คุณบันทึกไว้)',
  yg_poses:'คลังท่า', yg_bothsides:'ทั้งสองข้าง', yg_sides:'ข้าง', yg_yours:'ระดับของคุณ', yg_pick:'ใช้ระดับนี้',
  yg_safety:'ยืดแค่รู้สึกตึงพอดี ไม่ถึงขั้นเจ็บแหลม หายใจช้าๆ และไม่เด้งตัว',
  yg_level_note:'เปลี่ยนระดับได้ระหว่างทำ', yg_start:'เริ่มเซสชัน', yg_side1:'ข้างแรก', yg_side2:'ข้างที่สอง',
  yg_pause:'หยุดชั่วคราว', yg_resume:'ทำต่อ', yg_how:'ท่า "{0}" เป็นยังไง?', yg_hard:'ตึงไป', yg_ok:'พอดี', yg_easy:'ง่าย',
  yg_up:'ครั้งหน้า: {0}', yg_down:'ลดระดับเป็น: {0}', yg_easy_once:'รับทราบ ถ้าง่ายอีกครั้ง ท่านี้จะขึ้นระดับ',
  yg_quit:'จบเซสชันตอนนี้?', yg_done:'เซสชันเสร็จแล้ว', yg_poses_done:'ท่า',
  yv_switch:'สลับข้าง', yv_next:'ท่าต่อไป {0}',
  rv_yoga:'ยืดเหยียด & โยคะ', rv_yoga_n:'{0} นาทีใน 7 วันล่าสุด',
  in_stretch:'สัปดาห์นี้ยังไม่ได้ยืดเลย ลองเซสชัน "หลังซ้อม" (8 นาที)'
});

// ---- stretching sessions (before / after training), separate from yoga
Object.assign(STR.en, {
  tab_yoga:'Stretch', yg_title:'Stretching & yoga', rt_warm:'Stretch before', rt_cool:'Stretch after',
  st_title:'Stretching', st_intro:'Before training: moving stretches that warm you up. After training: held stretches that cool you down. Every stretch has 3 levels.',
  st_pre:'Before training (dynamic)', st_pre_note:'Keep moving through each stretch. Long static holds before lifting are not needed.',
  st_post:'After training (static)', st_post_note:'Hold each stretch to a mild pull and breathe slowly.',
  st_kind_dyn:'Dynamic', st_kind_static:'Static', yg_yoga:'Yoga', yg_lib_stretch:'Stretches', yg_lib_yoga:'Yoga poses',
  pf_routine:'Stretch before and after workouts',
  in_stretch:'No stretching this week yet. Try "After training" (about 6 minutes).'
});
Object.assign(STR.th, {
  tab_yoga:'ยืดเหยียด', yg_title:'ยืดเหยียด & โยคะ', rt_warm:'ยืดก่อนซ้อม', rt_cool:'ยืดหลังซ้อม',
  st_title:'ยืดกล้ามเนื้อ', st_intro:'ก่อนซ้อม: ยืดแบบเคลื่อนไหวเพื่อวอร์มร่างกาย  หลังซ้อม: ยืดค้างเพื่อคูลดาวน์  ทุกท่ามี 3 ระดับ',
  st_pre:'ก่อนซ้อม (ยืดแบบเคลื่อนไหว)', st_pre_note:'เคลื่อนไหวต่อเนื่องในแต่ละท่า ไม่จำเป็นต้องยืดค้างนานก่อนยกน้ำหนัก',
  st_post:'หลังซ้อม (ยืดค้าง)', st_post_note:'ยืดค้างแค่รู้สึกตึงพอดี และหายใจช้าๆ',
  st_kind_dyn:'ยืดแบบเคลื่อนไหว', st_kind_static:'ยืดค้าง', yg_yoga:'โยคะ', yg_lib_stretch:'ท่ายืด', yg_lib_yoga:'ท่าโยคะ',
  pf_routine:'ยืดก่อนและหลังซ้อม',
  in_stretch:'สัปดาห์นี้ยังไม่ได้ยืดเลย ลองเซสชัน "หลังซ้อม" (ประมาณ 6 นาที)',
  s_push:'อก', s_pull:'หลัง'
});

// ---- warm-up as its own step again
Object.assign(STR.en, {wu_title:'Warm-up', pf_routine:'Before and after workouts'});
Object.assign(STR.th, {wu_title:'วอร์มอัพ', pf_routine:'ก่อนและหลังซ้อม'});

// ---- guided yoga voice and calm background sounds
Object.assign(STR.en, {
  yg_getready:'Get into position', yg_hold:'Hold',
  yv_side2:'Second side. {0}', yv_breathe:'Breathe slowly. Relax into it.', yv_sample:'Downward-facing dog. Push the hips up and back, keep the back long.',
  yg_set_title:'Yoga & stretching guidance', yg_set_voice:'Spoken guidance',
  yg_set_voice_note:'Reads the pose and how to do it, gives a breathing cue, and counts 5-4-3-2-1 before each change.',
  yg_set_rate:'Speaking speed', rate_slow:'Slow', rate_normal:'Normal', yg_set_prep:'Time to get into each pose',
  yg_set_amb:'Background sound', yg_set_ambvol:'Background volume',
  amb_off:'Off', amb_pad:'Soft pads', amb_rain:'Rain', amb_ocean:'Ocean waves', amb_bowls:'Singing bowls', amb_wind:'Wind',
  amb_note:'Plays during yoga sessions and the cool-down. All sounds are generated by the app and work offline.'
});
Object.assign(STR.th, {
  yg_getready:'เข้าท่า', yg_hold:'ค้างท่า',
  yv_side2:'ข้างที่สอง {0}', yv_breathe:'หายใจช้าๆ ผ่อนคลายลงไปในท่า', yv_sample:'สุนัขก้มหน้า ดันสะโพกขึ้นและไปข้างหลัง หลังยาว',
  yg_set_title:'เสียงนำโยคะ & ยืดเหยียด', yg_set_voice:'เสียงพูดนำ',
  yg_set_voice_note:'อ่านชื่อท่าและวิธีทำ เตือนให้หายใจ และนับ 5-4-3-2-1 ก่อนเปลี่ยนท่า',
  yg_set_rate:'ความเร็วเสียงพูด', rate_slow:'ช้า', rate_normal:'ปกติ', yg_set_prep:'เวลาเข้าท่าก่อนเริ่มจับเวลา',
  yg_set_amb:'เสียงพื้นหลัง', yg_set_ambvol:'ระดับเสียงพื้นหลัง',
  amb_off:'ปิด', amb_pad:'คอร์ดนุ่มๆ', amb_rain:'เสียงฝน', amb_ocean:'คลื่นทะเล', amb_bowls:'ขันทิเบต', amb_wind:'สายลม',
  amb_note:'เล่นระหว่างโยคะและยืดหลังซ้อม เสียงทั้งหมดแอปสร้างขึ้นเอง ใช้ออฟไลน์ได้'
});

// ---- spoken exercise announcements during workouts
Object.assign(STR.en, {
  v_go:'Rest over. {0}. Go!', v_this_ex:'{0}. {1}', v_next_ex:'Next exercise: {0}. {1}',
  v_plan_reps:'{0} sets of {1} reps', v_plan_secs:'{0} sets of {1} seconds', v_plan_w:', at {0} kilos'
});
Object.assign(STR.th, {
  v_go:'หมดเวลาพัก {0} ลุย!', v_this_ex:'{0} {1}', v_next_ex:'ท่าต่อไป {0} {1}',
  v_plan_reps:'{0} เซ็ต เซ็ตละ {1} ครั้ง', v_plan_secs:'{0} เซ็ต เซ็ตละ {1} วินาที', v_plan_w:' น้ำหนัก {0} กิโล'
});

// ---- animation phase labels
Object.assign(STR.en, {an_start:'Start', an_move:'Moving…', an_hold:'End position', fig_note:'Side view. Faded limbs are the far side, the glow shows the target area and the dashed figure is the start position. Use ⏸ and the slider to look step by step.'});
Object.assign(STR.th, {an_start:'ท่าเริ่ม', an_move:'กำลังเคลื่อนไหว…', an_hold:'ท่าจบ / ค้าง', fig_note:'มุมข้าง แขนขาสีจางคือข้างไกล ส่วนที่เรืองแสงคือจุดที่ออกแรงหรือยืด และหุ่นเส้นประคือท่าเริ่ม กด ⏸ หรือเลื่อนแถบเพื่อดูทีละจังหวะ'});

// ---- YouTube tutorial clips
Object.assign(STR.en, {yt_title:'Video tutorial', yt_play:'Play video (needs internet)', yt_offline:'You are offline. Videos need internet.', video:'More videos on YouTube'});
Object.assign(STR.th, {yt_title:'คลิปสอน', yt_play:'เล่นคลิป (ต้องใช้เน็ต)', yt_offline:'ออฟไลน์อยู่ คลิปต้องใช้อินเทอร์เน็ต', video:'ดูคลิปอื่นบน YouTube'});

// ---- full follow-along yoga classes on YouTube
Object.assign(STR.en, {
  yv_title:'Follow-along video classes', yv_sub:'Full classes from popular YouTube teachers, sorted by views. Tap to play (needs internet).',
  yv_n:'{0} classes', yv_or:'Or follow a full video class', yv_more:'More {0} classes', yv_list_note:'Most-viewed first. Mark a class done to count its minutes in your weekly yoga time.',
  yv_done:'I did it (+{0} min)', yv_logged:'Added to your yoga minutes', yv_views_m:'{0}M views', yv_views_k:'{0}K views',
  yvc_begin:'Beginners', yvc_morning:'Morning', yvc_bed:'Bedtime', yvc_post:'After training', yvc_hips:'Hips', yvc_back:'Lower back',
  yvc_neck:'Neck & shoulders', yvc_flex:'Full-body flexibility', yvc_yin:'Yin (long holds)', yvc_power:'Power yoga', yvc_core:'Core', yvc_desk:'Desk / sitting'
});
Object.assign(STR.th, {
  yv_title:'คลิปโยคะทำตามทั้ง session', yv_sub:'คลาสเต็มจากครูโยคะยอดนิยมบน YouTube เรียงตามยอดวิว กดเล่นได้เลย (ต้องใช้เน็ต)',
  yv_n:'{0} คลิป', yv_or:'หรือทำตามคลิปแบบเต็ม session', yv_more:'ดูคลิป{0}เพิ่ม', yv_list_note:'เรียงจากยอดวิวมากสุด กด "ทำจบแล้ว" เพื่อนับนาทีเข้าเวลาโยคะประจำสัปดาห์',
  yv_done:'ทำจบแล้ว (+{0} นาที)', yv_logged:'บันทึกเวลาโยคะแล้ว', yv_views_m:'{0} ล้านวิว', yv_views_k:'{0} พันวิว',
  yvc_begin:'ผู้เริ่มต้น', yvc_morning:'ตอนเช้า', yvc_bed:'ก่อนนอน', yvc_post:'หลังออกกำลัง', yvc_hips:'สะโพก', yvc_back:'หลังล่าง / ปวดหลัง',
  yvc_neck:'คอ บ่า ไหล่', yvc_flex:'ยืดทั้งตัว', yvc_yin:'หยินโยคะ (ค้างนาน)', yvc_power:'พาวเวอร์โยคะ', yvc_core:'แกนกลางลำตัว', yvc_desk:'คนนั่งทำงาน'
});
