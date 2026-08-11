import { useState } from 'react'
import TextInputWithLabel from '../shared/TextInputWithLabel.jsx'
import { isValidTodoTitle } from '../utils/todoValidation.js'

function TodoForm({ onAddTodo }) {
    const [workingTodoTitle, setWorkingTodoTitle] = useState('')

    function handleAddTodo(event) {
        event.preventDefault()
        onAddTodo(workingTodoTitle)
        setWorkingTodoTitle('')
    }

    return (
        <form onSubmit={handleAddTodo}>
            <TextInputWithLabel
                elementId="todoTitle" 
                labelText="Todo" 
                value={workingTodoTitle} 
                onChange={(e) => setWorkingTodoTitle(e.target.value)}
            />
            <button type="submit" disabled={!isValidTodoTitle(workingTodoTitle)}>
                Add Todo
            </button>
        </form>
    );
}

export default TodoForm;