document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("loggedInUser");
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if (!loginForm || !emailInput || !passwordInput) {
        console.error("Form or input fields not found! Check HTML IDs.");
        return;
    }

    // Handle form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showToast("error", "Error", "Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const user = await response.json(); 
                console.log(user);
                localStorage.setItem("loggedInUser", user.email);
                localStorage.setItem("UserFName", user.firstName);
                localStorage.setItem("UserLName", user.lastName);
                localStorage.setItem("loggedInUserID", user.id);
                form.reset();
                showToast("success", "Login Succesful!", "Redirecting to your Dashboard.");

                setTimeout(() => {
                    window.location.href = user.userType === "ADMIN" ? "../AdminPanel.html" : "../dashboard.html";
                }, 2000);

            } else {
                const errorData = await response.json();
                console.log(errorData);
                showToast("error", "Login Failed", "Invalid Credentials. Try Again Later");
            }
        } catch (error) {
            console.error(error);
            showToast("error", "Login Failed", "Server error. Try Again Later");
        }
    });
});
