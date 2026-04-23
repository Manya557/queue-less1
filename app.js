// =======================
// 🔥 FIREBASE IMPORTS
// =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================
// 🔑 FIREBASE CONFIG
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyDSSEZJeTySbbpydfibsXYqa6KYqG9z-cM",
  authDomain: "queue-less-cbf4d.firebaseapp.com",
  projectId: "queue-less-cbf4d",
  storageBucket: "queue-less-cbf4d.firebasestorage.app",
  messagingSenderId: "421176880226",
  appId: "1:421176880226:web:80770db1813702b376f53b"
};

// =======================
// 🚀 INIT
// =======================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =======================
// 🛒 CART
// =======================
let cart = [];


// =======================
// 🔐 AUTH FUNCTIONS
// =======================

window.register = async function () {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert("Registered successfully!");
  } catch (e) {
    alert(e.message);
  }
};

window.login = async function () {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Login successful!");
    window.location.href = "user-dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

// ADMIN LOGIN
window.adminLogin = async function () {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);

    // ✅ Only allow specific admin
    if (email === "admin@gmail.com") {
      localStorage.setItem("admin", "true"); // session
      window.location.href = "admin-dashboard.html";
    } else {
      alert("Access denied. Not an admin.");
    }

  } catch (e) {
    alert("Login failed: " + e.message);
  }
};

// =======================
// ➕ ADD TO CART
// =======================
window.addToCart = function(item, price, category) {
  console.log("Adding:", item);

  cart.push({ item, price, category });

  let list = document.getElementById("cart");
  if (!list) return;

  let li = document.createElement("li");
  li.innerText = `${item} - ₹${price}`;
  list.appendChild(li);
};


// =======================
// 📦 PLACE ORDER
// =======================
window.placeOrder = async function () {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  try {
    for (let c of cart) {
      await addDoc(collection(db, "orders"), {
        item: c.item,
        price: c.price,
        category: c.category,
        status: "Preparing",
        time: new Date()
      });
    }

    cart = [];
document.getElementById("totalAmount").innerText =
  "Total Paid: ₹" + total;
    document.getElementById("cart").innerHTML = "";
    alert("Order placed!");
  } catch (e) {
    alert(e.message);
  }
};


// =======================
// 🔔 TOAST NOTIFICATION
// =======================
function showToast(msg) {
  let div = document.createElement("div");
  div.className = "toast";
  div.innerText = msg;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000);
}


// =======================
// 👨‍🎓 USER ORDERS (REALTIME)
// =======================
function loadUserOrders() {
  let list = document.getElementById("orders");
  if (!list) return;

  onSnapshot(collection(db, "orders"), (snapshot) => {
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      let o = docSnap.data();

      let li = document.createElement("li");
      li.innerText = `${o.item} - ${o.status}`;
      list.appendChild(li);

      if (o.status === "Ready") {
        showToast(`${o.item} is READY for pickup!`);
      }
    });
  });
}


// =======================
// 👨‍🍳 ADMIN DASHBOARD (UPDATED)
// =======================
function loadAdminOrders() {
  let list = document.getElementById("adminOrders");
  if (!list) return;

  let snacks = 0;
  let meals = 0;
  let desserts = 0;
  let beverages = 0;

  onSnapshot(collection(db, "orders"), (snapshot) => {
    list.innerHTML = "";

    snacks = 0;
    meals = 0;
    desserts = 0;
    beverages = 0;

    snapshot.forEach((docSnap) => {
      let o = docSnap.data();

      // 🧾 ORDER UI
      let div = document.createElement("div");
      div.className = "order-card";

      div.innerHTML = `
        <span>${o.item} - ${o.status}</span>
        <button class="ready-btn" onclick="markReady('${docSnap.id}')">
          ${o.status === "Ready" ? "Done" : "Mark Ready"}
        </button>
      `;

      list.appendChild(div);

      // 📊 CATEGORY COUNTING
      if (o.category === "Snacks") snacks++;
      else if (o.category === "Meals") meals++;
      else if (o.category === "Desserts") desserts++;
      else if (o.category === "Beverages") beverages++;
    });

// 📊 CHART (UPDATED)
// =======================
function drawChart(snacks, meals, desserts, beverages) {
  let canvas = document.getElementById("chart");
  if (!canvas) return;

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Snacks", "Meals", "Desserts", "Beverages"],
      datasets: [{
        label: "Orders",
        data: [snacks, meals, desserts, beverages],
        backgroundColor: [
          "#2c7be5",  // Snacks
          "#00c6ff",  // Meals
          "#ff9f43",  // Desserts
          "#28a745"   // Beverages
        ]
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
}


// =======================
// ✅ MARK READY
// =======================
window.markReady = async function(id) {
  await updateDoc(doc(db, "orders", id), {
    status: "Ready"
  });
};


// =======================
// 📊 CHART
// =======================
function drawChart(snacks, meals) {
  let canvas = document.getElementById("chart");
  if (!canvas) return;

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Snacks", "Meals"],
      datasets: [{
        label: "Orders",
        data: [snacks, meals],
        backgroundColor: ["#2c7be5", "#00c6ff"]
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
}


// =======================
// 🚀 AUTO LOAD
// =======================
window.onload = function () {
  loadUserOrders();
  loadAdminOrders();
};

window.logout = function(){
  localStorage.removeItem("admin");
  window.location.href = "index.html";
};

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// USER LOGOUT
window.logoutUser = async function () {
  try {
    await signOut(auth); // Firebase logout
    localStorage.removeItem("admin"); // just in case
    alert("Logged out successfully!");
    window.location.href = "index.html";
  } catch (e) {
    alert("Error logging out: " + e.message);
  }
};

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔒 PROTECT USER DASHBOARD
function protectUserPage() {
  const path = window.location.pathname;

  if (path.includes("user-dashboard.html")) {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("Please login first");
        window.location.href = "user-login.html";
      }
    });
  }
}
window.onload = function () {
  protectUserPage();
  loadUserOrders();
  loadAdminOrders();
};

import { deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🧹 CLEAR ORDERS
window.clearOrders = async function () {
  let confirmClear = confirm("Are you sure you want to clear all orders?");
  if (!confirmClear) return;

  try {
    const snapshot = await getDocs(collection(db, "orders"));

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "orders", docSnap.id));
    });

    alert("Orders cleared!");
  } catch (e) {
    alert(e.message);
  }
};
  }
