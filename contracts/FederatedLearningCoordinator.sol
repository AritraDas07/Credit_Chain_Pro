// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FederatedLearningCoordinator
 * @dev Coordinates federated learning processes for credit scoring models
 */
contract FederatedLearningCoordinator is AccessControl, ReentrancyGuard {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant AGGREGATOR_ROLE = keccak256("AGGREGATOR_ROLE");
    
    struct ModelUpdate {
        bytes32 updateHash;      // Hash of the model update
        address node;            // Node that submitted the update
        uint256 timestamp;       // When update was submitted
        uint256 round;           // Training round
        bool isValidated;        // Whether update is validated
        uint256 stake;           // Stake amount for this update
        bytes32 gradientHash;    // Hash of encrypted gradients
    }
    
    struct AggregatedModel {
        bytes32 modelHash;       // Hash of aggregated model
        uint256 round;           // Training round
        uint256 timestamp;       // When model was aggregated
        address aggregator;      // Who aggregated the model
        uint256 participantCount; // Number of participants
        bool isActive;           // Whether model is currently active
        uint256 accuracy;        // Model accuracy (scaled by 10000)
    }
    
    struct TrainingRound {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 minParticipants;
        uint256 maxParticipants;
        uint256 currentParticipants;
        bool isActive;
        uint256 rewardPool;
        mapping(address => bool) participants;
        mapping(address => ModelUpdate) updates;
    }
    
    struct NodeInfo {
        address nodeAddress;
        uint256 reputation;      // Node reputation score
        uint256 totalContributions;
        uint256 successfulRounds;
        uint256 totalRewards;
        bool isActive;
        uint256 lastActiveRound;
    }
    
    // State variables
    mapping(address => ModelUpdate) public modelUpdates;
    mapping(uint256 => AggregatedModel) public models;
    mapping(uint256 => TrainingRound) public trainingRounds;
    mapping(address => NodeInfo) public nodes;
    
    uint256 public currentRound;
    uint256 public totalRounds;
    uint256 public minStakeAmount;
    uint256 public rewardPerParticipant;
    address public rewardToken;
    
    // Events
    event ModelUpdateSubmitted(
        address indexed node, 
        bytes32 updateHash, 
        uint256 indexed round,
        uint256 stake
    );
    event ModelAggregated(
        uint256 indexed round, 
        bytes32 modelHash,
        address indexed aggregator,
        uint256 participantCount
    );
    event TrainingRoundStarted(
        uint256 indexed round,
        uint256 startTime,
        uint256 endTime,
        uint256 rewardPool
    );
    event TrainingRoundEnded(
        uint256 indexed round,
        uint256 participantCount,
        bytes32 finalModelHash
    );
    event NodeRegistered(address indexed node, uint256 initialReputation);
    event RewardsDistributed(uint256 indexed round, uint256 totalRewards);
    event NodeSlashed(address indexed node, uint256 amount, string reason);
    
    constructor(
        address _rewardToken,
        uint256 _minStakeAmount,
        uint256 _rewardPerParticipant
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AGGREGATOR_ROLE, msg.sender);
        
        rewardToken = _rewardToken;
        minStakeAmount = _minStakeAmount;
        rewardPerParticipant = _rewardPerParticipant;
        currentRound = 1;
    }
    
    /**
     * @dev Register a new node for federated learning
     */
    function registerNode() external {
        require(!nodes[msg.sender].isActive, "Node already registered");
        
        nodes[msg.sender] = NodeInfo({
            nodeAddress: msg.sender,
            reputation: 100, // Starting reputation
            totalContributions: 0,
            successfulRounds: 0,
            totalRewards: 0,
            isActive: true,
            lastActiveRound: 0
        });
        
        emit NodeRegistered(msg.sender, 100);
    }
    
    /**
     * @dev Start a new training round
     */
    function startTrainingRound(
        uint256 duration,
        uint256 minParticipants,
        uint256 maxParticipants,
        uint256 rewardPool
    ) external onlyRole(AGGREGATOR_ROLE) {
        require(!trainingRounds[currentRound].isActive, "Round already active");
        require(duration > 0, "Invalid duration");
        require(minParticipants > 0 && maxParticipants >= minParticipants, "Invalid participant limits");
        
        TrainingRound storage round = trainingRounds[currentRound];
        round.roundId = currentRound;
        round.startTime = block.timestamp;
        round.endTime = block.timestamp + duration;
        round.minParticipants = minParticipants;
        round.maxParticipants = maxParticipants;
        round.currentParticipants = 0;
        round.isActive = true;
        round.rewardPool = rewardPool;
        
        // Transfer reward tokens to contract
        if (rewardPool > 0) {
            IERC20(rewardToken).transferFrom(msg.sender, address(this), rewardPool);
        }
        
        emit TrainingRoundStarted(currentRound, round.startTime, round.endTime, rewardPool);
    }
    
    /**
     * @dev Submit model update for current training round
     */
    function submitModelUpdate(
        bytes32 updateHash,
        bytes32 gradientHash
    ) external payable nonReentrant {
        require(nodes[msg.sender].isActive, "Node not registered");
        require(updateHash != bytes32(0), "Invalid update hash");
        require(gradientHash != bytes32(0), "Invalid gradient hash");
        
        TrainingRound storage round = trainingRounds[currentRound];
        require(round.isActive, "No active training round");
        require(block.timestamp <= round.endTime, "Training round ended");
        require(!round.participants[msg.sender], "Already participated in this round");
        require(round.currentParticipants < round.maxParticipants, "Round is full");
        require(msg.value >= minStakeAmount, "Insufficient stake");
        
        // Record participation
        round.participants[msg.sender] = true;
        round.currentParticipants += 1;
        
        // Store model update
        ModelUpdate storage update = round.updates[msg.sender];
        update.updateHash = updateHash;
        update.node = msg.sender;
        update.timestamp = block.timestamp;
        update.round = currentRound;
        update.isValidated = false;
        update.stake = msg.value;
        update.gradientHash = gradientHash;
        
        // Update global mapping
        modelUpdates[msg.sender] = update;
        
        // Update node info
        nodes[msg.sender].totalContributions += 1;
        nodes[msg.sender].lastActiveRound = currentRound;
        
        emit ModelUpdateSubmitted(msg.sender, updateHash, currentRound, msg.value);
    }
    
    /**
     * @dev Validate a model update
     */
    function validateModelUpdate(
        address node,
        bool isValid
    ) external onlyRole(VALIDATOR_ROLE) {
        TrainingRound storage round = trainingRounds[currentRound];
        require(round.participants[node], "Node did not participate");
        
        ModelUpdate storage update = round.updates[node];
        require(!update.isValidated, "Already validated");
        
        if (isValid) {
            update.isValidated = true;
            nodes[node].reputation += 10; // Increase reputation
        } else {
            // Slash stake for invalid update
            nodes[node].reputation = nodes[node].reputation > 20 ? nodes[node].reputation - 20 : 0;
            emit NodeSlashed(node, update.stake, "Invalid model update");
        }
    }
    
    /**
     * @dev Aggregate model updates and create new model
     */
    function aggregateModel(
        uint256 roundId,
        bytes32 modelHash,
        uint256 accuracy
    ) external onlyRole(AGGREGATOR_ROLE) {
        TrainingRound storage round = trainingRounds[roundId];
        require(round.isActive, "Round not active");
        require(block.timestamp > round.endTime, "Round not ended");
        require(round.currentParticipants >= round.minParticipants, "Insufficient participants");
        require(modelHash != bytes32(0), "Invalid model hash");
        require(accuracy <= 10000, "Invalid accuracy"); // Max 100.00%
        
        // Create aggregated model
        AggregatedModel storage model = models[roundId];
        model.modelHash = modelHash;
        model.round = roundId;
        model.timestamp = block.timestamp;
        model.aggregator = msg.sender;
        model.participantCount = round.currentParticipants;
        model.isActive = true;
        model.accuracy = accuracy;
        
        // Deactivate previous model
        if (roundId > 1) {
            models[roundId - 1].isActive = false;
        }
        
        // End training round
        round.isActive = false;
        
        emit ModelAggregated(roundId, modelHash, msg.sender, round.currentParticipants);
        emit TrainingRoundEnded(roundId, round.currentParticipants, modelHash);
        
        // Distribute rewards
        _distributeRewards(roundId);
        
        // Increment round counter
        currentRound += 1;
        totalRounds += 1;
    }
    
    /**
     * @dev Distribute rewards to participants
     */
    function _distributeRewards(uint256 roundId) internal {
        TrainingRound storage round = trainingRounds[roundId];
        uint256 totalRewards = round.rewardPool;
        uint256 validParticipants = 0;
        
        // Count valid participants
        for (uint256 i = 0; i < round.currentParticipants; i++) {
            // This is simplified - in practice, you'd iterate through participants
            validParticipants += 1;
        }
        
        if (validParticipants > 0 && totalRewards > 0) {
            uint256 rewardPerNode = totalRewards / validParticipants;
            
            // Distribute rewards (simplified implementation)
            // In practice, you'd iterate through all participants and distribute
            emit RewardsDistributed(roundId, totalRewards);
        }
    }
    
    /**
     * @dev Get current active model
     */
    function getCurrentModel() 
        external 
        view 
        returns (
            bytes32 modelHash,
            uint256 round,
            uint256 timestamp,
            uint256 accuracy
        ) 
    {
        for (uint256 i = totalRounds; i >= 1; i--) {
            if (models[i].isActive) {
                AggregatedModel memory model = models[i];
                return (model.modelHash, model.round, model.timestamp, model.accuracy);
            }
        }
        revert("No active model found");
    }
    
    /**
     * @dev Get node information
     */
    function getNodeInfo(address node) 
        external 
        view 
        returns (
            uint256 reputation,
            uint256 totalContributions,
            uint256 successfulRounds,
            uint256 totalRewards,
            bool isActive
        ) 
    {
        NodeInfo memory nodeInfo = nodes[node];
        return (
            nodeInfo.reputation,
            nodeInfo.totalContributions,
            nodeInfo.successfulRounds,
            nodeInfo.totalRewards,
            nodeInfo.isActive
        );
    }
    
    /**
     * @dev Get training round information
     */
    function getTrainingRoundInfo(uint256 roundId) 
        external 
        view 
        returns (
            uint256 startTime,
            uint256 endTime,
            uint256 currentParticipants,
            uint256 maxParticipants,
            bool isActive,
            uint256 rewardPool
        ) 
    {
        TrainingRound storage round = trainingRounds[roundId];
        return (
            round.startTime,
            round.endTime,
            round.currentParticipants,
            round.maxParticipants,
            round.isActive,
            round.rewardPool
        );
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    function updateMinStakeAmount(uint256 newAmount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        minStakeAmount = newAmount;
    }
    
    function updateRewardPerParticipant(uint256 newAmount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        rewardPerParticipant = newAmount;
    }
}