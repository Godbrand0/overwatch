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
        
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHash,
            "ASSET-123"
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
        assertEq(profile.legalDocHash, docHash);
        assertEq(profile.deployer, deployer);
        assertEq(profile.offchainAssetId, "ASSET-123");
        
        vm.stopPrank();
    }

    function test_RegisterAsset_Duplicate_Reverts() public {
        vm.startPrank(deployer);
        
        bytes32 docHash = keccak256("Legal Document Content");
        
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            docHash,
            "ASSET-123"
        );
        
        vm.expectRevert("Asset already anchored");
        anchor.registerAsset(
            assetContract,
            RWAAnchor.RWAType.TREASURY,
            RWAAnchor.LegalRight.DEBT,
            "US",
            false,
            custodian,
            docHash,
            "ASSET-456"
        );
        
        vm.stopPrank();
    }

    function test_RegisterAsset_InvalidAddress_Reverts() public {
        vm.startPrank(deployer);
        
        vm.expectRevert("Invalid contract address");
        anchor.registerAsset(
            address(0),
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            keccak256(""),
            "ASSET-123"
        );
        
        vm.stopPrank();
    }

    function test_GetProfile_NotAnchored_Reverts() public {
        vm.expectRevert("Asset not anchored");
        anchor.getProfile(address(999));
    }

    function test_MultipleAssets() public {
        vm.startPrank(deployer);
        
        anchor.registerAsset(
            address(101),
            RWAAnchor.RWAType.REAL_ESTATE,
            RWAAnchor.LegalRight.EQUITY,
            "UK",
            true,
            custodian,
            keccak256("1"),
            "ID-1"
        );
        
        anchor.registerAsset(
            address(102),
            RWAAnchor.RWAType.TREASURY,
            RWAAnchor.LegalRight.DEBT,
            "US",
            false,
            custodian,
            keccak256("2"),
            "ID-2"
        );
        
        assertEq(anchor.getAnchoredCount(), 2);
        assertEq(anchor.anchoredAssets(0), address(101));
        assertEq(anchor.anchoredAssets(1), address(102));
        
        vm.stopPrank();
    }
}
