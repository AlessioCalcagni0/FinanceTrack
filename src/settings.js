// settings.js — minimal behavior copied from other pages
function goHome(){
  window.location.href = "./homepage.php";
}

function redirect(url){ window.location.href = url; }


// Robust overrides to ensure hamburger works even if some IDs are missing
function openMenu(){
  try {
    var menuContent = document.getElementById("menu-content");
    var backArrow = document.getElementsByClassName("back-arrow")[0];
    var menuBtn = document.getElementById("menu");

    // Hide hero elements if present (wallet page IDs)
    ["image1_303_309","hh","hhs","ww"].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.classList.add("hide-menu");
    });

    if (menuContent){
      menuContent.classList.add("show-menu");
      menuContent.style.display = "block";
    }
    if (backArrow){
      backArrow.classList.add("show-menu");
      backArrow.style.display = "block";
    }
    if (menuBtn){
      menuBtn.style.display = "none";
    }
  } catch(e){
    console.error("openMenu error:", e);
  }
}

function closeMenu(){
  try {
    var menuContent = document.getElementById("menu-content");
    var backArrow = document.getElementsByClassName("back-arrow")[0];
    var menuBtn = document.getElementById("menu");

    ["image1_303_309","hh","hhs","ww"].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.classList.remove("hide-menu");
    });

    if (menuContent){
      menuContent.classList.remove("show-menu");
      menuContent.style.display = "none";
    }
    if (backArrow){
      backArrow.classList.remove("show-menu");
      backArrow.style.display = "none";
    }
    if (menuBtn){
      menuBtn.style.display = "block";
    }
  } catch(e){
    console.error("closeMenu error:", e);
  }
}

// keep redirect helper for SVG tabbar
function redirect(url){ window.location.href = url; }

