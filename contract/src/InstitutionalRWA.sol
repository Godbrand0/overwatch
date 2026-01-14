// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title InstitutionalRWA
 * @dev A premium RWA contract designed for institutional use with compliance and role-based access.
 */
contract InstitutionalRWA is ERC20, AccessControl, Pausable {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct AssetMetadata {
        string jurisdiction;
        string assetClass;
        string custodian;
        uint256 nav;
        uint256 lastNavUpdate;
        string offchainAssetId;
    }

    AssetMetadata public assetMetadata;
    mapping(address => bool) public isVerified;
    mapping(address => bool) public isFrozen;

    event IdentityVerified(address indexed account, bool status);
    event AccountFrozen(address indexed account, bool status);
    event NavUpdated(uint256 newNav, uint256 timestamp);

    constructor(
        string memory name,
        string memory symbol,
        address admin,
        string memory jurisdiction,
        string memory assetClass,
        uint256 initialNav,
        string memory custodian,
        string memory offchainAssetId
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);

        assetMetadata = AssetMetadata({
            jurisdiction: jurisdiction,
            assetClass: assetClass,
            custodian: custodian,
            nav: initialNav,
            lastNavUpdate: block.timestamp,
            offchainAssetId: offchainAssetId
        });
    }

    /**
     * @dev Update the Net Asset Value (NAV).
     */
    function updateNav(uint256 newNav) external onlyRole(DEFAULT_ADMIN_ROLE) {
        assetMetadata.nav = newNav;
        assetMetadata.lastNavUpdate = block.timestamp;
        emit NavUpdated(newNav, block.timestamp);
    }

    /**
     * @dev Verify an identity for compliance.
     */
    function verifyIdentity(address account, bool status) external onlyRole(COMPLIANCE_ROLE) {
        isVerified[account] = status;
        emit IdentityVerified(account, status);
    }

    /**
     * @dev Freeze or unfreeze an account.
     */
    function setAccountFreeze(address account, bool status) external onlyRole(COMPLIANCE_ROLE) {
        isFrozen[account] = status;
        emit AccountFrozen(account, status);
    }

    /**
     * @dev Mint new tokens.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(isVerified[to], "Recipient not verified");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens.
     */
    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
    }

    /**
     * @dev Pause all transfers.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause transfers.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Internal function to update balances and enforce compliance.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        if (from != address(0)) {
            require(!isFrozen[from], "Sender account is frozen");
            require(isVerified[from], "Sender not verified");
        }
        
        if (to != address(0)) {
            require(!isFrozen[to], "Recipient account is frozen");
            require(isVerified[to], "Recipient not verified");
        }

        super._update(from, to, value);
    }
}
