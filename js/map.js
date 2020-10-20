// const { auth } = require("firebase-admin");

// const { auth } = require("firebase");

const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const loggedInForms = document.querySelectorAll('.formul')
var userUid = null; // Id del usuario para trar info 

const loginCheck = user => {
    if (user) {
        loggedInLinks.forEach(link => {link.style.display = 'block'})
        loggedOutLinks.forEach(link => {link.style.display = 'none'})

    } else {
        loggedInLinks.forEach(link => {link.style.display = 'none'})
        document.getElementById('goback').click();
    }
}


//Logout
const logout = document.querySelector('#logout')

logout.addEventListener('click', e => {
    e.preventDefault()
    auth.signOut().then(() => {
        // console.log('Sign out correcto')
    })
})


//Events
//List data for auth state changes
auth.onAuthStateChanged(user => {
    if (user) {
        // window.alert("Está logeado")
        loggedInLinks.forEach(link => {link.style.display = 'block'})
    } else {
        userUid = null
        loginCheck(user);
        }
    })

// Starting to work on the map
const mapdiv = document.getElementById('mapid');
const navbar = document.getElementById('navbarid');
const alertnotif = document.getElementById('alert-notif');
const optionsBtn = document.getElementById('sidebar-button');
const mainfo = document.getElementById('maininfo');

navbar.style.height = String(navbar.getBoundingClientRect().height / 2) +'px';
mainfo.style.height = String(navbar.getBoundingClientRect().height) +'px';
mapdiv.style.height = String(window.innerHeight - navbar.getBoundingClientRect().height * 2)+'px';

window.addEventListener('resize', (evt) => {
    mapdiv.style.height = String(window.innerHeight - navbar.getBoundingClientRect().height)+'px';
    if (window.innerWidth < 1300) {
        document.getElementById('welcome-message').style.display = 'none';
    }else{
        document.getElementById('welcome-message').style.display = 'inline';
    }
})

alertnotif.addEventListener('click',()=>{
    alertnotif.style.display = 'none';
})

const map = L.map('mapid').setView([4.6384979,-74.082547], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const marker = L.marker([4.6384979,-74.082547]).addTo(map);

showMsg = (msg, className = 'alert alert-primary') => {
    // Options for className:
    // - alert alert-secondary
    // - alert alert-success
    // - alert alert-danger
    // - alert alert-warning
    // - alert alert-info
    // - alert alert-light
    // - alert alert-dark
    alertnotif.className = className;
    document.getElementById('alertMsgP').innerHTML = msg;
    alertnotif.style.display = 'block';
}

mapdiv.addEventListener('click', ()=>{
    showMsg("Hizo click en el mapa", 'alert alert-info')
    // optionsBtn.style.display = "block";
})

// Working on the side panel
const sidePanel = document.getElementById("mySidebar");
sidePanel.style.height = mapdiv.style.height;

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidebar").style.width = "60%";
    document.getElementById("map-div").style.marginRight = "60%";
    optionsBtn.style.display = "none";
  }
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("map-div").style.marginRight = "0";
    optionsBtn.style.display = "block";
  }


  