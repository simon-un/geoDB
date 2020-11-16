auth.onAuthStateChanged(user => {
    if (user) {
        const projects = document.getElementById('projects');
        projects.style.display = 'block';
        projects.innerHTML = `<h5>Proyectos:</h5>`;
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