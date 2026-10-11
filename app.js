// =============================================
// app.js —— 校园探索家 · 游戏逻辑
// 功能：迷雾探索 + 隐藏点解锁 + 宠物养成
// =============================================

const STORAGE_KEY = "campus-explorer-v1";

const BADGES = [
  { id: "newbie", name: "初来乍到", icon: "🌱", need: 3 },
  { id: "warmup", name: "渐入佳境", icon: "🌿", need: 8 },
  { id: "expert", name: "地头蛇", icon: "🗺️", need: 16 },
  { id: "master", name: "校园探索家", icon: "👑", need: 24 },
];

const ALL_TASKS = SPOTS.flatMap(s => s.tasks.map(t => ({ ...t, spotId: s.id })));
const TOTAL = ALL_TASKS.length;

// 系列 → 宠物属性
const CATEGORY_STATS = {
  study: "intellect",
  sports: "strength",
  food: "fullness",
  explore: "curiosity",
  life: "luck",
  hidden: "luck",
};

const STAT_NAMES = {
  intellect: ["🧠", "智力"],
  strength: ["💪", "体力"],
  fullness: ["🍖", "饱食"],
  curiosity: ["🔍", "好奇"],
  luck: ["🍀", "幸运"],
};

const MAX_STAT = 60; // 单个属性满值，用于属性条宽度计算

