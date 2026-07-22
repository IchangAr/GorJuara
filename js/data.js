
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
    bookings.forEach(b => {
        if (b.id == groupId || b.groupId == groupId) {
            b.status = 'cancel-pending';
        }
    });
    saveToStorage();
}

function deleteBookingByGroup(groupId) {
    for (let i = bookings.length - 1; i >= 0; i--) {
        if (bookings[i].id == groupId || bookings[i].groupId == groupId) {
            bookings.splice(i, 1);
        }
    }
    saveToStorage();
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
let courtsData = JSON.parse(localStorage.getItem("gorjuara_courts")) || [
  { name: "Lapangan 1", price: 50000 },
  { name: "Lapangan 2", price: 50000 },
  { name: "Lapangan 3", price: 50000 }
];
let courts = courtsData.map(c => c.name);
const pricePerHour = 50000; // default for backward compat

function saveCourts() {
    localStorage.setItem("gorjuara_courts", JSON.stringify(courtsData));
    courts = courtsData.map(c => c.name);
}

let holidays = JSON.parse(localStorage.getItem("gorjuara_holidays")) || [];
function saveHolidays() {
    localStorage.setItem("gorjuara_holidays", JSON.stringify(holidays));
}

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

function formatRupiahText(val) {
  // Strip dots, keep only digits
  const num = val.replace(/\./g, "").replace(/\D/g, "");
  if (!num) return "";
  return parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
