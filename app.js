import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSSEZJeTySbbpydfibsXYqa6KYqG9z-cM",
  authDomain: "queue-less-cbf4d.firebaseapp.com",
  projectId: "queue-less-cbf4d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let cart = [];

// LOGIN
window.login = async function(){
  await signInWithEmailAndPassword(auth,
    document.getElementById("email").value,
    document.getElementById("password").value
  );
  window.location.href = "user-dashboard.html";
};

// REGISTER
window.register = async function(){
  await createUserWithEmailAndPassword(auth,
    document.getElementById("email").value,
    document.getElementById("password").value
  );
  alert("Registered!");
};

// ADMIN LOGIN
window.adminLogin = async function(){
  let email = document.getElementById("email").value;

  await signInWithEmailAndPassword(auth,
    email,
    document.getElementById("password").value
  );

  if(email === "admin@gmail.com"){
    localStorage.setItem("admin","true");
    window.location.href="admin-dashboard.html";
  } else {
    alert("Not admin");
  }
};

// LOGOUT
window.logoutUser = async function(){
  await signOut(auth);
  window.location.href="index.html";
};

window.logout = function(){
  localStorage.removeItem("admin");
  window.location.href="index.html";
};

// CART
window.addToCart = function(item,price,category){
  cart.push({item,price,category});

  let li = document.createElement("li");
  li.innerText = item + " ₹" + price;
  document.getElementById("cart").appendChild(li);
};

// ORDER
window.placeOrder = async function(){
  let total = 0;

  for(let c of cart){
    total += c.price;

    await addDoc(collection(db,"orders"),{
      item:c.item,
      status:"Preparing"
    });
  }

  cart = [];
  document.getElementById("cart").innerHTML = "";
  alert("Total ₹"+total);
};

// USER ORDERS
onSnapshot(collection(db,"orders"),(snapshot)=>{
  let list = document.getElementById("orders");
  if(!list) return;

  list.innerHTML="";
  snapshot.forEach(doc=>{
    let li = document.createElement("li");
    li.innerText = doc.data().item + " - " + doc.data().status;
    list.appendChild(li);
  });
});

