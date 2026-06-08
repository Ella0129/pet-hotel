# 🐾 毛孩旅館 — 寵物旅館與美容預約管理系統

> 411277018 張予庭 | 軟體設計課程專題

## 系統功能

| 功能 | 說明 |
|------|------|
| 會員註冊/登入 | Firebase Auth，Email + 密碼驗證 |
| 寵物資料管理 | 新增/編輯/刪除寵物（名字、物種、品種、健康備注）|
| 預約住宿/美容 | 選擇服務方案、日期、時間，即時費用試算 |
| 預約管理 | 查看預約歷史、按狀態篩選、取消預約 |
| 管理員後台 | 審核預約、更新狀態、查看會員、發送緊急通知 |
| 通知系統 | 即時通知推送，未讀計數，全部已讀 |

## 技術架構

```
Frontend  ──► Vercel (Static Hosting)
Backend   ──► Firebase (Auth + Firestore)
           │
           ├── firebase/auth       會員驗證
           ├── firestore/users     使用者資料
           ├── firestore/pets      寵物資料
           ├── firestore/reservations  預約記錄
           ├── firestore/notifications 通知
           └── firestore/services  服務方案
```

## 部署步驟

### Step 1 — 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「建立專案」→ 輸入名稱 → 建立
3. 左側選單 → **Authentication** → 「開始使用」
   - 啟用「電子郵件/密碼」登入方式
4. 左側選單 → **Firestore Database** → 「建立資料庫」
   - 選擇「以測試模式啟動」（之後再套用安全規則）

### Step 2 — 取得 Firebase 設定

1. 專案設定（齒輪圖示）→「一般」→ 往下滾至「你的應用程式」
2. 點擊「</> 網頁」→ 輸入應用程式名稱 → 複製 `firebaseConfig`
3. 開啟 `js/config.js`，將 `firebaseConfig` 填入對應欄位

```js
// js/config.js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456..."
};
```

### Step 3 — 套用 Firestore 安全規則

1. Firebase Console → Firestore → **規則** 分頁
2. 複製 `firestore.rules` 的內容貼上 → 發布

### Step 4 — 建立管理員帳號

1. 在 `js/config.js` 中的 `ADMIN_EMAILS` 陣列填入管理員 Email：
```js
const ADMIN_EMAILS = ["admin@pethotel.com"];
```
2. 用該 Email 在系統上「註冊」，系統會自動賦予 `admin` 角色

### Step 5 — 部署到 Vercel

**方法 A（GitHub 自動部署）：**
1. 將整個資料夾推到 GitHub repository
2. 前往 [vercel.com](https://vercel.com) → Import Project → 選擇 repo
3. Framework Preset 選 **Other** → Deploy

**方法 B（Vercel CLI）：**
```bash
npm install -g vercel
cd pet-hotel
vercel --prod
```

## 本機測試

直接用 VS Code Live Server 開啟 `index.html` 即可（需已填入 Firebase 設定）。

## 頁面說明


| 檔案 | 說明 |
|------|------|
| `index.html` | 登入 / 註冊 |
| `dashboard.html` | 會員首頁（統計、近期預約、通知）|
| `pets.html` | 寵物資料 CRUD |
| `reserve.html` | 預約服務（住宿/美容）|
| `reservations.html` | 我的預約記錄 |
| `notifications.html` | 通知中心 |
| `admin.html` | 管理員後台（需 admin 角色）|

## 預約狀態流程

```
送出預約
   ↓
pending（待審核）
   ↓ 管理員確認/拒絕
confirmed / rejected
   ↓ 管理員開始服務
in_progress（服務中）
   ↓ 管理員完成
completed（已完成）

（會員可在 pending/confirmed 取消 → cancelled）
```
