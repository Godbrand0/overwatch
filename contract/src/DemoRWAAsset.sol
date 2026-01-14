// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DemoRWAAsset
 * @dev A comprehensive RWA compliant contract for demonstrating Overwatch capabilities.
 * Implements ERC-3643 signatures and additional RWA-specific features.
 * 
 * This contract represents tokenized real-world assets such as:
 * - Real estate properties
 * - Treasury bills
 * - Corporate bonds
 * - Physical commodities (gold, art, etc.)
 */
contract DemoRWAAsset is ERC20, Ownable {
    // ERC-3643 compliance
    address public identityRegistry;
    address public compliance;
    
    // RWA-specific properties
    string public assetJurisdiction;      // Legal jurisdiction (e.g., "US", "UK", "SG")
    string public assetClass;            // Asset class (e.g., "Real Estate", "Treasury")
    uint256 public nav;                 // Net Asset Value in base currency
    string public custodian;             // Custodian name
    uint256 public lastNavUpdate;        // Timestamp of last NAV update
    
    // Investor management
    mapping(address => bool) private _verifiedIdentities;
    mapping(address => bool) private _whitelisted;
    mapping(address => uint256) private _investmentLimits;
    uint256 public maxInvestmentPerAddress = 1000000 * 10**18; // 1M tokens max per address
    
    // Compliance tracking
    mapping(address => uint256) private _lastTransferTime;
    uint256 public constant TRANSFER_COOLDOWN = 24 hours; // 24 hour cooldown for compliance
    mapping(address => bool) private _frozenAccounts;
    
    // Events for monitoring
    event IdentityRegistrySet(address indexed registry);
    event ComplianceSet(address indexed compliance);
    event IdentityVerified(address indexed identity, bool verified);
    event NavUpdated(uint256 oldNav, uint256 newNav, uint256 timestamp);
    event AssetFrozen(address indexed account, bool frozen);
    event WhitelistUpdated(address indexed account, bool whitelisted);
    event CustodianChanged(string oldCustodian, string newCustodian);
    event JurisdictionChanged(string oldJurisdiction, string newJurisdiction);
    
    // ERC-3643 required events
    event Issued(address indexed to, uint256 amount);
    event Redeemed(address indexed from, uint256 amount);
    event ForcedTransfer(address indexed from, address indexed to, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        string memory _assetJurisdiction,
        string memory _assetClass,
        uint256 initialNav,
        string memory _custodian
    ) ERC20(name, symbol) Ownable(initialOwner) {
        assetJurisdiction = _assetJurisdiction;
        assetClass = _assetClass;
        nav = initialNav;
        custodian = _custodian;
        lastNavUpdate = block.timestamp;
        
        // Mint initial supply to owner
        uint256 initialSupply = 1000000 * 10**18; // 1M tokens initially
        _mint(initialOwner, initialSupply);
        emit Issued(initialOwner, initialSupply);
    }
    
    /**
     * @dev ERC-3643 signature: identityRegistry
     */
    function getIdentityRegistry() external view returns (address) {
        return identityRegistry;
    }
    
    /**
     * @dev ERC-3643 signature: setIdentityRegistry
     */
    function setIdentityRegistry(address _identityRegistry) external onlyOwner {
        identityRegistry = _identityRegistry;
        emit IdentityRegistrySet(_identityRegistry);
    }
    
    /**
     * @dev ERC-3643 signature: compliance
     */
    function getCompliance() external view returns (address) {
        return compliance;
    }
    
    /**
     * @dev ERC-3643 signature: setCompliance
     */
    function setCompliance(address _compliance) external onlyOwner {
        compliance = _compliance;
        emit ComplianceSet(_compliance);
    }
    
    /**
     * @dev ERC-3643 signature: isVerified
     */
    function isVerified(address _identity) external view returns (bool) {
        return _verifiedIdentities[_identity];
    }
    
    /**
     * @dev ERC-3643 signature: verifyIdentity
     */
    function verifyIdentity(address _identity, bool _verified) external {
        require(
            msg.sender == identityRegistry || msg.sender == owner(),
            "Only identity registry or owner can verify identities"
        );
        _verifiedIdentities[_identity] = _verified;
        emit IdentityVerified(_identity, _verified);
    }
    
    /**
     * @dev Custom RWA Keyword: nav
     * Updates the Net Asset Value of the underlying asset
     */
    function updateNav(uint256 newNav) external onlyOwner {
        require(newNav > 0, "NAV must be greater than 0");
        uint256 oldNav = nav;
        nav = newNav;
        lastNavUpdate = block.timestamp;
        emit NavUpdated(oldNav, newNav, block.timestamp);
    }
    
    /**
     * @dev Custom RWA Keyword: custodian
     * Returns the custodian information
     */
    function getCustodian() external view returns (string memory) {
        return custodian;
    }
    
    /**
     * @dev Custom RWA Keyword: setCustodian
     * Updates the custodian information
     */
    function setCustodian(string memory _custodian) external onlyOwner {
        string memory oldCustodian = custodian;
        custodian = _custodian;
        emit CustodianChanged(oldCustodian, _custodian);
    }
    
    /**
     * @dev Custom RWA Keyword: jurisdiction
     * Returns the asset jurisdiction
     */
    function getJurisdiction() external view returns (string memory) {
        return assetJurisdiction;
    }
    
    /**
     * @dev Custom RWA Keyword: setJurisdiction
     * Updates the asset jurisdiction
     */
    function setJurisdiction(string memory _jurisdiction) external onlyOwner {
        string memory oldJurisdiction = assetJurisdiction;
        assetJurisdiction = _jurisdiction;
        emit JurisdictionChanged(oldJurisdiction, _jurisdiction);
    }
    
    /**
     * @dev Custom RWA Keyword: assetClass
     * Returns the asset class
     */
    function getAssetClass() external view returns (string memory) {
        return assetClass;
    }
    
    /**
     * @dev Whitelist management for investor compliance
     */
    function addToWhitelist(address _investor) external onlyOwner {
        _whitelisted[_investor] = true;
        emit WhitelistUpdated(_investor, true);
    }
    
    function removeFromWhitelist(address _investor) external onlyOwner {
        _whitelisted[_investor] = false;
        emit WhitelistUpdated(_investor, false);
    }
    
    function isWhitelisted(address _investor) external view returns (bool) {
        return _whitelisted[_investor];
    }
    
    /**
     * @dev Set investment limit for specific addresses
     */
    function setInvestmentLimit(address _investor, uint256 _limit) external onlyOwner {
        _investmentLimits[_investor] = _limit;
    }
    
    function getInvestmentLimit(address _investor) external view returns (uint256) {
        return _investmentLimits[_investor] > 0 ? _investmentLimits[_investor] : maxInvestmentPerAddress;
    }
    
    /**
     * @dev Freeze/unfreeze accounts for compliance
     */
    function freezeAccount(address _account) external {
        require(
            msg.sender == compliance || msg.sender == owner(),
            "Only compliance or owner can freeze accounts"
        );
        _frozenAccounts[_account] = true;
        emit AssetFrozen(_account, true);
    }
    
    function unfreezeAccount(address _account) external {
        require(
            msg.sender == compliance || msg.sender == owner(),
            "Only compliance or owner can unfreeze accounts"
        );
        _frozenAccounts[_account] = false;
        emit AssetFrozen(_account, false);
    }
    
    function isFrozen(address _account) external view returns (bool) {
        return _frozenAccounts[_account];
    }
    
    /**
     * @dev ERC-3643 signature: issue
     * Mint new tokens to a verified address
     */
    function issue(address _to, uint256 _amount) external onlyOwner {
        require(_verifiedIdentities[_to], "Recipient must be verified");
        require(_to != address(0), "Cannot issue to zero address");
        
        _mint(_to, _amount);
        emit Issued(_to, _amount);
    }
    
    /**
     * @dev ERC-3643 signature: redeem
     * Burn tokens from a verified address
     */
    function redeem(uint256 _amount) external {
        require(_verifiedIdentities[msg.sender], "Caller must be verified");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        _burn(msg.sender, _amount);
        emit Redeemed(msg.sender, _amount);
    }
    
    /**
     * @dev ERC-3643 signature: forcedTransfer
     * Transfer tokens from one address to another (compliance function)
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) external onlyOwner {
        require(
            msg.sender == compliance || msg.sender == owner(),
            "Only compliance or owner can force transfer"
        );
        require(_verifiedIdentities[_from], "Source must be verified");
        require(_verifiedIdentities[_to], "Destination must be verified");
        
        _transfer(_from, _to, _amount);
        emit ForcedTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Override transfer for compliance checks
     */
    function transfer(address _to, uint256 _amount) public override returns (bool) {
        require(!_frozenAccounts[msg.sender], "Sender account is frozen");
        require(!_frozenAccounts[_to], "Recipient account is frozen");
        require(_verifiedIdentities[msg.sender], "Sender must be verified");
        require(_verifiedIdentities[_to], "Recipient must be verified");
        require(_whitelisted[msg.sender], "Sender must be whitelisted");
        require(_whitelisted[_to], "Recipient must be whitelisted");
        
        // Check investment limits
        uint256 recipientBalance = balanceOf(_to);
        uint256 newBalance = recipientBalance + _amount;
        uint256 limit = _investmentLimits[_to] > 0 ? _investmentLimits[_to] : maxInvestmentPerAddress;
        require(newBalance <= limit, "Exceeds investment limit");
        
        // Check transfer cooldown (compliance)
        require(
            block.timestamp >= _lastTransferTime[msg.sender] + TRANSFER_COOLDOWN,
            "Transfer cooldown not met"
        );
        
        _lastTransferTime[msg.sender] = block.timestamp;
        
        return super.transfer(_to, _amount);
    }
    
    /**
     * @dev Override transferFrom for compliance checks
     */
    function transferFrom(address _from, address _to, uint256 _amount) public override returns (bool) {
        require(!_frozenAccounts[_from], "Source account is frozen");
        require(!_frozenAccounts[_to], "Recipient account is frozen");
        require(_verifiedIdentities[_from], "Source must be verified");
        require(_verifiedIdentities[_to], "Recipient must be verified");
        require(_whitelisted[_from], "Source must be whitelisted");
        require(_whitelisted[_to], "Recipient must be whitelisted");
        
        // Check investment limits
        uint256 recipientBalance = balanceOf(_to);
        uint256 newBalance = recipientBalance + _amount;
        uint256 limit = _investmentLimits[_to] > 0 ? _investmentLimits[_to] : maxInvestmentPerAddress;
        require(newBalance <= limit, "Exceeds investment limit");
        
        // Check transfer cooldown (compliance)
        require(
            block.timestamp >= _lastTransferTime[_from] + TRANSFER_COOLDOWN,
            "Transfer cooldown not met"
        );
        
        _lastTransferTime[_from] = block.timestamp;
        
        return super.transferFrom(_from, _to, _amount);
    }
    
    /**
     * @dev Pause contract for emergency
     */
    
    /**
     * @dev Get comprehensive asset information
     */
    function getAssetInfo() external view returns (
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _nav,
        string memory _jurisdiction,
        string memory _assetClass,
        string memory _custodian,
        uint256 _lastNavUpdate,
        bool _paused
    ) {
        return (
            name(),
            symbol(),
            totalSupply(),
            nav,
            assetJurisdiction,
            assetClass,
            custodian,
            lastNavUpdate,
            false // Always not paused since we removed Pausable
        );
    }
    
    /**
     * @dev Get compliance status of an address
     */
    function getComplianceStatus(address _address) external view returns (
        bool verified,
        bool whitelisted,
        bool frozen,
        uint256 investmentLimit,
        uint256 lastTransfer
    ) {
        return (
            _verifiedIdentities[_address],
            _whitelisted[_address],
            _frozenAccounts[_address],
            _investmentLimits[_address] > 0 ? _investmentLimits[_address] : maxInvestmentPerAddress,
            _lastTransferTime[_address]
        );
    }
}