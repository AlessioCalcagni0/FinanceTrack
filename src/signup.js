function togglePassword() {
  const passwordInput = document.getElementById("password");
  const icon = document.getElementById("togglePasswordIcon");

  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
}


sessionStorage.setItem("firstTime", 1);