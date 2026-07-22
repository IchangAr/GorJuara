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
