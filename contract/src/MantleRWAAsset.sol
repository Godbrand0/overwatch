// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MantleRWAAsset
 * @dev A sample RWA compliant contract for testing Overwatch deployment and tracking.
 * Implements signatures recognized by the RWA compliance detector.
 */
contract MantleRWAAsset is ERC20, Ownable {
    address public identityRegistry;
    address public compliance;
    
    mapping(address => bool) private _verifiedIdentities;

    event IdentityRegistrySet(address indexed registry);
    event ComplianceSet(address indexed compliance);
    event IdentityVerified(address indexed identity);

    constructor(string memory name, string memory symbol, address initialOwner) 
        ERC20(name, symbol) 
        Ownable(initialOwner) 
    {}

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
     * @dev ERC-3643 signature: isVerified
     */
    function isVerified(address _identity) external view returns (bool) {
        return _verifiedIdentities[_identity];
    }

    /**
     * @dev Custom RWA Keyword: nav
     */
    function updateNAV(uint256 _newNAV) external onlyOwner {
        // Logic for updating Net Asset Value
    }

    /**
     * @dev Custom RWA Keyword: custodian
     */
    function getCustodian() external pure returns (string memory) {
        return "Mantle Custody Services";
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
