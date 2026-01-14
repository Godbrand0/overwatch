// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DemoRWAAsset.sol";

contract DeployDemoRWA is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployer);
        
        // Deploy a demo real estate token
        DemoRWAAsset realEstateToken = new DemoRWAAsset(
            "Manhattan Property Token",
            "MPT",
            deployer,
            "US",
            "Real Estate",
            5000000 * 10**18, // $5M initial NAV
            "Mantle Custody Services"
        );
        
        console.log("Real Estate Token deployed at:", address(realEstateToken));
        
        // Deploy a demo treasury bill token
        DemoRWAAsset treasuryToken = new DemoRWAAsset(
            "US Treasury Bill Token",
            "USDT",
            deployer,
            "US",
            "Treasury",
            1000000 * 10**18, // $1M initial NAV
            "US Treasury Custody"
        );
        
        console.log("Treasury Token deployed at:", address(treasuryToken));
        
        // Deploy a demo gold token
        DemoRWAAsset goldToken = new DemoRWAAsset(
            "Digital Gold Token",
            "DGT",
            deployer,
            "CH",
            "Commodity",
            2000000 * 10**18, // $2M initial NAV
            "Swiss Gold Vault"
        );
        
        console.log("Gold Token deployed at:", address(goldToken));
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("\n=== Deployment Summary ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("Gas used:", gasleft());
        
        // Example post-deployment setup
        vm.startBroadcast(deployer);
        
        // Set up identity registry and compliance (these would be separate contracts in production)
        address identityRegistry = address(0x1234567890123456789012345678901234567890); // Placeholder
        address compliance = address(0x0987654321098765432109876543210987654321); // Placeholder
        
        realEstateToken.setIdentityRegistry(identityRegistry);
        realEstateToken.setCompliance(compliance);
        
        treasuryToken.setIdentityRegistry(identityRegistry);
        treasuryToken.setCompliance(compliance);
        
        goldToken.setIdentityRegistry(identityRegistry);
        goldToken.setCompliance(compliance);
        
        vm.stopBroadcast();
        
        console.log("\n=== Post-Deployment Setup ===");
        console.log("Identity Registry set to:", identityRegistry);
        console.log("Compliance set to:", compliance);
    }
}