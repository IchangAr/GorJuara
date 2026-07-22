
// --- Helper: Group Bookings by groupId ---
function groupBookings(list) {
  const groups = {};
  list.forEach(b => {
    const key = b.groupId || b.id;
    if (!groups[key]) {
      groups[key] = { ...b, childIds: [b.id] };
    } else {
      groups[key].childIds.push(b.id);
    }
  });
  return Object.values(groups).sort((a, b) => b.id - a.id);
}

function cancelBooking(groupId) {
    updateStatus(groupId, 'cancel-pending');
}

// --- 1. KONFIGURASI & DATA UTAMA ---
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const pricePerHour = 50000;
const courts = ["Lapangan 1", "Lapangan 2", "Lapangan 3"];

let currentUser = sessionStorage.getItem("currentUser") || null;
let selectedDate = getFutureDate(0).full;
let selectedTime = null;
let selectedCourt = null;
let currentAdminTab = "pending";

let bookings = JSON.parse(
  localStorage.getItem("badminton_bookings_final_v3")
) || [
  {
    id: 101,
    date: getFutureDate(0).full,
    time: "10:00",
    court: "Lapangan 1",
    status: "booked",
    user: "Budi Santoso",
    payment: "Transfer",
    durationInfo: "1 Jam",
  },
];

// --- 2. HELPER FUNCTIONS ---
function getFutureDate(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return {
    full: date.toISOString().split("T")[0],
    displayDay: days[date.getDay()],
    displayDate: date.getDate(),
    displayMonth: months[date.getMonth()],
  };
}

function addHours(timeStr, hoursToAdd) {
  const [h, m] = timeStr.split(":").map(Number);
  let newH = h + hoursToAdd;
  if (newH < 10) newH = "0" + newH;
  return `${newH}:00`;
}

function saveToStorage() {
  localStorage.setItem("badminton_bookings_final_v3", JSON.stringify(bookings));
}

