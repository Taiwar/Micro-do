// Configure & Initialize Firebase

let database;
let auth;
let listRef;
let memberRef;
let taskRef;

$.getJSON("config.json", function(json) {
    firebase.initializeApp(json);
    database = firebase.database();
    auth = firebase.auth();
    auth.onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            console.log("Logged in");
            $("#login-modal").modal("close");
            if(!auth.currentUser.displayName) {
                $("#username-modal").modal("open");
            }
            $("#todo-container").show();
            listRef = database.ref('lists/' + auth.currentUser.uid);
            memberRef = database.ref('lists/' + auth.currentUser.uid + "/members");
            taskRef = database.ref('lists/' + auth.currentUser.uid + "/tasks");
            taskRef.on('child_added', function(data) {
                console.log("added " + data.key);
                addTaskHtml(data.val(), data.key);
            });
            taskRef.on('child_changed', function(data) {
                console.log("changed");
                console.log(data.val())
            });
            taskRef.on('child_removed', function(data) {
                console.log("removed " + data.key);
                removeTaskHtml(data.key);
            });
        } else {
            console.log("Not logged in");
            $(document).ready(function(){
                $("#login-modal").modal("open");
                $("#todo-container").hide();
            });
        }
    });
});



function signIn() {
    const email = $("#email").val();
    const password = $("#password").val();

    auth.signInWithEmailAndPassword(email, password).catch(e => console.log(e));
}

function signUp() {
    const email = $("#email").val();
    const password = $("#password").val();

    auth.createUserWithEmailAndPassword(email, password).catch(e => {
        console.log(e)
    });
}

function signOut() {
    console.log("Logging out");
    auth.signOut();
}

function setUsername() {
    if (auth.currentUser) {
        auth.currentUser.updateProfile({
            displayName: $('#username').val(),
        }).then(function () {
            $("#username-modal").modal("close");
        }).catch(function (error) {
            console.log(error)
        });
    }
}

function openSettings() {
    $("#settings-modal").modal("open");
}

function addTaskHtml(task, key) {
    const TaskHTML = ({key, text, author}) => `
      <li id="${key}" class="collection-item avatar" hidden>
        <img onclick="removeTask(this)" src="img/ic_done_white.png" alt="" class="z-depth-2 circle blue img-button">
        <span class="title task-text">${text}</span>
        <p class="task-author">${author}</p>
      </li>
    `;
    let newTask = [{ key: key, text: task.text, author: task.author }].map(TaskHTML);
    $("#task-display").append(newTask);
    $("#" + key).fadeIn("slow");
}

function removeTaskHtml(key) {
    let task = $("#" + key);
    task.animate({
        left: "+=1000px",
        opacity: "0"
    }, "slow", e => task.remove());
}

function addTask() {
    if (auth.currentUser) {
        let taskText = $("#task").val();
        if (taskText) {
            let newTaskKey = listRef.child('tasks').push().key;
            let taskData = {
                text: taskText,
                author: auth.currentUser.displayName,
                timestamp: new Date()
            };
            let updates = {};
            updates['tasks/' + newTaskKey] = taskData;
            listRef.update(updates);
        }
    }
}

function removeTask(e) {
    if (auth.currentUser){
        let task = $(e).parent();
        taskRef.child(task.attr("id")).remove();
    }
}

$(document).ready(function(){
    $(".modal").modal();
    $(".modal-sticky").modal({
        dismissible: false,
    });
    $('#task').keypress(e => {
        if (e.which === 13) {
            addTask();
            $('#task').val("");
        }
    });
});