// ---------- 状态 ----------
function defaultState() {
  return {
    completed: [],
    notes: {},
    demoMode: false,
    unlockedHidden: [],
    pet: { name: "团团" },
    bio: "",
    lastCheckin: null,
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {}
  return defaultState();
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

let state = loadState();
let currentSpot = null;

// ---------- 工具 ----------
const $ = id => document.getElementById(id);
const taskDone = id => state.completed.includes(id);
const spotStarted = s => s.tasks.some(t => taskDone(t.id));
const spotDone = s => s.tasks.every(t => taskDone(t.id));
const spotDoneCount = s => s.tasks.filter(t => taskDone(t.id)).length;
const doneCount = () => state.completed.length;
const isHiddenUnlocked = s => !s.hidden || (state.unlockedHidden || []).includes(s.id);

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

let toastTimer;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ---------- 宠物 ----------
function calcPet() {
  const stats = { intellect: 0, strength: 0, fullness: 0, curiosity: 0, luck: 0 };
  state.completed.forEach(taskId => {
    const task = ALL_TASKS.find(t => t.id === taskId);
    if (!task) return;
    const spot = SPOTS.find(s => s.id === task.spotId);
    if (!spot) return;
    const key = CATEGORY_STATS[spot.category];
    if (key) stats[key] += task.points;
  });
  return stats;
}

function petStage(count) {
  if (count === 0) return { icon: "🥚", name: "精灵蛋", desc: "完成第一次打卡来孵化它" };
  if (count <= 7) return { icon: "🐣", name: "幼年期", desc: "刚破壳的小团子" };
  if (count <= 15) return { icon: "🐾", name: "成长体", desc: "戴上了小围巾" };
  if (count <= 23) return { icon: "🦊", name: "成熟体", desc: "眼神变得坚定" };
  return { icon: "🛡️", name: "校园守护兽", desc: "守护整座校园的探索" };
}

function petMood() {
  if (doneCount() === 0) return "蛋壳里传来轻轻的晃动…";
  const last = state.lastCheckin;
  if (!last) return "正在熟悉新世界…";
  const days = (Date.now() - last) / 86400000;
  if (days < 1) return "今天被带出门探索，超开心！✨";
  if (days < 3) return "心情不错，晒着太阳～";
  if (days < 7) return "有点想出去逛逛了…";
  return "好想出去看看呀……";
}

function renderPet() {
  const count = doneCount();
  const stage = petStage(count);
  const stats = calcPet();
  const p = petPersonality();

  $("pet-avatar").textContent = stage.icon;
  $("pet-name").textContent = state.pet.name;
  $("pet-stage").textContent = stage.name;
  $("pet-stage-desc").textContent = p.tag !== "??" ? `${p.tag} · ${stage.desc}` : stage.desc;
  $("pet-mood").textContent = petMood();
  $("pet-stats").innerHTML = Object.keys(STAT_NAMES).map(k => {
    const [icon, label] = STAT_NAMES[k];
    const v = stats[k] || 0;
    const pct = Math.min(100, Math.round(v / MAX_STAT * 100));
    return `<div class="pet-stat">
      <span class="pet-stat-label">${icon} ${label}</span>
      <div class="pet-stat-bar"><i style="width:${pct}%"></i></div>
      <span class="pet-stat-val">${v}</span>
    </div>`;
  }).join("");
}
// ---------- 今日任务 ----------
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function getDailyTasks() {
  const dateStr = new Date().toISOString().slice(0, 10);
  const seed = [...dateStr].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const rng = mulberry32(seed);

  const pool = ALL_TASKS.filter(t => {
    const s = SPOTS.find(x => x.id === t.spotId);
    return s && (!s.hidden || isHiddenUnlocked(s));
  });

  const picks = [];
  while (picks.length < 3 && pool.length) {
    const i = Math.floor(rng() * pool.length);
    picks.push(pool.splice(i, 1)[0]);
  }
  return picks;
}

function renderDaily() {
  const el = $("daily-list");
  if (!el) return;
  const tasks = getDailyTasks();
  el.innerHTML = tasks.map(t => {
    const spot = SPOTS.find(s => s.id === t.spotId);
    const done = taskDone(t.id);
    return `<button class="daily-task ${done ? "done" : ""}" data-spot="${spot.id}">
      <span>${done ? "✅" : "🎯"} ${escapeHTML(t.title)}</span>
      <span class="daily-spot">${spot.icon} ${spot.name}</span>
    </button>`;
  }).join("");
  el.querySelectorAll(".daily-task").forEach(btn => {
    btn.addEventListener("click", () => {
      const spot = SPOTS.find(s => s.id === btn.dataset.spot);
      if (spot) openPanel(spot);
    });
  });
}
// ---------- 渲染 ----------
function renderAll() {
  renderSpots();
  renderProgress();
  renderBadges();
  renderPet();
  renderDaily();
  if (currentSpot) renderPanel(currentSpot);
}

function renderSpots() {
  document.querySelectorAll(".spot, .fog").forEach(el => el.remove());
  const wrap = $("map-wrap");

  SPOTS.forEach(s => {
    if (s.hidden && !isHiddenUnlocked(s)) return;

    const started = spotStarted(s);
    const done = spotDone(s);

    const fog = document.createElement("div");
    fog.className = "fog" + (started ? " cleared" : "");
    fog.style.left = s.x + "%";
    fog.style.top = s.y + "%";
    wrap.appendChild(fog);

    const b = document.createElement("button");
    b.type = "button";
    b.className = "spot";
    if (done) b.classList.add("done");
    else if (started) b.classList.add("partial");
    else b.classList.add("locked");
    if (s.hidden) b.classList.add("hidden-spot");
    b.style.left = s.x + "%";
    b.style.top = s.y + "%";
    b.title = started ? s.name : "？？？";
    b.innerHTML = `<span class="spot-icon">${started ? s.icon : "❓"}</span>`;
    b.addEventListener("click", () => openPanel(s));
    wrap.appendChild(b);
  });
}

function renderProgress() {
  $("done-count").textContent = doneCount();
  $("total-count").textContent = TOTAL;
  const p = doneCount() / TOTAL;
  $("progress-fill").style.width = (p * 100) + "%";

  const overlay = $("map-overlay");
  if (overlay) overlay.style.opacity = Math.max(0, 0.35 * (1 - p)).toFixed(2);
}

function renderBadges() {
  const n = doneCount();
  $("badge-list").innerHTML = BADGES.map(b => {
    const got = n >= b.need;
    return `<div class="badge ${got ? "got" : ""}">
      <div class="badge-icon">${got ? b.icon : "🔒"}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-need">${got ? "已解锁" : "完成 " + b.need + " 个任务"}</div>
    </div>`;
  }).join("");
}

// ---------- 面板 ----------
function openPanel(spot) {
  currentSpot = spot;
  $("panel-empty").hidden = true;
  $("panel-content").hidden = false;
  renderPanel(spot);
}

function closePanel() {
  currentSpot = null;
  $("panel-content").hidden = true;
  $("panel-empty").hidden = false;
}

function renderPanel(spot) {
  const div = $("panel-spot");
  div.innerHTML = `
    <h2>${spot.icon} ${spot.name}</h2>
    <p class="spot-progress">完成 ${spotDoneCount(spot)} / ${spot.tasks.length} 项${spotDone(spot) ? " · 已点亮 ✨" : ""}</p>
    <ul class="task-list">
      ${spot.tasks.map(t => {
        const done = taskDone(t.id);
        return `<li class="task ${done ? "task-done" : ""}">
          <div class="task-head">
            <span class="task-title">${done ? "✅" : "🔲"} ${escapeHTML(t.title)}</span>
            <span class="task-points">+${t.points}</span>
          </div>
          ${done
            ? `<input class="note-input" data-task="${t.id}" value="${escapeHTML(state.notes[t.id] || "")}" placeholder="写句感想（可选）" />`
            : `<button class="checkin-btn" data-task="${t.id}">📌 打卡</button>`}
        </li>`;
      }).join("")}
    </ul>`;

  div.querySelectorAll(".checkin-btn").forEach(btn => {
    btn.addEventListener("click", () => checkIn(spot, btn.dataset.task));
  });
  div.querySelectorAll(".note-input").forEach(inp => {
    inp.addEventListener("change", e => {
      state.notes[inp.dataset.task] = e.target.value;
      saveState();
    });
  });
}

// ---------- 打卡 ----------
async function checkIn(spot, taskId) {
  const task = spot.tasks.find(t => t.id === taskId);
  const btn = document.querySelector(`.checkin-btn[data-task="${taskId}"]`);
  if (!task || !btn) return;

  btn.disabled = true;
  btn.textContent = "定位中…";

  try {
    if (state.demoMode) {
      toast("🧪 演示模式：已跳过定位验证");
      completeTask(spot, task);
      return;
    }
    if (spot.lat == null || spot.lng == null) {
      toast("⚠️ 这个点还没录 GPS 坐标，请先勾选右上角「演示模式」打卡");
      return;
    }
    const pos = await getPosition();
    const d = distanceM(pos.lat, pos.lng, spot.lat, spot.lng);
    if (d <= spot.radius) {
      toast(`📍 定位成功，距离 ${Math.round(d)} 米`);
      completeTask(spot, task);
    } else {
      toast(`🏃 还差 ${Math.round(d)} 米，走近一点再打卡～`);
    }
  } catch (err) {
    toast("定位失败：" + friendlyError(err) + "（可开启演示模式）");
  } finally {
    btn.disabled = false;
    btn.textContent = "📌 打卡";
  }
}

function completeTask(spot, task) {
  const oldStage = petStage(doneCount()).icon;
  if (!taskDone(task.id)) state.completed.push(task.id);
  state.lastCheckin = Date.now();
  saveState();

  const newly = checkHiddenUnlocks();
  const newStage = petStage(doneCount()).icon;
  renderAll();

  if (oldStage !== newStage) {
    if (oldStage === "🥚") toast("🎉 精灵蛋孵化了！🐣");
    else toast(`✨ 宠物进化了！${newStage}`);
  } else if (newly.length) {
    toast(`✨ 神秘地点浮现：${newly.map(s => s.icon + " " + s.name).join("、")}！`);
  } else {
    toast(`🎉 完成「${task.title}」 +${task.points}`);
  }
}

function checkHiddenUnlocks() {
  const n = doneCount();
  const unlocked = state.unlockedHidden || (state.unlockedHidden = []);
  const newly = [];
  SPOTS.forEach(s => {
    if (!s.hidden || unlocked.includes(s.id)) return;
    let unlock = false;
    if (s.unlockAfterSpot) {
      const target = SPOTS.find(x => x.id === s.unlockAfterSpot);
      unlock = target && target.tasks.every(t => taskDone(t.id));
    } else if (s.unlockAt != null) {
      unlock = n >= s.unlockAt;
    }
    if (unlock) {
      unlocked.push(s.id);
      newly.push(s);
    }
  });
  if (newly.length) saveState();
  return newly;
}

// ---------- 定位 ----------
function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject({ message: "浏览器不支持定位" });
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 20000 }
    );
  });
}

function distanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = d => d * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function friendlyError(err) {
  switch (err && err.code) {
    case 1: return "定位权限被拒绝";
    case 2: return "定位不可用";
    case 3: return "定位超时";
    default: return (err && err.message) || "未知错误";
  }
}
// ---------- 我的主页 ----------
function petAutoBio() {
  const stage = petStage(doneCount());
  const p = petPersonality();
  const pct = Math.round(doneCount() / TOTAL * 100);
  if (doneCount() === 0) return "还没孵化的精灵蛋，等待第一次探索。";
  return `${p.tag !== "??" ? p.tag + "的" : ""}${stage.name}，已经探索了校园 ${pct}% 的角落。`;
}

function renderProfile() {
  const stage = petStage(doneCount());
  const p = petPersonality();
  const pct = Math.round(doneCount() / TOTAL * 100);
  $("profile-pet").innerHTML = `
    <span class="big-avatar">${stage.icon}</span>
    <div class="pet-name">${escapeHTML(state.pet.name)} · ${stage.name}</div>
    <div class="pet-bio">${escapeHTML(petAutoBio())}</div>`;
  $("profile-bio").value = state.bio || "";
  $("profile-stats").innerHTML = `
    <div class="profile-row"><span>🧭 探索进度</span><b>${doneCount()} / ${TOTAL}（${pct}%）</b></div>
    <div class="profile-row"><span>🎭 性格</span><b>${p.tag !== "??" ? p.tag : "尚未形成"}</b></div>
    <div class="profile-row"><span>🏅 已解锁徽章</span><b>${BADGES.filter(b => doneCount() >= b.need).length} / ${BADGES.length}</b></div>`;
}

