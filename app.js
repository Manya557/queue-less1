// =======================
// 🔥 FIREBASE IMPORTS
// =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =======================
// 🔑 CONFIG
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyDSSEZJeTySbbpydfibsXYqa6KYqG9z-cM",
  authDomain: "queue-less-cbf4d.firebaseapp.com",
  projectId: "queue-less-cbf4d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =======================
// 🛒 CART
// =======================
let cart = [];


// =======================
// 🔐 AUTH
// =======================
window.register = async function () {
  try {
    await createUserWithEmailAndPassword(auth, emailInput(), passwordInput());
    alert("Registered!");
  } catch (e) {
    alert(e.message);
  }
};

window.login = async function () {
  try {
    await signInWithEmailAndPassword(auth, emailInput(), passwordInput());
    window.location.href = "user-dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

window.adminLogin = async function () {
  try {
    await signInWithEmailAndPassword(auth, emailInput(), passwordInput());

    if (emailInput() === "admin@gmail.com") {
      localStorage.setItem("admin", "true");
      window.location.href = "admin-dashboard.html";
    } else {
      alert("Not admin");
    }
  } catch (e) {
    alert(e.message);
  }
};


// =======================
// 🚪 LOGOUT
// =======================
window.logoutUser = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

window.logout = function () {
  localStorage.removeItem("admin");
  window.location.href = "index.html";
};


// =======================
// ➕ CART
// =======================
window.addToCart = function (item, price, category) {
  cart.push({ item, price, category });

  let li = document.createElement("li");
  li.innerText = `${item} - ₹${price}`;
  document.getElementById("cart").appendChild(li);
};


// =======================
// 📦 ORDER + TOTAL
// =======================
window.placeOrder = async function () {
  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }

  let total = 0;

  try {
    for (let c of cart) {
      total += c.price;

      await addDoc(collection(db, "orders"), {
        item: c.item,
        price: c.price,
        category: c.category,
        status: "Preparing"
      });
    }

    cart = [];
    document.getElementById("cart").innerHTML = "";

    alert("Total ₹" + total);

  } catch (e) {
    alert(e.message);
  }
};


// =======================
// 🧹 CLEAR ORDERS
// =======================
window.clearOrders = async function () {
  const snapshot = await getDocs(collection(db, "orders"));

  snapshot.forEach(async (docSnap) => {
    await deleteDoc(doc(db, "orders", docSnap.id));
  });

  alert("Orders cleared!");
};


// =======================
// 👨‍🎓 USER ORDERS
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
    });
  });
}


// =======================
// 👨‍🍳 ADMIN DASHBOARD
// =======================
function loadAdminOrders() {
  let list = document.getElementById("adminOrders");
  if (!list) return;

  onSnapshot(collection(db, "orders"), (snapshot) => {

    let snacks = 0;
    let meals = 0;
    let desserts = 0;
    let beverages = 0;

    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      let o = docSnap.data();

      let div = document.createElement("div");

      let span = document.createElement("span");
      span.innerText = `${o.item} - ${o.status}`;

      let btn = document.createElement("button");
      btn.innerText = "Ready";
      btn.onclick = function () {
        markReady(docSnap.id);
      };

      div.appendChild(span);
      div.appendChild(btn);
      list.appendChild(div);

      if (o.category === "Snacks") snacks++;
      else if (o.category === "Meals") meals++;
      else if (o.category === "Desserts") desserts++;
      else if (o.category === "Beverages") beverages++;
    });

    drawChart(snacks, meals, desserts, beverages);
  });
}


// =======================
// 📊 CHART
// =======================
function drawChart(snacks, meals, desserts, beverages) {
  let canvas = document.getElementById("chart");
  if (!canvas) return;

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Snacks", "Meals", "Desserts", "Beverages"],
      datasets: [{
        data: [snacks, meals, desserts, beverages],
        backgroundColor: ["#2c7be5", "#00c6ff", "#ff9f43", "#28a745"]
      }]
    }
  });
}


// =======================
// 🔧 HELPERS
// =======================
function emailInput() {
  return document.getElementById("email")?.value || "";
}

function passwordInput() {
  return document.getElementById("password")?.value || "";
}


// =======================
// 🚀 START
// =======================
window.onload = function () {
  loadUserOrders();
  loadAdminOrders();
};
