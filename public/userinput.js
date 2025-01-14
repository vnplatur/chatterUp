function toggleForm(userType) {
  const newUserFields = document.getElementById("new-user-fields");
  const existingUserFields = document.getElementById("existing-user-fields");
  const newUserBtn = document.getElementById("new-user-btn");
  const existingUserBtn = document.getElementById("existing-user-btn");
  const usernameInput = document.getElementById("username");
  const imageInput = document.getElementById("image");
  const existingUsernameInput = document.getElementById("existing-username");

  if (userType === "new") {
    newUserFields.style.display = "block";
    existingUserFields.style.display = "none";
    newUserBtn.classList.add("active");
    existingUserBtn.classList.remove("active");

    usernameInput.required = true;
    imageInput.required = true;
    existingUsernameInput.required = false;
  } else {
    newUserFields.style.display = "none";
    existingUserFields.style.display = "block";
    newUserBtn.classList.remove("active");
    existingUserBtn.classList.add("active");

    usernameInput.required = false;
    imageInput.required = false;
    existingUsernameInput.required = true;
  }
}

document
  .getElementById("entry-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      const formData = new FormData();
      const room = document.getElementById("room").value;
      let username, url;
      if (
        document.getElementById("new-user-btn").classList.contains("active")
      ) {
        username = document.getElementById("username").value;
        const imageUrl = document.getElementById("image");
        url = "http://127.0.0.1:3000/api/users/";
        formData.append("imageUrl", imageUrl.files[0]); // Attach the file
      } else {
        url = "http://127.0.0.1:3000/api/users/findUser/";
        username = document.getElementById("existing-username").value;
      }

      formData.append("username", username);
      formData.append("room", room);

      // Send data to the server
      const response = await fetch(url, {
        method: "post",
        body: formData,
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message == "exist") {
          alert(`user with name: ${username} already exist, Please try again.`);
          document
            .getElementById("entry-form")
            .scrollIntoView({ behavior: "smooth" });
          return;
        }

        if (result.message == "noUser") {
          alert(`user with name: ${username} do not exist, Please try again.`);
          document
            .getElementById("entry-form")
            .scrollIntoView({ behavior: "smooth" });
          return;
        }

        console.log("User saved:", result.user);

        // Redirect to chat page
        localStorage.setItem("username", username);
        localStorage.setItem("room", room);
        localStorage.setItem("imageUrl", result.user.imageUrl);

        window.location.href = "chatApp.html";
      } else {
        const errorData = await response.json();
        console.error("Error saving user:", errorData);
        alert("Failed to save user. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
