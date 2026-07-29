import { useEffect, useState } from 'react';
import TodoList from './TodoList.jsx';
import TodoForm from './TodoForm.jsx'
import './App.css'

  const todos = [
        {id: 1, title: "review resources"},
        {id: 2, title: "take notes"},
        {id: 3, title: "code out app"}
  ]

function App() {

  // const [todoList, setTodoList] = useState(todos);
  const [todoList, setTodoList] = useState(todos);

  useEffect(() => {
    document.title = `You have ${todoList.length} todos`;
  }, [todoList]);

  return(
    <>
      <h1>Todo List</h1>
      <TodoForm />
      <TodoList todoList={todoList} />
    </>
  )
}

export default App
