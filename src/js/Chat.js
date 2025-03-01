import ChatAPI from "./api/ChatAPI";

// В этом классе вы будете реализовывать логику для вашего чата:
export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
    this.messages = []; // Хранение сообщений 
  }

  async init() {
    await this.fetchMessages(); // Загружаем сообщения при инициализации  
    this.bindToDOM(); // Привязываем элементы к DOM  
    this.registerEvents(); // Регистрируем события  
    this.subscribeOnEvents(); // Регистрируем обработчики событий  
  }

  // дополнительный метод, может и не нужен...
  async fetchMessages() {
    try {
      this.messages = await this.api.fetchMessages();
      t//his.renderMessages(); // Рендерим сообщения на экран  
    } catch (error) {
      //console.error('Ошибка при получении сообщений:', error);
    }
  }

  bindToDOM() {
    // Создание элементов интерфейса для чата  

  }

  registerEvents() {
    // this.sendButton.onclick = () => this.onEnterChatHandler(); // Обработка клика на кнопку  
    // this.messageInput.onkeypress = (event) => {
    //   if (event.key === 'Enter') {
    //     this.onEnterChatHandler(); // Отправка сообщения по нажатию клавиши Enter  
    //   }
    // };
  }

  subscribeOnEvents() {
    // слушаем кнопку ввода имени
    const inputName = document.querySelector('.modal__input');
    document.querySelector('.chat__connect').addEventListener('click', (e) => {
      // получаем и передаём имя, вот только куда?...
      console.log(inputName.textContent);
    });

    // Пример: подписка на событие нажатия клавиши  
    // это можно использовать для отправки в чат
    // this.messageInput.onkeypress = (event) => {
    //   if (event.key === 'Enter') {
    //     this.onEnterChatHandler(); // Отправка сообщения по нажатию Enter  
    //   }
    // };

    // Пример событий для кнопки отправки  
    // this.sendButton.onclick = () => {
    //   this.onEnterChatHandler(); // Отправка сообщения при клике на кнопку  
    // };
  }

  onEnterChatHandler() {
    const message = this.messageInput.value;
    if (message) {
      this.sendMessage(message);
      this.messageInput.value = ''; // Очищаем поле ввода  
    }
  }

  async sendMessage(message) {
    try {
      await this.api.sendMessage({ text: message }); // Отправка сообщения через API  
      this.fetchMessages(); // Обновляем список сообщений после отправки  
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  }

  renderMessage() {
    // Рендерим пришедшие сообщения  
    this.chatContainer.innerHTML = ''; // Очищаем контейнер  
    this.messages.forEach(msg => {
      const msgElement = document.createElement('div');
      msgElement.innerText = msg.text; // Предполагается, что в сообщении есть поле text  
      this.chatContainer.appendChild(msgElement);
    });
  }
}