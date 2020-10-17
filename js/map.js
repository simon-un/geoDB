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
document.getElementById('mapid').style.height = String(window.innerHeight - document.getElementById('navbarid').getBoundingClientRect().height)+'px';
var map = L.map('mapid').setView([4.6384979,-74.082547], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker = L.marker([4.6384979,-74.082547]).addTo(map);