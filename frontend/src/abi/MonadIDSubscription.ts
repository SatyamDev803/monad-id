export const monadIDSubscriptionAbi = [
  {
    inputs: [{ name: "_tier", type: "uint8" }],
    name: "subscribe",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renew",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_subscriber", type: "address" }],
    name: "getSubscription",
    outputs: [
      {
        components: [
          { name: "tier", type: "uint8" },
          { name: "expiresAt", type: "uint256" },
          { name: "verificationsUsed", type: "uint256" },
          { name: "verificationLimit", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_subscriber", type: "address" }],
    name: "isActive",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PRO_PRICE",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ENTERPRISE_PRICE",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "subscriber", type: "address" },
      { indexed: false, name: "tier", type: "uint8" },
      { indexed: false, name: "expiresAt", type: "uint256" },
    ],
    name: "Subscribed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "subscriber", type: "address" },
      { indexed: false, name: "tier", type: "uint8" },
      { indexed: false, name: "expiresAt", type: "uint256" },
    ],
    name: "Renewed",
    type: "event",
  },
  { inputs: [], name: "InvalidTier", type: "error" },
  { inputs: [], name: "IncorrectPayment", type: "error" },
  { inputs: [], name: "NoActiveSubscription", type: "error" },
  { inputs: [], name: "AlreadySubscribed", type: "error" },
] as const;
