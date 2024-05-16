# MemeBet

MemeBet is a decentralized application (DApp) built on the Cartesi platform, enabling users to create and participate in meme-based betting games. With MemeBet, you can create betting pools around popular memes, place bets using cryptocurrencies, and earn rewards based on the outcome of the bets.

## Features
- Create Meme Betting Games: DAO members can create new betting games by submitting a game and defining the betting options (e.g., "Doge" vs "Pepe", Corithians Vs Palmeiras;  Real Madrid vs Barcelona; etc.).

- Place Bets: Participants can place bets on their preferred option using various cryptocurrencies, such as Ether (ETH) or ERC-20 tokens.

- Decentralized Governance: MemeBet is governed by a decentralized autonomous organization (DAO), ensuring fair and transparent decision-making processes.

- Validator Functions: Custom validator functions can be created and deployed to determine the winning meme option based on predefined criteria.

- Secure Payouts: Winning bets are automatically paid out to the respective participants, leveraging the security and transparency of the Cartesi blockchain.

## How to build and run the application


## Endpoints

MemeBet exposes the following endpoints for interacting with the application:

### Advance Handlers
- createGame(home, away, token, start, end, validatorFunctionName): DAO users can create a new meme betting game with the specified options (home and away picks), token for betting, start and end times, and the validator function to determine the winner.

- closeGame(gameId): Closes an existing game with the specified gameId.

- placeBet(gameId, pick, token, amount): Users can place a bet on the specified pick (option) for the game with gameId, using the provided token and amount.

### Inspect Handlers
wallet/ether/:sender: Returns the Ether balance of the specified sender address.
- wallet/erc20/:token/:sender: Returns the ERC-20 token balance of the specified token for the sender address.
- games/:gameId: Returns information about the game with the specified gameId, including picks, start and end times, fees, player IDs, and current odds.
- governance/members: Returns a list of all DAO members.
### Governance Handlers

- addMember(address): Adds a new member to the DAO with the specified address.
- removeMember(address): Removes a member from the DAO with the specified address.

## Getting Started
To get started with MemeBet, follow these steps:

- Install the required dependencies by running yarn.
- #TO-DO

## Contributing
We welcome contributions from the community! If you'd like to contribute to MemeBet, please follow these steps:

- Fork the repository.
- Create a new branch for your feature or bug fix.
- Make your changes and commit them with descriptive commit messages.
- Push your changes to your forked repository.
- Submit a pull request to the main repository.
- Please ensure that your code adheres to the project's coding standards and includes appropriate tests.

## License
MemeBet is released under the MIT License.

## Acknowledgments
MemeBet is built on top of the Cartesi platform and utilizes various open-source libraries and tools. We would like to express our gratitude to the developers and contributors of these projects.
