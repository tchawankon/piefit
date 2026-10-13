'use strict';
/* PieFit exercise data: muscles, exercises, animations, progression paths. */
const MUSCLES = {
  chest:'Chest', shoulders:'Shoulders', triceps:'Triceps', lats:'Lats', upperback:'Upper back',
  biceps:'Biceps', core:'Core', glutes:'Glutes', quads:'Quads', hamstrings:'Hamstrings'
};

// Poses are side-view joints in a 180x150 box: h head, s shoulder, e elbow, w wrist, p hip, k knee, f foot, k2/f2 rear leg.
// grip = joint held by the rings ('w' or 'f2'/'f'), ax = x of the ring anchor on the bar.
const EX = {
  pushup:{name:'Ring Push-up', lvl:2, p:['chest','triceps','shoulders'], s:['core'], rx:'8-12',
    cues:['Rings about knee height, hands under shoulders','Body one straight line, glutes tight','Turn rings out slightly at the top','Elbows ~45° from the ribs on the way down'],
    prog:'Easier: push-up on floor or rings higher. Harder: feet elevated, RTO push-up.',
    anim:{ax:130,grip:'w',
      A:{h:[142,60],s:[128,68],e:[129,82],w:[130,98],p:[74,98],k:[47,113],f:[20,128]},
      B:{h:[128,94],s:[112,92],e:[124,80],w:[130,98],p:[66,110],k:[43,119],f:[20,128]}}},
  pike:{name:'Ring Pike Push-up', lvl:3, p:['shoulders','triceps'], s:['chest','core'], rx:'5-8',
    cues:['Hips high, rings under shoulders','Head travels between the rings','Press back up without shrugging']},
  dip:{name:'Ring Dip', lvl:3, p:['chest','triceps','shoulders'], s:['core'], rx:'4-8',
    cues:['Start in a locked-out support, rings turned out','Lean slightly forward, lower under control','Keep rings close to the body','Press up and re-lock the elbows'],
    prog:'Easier: ring support hold, then negatives or feet-assisted dips.',
    anim:{ax:112,grip:'w',
      A:{h:[114,26],s:[110,38],e:[110,54],w:[110,70],p:[108,82],k:[112,104],f:[108,124]},
      B:{h:[116,56],s:[112,70],e:[96,72],w:[110,70],p:[108,108],k:[114,124],f:[100,130]}}},
  tricep:{name:'Ring Triceps Extension', lvl:2, p:['triceps'], s:['core','shoulders'], rx:'8-12',
    cues:['Rings at about waist height, lean forward','Elbows stay narrow and fixed','Extend arms fully, body stays rigid']},
  row:{name:'Ring Row', lvl:1, p:['lats','upperback','biceps'], s:['core'], rx:'8-12',
    cues:['Rings at about waist height, body under the rings','Squeeze shoulder blades first, then bend the elbows','Pull rings to the lower chest','Body stays a straight plank'],
    prog:'Easier: more upright body. Harder: feet elevated, one-arm-assisted rows.',
    anim:{ax:124,grip:'w',
      A:{h:[126,98],s:[114,92],e:[119,72],w:[124,52],p:[70,110],k:[46,119],f:[22,128]},
      B:{h:[124,70],s:[112,68],e:[102,60],w:[124,52],p:[67,98],k:[44,113],f:[22,128]}}},
  pullup:{name:'Ring Pull-up', lvl:3, p:['lats','biceps','upperback'], s:['core'], rx:'3-8',
    cues:['Start from a dead hang, shoulders packed','Pull elbows down toward the hips','Rings to the chest, chin above the hands','Lower fully with control'],
    prog:'Easier: ring rows, band-assisted. Harder: chest-to-ring, L-sit pull-up.',
    anim:{ax:100,grip:'w',
      A:{h:[108,50],s:[100,58],e:[100,40],w:[100,22],p:[100,92],k:[102,110],f:[100,128]},
      B:{h:[113,26],s:[104,36],e:[94,34],w:[100,22],p:[102,70],k:[104,90],f:[102,108]}}},
  facepull:{name:'Ring Face Pull', lvl:1, p:['upperback','shoulders'], s:['biceps'], rx:'10-15',
    cues:['Rings high, lean back with straight body','Pull hands toward the face, elbows high and wide','Finish with hands beside the ears, thumbs back'],
    anim:{ax:126,grip:'w',
      A:{h:[118,90],s:[106,82],e:[116,66],w:[124,50],p:[68,104],k:[44,116],f:[22,128]},
      B:{h:[116,86],s:[104,80],e:[96,62],w:[114,56],p:[68,102],k:[44,115],f:[22,128]}}},
  curl:{name:'Ring Biceps Curl', lvl:2, p:['biceps'], s:['upperback'], rx:'8-12',
    cues:['Lean back, arms straight, palms up','Curl hands toward the forehead','Elbows stay high, body rigid']},
  fallout:{name:'Ring Fallout', lvl:2, p:['core'], s:['shoulders','lats'], rx:'6-10',
    cues:['Rings low, forearm-plank start, glutes squeezed','Reach arms forward while the body stays straight','Stop before the lower back sags','Pull back using abs and lats'],
    prog:'Easier: from knees. Harder: from feet, longer lever.',
    anim:{ax:100,grip:'w',
      A:{h:[112,70],s:[96,76],e:[96,90],w:[100,102],p:[60,100],k:[40,114],f:[20,128]},
      B:{h:[132,86],s:[118,92],e:[130,98],w:[142,102],p:[70,108],k:[44,118],f:[20,128]}}},
  hollow:{name:'Hollow Body Hold', lvl:1, p:['core'], s:[], rx:'20-40s', hold:true,
    cues:['Lower back pressed into the floor','Legs and shoulders slightly off the floor','Arms overhead, ribs down']},
  support:{name:'Ring Support Hold', lvl:2, p:['triceps','chest','shoulders'], s:['core'], rx:'15-30s', hold:true,
    cues:['Straight arms, rings turned out','Shoulders pushed down away from the ears','Hollow body, legs together']},
  split:{name:'Ring Bulgarian Split Squat', lvl:2, p:['quads','glutes'], s:['hamstrings','core'], rx:'6-10 / leg',
    cues:['Rear foot in the ring strap','Front shin near vertical, torso upright','Lower until the rear knee almost touches the floor','Drive through the front heel'],
    anim:{ax:52,grip:'f2',
      A:{h:[98,24],s:[95,38],e:[95,56],w:[97,72],p:[95,72],k:[106,100],f:[106,130],k2:[78,96],f2:[52,84]},
      B:{h:[98,50],s:[95,64],e:[95,82],w:[97,96],p:[95,98],k:[120,102],f:[112,130],k2:[76,122],f2:[52,84]}}},
  hamcurl:{name:'Ring Hamstring Curl', lvl:2, p:['hamstrings','glutes'], s:['core'], rx:'8-12',
    cues:['Lie on your back, heels in the rings','Hips lifted into a bridge','Curl the heels toward the glutes, hips stay up','Extend slowly'],
    anim:{ax:134,grip:'f',
      A:{h:[14,124],s:[26,124],e:[44,126],w:[60,128],p:[76,100],k:[106,92],f:[134,84]},
      B:{h:[14,124],s:[26,124],e:[44,126],w:[60,128],p:[76,100],k:[110,84],f:[96,58]}}},
  lsit:{name:'Ring L-Sit', lvl:3, p:['core','triceps'], s:['quads','shoulders'], rx:'10-20s', hold:true,
    cues:['Support position, depress the shoulders','Legs straight, parallel to the floor','Start with tucked knees and progress']}
};

