const loginForm = document.querySelector("#login-form");
const inpEmailLogin = document.querySelector("#inp-email");
const inpPwdLogin = document.querySelector("#inp-pwd");
//Đăng nhập với Firebase Auth
function handleLogin(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form
    let email = inpEmailLogin.value;
    let password = inpPwdLogin.value;
    // Kiểm tra các trường có trống không
    if (!email || !password) {
        alert("Vui lòng điền đủ các trường");
        return;
    }
    // Đăng nhập với Firebase Auth
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user; // Lấy thông tin người dùng
            alert("Đăng nhập thành công");
            // Thiết lập phiên hoặc lưu thông tin đăng nhập
            // Tạo đối tượng user session
            const userSession = {
                user: user,
                expiry: new Date().getTime() + 2 * 60 * 60 * 1000, // 2 tiếng
            };
            // Lưu vào localStorage
            localStorage.setItem(
                "user_session",
                JSON.stringify(userSession)
            );
            // Chuyển hướng tới trang chủ sau khi đăng nhập thành công
            if (user.email == "admin@mindx.com") {
                window.location.href = "./admin.html"; // Chuyển hướng tới trang admin
            } else {
                window.location.href = "./index.html"; // Chuyển hướng tới trang chủ
            }
        })
        .catch((error) => {
            console.log("Lỗi đăng nhập:", error.message);
            alert("Mật khẩu không đúng");
        });
}
loginForm.addEventListener("submit", handleLogin);