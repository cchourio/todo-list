import { useRef } from 'react'

function TodoForm({ onAddTodo }) {
    const inputRef = useRef(null)

    function handleAddTodo(event) {
        event.preventDefault()
        const title = inputRef.current.value.trim()
        if (title) {
            onAddTodo(title)
            event.target.reset()
            inputRef.current.focus()
        }
    }

    return (
        <form onSubmit={handleAddTodo}>
            <label htmlFor="todoTitle">Todo</label>
            <input ref={inputRef} type="text" id="todoTitle" />
            <button type="submit">Add Todo</button>
        </form>
    );
}

export default TodoForm;