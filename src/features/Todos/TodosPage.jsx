import { useState, useEffect, useCallback } from 'react';
import TodoList from './TodoList/TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import SortBy from '../../shared/SortBy.jsx';
import FilterInput from '../../shared/FilterInput.jsx';
import useDebounce from '../../utils/useDebounce.js';

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  
  // Sort state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Filter state
  const [filterTerm, setFilterTerm] = useState('');
  const debouncedFilterTerm = useDebounce(filterTerm, 300);
  const [filterError, setFilterError] = useState('');
  
  // Cache invalidation
  const [dataVersion, setDataVersion] = useState(0);

  // Cache invalidation function
  const invalidateCache = useCallback(() => {
    setDataVersion(prev => prev + 1);
  }, []);

  // Filter change handler
  const handleFilterChange = (newTerm) => {
    setFilterTerm(newTerm);
  };

  // Cargar tareas desde la API
  useEffect(() => {
    async function fetchTodos() {
      if (!token) return;
      
      setIsTodoListLoading(true);
      
      try {
        const paramsObject = {
          sortBy,
          sortDirection,
          limit: 100
        };
        
        if (debouncedFilterTerm) {
          paramsObject.find = debouncedFilterTerm;
        }
        
        const params = new URLSearchParams(paramsObject);
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
        setTodoList(data.tasks);
        setError('');
        setFilterError('');
      } catch (err) {
        if (debouncedFilterTerm || sortBy !== 'createdAt' || sortDirection !== 'desc') {
          setFilterError(`Error filtering/sorting todos: ${err.message}`);
        } else {
          setError(`Error fetching todos: ${err.message}`);
        }
      } finally {
        setIsTodoListLoading(false);
      }
    }

    fetchTodos();
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

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
      invalidateCache();
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
      
      invalidateCache();
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

      invalidateCache();
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {error && (
        <div style={{ 
          color: 'white', 
          backgroundColor: '#dc3545',
          padding: '10px', 
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          {error}
          <button 
            onClick={() => setError('')} 
            style={{ 
              marginLeft: '10px',
              padding: '4px 8px',
              backgroundColor: 'white',
              color: '#dc3545',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Error
          </button>
        </div>
      )}

      {filterError && (
        <div style={{ 
          color: 'white', 
          backgroundColor: '#ffc107',
          padding: '10px', 
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>{filterError}</p>
          <button 
            onClick={() => setFilterError('')}
            style={{ 
              marginRight: '10px',
              padding: '6px 12px',
              backgroundColor: 'white',
              color: '#856404',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Filter Error
          </button>
          <button 
            onClick={() => {
              setFilterTerm('');
              setSortBy('createdAt');
              setSortDirection('desc');
              setFilterError('');
            }}
            style={{ 
              padding: '6px 12px',
              backgroundColor: 'white',
              color: '#856404',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {isTodoListLoading && (
        <p style={{ textAlign: 'center', padding: '20px' }}>Loading todos...</p>
      )}
      
      <SortBy 
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
      />

      <FilterInput 
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />
      
      <TodoForm onAddTodo={addTodo} />
      
      <TodoList 
        todoList={todoList} 
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        dataVersion={dataVersion}
      />
    </div>
  );
}

export default TodosPage;