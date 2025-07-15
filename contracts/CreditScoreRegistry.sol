// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CreditScoreRegistry
 * @dev Main registry for decentralized credit scores with privacy controls
 */
contract CreditScoreRegistry is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant LENDER_ROLE = keccak256("LENDER_ROLE");
    
    struct CreditScore {
        uint256 score;           // Credit score (300-850)
        uint256 lastUpdated;     // Timestamp of last update
        uint256 version;         // Score version for tracking
        bool isActive;           // Whether score is active
        address updatedBy;       // Oracle that updated the score
    }
    
    struct ScoreFactors {
        uint8 paymentHistory;    // 0-100
        uint8 creditUtilization; // 0-100
        uint8 creditLength;      // 0-100
        uint8 creditMix;         // 0-100
        uint8 newCredit;         // 0-100
    }
    
    struct DataConsent {
        bytes32 dataHash;        // Hash of consented data
        uint256 timestamp;       // When consent was given
        bool isActive;           // Whether consent is active
        uint256 expiryTime;      // When consent expires
        address[] authorizedLenders; // Lenders with access
    }
    
    // State variables
    mapping(address => CreditScore) public scores;
    mapping(address => ScoreFactors) public scoreFactors;
    mapping(address => DataConsent) public consents;
    mapping(address => mapping(address => bool)) public lenderAccess;
    mapping(address => uint256) public userNonces;
    
    // Events
    event ScoreUpdated(
        address indexed user, 
        uint256 newScore, 
        uint256 version,
        address indexed oracle
    );
    event ConsentUpdated(
        address indexed user, 
        bytes32 dataHash, 
        uint256 expiryTime
    );
    event LenderAccessGranted(
        address indexed user, 
        address indexed lender
    );
    event LenderAccessRevoked(
        address indexed user, 
        address indexed lender
    );
    event ScoreFactorsUpdated(
        address indexed user,
        uint8 paymentHistory,
        uint8 creditUtilization,
        uint8 creditLength,
        uint8 creditMix,
        uint8 newCredit
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Update credit score for a user
     * @param user Address of the user
     * @param score New credit score (300-850)
     */
    function updateScore(address user, uint256 score) 
        external 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        require(score >= 300 && score <= 850, "Score must be between 300-850");
        
        CreditScore storage userScore = scores[user];
        userScore.score = score;
        userScore.lastUpdated = block.timestamp;
        userScore.version += 1;
        userScore.isActive = true;
        userScore.updatedBy = msg.sender;
        
        emit ScoreUpdated(user, score, userScore.version, msg.sender);
    }
    
    /**
     * @dev Update score factors for detailed analysis
     */
    function updateScoreFactors(
        address user,
        uint8 paymentHistory,
        uint8 creditUtilization,
        uint8 creditLength,
        uint8 creditMix,
        uint8 newCredit
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(
            paymentHistory <= 100 && 
            creditUtilization <= 100 && 
            creditLength <= 100 && 
            creditMix <= 100 && 
            newCredit <= 100,
            "All factors must be 0-100"
        );
        
        ScoreFactors storage factors = scoreFactors[user];
        factors.paymentHistory = paymentHistory;
        factors.creditUtilization = creditUtilization;
        factors.creditLength = creditLength;
        factors.creditMix = creditMix;
        factors.newCredit = newCredit;
        
        emit ScoreFactorsUpdated(
            user, 
            paymentHistory, 
            creditUtilization, 
            creditLength, 
            creditMix, 
            newCredit
        );
    }
    
    /**
     * @dev Get credit score for a user
     * @param user Address of the user
     * @return score Current credit score
     */
    function getScore(address user) 
        external 
        view 
        returns (uint256 score) 
    {
        require(user != address(0), "Invalid user address");
        require(
            msg.sender == user || 
            hasRole(LENDER_ROLE, msg.sender) || 
            lenderAccess[user][msg.sender],
            "Unauthorized access"
        );
        
        CreditScore memory userScore = scores[user];
        require(userScore.isActive, "No active score found");
        
        return userScore.score;
    }
    
    /**
     * @dev Get detailed score information
     */
    function getScoreDetails(address user) 
        external 
        view 
        returns (
            uint256 score,
            uint256 lastUpdated,
            uint256 version,
            bool isActive
        ) 
    {
        require(
            msg.sender == user || 
            hasRole(LENDER_ROLE, msg.sender) || 
            lenderAccess[user][msg.sender],
            "Unauthorized access"
        );
        
        CreditScore memory userScore = scores[user];
        return (
            userScore.score,
            userScore.lastUpdated,
            userScore.version,
            userScore.isActive
        );
    }
    
    /**
     * @dev Get score factors breakdown
     */
    function getScoreFactors(address user) 
        external 
        view 
        returns (
            uint8 paymentHistory,
            uint8 creditUtilization,
            uint8 creditLength,
            uint8 creditMix,
            uint8 newCredit
        ) 
    {
        require(
            msg.sender == user || 
            hasRole(LENDER_ROLE, msg.sender) || 
            lenderAccess[user][msg.sender],
            "Unauthorized access"
        );
        
        ScoreFactors memory factors = scoreFactors[user];
        return (
            factors.paymentHistory,
            factors.creditUtilization,
            factors.creditLength,
            factors.creditMix,
            factors.newCredit
        );
    }
    
    /**
     * @dev Update data consent
     * @param dataHash Hash of the data being consented to
     * @param expiryTime When the consent expires
     */
    function updateConsent(bytes32 dataHash, uint256 expiryTime) 
        external 
        whenNotPaused 
    {
        require(dataHash != bytes32(0), "Invalid data hash");
        require(expiryTime > block.timestamp, "Expiry must be in future");
        
        DataConsent storage consent = consents[msg.sender];
        consent.dataHash = dataHash;
        consent.timestamp = block.timestamp;
        consent.isActive = true;
        consent.expiryTime = expiryTime;
        
        userNonces[msg.sender] += 1;
        
        emit ConsentUpdated(msg.sender, dataHash, expiryTime);
    }
    
    /**
     * @dev Grant lender access to credit score
     * @param lender Address of the lender
     */
    function grantLenderAccess(address lender) 
        external 
        whenNotPaused 
    {
        require(lender != address(0), "Invalid lender address");
        require(!lenderAccess[msg.sender][lender], "Access already granted");
        
        lenderAccess[msg.sender][lender] = true;
        
        // Add to authorized lenders list
        consents[msg.sender].authorizedLenders.push(lender);
        
        emit LenderAccessGranted(msg.sender, lender);
    }
    
    /**
     * @dev Revoke lender access to credit score
     * @param lender Address of the lender
     */
    function revokeLenderAccess(address lender) 
        external 
        whenNotPaused 
    {
        require(lender != address(0), "Invalid lender address");
        require(lenderAccess[msg.sender][lender], "Access not granted");
        
        lenderAccess[msg.sender][lender] = false;
        
        // Remove from authorized lenders list
        address[] storage authorizedLenders = consents[msg.sender].authorizedLenders;
        for (uint i = 0; i < authorizedLenders.length; i++) {
            if (authorizedLenders[i] == lender) {
                authorizedLenders[i] = authorizedLenders[authorizedLenders.length - 1];
                authorizedLenders.pop();
                break;
            }
        }
        
        emit LenderAccessRevoked(msg.sender, lender);
    }
    
    /**
     * @dev Check if consent is valid
     */
    function isConsentValid(address user) 
        external 
        view 
        returns (bool) 
    {
        DataConsent memory consent = consents[user];
        return consent.isActive && consent.expiryTime > block.timestamp;
    }
    
    /**
     * @dev Get authorized lenders for a user
     */
    function getAuthorizedLenders(address user) 
        external 
        view 
        returns (address[] memory) 
    {
        require(
            msg.sender == user || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized access"
        );
        return consents[user].authorizedLenders;
    }
    
    /**
     * @dev Batch update scores (for efficiency)
     */
    function batchUpdateScores(
        address[] calldata users,
        uint256[] calldata newScores
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        require(users.length == newScores.length, "Array length mismatch");
        require(users.length <= 100, "Batch size too large");
        
        for (uint i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            require(newScores[i] >= 300 && newScores[i] <= 850, "Invalid score");
            
            CreditScore storage userScore = scores[users[i]];
            userScore.score = newScores[i];
            userScore.lastUpdated = block.timestamp;
            userScore.version += 1;
            userScore.isActive = true;
            userScore.updatedBy = msg.sender;
            
            emit ScoreUpdated(users[i], newScores[i], userScore.version, msg.sender);
        }
    }
    
    // Admin functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function grantOracleRole(address oracle) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(ORACLE_ROLE, oracle);
    }
    
    function grantLenderRole(address lender) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(LENDER_ROLE, lender);
    }
}