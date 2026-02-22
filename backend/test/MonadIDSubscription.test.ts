import { expect } from "chai";
import { ethers } from "hardhat";
import { MonadIDSubscription } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MonadIDSubscription", function () {
  let subscription: MonadIDSubscription;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const PRO_PRICE = ethers.parseEther("100");
  const ENTERPRISE_PRICE = ethers.parseEther("1000");
  const THIRTY_DAYS = 30 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MonadIDSubscription");
    subscription = await Factory.deploy();
  });

  describe("Deployment", function () {
    it("should set deployer as owner", async function () {
      expect(await subscription.owner()).to.equal(owner.address);
    });
  });

  describe("Free Tier", function () {
    it("should subscribe to free tier", async function () {
      await subscription.connect(user1).subscribe(0); // Tier.Free
      const sub = await subscription.getSubscription(user1.address);
      expect(sub.tier).to.equal(0);
      expect(sub.verificationLimit).to.equal(100);
    });

    it("should revert free tier with payment", async function () {
      await expect(
        subscription.connect(user1).subscribe(0, { value: 1 })
      ).to.be.revertedWithCustomError(subscription, "IncorrectPayment");
    });

    it("should revert double subscribe to free tier", async function () {
      await subscription.connect(user1).subscribe(0);
      await expect(
        subscription.connect(user1).subscribe(0)
      ).to.be.revertedWithCustomError(subscription, "AlreadySubscribed");
    });

    it("should always be active for free tier", async function () {
      await subscription.connect(user1).subscribe(0);
      expect(await subscription.isActive(user1.address)).to.be.true;
    });
  });

  describe("Pro Tier", function () {
    it("should subscribe to pro tier with correct payment", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      const sub = await subscription.getSubscription(user1.address);
      expect(sub.tier).to.equal(1);
      expect(sub.verificationLimit).to.equal(10_000);
    });

    it("should set expiry to 30 days from now", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      const sub = await subscription.getSubscription(user1.address);
      const now = await time.latest();
      expect(sub.expiresAt).to.be.closeTo(now + THIRTY_DAYS, 5);
    });

    it("should emit Subscribed event", async function () {
      await expect(
        subscription.connect(user1).subscribe(1, { value: PRO_PRICE })
      ).to.emit(subscription, "Subscribed");
    });

    it("should revert with incorrect payment", async function () {
      await expect(
        subscription.connect(user1).subscribe(1, { value: ethers.parseEther("50") })
      ).to.be.revertedWithCustomError(subscription, "IncorrectPayment");
    });

    it("should be active within 30 days", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      expect(await subscription.isActive(user1.address)).to.be.true;
    });

    it("should be inactive after 30 days", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      await time.increase(THIRTY_DAYS + 1);
      expect(await subscription.isActive(user1.address)).to.be.false;
    });
  });

  describe("Enterprise Tier", function () {
    it("should subscribe to enterprise tier", async function () {
      await subscription.connect(user1).subscribe(2, { value: ENTERPRISE_PRICE });
      const sub = await subscription.getSubscription(user1.address);
      expect(sub.tier).to.equal(2);
    });

    it("should revert with incorrect payment", async function () {
      await expect(
        subscription.connect(user1).subscribe(2, { value: PRO_PRICE })
      ).to.be.revertedWithCustomError(subscription, "IncorrectPayment");
    });
  });

  describe("Renew", function () {
    it("should renew active subscription", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      const sub1 = await subscription.getSubscription(user1.address);

      await subscription.connect(user1).renew({ value: PRO_PRICE });
      const sub2 = await subscription.getSubscription(user1.address);

      expect(sub2.expiresAt).to.be.greaterThan(sub1.expiresAt);
      expect(sub2.verificationsUsed).to.equal(0);
    });

    it("should renew expired subscription from current time", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      await time.increase(THIRTY_DAYS + 1);

      await subscription.connect(user1).renew({ value: PRO_PRICE });
      const sub = await subscription.getSubscription(user1.address);
      const now = await time.latest();
      expect(sub.expiresAt).to.be.closeTo(now + THIRTY_DAYS, 5);
    });

    it("should revert renew with no subscription", async function () {
      await expect(
        subscription.connect(user1).renew({ value: PRO_PRICE })
      ).to.be.revertedWithCustomError(subscription, "NoActiveSubscription");
    });

    it("should revert renew on free tier", async function () {
      await subscription.connect(user1).subscribe(0);
      await expect(
        subscription.connect(user1).renew({ value: 0 })
      ).to.be.revertedWithCustomError(subscription, "InvalidTier");
    });
  });

  describe("Withdraw", function () {
    it("should allow owner to withdraw", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await subscription.connect(owner).withdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("should revert withdraw from non-owner", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      await expect(
        subscription.connect(user1).withdraw()
      ).to.be.revertedWithCustomError(subscription, "OwnableUnauthorizedAccount");
    });

    it("should revert withdraw when empty", async function () {
      await expect(
        subscription.connect(owner).withdraw()
      ).to.be.revertedWithCustomError(subscription, "NothingToWithdraw");
    });

    it("should emit Withdrawn event", async function () {
      await subscription.connect(user1).subscribe(1, { value: PRO_PRICE });
      await expect(subscription.connect(owner).withdraw())
        .to.emit(subscription, "Withdrawn")
        .withArgs(owner.address, PRO_PRICE);
    });
  });

  describe("View Functions", function () {
    it("should return false for non-subscriber", async function () {
      expect(await subscription.isActive(user1.address)).to.be.false;
    });

    it("should return empty subscription for non-subscriber", async function () {
      const sub = await subscription.getSubscription(user1.address);
      expect(sub.verificationLimit).to.equal(0);
    });
  });
});
