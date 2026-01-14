// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RWAAnchor} from "../src/RWAAnchor.sol";

contract RWAAnchorTest is Test {
    RWAAnchor public anchor;
    address public deployer = address(1);
    address public assetContract = address(100);
    address public custodian = address(200);
    address public otherUser = address(300);

    function setUp() public {
        anchor = new RWAAnchor();
    }

    function test_RegisterAsset() public {
        vm.startPrank(deployer);
        
        bytes32 docHash = keccak256("Legal Document Content");
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = docHash;
        
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes,
            "ASSET-123",
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        assertTrue(anchor.isAnchored(assetContract));
        assertEq(anchor.getAnchoredCount(), 1);
        assertEq(anchor.anchoredAssets(0), assetContract);
        
        RWAAnchor.RWAProfile memory profile = anchor.getProfile(assetContract);
        assertEq(uint(profile.rwaType), uint(RWAAnchor.RWAType.REAL_ESTATE));
        assertEq(uint(profile.legalRight), uint(RWAAnchor.LegalRight.EQUITY));
        assertEq(profile.jurisdiction, "UK");
        assertTrue(profile.redeemable);
        assertEq(profile.custodian, custodian);
        assertEq(profile.legalDocHashes[0], docHash);
        assertEq(profile.deployer, deployer);
        assertEq(profile.offchainAssetId, "ASSET-123");
        assertEq(profile.tokenName, "Real Estate Token");
        assertEq(profile.tokenSymbol, "RET");
        assertEq(profile.totalSupply, 1000000);
        assertEq(profile.nav, 125000000);
        
        vm.stopPrank();
    }

    function test_RegisterAsset_Duplicate_Reverts() public {
        vm.startPrank(deployer);
        
        bytes32 docHash = keccak256("Legal Document Content");
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = docHash;
        
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes,
            "ASSET-123",
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        vm.expectRevert("Asset already anchored");
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.TREASURY,
            RWAAnchor.LegalRight.DEBT,
            "US",
            false,
            custodian,
            docHashes,
            "ASSET-456",
            "Treasury Token",
            "TRS",
            50000000,
            50000000
        );
        
        vm.stopPrank();
    }

    function test_RegisterAsset_InvalidAddress_Reverts() public {
        vm.startPrank(deployer);
        
        bytes32 docHash = keccak256("Legal Document Content");
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = docHash;
        
        vm.expectRevert("Invalid contract address");
        anchor.registerAsset(
            address(0),
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes,
            "ASSET-123",
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        vm.stopPrank();
    }

    function test_RegisterAsset_EmptyLegalDocHashes_Reverts() public {
        vm.startPrank(deployer);
        
        bytes32[] memory emptyDocHashes = new bytes32[](0);
        
        vm.expectRevert("At least one legal document hash required");
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            emptyDocHashes,
            "ASSET-123",
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        vm.stopPrank();
    }

    function test_GetProfile_NotAnchored_Reverts() public {
        vm.expectRevert("Asset not anchored");
        anchor.getProfile(address(999));
    }

    function test_MultipleAssets() public {
        vm.startPrank(deployer);
        
        bytes32[] memory docHashes1 = new bytes32[](1);
        docHashes1[0] = keccak256("1");
        
        bytes32[] memory docHashes2 = new bytes32[](1);
        docHashes2[0] = keccak256("2");
        
        anchor.registerAsset(
            address(101),
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes1,
            "ID-1",
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        anchor.registerAsset(
            address(102),
            RWAAnchor.RWAType.TREASURY,
            RWAAnchor.LegalRight.DEBT,
            "US",
            false,
            custodian,
            docHashes2,
            "ID-2",
            "Treasury Token",
            "TRS",
            50000000,
            50000000
        );
        
        assertEq(anchor.getAnchoredCount(), 2);
        assertEq(anchor.anchoredAssets(0), address(101));
        assertEq(anchor.anchoredAssets(1), address(102));
        
        vm.stopPrank();
    }

    function test_MultipleLegalDocuments() public {
        vm.startPrank(deployer);
        
        bytes32[] memory docHashes = new bytes32[](3);
        docHashes[0] = keccak256("Document 1");
        docHashes[1] = keccak256("Document 2");
        docHashes[2] = keccak256("Document 3");
        
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.INVOICE,
            RWAAnchor.LegalRight.REVENUE_SHARE,
            "SG",
            true,
            custodian,
            docHashes,
            "INV-001",
            "Invoice Token",
            "INV",
            100000,
            100000
        );
        
        RWAAnchor.RWAProfile memory profile = anchor.getProfile(assetContract);
        assertEq(profile.legalDocHashes.length, 3);
        assertEq(profile.legalDocHashes[0], keccak256("Document 1"));
        assertEq(profile.legalDocHashes[1], keccak256("Document 2"));
        assertEq(profile.legalDocHashes[2], keccak256("Document 3"));
        
        vm.stopPrank();
    }

    function test_AllRWATypes() public {
        vm.startPrank(deployer);
        
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = keccak256("Legal Document");
        
        // Test all RWA types
        anchor.registerAsset(
            address(1001),
            RWAAnchor.RWAType.UNDEFINED,
            RWAAnchor.LegalRight.OTHER,
            "US",
            false,
            custodian,
            docHashes,
            "UNDEF-001",
            "Undefined Token",
            "UNDEF",
            1000,
            1000
        );
        
        anchor.registerAsset(
            address(1002),
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes,
            "RE-001",
            "Real Estate Token",
            "RE",
            1000000,
            125000000
        );
        
        anchor.registerAsset(
            address(1003),
            RWAAnchor.RWAType.TREASURY,
            RWAAnchor.LegalRight.DEBT,
            "US",
            false,
            custodian,
            docHashes,
            "TRES-001",
            "Treasury Token",
            "TRES",
            50000000,
            50000000
        );
        
        anchor.registerAsset(
            address(1004),
            RWAAnchor.RWAType.INVOICE,
            RWAAnchor.LegalRight.REVENUE_SHARE,
            "SG",
            true,
            custodian,
            docHashes,
            "INV-001",
            "Invoice Token",
            "INV",
            100000,
            100000
        );
        
        anchor.registerAsset(
            address(1005),
            RWAAnchor.RWAType.GOLD,
            RWAAnchor.LegalRight.BENEFICIAL_OWNERSHIP,
            "CH",
            true,
            custodian,
            docHashes,
            "GOLD-001",
            "Gold Token",
            "GOLD",
            1000,
            2000000
        );
        
        anchor.registerAsset(
            address(1006),
            RWAAnchor.RWAType.EQUITY,
            RWAAnchor.LegalRight.EQUITY,
            "US",
            true,
            custodian,
            docHashes,
            "EQ-001",
            "Equity Token",
            "EQ",
            100000,
            5000000
        );
        
        anchor.registerAsset(
            address(1007),
            RWAAnchor.RWAType.DEBT,
            RWAAnchor.LegalRight.DEBT,
            "UK",
            false,
            custodian,
            docHashes,
            "DEBT-001",
            "Debt Token",
            "DEBT",
            1000000,
            1000000
        );
        
        anchor.registerAsset(
            address(1008),
            RWAAnchor.RWAType.OTHER,
            RWAAnchor.LegalRight.OTHER,
            "JP",
            true,
            custodian,
            docHashes,
            "OTHER-001",
            "Other Token",
            "OTHER",
            50000,
            75000
        );
        
        assertEq(anchor.getAnchoredCount(), 8);
        
        vm.stopPrank();
    }

    function test_AssetAnchoredEvent() public {
        vm.startPrank(deployer);
        
        bytes32[] memory docHashes = new bytes32[](2);
        docHashes[0] = keccak256("Document 1");
        docHashes[1] = keccak256("Document 2");
        
        vm.expectEmit(true, true, false, true, address(anchor));
        emit RWAAnchor.AssetAnchored(
            assetContract,
            deployer,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            docHashes,
            block.timestamp,
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes,
            "ASSET-123",
            "Real Estate Token",
            "RET",
            1000000,
            125000000
        );
        
        vm.stopPrank();
    }

    function test_DifferentDeployers() public {
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = keccak256("Legal Document");
        
        // First asset registered by deployer
        vm.startPrank(deployer);
        anchor.registerAsset(
            address(2001),
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHashes,
            "DEPLOYER-001",
            "Deployer Token",
            "DEP",
            1000000,
            125000000
        );
        vm.stopPrank();
        
        // Second asset registered by otherUser
        vm.startPrank(otherUser);
        anchor.registerAsset(
            address(2002),
            RWAAnchor.RWAType.TREASURY,
            RWAAnchor.LegalRight.DEBT,
            "US",
            false,
            custodian,
            docHashes,
            "OTHER-001",
            "Other User Token",
            "OTH",
            50000000,
            50000000
        );
        vm.stopPrank();
        
        // Verify both assets are registered with correct deployers
        RWAAnchor.RWAProfile memory profile1 = anchor.getProfile(address(2001));
        assertEq(profile1.deployer, deployer);
        
        RWAAnchor.RWAProfile memory profile2 = anchor.getProfile(address(2002));
        assertEq(profile2.deployer, otherUser);
        
        assertEq(anchor.getAnchoredCount(), 2);
    }

    function test_AnchoredAssetsArrayOrder() public {
        vm.startPrank(deployer);
        
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = keccak256("Legal Document");
        
        // Register assets in a specific order
        address[] memory assetAddresses = new address[](5);
        for (uint i = 0; i < 5; i++) {
            assetAddresses[i] = address(3000 + i);
            anchor.registerAsset(
                assetAddresses[i],
                RWAAnchor.RWAType.REAL_ESTATE,
                RWAAnchor.LegalRight.EQUITY,
                "UK",
                true,
                custodian,
                docHashes,
                string(abi.encodePacked("ASSET-", i)),
                string(abi.encodePacked("Token ", i)),
                string(abi.encodePacked("T", i)),
                1000000,
                125000000
            );
        }
        
        // Verify the order is preserved
        assertEq(anchor.getAnchoredCount(), 5);
        for (uint i = 0; i < 5; i++) {
            assertEq(anchor.anchoredAssets(i), assetAddresses[i]);
        }
        
        vm.stopPrank();
    }

    function test_EdgeCaseValues() public {
        vm.startPrank(deployer);
        
        bytes32[] memory docHashes = new bytes32[](1);
        docHashes[0] = keccak256("Legal Document");
        
        // Test with edge case values
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.OTHER,
            RWAAnchor.LegalRight.OTHER,
            "ZZ", // Edge case jurisdiction
            false, // Not redeemable
            address(0), // Edge case custodian (zero address)
            docHashes,
            "", // Empty offchain asset ID
            "", // Empty token name
            "", // Empty token symbol
            0, // Zero total supply
            0 // Zero NAV
        );
        
        RWAAnchor.RWAProfile memory profile = anchor.getProfile(assetContract);
        assertEq(profile.jurisdiction, "ZZ");
        assertEq(profile.redeemable, false);
        assertEq(profile.custodian, address(0));
        assertEq(profile.offchainAssetId, "");
        assertEq(profile.tokenName, "");
        assertEq(profile.tokenSymbol, "");
        assertEq(profile.totalSupply, 0);
        assertEq(profile.nav, 0);
        
        vm.stopPrank();
    }
}
