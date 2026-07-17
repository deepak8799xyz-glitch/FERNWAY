// auth-page.js — handles both the login and register forms (whichever is present).

function afterAuthRedirect() {
  const returnTo = sessionStorage.getItem("voltra_return_to");
  sessionStorage.removeItem("voltra_return_to");
  window.location.href = returnTo || "index.html";
}

function showFormError(message) {
  const el = document.getElementById("form-error");
  el.textContent = message;
  el.classList.add("show");
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await Api.login({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      });
      Api.setToken(token);
      Api.setUser(user);
      showToast(`Welcome back, ${user.name.split(" ")[0]}.`);
      afterAuthRedirect();
    } catch (err) {
      showFormError(err.message);
    }
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await Api.register({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      });
      Api.setToken(token);
      Api.setUser(user);
      showToast(`Welcome to Voltra, ${user.name.split(" ")[0]}.`);
      afterAuthRedirect();
    } catch (err) {
      showFormError(err.message);
    }
  });
}
