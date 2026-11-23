import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/landing/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site min-h-screen">
      <Navbar />
      <div className="pt-20">{children}</div>
      <Footer />
    </div>
  );
}
