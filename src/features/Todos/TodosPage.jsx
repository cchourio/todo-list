import { useState, useEffect } from 'react';
import TodoList from './TodoList/TodoList.jsx';
import TodoForm from './TodoForm.jsx';

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);

  // Cargar tareas desde la API
  useEffect(() => {
    async function fetchTodos() {
      if (!token) return;
      
      setIsTodoListLoading(true);
      
      try {
        const params = new URLSearchParams({ limit: 100 });
        const response = await fetch(`/api/tasks?${params}`, {
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Not authorized. Please log in.');
          }
          throw new Error('Failed to fetch todos');
        }

        const data = await response.json();
        setTodoList(data.tasks); // ← La API devuelve { tasks: [...], pagination: {...} }
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsTodoListLoading(false);
      }
    }

    fetchTodos();
  }, [token]);

  async function addTodo(todoTitle) {
    // 1. Crear tarea temporal con ID único
    const tempTodo = {
      id: Date.now(), // ID temporal (será reemplazado por el del servidor)
      title: todoTitle,
      isCompleted: false
    };

    // 2. OPTIMISTA: Actualizar UI inmediatamente
    setTodoList((previous) => [tempTodo, ...previous]);

    // 3. Si no hay token, solo actualiza localmente
    if (!token) return;

    // 4. Enviar a API en segundo plano
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: todoTitle,
          isCompleted: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const serverTodo = await response.json();

      // 5. Reemplazar tarea temporal con la del servidor
      setTodoList((prev) => 
        prev.map(todo => todo.id === tempTodo.id ? serverTodo : todo)
      );
      setError('');
    } catch (err) {
      // 6. Si falla: Eliminar tarea temporal
      setTodoList((prev) => prev.filter(todo => todo.id !== tempTodo.id));
      setError(`Failed to add todo: ${err.message}`);
    }
  }

  async function completeTodo(id) {
    // 1. Guardar tarea original (para rollback si falla)
    const originalTodo = todoList.find(todo => todo.id === id);
    
    // 2. OPTIMISTA: Actualizar UI inmediatamente
    const updatedList = todoList.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isCompleted: true };
      }
      return todo;
    });
    setTodoList(updatedList);

    // 3. Si no hay token, solo actualiza localmente
    if (!token) return;

    // 4. Enviar a API
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({ isCompleted: true })
      });

      if (!response.ok) {
        throw new Error('Failed to complete todo');
      }
      
      setError('');
    } catch (err) {
      // 5. ROLLBACK: Revertir al estado original
      setTodoList((prev) =>
        prev.map(todo => todo.id === id ? originalTodo : todo)
      );
      setError(`Failed to complete todo: ${err.message}`);
    }
  }

  async function updateTodo(editedTodo) {
    // 1. Guardar tarea original
    const originalTodo = todoList.find(todo => todo.id === editedTodo.id);
    
    // 2. OPTIMISTA: Actualizar UI inmediatamente
    const updatedTodos = todoList.map((todo) => {
      if (todo.id === editedTodo.id) {
        return { ...editedTodo };
      }
      return todo;
    });
    setTodoList(updatedTodos);

    // 3. Si no hay token, solo actualiza localmente
    if (!token) return;

    // 4. Enviar a API
    try {
      const response = await fetch(`/api/tasks/${editedTodo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editedTodo.title,
          isCompleted: editedTodo.isCompleted
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      setError('');
    } catch (err) {
      // 5. ROLLBACK
      setTodoList((prev) =>
        prev.map(todo => todo.id === editedTodo.id ? originalTodo : todo)
      );
      setError(`Failed to update todo: ${err.message}`);
    }
  }

  return (
    <>
      {error && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '10px' }}>
            Clear Error
          </button>
        </div>
      )}
      
      {isTodoListLoading && (
        <p style={{ textAlign: 'center', padding: '20px' }}>Loading todos...</p>
      )}
      
      <TodoForm onAddTodo={addTodo} />
      <TodoList 
        todoList={todoList} 
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
    </>
  );
}

export default TodosPage;