function formatRupiah(num) {
  return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const el = document.createElement("div");
  const bgClass =
    type === "error"
      ? "bg-red-600/90 border-red-500"
      : type === "success"
      ? "bg-emerald-600/90 border-emerald-500"
      : "bg-slate-700/90 border-slate-600";

  el.className = `${bgClass} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0 min-w-[300px] backdrop-blur-md z-50 border border-white/10`;
  el.innerHTML = `
        <span class="text-lg font-bold">${
          type === "success" ? "✓" : type === "error" ? "!" : "ⓘ"
        }</span>
        <p class="font-bold text-sm">${message}</p>
    `;

  container.appendChild(el);
  requestAnimationFrame(() =>
    el.classList.remove("translate-y-10", "opacity-0")
  );
  setTimeout(() => {
    el.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// --- 3. NAVIGASI ---
function navTo(viewId) {
  const path = window.location.pathname;

  if (viewId === "view-landing" || viewId === "view-schedule-public") {
    if (!path.includes("index.html") && path !== "/" && !path.endsWith("/")) {
      window.location.href = "index.html";
      return;
    }
  } else if (viewId === "view-auth") {
    if (!path.includes("login.html")) {
      window.location.href = "login.html";
      return;
    }
  } else if (
    [
      "view-dashboard",
      "view-booking-date",
      "view-payment",
      "view-success",
    ].includes(viewId)
  ) {
    if (!path.includes("dashboard.html")) {
      sessionStorage.setItem("lastView", viewId);
      window.location.href = "dashboard.html";
      return;
    }
  } else if (viewId === "view-admin") {
    if (!path.includes("admin.html")) {
      window.location.href = "admin.html";
      return;
    }
  }

  document.querySelectorAll(".page-section").forEach((el) => {
    el.classList.remove("active");
    el.classList.add("hidden");
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
  }

  if (viewId === "view-booking-date") renderDateSelector();
  if (viewId === "view-schedule-public") renderPublic();
  if (viewId === "view-admin") renderAdminDashboard();
  if (viewId === "view-dashboard") renderHistory();
  if (viewId === "view-profile") loadProfile();
}

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>`;
  } else {
    input.type = "password";
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
  }
}

// --- 4. OTENTIKASI & PROFIL ---
function loadProfile() {
  const users = JSON.parse(localStorage.getItem("gorjuara_users")) || [];
  const user = users.find(u => u.username === currentUser);
  if (user) {
    document.getElementById("prof-username").value = user.username;
    document.getElementById("prof-phone").value = user.phone || "";
    document.getElementById("prof-password").value = "";
    document.getElementById("prof-password-confirm").value = "";
  }
}

function updateProfile(e) {
  e.preventDefault();
  const phone = document.getElementById("prof-phone").value;
  const pass = document.getElementById("prof-password").value;
  const passConfirm = document.getElementById("prof-password-confirm").value;

  if (pass || passConfirm) {
    if (pass !== passConfirm) return showToast("Konfirmasi password tidak cocok!", "error");
  }

  let users = JSON.parse(localStorage.getItem("gorjuara_users")) || [];
  const userIndex = users.findIndex(u => u.username === currentUser);
  if (userIndex !== -1) {
    users[userIndex].phone = phone;
    if (pass) users[userIndex].pass = pass;
    localStorage.setItem("gorjuara_users", JSON.stringify(users));
    showToast("Profil berhasil diperbarui!", "success");
    setTimeout(() => navTo('view-dashboard'), 1500);
  }
}

function handleLogin() {
  const u = document.getElementById("username").value;
  if (!u) return showToast("Username tidak boleh kosong!", "error");

  sessionStorage.setItem("currentUser", u);
  currentUser = u;

  if (u.toLowerCase() === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
}

function logout() {
  const modal = document.getElementById("logout-modal");
  if (modal) {
    modal.classList.remove("hidden");
    const content = modal.querySelector('div[class*="transform"]');

    setTimeout(() => {
      content.classList.remove("scale-95", "opacity-0");
      content.classList.add("scale-100", "opacity-100");
    }, 10);
  } else {
    if (confirm("Yakin ingin keluar?")) {
      sessionStorage.clear();
      window.location.href = "index.html";
    }
  }
}

function confirmLogout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

function closeLogoutModal() {
  const modal = document.getElementById("logout-modal");
  if (!modal) return;
  const content = modal.querySelector('div[class*="transform"]');

  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
}

// --- 5. LOGIKA MEMBER ---
function renderDateSelector() {
  const container = document.getElementById("date-scroll-container");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const d = getFutureDate(i);
    const isActive = d.full === selectedDate;

    const btn = document.createElement("div");

    btn.className = `flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border ${
      isActive
        ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-black/20"
        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white"
    }`;

    btn.innerHTML = `
        <span class="text-[10px] font-bold uppercase tracking-wider mb-1">${d.displayDay.substr(
          0,
          3
        )}</span>
        <span class="text-2xl font-black leading-none mb-1">${
          d.displayDate
        }</span>
        <span class="text-[9px] font-medium opacity-80">${d.displayMonth}</span>
    `;

    btn.onclick = () => {
      selectedDate = d.full;
      renderDateSelector();
      renderSlots();
    };
    container.appendChild(btn);
  }
  renderSlots();
}

function renderSlots() {
  const area = document.getElementById("slots-area");
  if (!area) return;
  area.innerHTML = "";
  
  const holiday = holidays.find(h => h.date === selectedDate);
  if (holiday) {
      area.innerHTML = `<div class="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center">
          <div class="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-xl font-black text-white mb-2">GOR TUTUP</h3>
          <p class="text-red-300/80 font-medium">Libur: ${holiday.reason}</p>
      </div>`;
      return;
  }

  area.className = "flex flex-col gap-4";

  const now = new Date();
  const currentHour = now.getHours();
  const isToday = selectedDate === now.toISOString().split("T")[0];

  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "19:00",
    "20:00",
    "21:00",
  ];

  times.forEach((time) => {
    const row = document.createElement("div");
    row.className =
      "group relative bg-white/5 p-4 md:p-5 rounded-[1.5rem] border border-white/5 shadow-lg flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center hover:border-white/20 transition-all";

    row.innerHTML = `
        <div class="flex flex-row md:flex-col items-center gap-3 md:w-24 md:border-r md:border-white/10 md:pr-6 w-full pb-3 md:pb-0 border-b md:border-b-0 border-white/10">
            <div class="bg-primary-900 text-primary-300 p-2 rounded-xl border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span class="text-xl font-black text-white tracking-tight">${time}</span>
        </div>
    `;

    const courtsContainer = document.createElement("div");
    courtsContainer.className = "flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full";

    const slotHour = parseInt(time.split(":")[0]);

    courts.forEach((court) => {
      const booking = bookings.find(
        (b) =>
          b.date === selectedDate &&
          b.time === time &&
          b.court === court &&
          b.status !== "rejected"
      );
      const status = booking ? booking.status : "available";

      const btn = document.createElement("button");
      const courtIcon = `<svg class="w-6 h-6 mb-1 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>`;

      let baseClass =
        "relative overflow-hidden rounded-2xl py-3 px-2 flex flex-col items-center justify-center transition-all duration-300 border h-24 group/btn w-full";

      if (isToday && slotHour <= currentHour) {
        btn.className = `${baseClass} bg-white/5 border-white/5 text-white/10 cursor-not-allowed grayscale`;
        btn.innerHTML = `${courtIcon}<span class="text-xs font-bold opacity-50">Lewat</span>`;
      } else if (status === "available") {
        btn.className = `${baseClass} bg-white/5 border-white/10 text-primary-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer`;
        btn.innerHTML = `
                <div class="text-emerald-500 group-hover/btn:text-white transition-colors duration-300">${courtIcon}</div>
                <span class="text-xs font-bold">${court.replace(
                  "Lapangan ",
                  "Court "
                )}</span>
                <span class="text-[9px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors">Rp 50rb</span>
            `;
        btn.onclick = () => confirmSlot(time, court);
      } else if (status === "maintenance") {
        btn.className = `${baseClass} bg-black/40 border-white/5 text-white/20 cursor-not-allowed`;
        btn.innerHTML = `
                <svg class="w-5 h-5 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="text-xs font-bold line-through opacity-70">${court}</span>
                <span class="text-[9px] font-bold mt-1">MTC</span>
            `;
      } else {
        btn.className = `${baseClass} bg-red-900/10 border-red-500/10 text-red-300/50 cursor-not-allowed`;
        btn.innerHTML = `
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <svg class="w-8 h-8 text-white/20 -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                ${courtIcon}
                <span class="text-xs font-bold">${court}</span>
                <span class="text-[9px] font-bold mt-1">Booked</span>
            `;
      }
      courtsContainer.appendChild(btn);
    });

    row.appendChild(courtsContainer);
    area.appendChild(row);
  });
}

