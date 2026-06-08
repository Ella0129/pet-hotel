// ⚠️ 請填入你的 Firebase 專案設定
// Firebase Console → 專案設定 → 你的應用程式 → firebaseConfig

const firebaseConfig = {
  apiKey:            "AIzaSyBeEqcebKyZJZkJ4ZHw4BVF6B6s3wxfpTY",
  authDomain:        "pet-hotel-58904.firebaseapp.com",
  projectId:         "pet-hotel-58904",
  storageBucket:     "pet-hotel-58904.firebasestorage.app",
  messagingSenderId: "16123782790",
  appId:             "1:16123782790:web:3591bbb0f55e5dad169307"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// 管理員 Email（可設定多個）
const ADMIN_EMAILS = ["ekids1781@gmail.com"];

// 初始化服務資料（第一次執行時建立）
async function initServices() {
  const snap = await db.collection("services").limit(1).get();
  if (!snap.empty) return;

  const services = [
    { name: "標準住宿",  type: "hotel",    price: 800,  duration: "1 天",  description: "舒適標準房間，每日餵食與清潔" },
    { name: "豪華住宿",  type: "hotel",    price: 1500, duration: "1 天",  description: "豪華套房，特別照護與玩耍時間" },
    { name: "基本美容",  type: "grooming", price: 600,  duration: "2 小時", description: "洗澡、吹乾、基本修剪" },
    { name: "精緻美容",  type: "grooming", price: 1200, duration: "3 小時", description: "全套美容造型，包含修甲與清耳" },
  ];

  const batch = db.batch();
  services.forEach(s => {
    const ref = db.collection("services").doc();
    batch.set(ref, { ...s, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();
}
