# MemeBet

MemeBet is a decentralized application (DApp) built on the Cartesi platform, enabling users to create and participate in meme-based betting games. With MemeBet, you can create betting pools around popular memes, place bets using cryptocurrencies, and earn rewards based on the outcome of the bets.

## Features
- Create Meme Betting Games: DAO members can create new betting games by submitting a game and defining the betting options (e.g., "Doge" vs "Pepe", Corinthians Vs Palmeiras;  Real Madrid vs Barcelona; etc.).

- Place Bets: Participants can place bets on their preferred option using various cryptocurrencies, such as Ether (ETH) or ERC-20 tokens.

- Decentralized Governance: MemeBet is governed by a decentralized autonomous organization (DAO), ensuring fair and transparent decision-making processes.

- Validator Functions: Custom validator functions can be created and deployed to determine the winning meme option based on predefined criteria.

- Secure Payouts: Winning bets are automatically paid out to the respective participants, leveraging the security and transparency of the Cartesi blockchain.

## How to build and run the application


## Endpoints

MemeBet exposes the following endpoints for interacting with the application:

### Advance Handlers
- createGame: DAO users can create a new meme betting game with the specified options (home and away picks), token for betting, start and end times, and the validator function to determine the winner.

- closeGame: Closes an existing game with the specified gameId.

- placeBet: Users can place a bet on the specified pick (option) for the game with gameId, using the provided token and amount.

### Inspect Handlers

- wallet/ether/:sender: Returns the Ether balance of the specified sender address.
- wallet/erc20/:token/:sender: Returns the ERC-20 token balance of the specified token for the sender address.
- games/:gameId: Returns information about the game with the specified gameId, including picks, start and end times, fees, player IDs, and current odds.
- governance/members: Returns a list of all DAO members.
  
### Governance Handlers

- addMember: Adds a new member to the DAO with the specified address.
- removeMember: Removes a member from the DAO with the specified address.

## Getting Started

To get started with MemeBet, you need the Development environment for Cartesi Installed. Specially [Cartesi CLI ](https://docs.cartesi.io/cartesi-rollups/1.3/development/installation/) and [Nonodo](https://github.com/gligneul/nonodo) (For testing). 

- Fork this repository 

- Install the required dependencies by running the yarn command in the dApp folder:
```
cd dapp
yarn
```

- Running with Cartesi CLI (inside the dapp folder):
```
cartesi build
```

And then 

```
cartesi run
```

If everything is correctly installed, you shall have the application running in the terminal like this:

```
prompt-1     | Anvil running at http://localhost:8545
prompt-1     | GraphQL running at http://localhost:8080/graphql
prompt-1     | Inspect running at http://localhost:8080/inspect/
prompt-1     | Explorer running at http://localhost:8080/explorer/
prompt-1     | Press Ctrl+C to stop the node
```

With that, the node is up and ready to receive transactions. In the dApp [Readme](./dapp/README.md), you can find more details about the use cases currently working.

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
