import { motion } from "framer-motion";

export default function HologramOrb() {
  return (
    <div className="flex justify-center py-6">

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="
          relative
          w-56
          h-56
          rounded-full
          border-2
          border-cyan-400
        "
      >

        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
          className="
            absolute
            inset-5
            rounded-full
            border
            border-cyan-300
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-24
            h-24
            rounded-full
            bg-cyan-400
            glow
          "
        />

      </motion.div>

    </div>
  );
}