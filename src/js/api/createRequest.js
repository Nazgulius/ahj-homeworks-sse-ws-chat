const createRequest = async (options) => {
 // пример . Эта функция будет выполнять HTTP-запросы.
  const response = await fetch(options.url, {  
    method: options.method,  
    headers: {  
      'Content-Type': 'application/json'  
    },  
    body: options.body || null  
  });  

  if (!response.ok) {  
    throw new Error(`Ошибка HTTP: ${response.status}`);  
  }  

  return await response.json();  
};

export default createRequest;