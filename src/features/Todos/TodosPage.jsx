import { useEffect, useReducer } from 'react';
import TodoList from './TodoList/TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import SortBy from '../../shared/SortBy.jsx';
import FilterInput from '../../shared/FilterInput.jsx';
import useDebounce from '../../utils/useDebounce.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  initialTodoState,
  TODO_ACTIONS,
  todoReducer,
} from '../../reducers/todoReducer.js';

function TodosPage() {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const {
    todoList,
    error,
    filterError,
    isTodoListLoading,
    sortBy,
    sortDirection,
    filterTerm,
    dataVersion,
  } = state;
  const debouncedFilterTerm = useDebounce(filterTerm, 300);

  // Cargar tareas desde la API
  useEffect(() => {
    async function fetchTodos() {
      if (!token) return;
      
      dispatch({ type: TODO_ACTIONS.FETCH_START });
      
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
        dispatch({
          type: TODO_ACTIONS.FETCH_SUCCESS,
          payload: { todos: data.tasks },
        });
      } catch (err) {
        const isFilterError = Boolean(
          debouncedFilterTerm ||
          sortBy !== 'createdAt' ||
          sortDirection !== 'desc'
        );
        dispatch({
          type: TODO_ACTIONS.FETCH_ERROR,
          payload: {
            message: isFilterError
              ? `Error filtering/sorting todos: ${err.message}`
              : `Error fetching todos: ${err.message}`,
            isFilterError,
          },
        });
      }
    }

    fetchTodos();
  }, [token, sortBy, sortDirection, debouncedFilterTerm, dataVersion]);

  async function addTodo(todoTitle) {
    // 1. Crear tarea temporal con ID único
    const tempTodo = {
      id: Date.now(), // ID temporal (será reemplazado por el del servidor)
      title: todoTitle,
      isCompleted: false
    };

    // 2. OPTIMISTA: Actualizar UI inmediatamente
    dispatch({
      type: TODO_ACTIONS.ADD_TODO_START,
      payload: { todo: tempTodo },
    });

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

      dispatch({
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: { tempId: tempTodo.id, todo: serverTodo },
      });
    } catch (err) {
      dispatch({
        type: TODO_ACTIONS.ADD_TODO_ERROR,
        payload: {
          tempId: tempTodo.id,
          message: `Failed to add todo: ${err.message}`,
        },
      });
    }
  }

  async function completeTodo(id) {
    // 1. Guardar tarea original (para rollback si falla)
    const originalTodo = todoList.find(todo => todo.id === id);
    
    dispatch({
      type: TODO_ACTIONS.COMPLETE_TODO_START,
      payload: { id },
    });

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
      
      dispatch({ type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS });
    } catch (err) {
      dispatch({
        type: TODO_ACTIONS.COMPLETE_TODO_ERROR,
        payload: {
          originalTodo,
          message: `Failed to complete todo: ${err.message}`,
        },
      });
    }
  }

  async function updateTodo(editedTodo) {
    // 1. Guardar tarea original
    const originalTodo = todoList.find(todo => todo.id === editedTodo.id);
    
    dispatch({
      type: TODO_ACTIONS.UPDATE_TODO_START,
      payload: { todo: editedTodo },
    });

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

      dispatch({ type: TODO_ACTIONS.UPDATE_TODO_SUCCESS });
    } catch (err) {
      dispatch({
        type: TODO_ACTIONS.UPDATE_TODO_ERROR,
        payload: {
          originalTodo,
          message: `Failed to update todo: ${err.message}`,
        },
      });
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
            onClick={() => dispatch({ type: TODO_ACTIONS.CLEAR_ERROR })} 
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
            onClick={() =>
              dispatch({ type: TODO_ACTIONS.CLEAR_FILTER_ERROR })
            }
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
            onClick={() => dispatch({ type: TODO_ACTIONS.RESET_FILTERS })}
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
        onSortByChange={(newSortBy) =>
          dispatch({
            type: TODO_ACTIONS.SET_SORT,
            payload: { sortBy: newSortBy },
          })
        }
        onSortDirectionChange={(newSortDirection) =>
          dispatch({
            type: TODO_ACTIONS.SET_SORT,
            payload: { sortDirection: newSortDirection },
          })
        }
      />

      <FilterInput 
        filterTerm={filterTerm}
        onFilterChange={(newTerm) =>
          dispatch({
            type: TODO_ACTIONS.SET_FILTER,
            payload: { filterTerm: newTerm },
          })
        }
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