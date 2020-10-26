const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const loggedInForms = document.querySelectorAll('.formul')
var userUid = null; // Id del usuario para trar info 

const loginCheck = user => {
    if (user) {
        loggedInLinks.forEach(link => {
            link.style.display = 'block'
        })
        loggedOutLinks.forEach(link => {
            link.style.display = 'none'
        })

    } else {
        loggedInLinks.forEach(link => {
            link.style.display = 'none'
        })
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
        loggedInLinks.forEach(link => {
            link.style.display = 'block'
        })
        document.getElementById('name').value = user.displayName;
    } else {
        userUid = null
        loginCheck(user);
    }
})

document.getElementById('save-changes').addEventListener('click', (evt) =>{
    let user = auth.currentUser;
    user.updateProfile({
        displayName: document.getElementById('name').value,
    });
    console.log(user);
})
