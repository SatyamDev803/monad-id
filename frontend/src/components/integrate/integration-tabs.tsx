"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";

const REGISTRY_ADDRESS = "0x2541a918E3274048b18e9841D6391b64CDdCC4b0";

const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMonadID {
    function isHuman(address wallet) external view returns (bool);
    function isOver18(address wallet) external view returns (bool);
    function isUnique(address wallet) external view returns (bool);
}

contract MyDApp {
    IMonadID public monadId;

    constructor() {
        monadId = IMonadID(${REGISTRY_ADDRESS});
    }

    modifier onlyHumans() {
        require(monadId.isHuman(msg.sender), "Not verified");
        _;
    }

    modifier onlyAdults() {
        require(monadId.isOver18(msg.sender), "Must be 18+");
        _;
    }

    function protectedAction() external onlyHumans {
        // Only verified humans can call this
    }

    function adultOnlyAction() external onlyAdults {
        // Only verified adults can call this
    }
}`;

const viemCode = `import { createPublicClient, http } from "viem";

// Monad testnet
const client = createPublicClient({
  chain: {
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  },
  transport: http(),
});

const REGISTRY = "${REGISTRY_ADDRESS}";

const abi = [
  {
    name: "isHuman",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isOver18",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isUnique",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

// Check if an address is a verified human
const isHuman = await client.readContract({
  address: REGISTRY,
  abi,
  functionName: "isHuman",
  args: ["0xYourUserAddress"],
});

console.log("Is human:", isHuman);`;

const ethersCode = `import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://testnet-rpc.monad.xyz"
);

const REGISTRY = "${REGISTRY_ADDRESS}";

const abi = [
  "function isHuman(address wallet) view returns (bool)",
  "function isOver18(address wallet) view returns (bool)",
  "function isUnique(address wallet) view returns (bool)",
];

const monadId = new ethers.Contract(REGISTRY, abi, provider);

// Check if an address is a verified human
const isHuman = await monadId.isHuman("0xYourUserAddress");
console.log("Is human:", isHuman);

// Check age verification
const isAdult = await monadId.isOver18("0xYourUserAddress");
console.log("Is over 18:", isAdult);`;

export function IntegrationTabs() {
  return (
    <Tabs defaultValue="solidity" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="solidity">Solidity</TabsTrigger>
        <TabsTrigger value="viem">viem</TabsTrigger>
        <TabsTrigger value="ethers">ethers.js</TabsTrigger>
      </TabsList>
      <TabsContent value="solidity" className="mt-4">
        <CodeBlock code={solidityCode} language="Solidity" />
      </TabsContent>
      <TabsContent value="viem" className="mt-4">
        <CodeBlock code={viemCode} language="TypeScript (viem)" />
      </TabsContent>
      <TabsContent value="ethers" className="mt-4">
        <CodeBlock code={ethersCode} language="TypeScript (ethers.js)" />
      </TabsContent>
    </Tabs>
  );
}
