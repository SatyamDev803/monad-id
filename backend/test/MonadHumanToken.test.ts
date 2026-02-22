import { expect } from "chai";
import { ethers } from "hardhat";
import { MonadHumanToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MonadHumanToken", function () {
  let token: MonadHumanToken;
  let owner: HardhatEthersSigner;
  let registry: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, registry, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MonadHumanToken");
    token = await Factory.deploy();
    await token.setIdentityRegistry(registry.address);
  });

  describe("Deployment", function () {
    it("should set deployer as owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("Monad Human Token");
      expect(await token.symbol()).to.equal("MHT");
    });
  });

  describe("setIdentityRegistry", function () {
    it("should set registry address", async function () {
      expect(await token.identityRegistry()).to.equal(registry.address);
    });

    it("should revert when called by non-owner", async function () {
      await expect(
        token.connect(user1).setIdentityRegistry(user1.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    it("should mint from registry", async function () {
      await token.connect(registry).mint(user1.address);
      expect(await token.ownerOf(1)).to.equal(user1.address);
      expect(await token.hasMinted(user1.address)).to.be.true;
      expect(await token.tokenOfOwner(user1.address)).to.equal(1);
    });

    it("should return the token ID", async function () {
      const tx = await token.connect(registry).mint(user1.address);
      const receipt = await tx.wait();
      // tokenId should be 1 for first mint
      expect(await token.tokenOfOwner(user1.address)).to.equal(1);
    });

    it("should increment token IDs", async function () {
      await token.connect(registry).mint(user1.address);
      await token.connect(registry).mint(user2.address);
      expect(await token.tokenOfOwner(user1.address)).to.equal(1);
      expect(await token.tokenOfOwner(user2.address)).to.equal(2);
    });

    it("should revert mint from non-registry", async function () {
      await expect(
        token.connect(user1).mint(user1.address)
      ).to.be.revertedWithCustomError(token, "OnlyRegistry");
    });

    it("should revert double mint for same address", async function () {
      await token.connect(registry).mint(user1.address);
      await expect(
        token.connect(registry).mint(user1.address)
      ).to.be.revertedWithCustomError(token, "AlreadyMinted");
    });
  });

  describe("Soulbound (Non-Transferable)", function () {
    it("should block transfers", async function () {
      await token.connect(registry).mint(user1.address);
      await expect(
        token.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWithCustomError(token, "NonTransferable");
    });

    it("should block safeTransferFrom", async function () {
      await token.connect(registry).mint(user1.address);
      await expect(
        token
          .connect(user1)
          ["safeTransferFrom(address,address,uint256)"](
            user1.address,
            user2.address,
            1
          )
      ).to.be.revertedWithCustomError(token, "NonTransferable");
    });
  });

  describe("Burn", function () {
    it("should allow registry to burn", async function () {
      await token.connect(registry).mint(user1.address);
      await token.connect(registry).burn(1);
      expect(await token.hasMinted(user1.address)).to.be.false;
      expect(await token.tokenOfOwner(user1.address)).to.equal(0);
    });

    it("should revert burn from non-registry", async function () {
      await token.connect(registry).mint(user1.address);
      await expect(
        token.connect(user1).burn(1)
      ).to.be.revertedWithCustomError(token, "OnlyRegistry");
    });
  });
});
