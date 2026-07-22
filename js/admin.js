// --- 6. ADMIN ---
function setAdminTab(tabName) {
  currentAdminTab = tabName;
  ["pending", "schedule", "history", "register", "courts", "holidays"].forEach((t) => {
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

  const groupedPending = groupBookings(pendingList);
  
  container.innerHTML = groupedPending
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
                    ${
                      b.status === "cancel-pending"
                        ? `<span class="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/30 ml-2">(Minta Batal)</span>`
                        : ""
                    }
                </div>
            </div>
            <div class="flex gap-3 w-full md:w-auto">
                ${
                  b.status === "cancel-pending"
                    ? `<button onclick="updateStatus(${b.groupId || b.id}, 'rejected')" class="flex-1 md:flex-none px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 shadow-lg shadow-red-600/20 transition text-sm">Setujui Batal</button>
                       <button onclick="updateStatus(${b.groupId || b.id}, 'booked')" class="flex-1 md:flex-none px-8 py-3 bg-transparent border border-white/20 text-white/50 rounded-xl font-bold hover:bg-white/5 transition text-sm">Tolak Batal</button>`
                    : `<button onclick="updateStatus(${b.groupId || b.id}, 'booked')" class="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition">Terima</button>
                       <button onclick="updateStatus(${b.groupId || b.id}, 'rejected')" class="flex-1 md:flex-none px-8 py-3 bg-transparent border border-white/20 text-white/50 rounded-xl font-bold hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition">Tolak</button>`
                }
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

  const groupedHistory = groupBookings(history);

  list.innerHTML = groupedHistory
    .map(
      (b, index) => `
        <tr class="transition border-b border-white/5 last:border-0 ${
          index % 2 === 0 ? "bg-transparent" : "bg-white/5"
        } hover:bg-white/10">
            <td class="p-5">
              <div class="font-black text-white text-sm">${b.date}</div>
              <div class="text-xs font-bold text-primary-300 uppercase mt-1">
                ${b.time} WIB • <span class="text-white/60">${b.court || "-"}</span>
                ${b.durationInfo ? `<span class="bg-primary-500/20 text-primary-200 text-[10px] px-1.5 py-0.5 rounded font-bold border border-primary-500/30 ml-1">${b.durationInfo}</span>` : ""}
              </div>
            </td>
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
                    ? `<button onclick="updateStatus(${b.groupId || b.id}, 'rejected')" class="text-[10px] text-red-300 font-bold hover:bg-red-500/20 px-3 py-1.5 rounded transition border border-red-500/20">Batalkan</button>`
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