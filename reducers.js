const {combineReducers} = require('redux')
const {reducerHash} = require('astx-redux-util')
const {PLAYER_REAPS, OPPONENT_REAPS} = require('./actions')
const R = require('ramda')


const initialTable = {
    holes: {
        player: [4, 4, 4, 4, 4, 4],
        opponent: [4, 4, 4, 4, 4, 4],
    },
    deposit: {
        player: 0,
        opponent: 0,
    },
}


const NUMBER_OF_HOLES = 12

const sowHole = (sowedSeeds, reapedHole, plantedSeeds, hole) => {
    if (hole === reapedHole) return 0
    const seedsPerHole = Math.floor(sowedSeeds / (NUMBER_OF_HOLES - 1))
    const restOfSeeds = sowedSeeds % (NUMBER_OF_HOLES - 1)
    const distanceToSowedHole = reapedHole < hole
        ? hole - reapedHole
        : (NUMBER_OF_HOLES - reapedHole) + hole
    const receivesExtraSeed = distanceToSowedHole <= restOfSeeds
    const remainingSeeds = receivesExtraSeed
        ? plantedSeeds + seedsPerHole + 1
        : plantedSeeds + seedsPerHole
    return remainingSeeds
}

const sow = (reapedHole, table) => table.map(
    (plantedSeeds, hole) => sowHole(table[reapedHole], reapedHole, plantedSeeds, hole)
)

const hasTwoOrThree = x => x === 2 || x === 3

const reapRemainsFrom = (lastSowedHole, table, reapedRemains) => {
    const nextHole = (lastSowedHole + 1) % NUMBER_OF_HOLES
    if (!hasTwoOrThree(table[nextHole])) return {table, reapedRemains}
    const newTable = R.assoc(nextHole, 0, table)
    return reapedRemainsFrom(nextHole, newTable, reapedRemains + table[nextHole])
}

const reapRemains = (sowedSeeds, reapedHole, table) => {
    const restOfSeeds = sowedSeeds % (NUMBER_OF_HOLES - 1)
    const lastSowedHole = (reapedHole + restOfSeeds) % NUMBER_OF_HOLES
    return reapRemainsFrom(lastSowedHole, table, 0)
}

const fieldOfPlayer = (player, table) => {
    const tableMiddle = Math.ceil(NUMBER_OF_HOLES / 2)
    const fieldOf = player === 'player'
        ? R.slice(0, tableMiddle - 1)
        : R.slice(tableMiddle, Infinity)
    return fieldOf(table)
}

const isInvalidTable = (player, table) => {
    const opponentField = player === 'opponent'
        ? fieldOfPlayer('player', table)
        : fieldOfPlayer('opponent', table)
    const isFieldEmpty = R.all(R.equals(0), opponentField)
    return isFieldEmpty
}

const reapFrom = (player, hole, table) => {
    const newTable = {
        ...table,
        holes: {
            ...table.holes,
            [player]: table.holes[player].map((seeds, holeNum) => holeNum === hole ? 0 : seeds)
        },
    }
    const reapedSeeds = table.holes[player][hole]
    return {newTable, reapedSeeds}
}

const plantSeedsFrom = (player, hole, table, seeds) => {

}

const table = reducerHash({
    [PLAYER_REAPS]: (state, {value: hole}) => reapFrom('player', hole, state).newTable,
    [OPPONENT_REAPS]: (state, {value: hole}) => reapFrom('opponent', hole, state).newTable,
}, initialTable)


const isFirstTurn = reducerHash({
    'PLAYER_OPENS_RANDOM': () => false,
    [OPPONENT_REAPS]: () => false,
}, true)

const reducer = combineReducers({
    table,
    isFirstTurn,
})

module.exports = reducer
