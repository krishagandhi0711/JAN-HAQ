import React from "react";

// Import all separated components
import StorySection from "../components/about/StorySection";
import JourneySection from "../components/about/JourneySection";
import MissionAndValuesSection from "../components/about/MissionAndValuesSection";
import TeamSection from "../components/about/TeamSection";
import FinalAboutCTA from "../components/about/FinalAboutCTA";

// --- Main About Component ---
export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 bg-pattern">

      {/* Proper padding for navbar */}
      <div className="pt-28">
        <StorySection />
      </div>

      <JourneySection />
      <MissionAndValuesSection />
      <TeamSection />

      {/* Reduce bottom space similar to Home.jsx */}
      <div className="mb-[-80px]">
        <FinalAboutCTA />
      </div>

      {/* Custom dotted background for both modes */}
      <style>
{`
  /* LIGHT MODE: Visible gray dotted texture */
  .bg-pattern {
    background-color: #f9fafb; /* soft gray base */
    background-image: radial-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px);
    background-size: 15px 15px;
  }

  /* DARK MODE: Soft white dotted texture */
  .dark .bg-pattern {
    background-color: #111827; /* dark gray base */
    background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`}
</style>

    </div>
  );
}
