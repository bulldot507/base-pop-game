// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SimpleLeaderboard
/// @notice Gas-optimized high score leaderboard for Candy Crush Match-3 on Base Mainnet.
/// @dev Only writes to storage when the new score beats the existing one.
///      Sorting is done off-chain to keep gas fees under $0.01 per submission.
contract SimpleLeaderboard {
    /// @notice Stores each player's personal best score
    mapping(address => uint256) public userScores;

    /// @notice Emitted every time a player sets a new personal best
    event ScoreSubmitted(address indexed user, uint256 score);

    /// @notice Submit a score. Only writes to storage if score is a new personal best.
    /// @param score The score to submit
    function submitScore(uint256 score) external {
        if (score > userScores[msg.sender]) {
            userScores[msg.sender] = score;
            emit ScoreSubmitted(msg.sender, score);
        }
    }

    /// @notice Retrieve a player's personal best score
    /// @param user The wallet address to query
    function getScore(address user) external view returns (uint256) {
        return userScores[user];
    }
}
