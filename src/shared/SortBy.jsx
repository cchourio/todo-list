function SortBy({ sortBy, sortDirection, onSortByChange, onSortDirectionChange }) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px'
    }}>
      <div>
        <label htmlFor="sortBy" style={{ marginRight: '8px', fontWeight: 'bold' }}>
          Sort by:
        </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          <option value="createdAt">Created At</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div>
        <label htmlFor="sortDirection" style={{ marginRight: '8px', fontWeight: 'bold' }}>
          Order:
        </label>
        <select
          id="sortDirection"
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  );
}

export default SortBy;
