let cart = [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// USER LOAD
function loadUser(){
    let name = localStorage.getItem("user");
    document.getElementById("userName").innerText = name;
    displayOrders();
}

// ADD TO CART
function addToCart(item, price, category){
    cart.push({item, price, category});
    displayCart();
}

// SHOW CART
function displayCart(){
    let list = document.getElementById("cart");
    list.innerHTML = "";

    cart.forEach(c => {
        let li = document.createElement("li");
        li.innerText = `${c.item} - ₹${c.price}`;
        list.appendChild(li);
    });
}

// 💳 PAYMENT
function payNow(){
    let total = cart.reduce((sum,i)=>sum+i.price,0);

    var options = {
        "key": "rzp_test_123456789", // replace with real key
        "amount": total * 100,
        "currency": "INR",
        "name": "Queue Less",
        "description": "Food Order",
        "handler": function () {
            placeOrder();
        }
    };

    var rzp = new Razorpay(options);
    rzp.open();
}

// PLACE ORDER
function placeOrder(){
    cart.forEach(c=>{
        orders.push({
            item:c.item,
            price:c.price,
            category:c.category,
            status:"Preparing"
        });
    });

    localStorage.setItem("orders", JSON.stringify(orders));
    cart = [];
    alert("Order Placed!");
    displayOrders();
}

// USER ORDERS + NOTIFICATION
function displayOrders(){
    let list = document.getElementById("orders");
    if(!list) return;

    list.innerHTML = "";

    orders.forEach((o,i)=>{
        let li = document.createElement("li");
        li.innerHTML = `${o.item} - ${o.status}
        <button onclick="repeatOrder(${i})">Repeat</button>`;
        list.appendChild(li);

        if(o.status === "Ready"){
            setTimeout(()=>{
                alert("Your order " + o.item + " is READY!");
            },500);
        }
    });
}

// REPEAT ORDER
function repeatOrder(i){
    addToCart(orders[i].item, orders[i].price, orders[i].category);
}

// ADMIN LOAD
function loadAdmin(){
    let list = document.getElementById("adminOrders");

    let snacks=0, meals=0, revenue=0;

    list.innerHTML = "";

    orders.forEach((o,i)=>{
        let li = document.createElement("li");
        li.innerHTML = `${o.item} - ${o.status}
        <button onclick="markReady(${i})">Ready</button>`;
        list.appendChild(li);

        revenue += o.price;

        if(o.category === "Snacks") snacks++;
        if(o.category === "Meals") meals++;
    });

    document.getElementById("total").innerText = "Total Orders: " + orders.length;
    document.getElementById("revenue").innerText = "Revenue: ₹" + revenue;
    document.getElementById("snacks").innerText = "Snacks Sold: " + snacks;
    document.getElementById("meals").innerText = "Meals Sold: " + meals;

    drawChart(snacks, meals);
}

// MARK READY
function markReady(i){
    orders[i].status = "Ready";
    localStorage.setItem("orders", JSON.stringify(orders));
    loadAdmin();
}

// 📊 CHART
function drawChart(snacks, meals){
    new Chart(document.getElementById("chart"), {
        type: 'bar',
        data: {
            labels: ["Snacks","Meals"],
            datasets: [{
                label: "Orders",
                data: [snacks, meals]
            }]
        }
    });
}