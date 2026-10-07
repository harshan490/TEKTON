import GradientBackground from "@/components/bg/GradientBackground";
import ClickSpark from "@/components/reactbits/ClickSpark";
import Nav from "@/components/nav/Nav";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Mission from "@/components/sections/Mission";
import Models from "@/components/sections/Models";
import Architecture from "@/components/sections/Architecture";
import Principles from "@/components/sections/Principles";
import ComingSoon from "@/components/sections/ComingSoon";
import { IntroProvider } from "@/components/providers/Intro";

export default function Home() {
  return (
    <IntroProvider>
      <GradientBackground />
      <ScrollProgress />
      <ClickSpark sparkColor="#ffffff" sparkCount={6} sparkSize={8} sparkRadius={18} duration={420}>
        <Nav />
        <main id="main" className="relative z-10">
          <Hero />
          <Mission />
          <Models />
          <Architecture />
          <Principles />
          <ComingSoon />
        </main>
      </ClickSpark>
    </IntroProvider>
  );
}
