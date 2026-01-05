// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MantleRWAAsset} from "../src/MantleRWAAsset.sol";

contract MantleRWAAssetTest is Test {
    MantleRWAAsset public asset;
    address public owner = address(1);
    address public user = address(2);
    address public registry = address(3);

    function setUp() public {
        vm.startPrank(owner);
        asset = new MantleRWAAsset("Mantle RWA", "MRWA", owner);
        vm.stopPrank();
    }

    function test_InitialState() public {
        assertEq(asset.name(), "Mantle RWA");
        assertEq(asset.symbol(), "MRWA");
        assertEq(asset.owner(), owner);
    }

    function test_SetIdentityRegistry() public {
        vm.startPrank(owner);
        asset.setIdentityRegistry(registry);
        assertEq(asset.identityRegistry(), registry);
        vm.stopPrank();
    }

    function test_SetIdentityRegistry_OnlyOwner() public {
        vm.startPrank(user);
        vm.expectRevert();
        asset.setIdentityRegistry(registry);
        vm.stopPrank();
    }

    function test_Custodian() public {
        assertEq(asset.getCustodian(), "Mantle Custody Services");
    }

    function test_Mint() public {
        vm.startPrank(owner);
        asset.mint(user, 1000);
        assertEq(asset.balanceOf(user), 1000);
        vm.stopPrank();
    }

    function test_Mint_OnlyOwner() public {
        vm.startPrank(user);
        vm.expectRevert();
        asset.mint(user, 1000);
        vm.stopPrank();
    }

    function test_UpdateNAV() public {
        vm.startPrank(owner);
        // This function doesn't return anything or change state in the current mock, 
        // but we test that it doesn't revert for owner.
        asset.updateNav(1000000);
        vm.stopPrank();
    }
}
