document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("loggedInUser");

    document.getElementById("signup-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const form = event.target;

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const dob = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value.toUpperCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {            
            showToast("error", "Error", "Passwords do not match. Try again.");
            return;
        }
        const userData = { firstName, lastName, email, dob, gender, password };

        try {
            const response = await fetch("http://localhost:8080/api/users/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                showToast("success", "Signup Successful", "Welcome to WorkSphere. Redirecting to login page...");
                form.reset();
                setTimeout(() => window.location.href = "../login.html", 2000);
            } else {
                const errorData = await response.text();
                showToast("error", "Signuo Failed", "Error: " + errorData);
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("error", "Login Failed", "Server erroe. Try Again Later");
        }
    });
});
