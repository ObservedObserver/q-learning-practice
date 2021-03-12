import { IRoundCounter } from "../interfaces";
import { Snake } from "./snake";
import { allZeros, bbox, maxIndex, oppsite, samePoint, snakeSelfPos } from "./utils";

export interface IState {
    x: number;
    y: number;
    /**
     * 食物x
     */
    fx: number;
    /**
     * 食物y
     */
    fy: number;
    /**
     * 蛇身x(min)
     */
    // dsx: number;
    /**
     * 蛇身y(min)
     */
    // dsy: number;
    cbbox: [[number, number], [number, number]];
}

export { Snake }

let debugCount = 0;

export class SnakeBrain {
    public snake: Snake;
    private actions: [number, number][];
    private q_table: Map<string, number[]> = new Map();
    private learning_rate: number = 0.25;
    private gamma: number = 0.9;
    public greedy_rate: number = 0.99;
    private batch_size: number = 5000;

    private buildQTable () {
        this.q_table = new Map();
    }

    public getFromQTable (state: IState): number[] {
        const { x, y, fx, fy, cbbox } = state;
        const _key = `x:${x}:_y:${y}:_fx:${fx}:_fy:${fy}:_cbbox:${cbbox.join(',')}:`;
        // const _key = `x:${x}:_y:${y}:_fx:${fx}:_fy:${fy}:_sx:${dsx}:_sy:${dsy}:`;
        // const _key = `x:${x}:_y:${y}:_fx:${fx}:_fy:${fy}:`;
        if (!this.q_table.has(_key)) {
            this.q_table.set(_key, this.actions.map(a => 0))
        }
        return this.q_table.get(_key)!;
    }

    constructor (snake: Snake) {
        this.snake = snake;
        this.actions = snake.direction;
        this.useNewSnake(snake);
        this.buildQTable();
    }

    public chooseAction () {
        const { greedy_rate, q_table, actions } = this;
        const rand = Math.random();
        const q_row = this.getFromQTable(this.state);
        let actIndex: number = 0;
        let reward: number = 0.05;
        if (rand > greedy_rate || allZeros(q_row)) {
            actIndex = Math.floor(Math.random() * this.actions.length)
        } else {
            actIndex = maxIndex(q_row);
            if (q_row[actIndex] === 0) {
                const zeroActions: number[] = [];
                q_row.forEach((q, qIndex) => {
                    if (q === 0) {
                        zeroActions.push(qIndex)
                    }
                })
                actIndex = Math.floor(Math.random() * zeroActions.length);
            }
        }
        if (oppsite(this.actions[actIndex], this.snake.direction[this.snake.directionIndex])) {
            actIndex = (actIndex + 2) % this.actions.length;
        }
        // 尝试执行蛇运动，给出蛇真实运动之后奖励
        const { hasFood, died, snakePos, suicide, hitWall } = this.snake.mockMove(actIndex);
        if (hasFood) {
            reward = 10
        }
        if (hitWall) {
            reward = -100
        }
        if (suicide) {
            reward = -100
        }
        return {
            reward,
            snakePos,
            actIndex,
            died
        }
    }

    public updateQTable (actIndex: number, reward: number, died: boolean) {
        // this.snake.move(actIndex);
        // 这里可以外部封装一个runAction来获取两个前后的state
        const state = this.state;
        let realValue = reward;
        this.snake.move(actIndex)
        // 这个died是指state执行完action后的状态，即nextState
        if (!died) {
            const nextState = this.state;
 
            const q_row = this.getFromQTable(nextState);
            const nextActIndex = maxIndex(q_row);
            realValue += this.gamma * q_row[nextActIndex]; // 这里拿到的state是还没有执行当前actIndex策略的state
        }
        const expectedValue = this.getFromQTable(state)[actIndex];

        this.getFromQTable(state)[actIndex] += this.learning_rate * (realValue - expectedValue);
 
    }

    public get state (): IState {
        const head = this.snake.snake[0];
        const food = this.snake.food;
        // const [dsx, dsy] = snakeSelfPos(this.snake.snake);
        const cbbox = bbox(this.snake.snake.slice(4))
        return {
            x: head[0],
            y: head[1],
            fx: food[0],
            fy: food[1],
            // dsx,
            // dsy
            cbbox
        };
    }

    public useNewSnake (snake: Snake) {
        this.snake = snake;
    }

    public train (roundLimit: number, batchCallback?: (data: IRoundCounter) => void) {
        this.buildQTable();
        let good_ans_count = 0;
        let bad_ans_count = 0;
        let round_counter: IRoundCounter = {
            food: 0,
            game_round: 0,
            batch_train_round: 0,
            batch_size: this.batch_size
        };
        // const scores: Array<> = 
        for (let i = 0; i < roundLimit; i++) {
            this.snake.init();
            this.useNewSnake(this.snake);
            let count = 0;
            while(true) {
                const { actIndex, died, reward } = this.chooseAction();

                this.updateQTable(actIndex, reward, died);

                count++;
                if (died) {
                    break;
                }
            }
            if (batchCallback && round_counter.batch_train_round % this.batch_size === 0) {
               batchCallback(round_counter); 
               round_counter = {
                    food: 0,
                    game_round: 0,
                    batch_train_round: round_counter.batch_train_round,
                    batch_size: this.batch_size
                };
            }

            // if (this.snake.score > 4 || count > 50) {
            //     // console.log(i, this.snake.snake.length, count);
            //     good_ans_count++;
            // }
            // if (this.snake.score === 1 || count < 10) {
            //     bad_ans_count++
            // }
            // if (i % 1000 === 0) {
            //     console.log(i, 'good rate', good_ans_count / 1000 * 100);
            //     console.log(i, 'bad rate', bad_ans_count / 1000 * 100)
            //     good_ans_count = 0;
            //     bad_ans_count = 0
            // }
            round_counter.batch_train_round++;
            round_counter.food += this.snake.score;
            round_counter.game_round += count;
        }
        console.log(this.q_table.size)
    }

    public exportQTable () {
        return [...this.q_table.entries()];
    }

    public importQTable (table: [string, number[]][]) {
        this.q_table = new Map();
        table.forEach(row => {
            this.q_table.set(row[0], row[1])
        })
    }
}