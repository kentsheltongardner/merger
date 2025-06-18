
import Point from "./point.js"
import Rect from "./rect.js"

// Find out how many solutions vs. number of valid moves
// Low solutions vs high size of tree = interesting level
// Start from small size 


const Tau               = Math.PI * 2

const ColorNone         = 0
const ColorRed          = 1
const ColorOrange       = 2
const ColorYellow       = 3
const ColorGreen        = 4
const ColorCyan         = 5
const ColorBlue         = 6
const ColorPurple       = 7
const ColorMagenta      = 8
const ColorWhite        = 9
const ColorBlack        = 10
const ColorGray         = 11

const ColorCount        = 12
// gray for no wall?

const StringToColor: { [key: string]: number } = {
    ' ': ColorNone,
    'r': ColorRed,
    'o': ColorOrange,
    'y': ColorYellow,
    'g': ColorGreen,
    'c': ColorCyan,
    'b': ColorBlue,
    'p': ColorPurple,
    'm': ColorMagenta,
    'w': ColorWhite,
    'k': ColorBlack,
    'a': ColorGray,
}
const ColorToRGBA = [
    '#00000000',
    '#ff0000ff',
    '#ff8000ff',
    '#ffff00ff',
    '#00ff00ff',
    '#00ffffff',
    '#0000ffff',
    '#8000ffff',
    '#ff00ffff',
    '#ffffffff',
    '#000000ff',
    '#808080ff',
]

const LevelData: Array<Array<string>> = [
    [
        'w w',
    ],
    [
        'www www',
    ],
    [
        'w  ',
        '   ',
        '  w',
    ],
    [
        'w  ',
        '   ',
        'w w',
    ],
    [
        ' r ',
        'w r',
        ' w ',
    ],
    [
        'rrar',
        ' aa ',
        'r  r',
    ],
    [
        'r  w',
        ' br ',
        'wrbr',
        'b w ',
    ],
    [
        'r gw',
        ' br ',
        'wrbr',
        '  w ',
    ],
    [
        'r gwm',
        ' br b',
        'wrwr ',
        ' mr  ',
        'rwbgw',
    ],
    // [
    //     'rr w',
    //     ' brb',
    //     'w br',
    //     'bww ',
    // ]
]

class UndoData {
    public x:       number
    public y:       number
    public color:   number
    public count:   number
    constructor(x: number, y: number, color: number, count: number) {
        this.x      = x
        this.y      = y
        this.color  = color
        this.count  = count
    }
}

class Level {
    public moveX        = 0
    public moveY        = 0

    public undoStack =  Array<Array<UndoData>>()

    public w:           number
    public h:           number
    public grid:        Array<Uint8Array>
    public movers:      Array<Uint8Array>
    public counts:      Array<Uint8Array>

    constructor(data: Array<string>) {
        this.w      = data[0].length
        this.h      = data.length
        this.grid   = new Array<Uint8Array>
        this.movers = new Array<Uint8Array>
        this.counts = new Array<Uint8Array>
        for (let i = 0; i < this.w; i++) {
            this.grid[i]    = new Uint8Array(this.h)
            this.movers[i]  = new Uint8Array(this.h)
            this.counts[i]  = new Uint8Array(this.h)
            for (let j = 0; j < this.h; j++) {
                const color     = StringToColor[data[j][i]]
                this.grid[i][j] = color
                if (color !== ColorNone) {
                    this.counts[i][j] = 1
                }
            }
        }
    }

