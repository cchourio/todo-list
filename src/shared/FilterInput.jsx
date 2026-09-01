function FilterInput({ filterTerm, onFilterChange }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label 
        htmlFor="filterInput" 
        style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
      >
        Search todos:
      </label>
      <input
        id="filterInput"
        type="text"
        value={filterTerm}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Search by title..."
        style={{ 
          width: '100%', 
          padding: '8px', 
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />
    </div>
  );
}

export default FilterInput;
