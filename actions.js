
const OPPONENT_REAPS = 'OPPONENT_REAPS'
const PLAYER_REAPS = 'PLAYER_REAPS'

const opponentMove = value => ({
    type: OPPONENT_REAPS,
    value,
})

const playerMove = value => ({
    type: PLAYER_REAPS,
    value,
})

module.exports = {
    OPPONENT_REAPS,
    PLAYER_REAPS,
    opponentMove,
    playerMove,
}
