import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import HeroSection from "../components/home/HeroSection";
import FeatureCard from "../components/home/FeatureCard";
import HowItWorksSection from "../components/home/HowItWorksSection";
import ImpactSection from "../components/home/ImpactSection";
import FinalCTA from "../components/home/FinalCTA";

import { BookOpen, Search, Users } from "lucide-react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = document.documentElement.classList.contains("dark");
    setIsDark(darkMode);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const lightGradient = [
    "linear-gradient(135deg, #f7fafc 0%, #e6fffa 25%, #b2f5ea 50%, #81e6d9 75%, #f7fafc 100%)",
  ];

  const darkGradient = [
    "linear-gradient(135deg, #0a192f 0%, #112240 25%, #1a365d 50%, #0e7490 75%, #0a192f 100%)",
  ];

  return (
    <div className="relative overflow-hidden min-h-screen mb-[-130px]">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 -z-10 w-full h-full"
        animate={{ background: isDark ? darkGradient : lightGradient }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="home-container relative transition-colors duration-500 pt-28">
        {/* Hero Section */}
        <HeroSection />

        {/* Key Features Section */}
        <section className="py-12 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Everything You Need to Know Your Rights
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JanHaq simplifies complex civic information into clear, actionable guidance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={BookOpen}
              title="Understand Your Rights"
              description="Access plain-language summaries of your legal rights. No legal jargon—just clear explanations you can understand and act on."
              delay={0.1}
              accentColor="blue"
            />
            <FeatureCard
              icon={Search}
              title="Find Relevant Schemes"
              description="Discover government schemes you qualify for with step-by-step guidance. Get the benefits you deserve without the confusion."
              delay={0.2}
              accentColor="teal"
            />
            <FeatureCard
              icon={Users}
              title="Connect with Authorities"
              description="Find verified contact information for the right government departments. Reach the people who can help you directly."
              delay={0.3}
              accentColor="cyan"
            />
          </div>
        </section>

        <HowItWorksSection />
        <ImpactSection />

        {/* Final CTA */}
        <FinalCTA className="relative z-10" />
      </div>
    </div>
  );
}
