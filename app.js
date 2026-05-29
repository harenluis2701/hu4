// ==========================================
// VARIABLES Y ESTRUCTURAS DE DATOS (TASK 1)
// ==========================================
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const messageArea = document.getElementById('messageArea');
const syncApiBtn = document.getElementById('syncApiBtn');

// Arreglo global para almacenar los datos temporalmente
let myTasks = [];

// ==========================================
// PERSISTENCIA EN LOCAL STORAGE (TASK 4)
// ==========================================

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    const storedTasks = localStorage.getItem('tasksData');
    if (storedTasks) {
        myTasks = JSON.parse(storedTasks);
        renderAllTasks();
    }
});

// Guardar datos en Local Storage
const saveToLocalStorage = () => {
    localStorage.setItem('tasksData', JSON.stringify(myTasks));
};

// ==========================================
// CAPTURA E INTERACCIÓN CON USUARIO (TASK 2)
// ==========================================

// Mostrar mensajes en el DOM
const showMessage = (text, type) => {
    messageArea.textContent = text;
    messageArea.className = type; // 'error' o 'success'
    setTimeout(() => messageArea.textContent = '', 3000); // Borrar después de 3 seg
};

// Escuchar el evento de enviar formulario
taskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const newTaskText = taskInput.value.trim();

    // Validación: Evitar datos vacíos
    if (newTaskText === '') {
        showMessage('Por favor, escribe una tarea válida.', 'error');
        return;
    }

    // Crear objeto tarea
    const newTask = {
        id: Date.now(), // ID único basado en el tiempo
        title: newTaskText,
        completed: false
    };

    // Agregar al arreglo y guardar
    myTasks.push(newTask);
    saveToLocalStorage();
    renderAllTasks();
    
    // Limpiar input y mostrar éxito
    taskInput.value = '';
    showMessage('Tarea agregada exitosamente.', 'success');
});

// ==========================================
// MANIPULACIÓN DINÁMICA DEL DOM (TASK 3)
// ==========================================

// Función para pintar todas las tareas en el HTML
const renderAllTasks = () => {
    // Limpiar la lista antes de volver a pintarla
    taskList.innerHTML = '';

    // Recorrer el arreglo y crear elementos
    myTasks.forEach(task => {
        // Crear el <li>
        const liElement = document.createElement('li');
        liElement.textContent = task.title;

        // Crear botón de eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        
        // Función para borrar elemento al hacer clic
        deleteBtn.addEventListener('click', () => {
            removeTask(task.id);
        });

        // Modificar DOM usando appendChild
        liElement.appendChild(deleteBtn);
        taskList.appendChild(liElement);
    });
};

// Función para eliminar tarea (DOM y Local Storage)
const removeTask = (taskId) => {
    // Filtrar el arreglo para quitar el ID seleccionado
    myTasks = myTasks.filter(task => task.id !== taskId);
    saveToLocalStorage();
    renderAllTasks();
    showMessage('Tarea eliminada.', 'success');
};

// ==========================================
// INTEGRACIÓN CON FETCH API (TASK 5)
// ==========================================

// URL de API pública simulada para pruebas
const apiUrl = 'https://jsonplaceholder.typicode.com/todos';

// Evento para el botón de sincronizar
syncApiBtn.addEventListener('click', async () => {
    showMessage('Sincronizando con el servidor...', 'success');
    
    try {
        // 1. GET: Obtener tareas de la API (solo pedimos 3 para no saturar la vista)
        const getResponse = await fetch(`${apiUrl}?_limit=3`);
        const apiTasks = await getResponse.json();
        console.log('GET Exitoso (Datos de la API):', apiTasks);

        // 2. POST: Simular el envío de nuestra primera tarea local al servidor
        if (myTasks.length > 0) {
            const taskToPost = myTasks[0];
            const postResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: taskToPost.title,
                    completed: taskToPost.completed,
                    userId: 1
                })
            });
            const postResult = await postResponse.json();
            console.log('POST Exitoso (Tarea subida):', postResult);
        }

        // 3. PUT: Simular actualización de un elemento (Actualizamos el ID 1)
        const putResponse = await fetch(`${apiUrl}/1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 1,
                title: 'Tarea actualizada por Fetch',
                completed: true,
                userId: 1
            })
        });
        const putResult = await putResponse.json();
        console.log('PUT Exitoso (Tarea actualizada):', putResult);

        // 4. DELETE: Simular borrado de un elemento (Borramos el ID 1)
        const deleteResponse = await fetch(`${apiUrl}/1`, {
            method: 'DELETE'
        });
        console.log('DELETE Exitoso, status:', deleteResponse.status);

        showMessage('Operaciones CRUD simuladas en consola con éxito.', 'success');

    } catch (error) {
        // Manejo de errores
        console.error('Error en la comunicación con la API:', error);
        showMessage('Error al conectar con el servidor.', 'error');
    }
});