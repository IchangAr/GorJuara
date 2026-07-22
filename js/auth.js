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
