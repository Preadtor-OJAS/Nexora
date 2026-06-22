import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MouseGlow from '@/components/animations/MouseGlow';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import BenefitsSection from '@/components/landing/BenefitsSection';
import AnalyticsPreview from '@/components/landing/AnalyticsPreview';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';

export default function HomePage() {
  return (
    <main className="relative">
      <MouseGlow />
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <BenefitsSection />
      <AnalyticsPreview />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
