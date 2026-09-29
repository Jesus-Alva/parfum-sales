export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-10 h-10 border-2 border-scentia-gold/30 border-t-scentia-gold rounded-full animate-spin" />
    </div>
  );
}