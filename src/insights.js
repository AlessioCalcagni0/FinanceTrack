function openMenu(){
    document.getElementById("image1_303_309").classList.add("hide-menu");
    document.getElementById("home").classList.add("hide-menu");
    document.getElementById("homes").classList.add("hide-menu");
    document.getElementById("wallets").classList.add("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");

    document.getElementById("menu-content").classList.toggle("show-menu");


}

window.onclick = function(event) {
  if (!event.target.matches('#menu')) {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("home").classList.remove("hide-menu");
    document.getElementById("homes").classList.remove("hide-menu");
    document.getElementById("wallets").classList.remove("hide-menu");

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
    document.getElementById("home").classList.remove("hide-menu");
    document.getElementById("homes").classList.remove("hide-menu");
    document.getElementById("wallets").classList.remove("hide-menu");
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");

}