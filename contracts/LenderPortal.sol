// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CreditScoreRegistry.sol";

/**
 * @title LenderPortal
 * @dev Enterprise portal for lenders to access credit scores and manage lending
 */
contract LenderPortal is AccessControl, ReentrancyGuard {
    bytes32 public constant LENDER_ROLE = keccak256("LENDER_ROLE");
    bytes32 public constant APPROVED_LENDER_ROLE = keccak256("APPROVED_LENDER_ROLE");
    
    struct LenderInfo {
        address lenderAddress;
        string companyName;
        string licenseNumber;
        bool isApproved;
        bool isActive;
        uint256 registrationDate;
        uint256 totalRequests;
        uint256 successfulRequests;
        string[] supportedRegions;
        uint256 creditLimit;
        uint256 interestRate; // Basis points (e.g., 500 = 5%)
    }
    
    struct CreditRequest {
        uint256 requestId;
        address lender;
        address borrower;
        uint256 requestedAmount;
        uint256 timestamp;
        bool isProcessed;
        bool isApproved;
        uint256 creditScore;
        string riskAssessment;
        uint256 approvedAmount;
        uint256 interestRate;
    }
    
    struct APIAccess {
        address lender;
        bool hasAccess;
        uint256 requestLimit;
        uint256 requestsUsed;
        uint256 resetTime;
        string accessLevel; // "basic", "premium", "enterprise"
    }
    
    struct BatchRequest {
        uint256 batchId;
        address lender;
        address[] borrowers;
        uint256[] requestedAmounts;
        uint256 timestamp;
        bool isProcessed;
        uint256 processedCount;
    }
    
    // State variables
    mapping(address => LenderInfo) public lenders;
    mapping(uint256 => CreditRequest) public creditRequests;
    mapping(address => APIAccess) public apiAccess;
    mapping(uint256 => BatchRequest) public batchRequests;
    mapping(address => uint256[]) public lenderRequests;
    mapping(address => bool) public pendingApprovals;
    
    CreditScoreRegistry public creditRegistry;
    
    uint256 public nextRequestId = 1;
    uint256 public nextBatchId = 1;
    uint256 public registrationFee = 1 ether;
    uint256 public apiRequestFee = 0.01 ether;
    
    // Events
    event LenderRegistered(address indexed lender, string companyName);
    event LenderApproved(address indexed lender);
    event CreditRequestSubmitted(
        uint256 indexed requestId,
        address indexed lender,
        address indexed borrower,
        uint256 amount
    );
    event CreditRequestProcessed(
        uint256 indexed requestId,
        bool approved,
        uint256 approvedAmount
    );
    event APIAccessGranted(address indexed lender, string accessLevel);
    event BatchRequestSubmitted(
        uint256 indexed batchId,
        address indexed lender,
        uint256 borrowerCount
    );
    
    constructor(address _creditRegistry) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        creditRegistry = CreditScoreRegistry(_creditRegistry);
    }
    
    /**
     * @dev Register as a lender
     */
    function registerLender(
        string memory companyName,
        string memory licenseNumber,
        string[] memory supportedRegions,
        uint256 creditLimit,
        uint256 interestRate
    ) external payable {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(bytes(companyName).length > 0, "Company name required");
        require(bytes(licenseNumber).length > 0, "License number required");
        require(!lenders[msg.sender].isActive, "Already registered");
        
        lenders[msg.sender] = LenderInfo({
            lenderAddress: msg.sender,
            companyName: companyName,
            licenseNumber: licenseNumber,
            isApproved: false,
            isActive: true,
            registrationDate: block.timestamp,
            totalRequests: 0,
            successfulRequests: 0,
            supportedRegions: supportedRegions,
            creditLimit: creditLimit,
            interestRate: interestRate
        });
        
        pendingApprovals[msg.sender] = true;
        _grantRole(LENDER_ROLE, msg.sender);
        
        emit LenderRegistered(msg.sender, companyName);
    }
    
    /**
     * @dev Approve a lender (admin only)
     */
    function approveLender(address lender) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(lenders[lender].isActive, "Lender not registered");
        require(!lenders[lender].isApproved, "Already approved");
        
        lenders[lender].isApproved = true;
        pendingApprovals[lender] = false;
        _grantRole(APPROVED_LENDER_ROLE, lender);
        
        emit LenderApproved(lender);
    }
    
    /**
     * @dev Request API access
     */
    function requestAPIAccess(string memory accessLevel) 
        external 
        onlyRole(APPROVED_LENDER_ROLE) 
    {
        require(lenders[msg.sender].isApproved, "Lender not approved");
        
        uint256 requestLimit;
        if (keccak256(bytes(accessLevel)) == keccak256(bytes("basic"))) {
            requestLimit = 100;
        } else if (keccak256(bytes(accessLevel)) == keccak256(bytes("premium"))) {
            requestLimit = 1000;
        } else if (keccak256(bytes(accessLevel)) == keccak256(bytes("enterprise"))) {
            requestLimit = 10000;
        } else {
            revert("Invalid access level");
        }
        
        apiAccess[msg.sender] = APIAccess({
            lender: msg.sender,
            hasAccess: true,
            requestLimit: requestLimit,
            requestsUsed: 0,
            resetTime: block.timestamp + 30 days,
            accessLevel: accessLevel
        });
        
        emit APIAccessGranted(msg.sender, accessLevel);
    }
    
    /**
     * @dev Submit credit request
     */
    function submitCreditRequest(
        address borrower,
        uint256 requestedAmount
    ) external payable onlyRole(APPROVED_LENDER_ROLE) returns (uint256) {
        require(msg.value >= apiRequestFee, "Insufficient API fee");
        require(borrower != address(0), "Invalid borrower address");
        require(requestedAmount > 0, "Invalid amount");
        
        APIAccess storage access = apiAccess[msg.sender];
        require(access.hasAccess, "No API access");
        require(access.requestsUsed < access.requestLimit, "Request limit exceeded");
        
        // Reset counter if time period expired
        if (block.timestamp >= access.resetTime) {
            access.requestsUsed = 0;
            access.resetTime = block.timestamp + 30 days;
        }
        
        access.requestsUsed += 1;
        
        uint256 requestId = nextRequestId++;
        
        creditRequests[requestId] = CreditRequest({
            requestId: requestId,
            lender: msg.sender,
            borrower: borrower,
            requestedAmount: requestedAmount,
            timestamp: block.timestamp,
            isProcessed: false,
            isApproved: false,
            creditScore: 0,
            riskAssessment: "",
            approvedAmount: 0,
            interestRate: 0
        });
        
        lenderRequests[msg.sender].push(requestId);
        lenders[msg.sender].totalRequests += 1;
        
        emit CreditRequestSubmitted(requestId, msg.sender, borrower, requestedAmount);
        
        // Auto-process the request
        _processCreditRequest(requestId);
        
        return requestId;
    }
    
    /**
     * @dev Process credit request (internal)
     */
    function _processCreditRequest(uint256 requestId) internal {
        CreditRequest storage request = creditRequests[requestId];
        require(!request.isProcessed, "Already processed");
        
        // Get credit score from registry
        try creditRegistry.getScore(request.borrower) returns (uint256 score) {
            request.creditScore = score;
            
            // Simple approval logic based on credit score
            if (score >= 700) {
                request.isApproved = true;
                request.approvedAmount = request.requestedAmount;
                request.interestRate = lenders[request.lender].interestRate;
                request.riskAssessment = "Low Risk";
                lenders[request.lender].successfulRequests += 1;
            } else if (score >= 650) {
                request.isApproved = true;
                request.approvedAmount = request.requestedAmount / 2;
                request.interestRate = lenders[request.lender].interestRate + 200; // +2%
                request.riskAssessment = "Medium Risk";
                lenders[request.lender].successfulRequests += 1;
            } else {
                request.isApproved = false;
                request.approvedAmount = 0;
                request.riskAssessment = "High Risk";
            }
        } catch {
            request.creditScore = 0;
            request.isApproved = false;
            request.riskAssessment = "No Credit History";
        }
        
        request.isProcessed = true;
        
        emit CreditRequestProcessed(
            requestId,
            request.isApproved,
            request.approvedAmount
        );
    }
    
    /**
     * @dev Submit batch credit request
     */
    function submitBatchRequest(
        address[] memory borrowers,
        uint256[] memory requestedAmounts
    ) external payable onlyRole(APPROVED_LENDER_ROLE) returns (uint256) {
        require(borrowers.length == requestedAmounts.length, "Array length mismatch");
        require(borrowers.length <= 100, "Batch too large");
        require(msg.value >= apiRequestFee * borrowers.length, "Insufficient fee");
        
        APIAccess storage access = apiAccess[msg.sender];
        require(access.hasAccess, "No API access");
        require(access.requestsUsed + borrowers.length <= access.requestLimit, "Request limit exceeded");
        
        uint256 batchId = nextBatchId++;
        
        batchRequests[batchId] = BatchRequest({
            batchId: batchId,
            lender: msg.sender,
            borrowers: borrowers,
            requestedAmounts: requestedAmounts,
            timestamp: block.timestamp,
            isProcessed: false,
            processedCount: 0
        });
        
        access.requestsUsed += borrowers.length;
        
        emit BatchRequestSubmitted(batchId, msg.sender, borrowers.length);
        
        // Process batch
        _processBatchRequest(batchId);
        
        return batchId;
    }
    
    /**
     * @dev Process batch request (internal)
     */
    function _processBatchRequest(uint256 batchId) internal {
        BatchRequest storage batch = batchRequests[batchId];
        require(!batch.isProcessed, "Already processed");
        
        for (uint i = 0; i < batch.borrowers.length; i++) {
            uint256 requestId = nextRequestId++;
            
            creditRequests[requestId] = CreditRequest({
                requestId: requestId,
                lender: batch.lender,
                borrower: batch.borrowers[i],
                requestedAmount: batch.requestedAmounts[i],
                timestamp: block.timestamp,
                isProcessed: false,
                isApproved: false,
                creditScore: 0,
                riskAssessment: "",
                approvedAmount: 0,
                interestRate: 0
            });
            
            lenderRequests[batch.lender].push(requestId);
            _processCreditRequest(requestId);
            batch.processedCount += 1;
        }
        
        batch.isProcessed = true;
        lenders[batch.lender].totalRequests += batch.borrowers.length;
    }
    
    /**
     * @dev Get lender information
     */
    function getLenderInfo(address lender) 
        external 
        view 
        returns (
            string memory companyName,
            bool isApproved,
            bool isActive,
            uint256 totalRequests,
            uint256 successfulRequests,
            uint256 creditLimit
        ) 
    {
        LenderInfo memory info = lenders[lender];
        return (
            info.companyName,
            info.isApproved,
            info.isActive,
            info.totalRequests,
            info.successfulRequests,
            info.creditLimit
        );
    }
    
    /**
     * @dev Get credit request details
     */
    function getCreditRequest(uint256 requestId) 
        external 
        view 
        returns (
            address lender,
            address borrower,
            uint256 requestedAmount,
            bool isApproved,
            uint256 creditScore,
            string memory riskAssessment,
            uint256 approvedAmount
        ) 
    {
        CreditRequest memory request = creditRequests[requestId];
        return (
            request.lender,
            request.borrower,
            request.requestedAmount,
            request.isApproved,
            request.creditScore,
            request.riskAssessment,
            request.approvedAmount
        );
    }
    
    /**
     * @dev Get lender's requests
     */
    function getLenderRequests(address lender) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return lenderRequests[lender];
    }
    
    /**
     * @dev Admin functions
     */
    function updateRegistrationFee(uint256 newFee) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        registrationFee = newFee;
    }
    
    function updateAPIRequestFee(uint256 newFee) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        apiRequestFee = newFee;
    }
    
    function withdrawFees() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        payable(msg.sender).transfer(address(this).balance);
    }
}