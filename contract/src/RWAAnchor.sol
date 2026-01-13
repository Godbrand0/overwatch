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
        bytes32[] legalDocHashes; // Array of SHA-256 hashes of legal documents
        address deployer;
        string offchainAssetId;
        uint256 timestamp;
        string tokenName;
        string tokenSymbol;
        uint256 totalSupply;
        uint256 nav;
    }

    event AssetAnchored(
        address indexed contractAddress,
        address indexed deployer,
        RWAType rwaType,
        LegalRight legalRight,
        bytes32[] legalDocHashes,
        uint256 timestamp,
        string tokenName,
        string tokenSymbol,
        uint256 totalSupply,
        uint256 nav
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
        bytes32[] calldata _legalDocHashes,
        string calldata _offchainAssetId,
        string calldata _tokenName,
        string calldata _tokenSymbol,
        uint256 _totalSupply,
        uint256 _nav
    ) external {
        require(!isAnchored[_contractAddress], "Asset already anchored");
        require(_contractAddress != address(0), "Invalid contract address");
        require(_legalDocHashes.length > 0, "At least one legal document hash required");

        assetRegistry[_contractAddress] = RWAProfile({
            rwaType: _type,
            legalRight: _right,
            jurisdiction: _jurisdiction,
            redeemable: _redeemable,
            custodian: _custodian,
            legalDocHashes: _legalDocHashes,
            deployer: msg.sender,
            offchainAssetId: _offchainAssetId,
            timestamp: block.timestamp,
            tokenName: _tokenName,
            tokenSymbol: _tokenSymbol,
            totalSupply: _totalSupply,
            nav: _nav
        });

        isAnchored[_contractAddress] = true;
        anchoredAssets.push(_contractAddress);

        emit AssetAnchored(
            _contractAddress,
            msg.sender,
            _type,
            _right,
            _legalDocHashes,
            block.timestamp,
            _tokenName,
            _tokenSymbol,
            _totalSupply,
            _nav
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
