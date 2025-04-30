function showToast(type, title, message) {
    const toastContainer = document.getElementById("toast-container");
  
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="message">
        <strong>${title}</strong><br>${message}
      </div>
      <button class="close-btn">&times;</button>
    `;
  
    toastContainer.appendChild(toast);
  
    toast.querySelector(".close-btn").addEventListener("click", () => {
      toast.remove();
    });
  
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
