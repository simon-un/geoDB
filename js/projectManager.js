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
        dbRt.ref('USERS/' + user.uid).on('value', (snap) => {
            var prIdList = snap.val();
            console.log(prIdList);
            if (prIdList) {
                showProjects(prIdList);
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

let showProjects = (prIdList) => {
    const getPrName = (prId) => {
        dbRt.ref('PROYECTOS/' + prId + '/NAME').once('value').then((snapshot) =>{
            localStorage.setItem(prId, snapshot.val());
        });
    };
    const getUserRol = (prId, userId) => {
        dbRt.ref('PROYECTOS/' + prId + '/USERS/' + userId + '/ROL').once('value').then((snapshot) =>{
            localStorage.setItem(userId+prId, snapshot.val());
        });
    }
    const projects = document.getElementById('projects');
    let rol = 'No definido';
    for (var i in prIdList) {
        getUserRol(prIdList[i], auth.currentUser.uid)
        let userRol = localStorage.getItem(auth.currentUser.uid+prIdList[i]);
        getPrName(prIdList[i])
        let prName = localStorage.getItem(prIdList[i]);
        console.log(userRol);
        switch (userRol) {
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
            <a onclick="projectInfo('${prIdList[i]}', '${rol}', '${prName}')" href="map.html">${prName}</a>
            <br>
            ID del Proyecto: ${prIdList[i]}
            <br>
            Rol: ${rol}
            <br>
            <div style="text-align:right; margin-bottom:5px; margin-right:5px">
                <button type="button" class="btn btn-secondary" id="settings" data-toggle="tooltip"
                    data-placement="left" title="Editar Proyecto" style="padding:0px; border-radius:2px">
                    <img src="./images/settings.png" alt="" style="max-height: 24px; max-width: 24px;"
                    data-toggle="modal" data-target="#editProjectModal" onclick="editProj('${i}')"/>
                </button>
            </div>
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
            <button class="btn btn-secondary btn-sm" onclick="acceptProj('${key}','${obj[key]['FECHA_UNION']}','${obj[key]['ROL']}')" style="margin:5px">Aceptar</button>
            </div>
        </div>`;
    }
}

acceptProj = (key, date, rol) => {

    // Add info of the project to USERS
    dbRt.ref('USERS/' + auth.currentUser.uid).once('value').then((snapshot) => {
        let proyectsId = snapshot.val();
        dbRt.ref('USERS/' + auth.currentUser.uid+String(proyectsId.length)).set(String(key));
    })

    // Add info of the user to PROYECTOS
    dbRt.ref('PROYECTOS/' + key + '/USERS/' + auth.currentUser.uid).set({
        FECHA_UNION: date,
        ROL: rol
    });

    dbRt.ref('WAITING_LIST/' + auth.currentUser.uid + '/' + key).remove()
    // window.location.href = "index.html";
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
    document.getElementById("peopleTable").innerHTML = "";
    document.getElementById("prjName").value = "";
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
    let date = String(new Date());
    dbRt.ref('USERS/' + auth.currentUser.uid + '/PROY/' + prjId).set({
        FECHA_UNION: date,
        NAME: prjName,
        ROL: "admin"
    });

    // Add info of the user to PROYECTOS/ID_PROJ/ID_PERSON
    dbRt.ref('PROYECTOS/' + prjId).set({
        NAME: prjName
    });

    // Add info of the user to PROYECTOS/ID_PROJ/ID_PERSON
    dbRt.ref('PROYECTOS/' + prjId + '/USERS/' + auth.currentUser.uid).set({
        FECHA_UNION: date,
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
    // window.location.href = "index.html"; // Watch this line and delete if data is not updating in slow connections
}

displayMenu = (edit) => {
    document.getElementById("peopleList"+edit).style.display = "block";
}

filterFunction = (edit) => {
    let person = document.getElementById("person"+edit).value;
    let list = document.getElementById("peopleList"+edit);
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
                <div class="personOpt" onclick="addPerson('${user}','${names[i]}','${ids[i]}','${edit}')">
                    ${user}
                </div>`;
            }
        }
    } else {
        list.innerHTML = "";
    }
}

addPerson = (user, name, id, edit) => {
    document.getElementById("peopleTable"+edit).innerHTML += `
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
      <button class="btn btn-outline-secondary" style="height:30px; padding:0px; margin: auto; background-color:#fab2b2; color:black" type="button" onclick="deletePerson('${id}','${'peopleTable'+edit}')">Eliminar</button>
      </div>
      </td>
    </tr>
    `;
    document.getElementById("peopleList").innerHTML = "";
    document.getElementById("person").value = "";
}

deletePerson = (idRow, tableID) => {
    document.getElementById(tableID).childNodes.forEach(row => {
        if (row.id == idRow) {
            document.getElementById(tableID).removeChild(row)
        }
    });
}

editProj = (key) => {

    document.getElementById("peopleTable_edit").innerHTML = "";
    localStorage.prjIdEdit = JSON.stringify(key);
    dbRt.ref('/PUBLIC_USERS/').once('value').then((snapshot) => {
        let users = snapshot.val();
        localStorage.users = JSON.stringify(users);
        let names = users["names"];
        let ids = users["ids"];
        users = users["emails"];
        let list = document.getElementById("peopleList_edit");
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            // Go back and watch this line
            list.innerHTML += `
            <div class="personOpt" onclick="addPerson('${user}','${names[i]}','${ids[i]}','"_edit"')> 
                ${user}
            </div>`
        }
    })
    let users_public = JSON.parse(localStorage.users);

    dbRt.ref('/PROYECTOS/' + key).once('value').then((snapshot) => {
        let prjInfo = snapshot.val();
        document.getElementById('prjName_edit').value = prjInfo['NAME'];
        let users = prjInfo['USERS'];

        for (var userId in users) {
            document.getElementById("peopleTable_edit").innerHTML += `
                <tr id="${userId}">
                    <td scope="row">${users_public["names"][users_public["ids"].indexOf(userId)]}</td>
                    <td>${users_public["emails"][users_public["ids"].indexOf(userId)]}</td>
                    <td>
                    <div class="input-group">
                    <select class="custom-select" id="${userId + 'rol'}">
                    <option value="admin">Administrador</option>
                    <option value="designer">Diseñador</option>
                    <option value="explorer">Explorador</option>
                    <option value="labguy">Laboratorista</option>
                    </select>
                </div>
                </td>
                <td>
                <div class="input-group-append">
                <button class="btn btn-outline-secondary" style="height:30px; padding:0px; margin: auto; background-color:#fab2b2; color:black" type="button" onclick="deletePerson('${userId}','peopleTable_edit')">Eliminar</button>
                </div>
                </td>
                </tr>
                `;
            document.getElementById("peopleList_edit").innerHTML = "";
            document.getElementById("person_edit").value = "";
        }

        for (var userId in users) {
        document.getElementById(userId + 'rol').value = users[userId]['ROL'];
        }
    })
}

editProject = () =>{
    let id = JSON.parse(localStorage.prjIdEdit);
    let prjName = document.getElementById("prjName_edit").value;
    let participants = document.getElementById("peopleTable_edit").childNodes;

    // Implement this better!

    // Add info of the user to PROYECTOS/ID_PROJ/ID_PERSON
    dbRt.ref('PROYECTOS/' + id).update({
        NAME: prjName
    });

    // // Add info of the user to PROYECTOS/ID_PROJ/ID_PERSON
    // dbRt.ref('PROYECTOS/' + id + '/USERS/').remove();

    // participants.forEach((person) => {
    //     if (person.id) {
    //         let rol = String(person.childNodes[5].childNodes[1].childNodes[1].value);
    //         dbRt.ref('WAITING_LIST/' + person.id + '/' + id).set({
    //             FECHA_UNION: String(new Date()),
    //             NAME: prjName,
    //             ROL: rol
    //         });
    //     }
    // });
}