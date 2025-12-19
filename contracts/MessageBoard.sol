// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title MessageBoard
 * @notice A simple smart contract that stores messages on the blockchain
 * 
 * LEARNING NOTES:
 * - This contract demonstrates basic blockchain storage
 * - Writing costs gas (blockchain storage is expensive)
 * - Reading is free (view functions don't modify state)
 * - Anyone can write, but messages can only be changed, not deleted
 */
contract MessageBoard {
    // State variable: stored permanently on the blockchain
    // This costs gas to write, but is free to read
    string public message;
    
    // This stores who wrote the last message
    address public lastWriter;
    
    // This stores when the last message was written (Unix timestamp)
    uint256 public lastUpdated;
    
    // Event: emitted when a message is set (allows frontend to listen)
    // Events are cheaper than storage and can be read by frontends
    event MessageSet(address indexed writer, string message, uint256 timestamp);
    
    /**
     * @notice Set a new message on the blockchain
     * @param newMessage The message to store (string)
     * 
     * GAS COST: High (writing to storage)
     * - Changes state (requires transaction)
     * - Updates 3 variables (message, lastWriter, lastUpdated)
     * - Emits an event
     */
    function setMessage(string memory newMessage) public {
        // Store the new message
        message = newMessage;
        
        // msg.sender = address of whoever called this function
        lastWriter = msg.sender;
        
        // block.timestamp = current time on the blockchain
        lastUpdated = block.timestamp;
        
        // Emit event so frontends can detect the change
        emit MessageSet(msg.sender, newMessage, block.timestamp);
    }
    
    /**
     * @notice Get the current message (free to call)
     * @return The stored message
     * 
     * GAS COST: Free (view function doesn't change state)
     * - Marked as 'view' so it doesn't modify blockchain
     * - Can be called without a transaction
     * - Actually, 'message' is already public, so this is redundant
     *   (kept for demonstration)
     */
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    /**
     * @notice Get information about the last message
     * @return writer Address who wrote the message
     * @return msg The message content
     * @return timestamp When it was written
     * 
     * GAS COST: Free (view function)
     */
    function getMessageInfo() public view returns (
        address writer,
        string memory msg,
        uint256 timestamp
    ) {
        return (lastWriter, message, lastUpdated);
    }
}
