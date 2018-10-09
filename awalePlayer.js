const {fromEvent} = require('rxjs')
const {map} = require('rxjs/operators')
const Readline = require('readline')
const {reducerHash} = require('astx-redux-util')

const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});



// const finishReading = (x) => {
//     readline.close()
//     return x
// }
//
// const readLines = () => (
//     Promise.all([readLine(), readLine()])
//         .then(finishReading)
// )
//
// const writeLine = console.log
//
// const linesToState = ([opponent, player]) => ({opponent, player})
//
// const stateToLines = state => [state.player, state.opponent]
//
// const player = R.pipe(
//     readLines,
//     R.reduce(linesToState),
//     nextState,
//     stateToLines,
//     R.map(writeLine),
// )
//
//
// const play = (previousState, opponentMove) => {
//     const currentTable = applyMove(move, 'opponent', previousTable)
//     const nextMove = bestMove(currentTable)
//     console.log(nextMove)
//     return applyMove(nextMove, 'player', currentTable)
// }
//
// const initialGameState = {
//     pendingMove: null,
//     table: initialTable,
// }
//
//
// const readLine = () => new Promise(res => readline.on('line', res))

const initialTable = {
    player: [6, 6, 6, 6, 6, 6],
    playerDeposit: 0,
    opponent: [6, 6, 6, 6, 6, 6],
    opponentDeposit: 0,
}

const addMove = (moves, newMove) => [...moves, newMove.hole]

const moves = reducerHash({
    'PLAYER_REAPS': addMove,
    'OPPONENT_REAPS': addMove,
}, [])

const table = reducerHash({}, initialTable)

const nextTurn = reducerHash({
    'PLAYER_REAPS_RANDOM': () => 'opponent',
    'OPPONENT_REAPS': () => 'player',
    'PLAYER_REAPS': () => 'opponent',
}, 'opponent')

const isFirstTurn = reducerHash({
    'PLAYER_OPENS_RANDOM': () => false,
    'OPPONENT_REAPS': () => false,
}, true)

const reducer = combineReducers({
    moves,
    table,
    nextTurn,
    isFirstTurn,
})

const opponentMoves$ = fromEvent(readline, 'line').pipe(
    map(line => parseInt(line, 10))
)

const table$ = new Subject()

opponentMoves$.subscribe(console.log, console.error, console.log)
opponentMoves$.subscribe(move => table$.next(move))


// const playerMoves$ = observable()
//
// const output$ = playerMoves$.map(console.log)
//
// const table$ =
//
// const play = (currentTable, opponentMove) => {
//
// }
//
// input$.reduce(play, initialTable)
