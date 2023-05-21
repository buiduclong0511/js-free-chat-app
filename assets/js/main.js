const app = {
    api: {
        // Tạo method get() nhận vào đường dẫn api để không phải viết lại nhiểu logic của fetch API
        get(apiUrl) {
            // Phương thức này trả về 1 promise
            return new Promise((resolve, reject) => {
                fetch(apiUrl).then((response) => {
                    if (!response.ok) {
                        // Promise sẽ reject khi response.ok === false
                        reject({
                            status: response.status,
                            message: response.statusText,
                        });
                    }
                    // Promise sẽ resolve khi response.ok === true
                    response.json().then((data) => resolve(data));
                });
            });
        },
        // Tạo method post() nhận vào apiUrl và body để không phải viết lại nhiểu logic của fetch API
        post(apiUrl, body) {
            // Phương thức này trả về 1 promise
            return new Promise((resolve, reject) => {
                fetch(apiUrl, {
                    method: "POST", // Quy định method thực thi là 'POST'
                    body: JSON.stringify(body), // Chuẩn hóa dữ liệu thành dạng JSON
                    headers: {
                        "Content-type": "application/json", // Cấu hình này để nói cho backend biết là mình đang gửi lên data là JSON
                    },
                }).then((response) => {
                    // Nếu response.ok === false thì sẽ reject (giống method get)
                    if (!response.ok) {
                        reject({
                            status: response.status,
                            message: response.statusText,
                        });
                    }
                    // Nếu response.ok === true thì sẽ resolve (giống method get)
                    response.json().then((data) => resolve(data));
                });
            });
        },
    },
    bindingEventHandlers() {
        // Ràng buộc logic cho nút đăng ký ngay
        // Để khi click vào đăng ký ngay sẽ chuyển sang form register
        const registerNowBtnEle = document.querySelector(".register-now"); // Lấy phần tử button đăng ký ngay
        registerNowBtnEle.onclick = function () {
            // Xóa class hidden của .register-form
            const registerFormEle = document.querySelector(".register-form"); // Truyền đối số thứ nhất là selector của button
            registerFormEle.classList.remove("hidden"); // Khi remove class nhớ chỉ truyền tên class, không truyền selector

            // Thêm class hidden vào .login-form
            const loginFormEle = document.querySelector(".login-form");
            loginFormEle.classList.add("hidden"); // Thêm class hidden để ẩn form login, class này đã được css sẵn trong file css
        };

        // Làm tương tự với nút đăng nhập ngay
        const loginNowBtnEle = document.querySelector(".login-now");
        loginNowBtnEle.onclick = function () {
            // Xóa class hidden của .login-form
            const loginFormEle = document.querySelector(".login-form");
            loginFormEle.classList.remove("hidden");

            // Thêm class hidden vào .register-form
            const registerFormEle = document.querySelector(".register-form");
            registerFormEle.classList.add("hidden");
        };

        // Ràng buộc logic cho event click của nút đăng ký
        // Khi click vào nút đăng ký thì sẽ lấy dữ liệu từ input
        // tạo dữ liệu và gọi api đăng ký
        // sau khi tạo thành công thì se lưu dữ liệu vào localStorage và chuyển sang màn chat
        const registerBtnEle = document.querySelector(".register-button");
        registerBtnEle.onclick = function () {
            const usernameInputEle = document.querySelector(".register-form .username-input");
            const emailInputEle = document.querySelector(".register-form .email-input");
            const passwordInputEle = document.querySelector(".register-form .password-input");

            // Tạo body từ value của các input
            const body = {
                username: usernameInputEle.value.trim(), // .trim() để loại bỏ khoảng trắng đầu cuối
                email: emailInputEle.value.trim(),
                password: passwordInputEle.value.trim(),
            };

            // Thực hiện đăng ký bằng cách gọi api đăng ký và gửi dữ liệu lên thông qua body
            app.api
                .post("http://localhost:3000/api/auth/register", body)
                .then((response) => {
                    // Khi nhận về response thì sẽ lưu dữ liệu vào localStorage
                    window.localStorage.setItem("user", JSON.stringify(response.data));

                    // Xóa value ở trong input
                    usernameInputEle.value = "";
                    emailInputEle.value = "";
                    passwordInputEle.value = "";

                    // Chuyển hướng sang màn chat
                    app.navigateToChat();
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        // Ràng buộc logic cho event click của nút đăng nhập
        // Khi click vào nút đăng ký thì sẽ lấy dữ liệu từ input
        // tạo dữ liệu và gọi api đăng nhập
        // sau khi tạo thành công thì se lưu dữ liệu vào localStorage và chuyển sang màn chat
        const loginBtnEle = document.querySelector(".login-button");
        loginBtnEle.onclick = function () {
            const emailInputEle = document.querySelector(".login-form .email-input");
            const passwordInputEle = document.querySelector(".login-form .password-input");

            // Tạo body bằng value của các input
            const body = {
                email: emailInputEle.value.trim(), // .trim() để loại bỏ khoảng trắng đầu cuối
                password: passwordInputEle.value.trim(),
            };

            // Gọi api đăng nhập và gửi dữ liệu thông qua body
            app.api
                .post("http://localhost:3000/api/auth/login", body)
                .then((response) => {
                    // Sau khi gọi dữ liệu thành công thì sẽ lưu thông tin user vào localStorage
                    window.localStorage.setItem("user", JSON.stringify(response.data));

                    // Reset dữ liệu trong các ô input
                    emailInputEle.value = "";
                    passwordInputEle.value = "";

                    // Chuyển hướng sang màn chat
                    app.navigateToChat();
                })
                .catch((error) => {
                    console.log(error);
                });
        };

        // Ràng buộc logic xử lý cho sự kiện click của nút gửi tin nhắn
        // Khi click thì sẽ lấy dữ liệu message từ input và user.id từ localStorage để tạo body
        // sau đó gọi API tạo message với method POST
        const sendBtnEle = document.querySelector(".send-button");
        sendBtnEle.onclick = function () {
            const messageInputEle = document.querySelector(".message-input");
            const content = messageInputEle.value.trim(); // Lấy content từ message input

            const user = JSON.parse(window.localStorage.getItem("user")); // Lấy thông tin user từ localStorage

            // Tạo body
            const body = {
                content,
                userId: user.id,
            };

            // Gọi api tạo message với method POST
            app.api.post("http://localhost:3000/api/messages", body).catch((error) => {
                console.log(error);
            });

            // Xóa dữ liệu trong message input
            messageInputEle.value = "";
        };

        // Ràng buộc cho nút đăng xuất
        // Khi click thì sẽ xóa dữ liệu trong localStorage và chuyển sang trang login
        const logoutBtnEle = document.querySelector(".logout-button");
        logoutBtnEle.onclick = () => {
            window.localStorage.clear();
            app.navigateToLogin();
        };
    },
    navigateToLogin() {
        // Ẩn chat box
        const chatBoxEle = document.querySelector(".chat-box");
        chatBoxEle.classList.add("hidden");

        // Hiện form box
        const loginBoxEle = document.querySelector(".login-box");
        loginBoxEle.classList.remove("hidden");

        // Hiện form login và ẩn form regsiter để chắc chắn rằng chúng ta đang quay lại màn login
        const loginFormEle = document.querySelector(".login-form");
        const registerFormEle = document.querySelector(".register-form");
        loginFormEle.classList.remove("hidden");
        registerFormEle.classList.add("hidden");

        // Clear tác vụ poll messages
        clearInterval(app.pollId);
    },
    navigateToChat() {
        // Xóa class hidden của .chat-box
        const chatBoxEle = document.querySelector(".chat-box");
        chatBoxEle.classList.remove("hidden");

        // Thêm class hidden vào .login-box
        const loginBoxEle = document.querySelector(".login-box");
        loginBoxEle.classList.add("hidden");

        app.pollId = app.pollMessages();
    },
    // pollId dùng để lưu trữ interval id phục vụ cho việc hủy tác vụ polling message
    // khi chuyển sang màn login, vì ở màn login mình không cần poll message
    pollId: null,
    // pollMessage() là phương thức dùng để tạo tác vụ lấy danh sách các messages từ api, lặp lại sau mỗi 1s
    // Đây là ứng dụng nhỏ mang tính chất demo nên có thể sử dụng polling để liên tục lấy được message mới (realtime)
    // (Trong thực tế không nên sử dụng cách này, vì sẽ gây tốn băng thông không cần thiết)
    pollMessages() {
        // Trả về interval id để lưu lại vào app.pollId
        return setInterval(() => {
            app.api.get("http://localhost:3000/api/messages").then((response) => {
                app.renderMessages(response.data);
            });
        }, 1000);
    },
    // Render messages ra UI
    renderMessages(messages) {
        // Lấy thông tin user đã đăng nhập ở trong localStorage
        const user = JSON.parse(window.localStorage.getItem("user"));

        const html = messages
            .map((message) => {
                // Kiểm tra xem message này có phải là message của mình hay không
                // bằng cách so sánh message.userId (id của người tạo ra message) với user.id (id của người đang đăng nhập)
                const isMyMessage = message.userId === user.id;
                if (isMyMessage) {
                    // Nếu là message của mình thì thêm class me vào message-item
                    return `
                        <div class="message-item me">
                            <div class="message-content">${message.content}</div>
                        </div>
                    `;
                }

                // Nếu là message của người khác thì không cần thêm class me vào
                return `
                    <div class="message-item">
                        <div class="username">${message.user.username}</div>
                        <div class="message-content">${message.content}</div>
                    </div> 
                `;
            })
            .join("");

        const messageListEle = document.querySelector(".message-list");
        messageListEle.innerHTML = html;
    },
    run() {
        // thực thi công việc binding (ràng buộc các logic cho các event)
        app.bindingEventHandlers();

        // Kiểm tra xem trong localStorage đã lưu thông tin user hay chưa, đã đăng nhập hay chưa
        if (window.localStorage.getItem("user")) {
            // Nếu đã đăng nhập thì chuyển sang màn chat
            app.navigateToChat();
        }
    },
};

app.run();
