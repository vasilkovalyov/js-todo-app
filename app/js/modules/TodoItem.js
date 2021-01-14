class TodoItem {
    constructor(options = null) {
        this.key = options?.key;
        this.text = options?.text;
        this.date = options?.date;
        this.completed = options?.completed;
    }

    onClickEdit(id) {
        console.log(id)
    }

    render() {
        return `
            <div class="todo-item js-todo-item" id="${this.key}" data-completed="${'completed' ? this.completed : null}">
                <div class="checkbox-component">
                    <label>
                        <input type="checkbox" class="checkbox-component__input js-btn-todo-checkbox" ${this.completed ? 'checked' : '' }>
                        <span class="checkbox-component__mark"></span>
                    </label>
                </div>
                <div class="todo-item__body">
                    <span class="todo-item__date">${this.date}</span>
                    <div class="todo-item__text-component">
                        <p class="todo-item__text js-todo-item-text">${this.text}</p>
                        <textarea class="todo-item__textarea js-todo-textarea">${this.text}</textarea>
                    </div>
                    <div class="todo-item__btn-wrap">
                        <button class="todo-item__btn-config todo-item__check js-btn-todo-complete" hidden>
                            
                        </button>
                        <button class="todo-item__btn-config todo-item__edit js-btn-todo-edit">
                            <i class="far fa-edit"></i>
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="todo-item__btn-config todo-item__remove js-btn-todo-remove">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>`
    }
}

export default TodoItem;