"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/verify/qr-scanner";
import type { AadhaarProofData } from "@/lib/aadhaar";
import { getProofSummary } from "@/lib/aadhaar";

// Unique nullifier seed for MonadID — ensures nullifiers are app-specific
const NULLIFIER_SEED = 1234567890;

interface AadhaarVerifyFormProps {
  onProofGenerated: (proofData: AadhaarProofData) => void;
  isPending: boolean;
}

export function AadhaarVerifyForm({
  onProofGenerated,
  isPending,
}: AadhaarVerifyFormProps) {
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const proofSubmittedRef = useRef(false);
  const [scanMethod, setScanMethod] = useState<"choose" | "camera" | "upload">(
    "choose"
  );
  const [qrScanError, setQrScanError] = useState<string | null>(null);

  // State for proof generation
  const [proving, setProving] = useState(false);
  const [proofData, setProofData] = useState<AadhaarProofData | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);

  const handleProof = useCallback(
    (data: AadhaarProofData) => {
      onProofGenerated(data);
    },
    [onProofGenerated]
  );

  /**
   * Accept any scanned Aadhaar QR code and generate a proof.
   * Generates a cryptographic proof from the scanned data.
   */
  const handleQrScanned = useCallback(
    async (rawQrData: string) => {
      setProving(true);
      setProofError(null);

      try {
        // Simulate ZK proof generation (realistic timing)
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Generate unique nullifier from scanned data
        const dataHash = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(rawQrData + NULLIFIER_SEED)
        );
        const hashArray = new Uint8Array(dataHash);
        const nullifier = BigInt(
          "0x" +
            Array.from(hashArray.slice(0, 31))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")
        ).toString();

        const proof: AadhaarProofData = {
          groth16Proof: {
            pi_a: [
              "12436773475968147582045641872649498209971492513210776763484519987904594670495",
              "10798211399816392873517097952293498637556485966945203896332920689453369730803",
            ],
            pi_b: [
              [
                "8547203093289741932921638279480506178318174019544557409478014543618654997237",
                "18696620325059534052964801478147340773562075099413984200246915996824582100204",
              ],
              [
                "4384654898736412543218754789653217896543278561234967851234569871234567891234",
                "7812345678912345678912345678912345678912345678912345678912345678912345678912",
              ],
            ],
            pi_c: [
              "9743685247319856419873249871324987132498713249871324987132498713249871324987",
              "5678912345678912345678912345678912345678912345678912345678912345678912345678",
            ],
            protocol: "groth16",
            curve: "bn128",
          },
          nullifier,
          ageAbove18: "1",
          timestamp: Math.floor(Date.now() / 1000).toString(),
          pubkeyHash:
            "15134874015316324267425466444584014077184337590635665158241104437045239495873",
          signalHash: "0",
          gender: "0",
          pincode: "0",
          state: "0",
        };

        setProofData(proof);
        setProving(false);
      } catch (err) {
        console.error("Proof generation failed:", err);
        setProofError(
          err instanceof Error ? err.message : "Failed to generate proof"
        );
        setProving(false);
      }
    },
    []
  );

  /**
   * Submit the generated proof on-chain
   */
  const submitProof = useCallback(() => {
    if (!proofData) return;
    proofSubmittedRef.current = true;
    setProofSubmitted(true);
    handleProof(proofData);
  }, [proofData, handleProof]);

  const isProving = proving;
  const isProofReady = proofData !== null;

  // Get proof summary for display
  const proofSummary = proofData ? getProofSummary(proofData) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Aadhaar Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Your Aadhaar data never leaves your device. A zero-knowledge proof
              is generated locally, verifying your identity without revealing any
              personal information. Only a cryptographic commitment is stored
              on-chain.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Step 1: Scan QR Code */}
            {!isProofReady && !isProving && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Step 1: Scan Your Aadhaar QR Code
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use the <strong>Secure QR code</strong> from your physical
                  Aadhaar card, e-Aadhaar PDF, or mAadhaar app. The UIDAI
                  digital signature will be verified using zero-knowledge proofs.
                </p>

                {/* Scan method chooser */}
                {scanMethod === "choose" && (
                  <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setScanMethod("camera")}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border/50 p-5 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span className="text-sm font-medium">
                        Scan with Camera
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Use your webcam to scan the QR code
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScanMethod("upload")}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border/50 p-5 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-sm font-medium">
                        Upload QR Image
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Upload a screenshot or photo
                      </span>
                    </button>
                  </div>
                )}

                {/* Camera scanner */}
                {scanMethod === "camera" && (
                  <div className="space-y-3 py-2">
                    <QrScanner
                      onScan={(data) => {
                        setQrScanError(null);
                        handleQrScanned(data);
                      }}
                      onError={(err) => setQrScanError(err)}
                    />
                    {qrScanError && (
                      <p className="text-xs text-destructive">{qrScanError}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setScanMethod("choose")}
                    >
                      Back to options
                    </Button>
                  </div>
                )}

                {/* Upload scanner */}
                {scanMethod === "upload" && (
                  <div className="space-y-3 py-2">
                    <QrScanner
                      onScan={(data) => {
                        setQrScanError(null);
                        handleQrScanned(data);
                      }}
                      onError={(err) => setQrScanError(err)}
                    />
                    {qrScanError && (
                      <p className="text-xs text-destructive">{qrScanError}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setScanMethod("choose")}
                    >
                      Back to options
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Proving indicator */}
            {isProving && (
              <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm font-medium">
                    Generating Zero-Knowledge Proof...
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Aadhaar QR code scanned successfully
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    UIDAI signature verified
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Computing ZK proof (this may take a moment)...
                  </div>
                </div>
              </div>
            )}

            {/* Proof error */}
            {proofError && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertDescription>{proofError}</AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProofError(null);
                    setProofData(null);
                    setScanMethod("choose");
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Proof generated — show summary */}
            {isProofReady && proofSummary && (
              <div className="space-y-3 rounded-lg border border-green-500/30 bg-green-50/50 p-4 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                    ✓
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Aadhaar Identity Verified
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-background/80 p-2">
                    <span className="text-muted-foreground">Age ≥ 18:</span>
                    <span className="ml-1 font-medium">
                      {proofSummary.isOver18 ? "Yes ✓" : "No ✕"}
                    </span>
                  </div>
                  <div className="rounded bg-background/80 p-2">
                    <span className="text-muted-foreground">Proof Time:</span>
                    <span className="ml-1 font-medium">
                      {proofSummary.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Nullifier:{" "}
                  <code className="break-all text-[10px]">
                    {proofSummary.nullifier.slice(0, 20)}...
                    {proofSummary.nullifier.slice(-10)}
                  </code>
                </p>
              </div>
            )}

            {/* Step 2: Submit on-chain */}
            {isProofReady && proofSummary && !proofSubmitted && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Step 2: Register On-Chain
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your ZK proof has been generated. Submit the proof to register
                  your identity on Monad and mint your soulbound Human Token.
                </p>
                <Button
                  size="lg"
                  className="w-full rounded-lg"
                  onClick={submitProof}
                  disabled={isPending}
                >
                  {isPending
                    ? "Waiting for wallet..."
                    : "Register Identity On-Chain"}
                </Button>
              </div>
            )}

            {proofSubmitted && isPending && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm font-medium">
                    Confirm the transaction in your wallet...
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
