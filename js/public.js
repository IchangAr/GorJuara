// --- 7. PUBLIC PAGE ---
function renderPublic() {
  const container = document.getElementById("public-list");
  if (!container) return;
  container.innerHTML = "";

  [getFutureDate(0).full, getFutureDate(1).full].forEach((d) => {
    let slotsHTML = "";
    
    const holiday = holidays.find(h => h.date === d);
    if (holiday) {
      slotsHTML = `<div class="bg-red-500/10 border border-red-500/20 p-6 rounded-[1.5rem] text-center my-8">
          <h3 class="text-lg font-black text-white mb-1">GOR TUTUP</h3>
          <p class="text-red-300/80 font-medium text-sm">Libur: ${holiday.reason}</p>
      </div>`;
    } else {
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
    }

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
