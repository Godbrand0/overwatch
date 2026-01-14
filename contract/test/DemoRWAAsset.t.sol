// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DemoRWAAsset.sol";

contract DemoRWAAssetTest is Test {
    DemoRWAAsset public rwaAsset;
    address public owner;
    address public identityRegistry;
    address public compliance;
    address public investor1;
    address public investor2;

    function setUp() public {
        owner = address(0x1);
        identityRegistry = address(0x2);
        compliance = address(0x3);
        investor1 = address(0x4);
        investor2 = address(0x5);

        vm.startPrank(owner);
        rwaAsset = new DemoRWAAsset(
            "Demo Real Estate Token",
            "DRET",
            owner,
            "US",
            "Real Estate",
            1000000 * 10**18, // $1M initial NAV
            "Mantle Custody Services"
        );
        vm.stopPrank();

        // Set up compliance infrastructure
        vm.startPrank(owner);
        rwaAsset.setIdentityRegistry(identityRegistry);
        rwaAsset.setCompliance(compliance);
        vm.stopPrank();
    }

    function testInitialState() public {
        assertEq(rwaAsset.name(), "Demo Real Estate Token");
        assertEq(rwaAsset.symbol(), "DRET");
        assertEq(rwaAsset.totalSupply(), 1000000 * 10**18);
        assertEq(rwaAsset.balanceOf(owner), 1000000 * 10**18);
        assertEq(rwaAsset.nav(), 1000000 * 10**18);
        assertEq(rwaAsset.getJurisdiction(), "US");
        assertEq(rwaAsset.getAssetClass(), "Real Estate");
        assertEq(rwaAsset.getCustodian(), "Mantle Custody Services");
        assertEq(rwaAsset.getIdentityRegistry(), identityRegistry);
        assertEq(rwaAsset.getCompliance(), compliance);
    }

    function testIdentityVerification() public {
        // Verify investor1 through identity registry
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        vm.stopPrank();

        assertTrue(rwaAsset.isVerified(investor1));
        assertFalse(rwaAsset.isVerified(investor2));
    }

    function testWhitelistManagement() public {
        // Add investor1 to whitelist
        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        vm.stopPrank();

        assertTrue(rwaAsset.isWhitelisted(investor1));
        assertFalse(rwaAsset.isWhitelisted(investor2));

        // Remove from whitelist
        vm.startPrank(owner);
        rwaAsset.removeFromWhitelist(investor1);
        vm.stopPrank();

        assertFalse(rwaAsset.isWhitelisted(investor1));
    }

    function testNavUpdate() public {
        uint256 newNav = 1200000 * 10**18; // $1.2M new NAV
        
        vm.startPrank(owner);
        rwaAsset.updateNav(newNav);
        vm.stopPrank();

        assertEq(rwaAsset.nav(), newNav);
    }

    function testCustodianChange() public {
        string memory newCustodian = "New Custody Services";
        
        vm.startPrank(owner);
        rwaAsset.setCustodian(newCustodian);
        vm.stopPrank();

        assertEq(rwaAsset.getCustodian(), newCustodian);
    }

    function testInvestmentLimit() public {
        uint256 limit = 500000 * 10**18; // 500K tokens limit
        
        vm.startPrank(owner);
        rwaAsset.setInvestmentLimit(investor1, limit);
        vm.stopPrank();

        assertEq(rwaAsset.getInvestmentLimit(investor1), limit);
        assertEq(rwaAsset.getInvestmentLimit(investor2), 1000000 * 10**18); // Default limit
    }

    function testAccountFreezing() public {
        // Freeze investor1 account
        vm.startPrank(compliance);
        rwaAsset.freezeAccount(investor1);
        vm.stopPrank();

        assertTrue(rwaAsset.isFrozen(investor1));
        assertFalse(rwaAsset.isFrozen(investor2));

        // Unfreeze account
        vm.startPrank(compliance);
        rwaAsset.unfreezeAccount(investor1);
        vm.stopPrank();

        assertFalse(rwaAsset.isFrozen(investor1));
    }

    function testIssuance() public {
        // Verify and whitelist investor1 first
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        vm.stopPrank();

        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        rwaAsset.issue(investor1, 1000 * 10**18);
        vm.stopPrank();

        assertEq(rwaAsset.balanceOf(investor1), 1000 * 10**18);
        assertEq(rwaAsset.totalSupply(), 1001000 * 10**18);
    }

    function testRedemption() public {
        // Issue tokens to investor1 first
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        vm.stopPrank();

        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        rwaAsset.issue(investor1, 1000 * 10**18);
        vm.stopPrank();

        // Redeem tokens
        vm.startPrank(investor1);
        rwaAsset.redeem(500 * 10**18);
        vm.stopPrank();

        assertEq(rwaAsset.balanceOf(investor1), 500 * 10**18);
        assertEq(rwaAsset.totalSupply(), 1000500 * 10**18);
    }

    function testForcedTransfer() public {
        // Setup: issue tokens to investor1
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        rwaAsset.verifyIdentity(investor2, true);
        vm.stopPrank();

        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        rwaAsset.addToWhitelist(investor2);
        rwaAsset.issue(investor1, 1000 * 10**18);
        vm.stopPrank();

        // Force transfer from investor1 to investor2
        vm.startPrank(compliance);
        rwaAsset.forcedTransfer(investor1, investor2, 500 * 10**18);
        vm.stopPrank();

        assertEq(rwaAsset.balanceOf(investor1), 500 * 10**18);
        assertEq(rwaAsset.balanceOf(investor2), 500 * 10**18);
    }

    function testComplianceTransfer() public {
        // Setup: verify and whitelist investors
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        rwaAsset.verifyIdentity(investor2, true);
        vm.stopPrank();

        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        rwaAsset.addToWhitelist(investor2);
        rwaAsset.issue(investor1, 1000 * 10**18);
        vm.stopPrank();

        // Transfer from investor1 to investor2
        vm.startPrank(investor1);
        rwaAsset.transfer(investor2, 500 * 10**18);
        vm.stopPrank();

        assertEq(rwaAsset.balanceOf(investor1), 500 * 10**18);
        assertEq(rwaAsset.balanceOf(investor2), 500 * 10**18);
    }

    function testTransferCooldown() public {
        // Setup: verify and whitelist investors
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        rwaAsset.verifyIdentity(investor2, true);
        vm.stopPrank();

        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        rwaAsset.addToWhitelist(investor2);
        rwaAsset.issue(investor1, 1000 * 10**18);
        vm.stopPrank();

        // First transfer should succeed
        vm.startPrank(investor1);
        rwaAsset.transfer(investor2, 100 * 10**18);
        vm.stopPrank();

        // Second transfer within cooldown should fail
        vm.startPrank(investor1);
        vm.expectRevert("Transfer cooldown not met");
        rwaAsset.transfer(investor2, 100 * 10**18);
        vm.stopPrank();
    }

    function testPauseUnpause() public {
        // Pause functionality removed from contract
        // This test is no longer applicable
        assertTrue(true);
    }

    function testGetAssetInfo() public {
        (
            string memory name,
            string memory symbol,
            uint256 totalSupply,
            uint256 nav,
            string memory jurisdiction,
            string memory assetClass,
            string memory custodian,
            uint256 lastNavUpdate,
            bool paused
        ) = rwaAsset.getAssetInfo();

        assertEq(name, "Demo Real Estate Token");
        assertEq(symbol, "DRET");
        assertEq(totalSupply, 1000000 * 10**18);
        assertEq(nav, 1000000 * 10**18);
        assertEq(jurisdiction, "US");
        assertEq(assetClass, "Real Estate");
        assertEq(custodian, "Mantle Custody Services");
        assertEq(lastNavUpdate, block.timestamp);
        assertEq(paused, false); // Always false since we removed Pausable
    }

    function testGetComplianceStatus() public {
        // Setup: verify and whitelist investor1
        vm.startPrank(identityRegistry);
        rwaAsset.verifyIdentity(investor1, true);
        vm.stopPrank();

        vm.startPrank(owner);
        rwaAsset.addToWhitelist(investor1);
        rwaAsset.setInvestmentLimit(investor1, 500000 * 10**18);
        vm.stopPrank();

        (
            bool verified,
            bool whitelisted,
            bool frozen,
            uint256 investmentLimit,
            uint256 lastTransfer
        ) = rwaAsset.getComplianceStatus(investor1);

        assertTrue(verified);
        assertTrue(whitelisted);
        assertFalse(frozen);
        assertEq(investmentLimit, 500000 * 10**18);
        assertEq(lastTransfer, 0);
    }
}