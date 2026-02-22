// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadIDSubscription is Ownable {
    enum Tier { Free, Pro, Enterprise }

    struct Subscription {
        Tier tier;
        uint256 expiresAt;
        uint256 verificationsUsed;
        uint256 verificationLimit;
    }

    mapping(address => Subscription) public subscriptions;

    uint256 public constant PRO_PRICE = 100 ether;
    uint256 public constant ENTERPRISE_PRICE = 1000 ether;
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;

    uint256 public constant FREE_LIMIT = 100;
    uint256 public constant PRO_LIMIT = 10_000;
    uint256 public constant ENTERPRISE_LIMIT = type(uint256).max;

    event Subscribed(address indexed subscriber, Tier tier, uint256 expiresAt);
    event Renewed(address indexed subscriber, Tier tier, uint256 expiresAt);
    event Withdrawn(address indexed owner, uint256 amount);

    error InvalidTier();
    error IncorrectPayment();
    error NoActiveSubscription();
    error AlreadySubscribed();
    error NothingToWithdraw();

    constructor() Ownable(msg.sender) {}

    function subscribe(Tier _tier) external payable {
        if (_tier == Tier.Free) {
            if (msg.value != 0) revert IncorrectPayment();
            Subscription storage sub = subscriptions[msg.sender];
            if (sub.verificationLimit > 0) revert AlreadySubscribed();
            sub.tier = Tier.Free;
            sub.expiresAt = type(uint256).max;
            sub.verificationsUsed = 0;
            sub.verificationLimit = FREE_LIMIT;
            emit Subscribed(msg.sender, Tier.Free, type(uint256).max);
            return;
        }

        uint256 requiredPrice;
        uint256 limit;

        if (_tier == Tier.Pro) {
            requiredPrice = PRO_PRICE;
            limit = PRO_LIMIT;
        } else if (_tier == Tier.Enterprise) {
            requiredPrice = ENTERPRISE_PRICE;
            limit = ENTERPRISE_LIMIT;
        } else {
            revert InvalidTier();
        }

        if (msg.value != requiredPrice) revert IncorrectPayment();

        uint256 expiresAt = block.timestamp + SUBSCRIPTION_DURATION;

        subscriptions[msg.sender] = Subscription({
            tier: _tier,
            expiresAt: expiresAt,
            verificationsUsed: 0,
            verificationLimit: limit
        });

        emit Subscribed(msg.sender, _tier, expiresAt);
    }

    function renew() external payable {
        Subscription storage sub = subscriptions[msg.sender];
        if (sub.verificationLimit == 0) revert NoActiveSubscription();
        if (sub.tier == Tier.Free) revert InvalidTier();

        uint256 requiredPrice = sub.tier == Tier.Pro ? PRO_PRICE : ENTERPRISE_PRICE;
        if (msg.value != requiredPrice) revert IncorrectPayment();

        uint256 baseTime = sub.expiresAt > block.timestamp ? sub.expiresAt : block.timestamp;
        sub.expiresAt = baseTime + SUBSCRIPTION_DURATION;
        sub.verificationsUsed = 0;

        emit Renewed(msg.sender, sub.tier, sub.expiresAt);
    }

    function getSubscription(address _subscriber) external view returns (Subscription memory) {
        return subscriptions[_subscriber];
    }

    function isActive(address _subscriber) external view returns (bool) {
        Subscription storage sub = subscriptions[_subscriber];
        if (sub.verificationLimit == 0) return false;
        if (sub.tier == Tier.Free) return true;
        return block.timestamp < sub.expiresAt;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();
        payable(owner()).transfer(balance);
        emit Withdrawn(owner(), balance);
    }
}
