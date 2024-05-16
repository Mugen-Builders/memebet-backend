# MemeBet Use cases and testing

## Use Cases and steps for testing it

### UC 001 - DAO User Creates a game

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/72ff9181-fd4c-4dda-913a-f4227eba1221)

The first usecase is when a DAO user wants to create a new Validator Function. Validator functions are needed for creating a closing games. When a DAO user create a new game, they pass the function name that is stored in the functions map in the backend. And the game will be created with that function. When a game ends, the closing process will use that function to check the results, make the payouts and close the game.

#### Steps for reproducing it

First, the arguments for a validator function are a name and a javascript function string as follows:

addValidationFunction(bytes32 function, bytes32 functionString)

- functionName = "cnn"
- functionString = "test_function"

The bytes 32 version for each of these variables are: 
- 0x636e6e0000000000000000000000000000000000000000000000000000000000
- 0x746573745f66756e6374696f6e00000000000000000000000000000000000000

Then, you will need to use cast to get the payload for this function with two variables:

cast calldata "addValidationFunction(bytes32, bytes32)" 0x636e6e0000000000000000000000000000000000000000000000000000000000 0x746573745f66756e6374696f6e00000000000000000000000000000000000000

```
~/memebet/memebet-backend/dapp$ cast calldata "addValidationFunction(bytes32, bytes32)" 0x636e6e0000000000000000000000000000000000000000000000000000000000 0x746573745f66756e6374696f6e00000000000000000000000000000000000000
0x796eed58636e6e0000000000000000000000000000000000000000000000000000000000746573745f66756e6374696f6e00000000000000000000000000000000000000
```

Then you can use the generated result to send as the payload input with either the explorer, your frontend, or with cartesi cli.

### Explorer

When running your dApp node, you have available an explorer to see all the interactions , interact, and more, with your dapp. it is found at http://localhost:8080/explorer/. It should look like this:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/87ec0d2f-ff0b-44aa-b0b0-02595f248bda)

With that, we can connect our wallet and our local host chain to interact with our dApp. So, we can click on the Send transaction option and send the payload got by the cast call we did before:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/763495ba-6ffd-49d4-b42a-984a1c413f68)

Sending this payload, you can check the notices and reports created by the backend in the inputs tab. You shall see that now we have a Validator Function Created Sucessfully

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/7627b95f-d478-4b3a-8071-7517fa28bfb7).

#### Cartesi cli

The Cartesi CLI can also be used for sending the inputs. With the node running and after getting the result of the cast call, you can send an input as follows:

```
cartesi send generic \
    --dapp=0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C \
    --chain-id=31337 \
    --rpc-url=http://127.0.0.1:8545 \
    --mnemonic-passphrase='test test test test test test test test test test test junk' \
    --input=0x796eed58636e6e0000000000000000000000000000000000000000000000000000000000746573745f66756e6374696f6e00000000000000000000000000000000000000

```

This will generate the same result as using the explorer.


### UC002 - DAO user creates a game

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/763c44e1-d0a1-4832-a53f-36ba057ce5af)


This use case shows when an DAO user creates a game. To do that, the DAO user needs to pass all the information needed to create a game with the validator function. If a user aside from DAO tries to create a game somehow, either the frontend and the backend can block this. The result of that is a notice with "Game Created Sucessfully" for that input.

#### Steps for reproducing it

The arguments for the create game function are:

createGame(bytes32 homePick,bytes32 awayPick,address token,uint256 start,uint256 end,bytes32 validatorFunctionName)

- homePick - the first betting pick option
- awayPick - the second betting pick option
- tokenAddress - the token to be used in this bet
- startTime - the start time for this bet
- endTime - the end time for this bet
- validatorFunctionName - an registered validator function string

Considering that, let us have this example:

- "curintia"
- "parmeira"
- "0x0000000000000000000000000000000000000000"
- 1670000000
- 1670003600
- "cnn"

