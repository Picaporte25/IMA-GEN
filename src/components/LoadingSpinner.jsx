export default function LoadingSpinner({ size = 'medium', text }) {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} rounded-full border-border-default border-t-accent-orange animate-spin`}
        style={{ animationDuration: '1s' }}
      />
      {text && (
        <p className="text-text-secondary text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}