function confirmSlot(time, court) {
  selectedTime = time;
  selectedCourt = court;

  const durSelect = document.getElementById("duration-select");
  if (durSelect) durSelect.value = "1";

  const dateDisplay = document.getElementById("pay-date-display");
  const timeDisplay = document.getElementById("pay-time-display");

  if (dateDisplay) dateDisplay.innerText = selectedDate;
  if (timeDisplay) {
    timeDisplay.innerHTML = `${selectedTime} <span class="text-lg font-medium opacity-70 block md:inline text-primary-300">@ ${selectedCourt}</span>`;
  }

  updateDurationPrice();
  navTo("view-payment");
}

function updateDurationPrice() {
  const durSelect = document.getElementById("duration-select");
  const duration = parseInt(durSelect.value);

  for (let i = 1; i < duration; i++) {
    let nextTime = addHours(selectedTime, i);
    let clash = bookings.find(
      (b) =>
        b.date === selectedDate &&
        b.time === nextTime &&
        b.court === selectedCourt &&
        b.status !== "rejected"
    );

    if (clash) {
      showToast(
        `Maaf, slot jam ${nextTime} sudah terisi. Durasi otomatis dikurangi.`, "error"
      );
      durSelect.value = i;
      updateDurationPrice();
      return;
    }
  }

  const courtObj = courtsData.find(c => c.name === selectedCourt);
  const currentPrice = courtObj ? courtObj.price : pricePerHour;
  const total = duration * currentPrice;
  const priceDisplay = document.getElementById("total-price-display");
  if (priceDisplay) priceDisplay.innerText = formatRupiah(total);
}

function previewFile() {
  const fileInput = document.getElementById("proof-file");
  const label = document.getElementById("file-label");
  if (fileInput && fileInput.files[0]) {
    label.innerText = "File: " + fileInput.files[0].name;
    label.classList.add("text-accent-400");
  }
}

