import { expect } from "chai";
import { ethers } from "hardhat";
import {
  IdentityRegistry,
  MonadHumanToken,
  MockVerifier,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("IdentityRegistry", function () {
  let registry: IdentityRegistry;
  let token: MonadHumanToken;
  let mockVerifier: MockVerifier;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  // Dummy proof values (mock verifier ignores them)
  const dummyPA: [bigint, bigint] = [1n, 2n];
  const dummyPB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const dummyPC: [bigint, bigint] = [1n, 2n];

  // Valid public signals: [commitment, ageThreshold=18]
  const commitment1 = 12345n;
  const commitment2 = 67890n;
  const validPubSignals: [bigint, bigint] = [commitment1, 18n];

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockVerifierFactory = await ethers.getContractFactory("MockVerifier");
    mockVerifier = await MockVerifierFactory.deploy();

    const TokenFactory = await ethers.getContractFactory("MonadHumanToken");
    token = await TokenFactory.deploy();

    const RegistryFactory = await ethers.getContractFactory("IdentityRegistry");
    registry = await RegistryFactory.deploy(
      await mockVerifier.getAddress(),
      await token.getAddress()
    );

    await token.setIdentityRegistry(await registry.getAddress());
  });

  describe("Deployment", function () {
    it("should set correct verifier and token addresses", async function () {
      expect(await registry.verifier()).to.equal(
        await mockVerifier.getAddress()
      );
      expect(await registry.humanToken()).to.equal(await token.getAddress());
    });

    it("should have AGE_THRESHOLD of 18", async function () {
      expect(await registry.AGE_THRESHOLD()).to.equal(18);
    });
  });

  describe("verifyAndRegister", function () {
    it("should verify and register identity", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      expect(await registry.isHuman(user1.address)).to.be.true;
      expect(await registry.isOver18(user1.address)).to.be.true;
      expect(await registry.isUnique(user1.address)).to.be.true;
    });

    it("should mint MHT on verification", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      expect(await token.ownerOf(1)).to.equal(user1.address);
      expect(await token.hasMinted(user1.address)).to.be.true;
    });

    it("should store identity data correctly", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      const identity = await registry.getIdentity(user1.address);
      expect(identity.isHuman).to.be.true;
      expect(identity.isOver18).to.be.true;
      expect(identity.commitmentHash).to.equal(commitment1);
      expect(identity.tokenId).to.equal(1);
      expect(identity.verifiedAt).to.be.greaterThan(0);
    });

    it("should emit IdentityVerified event", async function () {
      await expect(
        registry
          .connect(user1)
          .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals)
      )
        .to.emit(registry, "IdentityVerified")
        .withArgs(user1.address, commitment1, 1, () => true);
    });

    it("should mark commitment as used", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      expect(await registry.usedCommitments(commitment1)).to.be.true;
    });

    it("should revert if already verified", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      await expect(
        registry
          .connect(user1)
          .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals)
      ).to.be.revertedWithCustomError(registry, "AlreadyVerified");
    });

    it("should revert if commitment already used by another wallet", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      // Same commitment, different wallet
      await expect(
        registry
          .connect(user2)
          .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals)
      ).to.be.revertedWithCustomError(registry, "CommitmentAlreadyUsed");
    });

    it("should revert if age threshold is wrong", async function () {
      const wrongPubSignals: [bigint, bigint] = [commitment1, 21n];

      await expect(
        registry
          .connect(user1)
          .verifyAndRegister(dummyPA, dummyPB, dummyPC, wrongPubSignals)
      ).to.be.revertedWithCustomError(registry, "InvalidAgeThreshold");
    });

    it("should revert if proof is invalid", async function () {
      await mockVerifier.setShouldVerify(false);

      await expect(
        registry
          .connect(user1)
          .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals)
      ).to.be.revertedWithCustomError(registry, "InvalidProof");
    });

    it("should allow different users with different commitments", async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);

      const pubSignals2: [bigint, bigint] = [commitment2, 18n];
      await registry
        .connect(user2)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, pubSignals2);

      expect(await registry.isHuman(user1.address)).to.be.true;
      expect(await registry.isHuman(user2.address)).to.be.true;
    });
  });

  describe("revokeIdentity", function () {
    beforeEach(async function () {
      await registry
        .connect(user1)
        .verifyAndRegister(dummyPA, dummyPB, dummyPC, validPubSignals);
    });

    it("should revoke identity", async function () {
      await registry.connect(user1).revokeIdentity();

      expect(await registry.isHuman(user1.address)).to.be.false;
      expect(await registry.isOver18(user1.address)).to.be.false;
      expect(await registry.isUnique(user1.address)).to.be.false;
    });

    it("should burn MHT on revocation", async function () {
      await registry.connect(user1).revokeIdentity();

      await expect(token.ownerOf(1)).to.be.revertedWithCustomError(
        token,
        "ERC721NonexistentToken"
      );
      expect(await token.hasMinted(user1.address)).to.be.false;
    });

    it("should emit IdentityRevoked event", async function () {
      await expect(registry.connect(user1).revokeIdentity())
        .to.emit(registry, "IdentityRevoked")
        .withArgs(user1.address, () => true);
    });

    it("should keep commitment as used after revocation", async function () {
      await registry.connect(user1).revokeIdentity();

      // Commitment is still marked as used — prevents re-registration
      expect(await registry.usedCommitments(commitment1)).to.be.true;
    });

    it("should revert if not verified", async function () {
      await expect(
        registry.connect(user2).revokeIdentity()
      ).to.be.revertedWithCustomError(registry, "NotVerified");
    });
  });

  describe("View Functions", function () {
    it("should return false for unverified user", async function () {
      expect(await registry.isHuman(user1.address)).to.be.false;
      expect(await registry.isOver18(user1.address)).to.be.false;
      expect(await registry.isUnique(user1.address)).to.be.false;
    });

    it("should return correct identity struct", async function () {
      const identity = await registry.getIdentity(user1.address);
      expect(identity.isHuman).to.be.false;
      expect(identity.commitmentHash).to.equal(0);
      expect(identity.tokenId).to.equal(0);
    });
  });
});
