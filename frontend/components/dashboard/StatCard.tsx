"use client";
import { motion } from "framer-motion";

export default function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-scentia-gold">{icon}</span>
      </div>
      <p className="text-3xl font-display">{value}</p>
      <p className="text-sm text-scentia-muted mt-1">{label}</p>
    </motion.div>
  );
}