import { useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel.jsx';
import { isValidTodoTitle } from '../../utils/todoValidation.js';

function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(todo.title);

  function handleEdit(event) {
    setWorkingTitle(event.target.value);
  }

  function handleCancel() {
    setWorkingTitle(todo.title);
    setIsEditing(false);
  }

  function handleUpdate(event) {
    event.preventDefault();

    const trimmedTitle = workingTitle.trim();

    if (!isValidTodoTitle(trimmedTitle)) {
      return;
    }

    onUpdateTodo({ ...todo, title: trimmedTitle });
    setIsEditing(false);
  }

  return (
    <li>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <TextInputWithLabel
            elementId={`edit-${todo.id}`}
            labelText="Edit todo"
            value={workingTitle}
            onChange={handleEdit}
          />
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValidTodoTitle(workingTitle)}
          >
            Update
          </button>
        </form>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              id={`checkbox${todo.id}`}
              checked={todo.isCompleted}
              onChange={() => onCompleteTodo(todo.id)}
            />
          </label>
          <span onClick={() => setIsEditing(true)}>{todo.title}</span>
        </>
      )}
    </li>
  );
}

export default TodoListItem;