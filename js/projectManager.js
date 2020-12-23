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
        
        dbRt.ref('WAITING_LIST/' + user.uid).on('value', (snap) => {
            var projects_waiting = snap.val();
            if (projects_waiting) {
                showProjectsWaiting(projects_waiting);
            }
        })
        dbRt.ref('USERS/' + user.uid + '/PROY').on('value', (snap) => {
            var obj = snap.val();
            if (obj) {
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
            <a onclick="projectInfo('${key}', '${rol}', '${obj[key]['NAME']}')" href="map.html">${obj[key]['NAME']}</a>
            <br>
            <a onclick="projectInfo('${key}', '${rol}', '${obj[key]['NAME']}')" href="sheet.html">Editar información</a>
            <br>
            ID del Proyecto: ${key}
            <br>
            Rol: ${rol}
        </div>`;
    }
}

showProjectsWaiting = (obj) => {
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
        <div class="project_wait">
            <a>${obj[key]['NAME']}</a>
            <br>
            ID del Proyecto: ${key}
            <br>
            Rol: ${rol}
            <br>
            <div style="text-align:right">
            <button class="btn btn-secondary btn-sm" onclick="rejectProj('${key}')" style="margin:5px; margin-right:0px; background-color: rgb(175, 173, 173)">Rechazar</button>
            <button class="btn btn-secondary btn-sm" onclick="acceptProj('${key}','${obj[key]['NAME']}','${obj[key]['FECHA_UNION']}','${obj[key]['ROL']}')" style="margin:5px">Aceptar</button>
            </div>
        </div>`;
    }
}

acceptProj = (key, name, date, rol) => {
    console.log(key);
    dbRt.ref('USERS/' + auth.currentUser.uid + '/PROY/' + key).set({
        FECHA_UNION: date,
        NAME: name,
        ROL: rol
    });


    dbRt.ref('WAITING_LIST/' + auth.currentUser.uid + '/' + key).remove()
    window.location.href = "index.html";
}

rejectProj = (key) => {
    dbRt.ref('WAITING_LIST/' + auth.currentUser.uid + '/' + key).remove()
    window.location.href = "index.html";
}

var projectInfo = (key, rol, name) => {
    sessionStorage.setItem('currentProject', key);
    sessionStorage.currentRol = rol;
    sessionStorage.currentProjName = name;
}

const newProject = () => {
    console.log('New Project');
    getUniqueId();
    dbRt.ref('/PUBLIC_USERS/').once('value').then((snapshot) => {
        let users = snapshot.val();
        localStorage.users = JSON.stringify(users);
        users = users["emails"];
        let list = document.getElementById("peopleList");
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            list.innerHTML += `
            <div class="personOpt" onclick="addPerson()>
                ${user}
            </div>`
        }
        console.log(users);
    })
}


function getUniqueId() {
    document.getElementById("prjId").value = String(Math.floor(Math.random() * Date.now()));
}

createProject = () => {
    let prjName = document.getElementById("prjName").value;
    let prjId = document.getElementById("prjId").value;
    let participants = document.getElementById("peopleTable").childNodes;
    dbRt.ref('USERS/' + auth.currentUser.uid + '/PROY/' + prjId).set({
        FECHA_UNION: String(new Date()),
        NAME: prjName,
        ROL: "admin"
    });
    participants.forEach((person) => {
        if (person.id) {
            let rol = String(person.childNodes[5].childNodes[1].childNodes[1].value);
            dbRt.ref('WAITING_LIST/' + person.id + '/' + prjId).set({
                FECHA_UNION: String(new Date()),
                NAME: prjName,
                ROL: rol
            });
        }
    });
    window.location.href = "index.html"; // Watch this line and delete if data is not updating in slow connections
}

displayMenu = () => {
    document.getElementById("peopleList").style.display = "block";
}

// document.getElementById("prjName").addEventListener("focusin", () => {
//     document.getElementById("peopleList").style.display = "none";
// })

filterFunction = () => {
    let person = document.getElementById("person").value;
    let list = document.getElementById("peopleList");
    if (person != "" && person != "@" && person != ".") {
        let users = JSON.parse(localStorage.users);
        names = users["names"];
        ids = users["ids"];
        users = users["emails"];
        list.innerHTML = "";
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (String(user).includes(String(person))) {
                list.innerHTML += `
                <div class="personOpt" onclick="addPerson('${user}','${names[i]}','${ids[i]}')">
                    ${user}
                </div>`;
            }
        }
    } else {
        list.innerHTML = "";
    }
}

addPerson = (user, name, id) => {
    document.getElementById("peopleTable").innerHTML += `
    <tr id="${id}">
        <td scope="row">${name}</td>
        <td>${user}</td>
        <td>
        <div class="input-group">
        <select class="custom-select" id="inputGroupSelect04">
          <option selected>Elegir...</option>
          <option value="admin">Administrador</option>
          <option value="designer">Diseñador</option>
          <option value="explorer">Explorador</option>
          <option value="labguy">Laboratorista</option>
        </select>
      </div>
      </td>
      <td>
      <div class="input-group-append">
      <button class="btn btn-outline-secondary" style="height:30px; padding:0px; margin: auto; background-color:#fab2b2; color:black" type="button" onclick="deletePerson('${id}')">Eliminar</button>
      </div>
      </td>
    </tr>
    `;
    document.getElementById("peopleList").innerHTML = "";
    document.getElementById("person").value = "";
}

deletePerson = (idRow) => {
    document.getElementById("peopleTable").childNodes.forEach(row => {
        if (row.id == idRow) {
            document.getElementById("peopleTable").removeChild(row)
        }
    });
}