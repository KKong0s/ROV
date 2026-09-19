/**
 * ROV Hero Database — ข้อมูลฮีโร่ทั้งหมด 128 ตัว
 * แหล่งข้อมูล: rov.in.th API + Garena RoV Thailand + Arena of Valor Fandom Wiki
 * อัปเดตล่าสุด: กันยายน 2026 (รวมฮีโร่ใหม่ ทมิฬ และ Evita)
 * ไม่รวม: Flowborn, Peura (ตามที่ผู้ใช้ระบุ)
 */
const HEROES = [
  // ─── A ───
  { id:"airi", name:"Airi", role:"Assassin", role2:"Fighter", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/fb8a12b0dccdaee733cb0df7479245a4538231199.jpeg", aliases:["ไอริ"] },
  { id:"aleister", name:"Aleister", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/865b1b90b0a5c0c961bf6e56beb47e2b368550319.jpg", aliases:["อเลสเตอร์"] },
  { id:"alice", name:"Alice", role:"Support", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301180.png", aliases:["อลิซ"] },
  { id:"allain", name:"Allain", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/0c8dc05e988fbd87b5d30b368b8008ec.jpg", aliases:["อัลเลน"] },
  { id:"amily", name:"Amily", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301930.png", aliases:["เอมิลี่"] },
  { id:"annette", name:"Annette", role:"Support", role2:"Mage", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305190.png", aliases:["แอนเน็ต"] },
  { id:"aoi", name:"Aoi", role:"Assassin", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/210fedabab9858d9a86a36a0e22fd0c2911013802.jpeg", aliases:["อาโออิ"] },
  { id:"arduin", name:"Arduin", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301260.png", aliases:["อาร์ดูอิน"] },
  { id:"arum", name:"Arum", role:"Tank", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301870.png", aliases:["อรัม"] },
  { id:"astrid", name:"Astrid", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305020.png", aliases:["แอสตริด"] },
  { id:"ata", name:"Ata", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/bc077a5ecf509b309fc06fbbae34d4a7.jpg", aliases:["อาต้า"] },
  { id:"aya", name:"Aya", role:"Support", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/d7eb3abf05ebf7c588efcd1c4426b6ea928761324.jpg", aliases:["อายะ"] },
  { id:"azzenka", name:"Azzen'Ka", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301270.png", aliases:["อัซเซนก้า","AzzenKa"] },
  // ─── B ───
  { id:"baldum", name:"Baldum", role:"Tank", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305050.png", aliases:["บัลดัม"] },
  { id:"bijan", name:"Bijan", role:"Fighter", role2:"Assassin", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/0/0c/Bijan.jpg/revision/latest/scale-to-width-down/200?cb=20230718044752", aliases:["บีจัน"] },
  { id:"billow", name:"Billow", role:"Assassin", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/2/26/Billow_Splash_Art.png/revision/latest/scale-to-width-down/200?cb=20250117070313", aliases:["บิลโล่"] },
  { id:"biron", name:"Biron", role:"Fighter", role2:"Tank", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/7/7f/Biron_itadori.jpg/revision/latest/scale-to-width-down/200?cb=20250109145933", aliases:["ไบรอน"] },
  { id:"bolt-baron", name:"Bolt Baron", role:"Fighter", role2:"Mage", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/a/a2/Bolt_baron_Splash_Art.jpg/revision/latest/scale-to-width-down/200?cb=20250109144210", aliases:["โบลท์บารอน"] },
  { id:"bonnie", name:"Bonnie", role:"Mage", role2:"Support", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/b/b9/Bonnie_Splash_Art.png.jpg/revision/latest/scale-to-width-down/200?cb=20230116211653", aliases:["บอนนี่"] },
  { id:"bright", name:"Bright", role:"Assassin", role2:"Carry", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/1df9f95f158eb4bf8e3b86bc1a852220.jpg", aliases:["ไบร์ท"] },
  { id:"butterfly", name:"Butterfly", role:"Assassin", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/953686dacc7e2900a7c3e557f9a289a0804234356.jpeg", aliases:["บัตเตอร์ฟลาย","ผีเสื้อ"] },
  // ─── C ───
  { id:"capheny", name:"Capheny", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305240.png", aliases:["คาเฟนี่"] },
  { id:"celica", name:"Celica", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/977f2da94839af7212b8071b2d4e25aa.jpg", aliases:["เซลิก้า","Brunhilda","บรุนฮิลด้า"] },
  { id:"charlotte", name:"Charlotte", role:"Fighter", role2:"Assassin", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/c/c6/Challot_hexswword.jpg/revision/latest/scale-to-width-down/200?cb=20250112084656", aliases:["ชาร์ลอต"] },
  { id:"chaugnar", name:"Chaugnar", role:"Support", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301130.png", aliases:["ช้างนา","ช้าง"] },
  { id:"cresht", name:"Cresht", role:"Tank", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301710.png", aliases:["เครช"] },
  // ─── D ───
  { id:"darcy", name:"D'Arcy", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305230.png", aliases:["ดาร์ซี่","DArcy"] },
  { id:"dextra", name:"Dextra", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/ecefc7e37ee6ebd911f20cb85e3cf114.jpg", aliases:["เด็กซ์ตร้า"] },
  { id:"diaochan", name:"Diao Chan", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/2739ce8e4cba10bbbf586d9305c0bc6d278501387.png", aliases:["เตียวเสี้ยน","Diaochan"] },
  { id:"dirak", name:"Dirak", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/5a0aa13473e99882dd2bc386e65a757a.jpg", aliases:["ดิรัค"] },
  { id:"dolia", name:"Dolia", role:"Mage", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/e/e6/Dolia_Splash_Art.jpeg/revision/latest/scale-to-width-down/200?cb=20240710174030", aliases:["โดเลีย"] },
  { id:"dyadia", name:"Dyadia", role:"Mage", role2:"Support", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/3/3d/Dyadia_Splash_Art.jpg/revision/latest/scale-to-width-down/200?cb=20260124103724", aliases:["ไดอาเดีย"] },
  // ─── E ───
  { id:"edras", name:"Edras", role:"Fighter", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/3/3d/Edras_Splash_Art.jpg/revision/latest/scale-to-width-down/200?cb=20260124103810", aliases:["เอดราส"] },
  { id:"elandorr", name:"Eland'orr", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/44644fdbed6c3d262d8d99d72fc88abd.jpg", aliases:["อีแลนดอร์","Elandorr"] },
  { id:"elsu", name:"Elsu", role:"Carry", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301960.png", aliases:["เอลซู"] },
  { id:"enzo", name:"Enzo", role:"Assassin", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/52082f355647d254c4b45a6eab022ef0194524062.jpeg", aliases:["เอนโซ่"] },
  { id:"erin", name:"Erin", role:"Mage", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/5/54/Erin_noi_tai.png/revision/latest?cb=20240411130433", aliases:["เอริน"] },
  { id:"errol", name:"Errol", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/9533ebf490c391b2db65bf079b4bf749.jpg", aliases:["เอร์รอล"] },
  { id:"evita", name:"Evita (เอวิต้า)", role:"Mage", role2:"Support", image:"images/evita.jpg", aliases:["เอวิต้า","Evita","10ปี","ครบรอบ 10 ปี"] },
  // ─── F ───
  { id:"fennik", name:"Fennik", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301730.png", aliases:["เฟนนิค"] },
  { id:"florentino", name:"Florentino", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305210.png", aliases:["ฟลอ","ฟลอเรนติโน่"] },
  // ─── G ───
  { id:"gildur", name:"Gildur", role:"Mage", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301080.png", aliases:["กิลเดอร์"] },
  { id:"goverra", name:"Goverra", role:"Mage", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/2/21/Goverra_Splash_Art.jpg/revision/latest/scale-to-width-down/200?cb=20260124103901", aliases:["โกเวร่า"] },
  { id:"grakk", name:"Grakk", role:"Tank", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301750.png", aliases:["กรัก"] },
  // ─── H ───
  { id:"hayate", name:"Hayate", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301320.png", aliases:["ฮายาเตะ"] },
  { id:"heino", name:"Heino", role:"Assassin", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/8/86/Heino_Splash_Art.jpg/revision/latest/scale-to-width-down/200?cb=20260124103942", aliases:["ไฮโน"] },
  { id:"helen", name:"Helen", role:"Support", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/d/d1/HelenSkinSplash1.jpg/revision/latest/scale-to-width-down/200?cb=20260914012516", aliases:["เฮเลน","Peura","เพียวร่า"] },
  // ─── I ───
  { id:"iggy", name:"Iggy", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/76c762a4ceee074fe4459a483350dbe4258081001.jpeg", aliases:["อิกกี้","IGGY"] },
  { id:"ignis", name:"Ignis", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301240.png", aliases:["อิกนิส"] },
  { id:"illumia", name:"Illumia", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301360.png", aliases:["อิลลูเมีย","Ilumia"] },
  { id:"ishar", name:"Ishar", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/38234f18a68b8d881c3c40824e10482a.jpg", aliases:["อิชาร์"] },
  // ─── J ───
  { id:"jinna", name:"Jinna", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301150.png", aliases:["จินน่า","Jinnar"] },
  // ─── K ───
  { id:"kahlii", name:"Kahlii", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301100.png", aliases:["คาลี่"] },
  { id:"kaine", name:"Kaine", role:"Assassin", role2:"Fighter", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/2/20/Kaine_s1.png/revision/latest?cb=20240414065850", aliases:["เคน","Batman","แบทแมน"] },
  { id:"keera", name:"Keera", role:"Assassin", role2:"Mage", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/4c631eb81c40729aa258cc00774b2792.jpg", aliases:["คีร่า"] },
  { id:"kilgroth", name:"Kil'Groth", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301390.png", aliases:["คิลกรอธ","KilGroth"] },
  { id:"kriknak", name:"Kriknak", role:"Assassin", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301620.png", aliases:["กริกนัค","กริก"] },
  { id:"krixi", name:"Krixi", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301060.png", aliases:["คริกซี่"] },
  { id:"krizzix", name:"Krizzix", role:"Support", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/c416277e6010025f3ad1b3a585291367.png", aliases:["คริซิกซ์"] },
  // ─── L ───
  { id:"lauriel", name:"Lauriel", role:"Mage", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301410.png", aliases:["ลอเรียล"] },
  { id:"laville", name:"Laville", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/c3e8a62d08efa403fe9749696b6bdafe.jpg", aliases:["ลาวิลล์"] },
  { id:"liliana", name:"Liliana", role:"Mage", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305100.png", aliases:["ลิเลียน่า"] },
  { id:"lindis", name:"Lindis", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301770.png", aliases:["ลินดิส"] },
  { id:"lorion", name:"Lorion", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/8bfeffe5e464f8862217c7305dbc52fe.jpg", aliases:["ลอเรียน"] },
  { id:"lubu", name:"Lu Bu", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301280.png", aliases:["ลู่บู้","LuBu"] },
  { id:"lumburr", name:"Lumburr", role:"Support", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301680.png", aliases:["ลัมเบอร์"] },
  // ─── M ───
  { id:"maloch", name:"Maloch", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301230.png", aliases:["มาล็อค"] },
  { id:"marja", name:"Marja", role:"Mage", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301210.png", aliases:["มาร์จ้า"] },
  { id:"max", name:"Max", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301800.png", aliases:["แม็กซ์"] },
  { id:"mganga", name:"Mganga", role:"Mage", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301190.png", aliases:["มกังกา"] },
  { id:"mina", name:"Mina", role:"Tank", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301200.png", aliases:["มิน่า"] },
  { id:"ming", name:"Ming", role:"Mage", role2:null, image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/9/90/Ming_physiognomist.jpg/revision/latest/scale-to-width-down/200?cb=20250113164018", aliases:["หมิง"] },
  { id:"moren", name:"Moren", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301700.png", aliases:["มอเรน"] },
  { id:"mortos", name:"Mortos", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/14775da68e9b3427a5626cf04d9448bc688675385.jpg", aliases:["มอร์ทอส","Arthur","อาเธอร์"] },
  { id:"murad", name:"Murad", role:"Assassin", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301310.png", aliases:["มูราด"] },
  // ─── N ───
  { id:"nakroth", name:"Nakroth", role:"Assassin", role2:"Fighter", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/0b1620c324e7800851b412a9439a689b122140483.jpeg", aliases:["นาครอธ","นาค"] },
  { id:"natalya", name:"Natalya", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301420.png", aliases:["นาตาเลีย"] },
  // ─── O ───
  { id:"omega", name:"Omega", role:"Tank", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301140.png", aliases:["โอเมก้า"] },
  { id:"omen", name:"Omen", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/74fee9655c49277cd28834c189574987.png", aliases:["โอเมน"] },
  { id:"ormarr", name:"Ormarr", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301170.png", aliases:["ออร์มาร์"] },
  // ─── P ───
  { id:"paine", name:"Paine", role:"Assassin", role2:"Mage", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/7f56b60892d0215f36f436e0b6d812fa.jpg", aliases:["เพน"] },
  { id:"preyta", name:"Preyta", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301480.png", aliases:["เพรย์ต้า"] },
  // ─── Q ───
  { id:"qi", name:"Qi", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305280.png", aliases:["ชี"] },
  { id:"quillen", name:"Quillen", role:"Assassin", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305180.png", aliases:["ควิลเลน"] },
  // ─── R ───
  { id:"raz", name:"Raz", role:"Mage", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301570.png", aliases:["ราซ"] },
  { id:"riktor", name:"Riktor", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305150.png", aliases:["ริคเตอร์"] },
  { id:"rouie", name:"Rouie", role:"Support", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/caea84b1bebac1a0f5f0b1d0c717c5ad.jpg", aliases:["รูอี้"] },
  { id:"rourke", name:"Rourke", role:"Fighter", role2:"Carry", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305120.png", aliases:["รอร์ค"] },
  { id:"roxie", name:"Roxie", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/9d7b3043e93366865d62465b9a310f92580957575.jpg", aliases:["ร็อกซี่"] },
  { id:"ryoma", name:"Ryoma", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301630.png", aliases:["เรียวม่า"] },
  // ─── S ───
  { id:"sephera", name:"Sephera", role:"Mage", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305270.png", aliases:["เซฟีร่า"] },
  { id:"sinestrea", name:"Sinestrea", role:"Assassin", role2:"Fighter", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/d40b1c67247e69e1b2fd63ed44d9d7cd.jpg", aliases:["ไซเนสเตรีย"] },
  { id:"skud", name:"Skud", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301340.png", aliases:["สกัด"] },
  { id:"slimz", name:"Slimz", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301690.png", aliases:["สลิมซ์"] },
  { id:"stuart", name:"Stuart", role:"Assassin", role2:"Mage", image:"https://static.wikia.nocookie.net/strikeofkings_gamepedia_en/images/b/b0/Stuart.webp/revision/latest/scale-to-width-down/159?cb=20240109043636", aliases:["สจ๊วต","Joker","โจ๊กเกอร์","The Joker"] },
  { id:"superman", name:"Superman", role:"Fighter", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301400.png", aliases:["ซูเปอร์แมน","Super man"] },
  // ─── T ───
  { id:"taara", name:"Taara", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301440.png", aliases:["ทาร่า"] },
  { id:"tachi", name:"Tachi", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/e6a658b1e3485aba22fd6e401700b4d0722633259.png", aliases:["ทาชิ"] },
  { id:"tamyn", name:"Tamyn (ทมิฬ)", role:"Fighter", role2:"Assassin", image:"images/tamyn.jpg", aliases:["ทมิฬ","Tamyn","Tamin","ราหู","นาบิล","นาบิล อานาน","Nabil"] },
  { id:"teemee", name:"TeeMee", role:"Support", role2:"Tank", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301860.png", aliases:["ทีมี"] },
  { id:"teeri", name:"Teeri", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/9e694302eee95cda70d5d7878f29859f604290561.jpg", aliases:["ทีรี่"] },
  { id:"telannas", name:"Tel'Annas", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/316aedd067a6891ec9262c4791048c4e002690156.jpg", aliases:["เทล","เทลแอนนัส","TelAnnas"] },
  { id:"thane", name:"Thane", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301350.png", aliases:["เธน"] },
  { id:"theflash", name:"The Flash", role:"Mage", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305070.png", aliases:["เดอะแฟลช","แฟลช","Flash"] },
  { id:"thorne", name:"Thorne", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/177b5dc323de1f131104bc3a61a30dc5.jpg", aliases:["ธอร์น"] },
  { id:"toro", name:"Toro", role:"Tank", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301050.png", aliases:["โทโร่"] },
  { id:"tulen", name:"Tulen", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301900.png", aliases:["ทูเลน"] },
  // ─── V ───
  { id:"valhein", name:"Valhein", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301330.png", aliases:["แวน","แวนเฮล","วัลเฮน"] },
  { id:"veera", name:"Veera", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/4596bab5ebaf35a3023239179b889122653464512.jpg", aliases:["วีร่า"] },
  { id:"veres", name:"Veres", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305200.png", aliases:["วีเรส"] },
  { id:"violet", name:"Violet", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/8c6c8393bd8e9b873eeb2028cc5ff239784341618.png", aliases:["ไวโอเล็ต"] },
  { id:"volkath", name:"Volkath", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/0226a3b59534f7e097b31faf55719ffc.jpg", aliases:["โวลคาธ"] },
  // ─── W ───
  { id:"wiro", name:"Wiro", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301940.png", aliases:["วิโร่"] },
  { id:"wisp", name:"Wisp", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305080.png", aliases:["วิสป์"] },
  { id:"wonderwoman", name:"Wonder Woman", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305040.png", aliases:["วันเดอร์วูแมน","WonderWoman"] },
  { id:"wukong", name:"Wukong", role:"Assassin", role2:"Fighter", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/8e1736836bc737a5a9495cec55c1d64d.jpg", aliases:["วูคอง","ลิง","WuKong"] },
  // ─── X ───
  { id:"xeniel", name:"Xeniel", role:"Tank", role2:"Support", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301490.png", aliases:["เซเนียล"] },
  // ─── Y ───
  { id:"ybneth", name:"Y'bneth", role:"Tank", role2:"Fighter", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305090.png", aliases:["อิ๊บเนธ","Ybneth"] },
  { id:"yan", name:"Yan", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/e30adc9818a781b682c88a97ff830e00605372736.jpg", aliases:["แยน"] },
  { id:"yena", name:"Yena", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/5c5c460fe14e67f351782aa133fbb1d5432803963.jpeg", aliases:["เยน่า"] },
  { id:"yorn", name:"Yorn", role:"Carry", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301120.png", aliases:["ยอร์น"] },
  { id:"yue", name:"Yue", role:"Mage", role2:null, image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/215047bd2e8615e7ca6758d94e65b053913347022.jpg", aliases:["ยู่เยว่"] },
  // ─── Z ───
  { id:"zanis", name:"Zanis", role:"Fighter", role2:null, image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301290.png", aliases:["ซานิส"] },
  { id:"zata", name:"Zata", role:"Mage", role2:"Assassin", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/e6cdecc7664a50ccc8bdef6172479882.jpg", aliases:["ซาต้า"] },
  { id:"zephys", name:"Zephys", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/a19d433210391d6be2774f3fa5a7cd21087807594.jpg", aliases:["เซฟิส"] },
  { id:"zill", name:"Zill", role:"Mage", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/301460.png", aliases:["ซิล"] },
  { id:"zip", name:"Zip", role:"Support", role2:"Tank", image:"https://cdn-webth.garenanow.com/webth/cdn/gth/rov/non-events/official/5248fb3ed974b26ee5a0548f4a4c7bdb604470912.jpeg", aliases:["ซิป"] },
  { id:"zuka", name:"Zuka", role:"Fighter", role2:"Assassin", image:"https://cdn-webth.garenanow.com/mgames/kgcenter/th/Art_Resources/UI/Dynamic/Icon/305030.png", aliases:["ซูก้า","หมีแพนด้า"] },
];
