const sizes = {"6 × 8":0,"8 × 10":400,"12 × 15":1100,"16 × 20":2100,"18 × 24":3100};
const products = [
  ["lakshmi","Goddess Lakshmi Acrylic Frame","God Collection",1499,"Bestseller","assets/products/lakshmi.webp","50% 50%"],
  ["ganesha","Lord Ganesha Acrylic Frame","God Collection",1499,"New","assets/products/ganesha.webp","50% 42%"],
  ["balaji","Tirupati Balaji Acrylic Frame","God Collection",1999,"Sacred Edit","assets/products/balaji.webp","50% 48%"],
  ["shiva","Lord Shiva Acrylic Frame","God Collection",1999,"","assets/products/shiva.webp","50% 48%"],
  ["krishna","Krishna with Cow Acrylic Frame","God Collection",1999,"Bestseller","assets/products/krishna.webp","50% 50%"],
  ["tree","Tree of Life Acrylic Frame","Heritage Collection",1499,"Signature","assets/products/tree-of-life.webp","50% 50%"],
  ["buddha","Buddha Serenity Acrylic Frame","Heritage Collection",1999,"","assets/products/buddha.webp","50% 48%"],
  ["horse","Royal Horse Acrylic Frame","Heritage Collection",1999,"New","assets/products/royal-horse.webp","50% 50%"],
  ["peacock","Royal Peacock Acrylic Frame","Heritage Collection",1499,"Bestseller","assets/products/royal-peacock.webp","50% 50%"],
  ["dance","Dancing Girl Acrylic Frame","Heritage Collection",1999,"","assets/products/dancing-girl.webp","50% 50%"]
].map(([id,name,category,price,badge,image,pos],i)=>({id,name,category,price,badge,image,pos,stock:12+i,description:"A luminous expression of Indian artistry, finished in brilliant gallery-grade acrylic with rich colour depth and hand-polished edges."}));

let cart = JSON.parse(localStorage.getItem("rh-cart")||"[]");
let filter = "All", showAll = false, coupon = "";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => "₹"+Math.round(n).toLocaleString("en-IN");
const hero = "assets/royal-heritage-hero.png";