Object.assign(EX,{
  inclinepush:{name:'Incline Ring Push-up', lvl:1, p:['chest','triceps','shoulders'], s:['core'], rx:'8-12',
    cues:['Rings about chest height, the higher the easier','Body in one straight line from heels to head','Lower the chest between the rings, elbows ~45°','Walk the feet back or lower the rings to progress'],
    prog:'Progress: lower the rings a little each week until they are at knee height (Ring Push-up).',
    anim:{ax:130,grip:'w',
      A:{h:[142,38],s:[128,46],e:[129,60],w:[130,72],p:[74,88],k:[47,108],f:[20,128]},
      B:{h:[126,68],s:[112,66],e:[124,54],w:[130,72],p:[66,97],k:[43,112],f:[20,128]}}},
  negpull:{name:'Ring Negative Pull-up', lvl:1, p:['lats','biceps','upperback'], s:['core'], rx:'3-5',
    cues:['Jump or step up so your chin is above the rings','Lower yourself as slowly as you can, aim for 4-5 seconds','Go all the way down to straight arms, then step up again','Keep shoulders down, do not shrug'],
    prog:'Progress: when 3 sets of 5 slow negatives feel easy, try an assisted pull-up with feet on a chair, then a full pull-up.'},
  pikefloor:{name:'Floor Pike Push-up', lvl:1, p:['shoulders','triceps'], s:['chest','core'], rx:'6-10',
    cues:['Hands on the floor, hips high in an inverted V','Lower the top of your head toward the floor','Press back up, then move to feet-elevated or rings later']},
  tucksit:{name:'Ring Tuck Support', lvl:1, p:['core','triceps'], s:['shoulders'], rx:'10-20s', hold:true,
    cues:['Straight arms, rings turned out, shoulders pushed down','Pull both knees toward the chest','If support is too hard, keep the feet touching the floor']},
  ringsquat:{name:'Ring-assisted Squat', lvl:1, p:['quads','glutes'], s:['hamstrings','core'], rx:'8-12',
    cues:['Hold the rings at chest height, arms straight','Sit back and down, knees track over toes','Use the rings only for balance, legs do the work','Progress to split squats, then Bulgarian split squats']},
  falloutknee:{name:'Ring Fallout (from knees)', lvl:1, p:['core'], s:['shoulders','lats'], rx:'6-10',
    cues:['Kneel, forearms on the rings, glutes squeezed','Roll the rings forward only as far as your back stays flat','Pull back with abs and lats, then try from feet']}
});
const HOLD_WARN = 'Shoulder-intensive: only go as far as feels comfortable, keep arms straight, and stop at any sharp shoulder or elbow pain. Build up slowly over weeks.';
Object.assign(EX,{
  deadhang:{name:'Ring Dead Hang', lvl:1, p:['lats','upperback'], s:['biceps','core'], rx:'20-40s', hold:true,
    cues:['Hang from the rings with straight arms','Pull the shoulders slightly down away from the ears (active hang)','Keep the body still and breathe']},
  rtosupport:{name:'Ring Support Hold (RTO)', lvl:3, p:['triceps','chest','shoulders'], s:['core'], rx:'10-20s', hold:true,
    cues:['Get into a straight-arm support first','Turn the rings out until the palms face forward','Lock the elbows, shoulders pushed down','Hollow body, legs together'],
    prog:'Progress: build to 30s, then add L-sit or Ring Planche Lean.'},
  falsegrip:{name:'False Grip Hang', lvl:3, p:['lats','biceps'], s:['core'], rx:'10-20s', hold:true,
    cues:['Rest the wrist on top of the ring, ring across the base of the palm','Hang with arms straight, thumbs wrapped over','This grip is the foundation of the muscle-up','Wrists and forearms tire fast, keep sets short']},
  tucklever:{name:'Tuck Front Lever', lvl:3, p:['lats','core'], s:['upperback','biceps'], rx:'5-15s', hold:true,
    cues:['Hang from the rings, arms straight','Pull the shoulders down and back, lift the hips','Back parallel to the floor, knees tucked tight','Do not bend the elbows'],
    prog:'Progress: advanced tuck, one leg out, straddle, then full front lever.'},
  frontlever:{name:'Front Lever', lvl:3, p:['lats','core'], s:['upperback','biceps','shoulders'], rx:'3-8s', hold:true,
    cues:['Body straight and horizontal, arms straight, face up','Shoulders pulled down hard, hips level with the shoulders','Squeeze the glutes and legs together']},
  planchelean:{name:'Ring Planche Lean', lvl:2, p:['shoulders','chest'], s:['core','triceps'], rx:'10-20s', hold:true,
    cues:['Push-up top position on the rings (or floor)','Rings turned out, lean the shoulders forward past the hands','Straight body, glutes squeezed, protract the shoulders'],
    prog:'Progress: lean further, then tuck planche on the floor or parallettes.'},
  germanhang:{name:'German Hang', lvl:3, p:['shoulders','chest'], s:['upperback'], rx:'5-15s', hold:true, warn:HOLD_WARN,
    cues:['Start from an inverted hang (hips over the head)','Lower the hips and let the legs drop behind you','Arms stay straight, only go as deep as is comfortable','Return the same way you came in']},
  tuckback:{name:'Tuck Back Lever', lvl:3, p:['shoulders','chest','core'], s:['biceps'], rx:'5-10s', hold:true, warn:HOLD_WARN,
    cues:['From a German hang, lift the hips until the body is horizontal facing the floor','Knees tucked, arms straight','Squeeze the glutes, do not let the hips sag'],
    prog:'Progress: advanced tuck, one leg, straddle, then full back lever.'},
  skincat:{name:'Skin the Cat', kind:'skill', lvl:3, p:['shoulders','lats','core'], s:['biceps','upperback'], rx:'3-5', warn:HOLD_WARN,
    cues:['Hang from the rings, tuck the knees toward the chest','Rotate backward, hips going over the head into an inverted hang','Lower slowly into a German hang, only as far as comfortable','Reverse the movement under control to come back'],
    prog:'Build up with dead hangs and inverted hangs first. Master it before back lever work.',
    anim:{ax:100,grip:'w',
      A:{h:[108,50],s:[100,58],e:[100,40],w:[100,22],p:[100,92],k:[102,110],f:[100,128]},
      B:{h:[94,72],s:[100,58],e:[100,40],w:[100,22],p:[116,44],k:[130,30],f:[142,16]}}},
  muscleup:{name:'Ring Muscle-up', kind:'skill', lvl:3, p:['lats','chest','triceps'], s:['biceps','shoulders','core'], rx:'1-3',
    warn:'Advanced skill. Wait until you can do about 8 strict ring pull-ups and 10 deep ring dips, plus a solid false grip.',
    cues:['Start with a false grip','Pull explosively, rings to the lower chest','Lean forward over the rings in the transition','Press out to a straight-arm support, then lower with control']},
  flye:{name:'Ring Fly', lvl:3, p:['chest'], s:['shoulders','core'], rx:'6-10', warn:'High stress on the shoulders and biceps tendons. Start with the rings high and a small range of motion.',
    cues:['Plank position on rings, arms straight with a slight elbow bend','Open the arms out wide while keeping the body rigid','Squeeze the chest to bring the rings back together']}
});
// easier versions (used in beginner mode and by the "too hard" button) and progression ladders
const EASIER = {rtosupport:'support', tucklever:'hollow', frontlever:'tucklever', germanhang:'deadhang', tuckback:'deadhang', skincat:'deadhang', muscleup:'falsegrip', falsegrip:'deadhang', flye:'inclinepush', pullup:'negpull', dip:'support', pike:'pikefloor', lsit:'tucksit', pushup:'inclinepush', split:'ringsquat', fallout:'falloutknee'};
EX.negpull.anim = EX.pullup.anim;
const LADDERS = [
  ['Pull-up path', ['row','negpull','pullup']],
  ['Push-up path', ['inclinepush','pushup','dip']],
  ['Overhead push path', ['pikefloor','pike']],
  ['Core path', ['hollow','falloutknee','fallout']],
  ['L-sit path', ['support','tucksit','lsit']],
  ['Front lever path', ['hollow','tucklever','frontlever']],
  ['Back lever path', ['deadhang','skincat','germanhang','tuckback']],
  ['Muscle-up path', ['falsegrip','muscleup']],
  ['Static holds path', ['support','rtosupport','planchelean']],
  ['Legs path', ['ringsquat','split']]
];
const SUP_A = {h:[114,26],s:[110,38],e:[110,54],w:[110,70],p:[108,82],k:[112,104],f:[108,124]};
const HANG_A = {h:[108,50],s:[100,58],e:[100,40],w:[100,22],p:[100,92],k:[102,110],f:[100,128]};
const INVERT = {h:[94,72],s:[100,58],e:[100,40],w:[100,22],p:[116,44],k:[130,30],f:[142,16]};
const GERMAN = {h:[100,74],s:[112,56],e:[106,39],w:[100,22],p:[132,78],k:[138,100],f:[134,122]};
const ANIMS = {
  pike:{ax:118,grip:'w',
    A:{h:[124,84],s:[116,74],e:[117,86],w:[118,98],p:[70,52],k:[46,90],f:[22,128]},
    B:{h:[120,100],s:[106,90],e:[112,108],w:[118,98],p:[70,56],k:[46,92],f:[22,128]}},
  tricep:{ax:132,grip:'w',
    A:{h:[122,100],s:[108,94],e:[116,78],w:[130,96],p:[64,111],k:[42,119],f:[20,128]},
    B:{h:[118,86],s:[104,84],e:[118,90],w:[132,96],p:[62,106],k:[41,117],f:[20,128]}},
  curl:{ax:124,grip:'w',
    A:{h:[118,98],s:[108,92],e:[116,72],w:[124,52],p:[66,110],k:[44,119],f:[22,128]},
    B:{h:[118,98],s:[108,92],e:[116,72],w:[120,88],p:[66,110],k:[44,119],f:[22,128]}},
  hollow:{ax:0,grip:null,
    A:{h:[34,126],s:[46,126],e:[64,126],w:[82,126],p:[96,126],k:[126,126],f:[154,126]},
    B:{h:[38,112],s:[50,114],e:[32,108],w:[14,100],p:[96,128],k:[128,118],f:[156,106]}},
  support:{ax:110,grip:'w',
    A:{h:[112,36],s:[110,50],e:[100,62],w:[110,70],p:[108,90],k:[110,112],f:[110,132]},
    B:SUP_A},
  lsit:{ax:110,grip:'w', A:SUP_A,
    B:{h:[114,26],s:[110,38],e:[110,54],w:[110,70],p:[108,84],k:[134,86],f:[158,88]}},
  pikefloor:{ax:0,grip:null,
    A:{h:[122,98],s:[112,98],e:[115,116],w:[118,134],p:[70,58],k:[46,94],f:[22,130]},
    B:{h:[114,122],s:[100,112],e:[108,124],w:[118,134],p:[68,62],k:[44,96],f:[20,130]}},
  tucksit:{ax:110,grip:'w', A:SUP_A,
    B:{h:[114,26],s:[110,38],e:[110,54],w:[110,70],p:[108,82],k:[126,76],f:[112,90]}},
  ringsquat:{ax:130,grip:'w',
    A:{h:[84,24],s:[86,38],e:[106,46],w:[124,52],p:[84,74],k:[86,104],f:[86,134]},
    B:{h:[76,52],s:[70,64],e:[100,63],w:[130,62],p:[54,100],k:[104,100],f:[98,134]}},
  falloutknee:{ax:110,grip:'w',
    A:{h:[112,70],s:[96,76],e:[96,90],w:[100,102],p:[66,100],k:[40,130],f:[16,118]},
    B:{h:[132,88],s:[116,92],e:[128,98],w:[140,102],p:[80,110],k:[48,130],f:[24,120]}},
  deadhang:{ax:100,grip:'w',
    A:{h:[108,56],s:[100,60],e:[100,41],w:[100,22],p:[100,96],k:[102,114],f:[100,132]},
    B:{h:[108,50],s:[100,54],e:[100,38],w:[100,22],p:[100,90],k:[102,108],f:[100,126]}},
  tucklever:{ax:100,grip:'w', A:HANG_A,
    B:{h:[116,60],s:[100,56],e:[100,40],w:[100,22],p:[68,58],k:[88,46],f:[72,52]}},
  frontlever:{ax:100,grip:'w', A:HANG_A,
    B:{h:[116,58],s:[100,56],e:[100,40],w:[100,22],p:[70,58],k:[42,58],f:[16,58]}},
  planchelean:{ax:130,grip:'w',
    A:{h:[142,60],s:[128,68],e:[129,82],w:[130,98],p:[74,98],k:[47,113],f:[20,128]},
    B:{h:[154,60],s:[140,66],e:[136,82],w:[130,98],p:[80,97],k:[50,112],f:[20,128]}},
  germanhang:{ax:100,grip:'w', A:INVERT, B:GERMAN},
  tuckback:{ax:100,grip:'w', A:GERMAN,
    B:{h:[120,50],s:[106,54],e:[102,38],w:[100,22],p:[74,54],k:[84,66],f:[70,62]}},
  muscleup:{ax:100,grip:'w', A:HANG_A,
    B:{h:[108,34],s:[102,46],e:[92,44],w:[100,34],p:[100,80],k:[102,100],f:[100,118]},
    C:{h:[104,14],s:[100,26],e:[100,44],w:[100,60],p:[100,64],k:[102,86],f:[100,104]}},
  flye:{ax:130,grip:'w',
    A:{h:[142,60],s:[128,68],e:[129,82],w:[130,98],p:[74,98],k:[47,113],f:[20,128]},
    B:{h:[136,86],s:[122,88],e:[127,93],w:[130,98],p:[71,108],k:[46,118],f:[20,128]}}
};
ANIMS.rtosupport = ANIMS.support; ANIMS.falsegrip = ANIMS.deadhang;
Object.keys(ANIMS).forEach(id => { EX[id].anim = ANIMS[id]; });
const RING_PAT = {pushup:'hpush',inclinepush:'hpush',dip:'hpush',flye:'hpush',pike:'vpush',pikefloor:'vpush',tricep:'triceps',
  row:'hpull',pullup:'vpull',negpull:'vpull',facepull:'reardelt',curl:'biceps',fallout:'core',falloutknee:'core',hollow:'core',
  lsit:'core',tucksit:'core',split:'lunge',ringsquat:'squat',hamcurl:'legcurl'};