// ---------- 事件 ----------
$("demo-toggle").addEventListener("change", e => {
  state.demoMode = e.target.checked;
  saveState();
  toast(state.demoMode ? "🧪 演示模式已开启" : "📍 真实定位模式");
});

$("panel-close").addEventListener("click", closePanel);

$("reset-btn").addEventListener("click", () => {
  if (confirm("确定要清空所有进度吗？（宠物也会回到蛋的状态）")) {
    state = defaultState();
    saveState();
    currentSpot = null;
    renderAll();
    closePanel();
    toast("已重置");
  }
});

// ---------- 宠物性格 ----------
const PERSONALITIES = {
  intellect: ["学霸型", "今天也去图书馆吗？"],
  strength: ["运动型", "走，去操场！"],
  fullness: ["吃货型", "先去吃点啥？"],
  curiosity: ["探险型", "那个角落还没去过！"],
  luck: ["锦鲤型", "今天会有好事发生～"],
};
function petPersonality() {
  const stats = calcPet();
  const entries = Object.entries(stats);
  const max = Math.max(...entries.map(e => e[1]));
  if (max === 0) return { tag: "??", line: "蛋壳里传来轻轻的晃动…" };
  const [key] = entries.find(e => e[1] === max) || entries[0];
  const [tag, line] = PERSONALITIES[key];
  return { tag, line };
}
// ---------- 宠物改名 ----------
$("profile-btn").addEventListener("click", () => {
  $("profile-modal").hidden = false;
  renderProfile();
});
$("profile-close").addEventListener("click", () => {
  $("profile-modal").hidden = true;
});
$("profile-modal").addEventListener("click", e => {
  if (e.target.id === "profile-modal") $("profile-modal").hidden = true;
});
$("profile-bio").addEventListener("input", e => {
  state.bio = e.target.value;
  saveState();
});
$("pet-name").addEventListener("click", () => {
  const name = prompt("给宠物起个名字：", state.pet.name);
  if (name && name.trim()) {
    state.pet.name = name.trim();
    saveState();
    renderPet();
  }
});

// 开发者模式：网址后加 ?debug
if (new URLSearchParams(location.search).has("debug")) {
  const dp = $("debug-panel");
  dp.hidden = false;
  dp.innerHTML = `<button id="debug-pos">📍 获取当前坐标</button><pre id="debug-out"></pre>`;
  $("debug-pos").addEventListener("click", async () => {
    try {
      const p = await getPosition();
      $("debug-out").textContent = `lat: ${p.lat.toFixed(6)}, lng: ${p.lng.toFixed(6)}`;
    } catch (e) {
      $("debug-out").textContent = friendlyError(e);
    }
  });
}

// ---------- 启动 ----------
$("demo-toggle").checked = state.demoMode;
checkHiddenUnlocks();
renderAll();