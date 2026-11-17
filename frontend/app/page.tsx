import Hero from "@/components/landing/Hero";
import PerfumeShowcase from "@/components/landing/PerfumeShowcase";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/shared/Navbar";
import LandingAtmosphere from "@/components/landing/LandingAtmosphere";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <div className="landing-atmosphere">
        <LandingAtmosphere />
        <div className="relative z-10">
          <PerfumeShowcase />
          <Features />
          <Testimonials />
          <Footer />
        </div>
      </div>
    </main>
  );
}