Object.entries(RING_PAT).forEach(([id,pat]) => { EX[id].pat = pat; });
const G = (name, eq, pat, p, s2, rx, extra) => Object.assign({name, eq, pat, lvl:1, p, s:s2, rx}, extra);
const LD = (w0, o) => Object.assign({load:true, w0}, o || {});
Object.assign(EX,{
  bbbench:G('Barbell Bench Press','barbell','hpush',['chest','triceps'],['shoulders'],'6-10', LD(40,{lvl:2,
    cues:['Feet planted, shoulder blades pinched on the bench','Lower the bar to mid chest, elbows ~45°','Press up and slightly back over the shoulders','Use a spotter or safety rack for heavy sets']})),
  dbbench:G('Dumbbell Bench Press','dumbbell','hpush',['chest','triceps'],['shoulders'],'8-12', LD(16,{
    cues:['Dumbbells over the chest, shoulder blades pinched','Lower until the elbows are just below the bench','Press up and slightly together','Weight is per dumbbell']})),
  machpress:G('Machine Chest Press','machine','hpush',['chest','triceps'],['shoulders'],'8-12', LD(30,{
    cues:['Set the seat so the handles are at mid-chest','Push forward without shrugging the shoulders','Control the return, do not let the stack slam']})),
  floorpush:G('Push-up (floor)','floor','hpush',['chest','triceps','shoulders'],['core'],'8-15',{
    cues:['Hands under shoulders, body in one straight line','Lower the chest to the floor, elbows ~45°','Press back up without sagging the hips']}),
  dbshoulder:G('Dumbbell Shoulder Press','dumbbell','vpush',['shoulders','triceps'],['core'],'8-12', LD(10,{
    cues:['Dumbbells at shoulder height, ribs down','Press straight up until the arms are straight','Lower under control, do not arch the lower back','Weight is per dumbbell']})),
  machshoulder:G('Machine Shoulder Press','machine','vpush',['shoulders','triceps'],[],'8-12', LD(25,{
    cues:['Seat height so the handles start at shoulder level','Press up without locking out hard','Control the way down']})),
  bbohp:G('Barbell Overhead Press','barbell','vpush',['shoulders','triceps'],['core'],'5-8', LD(30,{lvl:2,
    cues:['Bar at the collarbone, glutes and abs tight','Press straight up, head moves through at the top','Do not lean back, keep ribs down']})),
  lateral:G('Dumbbell Lateral Raise','dumbbell','lateral',['shoulders'],[],'10-15', LD(5,{
    cues:['Slight bend in the elbows, lift out to the sides to shoulder height','Lead with the elbows, no swinging','Lower slowly','Weight is per dumbbell']})),
  pushdown:G('Cable Triceps Pushdown','cable','triceps',['triceps'],[],'10-15', LD(20,{
    cues:['Elbows pinned to your sides','Push down until the arms are straight','Let the hands rise only to chest height']})),
  dbtriext:G('Dumbbell Overhead Triceps Extension','dumbbell','triceps',['triceps'],[],'10-12', LD(12,{
    cues:['Hold one dumbbell overhead with both hands','Lower behind the head, elbows pointing forward','Extend until the arms are straight']})),
  latpull:G('Lat Pulldown','cable','vpull',['lats','biceps'],['upperback'],'8-12', LD(40,{
    cues:['Grip slightly wider than the shoulders','Pull the bar to the upper chest, elbows down and back','Control the bar back up, shoulders stay down']})),
  cablerow:G('Seated Cable Row','cable','hpull',['lats','upperback'],['biceps'],'8-12', LD(35,{
    cues:['Sit tall, slight lean only','Pull the handle to the stomach, squeeze the shoulder blades','Let the arms straighten under control']})),
  bbrow:G('Barbell Row','barbell','hpull',['lats','upperback'],['biceps','core'],'6-10', LD(40,{lvl:2,
    cues:['Hinge forward with a flat back, bar below the knees','Pull the bar to the lower ribs','Do not jerk with the lower back','Use a light weight until the hinge feels solid']})),
  dbrow:G('Dumbbell Row','dumbbell','hpull',['lats','upperback'],['biceps'],'8-12', LD(16,{
    cues:['Hand and knee on a bench (or both hands in a hinge), flat back','Pull the dumbbell to the hip, elbow close to the body','Lower fully, no twisting','Weight is per dumbbell']})),
  pullupbar:G('Pull-up (bar)','bar','vpull',['lats','biceps'],['upperback','core'],'3-8',{lvl:2,
    cues:['Hang with straight arms, shoulders packed','Pull the chest toward the bar','Lower fully with control','Easier: assisted pull-up machine or bands']}),
  cablefacepull:G('Cable Face Pull','cable','reardelt',['upperback','shoulders'],[],'12-15', LD(15,{
    cues:['Cable at face height, rope handle','Pull toward the face, elbows high and wide','Pause and squeeze the rear shoulders']})),
  dbcurl:G('Dumbbell Curl','dumbbell','biceps',['biceps'],[],'8-12', LD(10,{
    cues:['Elbows pinned to your sides','Curl up without swinging the body','Lower slowly to straight arms','Weight is per dumbbell']})),
  bbsquat:G('Barbell Back Squat','barbell','squat',['quads','glutes'],['hamstrings','core'],'5-8', LD(40,{lvl:2,
    cues:['Bar on the upper back, feet about shoulder width','Brace the abs, sit down and back','Knees track over the toes, depth to your mobility','Use safety bars or a spotter, build weight slowly']})),
  goblet:G('Goblet Squat','dumbbell','squat',['quads','glutes'],['core'],'8-12', LD(16,{
    cues:['Hold one dumbbell at the chest','Sit between the knees, chest tall','Drive up through the whole foot']})),
  legpress:G('Leg Press','machine','squat',['quads','glutes'],['hamstrings'],'8-12', LD(80,{
    cues:['Feet shoulder width, mid platform','Lower until the knees are about 90° and the hips stay on the seat','Press up without locking the knees']})),
  legext:G('Leg Extension','machine','legext',['quads'],[],'10-15', LD(30,{
    cues:['Pad on the lower shin, back against the seat','Extend until the legs are straight, squeeze the quads','Lower slowly']})),
  legcurl:G('Lying Leg Curl','machine','legcurl',['hamstrings'],[],'8-12', LD(25,{
    cues:['Hips pressed into the pad','Curl the heels toward the glutes','Lower slowly, do not let the weight drop']})),
  rdl:G('Romanian Deadlift','barbell','hinge',['hamstrings','glutes'],['core'],'6-10', LD(40,{lvl:2,
    cues:['Soft knees, push the hips back','Bar slides along the thighs, back stays flat','Stop when the hamstrings are stretched, then drive the hips forward']})),
  dbsplit:G('Dumbbell Bulgarian Split Squat','dumbbell','lunge',['quads','glutes'],['hamstrings','core'],'8-10 / leg', LD(10,{lvl:2,
    cues:['Rear foot on a bench, front foot far enough forward','Lower until the rear knee nearly touches the floor','Drive through the front heel','Weight is per dumbbell']})),
  hipthrust:G('Barbell Hip Thrust','barbell','hipext',['glutes'],['hamstrings'],'8-12', LD(40,{
    cues:['Upper back on a bench, bar over the hips with a pad','Drive the hips up until the body is flat','Chin tucked, squeeze the glutes at the top']})),
  hangleg:G('Hanging Leg Raise','bar','core',['core'],[],'8-12',{lvl:2,
    cues:['Hang with straight arms, shoulders packed','Raise the legs (bent knees to start) without swinging','Lower slowly']}),
  plank:G('Plank','floor','core',['core'],['shoulders'],'30-60s',{hold:true,
    cues:['Forearms under the shoulders, body in one line','Squeeze glutes and abs, do not sag or pike','Breathe steadily']})
});
const STAND = {h:[88,22],s:[90,38],p:[90,78],k:[90,108],f:[92,134]};
const SEAT = {h:[82,32],s:[80,46],p:[78,86],k:[104,86],f:[106,120]};
const SEAT_DECO = [['l',68,36,68,92],['r',66,88,48,6]];
const LYING = {h:[34,90],s:[50,94],p:[98,94],k:[122,78],f:[124,130]};
const HINGE = {h:[116,56],s:[104,60],p:[66,76],k:[78,106],f:[72,134]};
const U = (base, o) => Object.assign({}, base, o);
const GYM_ANIMS = {
  bbbench:{prop:'bb',deco:[['r',28,98,100,8]], A:U(LYING,{e:[51,77],w:[52,60]}), B:U(LYING,{e:[62,92],w:[54,76]})},
  dbbench:{prop:'db',deco:[['r',28,98,100,8]], A:U(LYING,{e:[51,77],w:[52,60]}), B:U(LYING,{e:[62,92],w:[54,76]})},
  machpress:{prop:'h',deco:SEAT_DECO, A:U(SEAT,{e:[70,58],w:[92,50]}), B:U(SEAT,{e:[100,50],w:[120,48]})},
  floorpush:{
    A:{h:[142,94],s:[128,100],e:[129,116],w:[130,132],p:[74,116],k:[47,124],f:[20,132]},
    B:{h:[132,122],s:[116,124],e:[124,114],w:[130,132],p:[68,128],k:[44,130],f:[20,134]}},
  dbshoulder:{prop:'db', A:U(STAND,{h:[84,24],e:[96,54],w:[94,36]}), B:U(STAND,{h:[84,24],e:[94,22],w:[93,6]})},
  bbohp:{prop:'bb', A:U(STAND,{h:[84,24],e:[96,54],w:[94,36]}), B:U(STAND,{h:[84,24],e:[94,22],w:[93,6]})},
  machshoulder:{prop:'h',deco:SEAT_DECO, A:U(SEAT,{e:[88,58],w:[92,40]}), B:U(SEAT,{e:[88,32],w:[90,14]})},
  lateral:{prop:'db', A:U(STAND,{e:[91,58],w:[93,76]}), B:U(STAND,{e:[108,42],w:[126,40]})},
  pushdown:{grip:'w',cab:[104,4],prop:'h', A:U(STAND,{e:[96,56],w:[112,50]}), B:U(STAND,{e:[94,58],w:[96,82]})},
  dbtriext:{prop:'db', A:U(STAND,{h:[98,26],e:[92,20],w:[84,28]}), B:U(STAND,{h:[98,26],e:[91,22],w:[91,5]})},
  latpull:{grip:'w',cab:[94,4],prop:'h',deco:[['r',62,90,52,6],['l',66,40,66,92]],
    A:{h:[82,34],s:[84,46],e:[88,28],w:[92,10],p:[78,88],k:[106,86],f:[106,122]},
    B:{h:[82,34],s:[84,46],e:[76,60],w:[94,46],p:[78,88],k:[106,86],f:[106,122]}},
  cablerow:{grip:'w',cab:[172,88],prop:'h',nobar:true,deco:[['r',36,100,50,10],['l',130,78,130,106]],
    A:{h:[70,42],s:[66,56],e:[88,72],w:[112,86],p:[56,96],k:[92,94],f:[126,92]},
    B:{h:[60,40],s:[58,54],e:[46,78],w:[74,86],p:[56,96],k:[92,94],f:[126,92]}},
  bbrow:{prop:'bb', A:U(HINGE,{e:[106,82],w:[106,102]}), B:U(HINGE,{e:[86,72],w:[98,82]})},
  dbrow:{prop:'db', A:U(HINGE,{e:[106,82],w:[106,102]}), B:U(HINGE,{e:[86,72],w:[98,82]})},
  pullupbar:{deco:[['l',70,22,130,22]], A:HANG_A,
    B:{h:[113,26],s:[104,36],e:[94,34],w:[100,22],p:[102,70],k:[104,90],f:[102,108]}},
  cablefacepull:{grip:'w',cab:[158,40],prop:'h',nobar:true, A:U(STAND,{e:[104,42],w:[122,44]}), B:U(STAND,{e:[94,52],w:[100,32]})},
  dbcurl:{prop:'db', A:U(STAND,{e:[91,58],w:[93,76]}), B:U(STAND,{e:[93,58],w:[100,36]})},
  bbsquat:{prop:'bb',
    A:{h:[88,22],s:[88,38],e:[80,48],w:[86,36],p:[86,78],k:[88,108],f:[90,134]},
    B:{h:[84,48],s:[78,62],e:[70,68],w:[76,60],p:[60,98],k:[104,98],f:[96,134]}},
  goblet:{prop:'db',
    A:{h:[88,22],s:[88,38],e:[94,52],w:[100,44],p:[86,78],k:[88,108],f:[90,134]},
    B:{h:[84,48],s:[78,62],e:[92,78],w:[96,64],p:[60,98],k:[104,98],f:[96,134]}},
  legpress:{deco:[['l',26,90,62,126]],
    A:{h:[28,92],s:[40,100],e:[52,108],w:[64,112],p:[64,118],k:[90,92],f:[118,114]},
    B:{h:[28,92],s:[40,100],e:[52,108],w:[64,112],p:[64,118],k:[98,106],f:[132,92]}},
  legext:{deco:SEAT_DECO, A:U(SEAT,{e:[88,62],w:[96,72],f:[108,124]}), B:U(SEAT,{e:[88,62],w:[96,72],f:[140,86]})},
  legcurl:{deco:[['r',16,106,150,6]],
    A:{h:[24,96],s:[38,100],e:[52,104],w:[66,106],p:[88,102],k:[120,102],f:[150,102]},
    B:{h:[24,96],s:[38,100],e:[52,104],w:[66,106],p:[88,102],k:[120,102],f:[122,70]}},
  rdl:{prop:'bb',
    A:{h:[90,22],s:[90,38],e:[91,58],w:[91,78],p:[88,78],k:[90,108],f:[92,134]},
    B:{h:[122,58],s:[106,62],e:[108,82],w:[108,102],p:[68,78],k:[82,106],f:[88,134]}},
  dbsplit:Object.assign({}, EX.split.anim, {ax:0, grip:null, prop:'db', deco:[['r',40,86,26,6]]}),
  hipthrust:{prop:'bb',deco:[['r',22,96,32,16]],
    A:{h:[28,92],s:[40,98],e:[60,112],w:[78,120],p:[78,122],k:[108,104],f:[112,134]},
    B:{h:[28,92],s:[40,98],e:[62,102],w:[82,98],p:[82,100],k:[112,102],f:[114,134]}},
  hangleg:{deco:[['l',70,22,130,22]], A:HANG_A,
    B:{h:[108,50],s:[100,58],e:[100,40],w:[100,22],p:[100,92],k:[128,90],f:[156,88]}},
  plank:{
    A:{h:[142,100],s:[128,104],e:[126,126],w:[146,130],p:[74,114],k:[48,123],f:[22,132]},
    B:{h:[142,100],s:[128,104],e:[126,126],w:[146,130],p:[74,111],k:[48,121],f:[22,132]}}
};
Object.keys(GYM_ANIMS).forEach(id => { EX[id].anim = GYM_ANIMS[id]; });
// extra prerequisites that come from a different path
const EXTRA_PRE = {falsegrip:['deadhang'], muscleup:['pullup','dip'], dip:['support'], flye:['pushup'], planchelean:['pushup']};
// mastery goal = sets x reps (or seconds) reached in N sessions in a row; defaults are derived from the rep range
const GOAL_OVR = {negpull:{reps:5}, muscleup:{reps:2, sessions:3}, skincat:{sessions:3}, germanhang:{sessions:3},
  tuckback:{sessions:3}, tucklever:{sessions:3}, frontlever:{sessions:3}};

