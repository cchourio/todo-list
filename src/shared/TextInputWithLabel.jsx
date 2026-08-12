import { forwardRef } from 'react';

const TextInputWithLabel = forwardRef(function TextInputWithLabel(
  { elementId, labelText, onChange, value },
  ref
) {
  return (
    <>
      <label htmlFor={elementId}>{labelText}</label>
      <input
        id={elementId}
        name={elementId}
        type="text"
        value={value}
        onChange={onChange}
        ref={ref}
      />
    </>
  );
});

export default TextInputWithLabel;