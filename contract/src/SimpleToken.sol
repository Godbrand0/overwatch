// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleToken
 * @dev Basic token contract for testing MantleForge deployment
 * Simplified version without OpenZeppelin dependencies
 */
contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;

        uint256 initialSupply = 1_000_000 * 10**decimals;
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;

        emit TokensMinted(msg.sender, initialSupply);
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    /**
     * @dev Transfer tokens
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Approve spender
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer from
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        totalSupply += amount;
        balanceOf[to] += amount;

        emit TokensMinted(to, amount);
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit TokensBurned(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @dev Get token info
     */
    function getInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint256 supply,
        uint8 tokenDecimals
    ) {
        return (name, symbol, totalSupply, decimals);
    }
}
