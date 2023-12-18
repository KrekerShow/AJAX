function addEditDeleteButtons(taskElem) {
    var editBtn = $('<span>')
        .addClass('edit-btn')
        .text('🖋️')
        .on('click', function() {
            var currentTitle = taskElem.find('span.task-text').text();
            var currentBody = taskElem.find('div.task-body').text();
            var updatedTask = prompt('Edit Task:', currentTitle + '\n\n' + currentBody);

            if (updatedTask !== null) {
                var updatedTaskArray = updatedTask.split('\n\n');
                var updatedTitle = updatedTaskArray[0];
                var updatedBody = updatedTaskArray[1] || '';
                taskElem.find('span.task-text').text(updatedTitle);
                taskElem.find('div.task-body').text(updatedBody);
            }
        });

    var deleteBtn = $('<span>')
        .addClass('edit-btn')
        .text('💀')
        .on('click', function() {
            if (taskElem.hasClass('important')) {
                // If the task is important, show the delete confirmation modal
                $('#deleteModal').show();

                // Handle buttons in the modal
                $('#confirmDelete').on('click', function() {
                    taskElem.remove();
                    $('#deleteModal').hide();
                });

                $('#cancelDelete').on('click', function() {
                    $('#deleteModal').hide();
                });
            } else {
                taskElem.remove();
            }
        });

    taskElem.append(editBtn).append(deleteBtn);
}

function fetchUserData(userId, callback) {
    var userUrl = 'https://jsonplaceholder.typicode.com/users/' + userId;

    $.ajax({
        url: userUrl,
        method: 'get',
        dataType: 'json',
        success: function(user) {
            callback(user.name);
        },
        error: function() {
            callback('Unknown User');
        }
    });
}

function showError(message) {
    $('#userIdError').text(message);
}

$('#taskForm').on('submit', function(e) {
    e.preventDefault();

    var title = $('#title').val();
    var body = $('#body').val();
    var userId = $('#userId').val();
    var isImportant = $('#important').prop('checked');

    if (userId > 0 && userId < 11) {
        showError('');
    } else {
        showError('Enter a valid user ID (1-10).');
        return;
    }

    var taskElem = $('<div>')
        .addClass('task')
        .append('<input type="checkbox">')
        .append('<span class="task-text">' + title + '</span>')
        .append('<div class="task-body">' + body + '</div>')
        .append('<div class="creator"></div>');

    if (isImportant) {
        taskElem.addClass('important');
        taskElem.find('.task-text').prepend('⭐ '); // Звездочка
        taskElem.find('.task-text').css('color', 'red'); // Красный цвет
    }

    addEditDeleteButtons(taskElem);

    if (isImportant) {
        // If the task is important, add it to the beginning of the list
        $('#tasks').prepend(taskElem);
    } else {
        // If the task is not important, add it to the end of the list
        $('#tasks').append(taskElem);
    }

    $.ajax({
        url: 'https://jsonplaceholder.typicode.com/todos',
        method: 'post',
        dataType: 'json',
        data: {
            title: title,
            body: body,
            userId: userId,
            completed: false
        },
        success: function(response) {
            fetchUserData(userId, function(creatorName) {
                taskElem.find('.creator').text('Created by: ' + creatorName);
            });

            console.log(response);
            console.log(JSON.stringify(response));
        },
    });
});

$('body').on('click', 'input[type="checkbox"]', function() {
    var task = $(this).parents('.task');

    if(task.hasClass('strikeout')) {
        task.removeClass('strikeout');
        if (task.hasClass('important')) {
            // If the task is important, move it back to the beginning of the list
            task.prependTo($('#tasks'));
        } else {
            // If the task is not important, move it back to the end of the list
            task.appendTo($('#tasks'));
        }
    } else {
        task.addClass('strikeout');
        task.appendTo($('#done'));
    }
});

function toggleTheme() {
    $('body').toggleClass('light-mode dark-mode');
    var currentTheme = $('body').hasClass('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    if (currentTheme === 'light') {
        $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('background-color', '#fff');
        $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('color', '#000');
    } else {
        $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('background-color', '#333');
        $('#modal-btn.cancel, #taskForm button, #checkbox, #title, #body, #userId, #important').css('color', '#fff');
    }
}

// Check the saved theme in localStorage when the page loads
var savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    $('body').addClass(savedTheme + '-mode');
    if (savedTheme === 'dark') {
        $('#modal-btn.cancel, #taskForm button, #title, #body, #userId, #important').css('background-color', '#333');
        $('#modal-btn.cancel, #taskForm button, #title, #body, #userId, #important').css('color', '#fff');
    }
}
