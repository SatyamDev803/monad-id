import { identityRegistryAbi } from "@/abi/IdentityRegistry";
import { monadHumanTokenAbi } from "@/abi/MonadHumanToken";
import { monadIDSubscriptionAbi } from "@/abi/MonadIDSubscription";

export const CONTRACTS = {
  identityRegistry: {
    address: "0x2541a918E3274048b18e9841D6391b64CDdCC4b0" as `0x${string}`,
    abi: identityRegistryAbi,
  },
  monadHumanToken: {
    address: "0xD19B625eE6199Ce3824054832300cA26198f9A28" as `0x${string}`,
    abi: monadHumanTokenAbi,
  },
  subscription: {
    address: "0xEb935EA7Dd87d6C8097A5Fd73A73D43334C6FA69" as `0x${string}`,
    abi: monadIDSubscriptionAbi,
  },
} as const;
