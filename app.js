// DEBUG
console.log("APP LOADED");

// FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDSSEZJeTySbbpydfibsXYqa6KYqG9z-cM",
  authDomain: "queue-less-cbf4d.firebaseapp.com",
  projectId: "queue-less-cbf4d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// CART
let cart = [];

// AUTH
window.login = async function () {
  try {
    await signInWithEmailAndPassword(auth,
      document.getElementById("email").value,
      document.getElementById("password").value
    );
    window.location.href = "user-dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

window.register = async function () {
  try {
    await createUserWithEmailAndPassword(auth,
      document.getElementById("email").value,
      document.getElementById("password").value
    );
    alert("Registered!");
  } catch (e) {
    alert(e.message);
  }
};

// CART
window.addToCart = function (item, price, category) {
  cart.push({ item, price, category });

  let li = document.createElement("li");
  li.innerText = item + " - ₹" + price;
  document.getElementById("cart").appendChild(li);
};

// ORDER
window.placeOrder = async function () {
  let total = 0;

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

  alert("Total: ₹" + total);
};

// USER ORDERS
function loadOrders() {
  let list = document.getElementById("orders");
  if (!list) return;

  onSnapshot(collection(db, "orders"), (snapshot) => {
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      let o = docSnap.data();
      let li = document.createElement("li");
      li.innerText = o.item + " - " + o.status;
      list.appendChild(li);
    });
  });
}

// RUN
window.onload = function () {
  loadOrders();
};ion(db, "orders"));

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "orders", docSnap.id));
    });

    alert("Orders cleared!");
  } catch (e) {
    alert(e.message);
  }
};
  }
