document.addEventListener("DOMContentLoaded", () => {
    const visibilityOptions = document.querySelectorAll('input[name="visibility"]');
    const membersSection = document.querySelector(".members");
    const publicOption = document.querySelector('input[value="public"]');
    const privateOption = document.querySelector('input[value="private"]');

    // Handle visibility change
    visibilityOptions.forEach(option => {
        option.addEventListener("change", () => {
            if (option.value === "private") {
                membersSection.style.display = "none";
            } else {
                membersSection.style.display = "block";
            }
        });
    });

    // Add member functionality
    document.getElementById("add-member").addEventListener("click", () => {
        const name = prompt("Enter Member Name:");
        if (name) {
            const newMember = document.createElement("li");
            newMember.innerHTML = `<img src="./images/default-avatar.jpg" alt="${name}"> ${name}`;
            document.getElementById("members-list").appendChild(newMember);
        }
    });

    function toggleMembers() {
        if (publicOption.checked) {
            membersSection.classList.remove("hidden");
        } else {
            membersSection.classList.add("hidden");
        }
    }

    // Event listeners
    publicOption.addEventListener("change", toggleMembers);
    privateOption.addEventListener("change", toggleMembers);

    // Set initial state
    toggleMembers();
});