function handlePayment(e) {
  e.preventDefault();

  const fileInput = document.getElementById("proof-file");
  const durSelect = document.getElementById("duration-select");
  const duration = parseInt(durSelect?.value) || 1;
  const btn = document.querySelector('button[type="submit"]');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast("Harap upload bukti pembayaran terlebih dahulu!", "error");
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...`;
  btn.disabled = true;
  btn.classList.add("opacity-70", "cursor-not-allowed");
  setTimeout(() => {
    const fileName = fileInput.files[0].name;
    const baseId = Date.now();
    const groupId = baseId;
    for (let i = 0; i < duration; i++) {
      let bookingTime = addHours(selectedTime, i);
      bookings.push({
        id: baseId + i,
        groupId: groupId,
        date: selectedDate,
        time: bookingTime,
        court: selectedCourt,
        status: "pending",
        user: currentUser,
        proof: fileName,
        durationInfo: `${duration} Jam`,
      });
    }
    saveToStorage();

    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.classList.remove("opacity-70", "cursor-not-allowed");

    if (fileInput) fileInput.value = "";
    if (durSelect) durSelect.value = "1";
    const label = document.getElementById("file-label");
    if (label) {
      label.innerText = "Klik untuk pilih file foto";
      label.classList.remove("text-accent-400");
    }

    navTo("view-success");
  }, 1500);
}

function renderHistory() {
  const container = document.getElementById("member-history");
  if (!container) return;

  const list = bookings
    .filter((b) => b.user === currentUser)
    .sort((a, b) => b.id - a.id);

  if (list.length === 0) {
    container.innerHTML = `
        <div class="py-12 w-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner border border-white/5">🏸</div>
            <p class="text-base font-bold text-white">Belum ada tiket.</p>
            <p class="text-xs text-white/50 mt-1 mb-6">Jadwal lapangan masih banyak yang kosong.</p>
            <button onclick="navTo('view-booking-date')" class="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20">Booking Sekarang</button>
        </div>`;
    return;
  }

  container.innerHTML = list
    .map((b) => {
      let statusColor =
        b.status === "booked"
          ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
          : b.status === "pending"
          ? "bg-accent-500 shadow-[0_0_8px_#f59e0b]"
          : "bg-red-500";
      let statusText =
        b.status === "booked"
          ? "LUNAS"
          : b.status === "pending"
          ? "PROSES"
          : "GAGAL";
      let statusTextColor =
        b.status === "booked"
          ? "text-emerald-400"
          : b.status === "pending"
          ? "text-accent-400"
          : "text-red-400";

      return `
      <div class="relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 transition-all group cursor-default shadow-sm hover:shadow-md">
         <div class="flex justify-between items-start mb-3">
            <div>
                <h4 class="text-sm font-black text-white tracking-wide">${
                  b.date
                }</h4>
                <p class="text-xs text-white/50 font-bold mt-0.5">${
                  b.time
                } WIB</p>
            </div>
            <div class="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                <span class="w-1.5 h-1.5 rounded-full ${statusColor}"></span>
                <span class="text-[9px] font-black ${statusTextColor} uppercase tracking-wider">${statusText}</span>
            </div>
         </div>
         
         <div class="flex items-center justify-between pt-3 border-t border-white/5">
             <div class="flex items-center gap-2">
                 <div class="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-500/20">L${b.court.slice(
                   -1
                 )}</div>
                 <span class="text-xs text-white/40 font-medium">${
                   b.court
                 }</span>
             </div>
             ${
               b.status === "booked"
                 ? '<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
                 : ""
             }
         </div>
      </div>`;
    })
    .join("");
}

// --- 6. ADMIN ---
function setAdminTab(tabName) {
  currentAdminTab = tabName;
  ["pending", "schedule", "history", "register"].forEach((t) => {
    const btn = document.getElementById(`btn-${t}`);
    const content = document.getElementById(`admin-content-${t}`);

    btn.className =
      "w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border group";

    if (t === tabName) {
      btn.classList.add(
        "bg-white/10",
        "border-white/20",
        "text-white",
        "shadow-lg",
        "backdrop-blur-sm"
      );
      content.classList.remove("hidden");
    } else {
      btn.classList.add(
        "border-transparent",
        "text-primary-300",
        "hover:bg-white/5",
        "hover:border-white/5",
        "text-primary-200", "hover:text-white"
      );
      content.classList.add("hidden");
    }
  });
  renderAdminDashboard();
}

function adminRegisterMember(e) {
  e.preventDefault();
  const username = document.getElementById("reg-username").value;
  const phone = document.getElementById("reg-phone").value;
  const pass = document.getElementById("reg-password").value;
  const passConfirm = document.getElementById("reg-password-confirm").value;
  
  if(!username || !phone || !pass || !passConfirm) return showToast("Semua field harus diisi", "error");
  if(pass !== passConfirm) return showToast("Password tidak sama!", "error");
  
  let registered = JSON.parse(localStorage.getItem("gorjuara_users")) || [];
  if (registered.some(u => u.username === username)) {
      return showToast("Username sudah digunakan", "error");
  }
  
  registered.push({ username, phone, pass });
  localStorage.setItem("gorjuara_users", JSON.stringify(registered));
  
  showToast(`Member ${username} berhasil didaftarkan!`, "success");
  document.getElementById("form-register-member").reset();
}

function renderAdminDashboard() {
  const pending = bookings.filter((b) => b.status === "pending" || b.status === "cancel-pending");
  const booked = bookings.filter((b) => b.status === "booked");

  const elIncome = document.getElementById("admin-income");
  const elTotal = document.getElementById("admin-total-booking");
  const elPendingBig = document.getElementById("admin-pending-count-big");
  const elBadge = document.getElementById("badge-count");

  if (elIncome) elIncome.innerText = formatRupiah(booked.reduce((sum, b) => sum + (b.total || (courtsData.find(c=>c.name===b.court)?.price || 50000)), 0));
  if (elTotal) elTotal.innerText = booked.length;
  if (elPendingBig) elPendingBig.innerText = pending.length;

  if (elBadge) {
    if (pending.length > 0) {
      elBadge.classList.remove("hidden");
      elBadge.classList.add("flex");
      elBadge.innerText = pending.length;
    } else {
      elBadge.classList.add("hidden");
      elBadge.classList.remove("flex");
    }
  }

  if (currentAdminTab === "pending") renderAdminPending(pending);
  if (currentAdminTab === "schedule") renderAdminSchedule();
  if (currentAdminTab === "history") renderAdminHistory();
  if (currentAdminTab === "courts") renderAdminCourts();
  if (currentAdminTab === "holidays") renderAdminHolidays();
}

function renderAdminPending(pendingList) {
  const container = document.getElementById("admin-content-pending");
  if (!container) return;

  if (pendingList.length === 0) {
    container.innerHTML = `<div class="bg-white/5 p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center"><p class="text-primary-300 font-bold text-lg">Semua aman! Tidak ada verifikasi tertunda.</p></div>`;
    return;
  }

  container.innerHTML = pendingList
    .map(
      (b) => `
        <div class="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/10 transition">
            <div class="flex items-center gap-5 w-full">
                <div class="w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center font-black text-primary-400 text-2xl">${b.user.charAt(
                  0
                )}</div>
                <div>
                    <h4 class="font-black text-white text-lg">${b.user}</h4>
                    <p class="text-sm font-bold text-primary-300">
                      ${b.date} • <span class="text-accent-400">${
        b.time
      }</span> • ${b.court}
                    </p>
                    ${
                      b.proof
                        ? `<p class="text-xs text-white/40 mt-1">File: ${b.proof}</p>`
                        : ""
                    }
                    ${
                      b.durationInfo
                        ? `<span class="bg-primary-500/20 text-primary-200 text-[10px] px-2 py-0.5 rounded font-bold border border-primary-500/30">${b.durationInfo}</span>`
                        : ""
                    }
                </div>
            </div>
            <div class="flex gap-3 w-full md:w-auto">
                <button onclick="updateStatus(${
                  b.id
                }, 'booked')" class="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition">Terima</button>
                <button onclick="updateStatus(${
                  b.id
                }, 'rejected')" class="flex-1 md:flex-none px-8 py-3 bg-transparent border border-white/20 text-white/50 rounded-xl font-bold hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition">Tolak</button>
            </div>
        </div>`
    )
    .join("");
}

function renderAdminSchedule() {
  const scrollContainer = document.getElementById("admin-date-scroll");
  if (!scrollContainer) return;

  scrollContainer.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = getFutureDate(i);
    const isActive = d.full === selectedDate;

    const btn = document.createElement("button");
    btn.className = `flex-shrink-0 px-5 py-3 rounded-2xl border text-sm font-bold transition snap-start ${
      isActive
        ? "bg-white text-primary-900 border-white"
        : "bg-transparent text-primary-300 border-white/10 hover:border-white/30 hover:text-white"
    }`;
    btn.innerText = `${d.displayDay}, ${d.displayDate}`;
    btn.onclick = () => {
      selectedDate = d.full;
      renderAdminSchedule();
    };

    scrollContainer.appendChild(btn);
  }

  const grid = document.getElementById("admin-slots-grid");
  grid.className = "flex flex-col gap-4";
  grid.innerHTML = "";
  
  const holiday = holidays.find(h => h.date === selectedDate);
  if (holiday) {
      grid.innerHTML = `<div class="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center">
          <h3 class="text-xl font-black text-white mb-2">GOR TUTUP</h3>
          <p class="text-red-300/80 font-medium">Libur: ${holiday.reason}</p>
      </div>`;
      return;
  }


  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "19:00",
    "20:00",
    "21:00",
  ];

  times.forEach((time) => {
    const row = document.createElement("div");
    row.className =
      "flex flex-col md:flex-row gap-4 items-center border-b border-white/5 pb-4 last:border-0";

    const timeLabel = document.createElement("div");
    timeLabel.className = "w-16 font-black text-white text-lg";
    timeLabel.innerText = time;
    row.appendChild(timeLabel);

    const courtsContainer = document.createElement("div");
    courtsContainer.className = "flex-1 grid grid-cols-3 gap-3 w-full";

    courts.forEach((court) => {
      const booking = bookings.find(
        (b) =>
          b.date === selectedDate &&
          b.time === time &&
          b.court === court &&
          b.status !== "rejected"
      );

      const card = document.createElement("div");
      card.className =
        "p-3 rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer border min-h-[80px]";

      if (!booking) {
        card.className +=
          " border-dashed border-white/10 hover:border-accent-500/50 hover:bg-white/5 group bg-transparent";
        card.innerHTML = `<span class="text-xs font-bold text-white/30 group-hover:text-accent-400">${court}</span><span class="text-[10px] text-white/20 uppercase group-hover:text-white/60">Buka</span>`;
        card.onclick = () => toggleMaintenance(time, "add", null, court);
      } else if (booking.status === "maintenance") {
        card.className +=
          " bg-red-900/40 border-red-500/20 text-white shadow-lg";
        card.innerHTML = `<span class="text-xs font-bold text-red-200">${court}</span><span class="text-[10px] opacity-60 uppercase text-red-300">Tutup</span>`;
        card.onclick = () =>
          toggleMaintenance(time, "remove", booking.id, court);
      } else {
        card.className +=
          " bg-emerald-900/20 border-emerald-500/20 cursor-not-allowed opacity-60";
        card.innerHTML = `<span class="text-xs font-black text-emerald-400/50 line-through">${court}</span><span class="text-[10px] font-bold text-emerald-300/50 uppercase">Booked</span>`;
      }
      courtsContainer.appendChild(card);
    });

    row.appendChild(courtsContainer);
    grid.appendChild(row);
  });
}

function renderAdminHistory() {
  const list = document.getElementById("admin-history-list");
  if (!list) return;

  const history = bookings
    .filter((b) => b.status !== "maintenance")
    .sort((a, b) => b.id - a.id);

  list.innerHTML = history
    .map(
      (b, index) => `
        <tr class="transition border-b border-white/5 last:border-0 ${
          index % 2 === 0 ? "bg-transparent" : "bg-white/5"
        } hover:bg-white/10">
            <td class="p-5"><div class="font-black text-white text-sm">${
              b.date
            }</div><div class="text-xs font-bold text-primary-300 uppercase mt-1">${
        b.time
      } WIB • <span class="text-white/60">${b.court || "-"}</span></div></td>
            <td class="p-5 font-bold text-primary-200 text-sm">${b.user}</td>
            <td class="p-5"><span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
              b.status === "booked"
                ? "bg-emerald-500/20 text-emerald-400"
                : b.status === "rejected"
                ? "bg-red-500/20 text-red-400"
                : "bg-amber-500/20 text-amber-400"
            }">${b.status}</span></td>
            <td class="p-5 text-right">
                ${
                  b.status === "booked"
                    ? `<button onclick="updateStatus(${b.id}, 'rejected')" class="text-[10px] text-red-300 font-bold hover:bg-red-500/20 px-3 py-1.5 rounded transition border border-red-500/20">Batalkan</button>`
                    : "-"
                }
            </td>
        </tr>`
    )
    .join("");
}

function toggleMaintenance(time, action, id = null, court = null) {
  if (action === "add") {
    if (!court) return;
    bookings.push({
      id: Date.now(),
      date: selectedDate,
      time: time,
      court: court,
      status: "maintenance",
      user: "System",
    });
    showToast(`${court} jam ${time} ditutup.`);
  } else {
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx > -1) bookings.splice(idx, 1);
    showToast(`Slot dibuka kembali.`);
  }
  saveToStorage();
  renderAdminSchedule();
}

function updateStatus(idOrGroupId, newStatus) {
  // If idOrGroupId is string and looks like timestamp (length > 10) it might be groupId
  // We just update ALL bookings that have this groupId or id
  let updatedCount = 0;
  bookings.forEach(b => {
    if (b.id == idOrGroupId || b.groupId == idOrGroupId) {
      b.status = newStatus;
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    saveToStorage();
    renderAdminDashboard();
    // if we're on member view, render History too
    if (currentAdminTab === "") renderHistory();
    showToast(`Status diperbarui.`);
  }
}

// --- 7. PUBLIC PAGE ---
function renderPublic() {
  const container = document.getElementById("public-list");
  if (!container) return;
  container.innerHTML = "";

  [getFutureDate(0).full, getFutureDate(1).full].forEach((d) => {
    let slotsHTML = "";
    const times = ["08:00", "10:00", "13:00", "16:00", "19:00", "20:00"];

    times.forEach((time) => {
      let courtsInfo = "";
      courts.forEach((court) => {
        const isBooked = bookings.some(
          (b) =>
            b.date === d &&
            b.time === time &&
            b.court === court &&
            b.status !== "rejected"
        );
        if (isBooked) {
          courtsInfo += `<div class="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md flex-1 text-center cursor-not-allowed opacity-50">${court.replace("Lapangan ", "L")}</div>`;
        } else {
          courtsInfo += `<button onclick="guestBook('${d}', '${time}', '${court}')" class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded-md flex-1 text-center hover:bg-emerald-500 hover:text-white transition cursor-pointer shadow-sm shadow-emerald-500/10">${court.replace("Lapangan ", "L")}</button>`;
        }
      });

      slotsHTML += `
            <div class="flex items-center gap-3 border-b border-white/10 pb-3 last:border-0">
                <span class="text-white font-bold w-12 text-sm">${time}</span>
                <div class="flex gap-2 flex-1">${courtsInfo}</div>
            </div>
        `;
    });

    const card = document.createElement("div");
    card.className =
      "bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white/10 flex flex-col";
    card.innerHTML = `
        <h4 class="font-black text-2xl mb-6 text-white tracking-tight">${d}</h4>
        <div class="space-y-3">${slotsHTML}</div>
    `;
    container.appendChild(card);
  });
}

