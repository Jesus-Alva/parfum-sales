"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export default function CostChart({ data }: { data: any[] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-xl mb-4">Costo vs Precio vs Ganancia</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1f1f2e" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#8b8b9e" fontSize={12} />
            <YAxis stroke="#8b8b9e" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#12121a",
                border: "1px solid #d4af37",
                borderRadius: 8,
              }}
            />
            <Legend />
            <Bar dataKey="cost" fill="#8b8b9e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="price" fill="#e8b4b8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" fill="#d4af37" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}