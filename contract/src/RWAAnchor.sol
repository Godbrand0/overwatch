// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RWAAnchor
 * @dev A simple registry to anchor RWA proofs on-chain.
 * This contract allows developers to link a contract address to a cryptographic proof hash.
 */
contract RWAAnchor {
    event ProofAnchored(
        address indexed contractAddress,
        address indexed deployer,
        bytes32 manifestHash,
        string assetId,
        uint256 timestamp
    );

    mapping(address => bytes32) public proofs;
    mapping(address => address) public deployers;

    /**
     * @dev Anchor a proof for a contract.
     * @param _contractAddress The address of the deployed RWA contract.
     * @param _manifestHash The keccak256 hash of the proof manifest.
     * @param _assetId The identifier of the asset (e.g. "mTBILL").
     */
    function anchorProof(
        address _contractAddress,
        bytes32 _manifestHash,
        string calldata _assetId
    ) external {
        proofs[_contractAddress] = _manifestHash;
        deployers[_contractAddress] = msg.sender;

        emit ProofAnchored(
            _contractAddress,
            msg.sender,
            _manifestHash,
            _assetId,
            block.timestamp
        );
    }

    /**
     * @dev Get the proof hash for a contract.
     */
    function getProof(address _contractAddress) external view returns (bytes32) {
        return proofs[_contractAddress];
    }
}