// --- 7B. GUEST BOOKING ---
let guestBookingData = null;
function guestBook(date, time, court) {
    guestBookingData = { date, time, court };
    const labelDate = document.getElementById("guest-pay-date");
    const labelTime = document.getElementById("guest-pay-time");
    if(labelDate) labelDate.innerText = date;
    if(labelTime) labelTime.innerHTML = `${time} <span class="font-medium opacity-70">@ ${court}</span>`;
    
    const durSelect = document.getElementById("guest-duration");
    if(durSelect) durSelect.value = "1";
    updateGuestDuration();
    
    navTo('view-guest-form');
}

function updateGuestDuration() {
    const durSelect = document.getElementById("guest-duration");
    if(!durSelect) return;
    const duration = parseInt(durSelect.value);
    
    for (let i = 1; i < duration; i++) {
        let nextTime = addHours(guestBookingData.time, i);
        let clash = bookings.find(
            (b) =>
                b.date === guestBookingData.date &&
                b.time === nextTime &&
                b.court === guestBookingData.court &&
                b.status !== "rejected"
        );
        
        if (clash) {
            showToast(`Maaf, slot jam ${nextTime} sudah terisi. Durasi otomatis dikurangi.`, "error");
            durSelect.value = i;
            break;
        }
    }
    
    const finalDuration = parseInt(durSelect.value);
    const courtObj = courtsData.find(c => c.name === guestBookingData.court);
    const currentPrice = courtObj ? courtObj.price : 50000;
    const priceDisplay = document.getElementById("guest-pay-price");
    if(priceDisplay) priceDisplay.innerText = formatRupiah(finalDuration * currentPrice);
}

