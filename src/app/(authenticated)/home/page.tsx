import Hero from "@/components/home/Hero";
import Collections from "@/components/home/Collections";
import Trending from "@/components/home/Trending";
import CTABanner from "@/components/home/CTABanner";
import FooterLanding from "@/components/home/FooterLanding";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collections />
      <Trending />
      <CTABanner />
      <FooterLanding />
    </>
  );
}