// ---- additions: calves, single-leg hinge, calf raises
MUSCLES.calves = 'Calves';
Object.assign(EX, {
  slrdl:G('Single-leg Romanian Deadlift','floor','hinge',['hamstrings','glutes'],['core'],'8-12 / leg',{
    cues:['Stand on one leg with a soft knee','Hinge at the hip, the free leg travels back in line with the body','Keep the hips square and the back flat','Stand back up by squeezing the glute of the standing leg']}),
  calfraise:G('Calf Raise','floor','calf',['calves'],[],'12-20',{
    cues:['Balls of the feet on a step or the floor','Rise as high as you can, pause at the top','Lower slowly, let the heels drop below the step if you can']}),
  machcalf:G('Machine Calf Raise','machine','calf',['calves'],[],'10-15', LD(40,{
    cues:['Shoulders under the pads, balls of the feet on the platform','Rise as high as possible, pause','Lower slowly into a full stretch']}))
});
EX.slrdl.anim = {
  A:{h:[88,22],s:[90,38],e:[91,58],w:[91,78],p:[90,78],k:[90,106],f:[92,134],k2:[88,106],f2:[86,132]},
  B:{h:[126,62],s:[112,64],e:[112,84],w:[112,104],p:[76,70],k:[80,102],f:[84,134],k2:[52,68],f2:[28,66]}};
