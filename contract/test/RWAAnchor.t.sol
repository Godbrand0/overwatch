// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RWAAnchor} from "../src/RWAAnchor.sol";

contract RWAAnchorTest is Test {
    RWAAnchor public anchor;
    address public deployer = address(1);
    address public assetContract = address(100);
    address public custodian = address(200);

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
}
