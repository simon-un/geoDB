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
        document.getElementById('mail').value = user.email;
        if (user.photoURL) {
            document.getElementById('profileImage').src = user.photoURL;
            // console.log(user.photoURL);
            // console.log(user);
        }
        if (user.emailVerified) {
            document.getElementById('emailVer').style.display = 'none';
        }
    } else {
        userUid = null
        loginCheck(user);
    }
})

// Save changes to firestore
document.getElementById('save-changes').addEventListener('click', (evt) => {
    let user = auth.currentUser;
    user.updateProfile({
        displayName: document.getElementById('name').value,
    });
    dbRt.ref('PUBLIC_USERS/'+ auth.currentUser.uid + '/' + 'name').set(document.getElementById('name').value);
    document.getElementById('alert').lastChild.textContent = 'Datos actualizados con éxito!';
    document.getElementById('alert').style.display = 'block';
})

// Simple function to hide the alert
hideAlert = () => {
    document.getElementById('alert').style.display = 'none';
}

// Function to change password via email
changePassword = () => {
    let user = auth.currentUser;
    auth.sendPasswordResetEmail(user.email).then(function () {
        document.getElementById('alert').lastChild.textContent = 'Revisa tu correo ' + String(user.email) + ' y sigue las instrucciones.';
        document.getElementById('alert').style.display = 'block';
    }).catch(function (error) {
        document.getElementById('alert').lastChild.textContent = 'Ocurrio un error, contáctanos con el mensaje: ' + String(error.code);
        document.getElementById('alert').style.display = 'block';
    });
}

// Function to send email verification
sendVerification = () => {
    let user = auth.currentUser;
    user.sendEmailVerification().then(function () {
        document.getElementById('alert').lastChild.textContent = 'Revisa tu correo ' + String(user.email) + ' y sigue las instrucciones.';
        document.getElementById('alert').style.display = 'block';
    }).catch(function (error) {
        document.getElementById('alert').lastChild.textContent = 'Ocurrio un error, contáctanos con el mensaje: ' + String(error.code);
        document.getElementById('alert').style.display = 'block';
    });
}

// Function to dismiss this page and go back
cancel = () => {
    document.getElementById('goback').click();
}

// Changing profile picture
$("#changeImage").click(function (e) {
    $("#imageUpload").click();
});

document.getElementById('profile-container').addEventListener('mouseenter', () => {
    document.getElementById('changeImage').style.display = 'block';
})

document.getElementById('profile-container').addEventListener('mouseleave', () => {
    document.getElementById('changeImage').style.display = 'none';
})

function updateImage() {
    // Create an image
    var file = document.getElementById('imageUpload').files[0];
    console.log(file);
    var img = document.createElement("img");
    // Create a file reader
    var reader = new FileReader();
    // Set the image once loaded into file reader
    reader.onload = function (e) {
        console.log(typeof (e.target.result));

        img.src = e.target.result;
        var canvas = document.createElement("canvas");
        img.onload = () => {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var width = img.width;
            var height = img.height;
            let sx = 0;
            let sy = 0;
            let sw = width;
            let sh = height;

            if (width > height) {
                sx = (width - height) / 2;
                sy = 0;
                sh = height;
                sw = height;
            } else {
                sx = 0;
                sy = (height - width) / 2;
                sh = width;
                sw = width;
            }

            canvas.width = 200;
            canvas.height = 200;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 200, 200);
            var dataurl = canvas.toDataURL("image/jpg");
            document.getElementById('profileImage').src = dataurl;
            canvas.toBlob((blob) => {
                console.log(blob);
                let storageRef = storageFb.ref();
                let imageRef = 'images/' + auth.currentUser.uid + '.jpg'
                var userImagesRef = storageRef.child(imageRef);
                userImagesRef.put(blob).then(function (snapshot) {
                    console.log('Uploaded  the image!');
                    snapshot.ref.getDownloadURL().then(function (downloadURL) {
                        console.log('File available at', downloadURL);
                        let user = auth.currentUser;
                        user.updateProfile({
                            photoURL: downloadURL,
                        });
                    });
                });
            })
        }
    }
    // Load files into file reader
    reader.readAsDataURL(file);
}

$("#imageUpload").change(function () {
    if (this.files && this.files[0] && String(this.files[0].type).match(/image\/.*/)) {
        updateImage(document.getElementById('imageUpload').files[0]);
        document.getElementById('alert').lastChild.textContent = 'Foto actualizada con éxito.';
        document.getElementById('alert').className = "alert alert-success";
        document.getElementById('alert').style.display = 'block';
    } else {
        document.getElementById('alert').lastChild.textContent = 'Por favor sube una imagen válida';
        document.getElementById('alert').className = "alert alert-danger";
        document.getElementById('alert').style.display = 'block';
    }
});