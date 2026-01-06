// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RWAAnchor
 * @dev A registry to anchor RWA legal and technical profiles on-chain.
 * This contract creates a verifiable linkage between a deployer, an asset contract,
 * and hashed legal documentation.
 */
contract RWAAnchor {
    
    enum RWAType { 
        UNDEFINED,
        REAL_ESTATE, 
        TREASURY, 
        INVOICE, 
        GOLD, 
        EQUITY, 
        DEBT,
        OTHER 
    }

    enum LegalRight { 
        UNDEFINED,
        EQUITY, 
        DEBT, 
        REVENUE_SHARE, 
        BENEFICIAL_OWNERSHIP,
        OTHER 
    }

    struct RWAProfile {
        RWAType rwaType;
        LegalRight legalRight;
        string jurisdiction; // ISO Country Code or Name
        bool redeemable;
        address custodian;
        bytes32 legalDocHash; // SHA-256 hash of the primary legal document
        address deployer;
        string offchainAssetId;
        uint256 timestamp;
    }

    event AssetAnchored(
        address indexed contractAddress,
        address indexed deployer,
        RWAType rwaType,
        LegalRight legalRight,
        bytes32 legalDocHash,
        uint256 timestamp
    );

    mapping(address => RWAProfile) public assetRegistry;
    mapping(address => bool) public isAnchored;
    address[] public anchoredAssets;

    /**
     * @dev Register and anchor an RWA asset profile.
     * @param _contractAddress The address of the deployed RWA contract.
     * @param _type The category of the RWA.
     * @param _right The legal right represented by the token.
     * @param _jurisdiction The legal jurisdiction (e.g., "UK", "US").
     * @param _redeemable Whether the asset is redeemable.
     * @param _custodian The address of the custodian.
     * @param _legalDocHash The hash of the primary legal document.
     * @param _offchainAssetId The identifier in the off-chain registry.
     */
    function registerAsset(
        address _contractAddress,
        RWAType _type,
        LegalRight _right,
        string calldata _jurisdiction,
        bool _redeemable,
        address _custodian,
        bytes32 _legalDocHash,
        string calldata _offchainAssetId
    ) external {
        require(!isAnchored[_contractAddress], "Asset already anchored");
        require(_contractAddress != address(0), "Invalid contract address");

        assetRegistry[_contractAddress] = RWAProfile({
            rwaType: _type,
            legalRight: _right,
            jurisdiction: _jurisdiction,
            redeemable: _redeemable,
            custodian: _custodian,
            legalDocHash: _legalDocHash,
            deployer: msg.sender,
            offchainAssetId: _offchainAssetId,
            timestamp: block.timestamp
        });

        isAnchored[_contractAddress] = true;
        anchoredAssets.push(_contractAddress);

        emit AssetAnchored(
            _contractAddress,
            msg.sender,
            _type,
            _right,
            _legalDocHash,
            block.timestamp
        );
    }

    /**
     * @dev Get the total number of anchored assets.
     */
    function getAnchoredCount() external view returns (uint256) {
        return anchoredAssets.length;
    }

    /**
     * @dev Get the full RWA profile for a contract.
     */
    function getProfile(address _contractAddress) external view returns (RWAProfile memory) {
        require(isAnchored[_contractAddress], "Asset not anchored");
        return assetRegistry[_contractAddress];
    }
}
