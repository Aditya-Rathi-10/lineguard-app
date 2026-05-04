export default function StatusBadge({ theft, status }) {
  if (status) {
    let colorClass = '';
    let dotClass = '';
    
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        colorClass = 'badge-danger';
        dotClass = 'bg-danger-400';
        break;
      case 'investigating':
      case 'investigation':
        colorClass = 'badge-warning';
        dotClass = 'bg-warning-400';
        break;
      case 'resolved':
        colorClass = 'badge-success';
        dotClass = 'bg-success-400';
        break;
      default:
        colorClass = 'badge-surface';
        dotClass = 'bg-surface-400';
    }

    // Capitalize first letter for display if it's all uppercase
    const displayStatus = status === status.toUpperCase() 
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() 
      : status;

    return (
      <span className={colorClass}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {displayStatus}
      </span>
    );
  }

  if (theft) {
    return (
      <span className="badge-danger">
        <span className="w-1.5 h-1.5 rounded-full bg-danger-400" />
        Theft
      </span>
    );
  }

  return (
    <span className="badge-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success-400" />
      Normal
    </span>
  );
}
