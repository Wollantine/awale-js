const {Subject, fromEvent, merge} = require('rxjs')
const {map, filter, distinctUntilChanged, scan} = require('rxjs/operators')
const Readline = require('readline')
const R = require('ramda')
const {prop, equals, compose} = R
const {opponentMove, playerMove} = require('./actions')
const reducer = require('./reducers')

const parseDecimalInt = R.flip(parseInt)(10)
const log = text => x => console.log(text + ': ', x)
const lt = R.flip(R.lt)
const gte = R.flip(R.gte)
const subtract = R.flip(R.subtract)

const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});


const hasType = type => compose(equals(type), prop('type'))


const input$ = fromEvent(readline, 'line').pipe(map(parseDecimalInt))
const opponentMove$ = input$.pipe(filter(lt(6)), map(opponentMove))
const playerMove$ = input$.pipe(
    filter(R.both(gte(10), lt(16))),
    map(subtract(10)),
    map(playerMove)
)

const move$ = merge(opponentMove$, playerMove$).pipe(distinctUntilChanged(equals, prop('type')))
// const filteredOpponentMove$ = move$.pipe(filter(hasType(OPPONENT_MOVE)))
// const filteredPlayerMove$ = move$.pipe(filter(hasType(PLAYER_MOVE)))


const action$ = new Subject()
move$.subscribe(action$)

state$ = action$.pipe(scan(reducer, reducer(undefined, {type: 'INIT'})))

action$.subscribe(log('action'))

const zeroToDash = x => x === 0 ? '_' : String(x)
const tableToStr = ({holes, deposit}) => (
    `P: (${holes.player.map(zeroToDash).join(' ')}) _${deposit.player}_\n` +
    `O: (${holes.opponent.map(zeroToDash).join(' ')}) _${deposit.opponent}_`
)
state$.pipe(map(prop('table')), map(tableToStr)).subscribe(console.error)
