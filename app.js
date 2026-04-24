import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
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
    email.value,
    password.value
  );
  window.location.href="user-dashboard.html";
};

// REGISTER
window.register = async function(){
  await createUserWithEmailAndPassword(auth,
    email.value,
    password.value
  );
  alert("Registered");
};

// ADMIN LOGIN
window.adminLogin = async function(){
  await signInWithEmailAndPassword(auth,email.value,password.value);

  if(email.value==="admin@gmail.com"){
    localStorage.setItem("admin","true");
    window.location.href="admin-dashboard.html";
  } else alert("Not admin");
};

// LOGOUT
window.logoutUser = async ()=>{
  await signOut(auth);
  location.href="index.html";
};

window.logout = ()=>{
  localStorage.removeItem("admin");
  location.href="index.html";
};

// CART
window.addToCart = (item,price,category)=>{
  cart.push({item,price,category});

  let li=document.createElement("li");
  li.innerText=item+" ₹"+price;
  cartList().appendChild(li);
};

// ORDER
window.placeOrder = async ()=>{
  let total=0;

  for(let c of cart){
    total+=c.price;

    await addDoc(collection(db,"orders"),{
      item:c.item,
      category:c.category,
      status:"Preparing"
    });
  }

  cart=[];
  cartList().innerHTML="";
  alert("Total ₹"+total);
};

// CLEAR
window.clearOrders = async ()=>{
  let snap=await getDocs(collection(db,"orders"));

  snap.forEach(async d=>{
    await deleteDoc(doc(db,"orders",d.id));
  });

  alert("Orders cleared");
};

// USER ORDERS
onSnapshot(collection(db,"orders"),snap=>{
  let list=document.getElementById("orders");
  if(!list) return;

  list.innerHTML="";
  snap.forEach(d=>{
    let li=document.createElement("li");
    li.innerText=d.data().item+" - "+d.data().status;
    list.appendChild(li);
  });
});

// ADMIN DASHBOARD
function loadAdmin(){
  let list=document.getElementById("adminOrders");
  if(!list) return;

  onSnapshot(collection(db,"orders"),snap=>{
    list.innerHTML="";

    let snacks=0, meals=0, desserts=0;

    snap.forEach(d=>{
      let o=d.data();

      let div=document.createElement("div");
      div.innerText=o.item+" - "+o.status;

      let btn=document.createElement("button");
      btn.innerText="Ready";
      btn.onclick=()=>markReady(d.id);

      div.appendChild(btn);
      list.appendChild(div);

      if(o.category==="Snacks") snacks++;
      else if(o.category==="Meals") meals++;
      else if(o.category==="Desserts") desserts++;
    });

    new Chart(chart(),{
      type:"bar",
      data:{
        labels:["Snacks","Meals","Desserts"],
        datasets:[{data:[snacks,meals,desserts]}]
      }
    });
  });
}

window.markReady = async id=>{
  await updateDoc(doc(db,"orders",id),{status:"Ready"});
};

window.onload = loadAdmin;

// helpers
function cartList(){ return document.getElementById("cart"); }
function chart(){ return document.getElementById("chart"); }
