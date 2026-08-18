import { useState } from 'react';
import TodoList from './features/TodoList/TodoList.jsx';
import TodoForm from './features/TodoForm.jsx' 
import './App.css'

function App() {

  const [todoList, setTodoList] = useState([]);

  function addTodo(todoTitle) {
    const newTodo = {
        id: Date.now(),
        title: todoTitle,
        isCompleted: false
    };
    setTodoList((previous) => [newTodo, ...previous])
  }

  function completeTodo(id) {
    const updateList = todoList.map((todo) => {
      if(todo.id === id){
        return {...todo, isCompleted: true}; // similar to: todo.isCompleted = true;
      }
      return todo;
    });
    setTodoList(updateList)
  }

  function updateTodo(editedTodo) {
    setTodoList((previous) =>
      previous.map((todo) => (todo.id === editedTodo.id ? { ...editedTodo } : todo))
    );
  }

  return(
    <>
      <h1>Todo List</h1>
      <TodoForm onAddTodo={addTodo}/>
      <TodoList 
        todoList={todoList} 
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
    </>
  )
}

export default App