function submitGuestBooking(e) {
    e.preventDefault();
    const name = document.getElementById("guest-name").value;
    const phone = document.getElementById("guest-phone").value;
    
    if(!name || !phone) return showToast("Harap isi nama dan No. WhatsApp", "error");
    
    const durSelect = document.getElementById("guest-duration");
    const duration = durSelect ? parseInt(durSelect.value) : 1;
    const courtObj = courtsData.find(c => c.name === guestBookingData.court);
    const currentPrice = courtObj ? courtObj.price : 50000;
    const total = duration * currentPrice;
    
    const baseId = bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;
    const groupId = Date.now();
    for(let i=0; i<duration; i++) {
        let bookingTime = addHours(guestBookingData.time, i);
        bookings.push({
            id: baseId + i,
            groupId: groupId,
            user: name,
            member: name + " (Guest)",
            date: guestBookingData.date,
            time: bookingTime,
            court: guestBookingData.court,
            duration: 1,
            total: total / duration, // total per jam
            status: "pending",
            proof: "Bayar di Tempat",
            durationInfo: `${duration} Jam`
        });
    }
    
    saveToStorage();
    
    const btn = document.getElementById("guest-btn-pay");
    btn.innerHTML = `Mengecek slot...`;
    btn.disabled = true;
    
    setTimeout(() => {
        showToast("Booking Berhasil! Silakan datang ke lapangan dan tunjukkan pesan WhatsApp atau nama Anda.", "success");
        btn.innerHTML = `Booking Sekarang`;
        btn.disabled = false;
        document.getElementById("guest-form").reset();
        navTo('view-landing');
        renderPublic(); // Refresh schedule
    }, 1500);
}