Then, we shall use the cast calldata again to get the encoded payload:

```
cast calldata "createGame(bytes32,bytes32,address,uint256,uint256,bytes32)" 0x637572696e746961000000000000000000000000000000000000000000000000 0x7061726d65697261000000000000000000000000000000000000000000000000 0x0000000000000000000000000000000000000000 1670000000 1670003600 0x636e6e0000000000000000000000000000000000000000000000000000000000
```
This will be the generated payload for us:

```
0x9e924243637572696e7469610000000000000000000000000000000000000000000000007061726d65697261000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000638a2d8000000000000000000000000000000000000000000000000000000000638a3b90636e6e0000000000000000000000000000000000000000000000000000000000
```

> [!NOTE]
> If the game being created uses a non-existent validatorFunction, the game won't be created sucessfully.

#### Explorer

The same as the validator function, we can use the explorer to send this payload:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/51c67d06-b08c-4ad8-9392-f03f691140dc)

Then, we can check the result of this transaction:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/06c15f5b-ad91-4f0e-8a24-310a068ab538)


#### Cartesi CLI

We can use the same payload in the Cartesi CLI, too.

```

cartesi send generic \
    --dapp=0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C \
    --chain-id=31337 \
    --rpc-url=http://127.0.0.1:8545 \
    --mnemonic-passphrase='test test test test test test test test test test test junk' \
    --input=0x9e924243637572696e7469610000000000000000000000000000000000000000000000007061726d65697261000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000638a2d8000000000000000000000000000000000000000000000000000000000638a3b90636e6e0000000000000000000000000000000000000000000000000000000000

```

### UC003 Place a bet

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/848a8060-d2a0-4786-b7c9-00efea62a266)

This use cases shows the player placing a bet behavior. The prerequisite for that is, the player shall have deposited currency on the dApp. For now, i will show how to deposit ether using the explorer, for terms of testing. In the explorer send transcation button, we can find the "Deposit ether" option right after clicking on it:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/1d276c52-24eb-41f5-be8b-252e0f22ea4f)

Sending this transaction will deposit 100 tokens into the user balance, so the user can now place a bet on a game. Lets check the arguments for this function:

function placeBet(bytes32 gameid, bytes32 pick, address token, uint256 amount)

- GameId - Is the gameid associated with a game created before : 1
- pick - is the user choice for the game : curintia
- token - is the address of the token for this game : 0x0000000000000000000000000000000000000000
- amount - the amount that the user wants to bet on this game : 10

The user wants to bet in the curintia team 10 tokens. So, lets send our cast calldata function to get the payload for placing a bet:

```
cast calldata "placeBet(bytes32,bytes32,address,uint256)" 0x3100000000000000000000000000000000000000000000000000000000000000  0x637572696e746961000000000000000000000000000000000000000000000000 0x0000000000000000000000000000000000000000 10
```
This will generate the following payload:
```
0x6682ddb03100000000000000000000000000000000000000000000000000000000000000637572696e7469610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a
```
#### Exploer

For placing a bet, we just have to send this payload through the explorer:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/801267d3-de40-4018-8405-a204743969ad)

The expected result shall be:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/081427a4-f807-48c1-8e64-bcf935fa0fe7)

#### Cartesi CLI

For placing a bet using Cartesi CLI, you can use this:

```
cartesi send generic \
    --dapp=0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C \
    --chain-id=31337 \
    --rpc-url=http://127.0.0.1:8545 \
    --mnemonic-passphrase='test test test test test test test test test test test junk' \
    --input=0x6682ddb03100000000000000000000000000000000000000000000000000000000000000637572696e7469610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a
```

> [!NOTE]
> Users shall have a balance to place a bet, or a "Bet was not placed" will be on the notice message. 

### UC004 Request Game Info

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/3091ab65-c19b-4a3c-b662-44cd3f1b4e46)

