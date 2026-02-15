let selectedCar = null;
let allProducts = [];
let currentSlide = 0;

function moveSlide(n) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    currentSlide = (currentSlide + n + slides.length) % slides.length;
    document.getElementById('main-slider').style.transform = `translateX(-${currentSlide * 100}%)`;
}
setInterval(() => moveSlide(1), 5000);

function listenToProducts() {
    db.collection("products").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateMarqueList(allProducts);
        renderProducts(allProducts);
    });
}

function updateMarqueList(products) {
    const typeFilter = document.getElementById('typeFilter');
    const marques = [...new Set(products.map(p => p.name.split(' ')[0].toLowerCase()))];
    typeFilter.innerHTML = '<option value="all">Toutes les marques</option>';
    marques.forEach(m => {
        const option = document.createElement('option');
        option.value = m;
        option.innerText = m.charAt(0).toUpperCase() + m.slice(1);
        typeFilter.appendChild(option);
    });
}

function renderProducts(products) {
    document.getElementById('product-list').innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" style="cursor:pointer">
            <h4>${p.name}</h4>
            <p><span class="price-val">${p.price}</span> DT/J</p>
            <button class="btn-add" onclick="openReservation('${p.name}', '${p.price}', '${p.options || ""}')">Réserver</button>
        </div>`).join('');
}

function filterProducts() {
    const type = document.getElementById('typeFilter').value.toLowerCase();
    const min = parseFloat(document.getElementById('minPrice').value) || 0;
    const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const filtered = allProducts.filter(p => {
        const nameMatch = type === "all" || p.name.toLowerCase().includes(type);
        const priceMatch = p.price >= min && p.price <= max;
        return nameMatch && priceMatch;
    });
    renderProducts(filtered);
}

function openReservation(name, price, optionsString) {
    selectedCar = { name, price: parseFloat(price) };
    document.getElementById('selected-car-title').innerText = name;
    document.getElementById('unit-price').innerText = selectedCar.price;
    
    const optBox = document.getElementById('options-container');
    if(optionsString && optionsString.trim() !== "") {
        // Correction : On sépare par virgule et on crée une ligne par option
        const arr = optionsString.split(',');
        optBox.innerHTML = '<p style="font-size:0.7rem; font-weight:bold; margin-bottom:5px;">OPTIONS DISPO :</p>' + 
            arr.map(opt => {
                const clean = opt.trim();
                return clean ? `<div style="text-align:left; margin-bottom:3px;"><input type="checkbox" class="car-opt" value="${clean}"> <label style="font-size:0.9rem;">${clean}</label></div>` : '';
            }).join('');
    } else { optBox.innerHTML = ''; }

    document.getElementById('rent-days').value = 1;
    calculateTotal();
    document.getElementById('order-modal').style.display = 'flex';
}

function calculateTotal() {
    let days = parseInt(document.getElementById('rent-days').value) || 1;
    document.getElementById('reservation-total').innerText = (selectedCar.price * days).toFixed(2);
}

async function confirmOrder() {
    const fName = document.getElementById('user-firstname').value.trim();
    const lName = document.getElementById('user-lastname').value.trim();
    const cin = document.getElementById('user-cin').value.trim();
    const tel = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();
    const days = document.getElementById('rent-days').value;
    const total = document.getElementById('reservation-total').innerText;
    const opts = [];
    document.querySelectorAll('.car-opt:checked').forEach(cb => opts.push(cb.value));

    if(!fName || !lName || !cin || !tel || !address) return alert("Remplir tous les champs !");

    try {
        await db.collection("orders").add({
            prenom: fName, nom: lName, cin: cin, tel: tel, adresse: address,
            voitures: selectedCar.name, nb_jours: days, total: total,
            options: opts.join(', '),
            date: new Date().toLocaleString('fr-FR')
        });
        alert("Réservation envoyée ! ✅");
        closeOrderModal();
    } catch (e) { alert(e.message); }
}

function closeOrderModal() { document.getElementById('order-modal').style.display='none'; }
listenToProducts();
