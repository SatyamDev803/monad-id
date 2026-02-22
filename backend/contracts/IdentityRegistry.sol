// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MonadHumanToken.sol";

interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals
    ) external view returns (bool);
}

contract IdentityRegistry {
    IGroth16Verifier public immutable verifier;
    MonadHumanToken public immutable humanToken;

    struct Identity {
        bool isHuman;
        bool isOver18;
        uint256 commitmentHash;
        uint256 tokenId;
        uint256 verifiedAt;
    }

    mapping(address => Identity) public identities;
    mapping(uint256 => bool) public usedCommitments;

    event IdentityVerified(
        address indexed user,
        uint256 commitmentHash,
        uint256 tokenId,
        uint256 timestamp
    );
    event IdentityRevoked(address indexed user, uint256 timestamp);

    error InvalidProof();
    error AlreadyVerified();
    error CommitmentAlreadyUsed();
    error NotVerified();
    error InvalidAgeThreshold();

    uint256 public constant AGE_THRESHOLD = 18;

    constructor(address _verifier, address _humanToken) {
        verifier = IGroth16Verifier(_verifier);
        humanToken = MonadHumanToken(_humanToken);
    }

    function verifyAndRegister(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals
    ) external {
        if (identities[msg.sender].isHuman) revert AlreadyVerified();

        uint256 commitment = _pubSignals[0];
        uint256 ageThreshold = _pubSignals[1];

        if (ageThreshold != AGE_THRESHOLD) revert InvalidAgeThreshold();
        if (usedCommitments[commitment]) revert CommitmentAlreadyUsed();

        bool valid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        if (!valid) revert InvalidProof();

        uint256 tokenId = humanToken.mint(msg.sender);

        identities[msg.sender] = Identity({
            isHuman: true,
            isOver18: true,
            commitmentHash: commitment,
            tokenId: tokenId,
            verifiedAt: block.timestamp
        });

        usedCommitments[commitment] = true;

        emit IdentityVerified(msg.sender, commitment, tokenId, block.timestamp);
    }

    function revokeIdentity() external {
        Identity storage id = identities[msg.sender];
        if (!id.isHuman) revert NotVerified();

        uint256 tokenId = id.tokenId;

        delete identities[msg.sender];

        humanToken.burn(tokenId);

        emit IdentityRevoked(msg.sender, block.timestamp);
    }

    function isHuman(address _user) external view returns (bool) {
        return identities[_user].isHuman;
    }

    function isOver18(address _user) external view returns (bool) {
        return identities[_user].isOver18;
    }

    function isUnique(address _user) external view returns (bool) {
        return identities[_user].commitmentHash != 0;
    }

    function getIdentity(address _user) external view returns (Identity memory) {
        return identities[_user];
    }
}
