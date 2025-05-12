"use client";
import HomeSection from "@/components/Home";
import { SpinningText } from "@/components/magicui/spinning-text";
import FeaturesSection from "@/components/Fetures";

export default function Home() {

  return (
<div>
  <SpinningText 
    className="fixed top-15 left-15 z-50 text-white" 
  >Cancel•Misogyny•</SpinningText>

  <HomeSection />
  <FeaturesSection/>
</div>

  );
}
