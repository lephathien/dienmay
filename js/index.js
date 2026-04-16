// Kiểm tra trạng thái đăng nhập khi trang load
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Chưa đăng nhập → chuyển về login
        alert("Vui lòng đăng nhập để tiếp tục");
        window.location.href = "./login.html";
    }
});
// Xử lý đăng xuất
document
    .getElementById("logout-btn")
    .addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn đăng xuất")) {
            firebase
                .auth()
                .signOut()
                .then(() => {
                    // Xóa thông tin phiên người dùng khỏi localStorage
                    localStorage.removeItem("user_session");

                    // Chuyển hướng tới trang đăng nhập
                    window.location.href = "./login.html";
                })
                .catch((error) => {
                    console.log("Lỗi đăng xuất:", error.message);
                });
        }
    });

// Hàm load sản phẩm từ Firestore
function loadProducts() {
    const productGrid = document.querySelector("#product-grid");
    let htmls = "";

    db.collection("products")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productId = doc.id;
                htmls += `
                            <div class="product-card">
                                <img src="${product.imageUrl}" alt="${product.name}">
                                <div class="product-info">
                                    <div class="product-name">${product.name}</div>
                                    <div class="product-price">${product.price.toLocaleString('vi-VN')}₫</div>
                                    <button class="add-to-cart-btn" onclick="addToCart('${productId}', '${product.name}', ${product.price}, '${product.imageUrl}')">
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        `;
            });
            productGrid.innerHTML = htmls;
        })
        .catch((error) => {
            console.error("Error fetching products: ", error);
        });
}
loadProducts();
// Giỏ hàng
let cart = JSON.parse(localStorage.getItem('cart')) || [];
// Thêm sản phẩm vào giỏ
function addToCart(id, name, price, imageUrl) {
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
        });
    }

    // Lưu vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Cập nhật hiển thị
    updateCartCount();

    alert('Đã thêm sản phẩm vào giỏ hàng!');
}

// Xóa sản phẩm khỏi giỏ
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Cập nhật số lượng sản phẩm trong giỏ
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Hiển thị giỏ hàng
function displayCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">Giỏ hàng trống</div>';
        cartTotalDiv.innerHTML = 'Tổng: 0₫';
        return;
    }

    let htmls = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        htmls += `
                    <div class="cart-item">
                        <img src="${item.imageUrl}" alt="${item.name}">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price.toLocaleString('vi-VN')}₫ x ${item.quantity}</div>
                            <button class="remove-item" onclick="removeFromCart('${item.id}')">Xóa</button>
                        </div>
                    </div>
                `;
    });

    cartItemsDiv.innerHTML = htmls;
    cartTotalDiv.innerHTML = `Tổng: ${total.toLocaleString('vi-VN')}₫`;
}

// Mở/đóng giỏ hàng
document.querySelector('.cart').addEventListener('click', function () {
    document.getElementById('cart-modal').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
    displayCart();
});

document.getElementById('close-cart').addEventListener('click', function () {
    document.getElementById('cart-modal').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
});

document.getElementById('cart-overlay').addEventListener('click', function () {
    document.getElementById('cart-modal').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
});

// Nút thanh toán
document.getElementById('checkout-btn').addEventListener('click', function () {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    // Lưu đơn hàng vào Firebase
    placeOrder();
});

// Cập nhật số lượng sản phẩm trong giỏ
updateCartCount();
// Hàm đặt hàng và lưu vào Firebase
function placeOrder() {
    // Kiểm tra user session trong localStorage
    const userSessionStr = localStorage.getItem('user_session');

    if (!userSessionStr) {
        alert('Vui lòng đăng nhập để đặt hàng!');
        window.location.href = './login.html';
        return;
    }

    // Parse user session
    const userSession = JSON.parse(userSessionStr);

    // Kiểm tra xem session có hết hạn chưa
    const currentTime = new Date().getTime();
    if (currentTime > userSession.expiry) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('user_session');
        window.location.href = './login.html';
        return;
    }

    // Lấy thông tin người dùng từ session
    const user = userSession.user;

    // Tính tổng tiền
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Tạo đối tượng đơn hàng
    const order = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        products: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            subtotal: item.price * item.quantity
        })),
        totalAmount: total,
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'Đang xử lý',
        createdAt: new Date().toISOString()
    };

    // Lưu vào Firestore
    db.collection('orders')
        .add(order)
        .then((docRef) => {
            console.log('Đơn hàng đã được tạo với ID:', docRef.id);

            // Xóa giỏ hàng
            cart = [];
            localStorage.removeItem('cart');

            // Cập nhật giao diện
            updateCartCount();
            displayCart();

            // Đóng modal giỏ hàng
            document.getElementById('cart-modal').classList.remove('active');
            document.getElementById('cart-overlay').classList.remove('active');

            // Thông báo thành công
            alert(`Đặt hàng thành công!\nMã đơn hàng: ${docRef.id}\nTổng tiền: ${total.toLocaleString('vi-VN')}₫`);
        })
        .catch((error) => {
            console.error('Lỗi khi tạo đơn hàng:', error);
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
        });
}
//