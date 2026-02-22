import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MonadIDModule = buildModule("MonadIDModule", (m) => {
  const verifier = m.contract("Groth16Verifier");
  const humanToken = m.contract("MonadHumanToken");
  const registry = m.contract("IdentityRegistry", [verifier, humanToken]);
  const subscription = m.contract("MonadIDSubscription");

  m.call(humanToken, "setIdentityRegistry", [registry]);

  return { verifier, humanToken, registry, subscription };
});

export default MonadIDModule;
