setupUI()
getUser()
getPosts()
showAlert()
function getCurrentUserId(){
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get("userid")
  return id
}

function getUser() {
  const id = getCurrentUserId();
  axios.get(`${baseUrl}/users/${id}`)
    .then((response) => {
      const user = response.data.data;
      const profileImg = user.profile_image ? user.profile_image : 'imgs/profileImg.png';
      
      document.getElementById("main-details-username").innerHTML = user.username;
      document.getElementById("main-details-secondUsername").innerHTML = user.username;
      document.getElementById("main-details-name").innerHTML = user.name;
      document.getElementById("name-posts").innerHTML = `${user.username}'s`;
      document.getElementById("posts-count").innerHTML = user.posts_count;
      document.getElementById("comments-count").innerHTML = user.comments_count;
      document.getElementById("main-details-img").src = profileImg;
      const currentUser = getCurrentUser(); 
      if (currentUser && currentUser.id === user.id) {
        document.getElementById("add-btnn").style.display = "block";
      } else {
        document.getElementById("add-btnn").style.display = "none";
      }

      setupUI(); 
      getPosts();
    });
}




function getPosts() {
  const id = getCurrentUserId();
  axios.get(`${baseUrl}/users/${id}/posts`)
    .then((response) => {
      const posts = response.data.data;
      document.getElementById("user-posts").innerHTML = ""; 
      document.getElementById("add-btnn").innerHTML = "";

      let addButton = ''; 
      
      let user = getCurrentUser();
      let isMyAcc = user != null && user.id == id;
      if (isMyAcc) {
        addButton = `<i class="bi bi-plus-lg"></i>`;
        document.getElementById("add-btnn").innerHTML = addButton; 
      }

      for (const post of posts) {
        const author = post.author;
        const title = post.title ? post.title : "";
        const username = author.username.length > 20 
          ? `${author.username.slice(0, 20)}...` 
          : author.username;
        const profileImg = author.profile_image ? author.profile_image : 'imgs/profileImg.png';

        let editButtonContent = ``;
        if (user && post.author.id === user.id) {
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
                <span>${author.username}<p>${post.body}</p></span>
                <hr>
                <div class="comments">
                  <span>View all ${post.comments_count} Comments</span>
                </div>
              </div>
            </div>
          </div>`;
        
        document.getElementById("user-posts").innerHTML += content;
      }
    });
}

