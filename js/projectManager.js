auth.onAuthStateChanged(user => {
    if (user) {
        const projects = document.getElementById('projects');
        projects.style.display = 'block';
        projects.innerHTML = `
            <h5>Proyectos:</h5>
            <div style="width:100%; margin-bottom:5px;">
            <div id="new-pr" onclick="newProject()" data-toggle="modal" data-target="#newProjectModal">Nuevo Proyecto</div>
            </div>
            <br>`;
        dbRt.ref('USERS/' + user.uid + '/PROY').on('value', (snap) => {
            var obj = snap.val();
            if (obj) {
                // console.log(obj);
                showProjects(obj);
            } else {
                projects.innerHTML += `
                <h6>No estas asociado a ningún proyecto. Si crees que es un error contacta a tu organización</h6>
                <br>`;
            }
        })


    } else {
        document.getElementById('projects').style.display = 'none';
    }
})

showProjects = (obj) => {
    const projects = document.getElementById('projects');
    let rol = 'No definido';
    for (var key in obj) {
        switch (obj[key]['ROL']) {
            case 'admin':
                rol = 'Administrador'
                break;
            case 'designer':
                rol = 'Diseñador'
                break;
            case 'explorer':
                rol = 'Explorador'
                break;
            case 'labguy':
                rol = 'Laboratorista'
                break;           
            default:
                break;
        }
        projects.innerHTML += `
        <div class="project">
            <a onclick="projectMap('${key}', '${rol}', '${obj[key]['NAME']}')" href="map.html">${obj[key]['NAME']}</a>
            <br>
            ID del Proyecto: ${key}
            <br>
            Rol: ${rol}
        </div>`;
    }
}

var projectMap = (key, rol, name) => {
    sessionStorage.setItem('currentProject', key);
    sessionStorage.currentRol = rol;
    sessionStorage.currentProjName = name;
}

const newProject = () =>{
    console.log('New Project');
    getUniqueId();
    dbRt.ref('/PUBLIC_USERS/').once('value').then((snapshot) => {
        let users = snapshot.val();
    })
    
}

function getUniqueId() {
    document.getElementById("prjId").value = String(Math.floor(Math.random() * Date.now()));
}

createProject = () =>{
    let prjName = document.getElementById("prjName").value;
    let prjId = document.getElementById("prjId").value;
    dbRt.ref('USERS/'+auth.currentUser.uid+'/PROY/'+prjId).set({
        FECHA_UNION: String(new Date()),
        NAME: prjName,
        ROL: "admin"
    });
}