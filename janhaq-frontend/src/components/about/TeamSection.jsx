import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// --- Team Data ---
const team = [
  { name: "Disha Vaghela", role: "Frontend Developer", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Dhriti Gandhi", role: "Backend Developer", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Krisha Gandhi", role: "Designer", img: "https://randomuser.me/api/portraits/women/65.jpg" },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.25 } },
};

const teamCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20, mass: 0.8 } },
  hover: { scale: 1.06, y: -8, boxShadow: "0 20px 50px rgba(14, 165, 233, 0.25)", transition: { type: "spring", damping: 25, stiffness: 300 } },
  tap: { scale: 0.97, transition: { type: "spring", damping: 20, stiffness: 400 } },
};

// Image hover/tap effects
const profileImgHover = { scale: 1.1, y: -4, rotate: 3, transition: { type: "spring", stiffness: 200, damping: 18, duration: 0.45 } };
const profileImgTap = { scale: 1.05, rotate: 1.5, transition: { type: "spring", stiffness: 300, damping: 20, duration: 0.3 } };

// --- Reusable Card Component ---
function TeamCard({ member }) {
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const rotateX = useTransform(motionY, [-1, 1], [6, -6]);
  const rotateY = useTransform(motionX, [-1, 1], [-6, 6]);

  const bind = {
    onMouseMove: (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      motionX.set((x - centerX) / centerX);
      motionY.set((y - centerY) / centerY);
    },
    onMouseLeave: () => {
      motionX.set(0);
      motionY.set(0);
    },
  };

  return (
    <motion.div
      className="bg-white/10 dark:bg-gray-800/10 rounded-3xl p-8 flex flex-col items-center cursor-pointer transition duration-500 border-t-4 border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-400"
      style={{ rotateX, rotateY, originX: "50%", originY: "50%", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      variants={teamCardVariants}
      whileHover="hover"
      whileTap="tap"
      tabIndex={0}
      role="group"
      aria-labelledby={`${member.name.replace(" ", "-")}-name`}
      {...bind}
    >
      <motion.img
        src={member.img}
        alt={member.name}
        className="w-32 h-32 rounded-full mb-5 border-4 border-sky-600 shadow-lg object-cover"
        whileHover={profileImgHover}
        whileTap={profileImgTap}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        tabIndex={-1}
        aria-hidden="true"
      />
      <h3 id={`${member.name.replace(" ", "-")}-name`} className="text-2xl font-semibold mb-1 text-gray-900 dark:text-gray-100 select-none">
        {member.name}
      </h3>
      <p className="text-sky-600 dark:text-sky-400 font-medium tracking-wide text-lg select-none">{member.role}</p>
    </motion.div>
  );
}

// --- Main Section ---
export default function TeamSection() {
  return (
    <section
      id="team"
      className="relative py-20 px-6 max-w-7xl mx-auto my-16 shadow-inner overflow-visible rounded-3xl"
      aria-label="Meet the JanHaq Team"
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">The Dedicated Faces Behind JanHaq</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          A small, dedicated team passionate about making civic rights accessible to everyone.
        </p>
      </motion.div>

      <motion.div
        className="grid gap-10 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {team.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </motion.div>
    </section>
  );
}
