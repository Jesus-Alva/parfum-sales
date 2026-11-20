import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-scentia-border py-10 px-6 text-center">
      <Image src="/images/brand/logo-complete.png" alt="ScentiA" width={658} height={379} className="mx-auto mb-3 h-24 w-auto object-contain" />
      <p className="text-sm text-scentia-muted">
        © {new Date().getFullYear()} Scentia. Fragancias que cuentan historias.
      </p>
    </footer>
  );
}
