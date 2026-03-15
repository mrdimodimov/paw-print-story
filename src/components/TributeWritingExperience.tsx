import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Remembering the little moments…",
  "Thinking about their favorite places…",
  "Reflecting on the joy they brought…",
  "Gathering the memories that mattered most…",
  "Turning memories into a story…",
  "Finding the words that feel right…",
  "Honoring the bond you shared…",
];

interface Props {
  petName?: string;
  visible: boolean;
}

export default function TributeWritingExperience({ petName, visible }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col items-center gap-3"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="font-display text-base italic text-muted-foreground md:text-lg"
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>

          {/* Gentle animated dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="block h-1.5 w-1.5 rounded-full bg-primary/40"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: dot * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