EX.calfraise.anim = {
  A:{h:[88,22],s:[90,38],e:[91,58],w:[93,76],p:[90,78],k:[90,108],f:[92,134]},
  B:{h:[88,14],s:[90,30],e:[91,50],w:[93,68],p:[90,70],k:[90,102],f:[92,134]}};
EX.machcalf.anim = Object.assign({}, EX.calfraise.anim, {prop:'h', pj:'s', deco:[['l',72,8,108,8]]});

// ---- TRX (suspension trainer) and ab wheel
const TRXA = (id, o) => Object.assign({}, EX[id].anim, {cab:[EX[id].anim.ax, 4], prop:'h', pj:EX[id].anim.grip}, o || {});
Object.assign(EX, {
  trxrow:G('TRX Row','trx','hpull',['lats','upperback','biceps'],['core'],'8-15',{
    cues:['Straps shortened, lean back with straight arms, palms facing in','Body in one straight line, heels on the floor','Pull the chest to the handles, squeeze the shoulder blades','Walk the feet forward to make it harder']}),
  trxpush:G('TRX Chest Press','trx','hpush',['chest','triceps','shoulders'],['core'],'8-15',{
    cues:['Face away from the anchor, arms straight in front at chest height','Lean forward in a plank, lower the chest between the hands','Keep the straps from rubbing the arms','Walk the feet back toward the anchor to make it harder']}),
  trxsquat:G('TRX Squat','trx','squat',['quads','glutes'],['hamstrings','core'],'10-15',{
    cues:['Face the anchor, hold the handles at chest height','Sit back and down, use the straps only for balance','Drive up through the whole foot']}),
  trxlunge:G('TRX Suspended Lunge','trx','lunge',['quads','glutes'],['hamstrings','core'],'8-12 / leg',{
    cues:['Face away from the anchor, rear foot in the foot cradle','Lower straight down until the front thigh is about parallel','Front knee tracks over the toes, drive up through the front heel']}),
  trxhamcurl:G('TRX Hamstring Curl','trx','legcurl',['hamstrings','glutes'],['core'],'8-12',{
    cues:['Lie on your back, heels in the foot cradles under the anchor','Lift the hips into a bridge','Curl the heels toward the glutes, keep the hips up','Extend slowly']}),
  trxcurl:G('TRX Biceps Curl','trx','biceps',['biceps'],['upperback'],'10-15',{
    cues:['Face the anchor, lean back with arms straight, palms up','Curl the hands toward the forehead, elbows stay high','Lower under control, body stays rigid']}),
  trxface:G('TRX Face Pull','trx','reardelt',['upperback','shoulders'],[],'10-15',{
    cues:['Face the anchor, lean back with arms straight','Pull the handles toward the face, elbows high and wide','Pause and squeeze the rear shoulders']}),
  trxtricep:G('TRX Triceps Extension','trx','triceps',['triceps'],['core','shoulders'],'10-15',{
    cues:['Face away from the anchor, arms straight overhead, lean forward','Bend only at the elbows, hands toward the forehead','Extend the arms fully, body stays rigid']}),
  trxfallout:G('TRX Fallout','trx','core',['core'],['shoulders','lats'],'8-12',{
    cues:['Face away from the anchor, arms straight in front','Lean forward and raise the arms overhead while the body stays straight','Stop before the lower back sags, pull back with the abs']}),
  trxpike:G('TRX Pike','trx','core',['core'],['shoulders'],'8-12',{lvl:2,
    cues:['Feet in the foot cradles, start in a high plank','Lift the hips toward the ceiling, legs straight','Lower back to a straight plank with control']}),
  wheelknee:G('Ab Wheel Rollout (knees)','abwheel','core',['core'],['lats','shoulders'],'6-12',{
    cues:['Kneel with the wheel under the shoulders, glutes squeezed','Roll forward only as far as the lower back stays flat','Pull back with the abs, do not bend at the hips first','Use a pad under the knees']}),
  wheelstand:G('Ab Wheel Rollout (standing)','abwheel','core',['core'],['lats','shoulders'],'3-8',{lvl:3,
    warn:'Very demanding on the lower back. Master 3 sets of 12 kneeling rollouts first.',
    cues:['Start standing, hinge down to the wheel','Roll out until the body is nearly straight, back stays flat','Pull back to the start with the abs']})
});
EX.trxrow.anim = TRXA('row');
EX.trxpush.anim = TRXA('inclinepush');
EX.trxsquat.anim = TRXA('ringsquat');
EX.trxlunge.anim = TRXA('split');
EX.trxhamcurl.anim = TRXA('hamcurl');
EX.trxcurl.anim = TRXA('curl');
EX.trxface.anim = TRXA('facepull');
EX.trxtricep.anim = TRXA('tricep');
EX.trxfallout.anim = TRXA('fallout');
EX.trxpike.anim = {cab:[26,4], grip:'f', prop:'h', pj:'f',
  A:{h:[140,98],s:[126,104],e:[128,118],w:[130,132],p:[80,100],k:[52,96],f:[26,92]},
  B:{h:[136,112],s:[124,108],e:[127,120],w:[130,132],p:[96,58],k:[76,76],f:[58,92]}};
