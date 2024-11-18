  let body = document.querySelector("body");
  let darkLightIcons = document.querySelectorAll(".darkLight");

  function darkMode() {
    if (localStorage.getItem("mode") === "dark-mode") {
      body.classList.add("dark");
    }

    darkLightIcons.forEach((darkLight) => {
      darkLight.addEventListener("click", () => {
        body.classList.toggle("dark");
        if (!body.classList.contains("dark")) {
          localStorage.setItem("mode", "light-mode");
        } else {
          localStorage.setItem("mode", "dark-mode");
        }
      });
    });
  }
  darkMode();

  function showNav() {
    document.querySelector(".header-2").classList.toggle("active");
  }


  const baseUrl = "https://tarmeezAcademy.com/api/v1"
  let currentPage = 1
  let lastPage = 1

  window.addEventListener("scroll", function(){
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;
    console.log(currentPage,lastPage)
    if(endOfPage && currentPage < lastPage){
      currentPage = currentPage + 1
      getPosts(false, currentPage)
    }
  });
  setupUI()
  getPosts()
  console.log(endOfPage);

  function getPosts(reload = true , page = 1){
    toggleLoader(true)
    axios.get(`${baseUrl}/posts?limit=6&page=${page}`)
      .then((response) => {
        toggleLoader(false)
        const posts = response.data.data
        lastPage = response.data.meta.last_page
        if (reload){
          document.getElementById("posts").innerHTML = ""
        }
        
        for ( const post of posts) {
          const author = post.author
          const profileImg = author.profile_image && Object.keys(author.profile_image).length > 0 ? author.profile_image: 'imgs/profileImg.png';
          const title = post.title ? post.title : "";
          let user = getCurrentUser()
          let isMyPost = user != null && post.author.id == user.id
          let editButtonContent = ``
          const username = author.username.length > 20 
          ? `${author.username.slice(0, 20)}...` 
          : author.username;
          if (isMyPost){
            editButtonContent = `
            <div class="second-holder">
              <div class="btn-group">
              <button type="button" style="border: none; background-color: transparent; color: var(--title-color);" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" style="background-color: var(--box-color); padding:0;">
                <li><a class="dropdown-item" style="color: red; transition:0.3s; padding-top: 10px; padding-bottom: 10px;" href="#" onclick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</a></li>
                <li><a class="dropdown-item" style="color: var(--title-color); transition:0.3s; padding-top: 10px; padding-bottom: 10px;" href="#" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</a></li>
              </ul>
            </div>
            </div>
            `
          }
          let content = `
          <div class="card">
            <div class="card-header">
            <span style="display: flex; justify-content: space-between; width: 100%; margin-left: 0; align-items: center;">
          <div class="first-holder" onclick="userClicked(${author.id})">
          <div class="image">
            <img src="${profileImg}" alt="" id="profileImage" class="image" style="cursor:pointer;">
          </div>
            <span >${username}
            <h3>${title}</h3>
            </span>
            </span>
            <h6><span><i class="bi bi-dot"></i></span>${post.created_at}</h6>
            </div>
            <div class="second-holder">
              ${editButtonContent}
            </div>
            </div>
            
            <div class="card-body" onclick="postClicked(${post.id})" style="cursor:pointer;">
              <div class="image">
                <img src="${post.image}" alt="">
              </div>
              <div class="main-holder">
                <div class="icons-holder">
                  <div class="icons">
                    <i class='bx bx-heart'></i>
                    <i class='bx bx-message-rounded'></i>
                    <i class="bi bi-send"></i>
                  </div>
                  <i class="bi bi-bookmark"></i>
                </div>
                <span>${username}<p>${post.body}</p></span>
                <hr>
                <div class="comments">
                  <span>View all ${post.comments_count} Comments</span>
                </div>
              </div>
            </div>
          </div>`
          document.getElementById("posts").innerHTML += content
        }
      })
  }


  function profileClicked(){
    const user = getCurrentUser()
    const userId = user.id
    window.location = `profile.html?userid=${userId}`
  }
  
    function userClicked(userId){
      window.location = `profile.html?userid=${userId}`
    }

  function loginBtnClicked() {
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;
    const params = {
      "username": username,
      "password": password
    };
    const url = `${baseUrl}/login`;
    toggleLoader(true)
    axios.post(url, params)
      .then((response) => {
        toggleLoader(false)
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        window.location.href = "index.html";
        showAlert("Login Successfully","success")
      }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, "danger");
      }).finally(()=>{
        toggleLoader(false)
      })
  }
  function registerBtnClicked() {
    const username = document.getElementById("register-username-input").value;
    const name = document.getElementById("register-name-input").value;
    const password = document.getElementById("register-password-input").value;
    const image = document.getElementById("post-image-input").files[0]; 

    let formData = new FormData();
    formData.append("username", username);
    formData.append("name", name);
    formData.append("password", password);
    formData.append("image", image); 

    const url = `${baseUrl}/register`;
    toggleLoader(true)
    axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {
        toggleLoader(false)
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        window.location.href = "index.html";
        showAlert("New User Registered Successfully", "success");
      })
      .catch((error) => {
        const message = error.response.data.message;
        showAlert(message, "danger");
      }).finally(()=>{
        toggleLoader(false)
      })
  }

  function logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setupUI();
    window.location.href = "index.html";
    showAlert("Logged out Successfully","success");
  }

  function createNewPostClicked() {
    let postId = document.getElementById("post-id-input").value;
    let isCreate = postId == null || postId == "";
    const title = document.getElementById("create-post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0];

    let formData = new FormData();
    formData.append("body", body);
    formData.append("title", title);
    formData.append("image", image);

    let url = `${baseUrl}/posts`;
    
    const token = localStorage.getItem("token");
    const headers = {
        "authorization": `Bearer ${token}`
    };

    if (!isCreate) { 
        formData.append("_method", "put");
        url = `${baseUrl}/posts/${postId}`; 
    }else{
      url = `${baseUrl}/posts`;
    }
    toggleLoader(true)
    axios.post(url, formData, { headers: headers })
        .then((response) => {
          toggleLoader(false)
            const modal = document.getElementById("create-post-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            getPosts();
            showAlert("The Post Has Been Created Successfully","success");
        })
        .catch((error) => {
            const message = error.response.data.message;
            showAlert(message,"danger");
        }).finally(()=>{
        toggleLoader(false)
      })
}


  document.addEventListener("DOMContentLoaded", function () {
    setupUI();
    getPosts();
  });
  
  function setupUI() {
    const token = localStorage.getItem("token");
    const btnsHolder = document.getElementById("buttons-holder");
    const logoutBtn = document.getElementById("logout-btn");
    const addBtn = document.getElementById("add-btn")
    const headerLogin = document.getElementById("header-login")
    const headerLogout = document.getElementById("header-logout")
    const side = document.getElementById("side")
    const follow = document.getElementById("follow")
    const hiddenHeader = document.getElementById("hidden-header")
    if (!btnsHolder || !headerLogin || !headerLogout || !side) {
      console.error("One or more UI elements are missing.");
      return; 
    }
    if(token == null){
      if(addBtn != null ) {
        addBtn.style.display = "none";
      }
      btnsHolder.style.visibility = "visible";
      headerLogin.style.display = "none";
      side.style.display = "none";
      follow.style.display = "none";
      hiddenHeader.style.display = "none";
    }
    else{ 
      btnsHolder.style.visibility = "hidden";
      headerLogout.style.display = "none";
      const user = getCurrentUser()
      document.getElementById("story-pic").src = user.profile_image
      document.getElementById("profile-pic").src = user.profile_image
    }
  }
    setupUI();


function showAlert(customMessage, type = "success") {
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    if (!alertPlaceholder) {
        console.error("Alert placeholder not found in the DOM");
        return;
    }
    const alert = (message, type) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');
        alertPlaceholder.append(wrapper);
    };
    alert(customMessage, type);
}


  function getCurrentUser() {
    let user = null
    const storageUser = localStorage.getItem("user")
    if(storageUser != null){
      user = JSON.parse(storageUser)
    }
    return user
  }

  function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`;
  }
  function editPostBtnClicked(postObject){
    let post =JSON.parse(decodeURIComponent(postObject))
    document.getElementById("post-id-input").value = post.id
    document.getElementById("post-modal-title").innerHTML="Edit Post"
    document.getElementById("postModalSubmit").innerHTML="Update"
    document.getElementById("create-post-title-input").value = post.title
    document.getElementById("post-body-input").value = post.body 
    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"),{})
    postModal.toggle()
  }
  
  function deletePostBtnClicked(postObject){
    let post =JSON.parse(decodeURIComponent(postObject))
    document.getElementById("delete-post-id-input").value = post.id
    let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"),{})
    postModal.toggle()
  }

  function confirmPostDelete() {
    const postId = document.getElementById("delete-post-id-input").value
    const url = `${baseUrl}/posts/${postId}`
    const token = localStorage.getItem("token");
    const headers = {
      "authorization": `Bearer ${token}`
    }
    axios.delete(url, { headers: headers })
      .then((response) => {
        const modal = document.getElementById("delete-post-modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        getPosts()
        showAlert("The Post Has Been Deleted Successfully","success")
      })
      .catch((error) => {
        const message = error.response.data.message
        showAlert(message,"danger")
      })
  }
  function addBtnClicked() {
    document.getElementById("post-id-input").value = ""
    document.getElementById("post-modal-title").innerHTML="Create A New Post"
    document.getElementById("postModalSubmit").innerHTML="Create"
    document.getElementById("create-post-title-input").value = ""
    document.getElementById("post-body-input").value = ""
    let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"),{})
    postModal.toggle()
  }

  function toggleLoader(show = true) { 
    if (show){
      document.getElementById("loader").style.visibility='visible'
    }else{
      document.getElementById("loader").style.visibility='hidden'
    }
  }

