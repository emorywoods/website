import { Suspense } from "react";
import ScrollHero from "@/components/ScrollHero";
import SideDots from "@/components/SideDots";
import AmenitiesSection from "@/components/AmenitiesSection";
import FloorPlansSection from "@/components/FloorPlansSection";
import NeighborhoodSection from "@/components/NeighborhoodSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="page-wrapper">
      <ScrollHero />
      <SideDots />
      <AmenitiesSection />
      <FloorPlansSection />
      <NeighborhoodSection />
      <AboutSection />
      <Suspense>
        <ContactSection />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
