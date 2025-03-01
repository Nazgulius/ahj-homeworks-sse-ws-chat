import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {

  // Этот класс будет отвечать за взаимодействие с сервером. 
  // Например, он может отправлять и получать сообщения, а также управлять участниками чата.

  // пример
  async fetchMessages() {  
    // Получение сообщений из API  
    return await createRequest({  
      method: 'GET',  
      url: '/messages' // URL для получения сообщений  
    });  
  }  

  async sendMessage(message) {  
    // Отправляем новое сообщение  
    return await createRequest({  
      method: 'POST',  
      url: '/messages', // URL для отправки сообщения  
      body: JSON.stringify(message) // Передаем тело запроса  
    });  
  }  

}