function renderProducts(){
  let list = filter==="All" ? products : filter==="Gift Collection" ? products.filter(p=>["lakshmi","ganesha","tree","peacock"].includes(p.id)) : products.filter(p=>p.category===filter);
  if(!showAll && filter==="All") list=list.slice(0,8);
  $("#productGrid").innerHTML=list.map((p,i)=>`
    <article class="product-card" data-id="${p.id}">
      <div class="product-image"><img src="${p.image}" alt="${p.name}" style="object-position:${p.pos}">${p.badge?`<span class="product-badge">${p.badge.toUpperCase()}</span>`:""}<span class="finish-chip">✦ Glossy acrylic</span><button class="quick-add" data-quick="${p.id}" aria-label="Quick add ${p.name}">+</button></div>
      <div class="product-info"><h3>${p.name}</h3><p>${p.category}<strong>From ${money(p.price)}</strong></p></div>
    </article>`).join("");
  $$("[data-id]").forEach(el=>el.onclick=e=>{if(!e.target.closest("[data-quick]"))openProduct(el.dataset.id)});
  $$("[data-quick]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();addToCart(btn.dataset.quick,"6 × 8")});
  $("#viewAllBtn").style.display=filter==="All"?"inline-flex":"none";
  $("#viewAllBtn").textContent=showAll?"Show curated edit":"View all 10 pieces";
}
function closeDialogs(exceptId=""){
  $$("dialog[open]").forEach(dialog=>{if(dialog.id!==exceptId)dialog.close()});
}

function openProduct(id){
  closeDrawer();closeDialogs("productModal");
  const p=products.find(x=>x.id===id), modal=$("#productModal");
  modal.innerHTML=`<div class="product-detail">
    <div class="detail-image"><img src="${p.image}" alt="${p.name}" style="object-position:${p.pos}"><span class="detail-finish">6mm premium glossy acrylic</span></div>
    <div class="detail-copy">
      <div class="modal-top"><p class="eyebrow">${p.category.toUpperCase()}</p><button class="close" onclick="productModal.close()">×</button></div>
      <h3>${p.name}</h3><p>${p.description}</p>
      <div class="option-label">Select size</div><div class="options size-options">${Object.keys(sizes).map((s,i)=>`<button class="${i===0?"active":""}" data-size="${s}">${s}"</button>`).join("")}</div>
      <div class="option-label">Frame finish</div><div class="options"><button class="active">Midnight Black</button><button>Antique Gold</button><button>Teak</button></div>
      <div class="detail-price" id="modalPrice">${money(p.price)}</div>
      <button class="btn btn-gold full" id="modalAdd">Add to bag <span>→</span></button>
      <p style="font-size:10px">✓ Gallery-grade glossy acrylic &nbsp; ✓ Secure protective packaging</p>
    </div></div>`;
  let selected="6 × 8";
  modal.querySelectorAll(".size-options button").forEach(b=>b.onclick=()=>{modal.querySelectorAll(".size-options button").forEach(x=>x.classList.remove("active"));b.classList.add("active");selected=b.dataset.size;$("#modalPrice").textContent=money(p.price+sizes[selected])});
  $("#modalAdd").onclick=()=>{addToCart(id,selected);modal.close()};
  modal.showModal();
}

function itemUnitPrice(item){
  const p=products.find(x=>x.id===item.id);
  const base=item.custom?.basePrice ?? p?.price ?? 2199;
  return base+(sizes[item.size]||0)+(item.custom?.gift?199:0);
}
function addToCart(id,size,custom={},quantity=1){
  const key=custom.uid?`${id}-${custom.uid}`:`${id}-${size}`;
  const existing=cart.find(x=>x.key===key);
  if(existing) existing.qty+=quantity; else cart.push({key,id,size,qty:quantity,custom});
  persist(); toast("Added to your shopping bag");
}
function persist(){
  try{localStorage.setItem("rh-cart",JSON.stringify(cart))}
  catch(e){toast("Photo is too large to save. Please choose a smaller image.")}
  renderCart();
}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map(item=>{
    const p=products.find(x=>x.id===item.id)||{name:"Custom Acrylic Portrait",price:2199,pos:"50% 50%",image:hero};
    const image=item.custom?.image||p.image;
    const details=item.custom?.uid
      ? `${item.size}" · ${item.custom.finish}<br>${item.custom.frameColor}${item.custom.gift?" · Gift wrapped":""}`
      : `${item.size}" · Glossy acrylic`;
    return `<div class="cart-item"><img src="${image}" alt="${p.name}" style="object-position:${p.pos}"><div><h4>${p.name}</h4><p>${details}</p><div class="qty"><button data-dec="${item.key}">−</button><span>${item.qty}</span><button data-inc="${item.key}">+</button></div></div><div><b>${money(itemUnitPrice(item)*item.qty)}</b><button class="remove" data-remove="${item.key}">×</button></div></div>`
  }).join(""):`<div class="empty-state">Your bag is waiting for something beautiful.<br><br><a href="#shop" class="text-link" onclick="closeDrawer()">Explore the collection</a></div>`;
  const subtotal=cart.reduce((sum,item)=>sum+itemUnitPrice(item)*item.qty,0);
  const delivery=subtotal===0||subtotal>=3000?0:149, discount=coupon==="ROYAL10"?subtotal*.1:0;
  $("#subtotal").textContent=money(subtotal);$("#delivery").textContent=delivery?money(delivery):"Complimentary";$("#grandTotal").textContent=money(subtotal+delivery-discount);
  $("#discountRow").hidden=!discount;$("#discount").textContent="−"+money(discount);
  $$("[data-inc]").forEach(b=>b.onclick=()=>changeQty(b.dataset.inc,1));$$("[data-dec]").forEach(b=>b.onclick=()=>changeQty(b.dataset.dec,-1));$$("[data-remove]").forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.key!==b.dataset.remove);persist()});
}
function changeQty(key,n){const x=cart.find(i=>i.key===key);x.qty+=n;if(x.qty<1)cart=cart.filter(i=>i.key!==key);persist()}
function openDrawer(){closeDialogs();$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false")}
function closeDrawer(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true")}
function toast(msg){$("#toast").textContent=msg;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2400)}

function openCustom(){
  closeDrawer();closeDialogs("customModal");
  $("#customModal").innerHTML=`<div class="modal-inner"><div class="modal-top"><div><p class="eyebrow">CUSTOM STUDIO</p><h3>Create your frame</h3></div><button class="close" onclick="customModal.close()">×</button></div>
  <div class="custom-builder">
    <div class="custom-preview-wrap"><img id="customPreview" src="${hero}" alt="Your custom frame preview"><div class="preview-glass"></div><span id="previewHint">Your photo preview</span></div>
    <form id="customForm" class="form-grid">
      <label class="wide upload-box">Upload your favourite photograph<input id="customPhoto" required type="file" accept="image/png,image/jpeg"><span id="uploadStatus">JPG or PNG · up to 10 MB</span></label>
      <label>Frame size<select name="size">${Object.keys(sizes).map(s=>`<option value="${s}">${s}"</option>`)}</select></label>
      <label>Frame colour<select name="frameColor"><option>Midnight Black</option><option>Antique Gold</option><option>Teak Brown</option></select></label>
      <label>Finish<select name="finish"><option>Premium glossy acrylic</option><option>Soft matte acrylic</option></select></label>
      <label>Quantity<input name="quantity" type="number" min="1" max="20" value="1"></label>
      <label class="wide gift-option"><input name="gift" type="checkbox"> Add luxury gift packaging (+₹199)</label>
      <div class="custom-price wide"><span>Your custom frame</span><strong id="customPrice">${money(2199)}</strong></div>
      <button class="btn btn-gold wide" type="submit">Add personalized frame <span>→</span></button>
    </form>
  </div></div>`;
  let customImage="";
  const form=$("#customForm"), fileInput=$("#customPhoto");
  const updatePrice=()=>{
    const unit=2199+sizes[form.size.value]+(form.gift.checked?199:0);
    $("#customPrice").textContent=money(unit*Math.max(1,Number(form.quantity.value)||1));
  };
  form.size.onchange=updatePrice;form.gift.onchange=updatePrice;form.quantity.oninput=updatePrice;
  fileInput.onchange=async()=>{
    const file=fileInput.files[0];
    if(!file)return;
    if(file.size>10*1024*1024){fileInput.value="";return toast("Please choose an image under 10 MB")}
    $("#uploadStatus").textContent="Preparing preview…";
    try{
      customImage=await compressImage(file);
      $("#customPreview").src=customImage;
      $("#previewHint").textContent="Live acrylic preview";
      $("#uploadStatus").textContent=`${file.name} · ready`;
    }catch(e){customImage="";toast("This image could not be read. Please try another JPG or PNG.")}
  };
  form.onsubmit=e=>{
    e.preventDefault();
    if(!customImage)return toast("Please upload a photo to continue");
    const qty=Math.max(1,Number(form.quantity.value)||1);
    addToCart("custom",form.size.value,{uid:Date.now().toString(36),image:customImage,filename:fileInput.files[0]?.name||"custom-photo",frameColor:form.frameColor.value,finish:form.finish.value,gift:form.gift.checked,basePrice:2199},qty);
    $("#customModal").close();openDrawer();
  };
  $("#customModal").showModal();
}
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",.78));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function checkout(){
  if(!cart.length)return toast("Your shopping bag is empty");
  closeDrawer();closeDialogs("checkoutModal");
  $("#checkoutModal").innerHTML=`<div class="modal-inner"><div class="modal-top"><div><p class="eyebrow">SECURE CHECKOUT</p><h3>Delivery details</h3></div><button class="close" onclick="checkoutModal.close()">×</button></div>
  <div class="checkout-steps"><span class="active"></span><span></span><span></span></div>
  <form id="checkoutForm" class="form-grid">
    <label>Full name<input required name="customerName" placeholder="Name"></label><label>Phone number<input required name="phone" pattern="[0-9]{10}" placeholder="10-digit mobile"></label>
    <label class="wide">Email<input required name="email" type="email" placeholder="you@example.com"></label>
    <label class="wide">Delivery address<textarea required name="address" rows="3" placeholder="House, street, locality"></textarea></label>
    <label>City<input required name="city" placeholder="City"></label><label>PIN code<input required name="pin" pattern="[0-9]{6}" placeholder="600001"></label>
    <button class="btn btn-gold wide" type="submit">Continue to payment <span>→</span></button>
  </form></div>`;
  $("#checkoutForm").onsubmit=e=>{e.preventDefault();const f=e.target;showPayment({name:f.customerName.value,phone:f.phone.value,email:f.email.value,address:f.address.value,city:f.city.value,pin:f.pin.value})};
  $("#checkoutModal").showModal();
}
function showPayment(customer){
  const total=$("#grandTotal").textContent;
  $("#checkoutModal").innerHTML=`<div class="modal-inner"><div class="modal-top"><div><p class="eyebrow">PAYMENT</p><h3>Complete your order</h3></div><button class="close" onclick="checkoutModal.close()">×</button></div>
  <div class="checkout-steps"><span class="active"></span><span class="active"></span><span></span></div>
  <div class="payment-box"><div class="qr"></div><div><b>Scan with any UPI app</b><p>Google Pay · PhonePe · Paytm</p><strong>${total}</strong></div></div>
  <button class="btn btn-gold full" id="payBtn">Pay securely with Razorpay <span>→</span></button><p style="text-align:center;color:#91867d;font-size:9px">Demo payment — no charge will be made</p></div>`;
  $("#payBtn").onclick=()=>confirmOrder(customer,total);
}
function confirmOrder(customer,total){
  const id="RH"+Date.now().toString().slice(-6);
  const orderItems=cart.map(item=>({id:item.id,size:item.size,qty:item.qty,unitPrice:itemUnitPrice(item),custom:item.custom||{}}));
  const orders=JSON.parse(localStorage.getItem("rh-orders")||"[]");orders.unshift({id,name:customer.name,customer,items:orderItems,total,status:"Paid",delivery:"Processing",date:new Date().toLocaleDateString("en-IN"),createdAt:new Date().toISOString()});localStorage.setItem("rh-orders",JSON.stringify(orders));
  cart=[];persist();
  $("#checkoutModal").innerHTML=`<div class="success"><div class="success-mark"><span>✓</span></div><p class="eyebrow">ORDER CONFIRMED</p><h3>Thank you, ${customer.name}.</h3><p>Your order <b>${id}</b> is now being prepared with care.<br>We’ll send tracking updates to ${customer.phone}.</p><button class="btn btn-gold" onclick="checkoutModal.close()">Continue shopping</button></div>`;
}

const sampleOrders=[
  {id:"RH204921",name:"Ananya Rao",date:"01/07/2026",total:"₹3,647",status:"Paid",delivery:"Processing",items:[{id:"lakshmi",qty:1},{id:"ganesha",qty:1}],customer:{email:"ananya@example.com",phone:"9876501020",city:"Chennai"}},
  {id:"RH204882",name:"Vikram S",date:"30/06/2026",total:"₹1,999",status:"Paid",delivery:"Shipped",items:[{id:"shiva",qty:1}],customer:{email:"vikram@example.com",phone:"9876502040",city:"Bengaluru"}},
  {id:"RH204845",name:"Meera Iyer",date:"29/06/2026",total:"₹4,098",status:"Paid",delivery:"Delivered",items:[{id:"tree",qty:1},{id:"peacock",qty:1}],customer:{email:"meera@example.com",phone:"9876503060",city:"Coimbatore"}},
  {id:"RH204803",name:"Arjun Kumar",date:"25/06/2026",total:"₹2,599",status:"Paid",delivery:"Delivered",items:[{id:"balaji",qty:1}],customer:{email:"arjun@example.com",phone:"9876504080",city:"Hyderabad"}},
  {id:"RH204778",name:"Priya N",date:"20/06/2026",total:"₹3,198",status:"Pending",delivery:"Processing",items:[{id:"ganesha",qty:2}],customer:{email:"priya@example.com",phone:"9876505090",city:"Madurai"}}
];
function getAdminOrders(){return [...JSON.parse(localStorage.getItem("rh-orders")||"[]"),...sampleOrders]}
function orderAmount(order){return Number(String(order.total||0).replace(/[^\d.]/g,""))||0}
function orderRows(orders){
  return orders.map(o=>`<tr><td><b>${o.id}</b></td><td>${o.name}</td><td>${o.date}</td><td>${o.total}</td><td><span class="status ${o.status!=="Paid"?"pending":""}">${o.status}</span></td><td><span class="status ${["Processing","Packed"].includes(o.delivery)?"pending":""}">${o.delivery}</span></td></tr>`).join("");
}
function adminHeader(kicker,title){
  return `<div class="modal-top"><div><p class="eyebrow">${kicker}</p><h3>${title}</h3></div><button class="close" onclick="adminModal.close()">×</button></div>`;
}
function openAdmin(){
  closeDrawer();closeDialogs("adminModal");
  $("#adminModal").innerHTML=`<div class="admin-shell"><aside class="admin-nav"><h4>RH Studio</h4>
    ${["overview","products","orders","customers","sales","coupons"].map((id,i)=>`<button class="${i===0?"active":""}" data-admin-tab="${id}">${id==="sales"?"Sales report":id[0].toUpperCase()+id.slice(1)}</button>`).join("")}
    </aside><div class="admin-main" id="adminContent"></div></div>`;
  $$("[data-admin-tab]").forEach(button=>button.onclick=()=>{$$("[data-admin-tab]").forEach(x=>x.classList.remove("active"));button.classList.add("active");renderAdminTab(button.dataset.adminTab)});
  renderAdminTab("overview");$("#adminModal").showModal();
}
function renderAdminTab(tab){
  const orders=getAdminOrders(),revenue=orders.reduce((sum,o)=>sum+orderAmount(o),0),pending=orders.filter(o=>o.delivery==="Processing").length,delivered=orders.filter(o=>o.delivery==="Delivered").length;
  const content=$("#adminContent");
  if(tab==="overview"){
    content.innerHTML=`${adminHeader("ADMIN OVERVIEW","Welcome back, Admin")}
      <div class="metric-grid"><div class="metric"><span>TOTAL REVENUE</span><strong>${money(revenue)}</strong></div><div class="metric"><span>TOTAL ORDERS</span><strong>${orders.length}</strong></div><div class="metric"><span>PENDING</span><strong>${pending}</strong></div><div class="metric"><span>EST. PROFIT</span><strong>${money(revenue*.35)}</strong></div></div>
      <h4 class="admin-section-title">Recent orders</h4><div class="table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Payment</th><th>Delivery</th></tr></thead><tbody>${orderRows(orders.slice(0,5))}</tbody></table></div>`;
  }else if(tab==="products"){
    content.innerHTML=`${adminHeader("CATALOGUE","Manage products")}<div class="admin-toolbar"><span>${products.length} active products</span><button class="btn btn-gold">+ Add product</button></div>
      <div class="table-wrap"><table class="admin-table product-admin-table"><thead><tr><th>Product</th><th>Category</th><th>Starting price</th><th>Stock</th><th>Status</th></tr></thead><tbody>${products.map(p=>`<tr><td><div class="admin-product"><img src="${p.image}"><b>${p.name}</b></div></td><td>${p.category}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><span class="status">${p.stock>5?"In stock":"Low stock"}</span></td></tr>`).join("")}</tbody></table></div>`;
  }else if(tab==="orders"){
    content.innerHTML=`${adminHeader("FULFILMENT","Manage orders")}<div class="admin-toolbar"><span>${pending} orders need attention</span><button class="btn btn-outline" onclick="downloadReport()">Export orders</button></div>
      <div class="table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Payment</th><th>Delivery</th></tr></thead><tbody>${orderRows(orders)}</tbody></table></div>`;
  }else if(tab==="customers"){
    const customers=orders.reduce((map,o)=>{const key=o.customer?.email||o.name;if(!map[key])map[key]={name:o.name,email:o.customer?.email||"—",phone:o.customer?.phone||"—",city:o.customer?.city||"—",orders:0,spent:0};map[key].orders++;map[key].spent+=orderAmount(o);return map},{});
    content.innerHTML=`${adminHeader("CUSTOMERS","Customer directory")}<div class="metric-grid compact"><div class="metric"><span>TOTAL CUSTOMERS</span><strong>${Object.keys(customers).length}</strong></div><div class="metric"><span>REPEAT BUYERS</span><strong>${Object.values(customers).filter(c=>c.orders>1).length}</strong></div></div>
      <div class="table-wrap"><table class="admin-table"><thead><tr><th>Customer</th><th>Contact</th><th>City</th><th>Orders</th><th>Total spent</th></tr></thead><tbody>${Object.values(customers).map(c=>`<tr><td><b>${c.name}</b></td><td>${c.email}<br><small>${c.phone}</small></td><td>${c.city}</td><td>${c.orders}</td><td>${money(c.spent)}</td></tr>`).join("")}</tbody></table></div>`;
  }else if(tab==="sales"){
    const counts={};orders.flatMap(o=>o.items||[]).forEach(item=>counts[item.id]=(counts[item.id]||0)+(item.qty||1));
    const best=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    content.innerHTML=`${adminHeader("MANAGE REPORTS","Sales report")}
      <div class="metric-grid"><div class="metric"><span>GROSS REVENUE</span><strong>${money(revenue)}</strong></div><div class="metric"><span>ORDERS</span><strong>${orders.length}</strong></div><div class="metric"><span>DELIVERED</span><strong>${delivered}</strong></div><div class="metric"><span>PROFIT (35%)</span><strong>${money(revenue*.35)}</strong></div></div>
      <div class="report-grid"><section class="report-card"><h4>Order status</h4><div class="report-bar"><span style="width:${orders.length?delivered/orders.length*100:0}%"></span></div><p><b>${delivered}</b> delivered · <b>${pending}</b> pending · <b>${orders.length-delivered-pending}</b> shipped</p></section>
      <section class="report-card"><h4>Best-selling products</h4>${best.map(([id,count],i)=>{const p=products.find(x=>x.id===id);return `<p class="rank"><span>${i+1}. ${p?.name||"Custom frame"}</span><b>${count} sold</b></p>`}).join("")}</section></div>
      <button class="btn btn-gold" onclick="downloadReport()">Download complete sales report</button>`;
  }else if(tab==="coupons"){
    const coupons=[{code:"ROYAL10",discount:"10% off",uses:18,status:"Active"},{code:"FESTIVE15",discount:"15% off",uses:7,status:"Scheduled"},{code:"WELCOME200",discount:"₹200 off",uses:34,status:"Active"}];
    content.innerHTML=`${adminHeader("PROMOTIONS","Coupon management")}<div class="admin-toolbar"><span>${coupons.filter(c=>c.status==="Active").length} active coupons</span><button class="btn btn-gold">+ Create coupon</button></div>
      <div class="coupon-admin-grid">${coupons.map(c=>`<article class="coupon-admin-card"><span class="status ${c.status!=="Active"?"pending":""}">${c.status}</span><h4>${c.code}</h4><strong>${c.discount}</strong><p>${c.uses} redemptions</p></article>`).join("")}</div>`;
  }
}
function downloadReport(){
  const orders=getAdminOrders(),rows=["Order ID,Customer,Date,Amount,Payment,Delivery",...orders.map(o=>`${o.id},"${o.name}",${o.date},${orderAmount(o)},${o.status},${o.delivery}`)];
  const blob=new Blob([rows.join("\n")],{type:"text/csv"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="royal-heritage-sales-report.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Sales report downloaded");
}

$("#filters").onclick=e=>{
  if(!e.target.dataset.filter)return;
  if(e.target.dataset.filter==="Custom Photo Frames"){openCustom();return}
  $$("#filters button").forEach(b=>b.classList.remove("active"));
  e.target.classList.add("active");filter=e.target.dataset.filter;renderProducts();
};
$("#viewAllBtn").onclick=()=>{showAll=!showAll;renderProducts()};
$("#cartBtn").onclick=openDrawer;$("#backdrop").onclick=closeDrawer;$$("[data-close]").forEach(b=>b.onclick=closeDrawer);
$("#customizeBtn").onclick=openCustom;$("#createFrameLink").onclick=e=>{e.preventDefault();openCustom()};$("#checkoutBtn").onclick=checkout;$("#adminBtn").onclick=openAdmin;
$("#applyCoupon").onclick=()=>{coupon=$("#couponInput").value.trim().toUpperCase();if(coupon==="ROYAL10"){renderCart();toast("ROYAL10 applied — 10% saved")}else toast("Try ROYAL10 for this demo")};
$("#whatsappBtn").onclick=()=>window.open("https://wa.me/919876543210?text="+encodeURIComponent("Hello Royal Heritage, I would like help choosing a frame."),"_blank");
$("#supplierForm").onsubmit=e=>{
  e.preventDefault();
  const form=e.target;
  if(!form.reportValidity())return;
  const field=name=>form.elements.namedItem(name).value.trim();
  const lead={name:field("name"),email:field("email"),company:field("company"),phone:field("phone"),requestedAt:new Date().toISOString()};
  const leads=JSON.parse(localStorage.getItem("rh-supplier-leads")||"[]");
  leads.unshift(lead);localStorage.setItem("rh-supplier-leads",JSON.stringify(leads));
  const subject=`Supplier catalogue request — ${lead.company||lead.name}`;
  const message=`Hello Royal Heritage,\n\nPlease send your latest supplier catalogue and wholesale pricing to:\n\nName: ${lead.name}\nBusiness: ${lead.company||"Not specified"}\nEmail: ${lead.email}\nPhone: ${lead.phone}\n\nI am interested in marketplace / retail partnership.\n\nThank you,\n${lead.name}`;
  const mailto=`mailto:hello@royalheritage.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  $("#openMailLink").href=mailto;
  $("#supplierEmailActions").hidden=false;
  $("#downloadEmailBtn").onclick=()=>downloadSupplierEmail(lead,subject,message);
  downloadSupplierEmail(lead,subject,message);
  $("#supplierStatus").textContent="Email generated. Open the downloaded .eml file, or use “Open in mail app”.";
  toast("Email request generated");
};
$("#downloadCatalogBtn").onclick=async()=>{
  const button=$("#downloadCatalogBtn"),label=button.textContent;
  button.disabled=true;button.textContent="Preparing catalogue…";
  try{
    const response=await fetch("assets/supplier-catalog.webp");
    if(!response.ok)throw new Error("Catalog file unavailable");
    const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="Royal-Heritage-Supplier-Catalog.webp";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast("Catalogue downloaded");
  }catch(e){toast("Catalogue download failed. Please try again.")}
  finally{button.disabled=false;button.textContent=label}
};
function downloadSupplierEmail(lead,subject,message){
  const eml=[
    "To: hello@royalheritage.in",
    `Reply-To: ${lead.email}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    message
  ].join("\r\n");
  const blob=new Blob([eml],{type:"message/rfc822"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="Royal-Heritage-Catalogue-Request.eml";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer()});

let installPrompt;
const installAppBtn=$("#installAppBtn");
window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault();
  installPrompt=event;
  installAppBtn.hidden=false;
});
window.addEventListener("appinstalled",()=>{
  installPrompt=null;
  installAppBtn.hidden=true;
  toast("Royal Heritage app installed");
});
installAppBtn.onclick=async()=>{
  if(window.matchMedia("(display-mode: standalone)").matches){
    toast("Royal Heritage is already installed");
    return;
  }
  if(installPrompt){
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt=null;
    return;
  }
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  toast(ios?"On Safari, tap Share and choose Add to Home Screen":"Open the browser menu and choose Install app or Add to Home screen");
};
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
renderProducts();renderCart();
