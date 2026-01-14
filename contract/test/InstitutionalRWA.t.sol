// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {InstitutionalRWA} from "../src/InstitutionalRWA.sol";

contract InstitutionalRWATest is Test {
    InstitutionalRWA public rwa;
    address public admin = address(1);
    address public user = address(2);

    function setUp() public {
        rwa = new InstitutionalRWA(
            "Institutional Real Estate",
            "IRE",
            admin,
            "US",
            "Real Estate",
            1000000,
            "Mantle Custody",
            "ASSET-001"
        );
    }

    function test_InitialState() public {
        assertEq(rwa.name(), "Institutional Real Estate");
        assertEq(rwa.symbol(), "IRE");
        assertEq(rwa.hasRole(rwa.DEFAULT_ADMIN_ROLE(), admin), true);
        
        (string memory jurisdiction, , , uint256 nav, , ) = rwa.assetMetadata();
        assertEq(jurisdiction, "US");
        assertEq(nav, 1000000);
    }

    function test_Mint_VerifiedUser() public {
        vm.startPrank(admin);
        rwa.verifyIdentity(user, true);
        rwa.mint(user, 1000);
        vm.stopPrank();

        assertEq(rwa.balanceOf(user), 1000);
    }

    function test_Mint_UnverifiedUser_Reverts() public {
        vm.startPrank(admin);
        vm.expectRevert("Recipient not verified");
        rwa.mint(user, 1000);
        vm.stopPrank();
    }

    function test_Transfer_VerifiedUsers() public {
        address user2 = address(3);
        vm.startPrank(admin);
        rwa.verifyIdentity(user, true);
        rwa.verifyIdentity(user2, true);
        rwa.mint(user, 1000);
        vm.stopPrank();

        vm.prank(user);
        rwa.transfer(user2, 500);

        assertEq(rwa.balanceOf(user), 500);
        assertEq(rwa.balanceOf(user2), 500);
    }

    function test_Transfer_FrozenUser_Reverts() public {
        address user2 = address(3);
        vm.startPrank(admin);
        rwa.verifyIdentity(user, true);
        rwa.verifyIdentity(user2, true);
        rwa.mint(user, 1000);
        rwa.setAccountFreeze(user, true);
        vm.stopPrank();

        vm.prank(user);
        vm.expectRevert("Sender account is frozen");
        rwa.transfer(user2, 500);
    }
}
