import Hero from "@/components/landing/Hero";
import PerfumeShowcase from "@/components/landing/PerfumeShowcase";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/shared/Navbar";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <PerfumeShowcase />
      <Features />
      <Testimonials />
      <Footer />
    </main>
  );
}
