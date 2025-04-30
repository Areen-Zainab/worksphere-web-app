document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem("loggedInUserID") || "";
    const userEmail = localStorage.getItem("loggedInUser") || "";

    if (!userId) {
        showToast("error", "User not found!", "Redirecting to login.");
        setTimeout(() => {
            // window.location.href = "login.html";
        }, 2000);
        return;
    }

    const API_URL = "http://localhost:8080/api/users"; 

    // update info-section
    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const emailInput = document.getElementById("email");
    const dobInput = document.getElementById("dob");
    const genderInput = document.getElementById("gender");
    const saveButton = document.getElementById("save-info");
    const biography = document.getElementById("bio");

    // update password-section
    const choosePictureBtn = document.getElementById("choose-picture-btn");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const updatePasswordButton = document.getElementById("update-password");

    // update pfp-section
    const profilePic = document.getElementById("profile-picture");
    const imageUpload = document.getElementById("image-upload");
    const PFPButton = document.getElementById("save-picture");
    let selectedFile = null;

    // Populate email field from localStorage
    emailInput.value = userEmail;
    emailInput.readOnly = true; // Ensure email is not editable

    // Function to fetch user data and populate fields
    async function fetchUserData() {
        try {
            const response = await fetch(`${API_URL}/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user data");

            const userData = await response.json();
            firstNameInput.value = userData.firstName || "";
            lastNameInput.value = userData.lastName || "";
            dobInput.value = userData.dob || "";
            genderInput.value = userData.gender || "OTHER";
            biography.value = userData.bio || "";

            // Set profile picture if available
            if (userData.profilePicture) {
                profilePic.src = userData.profilePicture;
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }
    fetchUserData();

    // Function to update user data
    async function updateUserData() {
        const updatedData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            dob: dobInput.value,
            gender: genderInput.value,
            bio: biography.value,
        };

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    }
    saveButton.addEventListener("click", updateUserData);

    async function updateUserPassword() {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Validate password inputs
        if (!newPassword || !confirmPassword) {
            alert("Please fill in both fields.");
            return;
        }
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        console.log("here");
        try {
            const response = await fetch(`${API_URL}/${userId}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) throw new Error("Failed to update password");

            alert("Password updated successfully!");
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Failed to update password.");
        }
    }
    updatePasswordButton.addEventListener("click", updateUserPassword);

    choosePictureBtn.addEventListener("click", function () {
        imageUpload.click(); // This will simulate a click on the hidden file input
      });
    // Display selected image instantly before saving
    imageUpload.addEventListener("change", function () {
        if (imageUpload.files && imageUpload.files[0]) {
            const reader = new FileReader();
    
            reader.onload = function (e) {
                profilePic.src = e.target.result; // Show selected image immediately
            };
    
            reader.readAsDataURL(imageUpload.files[0]);
            selectedFile = imageUpload.files[0]; // Store the selected file for later upload
        }
    });

    // Upload profile picture
    async function uploadProfilePicture() {
        if (!selectedFile) {
            alert("Please select an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch(`${API_URL}/${userId}/upload-pfp`, {
                method: "PUT",
                body: formData,
            });

            const imagePath = await response.text();
            if (response.ok) {
                profilePic.src = imagePath; // Update the profile picture
                alert("Profile picture updated successfully!");
            } else {
                alert("Error: " + imagePath);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Failed to upload profile picture.");
        }
    }
    PFPButton.addEventListener("click", uploadProfilePicture);
});
