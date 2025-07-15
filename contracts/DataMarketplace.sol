// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DataMarketplace
 * @dev Marketplace for trading credit data and insights
 */
contract DataMarketplace is AccessControl, ReentrancyGuard {
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct DataProduct {
        uint256 productId;
        address seller;
        string name;
        string description;
        uint256 price;
        bytes32 dataHash;
        bool isActive;
        uint256 totalSales;
        uint256 rating; // Scaled by 100 (e.g., 450 = 4.50 stars)
        uint256 reviewCount;
        uint256 createdAt;
        string[] features;
        string category;
    }
    
    struct Purchase {
        uint256 purchaseId;
        uint256 productId;
        address buyer;
        address seller;
        uint256 price;
        uint256 timestamp;
        bool isCompleted;
        bytes32 accessKey;
    }
    
    struct Review {
        address reviewer;
        uint256 productId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isVerified;
    }
    
    // State variables
    mapping(uint256 => DataProduct) public products;
    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => Review[]) public productReviews;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256[]) public sellerProducts;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    
    uint256 public nextProductId = 1;
    uint256 public nextPurchaseId = 1;
    uint256 public platformFeePercent = 250; // 2.5%
    address public feeRecipient;
    address public paymentToken;
    
    // Events
    event ProductListed(
        uint256 indexed productId,
        address indexed seller,
        string name,
        uint256 price
    );
    event ProductPurchased(
        uint256 indexed purchaseId,
        uint256 indexed productId,
        address indexed buyer,
        uint256 price
    );
    event ProductReviewed(
        uint256 indexed productId,
        address indexed reviewer,
        uint8 rating,
        string comment
    );
    event ProductUpdated(uint256 indexed productId, uint256 newPrice);
    event ProductDeactivated(uint256 indexed productId);
    
    constructor(address _paymentToken, address _feeRecipient) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        paymentToken = _paymentToken;
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev List a new data product
     */
    function listProduct(
        string memory name,
        string memory description,
        uint256 price,
        bytes32 dataHash,
        string[] memory features,
        string memory category
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(dataHash != bytes32(0), "Invalid data hash");
        
        uint256 productId = nextProductId++;
        
        DataProduct storage product = products[productId];
        product.productId = productId;
        product.seller = msg.sender;
        product.name = name;
        product.description = description;
        product.price = price;
        product.dataHash = dataHash;
        product.isActive = true;
        product.totalSales = 0;
        product.rating = 0;
        product.reviewCount = 0;
        product.createdAt = block.timestamp;
        product.features = features;
        product.category = category;
        
        sellerProducts[msg.sender].push(productId);
        
        emit ProductListed(productId, msg.sender, name, price);
        return productId;
    }
    
    /**
     * @dev Purchase a data product
     */
    function purchaseProduct(uint256 productId) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        DataProduct storage product = products[productId];
        require(product.isActive, "Product not active");
        require(product.seller != msg.sender, "Cannot buy own product");
        require(!hasPurchased[msg.sender][productId], "Already purchased");
        
        uint256 totalPrice = product.price;
        uint256 platformFee = (totalPrice * platformFeePercent) / 10000;
        uint256 sellerAmount = totalPrice - platformFee;
        
        // Transfer payment
        IERC20(paymentToken).transferFrom(msg.sender, product.seller, sellerAmount);
        IERC20(paymentToken).transferFrom(msg.sender, feeRecipient, platformFee);
        
        uint256 purchaseId = nextPurchaseId++;
        
        Purchase storage purchase = purchases[purchaseId];
        purchase.purchaseId = purchaseId;
        purchase.productId = productId;
        purchase.buyer = msg.sender;
        purchase.seller = product.seller;
        purchase.price = totalPrice;
        purchase.timestamp = block.timestamp;
        purchase.isCompleted = true;
        purchase.accessKey = keccak256(abi.encodePacked(msg.sender, productId, block.timestamp));
        
        // Update tracking
        userPurchases[msg.sender].push(purchaseId);
        hasPurchased[msg.sender][productId] = true;
        product.totalSales += 1;
        
        emit ProductPurchased(purchaseId, productId, msg.sender, totalPrice);
        return purchaseId;
    }
    
    /**
     * @dev Submit a review for a purchased product
     */
    function submitReview(
        uint256 productId,
        uint8 rating,
        string memory comment
    ) external {
        require(hasPurchased[msg.sender][productId], "Must purchase to review");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(bytes(comment).length > 0, "Comment cannot be empty");
        
        // Check if user already reviewed
        Review[] storage reviews = productReviews[productId];
        for (uint i = 0; i < reviews.length; i++) {
            require(reviews[i].reviewer != msg.sender, "Already reviewed");
        }
        
        Review memory newReview = Review({
            reviewer: msg.sender,
            productId: productId,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            isVerified: true
        });
        
        reviews.push(newReview);
        
        // Update product rating
        DataProduct storage product = products[productId];
        uint256 totalRating = (product.rating * product.reviewCount) + (rating * 100);
        product.reviewCount += 1;
        product.rating = totalRating / product.reviewCount;
        
        emit ProductReviewed(productId, msg.sender, rating, comment);
    }
    
    /**
     * @dev Update product price (seller only)
     */
    function updateProductPrice(uint256 productId, uint256 newPrice) 
        external 
    {
        DataProduct storage product = products[productId];
        require(product.seller == msg.sender, "Only seller can update");
        require(product.isActive, "Product not active");
        require(newPrice > 0, "Price must be greater than 0");
        
        product.price = newPrice;
        emit ProductUpdated(productId, newPrice);
    }
    
    /**
     * @dev Deactivate product (seller only)
     */
    function deactivateProduct(uint256 productId) external {
        DataProduct storage product = products[productId];
        require(product.seller == msg.sender, "Only seller can deactivate");
        require(product.isActive, "Product already inactive");
        
        product.isActive = false;
        emit ProductDeactivated(productId);
    }
    
    /**
     * @dev Get product details
     */
    function getProduct(uint256 productId) 
        external 
        view 
        returns (
            address seller,
            string memory name,
            string memory description,
            uint256 price,
            bool isActive,
            uint256 totalSales,
            uint256 rating,
            uint256 reviewCount,
            string memory category
        ) 
    {
        DataProduct memory product = products[productId];
        return (
            product.seller,
            product.name,
            product.description,
            product.price,
            product.isActive,
            product.totalSales,
            product.rating,
            product.reviewCount,
            product.category
        );
    }
    
    /**
     * @dev Get product features
     */
    function getProductFeatures(uint256 productId) 
        external 
        view 
        returns (string[] memory) 
    {
        return products[productId].features;
    }
    
    /**
     * @dev Get user's purchases
     */
    function getUserPurchases(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPurchases[user];
    }
    
    /**
     * @dev Get seller's products
     */
    function getSellerProducts(address seller) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return sellerProducts[seller];
    }
    
    /**
     * @dev Get product reviews
     */
    function getProductReviews(uint256 productId) 
        external 
        view 
        returns (Review[] memory) 
    {
        return productReviews[productId];
    }
    
    /**
     * @dev Check if user has purchased product
     */
    function hasUserPurchased(address user, uint256 productId) 
        external 
        view 
        returns (bool) 
    {
        return hasPurchased[user][productId];
    }
    
    /**
     * @dev Admin functions
     */
    function updatePlatformFee(uint256 newFeePercent) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }
    
    function updateFeeRecipient(address newRecipient) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    function emergencyDeactivateProduct(uint256 productId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        products[productId].isActive = false;
        emit ProductDeactivated(productId);
    }
}