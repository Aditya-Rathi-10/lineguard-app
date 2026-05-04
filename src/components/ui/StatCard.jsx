export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'brand' }) {
  const variantClasses = {
    brand: 'stat-card stat-card-brand',
    danger: 'stat-card stat-card-danger',
    success: 'stat-card stat-card-success',
    warning: 'stat-card stat-card-warning',
  };

  const iconBg = {
    brand: 'bg-brand-500/10 text-brand-400',
    danger: 'bg-danger-500/10 text-danger-400',
    success: 'bg-success-500/10 text-success-400',
    warning: 'bg-warning-500/10 text-warning-400',
  };

  return (
    <div className={`${variantClasses[variant]} animate-in`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-surface-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
