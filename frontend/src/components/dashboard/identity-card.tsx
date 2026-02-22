"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IdentityCardProps {
  isHuman: boolean;
  isOver18: boolean;
  isUnique: boolean;
}

export function IdentityCard({ isHuman, isOver18, isUnique }: IdentityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Identity Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={isHuman ? "default" : "secondary"}
              className="px-4 py-2 text-sm"
            >
              {isHuman ? "✓" : "✕"} Human
            </Badge>
            <Badge
              variant={isOver18 ? "default" : "secondary"}
              className="px-4 py-2 text-sm"
            >
              {isOver18 ? "✓" : "✕"} Over 18
            </Badge>
            <Badge
              variant={isUnique ? "default" : "secondary"}
              className="px-4 py-2 text-sm"
            >
              {isUnique ? "✓" : "✕"} Unique
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
