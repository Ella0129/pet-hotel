// ── TOAST ──────────────────────────────────────────────────────────
function toast(message, type = "success", duration = 3000) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || ""}</span> ${message}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── LOADING ────────────────────────────────────────────────────────
function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
}

function setBtn(btnId, loading, text) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "處理中..." : text;
}

// ── DATE ───────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return "—";
  const d = val.toDate ? val.toDate() : new Date(val);
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatDateTime(val) {
  if (!val) return "—";
  const d = val.toDate ? val.toDate() : new Date(val);
  return d.toLocaleString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(val) {
  if (!val) return "";
  const d = val.toDate ? val.toDate() : new Date(val);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小時前`;
  const days = Math.floor(hrs / 24);
  return `${days} 天前`;
}

// ── STATUS ─────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending:     "待審核",
  confirmed:   "已確認",
  in_progress: "服務中",
  completed:   "已完成",
  cancelled:   "已取消",
  rejected:    "已拒絕"
};

function statusBadge(status) {
  return `<span class="badge badge-${status}">${STATUS_LABELS[status] || status}</span>`;
}

function typeBadge(type) {
  return `<span class="badge badge-${type}">${type === "hotel" ? "🏨 住宿" : "✂️ 美容"}</span>`;
}

// ── MODAL ──────────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

// ── MOBILE NAV ─────────────────────────────────────────────────────
function toggleMobileNav() {
  const links = document.getElementById("navLinks");
  const btn   = document.getElementById("hamburgerBtn");
  if (!links) return;
  const isOpen = links.classList.toggle("open");
  btn.textContent = isOpen ? "✕" : "☰";
}

// Close mobile nav when clicking a link
document.addEventListener("click", e => {
  const nav = document.getElementById("navLinks");
  const btn = document.getElementById("hamburgerBtn");
  if (!nav) return;
  if (!nav.contains(e.target) && !btn?.contains(e.target)) {
    nav.classList.remove("open");
    if (btn) btn.textContent = "☰";
  }
});

// ── NAV ────────────────────────────────────────────────────────────
async function renderNav(currentPage) {
  const user = auth.currentUser;
  if (!user) return;

  let userDoc;
  try {
    userDoc = await db.collection("users").doc(user.uid).get();
  } catch { return; }

  const isAdmin = userDoc.exists && userDoc.data().role === "admin";
  const name    = userDoc.exists ? userDoc.data().name : user.email;

  // Unread notifications count
  let unread = 0;
  try {
    const snap = await db.collection("notifications")
      .where("userId", "==", user.uid)
      .where("read", "==", false)
      .get();
    unread = snap.size;
  } catch {}

  const nav = document.getElementById("navbar");
  if (!nav) return;

  const pages = [
    { href: "dashboard.html",      label: "首頁",   icon: "🏠" },
    { href: "pets.html",           label: "寵物管理", icon: "🐾" },
    { href: "reserve.html",        label: "預約服務", icon: "📅" },
    { href: "reservations.html",   label: "我的預約", icon: "📋" },
    { href: "notifications.html",  label: `通知${unread > 0 ? `<span class='notif-badge'>${unread}</span>` : ""}`, icon: "🔔" },
  ];

  nav.innerHTML = `
    <div class="navbar-brand"><span>🐾</span> 毛孩旅館</div>
    <button class="hamburger" id="hamburgerBtn" onclick="toggleMobileNav()">☰</button>
    <div class="nav-links" id="navLinks">
      ${pages.map(p => `
        <a href="${p.href}" class="nav-link ${currentPage === p.href ? "active" : ""}" onclick="document.getElementById('navLinks').classList.remove('open')">
          ${p.icon} <span>${p.label}</span>
        </a>`).join("")}
      ${isAdmin ? `
        <div class="nav-divider"></div>
        <a href="admin.html" class="nav-link admin-link ${currentPage === "admin.html" ? "active" : ""}" onclick="document.getElementById('navLinks').classList.remove('open')">
          ⚙️ <span>管理後台</span>
        </a>` : ""}
      <div class="nav-divider"></div>
      <span class="nav-user">👤 ${name}</span>
      <button class="btn-nav-logout" onclick="logout()">登出</button>
    </div>
  `;
}

async function logout() {
  await auth.signOut();
  window.location.href = "index.html";
}

// ── AUTH GUARD ─────────────────────────────────────────────────────
function requireAuth(callback) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      callback(user);
    }
  });
}

async function requireAdmin(callback) {
  auth.onAuthStateChanged(async user => {
    if (!user) { window.location.href = "index.html"; return; }
    try {
      const doc = await db.collection("users").doc(user.uid).get();
      if (!doc.exists || doc.data().role !== "admin") {
        // 非管理員：顯示拒絕訊息後導回首頁
        document.body.innerHTML = `
          <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FDFAF5;font-family:sans-serif;text-align:center;padding:2rem">
            <div>
              <div style="font-size:4rem;margin-bottom:1rem">🚫</div>
              <h2 style="color:#1B4F72;margin-bottom:.5rem">無管理員權限</h2>
              <p style="color:#7F8C8D;margin-bottom:1.5rem">此頁面僅限管理員存取</p>
              <a href="dashboard.html" style="background:#1B4F72;color:#fff;padding:.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:600">返回首頁</a>
            </div>
          </div>`;
        return;
      }
      callback(user, doc.data());
    } catch {
      window.location.href = "index.html";
    }
  });
}

// ── SEND NOTIFICATION ──────────────────────────────────────────────
async function sendNotification(userId, title, message, type = "system", reservationId = null) {
  await db.collection("notifications").add({
    userId, title, message, type,
    reservationId: reservationId || null,
    read: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
