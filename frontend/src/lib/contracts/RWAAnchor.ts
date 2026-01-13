export const RWA_ANCHOR_ABI = [
  {
    "type": "function",
    "name": "anchoredAssets",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "assetRegistry",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "rwaType",
        "type": "uint8",
        "internalType": "enum RWAAnchor.RWAType"
      },
      {
        "name": "legalRight",
        "type": "uint8",
        "internalType": "enum RWAAnchor.LegalRight"
      },
      {
        "name": "jurisdiction",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "redeemable",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "custodian",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "deployer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "offchainAssetId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "tokenName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "tokenSymbol",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "totalSupply",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "nav",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAnchoredCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProfile",
    "inputs": [
      {
        "name": "_contractAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct RWAAnchor.RWAProfile",
        "components": [
          {
            "name": "rwaType",
            "type": "uint8",
            "internalType": "enum RWAAnchor.RWAType"
          },
          {
            "name": "legalRight",
            "type": "uint8",
            "internalType": "enum RWAAnchor.LegalRight"
          },
          {
            "name": "jurisdiction",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "redeemable",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "custodian",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "legalDocHashes",
            "type": "bytes32[]",
            "internalType": "bytes32[]"
          },
          {
            "name": "deployer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "offchainAssetId",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "timestamp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "tokenName",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "tokenSymbol",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "totalSupply",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "nav",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isAnchored",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerAsset",
    "inputs": [
      {
        "name": "_contractAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_type",
        "type": "uint8",
        "internalType": "enum RWAAnchor.RWAType"
      },
      {
        "name": "_right",
        "type": "uint8",
        "internalType": "enum RWAAnchor.LegalRight"
      },
      {
        "name": "_jurisdiction",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_redeemable",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "_custodian",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_legalDocHashes",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      },
      {
        "name": "_offchainAssetId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_tokenName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_tokenSymbol",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_totalSupply",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_nav",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AssetAnchored",
    "inputs": [
      {
        "name": "contractAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "deployer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "rwaType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum RWAAnchor.RWAType"
      },
      {
        "name": "legalRight",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum RWAAnchor.LegalRight"
      },
      {
        "name": "legalDocHashes",
        "type": "bytes32[]",
        "indexed": false,
        "internalType": "bytes32[]"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "tokenName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "tokenSymbol",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "totalSupply",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "nav",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;

// This is the deployed address on Mantle Sepolia
export const RWA_ANCHOR_ADDRESS = "0xfc39643c42be75258a62bd6732d6e3fa70ab36b5";