EX.wheelknee.anim = {prop:'bb',
  A:{h:[110,86],s:[96,92],e:[98,110],w:[100,128],p:[64,100],k:[40,130],f:[16,120]},
  B:{h:[130,110],s:[118,116],e:[130,122],w:[142,128],p:[78,118],k:[44,130],f:[20,122]}};
EX.wheelstand.anim = {prop:'bb',
  A:{h:[104,96],s:[90,100],e:[96,114],w:[100,128],p:[56,70],k:[46,104],f:[40,134]},
  B:{h:[138,118],s:[126,124],e:[138,126],w:[150,128],p:[70,128],k:[44,131],f:[20,134]}};
LADDERS.push(['Ab wheel path', ['falloutknee','wheelknee','wheelstand']]);

// ---- calisthenics (bodyweight, pull-up bar, dip bars)
EX.hollow.eq = 'floor'; EX.pikefloor.eq = 'floor';
const BARLINE = y => [['l', 70, y, 130, y]];
Object.assign(EX, {
  australian:G('Australian Pull-up (bar row)','bar','hpull',['lats','upperback','biceps'],['core'],'8-15',{
    cues:['Low bar at about hip height, hang underneath with straight arms','Body straight from heels to head','Pull the chest to the bar, squeeze the shoulder blades','Bend the knees to make it easier, raise the feet to make it harder']}),
  negbar:G('Negative Pull-up (bar)','bar','vpull',['lats','biceps','upperback'],['core'],'3-5',{
    cues:['Jump or step up so your chin is over the bar','Lower as slowly as you can, aim for 4-5 seconds','Go all the way to straight arms','Shoulders stay down, no shrugging']}),
  chinup:G('Chin-up','bar','vpull',['biceps','lats'],['upperback','core'],'3-8',{lvl:2,
    cues:['Palms facing you, shoulder-width grip','Pull until the chin is over the bar','Lower fully with control']}),
  bardip:G('Parallel Bar Dip','bar','hpush',['chest','triceps','shoulders'],['core'],'5-10',{lvl:2,
    cues:['Start locked out on the bars, shoulders down','Lean slightly forward and lower until the shoulders are just below the elbows','Press back up to straight arms','Easier: bench dips or slow negatives']}),
  diamond:G('Diamond Push-up','floor','triceps',['triceps'],['chest','shoulders'],'6-12',{
    cues:['Hands close together under the chest, thumbs and index fingers touching','Elbows stay close to the body','Lower the chest to the hands, press up','Easier: from the knees']}),
  bwsquat:G('Bodyweight Squat','floor','squat',['quads','glutes'],['core'],'12-20',{
    cues:['Feet about shoulder width, toes slightly out','Sit down and back, chest tall, arms forward for balance','Go as deep as you can with a flat back, drive up']}),
  revlunge:G('Reverse Lunge','floor','lunge',['quads','glutes'],['hamstrings','core'],'8-12 / leg',{
    cues:['Step one foot back, lower until both knees are about 90°','Front knee over the foot, torso tall','Push through the front heel to stand back up']}),
  glutebridge:G('Glute Bridge','floor','hipext',['glutes'],['hamstrings','core'],'12-20',{
    cues:['Lie on your back, knees bent, feet flat','Drive the hips up until the body is straight from knees to shoulders','Squeeze the glutes at the top, lower slowly','Harder: single-leg bridge']}),
  handstand:G('Wall Handstand Hold','floor','vpush',['shoulders','triceps'],['core'],'15-45s',{lvl:3, hold:true,
    warn:'Learn to come down safely first (cartwheel out or walk the feet down). Stop if you feel wrist or shoulder pain.',
    cues:['Hands about shoulder width, a hand-length from the wall','Kick up or walk the feet up the wall','Push the floor away, arms locked, ribs in','Start with short holds and build up']})
});
EX.australian.anim = Object.assign({}, EX.row.anim, {grip:null, deco:BARLINE(52)});
EX.negbar.anim = Object.assign({}, EX.pullup.anim, {grip:null, deco:BARLINE(22)});
EX.chinup.anim = EX.negbar.anim;
EX.bardip.anim = Object.assign({}, EX.dip.anim, {grip:null, deco:[['l', 88, 72, 132, 72], ['l', 128, 72, 128, 134]]});
EX.diamond.anim = EX.floorpush.anim;
EX.bwsquat.anim = {
  A:{h:[88,22],s:[88,38],e:[100,44],w:[114,46],p:[86,78],k:[88,108],f:[90,134]},
  B:{h:[84,48],s:[78,62],e:[96,64],w:[114,64],p:[60,98],k:[104,98],f:[96,134]}};
