'use strict';
/* PieFit built-in food library (Thai & fitness foods). Loaded before nutrition.js.
   Per-portion values: cal = kcal, p/c/f = grams of protein / carbohydrate / fat. */
const NUTRITION_FOODS = [
  // High Protein Staples
  { id: 'bf_chicken_breast', cat: 'protein', nameTh: 'อกไก่ต้ม / นึ่ง', nameEn: 'Boiled Chicken Breast', portionTh: '100 กรัม', portionEn: '100g', cal: 115, p: 24, c: 0, f: 1.5 },
  { id: 'bf_chicken_tender', cat: 'protein', nameTh: 'สันในไก่ย่าง', nameEn: 'Grilled Chicken Tender', portionTh: '100 กรัม', portionEn: '100g', cal: 120, p: 25, c: 0, f: 2 },
  { id: 'bf_egg_boiled', cat: 'protein', nameTh: 'ไข่ต้ม', nameEn: 'Boiled Egg', portionTh: '1 ฟอง (เบอร์ 2)', portionEn: '1 egg', cal: 75, p: 6.5, c: 0.5, f: 5 },
  { id: 'bf_egg_fried', cat: 'protein', nameTh: 'ไข่ดาว', nameEn: 'Fried Egg', portionTh: '1 ฟอง', portionEn: '1 fried egg', cal: 115, p: 6.5, c: 0.5, f: 9.5 },
  { id: 'bf_whey', cat: 'protein', nameTh: 'เวย์โปรตีน (Whey)', nameEn: 'Whey Protein Scoop', portionTh: '1 สกู๊ป (30g)', portionEn: '1 scoop (30g)', cal: 120, p: 24, c: 3, f: 1.5 },
  { id: 'bf_tuna_water', cat: 'protein', nameTh: 'ทูน่าในน้ำแร่', nameEn: 'Canned Tuna in Water', portionTh: '1 กระป๋อง (140g)', portionEn: '1 can (140g)', cal: 135, p: 32, c: 0, f: 0.8 },
  { id: 'bf_salmon', cat: 'protein', nameTh: 'ปลาแซลมอนย่าง', nameEn: 'Grilled Salmon', portionTh: '150 กรัม', portionEn: '150g', cal: 280, p: 34, c: 0, f: 15 },
  { id: 'bf_white_fish', cat: 'protein', nameTh: 'ปลากะพงนึ่ง / ย่าง', nameEn: 'Steamed Sea Bass', portionTh: '150 กรัม', portionEn: '150g', cal: 170, p: 32, c: 0, f: 4 },
  { id: 'bf_tofu_firm', cat: 'protein', nameTh: 'เต้าหู้ขาวแข็ง', nameEn: 'Firm Tofu', portionTh: '100 กรัม', portionEn: '100g', cal: 85, p: 9, c: 2, f: 4.5 },
  { id: 'bf_soymilk', cat: 'protein', nameTh: 'นมถั่วเหลืองไม่หวาน', nameEn: 'Unsweetened Soy Milk', portionTh: '1 กล่อง (250ml)', portionEn: '1 carton (250ml)', cal: 95, p: 8.5, c: 4, f: 4.5 },
  { id: 'bf_milk_lowfat', cat: 'protein', nameTh: 'นมจืดพร่องมันเนย', nameEn: 'Low Fat Milk', portionTh: '1 แก้ว (200ml)', portionEn: '1 glass (200ml)', cal: 95, p: 7, c: 10, f: 2.5 },

  // Carbohydrates / Energy Staples
  { id: 'bf_rice_white', cat: 'carb', nameTh: 'ข้าวสวยหอมมะลิ', nameEn: 'Jasmine White Rice', portionTh: '1 ทัพพี (80g)', portionEn: '1 ladle (80g)', cal: 110, p: 2, c: 25, f: 0.2 },
  { id: 'bf_rice_brown', cat: 'carb', nameTh: 'ข้าวกล้อง / ไรซ์เบอร์รี่', nameEn: 'Brown / Berry Rice', portionTh: '1 ทัพพี (80g)', portionEn: '1 ladle (80g)', cal: 110, p: 2.5, c: 23, f: 1 },
  { id: 'bf_sticky_rice', cat: 'carb', nameTh: 'ข้าวเหนียวนึ่ง', nameEn: 'Steamed Sticky Rice', portionTh: '1 ห่อเล็ก (100g)', portionEn: '1 small pack (100g)', cal: 230, p: 4, c: 50, f: 1 },
  { id: 'bf_banana', cat: 'carb', nameTh: 'กล้วยหอม', nameEn: 'Banana', portionTh: '1 ลูกกลาง', portionEn: '1 medium', cal: 105, p: 1.2, c: 27, f: 0.3 },
  { id: 'bf_sweet_potato', cat: 'carb', nameTh: 'มันเทศ / มันหวานนึ่ง', nameEn: 'Steamed Sweet Potato', portionTh: '100 กรัม', portionEn: '100g', cal: 90, p: 1.5, c: 21, f: 0.2 },
  { id: 'bf_oatmeal', cat: 'carb', nameTh: 'ข้าวโอ๊ต (Oatmeal)', nameEn: 'Rolled Oats', portionTh: '40 กรัม (แห้ง)', portionEn: '40g dry', cal: 155, p: 5.5, c: 27, f: 2.8 },
  { id: 'bf_wholewheat_bread', cat: 'carb', nameTh: 'ขนมปังโฮลวีต', nameEn: 'Whole Wheat Bread', portionTh: '1 แผ่น', portionEn: '1 slice', cal: 75, p: 3.5, c: 13, f: 1 },

  // Common Thai Fitness / Single Dishes
  { id: 'bf_thai_kaprao_chicken', cat: 'dish', nameTh: 'กะเพราอกไก่ไข่ดาว', nameEn: 'Holy Basil Chicken + Fried Egg', portionTh: '1 จาน (ข้าว 1 ทัพพี)', portionEn: '1 plate', cal: 530, p: 38, c: 54, f: 18 },
  { id: 'bf_thai_chicken_rice', cat: 'dish', nameTh: 'ข้าวมันไก่เนื้ออกไม่หนัง', nameEn: 'Hainanese Chicken Rice (Breast)', portionTh: '1 จาน', portionEn: '1 plate', cal: 510, p: 33, c: 68, f: 11 },
  { id: 'bf_thai_suki_soup', cat: 'dish', nameTh: 'สุกี้น้ำรวมมิตร / อกไก่', nameEn: 'Thai Suki Soup (Chicken)', portionTh: '1 ชาม', portionEn: '1 bowl', cal: 320, p: 28, c: 32, f: 8 },
  { id: 'bf_thai_noodle_soup', cat: 'dish', nameTh: 'ก๋วยเตี๋ยวน้ำใสไก่/หมู', nameEn: 'Clear Broth Noodle Soup', portionTh: '1 ชาม', portionEn: '1 bowl', cal: 360, p: 22, c: 50, f: 8 },
  { id: 'bf_thai_larb_minced', cat: 'dish', nameTh: 'ลาบอกไก่สับ / หมูไม่มัน', nameEn: 'Spicy Minced Chicken Larb', portionTh: '1 จาน (ไม่รวมข้าว)', portionEn: '1 plate', cal: 190, p: 26, c: 5, f: 7 },
  { id: 'bf_thai_fried_rice_egg', cat: 'dish', nameTh: 'ข้าวผัดไข่', nameEn: 'Egg Fried Rice', portionTh: '1 จาน', portionEn: '1 plate', cal: 520, p: 13, c: 68, f: 21 },
  { id: 'bf_thai_tomyum_shrimp', cat: 'dish', nameTh: 'ต้มยำกุ้งน้ำใส', nameEn: 'Tom Yum Shrimp (Clear)', portionTh: '1 ถ้วย (ไม่รวมข้าว)', portionEn: '1 bowl', cal: 120, p: 18, c: 6, f: 2.5 },

  // Healthy Fats & Healthy Snacks
  { id: 'bf_almonds', cat: 'fat', nameTh: 'อัลมอนด์อบ (ไม่เกลือ)', nameEn: 'Roasted Almonds (Unsalted)', portionTh: '1 กำมือ (28g)', portionEn: '1 handful (28g)', cal: 165, p: 6, c: 6, f: 14 },
  { id: 'bf_peanut_butter', cat: 'fat', nameTh: 'เนยถั่วธรรมชาติ 100%', nameEn: 'Natural Peanut Butter', portionTh: '1 ช้อนโต๊ะ (16g)', portionEn: '1 tbsp (16g)', cal: 95, p: 4, c: 3, f: 8 },
  { id: 'bf_olive_oil', cat: 'fat', nameTh: 'น้ำมันมะกอก (ปรุงอาหาร)', nameEn: 'Olive Oil', portionTh: '1 ช้อนโต๊ะ (14g)', portionEn: '1 tbsp (14g)', cal: 120, p: 0, c: 0, f: 14 },
  { id: 'bf_greek_yogurt', cat: 'fat', nameTh: 'กรีกโยเกิร์ตแท้ 0% ไขมัน', nameEn: '0% Fat Greek Yogurt', portionTh: '1 ถ้วย (100g)', portionEn: '1 cup (100g)', cal: 60, p: 10, c: 4, f: 0 }
];
