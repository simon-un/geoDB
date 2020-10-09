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
        loggedInForms.forEach(container => {container.style.display = 'block'})

    } else {
        loggedInLinks.forEach(link => {link.style.display = 'none'})
        loggedOutLinks.forEach(link => {link.style.display = 'block'})
        loggedInForms.forEach(container => {container.style.display = 'none'})

    }
}

//SignUp
const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;

    console.log(email)
    console.log(password)

    auth
        .createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            //clear the form
            signupForm.reset()
            $('#signupModal').modal('hide')
            console.log('sign up')
        })
})

//Login
const signinForm = document.querySelector('#signin-form');

signinForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#signin-email').value;
    const password = document.querySelector('#signin-password').value;

    console.log(email)
    console.log(password)

    auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            //clear the form
            signinForm.reset()
            $('#signinModal').modal('hide')
            console.log('sign in correcto')
        })
})

//Logout
const logout = document.querySelector('#logout')

logout.addEventListener('click', e => {
    e.preventDefault()
    auth.signOut().then(() => {
        console.log('Sign out correcto')
    })
})

//Insertar tareas

const taskform = document.querySelector('#task-form');
const taskContainer = document.querySelector('#tasks-container');
var editStatus = false
var id =''
const onGetTasks = (callback) => db.collection(userUid).onSnapshot(callback) //Cada vez que hay cambios actualiza
const deleteTask = id => db.collection(userUid).doc(id).delete()

const saveTask = (title,description) => { // Guarda los datos
    db.collection(userUid).doc().set({
        "title": title,
        "description": description
    })
}

// const getTasks = () => db.collection('tasks').get(); //Carga las tareas de firebase
const getTask = (id) => db.collection(userUid).doc(id).get();
const updateTask = (id, updatedTask) => db.collection(userUid).doc(id).update(updatedTask)

    //Cuando carga la pagina quiero que se muestren las tareas guardadas