    public setMovers(x: number, y: number) {
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                this.movers[i][j] = 0
            }
        }

        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false

        const grid = this.grid
        if (grid[x][y] !== ColorNone) return false

        let xe = x 
        let ys = y
        let xw = x
        let yn = y

        while (xe < this.w - 1 && grid[xe][y]   === ColorNone) xe++
        while (ys < this.h - 1 && grid[x][ys]   === ColorNone) ys++
        while (xw > 0 && grid[xw][y]            === ColorNone) xw--
        while (yn > 0 && grid[x][yn]            === ColorNone) yn--

        const colorCounts = new Uint8Array(ColorCount)

        colorCounts[grid[xe][y]]++
        colorCounts[grid[x][ys]]++
        colorCounts[grid[xw][y]]++
        colorCounts[grid[x][yn]]++

        let groupCount      = 0
        let dominantColor   = 0
        for (let i = ColorRed; i < ColorGray; i++) {
            if (colorCounts[i] > 1) {
                groupCount++
                dominantColor = i
            }
        }

        if (groupCount !== 1) return false

        this.moveX = x
        this.moveY = y

        if (grid[xe][y] === dominantColor) this.movers[xe][y] = 1
        if (grid[x][ys] === dominantColor) this.movers[x][ys] = 1
        if (grid[xw][y] === dominantColor) this.movers[xw][y] = 1
        if (grid[x][yn] === dominantColor) this.movers[x][yn] = 1

        return true
    }

    public move() {
        let color   = ColorNone
        let count   = 0
        const undo  = new Array<UndoData>()
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                if (this.movers[i][j] === 1) {
                    color = this.grid[i][j]
                    count += this.counts[i][j]
                    undo.push(new UndoData(i, j, color, this.counts[i][j]))
                    this.grid[i][j] = ColorNone
                    this.counts[i][j] = 0
                }
            }
        }
        undo.push(new UndoData(this.moveX, this.moveY, ColorNone, 0))
        this.grid[this.moveX][this.moveY] = color
        this.counts[this.moveX][this.moveY] = count
        this.undoStack.push(undo)
    }

    public undo() {
        if (this.undoStack.length === 0) return

        const undo = this.undoStack.pop()!
        for (const undoData of undo) {
            this.grid[undoData.x][undoData.y] = undoData.color
            this.counts[undoData.x][undoData.y] = undoData.count
        }
    }

    public beaten() {
        const colorCounts = new Uint8Array(ColorCount)
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                const color = this.grid[i][j]
                if (color !== ColorNone && color !== ColorGray && colorCounts[color] === 1) return false
                colorCounts[color]++
            }
        }
        return true
    }
}

class ClickBuffer {
    private static readonly MaxSize = 10
    private size                    = 0
    private first                   = 0
    private last                    = 0
    private x                       = new Uint8Array(ClickBuffer.MaxSize)
    private y                       = new Uint8Array(ClickBuffer.MaxSize)
    
    public push(x: number, y: number) {
        if (this.full()) return
        this.x[this.last] = x
        this.y[this.last] = y
        if (this.last === ClickBuffer.MaxSize - 1) {
            this.last = 0
        } else {
            this.last++
        }
        this.size++
    }
    public pop(): Point | null {
        if (this.empty()) return null
        const index = this.first
        if (this.first === ClickBuffer.MaxSize - 1) {
            this.first = 0
        } else {
            this.first++
        }
        this.size--
        return new Point(this.x[index], this.y[index])
    }
    public empty() { return this.size === 0 }
    public full() { return this.size === ClickBuffer.MaxSize }
}


export default class Game {

    private static readonly MovementMilliseconds = 500

    private levelNumber                 = 0
    private canvas                      = <HTMLCanvasElement>document.getElementById('game-canvas')
    private context                     = this.canvas.getContext('2d')!
    private clickBuffer                 = new ClickBuffer()
    private moving                      = 0
    private movementStartMillisecond    = 0

    private level:                      Level
    
    constructor() {
        this.level = new Level(LevelData[this.levelNumber])
        this.canvas.addEventListener('mousedown', e => { this.handleClick(e) })
        window.addEventListener('keydown', e => { this.handleKey(e) })
        this.canvas.addEventListener('contextmenu', e => { this.handleContextMenu(e) })
        this.loop()
    }

    private handleContextMenu(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
    }

    private handleClick(e: MouseEvent) {
        if (e.button === 2 && !this.moving) {
            this.level.undo()
        } else if (e.button === 0) {
            const cellPoint = this.cellPoint(e.offsetX, e.offsetY)
            this.clickBuffer.push(cellPoint.x, cellPoint.y)
        }
    }

    private handleKey(e: KeyboardEvent) {
        switch (e.code) {
            case 'KeyR': {
                this.moving = 0
                this.level = new Level(LevelData[this.levelNumber])
                break
            }
            case 'KeyN': {
                if (this.levelNumber === LevelData.length - 1) return
                this.moving = 0
                this.levelNumber++
                this.level = new Level(LevelData[this.levelNumber])
                break
            }
            case 'KeyP': {
                if (this.levelNumber === 0) return
                this.moving = 0
                this.levelNumber--
                this.level = new Level(LevelData[this.levelNumber])
                break
            }
        }
    }

    private loop() {
        this.update()
        this.render()
        requestAnimationFrame(() => { this.loop() })
    }

    private update() {
        if (this.moving) {
            if (this.areMovementMillisecondsElapsed()) {
                this.completeMovement()
                if (this.level.beaten() && this.levelNumber < LevelData.length - 1) {
                    this.levelNumber++
                    this.level = new Level(LevelData[this.levelNumber])
                }
            }
        } else {
            let click = this.clickBuffer.pop()
            while (click !== null) {
                if (this.canMove(click.x, click.y)) {
                    this.beginMovement()
                    break
                }
                click = this.clickBuffer.pop()
            }
        }
    }