With a game created, the user or the frontend functionalities can get a single game information through the games/getGame/:gameid endpoint using the inspect route. 

#### Steps to reproduce

You just have to check the http://localhost:8080/inspect/games/getGame/:gameid endpoint. Since the first game we created will probably have the 1 ID, the inspect call would be http://localhost:8080/inspect/games/getGame/1. You can either use curl or the browser to check the information returned about our game:

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/3ebb853a-d7bd-4b0f-9be4-544f39a357b2)

As we can see, there is a hex payload in the answer. We must convert this to a string to check the readable information. After the conversion, it should be something similar to this:

```
{
  "id": 1,
  "picks": [
    "curintia",
    "parmeira"
  ],
  "startTime": "1670000000",
  "endTime": "1670003600",
  "fees": 2,
  "playerIds": [
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  ],
  "currentOdds": [
    [
      "curintia",
      "1"
    ],
    [
      "parmeira",
      "0"
    ]
  ]
}

```
This can be used as a data visualization in various ways. It also brings the playerIds to show the list of players that bet in this game. 

### UC005 Check wallet balance

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/09098775-1c27-4535-a335-d5a0e6d29c06)

The user and frontend functionalities can check the balance of tokens the user have in the dApp with different endpoints using inspect calls. For instance, to check the ether balance for a user, we can use this http://localhost:8080/inspect/wallet/ether/:userAddress endpoint. 

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/604cc638-2bfb-4ff1-8416-bd0b30f7a816)

Converting the payload, we will have :

```
{"balance":"99999999999999999990 wei"}
```

If we want to check the ERC20 balance of tokens for the user, we can use the http://localhost:8080/inspect/wallet/erc20/:token/:userAddress

> [!NOTE]
> The user should have deposited the token, or else the balance will be zero.


### UC006 Checking the Games List

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/aac6b0e0-0518-436e-8b1b-a4298f139ded)

The user or the frontend functionalities can check the current games ongoing now. To get this information we can use the 
http://localhost:8080/inspect/games/currentGames inspect endpoint. 

![image](https://github.com/Mugen-Builders/memebet-backend/assets/153661799/5bae12b6-c23f-4d9b-86b8-fe73c5505e85)

Converting the payload, we will have something similar to this information:

```
{
    "id": 1,
    "picks": [
      "curintia",
      "parmeira"
    ],
    "currentOdds": {},
    "playerIds": [],
    "playersBets": {},
    "fees": 2,
    "startTime": "1670000000",
    "endTime": "1670003600",
    "verifyFun": {
      "_function": 5.2647538827432027e+76,
      "checkers": {}
    },
    "betPool": {
      "poolAddress": "0x1",
      "tokenAddress": "0x0000000000000000000000000000000000000000",
      "fundsLocked": "10",
      "picksBets": {},
      "effectiveBets": {},
      "wallet": {
        "wallets": {
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": {
            "ether": "99999999999999999990",
            "erc20": {},
            "erc721": {},
            "erc1155": {}
          },
          "0x1": {
            "ether": "10",
            "erc20": {},
            "erc721": {},
            "erc1155": {}
          }
        }
      }
    },
    "wallet": {
      "wallets": {
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": {
          "ether": "99999999999999999990",
          "erc20": {},
          "erc721": {},
          "erc1155": {}
        },
        "0x1": {
          "ether": "10",
          "erc20": {},
          "erc721": {},
          "erc1155": {}
        }
      }
    }
  }
]
```

It can be used for the data visualization functions as we wish. 

### Other endpoints for non-mapped (yet) use cases:

MemeBet exposes the following endpoints for interacting with the application:

#### Advance Handlers
- closeGame(gameId): Closes an existing game with the specified gameId. To be evolved.
#### Inspect Handlers
- governance/members: Returns a list of all DAO members.
#### Governance Handlers
- addMember(address): Adds a new member to the DAO with the specified address.
- removeMember(address): Removes a member from the DAO with the specified address.
