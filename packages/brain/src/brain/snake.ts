import { samePoint } from "./utils";

export class Snake {
    public playground: { width: number; height: number };
    public snake: [number, number][] = [];
    public food: [number, number] = [0, 0];
    public directionIndex: number = 0;
    public score: number = 0;
    public readonly direction: [number, number][] = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
    ];

    constructor (playgournd: { width: number; height: number }) {
        this.playground = playgournd;
        this.init();
    }

    public init () {
        this.snake = [
            [
                Math.floor(Math.random() * this.playground.width),
                Math.floor(Math.random() * this.playground.height)
            ]
        ];
        this.createFood();
        this.score = 0;
        this.directionIndex = 0;
    }

    public mockMove(dirIndex: number): {
        snakePos: [number, number][],
        hasFood: boolean,
        died: boolean,
        suicide: boolean,
        hitWall: boolean
    } {
        const { direction, food } = this;
        const snake = [...this.snake];
        let hasFood = false;
        const dir = direction[dirIndex];
        const head = snake[0]
        const nextPoint: [number, number] = [
            head[0] + dir[0],
            head[1] + dir[1]
        ]
        if (!samePoint(nextPoint, food)) {
            snake.pop();
        } else {
            hasFood = true;
            // snake.pop();
        }
        snake.unshift(nextPoint);
        // let died = this.die(snake);
        // let suicide = this.suicide(snake);
        let suicide = false;
        let hitWall = this.hitWall(snake);

        return {
            snakePos: snake,
            hasFood,
            died: hitWall,
            suicide,
            hitWall
        }
    }

    public move(dirIndex?: number) {
        if (typeof dirIndex !== 'undefined') {
            this.directionIndex = dirIndex;
        }
        const {snakePos, hasFood} = this.mockMove(this.directionIndex)
        this.snake = snakePos;
        if (hasFood) {
            this.createFood();
            this.score++;
        }
    }

    private randPos (): [number, number] {
        return [
            Math.floor(Math.random() * this.playground.width),
            Math.floor(Math.random() * this.playground.height)
        ]
    }

    private createFood () {
        let food: [number, number] = this.randPos();
        while(this.snake.some(pos => samePoint(food, pos))) {
            food = this.randPos();
        }
        this.food = food;
        return food;
    }

    private suicide(space: [number, number][]): boolean {
        let set = new Set();
        for (let i = 0; i < space.length; i++) {
            let key = space[i][0] + '-' + space[i][1];
            if (set.has(key)) {
                // console.log('suicide')
                return true;
            }
            set.add(key);
        }
        return false;
    }

    public hitWall (snakePos: [number, number][]): boolean {
        const { playground } = this;
        if (
          snakePos[0][0] < 0 ||
          snakePos[0][1] < 0 ||
          snakePos[0][0] >= playground.width ||
          snakePos[0][1] >= playground.height
        ) {
            return true;
        }
        return false;
    }

    public die (snakePos: [number, number][]): boolean {
        const { playground } = this;
        if (this.suicide(snakePos)) return true;
        if (snakePos[0][0] < 0 || snakePos[0][1] < 0 || snakePos[0][0] >= playground.width || snakePos[0][1] >= playground.height) return true;
        return false;
    }
}
