// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title Staking
 * @dev Staking contract with reward distribution
 * Perfect for demonstrating MantleForge's monitoring capabilities
 */
contract Staking {
    IERC20 public immutable stakingToken;
    address public owner;
    uint256 public rewardRate; // Rewards per second per token
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "No reentrancy");
        _locked = true;
        _;
        _locked = false;
    }

    bool private _locked;

    constructor(address _stakingToken, uint256 _rewardRate) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
        owner = msg.sender;
    }

    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored + (
            (block.timestamp - lastUpdateTime) * rewardRate * 1e18 / totalStaked
        );
    }

    /**
     * @dev Calculate earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return (
            stakedBalance[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient balance");

        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");

        rewards[msg.sender] = 0;
        require(stakingToken.transfer(msg.sender, reward), "Transfer failed");

        emit RewardPaid(msg.sender, reward);
    }

    /**
     * @dev Update reward rate (only owner)
     */
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    /**
     * @dev Get staking info for an account
     */
    function getStakingInfo(address account) external view returns (
        uint256 staked,
        uint256 earnedRewards,
        uint256 currentRewardRate,
        uint256 totalStakedAmount
    ) {
        return (
            stakedBalance[account],
            earned(account),
            rewardRate,
            totalStaked
        );
    }
}
