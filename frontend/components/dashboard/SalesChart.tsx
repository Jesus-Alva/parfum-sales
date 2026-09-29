"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function SalesChart({ data }: { data: any[] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-xl mb-4">Ventas por día</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1f1f2e" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#8b8b9e" fontSize={12} />
            <YAxis stroke="#8b8b9e" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#12121a",
                border: "1px solid #d4af37",
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#d4af37"
              strokeWidth={3}
              dot={{ fill: "#d4af37" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}