// --- 8. INITIALIZATION ---
window.onload = function () {
  const path = window.location.pathname;

  const hDate = document.getElementById("header-date");
  if (hDate)
    hDate.innerText = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (path.includes("dashboard.html")) {
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }
    const lastView = sessionStorage.getItem("lastView") || "view-dashboard";
    navTo(lastView);
  } else if (path.includes("admin.html")) {
    setAdminTab("pending");
  } else if (path.includes("login.html")) {
    navTo("view-auth");
  } else {
    navTo("view-landing");
  }
};


function renderAdminCourts() {
    const list = document.getElementById("admin-courts-list");
    if (!list) return;
    
    list.innerHTML = courtsData.map((c, idx) => `
        <div class="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div class="flex justify-between items-center">
                <h5 class="font-bold text-white">${c.name}</h5>
                <button onclick="deleteCourt(${idx})" class="text-red-400 hover:text-red-300"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
            <div>
                <label class="text-[10px] uppercase font-bold text-white/50 block mb-1">Harga/Jam</label>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-white/40">Rp</span>
                    <input type="number" value="${c.price}" onchange="updateCourtPrice(${idx}, this.value)" class="w-full bg-transparent border-b border-white/20 text-white outline-none focus:border-emerald-500 py-1">
                </div>
            </div>
        </div>
    `).join("");
}

