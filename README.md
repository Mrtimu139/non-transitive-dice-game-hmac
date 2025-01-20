# non-transitive-dice-game-hmac
A console-based implementation of a Generalized Non-Transitive Dice Game with HMAC verification. Supports configurable dice, fairness in random number generation, and enhanced usability features like detailed help tables.

# Non-Transitive Dice Game with HMAC Verification

A console-based implementation of a Generalized Non-Transitive Dice Game with HMAC verification. This application ensures fairness and transparency in gameplay using secure random number generation and cryptographic HMAC verification.  

## Features

- **Configurable Dice**: Specify custom dice face values in any order.
- **HMAC Verification**: Ensures that the computer's move is securely generated and verifiable.
- **Probability Help Table**: Displays probabilities of user wins with color-highlighted headers for improved usability.
- **Secure Random Generation**: Uses cryptographic libraries to generate keys and random values.
- **Dynamic Handling**: Supports any number of dice configurations with varying face values.

## Requirements

- Node.js (v14 or higher)
- Install required dependencies:
  ```bash
  npm install chalk cli-table3

## Run the Game
- Launch the game with custom dice configurations:
  ```bash
  node game2.js <dice configurations>
# Examples
- Valid Configurations:
  ```bash
  node game2.js 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6
  node game2.js 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7
- Invalid Configurations:
   - No dice provided
     ```bash
     node game2.js
   - Less than 3 dice
      ```bash
     node game2.js 1,2
    - Non-integer values
        ```bash
      node game2.js 1,2,3,a,b
    - Negative values
      ```bash
      node game2.js 1,2,3,4,-5,6


The computer reveals its move, the key, and the sum modulo dice range.
The user can verify the HMAC using any standard HMAC tool.
      



