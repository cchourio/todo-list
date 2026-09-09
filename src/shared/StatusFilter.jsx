import { useSearchParams } from 'react-router';

function StatusFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const handleStatusChange = (status) => {
    const nextParams = new URLSearchParams(searchParams);

    if (status === 'all') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', status);
    }

    setSearchParams(nextParams);
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <label htmlFor="statusFilter" style={{ marginRight: '8px', fontWeight: 'bold' }}>
        Show:
      </label>
      <select
        id="statusFilter"
        value={currentStatus}
        onChange={(event) => handleStatusChange(event.target.value)}
        style={{ padding: '5px', borderRadius: '4px' }}
      >
        <option value="all">All Todos</option>
        <option value="active">Active Todos</option>
        <option value="completed">Completed Todos</option>
      </select>
    </div>
  );
}

export default StatusFilter;