window.addEventListener('DOMContentLoaded', async (e) => { 

    
    onGetTasks((querySnapshot) => { // Cada vez que se cambia algo de la db se ejecuta
        taskContainer.innerHTML = '' // Lo pongo en blanco para que no se dupliquen los datos
        querySnapshot.forEach(doc => {

            
            console.log(doc.data())
    
            const task = doc.data();
            task.id = doc.id;

            taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                    <h3 class="h5">${task.title}</h3>
                    <p>${task.description}</p>
                    <div>
                        <button class='btn btn-primary btn-delete' data-id="${task.id}">Delete</button>
                        <button class='btn btn-info btn-edit' data-id="${task.id}">Edit</button>
                    </div> 
                    </div> `;

            const btnsDelete = document.querySelectorAll('.btn-delete')
            btnsDelete.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    // console.log(e.target.dataset['id']) // o .id
                    await deleteTask(e.target.dataset['id'])
                })
            })

            const btnEdit = document.querySelectorAll('.btn-edit')
            btnEdit.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getTask(e.target.dataset['id'])
                    const task = doc.data()

                    editStatus = true
                    id = doc.id
                    console.log('ID', id)

                    taskform['task-title'].value = task.title
                    taskform['task-description'].value = task.description
                    taskform['btn-task-form'].innerText = 'Update'
                })
            })
        })
    })

    


})


taskform.addEventListener('submit', async (e) => {
    e.preventDefault()

    const title = taskform['task-title'];
    const description = taskform['task-description'];

    if (!editStatus){
        await saveTask(title.value, description.value);
    } else {
        await updateTask(id, {
            "title": title.value,
            "description": description.value
        })

        editStatus = false
        id = ''
        taskform['btn-task-form'].innerText = 'Save'

        
    }

    taskform.reset()
    title.focus()
})


//Posts
const postList = document.querySelector('.posts');

const setupPosts = data => {
    if (data.length) {
        let html = '';
        data.forEach(doc => {
            const post = doc.data();
            console.log(post)
            const li = `
                <li style="text-align:center" class='list-group-item list-group-item-action'>
                    <h5>${post.title}</h5>
                    <p style="text-align:justify">${post.description}</p>
                </li>
            `; 
            html += li;
        })
        postList.innerHTML = html;
    } else {
        postList.innerHTML = `<p class="text-center" ><h5>Inicie sesión para mostrar información de sus proyectos</h5></p>
                                <div class="view overlay zoom">
                                    <img src="logo.png" class="img-fluid " alt="smaple image">
                                </div>
        `
    }
};

const dataTitle = document.querySelector('#table-title');
const dataList = document.querySelector('#table-body');

const setupData = (obj) => {
    keys = Object.keys(obj)

    if (keys.length) {
        let html = '';
        keys.forEach(key => {
            const th = `
                <th scope="col" style ="word-break:break-all;">${key}</th>
            `; 
            html += th;
        })
        dataTitle.innerHTML = html;

        html = '';
        Object.keys(obj).forEach(key => {
            console.log(key, obj[key]);

            const td = `
            <td>${obj[key]}</th>
            `; 
            html += td;
          });
          dataList.innerHTML = html;
    } else {
        dataTitle.innerHTML = ''
        dataList.innerHTML = ''
    }
};

//Google Login
const googleButton = document.querySelector('#googleLogin');

googleButton.addEventListener('click', e => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            console.log('Google sign in')
            signinForm.reset()
            $('#signinModal').modal('hide')
        }).catch(error => {
            console.log('mistake')
        })
});

//Facebook Login

const facebookButton = document.querySelector('#facebookLogin')

facebookButton.addEventListener('click', e => {
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            console.log(result)
            signinForm.reset()
            $('#signinModal').modal('hide')
        }).catch(error => {
            console.log(error)
        })
})

//Events
//List data for auth state changes
auth.onAuthStateChanged(user => {
    if (user) {
        userUid = user.uid
        db.collection('posts')
            .get()
            .then((snapshot) => {
                // console.log(snapshot.docs)
                setupPosts(snapshot.docs);
                loginCheck(user);
            })    
            onGetTasks((querySnapshot) => { // Cada vez que se cambia algo de la db se ejecuta
                taskContainer.innerHTML = '' // Lo pongo en blanco para que no se dupliquen los datos
                querySnapshot.forEach(doc => {
        
                    
                    console.log(doc.data())
            
                    const task = doc.data();
                    task.id = doc.id;
        
                    taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                            <h3 class="h5">${task.title}</h3>
                            <p>${task.description}</p>
                            <div>
                                <button class='btn btn-primary btn-delete' data-id="${task.id}">Delete</button>
                                <button class='btn btn-info btn-edit' data-id="${task.id}">Edit</button>
                            </div> 
                            </div> `;
        
                    const btnsDelete = document.querySelectorAll('.btn-delete')
                    btnsDelete.forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            // console.log(e.target.dataset['id']) // o .id
                            await deleteTask(e.target.dataset['id'])
                        })
                    })
        
                    const btnEdit = document.querySelectorAll('.btn-edit')
                    btnEdit.forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const doc = await getTask(e.target.dataset['id'])
                            const task = doc.data()
        
                            editStatus = true
                            id = doc.id
                            console.log('ID', id)
        
                            taskform['task-title'].value = task.title
                            taskform['task-description'].value = task.description
                            taskform['btn-task-form'].innerText = 'Update'
                        })
                    })
                })
            })

            dbRt.ref('ARS43P1').on('value',(snap)=>{
                obj = snap.val(); //equivalente a Dictionary en pyhon
                // var keys = Object.keys(obj); // Obtiene las llaves del objeto
                setupData(obj) 
                console.log(Object.keys(snap.child('ESTRATOS').val()))
              });
    } else {
        userUid = null
        setupPosts([]);
        setupData([]) 
        loginCheck(user);
        // Cada vez que se cambia algo de la db se ejecuta
        taskContainer.innerHTML = '' // Lo pongo en blanco para que no se dupliquen los datos
        }
    })