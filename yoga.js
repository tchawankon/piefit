'use strict';
/* PieFit yoga & stretching: poses with three depth levels, sessions for different goals and levels,
   a guided runner where the depth of each pose can be changed on the fly, and per-pose level memory. */
const Yoga = (() => {
  let YLOG = [], YLVL = {}, YFEEL = {};
  const load = () => {
    YLOG = Array.isArray(store.get('yoga')) ? store.get('yoga').filter(isObj) : [];
    YLVL = isObj(store.get('ylvl')) ? store.get('ylvl') : {};
    YFEEL = isObj(store.get('yfeel')) ? store.get('yfeel') : {};
  };
  const save = () => { store.set('yoga', YLOG.slice(-300)); store.set('ylvl', YLVL); store.set('yfeel', YFEEL); };
  const L = pair => SET.lang === 'th' ? pair[1] : pair[0];

  /* ---------- base positions (side view, 180 x 150 box, ground at y 136) ---------- */
  const O = (base, o) => Object.assign({}, base, o);
  const STAND = {h:[88,22],s:[90,38],e:[91,58],w:[93,76],p:[90,78],k:[90,108],f:[92,134]};
  const SIT = {h:[64,72],s:[62,88],e:[70,108],w:[80,124],p:[60,128],k:[100,126],f:[140,128]};
  const LIE = {h:[26,126],s:[40,128],e:[60,130],w:[76,132],p:[90,128],k:[120,128],f:[150,130]};
  const LIEK = {h:[26,126],s:[40,128],e:[56,130],w:[72,132],p:[80,126],k:[106,104],f:[112,132]};
  const QUAD = {h:[132,96],s:[120,102],e:[120,118],w:[120,134],p:[70,102],k:[70,134],f:[40,134]};
  const KNEEL = {h:[90,42],s:[90,58],e:[90,76],w:[92,94],p:[90,98],k:[90,132],f:[60,134]};
  const PRONE = {h:[140,126],s:[124,128],e:[124,132],w:[134,134],p:[80,130],k:[50,132],f:[20,132]};
  const WIDE = {h:[92,22],s:[92,38],e:[92,58],w:[92,76],p:[92,80],k:[80,108],f:[70,134],k2:[104,108],f2:[116,134]};

  /* ---------- poses: n = name, a = focus areas, side = both sides, lv = three depth levels ---------- */
  const P = (n, a, side, base, lv) => ({n, a, side, base, lv});
  const V = (n, d, pose) => ({n, d, pose});
  const POSES = {
    forwardfold: P(['Standing forward fold','ก้มตัวยืน (Forward fold)'], ['hamstrings','spine'], false, STAND, [
      V(['Knees bent, hands on shins','งอเข่า มือจับหน้าแข้ง'], ['Bend the knees as much as you need, let the head hang','งอเข่าได้ตามต้องการ ปล่อยศีรษะห้อย'], {h:[118,104],s:[110,92],e:[106,104],w:[98,114],p:[78,76],k:[92,104],f:[92,134]}),
      V(['Hands to the floor','มือแตะพื้น'], ['Soft knees, fingertips or palms on the floor','เข่างอเล็กน้อย ปลายนิ้วหรือฝ่ามือแตะพื้น'], {h:[102,122],s:[100,106],e:[98,120],w:[96,134],p:[80,72],k:[90,106],f:[92,134]}),
      V(['Straight legs, chest to thighs','ขาตึง อกแนบต้นขา'], ['Legs straight, fold from the hips, palms flat','ขาเหยียดตรง พับจากสะโพก ฝ่ามือราบพื้น'], {h:[92,126],s:[92,112],e:[98,124],w:[102,134],p:[82,74],k:[88,104],f:[92,134]})]),
    downdog: P(['Downward-facing dog','สุนัขก้มหน้า (Downward dog)'], ['hamstrings','calves','shoulders'], false, QUAD, [
      V(['Knees bent, heels up','งอเข่า ยกส้นเท้า'], ['Push the hips up and back, keep the back long','ดันสะโพกขึ้นและไปข้างหลัง หลังยาว'], {h:[124,116],s:[118,106],e:[124,120],w:[128,134],p:[80,72],k:[70,100],f:[56,128]}),
      V(['Legs straighter','ขาเหยียดขึ้น'], ['Straighten the legs a little, heels move toward the floor','เหยียดขาขึ้นอีกนิด ส้นเท้าเลื่อนลงหาพื้น'], {h:[122,118],s:[117,107],e:[123,120],w:[128,134],p:[84,68],k:[68,102],f:[54,132]}),
      V(['Straight legs, heels down','ขาตึง ส้นเท้าแตะพื้น'], ['Legs straight, heels on the floor, chest toward the thighs','ขาตรง ส้นเท้าแตะพื้น อกเข้าหาต้นขา'], {h:[120,118],s:[116,108],e:[122,121],w:[128,134],p:[86,64],k:[70,98],f:[52,134]})]),
    lowlunge: P(['Low lunge','ลันจ์ต่ำ (Low lunge)'], ['hips','quads'], true, KNEEL, [
      V(['Hands on the front knee','มือวางบนเข่าหน้า'], ['Back knee down, hips gently forward','เข่าหลังวางพื้น ดันสะโพกไปข้างหน้าเบาๆ'], {h:[94,46],s:[92,62],e:[104,82],w:[112,100],p:[88,100],k:[116,104],f:[120,134],k2:[70,132],f2:[44,134]}),
      V(['Arms overhead, hips low','ยกแขนเหนือหัว สะโพกต่ำ'], ['Sink the hips forward and down, arms up','ดันสะโพกลงและไปข้างหน้า ยกแขนขึ้น'], {h:[90,54],s:[90,70],e:[94,46],w:[96,28],p:[92,108],k:[120,106],f:[124,134],k2:[70,132],f2:[44,134]}),
      V(['Hold the back foot','จับเท้าหลัง'], ['Bend the back knee and hold the foot for a quad stretch','งอเข่าหลังแล้วจับเท้า ยืดต้นขาหน้า'], {h:[92,54],s:[90,70],e:[76,82],w:[68,96],p:[94,108],k:[122,106],f:[126,134],k2:[72,132],f2:[66,98]})]),
    pigeon: P(['Pigeon','นกพิราบ (Pigeon)'], ['hips'], true, LIEK, [
      V(['Figure-four on your back','ไขว่ห้างนอนหงาย'], ['Ankle over the opposite knee, pull the legs in','วางข้อเท้าบนเข่าอีกข้าง ดึงขาเข้าหาตัว'], {h:[26,124],s:[40,128],e:[62,116],w:[98,104],p:[88,128],k:[112,100],f:[126,128],k2:[116,110],f2:[102,96]}),
      V(['Pigeon, upright','นกพิราบ ตัวตั้ง'], ['Front shin on the floor, back leg long, hands on the floor','หน้าแข้งหน้าวางพื้น ขาหลังเหยียดยาว มือวางพื้น'], {h:[94,68],s:[90,84],e:[96,104],w:[100,126],p:[84,124],k:[118,130],f:[96,132],k2:[52,132],f2:[24,134]}),
      V(['Pigeon, folded forward','นกพิราบ พับตัว'], ['Walk the hands forward and rest the chest down','เดินมือไปข้างหน้า วางอกลง'], {h:[132,120],s:[118,116],e:[140,124],w:[156,130],p:[84,124],k:[118,130],f:[96,132],k2:[52,132],f2:[24,134]})]),
    butterfly: P(['Butterfly (bound angle)','ผีเสื้อ (Butterfly)'], ['groin','hips'], false, SIT, [
      V(['Sit tall, knees up','นั่งตัวตรง เข่าสูง'], ['Soles together, hold the feet, sit tall','ฝ่าเท้าประกบ จับเท้า นั่งตัวตรง'], {h:[74,72],s:[72,88],e:[80,108],w:[90,126],p:[70,128],k:[100,104],f:[92,130]}),
      V(['Knees lower, lean in','เข่าต่ำลง เอนตัว'], ['Let the knees drop, lean forward a little','ปล่อยเข่าลง เอนตัวไปข้างหน้าเล็กน้อย'], {h:[86,76],s:[80,90],e:[86,110],w:[92,128],p:[70,128],k:[104,116],f:[92,130]}),
      V(['Deep fold','พับลึก'], ['Fold forward, chest toward the feet','พับตัวลง อกเข้าหาเท้า'], {h:[110,112],s:[96,106],e:[100,120],w:[96,128],p:[70,128],k:[106,122],f:[92,130]})]),
    seatedfold: P(['Seated forward fold','นั่งก้มตัว (Seated fold)'], ['hamstrings','spine'], false, SIT, [
      V(['Knees bent','งอเข่า'], ['Bend the knees, hold the feet or a strap','งอเข่า จับเท้าหรือใช้ผ้าช่วย'], {h:[80,80],s:[72,92],e:[88,104],w:[104,110],p:[60,128],k:[100,112],f:[134,128]}),
      V(['Hands to the shins','มือถึงหน้าแข้ง'], ['Legs long, reach for the shins or ankles','เหยียดขา เอื้อมจับหน้าแข้งหรือข้อเท้า'], {h:[96,90],s:[84,96],e:[100,108],w:[116,118],p:[60,128],k:[100,126],f:[140,128]}),
      V(['Chest to thighs','อกแนบต้นขา'], ['Fold from the hips, hold the feet','พับจากสะโพก จับเท้า'], {h:[112,114],s:[96,114],e:[118,120],w:[138,124],p:[60,128],k:[100,126],f:[140,128]})]),
    cobra: P(['Cobra','งูเห่า (Cobra)'], ['spine','chest'], false, PRONE, [
      V(['Sphinx','สฟิงซ์ (บนแขนท่อนล่าง)'], ['Forearms down, lift the chest gently','วางแขนท่อนล่าง ยกอกขึ้นเบาๆ'], {h:[136,100],s:[122,112],e:[124,132],w:[142,132],p:[80,130],k:[50,132],f:[20,132]}),
      V(['Low cobra','งูเห่าต่ำ'], ['Hands under the shoulders, lift the chest with the back','มือใต้ไหล่ ยกอกด้วยกล้ามหลัง'], {h:[132,86],s:[120,100],e:[122,116],w:[124,132],p:[82,128],k:[50,132],f:[20,132]}),
      V(['Upward-facing dog','สุนัขเงยหน้า (Up dog)'], ['Arms straight, thighs lifted off the floor','แขนเหยียด ยกต้นขาพ้นพื้น'], {h:[130,74],s:[120,90],e:[121,110],w:[122,132],p:[84,118],k:[54,124],f:[22,132]})]),
    childpose: P(["Child's pose",'ท่าเด็ก (Child’s pose)'], ['spine','shoulders','hips'], false, KNEEL, [
      V(['Resting','พักตัว'], ['Sit back on the heels, arms by the sides, breathe','นั่งบนส้นเท้า แขนข้างลำตัว หายใจ'], {h:[118,122],s:[104,118],e:[90,126],w:[76,130],p:[62,118],k:[80,132],f:[46,134]}),
      V(['Arms forward','ยื่นแขนไปข้างหน้า'], ['Reach the arms forward, forehead down','ยื่นแขนไปข้างหน้า หน้าผากแตะพื้น'], {h:[120,124],s:[106,120],e:[130,126],w:[150,128],p:[60,118],k:[80,132],f:[46,134]}),
      V(['Puppy pose','ลูกสุนัข (Puppy)'], ['Hips over the knees, chest sinks to the floor','สะโพกอยู่เหนือเข่า อกยุบลงหาพื้น'], {h:[132,128],s:[118,124],e:[138,128],w:[158,130],p:[78,96],k:[80,132],f:[46,134]})]),
    triangle: P(['Triangle','สามเหลี่ยม (Triangle)'], ['hamstrings','spine'], true, WIDE, [
      V(['Hand on the shin','มือที่หน้าแข้ง'], ['Wide legs, reach sideways, hand on the shin','กางขากว้าง เอื้อมไปด้านข้าง มือวางหน้าแข้ง'], {h:[130,64],s:[118,72],e:[114,92],w:[110,112],p:[92,96],k:[76,116],f:[60,134],k2:[108,116],f2:[124,134]}),
      V(['Hand at the ankle','มือที่ข้อเท้า'], ['Lengthen the side, hand to the ankle','ยืดลำตัวด้านข้าง มือแตะข้อเท้า'], {h:[136,76],s:[124,82],e:[122,106],w:[120,128],p:[92,96],k:[76,116],f:[60,134],k2:[108,116],f2:[124,134]}),
      V(['Hand to the floor','มือแตะพื้น'], ['Hand on the floor behind the front foot','มือแตะพื้นหลังเท้าหน้า'], {h:[142,88],s:[128,92],e:[130,114],w:[130,134],p:[92,96],k:[76,116],f:[60,134],k2:[108,116],f2:[124,134]})]),
    threadneedle: P(['Thread the needle','ร้อยเข็ม (Thread the needle)'], ['shoulders','spine'], true, QUAD, [
      V(['Shallow','ระดับเบา'], ['On hands and knees, slide one arm under the other','คุกเข่าวางมือ สอดแขนข้างหนึ่งใต้อีกข้าง'], {h:[118,122],s:[112,112],e:[100,124],w:[88,128],p:[70,102],k:[70,134],f:[40,134]}),
      V(['Shoulder to the floor','ไหล่แตะพื้น'], ['Rest the shoulder and ear on the floor','วางไหล่และหูลงพื้น'], {h:[114,130],s:[108,124],e:[96,128],w:[80,130],p:[70,102],k:[70,134],f:[40,134]}),
      V(['Hips back, deeper twist','ดันสะโพกหลัง บิดลึก'], ['Sit the hips back for a deeper upper-back twist','ถอยสะโพกไปข้างหลังเพื่อบิดหลังบนลึกขึ้น'], {h:[112,130],s:[106,125],e:[94,129],w:[76,131],p:[62,106],k:[70,134],f:[40,134]})]),
    chestopen: P(['Chest opener','เปิดอก (Chest opener)'], ['chest','shoulders'], false, STAND, [
      V(['Hands clasped low','ประสานมือด้านหลังต่ำ'], ['Clasp the hands behind you, squeeze the shoulder blades','ประสานมือด้านหลัง บีบสะบัก'], {h:[88,22],s:[90,38],e:[80,58],w:[72,74],p:[90,78],k:[90,108],f:[92,134]}),
      V(['Arms lifted','ยกแขนขึ้น'], ['Lift the clasped hands away from the back','ยกมือที่ประสานให้ห่างจากหลัง'], {h:[88,22],s:[90,38],e:[76,52],w:[64,62],p:[90,78],k:[90,108],f:[92,134]}),
      V(['Fold with arms overhead','ก้มตัวแขนชูขึ้น'], ['Fold forward, let the arms fall overhead','ก้มตัวลง ปล่อยแขนเลยศีรษะ'], {h:[104,118],s:[100,104],e:[88,82],w:[82,62],p:[82,74],k:[88,104],f:[92,134]})]),
    bridge: P(['Bridge / wheel','สะพาน / วงล้อ'], ['spine','hips','chest'], false, LIEK, [
      V(['Low bridge','สะพานต่ำ'], ['Feet flat, lift the hips a little','วางเท้าราบ ยกสะโพกเล็กน้อย'], O(LIEK, {p:[82,114]})),
      V(['High bridge','สะพานสูง'], ['Press through the feet, hips high','ดันเท้า ยกสะโพกสูง'], O(LIEK, {p:[84,100],k:[110,102]})),
      V(['Wheel','วงล้อ (Wheel)'], ['Hands by the head, press up into a full backbend','มือวางข้างศีรษะ ดันตัวขึ้นแอ่นหลังเต็มที่'], {h:[40,112],s:[46,102],e:[36,118],w:[30,132],p:[84,82],k:[108,100],f:[114,132]})]),
    supinetwist: P(['Supine twist','บิดตัวนอนหงาย'], ['spine','hips'], true, LIEK, [
      V(['Knees together to the side','เข่าชิดล้มไปด้านข้าง'], ['Let both knees fall to one side, shoulders down','ปล่อยเข่าทั้งสองล้มไปด้านหนึ่ง ไหล่ติดพื้น'], O(LIEK, {k:[104,114],f:[116,130]})),
      V(['One knee across','เข่าข้างเดียวข้ามตัว'], ['One knee across the body, other leg long','เข่าข้างหนึ่งข้ามตัว ขาอีกข้างเหยียด'], O(LIEK, {k:[104,124],f:[124,130]})),
      V(['Leg extended across','เหยียดขาข้ามตัว'], ['Straighten the crossing leg and hold the foot','เหยียดขาที่ข้ามตัวแล้วจับเท้า'], O(LIEK, {k:[118,124],f:[140,118],e:[80,122],w:[120,118]}))]),
    lizard: P(['Lizard','จิ้งจก (Lizard)'], ['hips','groin'], true, KNEEL, [
      V(['Hands on blocks','มือบนบล็อก'], ['Front foot outside the hands, back knee down','เท้าหน้าวางนอกมือ เข่าหลังวางพื้น'], {h:[122,90],s:[110,92],e:[114,108],w:[116,118],p:[88,110],k:[118,108],f:[124,134],k2:[66,132],f2:[40,134]}),
      V(['Forearms down','วางแขนท่อนล่าง'], ['Lower to the forearms','ลดตัวลงวางแขนท่อนล่าง'], {h:[126,108],s:[112,110],e:[114,126],w:[130,130],p:[88,114],k:[118,108],f:[124,134],k2:[66,132],f2:[40,134]}),
      V(['Back knee lifted','ยกเข่าหลัง'], ['Forearms down, back knee off the floor','วางแขนท่อนล่าง ยกเข่าหลังพ้นพื้น'], {h:[126,114],s:[112,116],e:[116,128],w:[132,132],p:[86,112],k:[118,108],f:[124,134],k2:[62,122],f2:[36,134]})]),
    frog: P(['Frog','กบ (Frog)'], ['groin','hips'], false, QUAD, [
      V(['On the hands','วางมือ'], ['Knees wide, rock the hips back gently','เข่ากว้าง โยกสะโพกไปข้างหลังเบาๆ'], O(QUAD, {p:[66,104]})),
      V(['On the forearms','วางแขนท่อนล่าง'], ['Lower to the forearms, knees wide','ลดลงวางแขนท่อนล่าง เข่ากว้าง'], {h:[130,112],s:[118,118],e:[116,132],w:[136,132],p:[70,108],k:[70,134],f:[40,134]}),
      V(['Chest low','อกต่ำ'], ['Hips in line with the knees, chest toward the floor','สะโพกแนวเดียวกับเข่า อกลงหาพื้น'], {h:[134,122],s:[120,124],e:[118,134],w:[140,134],p:[74,116],k:[70,134],f:[40,134]})]),
    splitsprep: P(['Half split → split','ครึ่งสปลิต → สปลิต'], ['hamstrings','hips'], true, KNEEL, [
      V(['Half split, hands on blocks','ครึ่งสปลิต มือบนบล็อก'], ['Hips over the back knee, front leg straight','สะโพกอยู่เหนือเข่าหลัง ขาหน้าเหยียด'], {h:[108,92],s:[96,92],e:[96,108],w:[100,120],p:[70,100],k:[102,120],f:[132,130],k2:[70,132],f2:[44,134]}),
      V(['Half split, folded','ครึ่งสปลิต พับตัว'], ['Fold over the front leg','พับตัวลงเหนือขาหน้า'], {h:[120,112],s:[106,108],e:[108,122],w:[112,132],p:[72,102],k:[102,120],f:[132,130],k2:[70,132],f2:[44,134]}),
      V(['Front split','สปลิต'], ['Slide into the split, hands on the floor or blocks','ไถลลงท่าสปลิต มือวางพื้นหรือบล็อก'], {h:[86,74],s:[84,90],e:[86,108],w:[88,126],p:[82,128],k:[116,130],f:[150,132],k2:[50,130],f2:[18,132]})]),
    widefold: P(['Wide-legged forward fold','กางขาก้มตัว'], ['hamstrings','groin'], false, WIDE, [
      V(['Hands to the floor','มือแตะพื้น'], ['Feet wide, fold, hands on the floor','กางขากว้าง ก้มตัว มือแตะพื้น'], {h:[96,122],s:[96,108],e:[96,124],w:[96,134],p:[92,80],k:[80,108],f:[70,134],k2:[104,108],f2:[116,134]}),
      V(['Forearms down','วางแขนท่อนล่าง'], ['Bend the elbows toward the floor','งอศอกลงหาพื้น'], {h:[94,128],s:[94,118],e:[98,128],w:[100,134],p:[92,80],k:[80,108],f:[70,134],k2:[104,108],f2:[116,134]}),
      V(['Head to the floor','ศีรษะแตะพื้น'], ['Crown of the head toward the floor','กระหม่อมลงหาพื้น'], {h:[92,132],s:[92,124],e:[98,130],w:[100,134],p:[92,82],k:[80,108],f:[70,134],k2:[104,108],f2:[116,134]})]),
    camel: P(['Camel','อูฐ (Camel)'], ['chest','spine','quads'], false, KNEEL, [
      V(['Hands on the lower back','มือที่หลังล่าง'], ['Kneel tall, hands on the lower back, lift the chest','คุกเข่าตัวตรง มือวางหลังล่าง ยกอก'], {h:[74,46],s:[80,58],e:[70,74],w:[80,92],p:[92,98],k:[90,132],f:[60,134]}),
      V(['Hands to heels, toes tucked','มือจับส้นเท้า (ตั้งปลายเท้า)'], ['Tuck the toes, reach back for the heels','ตั้งปลายเท้า เอื้อมจับส้นเท้า'], {h:[62,74],s:[72,78],e:[64,104],w:[60,126],p:[96,96],k:[90,132],f:[56,128]}),
      V(['Hands to heels, feet flat','มือจับส้นเท้า (หลังเท้าราบ)'], ['Feet flat, hips forward over the knees','หลังเท้าราบ สะโพกอยู่เหนือเข่า'], {h:[58,84],s:[70,82],e:[62,110],w:[58,132],p:[98,94],k:[90,132],f:[60,134]})]),
    happybaby: P(['Happy baby','เด็กยิ้ม (Happy baby)'], ['hips','groin'], false, LIEK, [
      V(['Hold behind the knees','จับหลังเข่า'], ['On your back, knees toward the chest','นอนหงาย เข่าเข้าหาอก'], {h:[26,126],s:[40,128],e:[70,110],w:[92,102],p:[80,128],k:[96,96],f:[116,104]}),
      V(['Hold the ankles','จับข้อเท้า'], ['Knees wide toward the armpits, hold the ankles','เข่ากางเข้าหารักแร้ จับข้อเท้า'], {h:[26,126],s:[40,128],e:[66,104],w:[84,86],p:[80,128],k:[70,104],f:[84,82]}),
      V(['Hold the feet, deep','จับเท้า ลึก'], ['Pull the feet down, knees toward the floor','ดึงเท้าลง เข่าเข้าหาพื้น'], {h:[26,126],s:[40,128],e:[60,104],w:[72,84],p:[80,128],k:[56,108],f:[72,80]})]),
    sidebend: P(['Side bend','เอียงตัวด้านข้าง'], ['spine','shoulders'], true, STAND, [
      V(['Gentle','ระดับเบา'], ['Arm overhead, lean to the side','ยกแขนเหนือหัว เอียงตัวไปด้านข้าง'], {h:[102,26],s:[98,40],e:[106,24],w:[112,10],p:[90,78],k:[90,108],f:[92,134]}),
      V(['Deeper','ลึกขึ้น'], ['Reach further, hips stay level','เอื้อมไกลขึ้น สะโพกตรง'], {h:[112,30],s:[104,42],e:[114,28],w:[126,18],p:[88,78],k:[90,108],f:[92,134]}),
      V(['Deep, reaching down','ลึก เอื้อมลง'], ['Reach over and down, long side body','เอื้อมข้ามและลง ลำตัวด้านข้างยาว'], {h:[122,40],s:[110,48],e:[126,30],w:[138,26],p:[86,80],k:[90,108],f:[92,134]})]),
    wristprep: P(['Wrist stretches','ยืดข้อมือ'], ['wrists'], false, QUAD, [
      V(['Fingers forward','นิ้วชี้ไปข้างหน้า'], ['Hands under the shoulders, rock gently forward','มือใต้ไหล่ โยกไปข้างหน้าเบาๆ'], O(QUAD, {s:[126,104],h:[138,98]})),
      V(['Fingers back','นิ้วชี้ไปข้างหลัง'], ['Turn the fingers toward the knees, lean back','หมุนนิ้วชี้ไปทางเข่า เอนตัวไปข้างหลัง'], O(QUAD, {s:[112,104],p:[64,106],h:[124,98]})),
      V(['Backs of the hands','หลังมือ'], ['Backs of the hands on the floor, light pressure','วางหลังมือลงพื้น ลงน้ำหนักเบาๆ'], O(QUAD, {s:[110,108],p:[62,110],h:[122,102]}))]),
    shoulderext: P(['Shoulder extension (for rings)','ยืดไหล่ด้านหลัง (สำหรับห่วง)'], ['shoulders','chest'], false, STAND, [
      V(['Hands on a bench behind','มือวางเก้าอี้ด้านหลัง'], ['Back to a bench, hands on it, bend the knees a little','หันหลังให้เก้าอี้ วางมือ งอเข่าเล็กน้อย'], {h:[90,36],s:[86,50],e:[76,70],w:[66,94],p:[92,86],k:[104,110],f:[104,134]}),
      V(['Deeper, sit lower','ลึกขึ้น ย่อลง'], ['Lower the hips, chest stays up','ย่อสะโพกลง อกยังตั้ง'], {h:[94,52],s:[88,66],e:[76,82],w:[66,94],p:[96,104],k:[118,112],f:[110,134]}),
      V(['On the floor, slide forward','บนพื้น เลื่อนสะโพก'], ['Sit, hands behind, slide the hips forward','นั่งพื้น มือวางด้านหลัง เลื่อนสะโพกไปข้างหน้า'], {h:[62,86],s:[58,100],e:[48,116],w:[40,132],p:[84,126],k:[112,124],f:[138,128]})]),
    savasana: P(['Relaxation (savasana)','ผ่อนคลาย (Savasana)'], ['relax'], false, LIE, [
      V(['Lie still','นอนนิ่ง'], ['Lie on your back, let everything go, slow breathing','นอนหงาย ปล่อยทุกส่วน หายใจช้าๆ'], LIE),
      V(['Lie still','นอนนิ่ง'], ['Lie on your back, let everything go, slow breathing','นอนหงาย ปล่อยทุกส่วน หายใจช้าๆ'], LIE),
      V(['Lie still','นอนนิ่ง'], ['Lie on your back, let everything go, slow breathing','นอนหงาย ปล่อยทุกส่วน หายใจช้าๆ'], LIE)])
  };

  /* ---------- gym-style stretches: dynamic (before training) and static (after training) ---------- */
  const DOOR = [['l', 56, 0, 56, 136]], WALL = [['l', 150, 0, 150, 136]];
  const ST_ = (kind, n, a, side, base, lv, deco) => ({n, a, side, base, lv, kind, deco});
  const LUNGE = {h:[124,96],s:[112,100],e:[116,120],w:[118,134],p:[92,106],k:[120,106],f:[126,134],k2:[70,132],f2:[44,134]};
  Object.assign(POSES, {
    armcircles: ST_('dyn', ['Arm circles','หมุนแขน'], ['shoulders'], false, STAND, [
      V(['Small circles','วงเล็ก'], ['Arms out, small controlled circles both ways','กางแขน หมุนวงเล็กช้าๆ ทั้งสองทิศ'], O(STAND, {e:[106,42],w:[122,40]})),
      V(['Big circles','วงใหญ่'], ['Full circles past the ears and the hips','หมุนวงเต็มผ่านหูและสะโพก'], O(STAND, {e:[91,20],w:[92,4]})),
      V(['Big and fast, on the toes','วงใหญ่ เร็วขึ้น เขย่งเท้า'], ['Faster full circles while rising on the toes','หมุนวงเต็มเร็วขึ้น พร้อมเขย่งปลายเท้า'], O(STAND, {h:[88,16],s:[90,32],p:[90,72],k:[90,102],e:[91,14],w:[92,0]}))]),
    torsotwist: ST_('dyn', ['Torso twists','บิดลำตัว'], ['spine'], false, STAND, [
      V(['Small twists','บิดเบาๆ'], ['Feet planted, turn the upper body side to side','เท้าวางนิ่ง หมุนลำตัวช่วงบนซ้ายขวา'], O(STAND, {e:[100,54],w:[110,66]})),
      V(['Arms swinging','แกว่งแขน'], ['Let the arms swing around with the turn','ปล่อยแขนแกว่งตามการหมุน'], O(STAND, {e:[106,40],w:[122,40]})),
      V(['Reaching','เอื้อมไกล'], ['Pivot the back foot and reach far behind','หมุนเท้าหลังตาม และเอื้อมไปข้างหลังให้ไกล'], O(STAND, {s:[94,38],e:[112,38],w:[130,36]}))]),
    catcow: ST_('dyn', ['Cat-cow','Cat-cow'], ['spine'], false, QUAD, [
      V(['Small range','ช่วงเล็ก'], ['On hands and knees, gently round and arch','คุกเข่าวางมือ โก่งและแอ่นหลังเบาๆ'], O(QUAD, {h:[134,92]})),
      V(['Full range','ช่วงเต็ม'], ['Round fully, then arch and look up','โก่งให้สุด แล้วแอ่นและเงยหน้า'], O(QUAD, {h:[128,112],s:[120,96]})),
      V(['Slow with breath','ช้าตามลมหายใจ'], ['Full range, 4 seconds each way with the breath','ช่วงเต็ม ทางละ 4 วินาทีตามลมหายใจ'], O(QUAD, {h:[126,114],s:[120,94],p:[72,98]}))]),
    legswing: ST_('dyn', ['Leg swings','เหวี่ยงขา'], ['hips','hamstrings'], true, STAND, [
      V(['Small swings','เหวี่ยงเบา'], ['Hold a wall, small relaxed swings','จับผนัง เหวี่ยงขาเบาๆ'], O(STAND, {k2:[98,108],f2:[108,132]})),
      V(['To hip height','ถึงระดับสะโพก'], ['Swing forward and back up to hip height','เหวี่ยงหน้า-หลังถึงระดับสะโพก'], O(STAND, {k2:[106,100],f2:[124,118]})),
      V(['High swings','เหวี่ยงสูง'], ['Tall posture, swing as high as control allows','ตัวตรง เหวี่ยงสูงเท่าที่ยังคุมได้'], O(STAND, {k2:[110,92],f2:[132,96]}))]),
    hipcircle: ST_('dyn', ['Hip circles','หมุนสะโพก'], ['hips'], false, STAND, [
      V(['Small','วงเล็ก'], ['Hands on hips, small circles','มือเท้าเอว หมุนวงเล็ก'], O(STAND, {p:[94,78]})),
      V(['Medium','วงกลาง'], ['Bigger circles both directions','หมุนวงใหญ่ขึ้นทั้งสองทิศ'], O(STAND, {p:[98,78],s:[88,38]})),
      V(['Large','วงใหญ่'], ['Big slow circles, knees soft','หมุนวงใหญ่ช้าๆ เข่างอเล็กน้อย'], O(STAND, {p:[102,80],s:[86,38],k:[94,108]}))]),
    worldsgreatest: ST_('dyn', ["World's greatest stretch",'ยืดทั้งตัว (World\u2019s greatest)'], ['hips','spine','hamstrings'], true, STAND, [
      V(['Lunge, hands down','ลันจ์ มือแตะพื้น'], ['Long lunge, both hands on the floor inside the front foot','ลันจ์ยาว มือทั้งสองวางพื้นด้านในเท้าหน้า'], LUNGE),
      V(['Elbow to instep','ศอกลงหาเท้า'], ['Drop the inside elbow toward the front foot','ลดศอกด้านในลงหาเท้าหน้า'], O(LUNGE, {s:[112,110],e:[114,128],w:[126,132],h:[126,108]})),
      V(['Rotate, arm up','บิดตัว ยกแขน'], ['Then rotate and reach the arm to the ceiling','แล้วบิดตัวยกแขนชี้เพดาน'], O(LUNGE, {s:[110,100],e:[108,80],w:[106,60],h:[120,96]}))]),
    inchworm: ST_('dyn', ['Inchworm','หนอนคืบ (Inchworm)'], ['hamstrings','shoulders'], false, STAND, [
      V(['Walk out to the knees','เดินมือออก วางเข่า'], ['Fold, walk the hands out, lower the knees','ก้มตัว เดินมือออกไป วางเข่าลง'], QUAD),
      V(['Walk out to a plank','เดินมือออกถึงแพลงก์'], ['Walk the hands out to a straight-arm plank and back','เดินมือออกจนเป็นแพลงก์แขนเหยียด แล้วกลับ'], {h:[142,94],s:[128,100],e:[129,116],w:[130,132],p:[74,116],k:[47,124],f:[20,132]}),
      V(['Plank + push-up','แพลงก์ + วิดพื้น'], ['Add one push-up at the plank','เพิ่มวิดพื้น 1 ครั้งตอนแพลงก์'], {h:[132,122],s:[116,124],e:[124,114],w:[130,132],p:[68,128],k:[44,130],f:[20,134]})]),
    deepsquat: ST_('dyn', ['Deep squat pry','ย่อลึกค้าง (Squat pry)'], ['hips','groin','calves'], false, STAND, [
      V(['Holding on','จับที่ยึด'], ['Hold a door frame or post and sink into a squat','จับวงกบประตูหรือเสา แล้วย่อลง'], {h:[86,58],s:[80,72],e:[98,78],w:[112,74],p:[70,104],k:[108,104],f:[98,134]}),
      V(['Deep, elbows in','ย่อลึก ศอกดันเข่า'], ['Hands together, elbows push the knees out','ประกบมือ ใช้ศอกดันเข่าออก'], {h:[90,72],s:[84,86],e:[100,104],w:[98,96],p:[76,120],k:[110,104],f:[100,134]}),
      V(['Deep, arms overhead','ย่อลึก ยกแขน'], ['Sit deep, chest tall, arms overhead','นั่งลึก อกตั้ง ยกแขนเหนือหัว'], {h:[90,72],s:[84,86],e:[90,64],w:[92,44],p:[76,120],k:[110,104],f:[100,134]})]),
    doorchest: ST_('static', ['Doorway chest stretch','ยืดอกที่วงกบประตู'], ['chest','shoulders'], true, STAND, [
      V(['Arm low','แขนต่ำ'], ['Forearm on the frame below the shoulder, turn away','วางแขนท่อนล่างต่ำกว่าไหล่ หมุนตัวออก'], O(STAND, {e:[76,64],w:[62,80]})),
      V(['Shoulder height','ระดับไหล่'], ['Arm at shoulder height, step through gently','แขนระดับไหล่ ก้าวผ่านเบาๆ'], O(STAND, {e:[72,40],w:[56,40]})),
      V(['Arm high, step through','แขนสูง ก้าวลึก'], ['Arm above the shoulder, lean further through','แขนสูงกว่าไหล่ เอนผ่านมากขึ้น'], O(STAND, {e:[74,28],w:[58,18],p:[94,78],k:[98,108],f:[100,134],s:[96,40],h:[98,24]}))], DOOR),
    crossbody: ST_('static', ['Cross-body shoulder stretch','ยืดไหล่ข้ามลำตัว'], ['shoulders'], true, STAND, [
      V(['Light','เบา'], ['Bring one arm across the chest, hold it at the forearm','ดึงแขนข้ามอก จับที่แขนท่อนล่าง'], O(STAND, {e:[100,48],w:[108,46]})),
      V(['Pull closer','ดึงชิดขึ้น'], ['Hold above the elbow and pull it closer','จับเหนือศอกแล้วดึงให้ชิดขึ้น'], O(STAND, {e:[102,44],w:[116,42]})),
      V(['Pull and turn','ดึงและหมุนตัว'], ['Pull close and turn the chest slightly away','ดึงชิดและหมุนอกออกเล็กน้อย'], O(STAND, {s:[94,38],e:[106,42],w:[122,40]}))]),
    tricepsoh: ST_('static', ['Overhead triceps stretch','ยืดหลังแขนเหนือหัว'], ['shoulders','back'], true, STAND, [
      V(['Hand behind the head','มือแตะหลังศีรษะ'], ['Arm overhead, bend the elbow, hand behind the head','ยกแขนงอศอก มือแตะหลังศีรษะ'], O(STAND, {e:[94,20],w:[82,30]})),
      V(['Pull the elbow','ดึงศอก'], ['Use the other hand to ease the elbow back','ใช้มืออีกข้างดึงศอกไปข้างหลังเบาๆ'], O(STAND, {e:[92,14],w:[78,26]})),
      V(['Add a side lean','เอียงตัวเพิ่ม'], ['Keep the pull and lean to the side','ดึงค้างไว้แล้วเอียงตัวไปด้านข้าง'], O(STAND, {s:[94,40],h:[96,26],e:[98,14],w:[84,24]}))]),
    latwall: ST_('static', ['Lat stretch at a wall','ยืดปีกที่ผนัง'], ['back','shoulders'], false, STAND, [
      V(['Hands high, light hinge','มือสูง พับเล็กน้อย'], ['Hands on the wall at shoulder height, hips back','มือวางผนังระดับไหล่ ถอยสะโพกไปข้างหลัง'], {h:[122,58],s:[112,60],e:[130,58],w:[146,56],p:[80,78],k:[82,108],f:[82,134]}),
      V(['Hinge to 90°','พับ 90 องศา'], ['Back flat, sink the chest between the arms','หลังตรง ยุบอกลงระหว่างแขน'], {h:[128,80],s:[118,76],e:[134,76],w:[148,74],p:[78,74],k:[82,108],f:[82,134]}),
      V(['Chest low','อกต่ำ'], ['Sink further, arms long','ยุบลงมากขึ้น แขนยาว'], {h:[130,92],s:[120,86],e:[136,82],w:[148,78],p:[76,72],k:[82,108],f:[82,134]})], WALL),
    hamstringst: ST_('static', ['Lying hamstring stretch','ยืดต้นขาหลังนอนหงาย'], ['hamstrings'], true, LIE, [
      V(['Knee bent','งอเข่า'], ['On your back, hold the raised leg with the knee bent','นอนหงาย จับขาที่ยกขึ้นโดยงอเข่า'], O(LIE, {k:[100,98],f:[118,90],e:[76,112],w:[98,96]})),
      V(['Straight leg','ขาเหยียด'], ['Straighten the leg, use a towel or strap if needed','เหยียดขา ใช้ผ้าช่วยได้'], O(LIE, {k:[106,102],f:[122,76],e:[80,112],w:[112,90]})),
      V(['Leg vertical','ขาตั้งตรง'], ['Straight leg pulled to vertical or past it','ดึงขาเหยียดขึ้นตั้งตรงหรือเลยกว่านั้น'], O(LIE, {k:[94,96],f:[96,64],e:[72,108],w:[94,84]}))]),
    quadstand: ST_('static', ['Standing quad stretch','ยืดต้นขาหน้ายืน'], ['quads'], true, STAND, [
      V(['Foot toward the glute','ดึงเท้าเข้าหาก้น'], ['Hold a wall, pull the heel toward the glute','จับผนัง ดึงส้นเท้าเข้าหาก้น'], O(STAND, {k2:[88,108],f2:[78,96],e:[86,74],w:[80,96]})),
      V(['Heel to glute','ส้นเท้าชิดก้น'], ['Knees together, heel to the glute','เข่าชิดกัน ส้นเท้าชิดก้น'], O(STAND, {k2:[88,108],f2:[74,86],e:[84,66],w:[76,84]})),
      V(['Knee back','ดันเข่าไปข้างหลัง'], ['Squeeze the glute and move the knee slightly back','บีบก้นแล้วดันเข่าไปข้างหลังเล็กน้อย'], O(STAND, {k2:[80,110],f2:[66,86],e:[78,66],w:[68,84]}))]),
    hipflexst: ST_('static', ['Kneeling hip flexor stretch','ยืดสะโพกหน้าคุกเข่า'], ['hips','quads'], true, KNEEL, [
      V(['Upright','ตัวตรง'], ['Half kneel, tuck the pelvis, squeeze the back glute','คุกเข่าข้างเดียว ม้วนสะโพก บีบก้นขาหลัง'], {h:[94,46],s:[92,62],e:[104,82],w:[112,100],p:[88,100],k:[116,104],f:[120,134],k2:[70,132],f2:[44,134]}),
      V(['Hips forward','ดันสะโพก'], ['Keep the tuck and shift the hips forward','ม้วนสะโพกค้างไว้ แล้วดันไปข้างหน้า'], {h:[92,50],s:[90,66],e:[94,86],w:[100,104],p:[92,108],k:[120,106],f:[124,134],k2:[70,132],f2:[44,134]}),
      V(['Arm up, lean','ยกแขน เอียงตัว'], ['Raise the arm on the back-leg side and lean away','ยกแขนข้างขาหลังแล้วเอียงตัวออก'], {h:[82,54],s:[86,70],e:[84,46],w:[84,28],p:[94,110],k:[122,106],f:[126,134],k2:[70,132],f2:[44,134]})]),
    glutest: ST_('static', ['Glute stretch (figure-four)','ยืดก้น (ไขว่ห้าง)'], ['hips'], true, LIEK, [
      V(['Ankle on the knee','ข้อเท้าบนเข่า'], ['On your back, cross the ankle over the knee','นอนหงาย ไขว่ข้อเท้าวางบนเข่า'], {h:[26,126],s:[40,128],e:[60,128],w:[76,130],p:[86,128],k:[110,104],f:[116,132],k2:[114,112],f2:[100,100]}),
      V(['Pull the legs in','ดึงขาเข้า'], ['Hold behind the thigh and pull toward the chest','จับหลังต้นขาแล้วดึงเข้าหาอก'], {h:[26,124],s:[40,128],e:[62,116],w:[98,104],p:[88,128],k:[112,100],f:[126,128],k2:[116,110],f2:[102,96]}),
      V(['Pull closer','ดึงชิดขึ้น'], ['Pull the legs closer, keep the hips down','ดึงขาชิดขึ้น สะโพกติดพื้น'], {h:[26,124],s:[40,128],e:[60,112],w:[90,100],p:[88,128],k:[104,96],f:[118,118],k2:[108,106],f2:[96,92]})]),
    calfwall: ST_('static', ['Calf stretch at a wall','ยืดน่องที่ผนัง'], ['calves'], true, STAND, [
      V(['Short step','ก้าวสั้น'], ['Hands on the wall, back leg straight, heel down','มือวางผนัง ขาหลังเหยียด ส้นเท้าติดพื้น'], {h:[122,40],s:[112,48],e:[130,46],w:[146,44],p:[96,80],k:[112,108],f:[118,134],k2:[80,108],f2:[70,134]}),
      V(['Longer step','ก้าวยาวขึ้น'], ['Step the back foot further back, heel still down','ถอยเท้าหลังไกลขึ้น ส้นเท้ายังติดพื้น'], {h:[126,46],s:[118,54],e:[134,52],w:[146,50],p:[98,84],k:[114,110],f:[120,134],k2:[70,108],f2:[58,134]}),
      V(['Bend the back knee','งอเข่าหลัง'], ['Bend the back knee to reach the lower calf','งอเข่าหลังเพื่อยืดน่องส่วนล่าง'], {h:[124,50],s:[116,58],e:[132,56],w:[146,54],p:[94,92],k:[114,112],f:[120,134],k2:[78,114],f2:[62,134]})], WALL),
    adductor: ST_('static', ['Side lunge stretch','ยืดขาด้านใน (Side lunge)'], ['groin'], true, WIDE, [
      V(['Shallow','ระดับเบา'], ['Wide stance, shift to one side, other leg straight','ยืนกว้าง ถ่ายน้ำหนักไปข้างหนึ่ง อีกขาเหยียด'], {h:[98,30],s:[98,46],e:[98,64],w:[98,82],p:[98,88],k:[80,110],f:[66,134],k2:[110,112],f2:[122,134]}),
      V(['Deep','ลึก'], ['Sit lower into the bent leg','ย่อลงที่ขาที่งอ'], {h:[106,48],s:[106,64],e:[106,82],w:[106,98],p:[108,104],k:[84,118],f:[62,134],k2:[122,108],f2:[124,134]}),
      V(['Deep, hands down','ลึก มือแตะพื้น'], ['Hands on the floor, hips low','มือแตะพื้น สะโพกต่ำ'], {h:[112,70],s:[110,84],e:[110,104],w:[110,124],p:[108,106],k:[84,118],f:[62,134],k2:[122,108],f2:[124,134]})]),
    forearmst: ST_('static', ['Forearm & wrist stretch','ยืดแขนท่อนล่างและข้อมือ'], ['wrists'], false, STAND, [
      V(['Light pull','ดึงเบา'], ['Arm straight in front, gently pull the fingers back','เหยียดแขนไปข้างหน้า ดึงนิ้วกลับเบาๆ'], O(STAND, {e:[106,46],w:[122,46]})),
      V(['Both directions','ทั้งสองทาง'], ['Pull the fingers back, then the back of the hand down','ดึงนิ้วขึ้น แล้วกดหลังมือลง'], O(STAND, {e:[106,44],w:[122,38]})),
      V(['Palms on the floor','ฝ่ามือวางพื้น'], ['Kneel, palms down, fingers toward the knees','คุกเข่า วางฝ่ามือ นิ้วชี้หาเข่า'], O(QUAD, {s:[112,104],p:[64,106],h:[124,98]}))]),
    neckst: ST_('static', ['Neck side stretch','ยืดคอด้านข้าง'], ['neck'], true, STAND, [
      V(['Head tilt','เอียงศีรษะ'], ['Tilt the ear toward the shoulder','เอียงหูเข้าหาไหล่'], O(STAND, {h:[84,24]})),
      V(['Hand assist','ใช้มือช่วย'], ['Rest the hand on the head for a light pull','วางมือบนศีรษะช่วยดึงเบาๆ'], O(STAND, {h:[80,26],e:[80,12],w:[80,20]})),
      V(['Shoulder down','กดไหล่ลง'], ['Add: reach the other hand toward the floor','เพิ่ม: เอื้อมมืออีกข้างลงหาพื้น'], O(STAND, {h:[78,28],e:[92,62],w:[96,82]}))])
  });
  const AREA = {back:['Back & lats','หลังและปีก'], neck:['Neck','คอ'], hamstrings:['Hamstrings','ต้นขาหลัง'], hips:['Hips','สะโพก'], quads:['Quads','ต้นขาหน้า'], groin:['Inner thighs','ขาด้านใน'],
    calves:['Calves','น่อง'], spine:['Spine','กระดูกสันหลัง'], shoulders:['Shoulders','ไหล่'], chest:['Chest','อก'], wrists:['Wrists','ข้อมือ'], relax:['Relaxation','ผ่อนคลาย']};

  /* ---------- sessions ---------- */
  const S = (id, icon, lvl, n, d, poses, group) => ({id, icon, lvl, n, d, poses, group:group || 'yoga'});
  const SESS = [
    // stretching sessions (not yoga): dynamic before training, static after training
    S('pre_full', '🔥', 1, ['Before training: full body','ก่อนซ้อม: ทั้งตัว'], ['Dynamic stretches that warm up every joint, about 6 minutes','ยืดแบบเคลื่อนไหวให้ทุกข้อต่อพร้อม ประมาณ 6 นาที'],
      [['armcircles',30],['torsotwist',30],['catcow',30],['legswing',25],['hipcircle',30],['worldsgreatest',30],['inchworm',40],['deepsquat',40]], 'pre'),
    S('pre_upper', '💪', 1, ['Before training: upper body & rings','ก่อนซ้อม: ช่วงบนและห่วง'], ['Shoulders, upper back and wrists ready for pushing, pulling and rings','เตรียมไหล่ หลังบน และข้อมือ สำหรับท่าดัน ดึง และห่วง'],
      [['armcircles',30],['torsotwist',30],['catcow',30],['inchworm',40],['wristprep',40],['threadneedle',25]], 'pre'),
    S('pre_lower', '🦵', 1, ['Before training: legs','ก่อนซ้อม: ขา'], ['Hips, hamstrings and ankles ready for squats, lunges and hinges','เตรียมสะโพก ต้นขาหลัง และข้อเท้า สำหรับ squat ลันจ์ และพับสะโพก'],
      [['legswing',25],['hipcircle',30],['worldsgreatest',30],['deepsquat',45],['catcow',30],['inchworm',40]], 'pre'),
    S('post_full', '🧊', 1, ['After training: full body','หลังซ้อม: ทั้งตัว'], ['Static stretches, held 30-40 s, for the whole body','ยืดค้าง 30-40 วินาที ทั้งตัว'],
      [['doorchest',30],['latwall',40],['hamstringst',35],['hipflexst',30],['glutest',35],['calfwall',30]], 'post'),
    S('post_upper', '🫁', 1, ['After training: upper body','หลังซ้อม: ช่วงบน'], ['Chest, shoulders, lats, arms, wrists and neck','อก ไหล่ ปีก แขน ข้อมือ และคอ'],
      [['doorchest',30],['crossbody',30],['tricepsoh',30],['latwall',40],['forearmst',30],['neckst',20]], 'post'),
    S('post_lower', '🧊', 1, ['After training: legs','หลังซ้อม: ขา'], ['Hamstrings, quads, hip flexors, glutes, inner thighs and calves','ต้นขาหลัง ต้นขาหน้า สะโพกหน้า ก้น ขาด้านใน และน่อง'],
      [['hamstringst',35],['quadstand',30],['hipflexst',30],['glutest',35],['adductor',30],['calfwall',30]], 'post'),
    S('morning', '🌅', 1, ['Morning flow','โยคะตอนเช้า'], ['Wake up the spine and hips gently','ปลุกกระดูกสันหลังและสะโพกเบาๆ'],
      [['childpose',45],['cobra',30],['downdog',40],['lowlunge',30],['forwardfold',40],['sidebend',30],['savasana',60]]),
    S('bed', '🌙', 1, ['Bedtime relax','ผ่อนคลายก่อนนอน'], ['Slow, quiet stretches to unwind','ยืดช้าๆ เงียบๆ เพื่อผ่อนคลาย'],
      [['childpose',60],['supinetwist',45],['happybaby',45],['butterfly',60],['seatedfold',60],['savasana',120]]),
    S('hips', '🦋', 2, ['Hips & hamstrings','สะโพกและต้นขาหลัง'], ['Open the hips and the back of the legs','เปิดสะโพกและด้านหลังขา'],
      [['lowlunge',45],['lizard',45],['pigeon',60],['butterfly',60],['frog',60],['happybaby',45],['supinetwist',45],['savasana',60]]),
    S('shoulders', '🔘', 2, ['Shoulders for rings','ไหล่สำหรับห่วง'], ['Wrists, chest and shoulder extension for ring work','ข้อมือ อก และการยืดไหล่ด้านหลังสำหรับห่วง'],
      [['wristprep',45],['threadneedle',45],['chestopen',45],['childpose',60],['shoulderext',45],['sidebend',30],['cobra',45],['savasana',60]]),
    S('full', '🌿', 2, ['Full-body flexibility','ยืดเหยียดทั้งตัว'], ['A complete session for every area','เซสชันครบทุกส่วน'],
      [['downdog',45],['forwardfold',45],['lowlunge',45],['triangle',40],['pigeon',60],['seatedfold',60],['butterfly',60],['bridge',40],['camel',30],['childpose',45],['supinetwist',40],['savasana',90]]),
    S('deep', '🔥', 3, ['Deep flexibility','ยืดลึกขั้นสูง'], ['Long holds toward splits, pancake and backbends','ค้างนานเพื่อสปลิต แพนเค้ก และแอ่นหลัง'],
      [['downdog',60],['splitsprep',60],['lizard',60],['frog',90],['widefold',90],['pigeon',90],['camel',45],['bridge',45],['seatedfold',90],['savasana',90]])
  ];
  // pick the stretching session that matches the muscles of a workout
  function zoneOf(exIds){
    let up = 0, lo = 0;
    exIds.forEach(id => (EX[id] ? EX[id].p : []).forEach(m => { if(['chest','shoulders','triceps','lats','upperback','biceps'].includes(m)) up++; if(['quads','glutes','hamstrings','calves'].includes(m)) lo++; }));
    return up && lo && Math.min(up, lo) / Math.max(up, lo) > .3 ? 'full' : lo > up ? 'lower' : up ? 'upper' : 'full';
  }
  const preFor = exIds => SESS.find(s => s.id === 'pre_' + zoneOf(exIds));
  const postFor = exIds => SESS.find(s => s.id === 'post_' + zoneOf(exIds));

  /* ---------- per-pose level memory ---------- */
  const defLvl = () => SET.exp === 'exp' ? 2 : 1;
  const lvlOf = id => YLVL[id] || defLvl();
  function feel(id, how){
    const lv = lvlOf(id);
    if(how === 'hard'){ YFEEL[id] = 0; if(lv > 1){ YLVL[id] = lv - 1; toast(t('yg_down', L(POSES[id].lv[lv - 2].n))); } }
    else if(how === 'easy'){
      YFEEL[id] = (YFEEL[id] || 0) + 1;
      if(lv < 3 && YFEEL[id] >= 2){ YLVL[id] = lv + 1; YFEEL[id] = 0; toast(t('yg_up', L(POSES[id].lv[lv].n))); }
      else if(lv < 3) toast(t('yg_easy_once'));
    } else YFEEL[id] = 0;
    save();
  }
  const minutesSince = ts => Math.round(YLOG.filter(y => y.t >= ts).reduce((s, y) => s + (y.min || 0), 0));
  const totalSec = poses => poses.reduce((s, [id, sec]) => s + sec * (POSES[id].side ? 2 : 1) + 8, 0);

  /* ---------- views ---------- */
  function lvlChips(id, cur, attr){
    return `<div class="seg">${[1, 2, 3].map(l => `<button data-${attr}="${l}" class="${cur === l ? 'on' : ''}">${'●'.repeat(l)}${'○'.repeat(3 - l)}</button>`).join('')}</div>`;
  }
  function homeView(){
    const wk = minutesSince(Date.now() - 7*DAY);
    const areas = Object.keys(AREA).filter(a => a !== 'relax');
    const areaLvl = a => { const ps = Object.keys(POSES).filter(id => POSES[id].a.includes(a)); return ps.reduce((s, id) => s + lvlOf(id), 0) / ps.length; };
    app.innerHTML = `<h1>🧘 ${t('yg_title')}</h1><p class="sub">${t('yg_sub')}</p>
      <div class="card"><div class="row"><b class="grow">${t('yg_week')}</b><b>${wk} ${t('minutes')}</b></div>
        <small>${t('yg_week_note')}</small></div>
      <h2>🤸 ${t('st_title')}</h2><p class="sub">${t('st_intro')}</p>
      ${['pre', 'post'].map(g => `<div class="lbl-sm">${t('st_' + g)}</div><small class="note" style="margin-top:-4px">${t('st_' + g + '_note')}</small>
        <div class="grid2" style="margin-bottom:10px">${SESS.filter(s => s.group === g).map(tile).join('')}</div>`).join('')}
      <h2>🧘 ${t('yg_yoga')}</h2>
      ${[1, 2, 3].map(lv => `<div class="lbl-sm">${t('lvl_' + lv)}</div><div class="grid2">${SESS.filter(s => s.group === 'yoga' && s.lvl === lv).map(tile).join('')}</div>`).join('')}
      <h2>▶ ${t('yv_title')}</h2><p class="sub">${t('yv_sub')}</p>
      <div class="grid2">${YT_CATS.map(([c, icon]) => `<div class="card sess tile" data-yvc="${c}"><div class="emoji">${icon}</div><b>${t('yvc_' + c)}</b>
        <small>${t('yv_n', (YT_SESS[c] || []).length)}</small></div>`).join('')}</div>
      <h2>${t('yg_profile')}</h2><div class="card"><small>${t('yg_profile_note')}</small>
        ${areas.map(a => `<div class="bar-row"><span class="lbl">${L(AREA[a])}</span><div class="track"><div class="fill" style="width:${Math.round(areaLvl(a) / 3 * 100)}%"></div></div><span class="n">${areaLvl(a).toFixed(1)}/3</span></div>`).join('')}</div>
      <h2>${t('yg_poses')}</h2>${segHTML('ylib', [['stretch', t('yg_lib_stretch')], ['yoga', t('yg_lib_yoga')]], view.lib || 'stretch')}
      ${Object.keys(POSES).filter(id => id !== 'savasana' && ((view.lib || 'stretch') === 'yoga' ? !POSES[id].kind : !!POSES[id].kind)).map(id => `<div class="card sess item" data-yp="${id}"><div class="row"><div class="grow"><b>${L(POSES[id].n)}</b><br>
        <small>${POSES[id].a.map(a => L(AREA[a])).join(' · ')}${POSES[id].side ? ' · ' + t('yg_bothsides') : ''}</small></div><span class="tag">${'●'.repeat(lvlOf(id))}${'○'.repeat(3 - lvlOf(id))}</span></div></div>`).join('')}`;
    on('[data-ys]', el => go('yoga', {name:'ysess', id:el.dataset.ys}));
    on('[data-yvc]', el => go('yoga', {name:'yvids', cat:el.dataset.yvc}));
    on('[data-yp]', el => go('yoga', {name:'ypose', id:el.dataset.yp}));
    on('[data-ylib]', el => { view.lib = el.dataset.ylib; render(); });
  }
  const tile = s => `<div class="card sess tile" data-ys="${s.id}"><div class="emoji">${s.icon}</div><b>${L(s.n)}</b>
    <small>${Math.round(totalSec(s.poses) / 60)} ${t('minutes')} · ${t('yg_n_poses', s.poses.length)}</small></div>`;
  function poseView(){
    const id = view.id, p = POSES[id], cur = lvlOf(id), show = view.show || cur, v = p.lv[show - 1];
    app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${L(p.n)}</h1>
      <div class="chips" style="margin:0 0 10px">${p.kind ? `<span class="chip">${t('st_kind_' + p.kind)}</span>` : ''}${p.a.map(a => `<span class="chip p">${L(AREA[a])}</span>`).join('')}${p.side ? `<span class="chip">${t('yg_bothsides')}</span>` : ''}</div>
      ${lvlChips(id, show, 'yshow')}
      <div class="card ${cur === show ? 'hl' : ''}"><div class="row"><b class="grow">${L(v.n)}</b>
        ${cur === show ? `<span class="chip p">${t('yg_yours')}</span>` : `<button class="chip" id="ysetl">${t('yg_pick')}</button>`}</div>
        ${figSVG('figure')}<small>${L(v.d)}</small></div>
      ${p.lv.map((x, i) => `<div class="setrow"><span>${'●'.repeat(i + 1)}${'○'.repeat(2 - i)}</span><small class="grow">${L(x.n)}</small>${cur === i + 1 ? '✓' : ''}</div>`).join('')}
      ${vidBlock(id)}<small class="note">${t('yg_safety')}</small>`;
    startAnim(document.getElementById('figure'), {A:p.base, B:v.pose, deco:p.deco}, {areas:p.a});
    $('#back').onclick = () => go('yoga', {name:'home', lib:p.kind ? 'stretch' : 'yoga'});
    on('[data-yshow]', el => { view.show = +el.dataset.yshow; render(); });
    if($('#ysetl')) $('#ysetl').onclick = () => { YLVL[id] = show; YFEEL[id] = 0; save(); render(); };
  }
  function sessView(){
    const s = SESS.find(x => x.id === view.id) || view.custom;
    app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${s.icon} ${L(s.n)}</h1><p class="sub">${L(s.d)}</p>
      <div class="card"><small>${Math.round(totalSec(s.poses) / 60)} ${t('minutes')} · ${t('yg_n_poses', s.poses.length)} · ${t('yg_level_note')}</small></div>` +
      s.poses.map(([id, sec], i) => { const p = POSES[id], lv = lvlOf(id);
        return `<div class="card item"><div class="row"><span class="num">${i + 1}</span><div class="grow"><b>${L(p.n)}</b><br>
          <small>${sec}s${p.side ? ' × 2 ' + t('yg_sides') : ''} · ${L(p.lv[lv - 1].n)}</small></div><span class="tag">${'●'.repeat(lv)}${'○'.repeat(3 - lv)}</span></div></div>`; }).join('') +
      (SESS_CAT[s.id] && YT_SESS[SESS_CAT[s.id]] ? `<h2>📺 ${t('yv_or')}</h2>` + YT_SESS[SESS_CAT[s.id]].slice(0, 3).map(vidCard).join('') +
        `<button class="chip" data-yvc="${SESS_CAT[s.id]}">${t('yv_more', t('yvc_' + SESS_CAT[s.id]))} →</button><div style="height:70px"></div>` : '') +
      `<button class="btn sticky" id="ygo">▶ ${t('yg_start')}</button>`;
    $('#back').onclick = () => go('yoga');
    on('[data-yvc]', el => go('yoga', {name:'yvids', cat:el.dataset.yvc}));
    vidDone();
    $('#ygo').onclick = () => start(s, () => go('yoga'));
  }
  // ---- full follow-along YouTube classes (data in videos.js)
  const SESS_CAT = {morning:'morning', bed:'bed', hips:'hips', shoulders:'neck', full:'flex', deep:'yin', post_full:'post', post_upper:'post', post_lower:'post'};
  const fmtViews = n => n >= 1e6 ? t('yv_views_m', (n / 1e6).toFixed(n >= 1e7 ? 0 : 1)) : t('yv_views_k', Math.max(1, Math.round(n / 1e3)));
  const vidCard = ([id, title, ch, sec, views]) => `<div class="card"><div class="ytbox" data-yt="${id}"><button class="ytplay ythumb" aria-label="${t('yt_play')}">
      <img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="ytbtn">▶</span></button></div>
    <b style="display:block;margin-top:8px">${esc(title)}</b>
    <small>${esc(ch)} · ⏱ ${Math.round(sec / 60)} ${t('minutes')}${views ? ' · 👁 ' + fmtViews(views) : ''}</small>
    <button class="btn ghost small" data-ydone="${id}" data-min="${Math.round(sec / 60)}" style="margin-top:8px">✓ ${t('yv_done', Math.round(sec / 60))}</button></div>`;
  // "I did it" counts the class minutes toward the weekly yoga total
  function vidDone(){
    on('[data-ydone]', el => {
      YLOG.push({id:newId(), t:Date.now(), sess:'yt:' + el.dataset.ydone, min:+el.dataset.min, poses:[]}); save();
      el.disabled = true; el.textContent = '✓ ' + t('yv_logged'); toast(t('yv_logged'));
    });
  }
  function vidsView(){
    const c = view.cat, list = YT_SESS[c] || [], icon = (YT_CATS.find(x => x[0] === c) || [])[1] || '▶';
    app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${icon} ${t('yvc_' + c)}</h1>
      <p class="sub">${t('yv_list_note')}</p>${list.map(vidCard).join('')}<small class="note">${t('yg_safety')}</small>`;
    $('#back').onclick = () => go('yoga');
    vidDone();
  }
  // build the step list: one step per side
  function steps(poses){ const out = []; poses.forEach(([id, sec]) => { if(POSES[id].side){ out.push({id, sec, side:1}, {id, sec, side:2}); } else out.push({id, sec, side:0}); }); return out; }
  function start(s, after, opts){
    view = {name:'yrun', sess:s, st:steps(s.poses), i:0, after, t0:Date.now(), done:[], kind:(opts && opts.kind) || 'yoga', ask:null};
    // calm background sound for yoga and the cool-down (not before training, where the workout music may play)
    if(view.kind !== 'warm' && SET.amb && SET.amb !== 'off') Sound.startAmbient(SET.amb);
    render(); window.scrollTo(0, 0);
  }
  const VL = pair => SET.voiceLang === 'th' ? pair[1] : pair[0];
  const rate = () => SET.ygRate === 'normal' ? .95 : .8;
  function runView(){
    const v = view, step = v.st[v.i];
    if(!step) return finish();
    const p = POSES[step.id], lv = lvlOf(step.id), lvl = p.lv[lv - 1], next = v.st[v.i + 1];
    const routine = v.kind === 'warm' || v.kind === 'cool', guide = SET.ygVoice !== false;
    const prepSec = step.side === 2 ? Math.min(4, SET.ygPrep) : SET.ygPrep;
    if(v.phase == null){ v.phase = prepSec > 0 ? 'prep' : 'hold'; v.remain = v.phase === 'prep' ? prepSec : step.sec; }
    // say the pose and how to do it once, slowly, when the step starts
    if(guide && v.spoken !== v.i){
      v.spoken = v.i;
      Sound.say(step.side === 2 ? tv('yv_side2', VL(p.n)) : VL(p.n) + '. ' + (step.id === 'savasana' ? '' : VL(lvl.n) + '. ') + VL(lvl.d), {rate:rate()});
    }
    app.innerHTML = `<div class="runbar"><button class="chip" id="yq">${routine ? t('rt_skip') + ' ⏭' : '✕'}</button>
        <div class="track grow"><div class="fill" style="width:${v.i / v.st.length * 100}%"></div></div><small>${v.i + 1}/${v.st.length}</small>
        ${v.kind !== 'warm' ? `<button class="chip mini" id="yamb" aria-label="${t('yg_set_amb')}">${Sound.ambientOn() ? '🌊' : '🔇'}</button>` : ''}</div>
      ${v.ask ? `<div class="card hl"><small>${t('yg_how', L(POSES[v.ask].n))}</small><div class="row gap" style="margin-top:6px">
        <button class="btn ghost small" data-feel="hard">😣 ${t('yg_hard')}</button><button class="btn ghost small" data-feel="ok">🙂 ${t('yg_ok')}</button><button class="btn ghost small" data-feel="easy">😌 ${t('yg_easy')}</button></div></div>` : ''}
      <div class="lbl-sm">${v.kind === 'cool' ? '🧊 ' + t('rt_cool') : v.kind === 'warm' ? '🤸 ' + t('rt_warm') : L(v.sess.n)}${step.side ? ' · ' + t(step.side === 1 ? 'yg_side1' : 'yg_side2') : ''}</div>
      <h1>${L(p.n)}</h1>
      ${step.id !== 'savasana' ? lvlChips(step.id, lv, 'ylv') : ''}
      ${figSVG('figure')}
      <p style="margin:6px 0"><b>${L(lvl.n)}</b> — ${L(lvl.d)}</p>
      <div class="card center"><small id="yph">${v.phase === 'prep' ? t('yg_getready') : t('yg_hold')}</small><b class="bigtime" id="yt">${fmtTime(v.remain)}</b>
        <div class="row gap"><button class="btn ghost" id="yprev" ${v.i === 0 ? 'disabled' : ''}>←</button><button class="btn" id="ypause">${v.paused ? '▶ ' + t('yg_resume') : '⏸ ' + t('yg_pause')}</button><button class="btn ghost" id="ynext">⏭</button></div></div>
      ${next ? `<small class="note">${t('up_next')}: ${L(POSES[next.id].n)}${next.side === 2 ? ' (' + t('yg_side2') + ')' : ''}</small>` : ''}
      ${vidBlock(step.id, true)}`;
    startAnim(document.getElementById('figure'), {A:p.base, B:lvl.pose, deco:p.deco}, {areas:p.a});
    if(v.iv) clearInterval(v.iv);
    let last = -1; v.end = Date.now() + v.remain * 1000;
    const tick = () => {
      if(v.paused) return;
      const n = Math.ceil((v.end - Date.now()) / 1000); v.remain = Math.max(0, n);
      if(n !== last){
        last = n; const el = document.getElementById('yt'); if(el) el.textContent = fmtTime(Math.max(0, n));
        if(v.phase === 'hold' && n > 0){
          if(guide && n <= 5) Sound.say(String(n), {rate:1});                        // 5, 4, 3, 2, 1
          else if(!guide && n <= 3) Sound.play('tick');
          if(guide && step.sec >= 30 && step.id !== 'savasana' && n === Math.floor(step.sec / 2)) Sound.say(tv('yv_breathe'), {rate:rate()});
        }
      }
      if(n <= 0){
        if(v.phase === 'prep'){ // get-ready time is over: start holding
          v.phase = 'hold'; v.remain = step.sec; v.end = Date.now() + step.sec * 1000; last = -1; Sound.play('log');
          const ph = document.getElementById('yph'); if(ph) ph.textContent = t('yg_hold');
        } else advance();
      }
    };
    v.iv = setInterval(tick, 200);
    const advance = () => {
      // count the time actually spent holding (skipping early counts less)
      const spent = v.phase === 'hold' ? Math.max(0, step.sec - (v.remain == null ? step.sec : v.remain)) : 0;
      clearInterval(v.iv); v.iv = null; v.remain = null; v.phase = null;
      v.done.push({id:step.id, lvl:lvlOf(step.id), sec:spent});
      const nx = v.st[v.i + 1];
      if(step.side === 1){ Sound.play('log'); if(!guide) Sound.say(tv('yv_switch')); }
      else { Sound.play('go'); if(nx && !guide) Sound.say(tv('yv_next', VL(POSES[nx.id].n))); if(step.id !== 'savasana') v.ask = step.id; }
      v.i++; render(); window.scrollTo(0, 0);
    };
    on('[data-ylv]', el => {
      YLVL[step.id] = +el.dataset.ylv; YFEEL[step.id] = 0; save();
      if(guide){ const nl = p.lv[+el.dataset.ylv - 1]; Sound.say(VL(nl.n) + '. ' + VL(nl.d), {rate:rate()}); }
      render();
    });
    on('[data-feel]', el => { feel(v.ask, el.dataset.feel); v.ask = null; render(); });
    $('#ypause').onclick = () => { v.paused = !v.paused; if(!v.paused) v.end = Date.now() + v.remain * 1000; $('#ypause').textContent = v.paused ? '▶ ' + t('yg_resume') : '⏸ ' + t('yg_pause'); };
    $('#ynext').onclick = advance;
    $('#yprev').onclick = () => { clearInterval(v.iv); v.iv = null; v.remain = null; v.phase = null; v.spoken = null; v.i = Math.max(0, v.i - 1); render(); };
    $('#yq').onclick = () => { if(!routine && v.done.length && !confirm(t('yg_quit'))) return; clearInterval(v.iv); v.i = v.st.length; finish(); };
    if($('#yamb')) $('#yamb').onclick = () => {
      if(Sound.ambientOn()) Sound.stopAmbient(); else Sound.startAmbient(SET.amb !== 'off' ? SET.amb : 'pad');
      $('#yamb').textContent = Sound.ambientOn() ? '🌊' : '🔇';
    };
  }
  function finish(){
    const v = view; if(v.iv) clearInterval(v.iv); Sound.stopAmbient(); try { speechSynthesis.cancel(); } catch(e){}
    const sec = v.done.reduce((s, d) => s + d.sec, 0);
    if(sec > 0){ YLOG.push({id:newId(), t:Date.now(), sess:v.sess.id || v.kind, min:Math.round(sec / 6) / 10, poses:v.done.map(d => [d.id, d.lvl])}); save(); }
    if(v.kind === 'cool' || v.kind === 'warm') return v.after();
    Sound.play('finish');
    view = {name:'ysum', sess:v.sess, sec, n:v.done.length, after:v.after, ask:v.ask};
    render(); window.scrollTo(0, 0);
  }
  function sumView(){
    const v = view;
    app.innerHTML = `<div class="hero-top"><div class="logo">🧘</div><h1>${t('yg_done')}</h1><p class="sub">${L(v.sess.n)}</p></div>
      <div class="grid2"><div class="card stat"><b>${Math.round(v.sec / 60)}</b><small>${t('minutes')}</small></div><div class="card stat"><b>${v.n}</b><small>${t('yg_poses_done')}</small></div></div>
      ${v.ask ? `<div class="card hl"><small>${t('yg_how', L(POSES[v.ask].n))}</small><div class="row gap" style="margin-top:6px">
        <button class="btn ghost small" data-feel="hard">😣 ${t('yg_hard')}</button><button class="btn ghost small" data-feel="ok">🙂 ${t('yg_ok')}</button><button class="btn ghost small" data-feel="easy">😌 ${t('yg_easy')}</button></div></div>` : ''}
      <button class="btn" id="ydone">${t('done')}</button>`;
    on('[data-feel]', el => { feel(v.ask, el.dataset.feel); v.ask = null; render(); });
    $('#ydone').onclick = () => v.after();
  }
  function exportState(){ return {yoga:YLOG, ylvl:YLVL}; }
  function importState(d){
    if(Array.isArray(d.yoga)) YLOG = d.yoga.filter(y => isObj(y) && typeof y.t === 'number');
    if(isObj(d.ylvl)) YLVL = Object.fromEntries(Object.entries(d.ylvl).filter(([k, v]) => POSES[k] && [1, 2, 3].includes(v)));
    save();
  }
  function clear(){ YLOG = []; YLVL = {}; YFEEL = {}; save(); }
  function summary(){ return `${minutesSince(Date.now() - 7*DAY)} min this week; pose levels: ` + (Object.entries(YLVL).map(([k, v]) => k + ' ' + v + '/3').join(', ') || 'defaults'); }
  return {load, save, POSES, SESS, preFor, postFor, start, homeView, poseView, sessView, vidsView, runView, sumView, minutesSince, exportState, importState, clear, summary};
})();
