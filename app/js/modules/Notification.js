class Notification {
    constructor(type) {
        this.type = type;
    }

    renderNotification() {
        this.insertAdjacentHTML('afterbegin', this.render());
    }

    showNotification() {
        
    }
    
    notification() {
        return `<div class="notification notification-${type}">
                <span class="notification__message">Succsess</span>
            </div>`
    }
}