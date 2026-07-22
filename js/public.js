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




