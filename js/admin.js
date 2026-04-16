//Kiểm tra admin mới được vào
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        if (user.email !== "admin@mindx.com") {
            alert("Bạn không có quyền truy cập trang này");
            window.location.href = "./index.html"; // Chuyển hướng về trang chủ nếu không phải admin
        }
    } else {
        alert("Vui lòng đăng nhập để truy cập trang này");
        window.location.href = "./login.html"; // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
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

// Hiển thị form thêm sản phẩm
document.getElementById('add-form-btn').addEventListener('click', function () {
    const form = document.getElementById('add-product-form');
    form.classList.toggle('active');
});

// Thêm sản phẩm
document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const imageUrl = document.getElementById('product-image').value;

    const productData = {
        name: name,
        price: price,
        imageUrl: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('products').add(productData)
        .then(() => {
            alert('Thêm sản phẩm thành công!');
            document.getElementById('product-form').reset();
            document.getElementById('add-product-form').classList.remove('active');
            loadProducts();
        })
        .catch((error) => {
            console.error('Error adding product: ', error);
            alert('Lỗi khi thêm sản phẩm!');
        });
});

// Xóa sản phẩm
function deleteProduct(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        db.collection('products').doc(productId).delete()
            .then(() => {
                alert('Xóa sản phẩm thành công!');
                loadProducts();
            })
            .catch((error) => {
                console.error('Error deleting product: ', error);
                alert('Lỗi khi xóa sản phẩm!');
            });
    }
}

// Hàm load sản phẩm từ Firestore
function loadProducts() {
    const tableBody = document.querySelector("#product-table-body");
    let htmls = "";

    db.collection("products")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #999;">Chưa có sản phẩm nào</td></tr>';
                return;
            }

            let index = 1;
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                htmls += `
                            <tr>
                                <td style="text-align: center; font-weight: 600;">${index++}</td>
                                <td><img src="${product.imageUrl}" alt="${product.name}"></td>
                                <td>${product.name}</td>
                                <td style="font-weight: 600; color: #667eea;">${product.price.toLocaleString('vi-VN')}₫</td>
                                <td>
                                    <div class="product-actions">
                                        <button class="btn-edit" onclick="editProduct('${doc.id}')">Sửa</button>
                                        <button class="btn-delete" onclick="deleteProduct('${doc.id}')">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        `;
            });

            tableBody.innerHTML = htmls;
        })
        .catch((error) => {
            console.error("Error fetching products: ", error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #d63031;">Lỗi khi tải sản phẩm</td></tr>';
        });
}
loadProducts();
