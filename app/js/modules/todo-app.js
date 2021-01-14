import TodoItem from './TodoItem';
import Firebase from '../firebase/index';

const firebase = new Firebase();

document.addEventListener("DOMContentLoaded", app);

function app() {
    const FIREBASE_POST = 'todo';
    const LOADING = 'loading';
    const DATA_COMPLETED = 'data-completed';

    let isLoadTodo = false;

    const $todoApp = document.querySelector('.togo-app');

    /* modal */
    const $modal = document.querySelector("#modal");
    const $btnOpenModal = $todoApp.querySelectorAll('.js-open-modal');
    const $btnCloseModal = $modal.querySelector(".js-modal-close");

    const $fieldTodoText = $modal.querySelector('.form input[name=task]');
    const $btnCreateTodo = $modal.querySelector('.js-create-todo');
    /**/

    /* notification */
    const $notification = document.querySelector('.js-notification');
    const $notificationText = $notification.querySelector('.js-notification-message');
    /**/
    
    const $todoList = $todoApp.querySelector('.js-todo-list');
    const classTodoItem = '.js-todo-item';

    const classErrorMessage = '.task-not-found';
    
    /* todo components class */
    const classTodoBtnEdit = '.js-btn-todo-edit';
    const classTodoBtnRemove = '.js-btn-todo-remove';
    const classTodoBtnCheck = '.js-btn-todo-checkbox';
    const classTodoTextarea = '.js-todo-textarea';
    const classTodoText = '.js-todo-item-text';
    /**/

    let $todoItems = null;
    let arrayTodo = [];

    /* top counters for display */
    const $counters = {
        total: $todoApp.querySelector('.js-count-todo-total'),
        active: $todoApp.querySelector('.js-count-todo-active'),
        completed: $todoApp.querySelector('.js-count-todo-completed'),
    }

    loadTodo();

    /* Modal Functions */
    $btnOpenModal.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            $modal.classList.add('show-modal');
        });
    })

    $btnCloseModal.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal();
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function closeModal() {
        if($fieldTodoText.value === '') {
            $btnCreateTodo.setAttribute('disabled', '');
        }

        modal.classList.remove('show-modal');
    }
    /* */

    /* Notification Functions */
    function showNotification(message, state) {
        $notification.classList.add(state);
        $notification.classList.add('show');
        $notificationText.innerHTML = message;

        setTimeout(function() {
            $notification.classList.remove('show');
        }, 1800);

        setTimeout(function() {
            $notificationText.innerHTML = '';
            $notification.classList.remove(state);
        }, 2300)
    }
    /* */

    $btnCreateTodo.addEventListener('click', function(e) {
        e.preventDefault();
        createTodo();
    })

    $fieldTodoText.addEventListener('input', function(e) {
        const inputValue = e.target.value;

        if(inputValue !== '') {
            $btnCreateTodo.removeAttribute('disabled');
        } else {
            $btnCreateTodo.setAttribute('disabled', '');
        }
    })

    async function init() {
        $todoItems.forEach(function(todo) {
            const idTodo = todo.getAttribute('id');
            const $btnEdit = todo.querySelector(classTodoBtnEdit);
            const $btnCheck = todo.querySelector(classTodoBtnCheck);
            const $btnRemove = todo.querySelector(classTodoBtnRemove);
            const $textareaTodo = todo.querySelector(classTodoTextarea);
            const $textTodo = todo.querySelector(classTodoText);

    
            $btnCheck.addEventListener('click', function(e) {
                const targetObject = arrayTodo.filter((item) => item.key === idTodo);
                let isCheck = this.checked;
                
                checkTodo.bind(todo, 
                    {
                        ...targetObject[0],
                        completed: isCheck,
                    }, 
                    {
                        checkboxTodo: $btnCheck,
                    }
                )();
            })

            $btnRemove.addEventListener('click', function(e) {
                e.preventDefault();
                removeTodo.bind(todo, idTodo)();
            })

            $btnEdit.addEventListener('click', function(e) {
                e.preventDefault();
                const targetObject = arrayTodo.filter((item) => item.key === idTodo);

                editTodo.bind(todo, targetObject[0], {
                    btnEdit: $btnEdit,
                    textareaTodo: $textareaTodo,
                    textTodo: $textTodo,
                })();
            })
        })
    }

    async function loadTodo() {
        const data = await firebase.loadPosts(FIREBASE_POST);
        const loader = document.querySelector('#loader');

        if(!data) {
            loader.classList.add('hidden');
            $todoList.insertAdjacentHTML('afterbegin', taskNotFound());
            return;
        };

        isLoadTodo = true;
        arrayTodo = data;

        $counters.total.innerHTML = data.length;

        const activeArray = getCompletedPosts(arrayTodo, false);
        $counters.active.innerHTML = activeArray.length;

        const completedArray = getCompletedPosts(data);
        $counters.completed.innerHTML = completedArray.length;
       
        data.forEach(function(post) {
            const todo = new TodoItem(post);
            $todoList.insertAdjacentHTML('afterbegin', todo.render());
        })

        $todoItems = $todoApp.querySelectorAll(classTodoItem);

        loader.classList.add('hidden');
        init();
    }

    /* CRUD Functions */
    async function createTodo() {
        const errorMsg = document.querySelector(classErrorMessage);
        const currentDate = getCurrentDate(new Date());
        
        try {
            startLoading.bind($btnCreateTodo)();
            const key = await firebase.createPostAndGetData(FIREBASE_POST, {
                date: currentDate,
                text: $fieldTodoText.value,
                completed: false,
            })

            if(key) {
                endLoading.bind($btnCreateTodo)();
            }

            const todo = new TodoItem({key, date: currentDate, text: $fieldTodoText.value, completed: false});
            $todoList.insertAdjacentHTML('afterbegin', todo.render());

            arrayTodo.push({...todo});

            const activeArray = getCompletedPosts(arrayTodo, false);

            $counters.active.innerHTML = activeArray.length;

            $counters.total.innerHTML = arrayTodo.length;
            $todoItems = $todoApp.querySelectorAll(classTodoItem);

            $fieldTodoText.value = '';

            if(errorMsg !== null) {
                errorMsg.remove();
            }

            showNotification('Todo create - Succsessfull', 'succsess');
            closeModal();
            init();

        } catch(e) {
            showNotification('Todo create - Error', 'error');
            closeModal();
            endLoading();
            console.log(e);
        }
    }

    async function removeTodo(key) {
        const errorMsg = document.querySelector(classErrorMessage);
        let succsessTodo = [];

        try {
            await firebase.removePost(FIREBASE_POST, key);

            this.remove();

            arrayTodo = arrayTodo.filter((todo) => todo.key !== key);
            const activeArray = getCompletedPosts(arrayTodo, false);
            succsessTodo = getCompletedPosts(arrayTodo);

            $counters.active.innerHTML = activeArray.length;
            $counters.total.innerHTML = arrayTodo.length;
            $counters.completed.innerHTML = succsessTodo.length;

            if(arrayTodo.length === 0) {
                $todoList.insertAdjacentHTML('afterbegin', taskNotFound());
            }

            showNotification('Todo remove - Succsessfull', 'succsess');
        } catch(e) {
            showNotification('Todo create - Error', 'error');
        }
    }

    async function checkTodo(todoObj, domElements) {
        const { checkboxTodo } = domElements;

        let succsessTodo = [];

        const targetTodo = arrayTodo.find((todo) => todo.key === todoObj.key);

        try {
            if(todoObj.completed) {
                this.setAttribute(DATA_COMPLETED, true);
                targetTodo.completed = true;
            } else {
                this.setAttribute(DATA_COMPLETED, false);
                targetTodo.completed = false;
            }

            await firebase.savePost(FIREBASE_POST, {
                ...todoObj,
            });
            
            succsessTodo = getCompletedPosts(arrayTodo);
            const activeArray = getCompletedPosts(arrayTodo, false);

            $counters.active.innerHTML = activeArray.length;
            $counters.completed.innerHTML = succsessTodo.length;

        } catch(e) {
            console.log(e);
            checkboxTodo.checked = false;
            showNotification('Todo complete - Error', 'error');
        }
    }

    async function editTodo(todoObj, domElements) {
        const { btnEdit, textTodo , textareaTodo} = domElements;

        if(!btnEdit.classList.contains('active')) {
            btnEdit.classList.add('active');
            this.classList.add('todo-item-edit');

            return
        } 

        try {
            await firebase.savePost(FIREBASE_POST, {
                ...todoObj,
                text: textareaTodo.value
            });

            textTodo.innerHTML = textareaTodo.value;
            btnEdit.classList.remove('active');
            this.classList.remove('todo-item-edit');

            showNotification('Todo Save - Succsessfull', 'succsess');

        } catch(e) {
            showNotification('Todo Save - Error', 'error');
        }
    } 
    /* */

    /* Functions for add class with animation to context */
    function startLoading() {
        this.classList.add(LOADING);
    }
    
    function endLoading() {
        this.classList.remove(LOADING);
    }
    /* */


    function getCompletedPosts(array, flag = true) {
        let newArray = [];
        array.forEach(function(item) {
            if(item.completed === flag) {
                newArray.push(item);
            }
        })
        return newArray;
    }

    function taskNotFound() {
        return `<p class='task-not-found'>Task not found</p>`;
    }
}

const getCurrentDate = (date) => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const [day, mounth, year] = date.toLocaleDateString().split('.');
    return `${day} ${MONTHS[parseInt(mounth) - 1]} ${year}`;
}