function addNewCourt() {
    const name = document.getElementById("new-court-name").value;
    const price = document.getElementById("new-court-price").value;
    if (!name || !price) return showToast("Isi nama dan harga!", "error");
    
    courtsData.push({ name, price: parseInt(price) });
    saveCourts();
    document.getElementById("modal-add-court").classList.add("hidden");
    document.getElementById("new-court-name").value = "";
    document.getElementById("new-court-price").value = "";
    showToast("Lapangan berhasil ditambahkan!", "success");
    renderAdminCourts();
}

function updateCourtPrice(idx, newPrice) {
    if (newPrice) courtsData[idx].price = parseInt(newPrice);
    saveCourts();
    showToast("Harga diperbarui!", "success");
}

function deleteCourt(idx) {
    courtsData.splice(idx, 1);
    saveCourts();
    showToast("Lapangan dihapus!", "success");
    renderAdminCourts();
}

function renderAdminHolidays() {
    const list = document.getElementById("admin-holidays-list");
    if (!list) return;
    
    if (holidays.length === 0) {
        list.innerHTML = `<div class="text-sm text-white/50 italic p-4 bg-black/10 rounded-xl">Belum ada jadwal libur.</div>`;
        return;
    }
    
    list.innerHTML = holidays.map((h, idx) => `
        <div class="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
            <div>
                <div class="font-bold text-white">${h.date}</div>
                <div class="text-xs text-red-300">${h.reason}</div>
            </div>
            <button onclick="deleteHoliday(${idx})" class="text-red-400 hover:text-red-300 text-xs bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">Hapus</button>
        </div>
    `).join("");
}

function addHoliday() {
    const date = document.getElementById("holiday-date").value;
    const reason = document.getElementById("holiday-reason").value;
    if (!date || !reason) return showToast("Isi tanggal dan keterangan!", "error");
    
    holidays.push({ date, reason });
    saveHolidays();
    document.getElementById("holiday-date").value = "";
    document.getElementById("holiday-reason").value = "";
    showToast("Jadwal libur ditambahkan!", "success");
    renderAdminHolidays();
}

function deleteHoliday(idx) {
    holidays.splice(idx, 1);
    saveHolidays();
    showToast("Jadwal libur dihapus!", "success");
    renderAdminHolidays();
}
