"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "Australia",
  "India",
  "Brazil",
  "South Korea",
  "Singapore",
  "Switzerland",
  "Netherlands",
  "Sweden",
  "Norway",
];

interface VerifyFormProps {
  onSubmit: (secret: string, age: number, country: string) => void;
  isPending: boolean;
}

export function VerifyForm({ onSubmit, isPending }: VerifyFormProps) {
  const [secret, setSecret] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");

  const isValid = secret.length >= 6 && Number(age) >= 18 && country !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(secret, Number(age), country);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Your data never leaves your browser. A zero-knowledge proof is
              generated locally and only the cryptographic commitment is stored
              on-chain.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="secret">Secret Passphrase</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Enter a secret passphrase (min 6 characters)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                This is used to generate your unique identity commitment. Keep
                it safe — you&apos;ll need it to prove ownership.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Your age (must be 18+)"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={150}
              />
              {age !== "" && Number(age) < 18 && (
                <p className="text-xs text-destructive">
                  You must be at least 18 years old to verify.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Country of Residence</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-lg"
              disabled={!isValid || isPending}
            >
              {isPending ? "Waiting for wallet..." : "Generate Proof & Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
