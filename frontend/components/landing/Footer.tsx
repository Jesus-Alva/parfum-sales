export default function Footer() {
  return (
    <footer className="border-t border-scentia-border py-10 px-6 text-center">
      <p className="font-display text-2xl text-gradient-gold mb-2">Scentia</p>
      <p className="text-sm text-scentia-muted">
        © {new Date().getFullYear()} Scentia. Fragancias que cuentan historias.
      </p>
    </footer>
  );
}