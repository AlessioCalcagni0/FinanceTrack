function goHome(){
    window.location.href="./src/homepage.php";
}

 function redirect(location){
    window.location.href= location;
 }

function openMenu(){
    document.getElementById("image1_303_309").classList.add("hide-menu");
    document.getElementById("hh").classList.add("hide-menu");
    document.getElementById("hhs").classList.add("hide-menu");
    document.getElementById("ww").classList.add("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");
    document.getElementById("menu-content").classList.toggle("show-menu");
}

window.onclick = function(event) {
  if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("hh").classList.remove("hide-menu");
    document.getElementById("hhs").classList.remove("hide-menu");
    document.getElementById("ww").classList.remove("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show-menu')) {
        openDropdown.classList.remove('show-menu');
      }
    }
  }
}

function closeMenu() {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("hh").classList.remove("hide-menu");
    document.getElementById("hhs").classList.remove("hide-menu");
    document.getElementById("ww").classList.remove("hide-menu");
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
}
