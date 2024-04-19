
// Controls the funds for a bet
// it handles the betting and settling of funds
// it should communicate directly to deroll-wallet and
// create a custom local-only address
export class GameBetPool {

}

// Manages a betting session/game
// After approving a new GameFactory, we have a factory of bet games
//  ie: GameFactoryManager.create(Soccer games instructions) --> soccerInstanceFactory
//      soccerInstanceFactory.create(BR VS Italy) --> new bet game
//  This will be used to establish the new types of bets and categories (soccer, CSGO, coinflip...)
export class GameFactoryManager {

}
// Manages the creation of game instaces
// A factory knows the rules, the validator function
export class GameFactory {

}
// Higher level manager for all things bet
// Handles the creation and listing of new GameFactory
// Handles the creation and listing of new games (instances)
export class GamesManager {

}