    private canMove(x: number, y: number) {
        return this.level.setMovers(x, y)
    }

    private beginMovement() {
        this.moving = 1
        this.movementStartMillisecond = performance.now()
    }

    private areMovementMillisecondsElapsed() {
        return (performance.now() - this.movementStartMillisecond) > Game.MovementMilliseconds
    }

    private completeMovement() {
        this.level.move()
        this.moving = 0
    }

    private render() {
        this.canvas.width       = window.innerWidth
        this.canvas.height      = window.innerHeight
        this.context.fillStyle  = '#101010ff'
        const cellSize          = this.cellSize()
        const displayRect       = this.displayRect()

        this.context.fillRect(displayRect.x, displayRect.y, displayRect.w, displayRect.h)
        this.renderGrid(cellSize, displayRect)
        this.renderCells(cellSize, displayRect)
    }
    private renderGrid(cellSize: number, displayRect: Rect) {
        this.context.strokeStyle = '#ffffff20'
        this.context.beginPath()
        for (let i = 0; i <= this.level.w; i++) {
            const x = displayRect.x + i * cellSize
            this.context.moveTo(x, displayRect.y)
            this.context.lineTo(x, displayRect.y + displayRect.h)
        }
        for (let i = 0; i <= this.level.h; i++) {
            const y = displayRect.y + i * cellSize
            this.context.moveTo(displayRect.x, y)
            this.context.lineTo(displayRect.x + displayRect.w, y)
        }
        this.context.stroke()
    }
    private renderCells(cellSize: number, displayRect: Rect) {
        const grid              = this.level.grid
        const moveX             = this.level.moveX
        const moveY             = this.level.moveY
        const movers            = this.level.movers
        // const counts            = this.level.counts
        const movementScalar    = this.moving * (performance.now() - this.movementStartMillisecond) / Game.MovementMilliseconds
        const displayScalar     = this.sinify(movementScalar) * cellSize
        const halfCellSize      = cellSize / 2
        const radius            = cellSize * 0.3

        this.context.globalCompositeOperation = 'lighter'

        for (let i = 0; i < this.level.w; i++) {
            for (let j = 0; j < this.level.h; j++) {
                const color = grid[i][j]
                if (color === ColorNone) continue

                this.context.fillStyle  = ColorToRGBA[color]

                if (color === ColorGray) {
                    const x = displayRect.x + i * cellSize
                    const y = displayRect.y + j * cellSize
                    this.context.fillRect(x, y, cellSize, cellSize)
                    continue
                }

                let dx = 0
                let dy = 0

                if (movers[i][j] === 1) {
                    dx = (moveX - i) * displayScalar
                    dy = (moveY - j) * displayScalar
                }

                const x = displayRect.x + i * cellSize + halfCellSize + dx 
                const y = displayRect.y + j * cellSize + halfCellSize + dy

                this.context.beginPath()
                this.context.moveTo(x, y)
                this.context.arc(x, y, radius, 0, Tau)
                this.context.fill()
            }
        }
    }

    // Takes a number in the range [0, 1] and maps it to a smooth animation
    private sinify(value: number) {
        const sin = Math.sin(value * Math.PI / 2)
        return sin * sin * sin * sin
    }

    private cellPoint(displayX: number, displayY: number) {
        const displayRect = this.displayRect()
        const cellSize = this.cellSize()
        const x = Math.floor((displayX - displayRect.x) / cellSize)
        const y = Math.floor((displayY - displayRect.y) / cellSize)
        return new Point(x, y)
    }
    private isHorizontalDisplay() {
        return window.innerWidth * this.level.h > window.innerHeight * this.level.w
    }
    private cellSize() {
        if (this.isHorizontalDisplay()) return Math.floor(window.innerHeight / this.level.h)
        return Math.floor(window.innerWidth / this.level.w)
    }
    private displayRect() {
        const cellSize  = this.cellSize()
        const w         = this.level.w * cellSize
        const h         = this.level.h * cellSize
        const x         = Math.floor((window.innerWidth - w) / 2)
        const y         = Math.floor((window.innerHeight - h) / 2)
        return new Rect(x, y, w, h)
    }
}


// Numbers isolate an interesting asymmetry: given a set of valid objects (1), we can increment to produce natural numbers
// Reversing the process using the results (natural numbers > 1) yields members of the set
// Reversing the process using non-results (1) yields 0, and by extension the integers
// Iterating incrementation introduces addition, which like incrementation and decrementation yields naturals and integers
// Iterating addition introduces multiplication, whose inverse operation yields integers if