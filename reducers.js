const {combineReducers} = require('redux')
const {reducerHash} = require('astx-redux-util')
const {PLAYER_REAPS, OPPONENT_REAPS} = require('./actions')
const R = require('ramda')


const initialTable = {
    holes: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    deposit: {
        player: 0,
        opponent: 0,
    },
}


const NUMBER_OF_HOLES = 12

const sowHole = (reapedSeeds, reapedHole, plantedSeeds, hole) => {
    if (hole === reapedHole) return 0
    const seedsPerHole = Math.floor(reapedSeeds / (NUMBER_OF_HOLES - 1))
    const restOfSeeds = reapedSeeds % (NUMBER_OF_HOLES - 1)
    const distanceToSowedHole = reapedHole < hole
        ? hole - reapedHole
        : (NUMBER_OF_HOLES - reapedHole) + hole
    const receivesExtraSeed = distanceToSowedHole <= restOfSeeds
    const remainingSeeds = receivesExtraSeed
        ? plantedSeeds + seedsPerHole + 1
        : plantedSeeds + seedsPerHole
    return remainingSeeds
}

const sow = R.curry((reapedHole, tableHoles) => tableHoles.map(
    (plantedSeeds, hole) => sowHole(tableHoles[reapedHole], reapedHole, plantedSeeds, hole)
))

const hasTwoOrThree = x => x === 2 || x === 3

const reapRemainsFrom = (lastSowedHole, tableHoles, reapedRemains) => {
    const nextHole = (lastSowedHole + 1) % NUMBER_OF_HOLES
    if (!hasTwoOrThree(tableHoles[nextHole])) return {tableHoles, reapedRemains}
    const newTable = R.assoc(nextHole, 0, tableHoles)
    return reapedRemainsFrom(nextHole, newTable, reapedRemains + table[nextHole])
}

const reapRemains = R.curry((sowedSeeds, reapedHole, tableHoles) => {
    const restOfSeeds = sowedSeeds % (NUMBER_OF_HOLES - 1)
    const lastSowedHole = (reapedHole + restOfSeeds) % NUMBER_OF_HOLES
    return reapRemainsFrom(lastSowedHole, tableHoles, 0)
})

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

const storeRemains = (player, remains, table) => ({
    ...table,
    deposit: R.assoc(player, table.deposit[player] + remains, table.deposit)
})

const playMove = (player, hole, table) => R.pipe(
    sow(hole),
    reapRemains(table.holes[hole], hole),
    ({tableHoles, reapedRemains}) => ({table: {...table, holes: tableHoles}, reapedRemains}),
    ({table: newTable, reapedRemains}) => storeRemains(player, reapedRemains, newTable),
)(table.holes)

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