EX.revlunge.anim = {
  A:{h:[98,24],s:[95,38],e:[95,56],w:[97,72],p:[95,72],k:[98,102],f:[100,132],k2:[92,102],f2:[90,132]},
  B:{h:[98,50],s:[95,64],e:[95,82],w:[97,96],p:[95,98],k:[120,102],f:[118,132],k2:[80,128],f2:[56,130]}};
EX.glutebridge.anim = {
  A:{h:[20,124],s:[34,126],e:[50,130],w:[64,132],p:[76,128],k:[104,104],f:[112,132]},
  B:{h:[20,124],s:[34,126],e:[50,130],w:[64,132],p:[80,104],k:[108,100],f:[112,132]}};
EX.handstand.anim = {deco:[['l', 88, 0, 88, 136]],
  A:{h:[122,98],s:[112,98],e:[115,116],w:[118,134],p:[70,58],k:[46,94],f:[22,130]},
  B:{h:[104,114],s:[104,100],e:[104,117],w:[104,134],p:[100,62],k:[96,36],f:[94,10]}};
LADDERS.push(['Bar pull-up path', ['australian','negbar','pullupbar']]);
LADDERS.push(['Dip path', ['floorpush','bardip']]);
LADDERS.push(['Handstand path', ['pikefloor','handstand']]);
EXTRA_PRE.chinup = ['negbar'];
