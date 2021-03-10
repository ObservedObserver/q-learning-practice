import { Snake } from "./snake";
import { allZeros, maxIndex, oppsite, samePoint, snakeSelfPos } from "./utils";

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
     * 蛇头x - 蛇身x(min)
     */
    dsx: number;
    /**
     * 蛇头y - 蛇身y(min)
     */
    dsy: number;
}

export { Snake }


export class Brain {
    public snake: Snake;
    private actions: [number, number][];
    private q_table: Map<string, number[]> = new Map();
    private learning_rate: number = 0.2;
    private gamma: number = 0.9;
    public greedy_rate: number = 0.98;

    private buildQTable () {
        this.q_table = new Map();
    }

    public getFromQTable (state: IState): number[] {
        const { x, y, fx, fy, dsx, dsy } = state;
        // const _key = `x:${x}:_y:${y}:_dfx:${dfx}:_dfy:${dfy}:_dsx:${dsx}:_dsy:${dsy}:`;
        const _key = `x:${x}:_y:${y}:_fx:${fx}:_fy:${fy}:`;
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
        let reward: number = 0.1;
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
        // console.log('move', state)
        this.snake.move(actIndex)
        // 这个died是指state执行完action后的状态，即nextState
        if (!died) {
            const nextState = this.state;
            // console.log(state, nextState, '===')
            // if (nextState.y < 0) {
            //     console.log('B', died, nextState)
            // }
            const q_row = this.getFromQTable(nextState);
            const nextActIndex = maxIndex(q_row);
            realValue += this.gamma * q_row[nextActIndex]; // 这里拿到的state是还没有执行当前actIndex策略的state
        }
        const expectedValue = this.getFromQTable(state)[actIndex];
        // console.log(this.getFromQTable(state));
        this.getFromQTable(state)[actIndex] += this.learning_rate * (realValue - expectedValue);
        // console.log(this.getFromQTable(state))
        // console.log('===', died, state.x, state.y)
    }

    public get state (): IState {
        const head = this.snake.snake[0];
        const food = this.snake.food;
        const [dsx, dsy] = snakeSelfPos(this.snake.snake);
        return {
            x: head[0],
            y: head[1],
            fx: food[0],
            fy: food[1],
            dsx,
            dsy,
        };
    }

    public useNewSnake (snake: Snake) {
        this.snake = snake;
    }

    public train (roundLimit: number) {
        this.buildQTable();
        let good_ans_count = 0;
        let bad_ans_count = 0;
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

            if (this.snake.score > 4 || count > 50) {
                // console.log(i, this.snake.snake.length, count);
                good_ans_count++;
            }
            if (this.snake.score === 1 || count < 10) {
                bad_ans_count++
            }
            if (i % 10000 === 0) {
                console.log('good rate', good_ans_count / 10000 * 100);
                console.log('bad rate', bad_ans_count / 10000 * 100)
                good_ans_count = 0;
                bad_ans_count = 0
            }
        }
        console.log(this.q_table.size)
        // console.log(this.q_table.entries())
        // for (let i = 0; i < 4; i++) {
        //     for (let j = 0; j < 4; j++) {
        //         for (let k = 0; k )
        //     }
        // }
        // console.log([...this.q_table.entries()].slice(0, 20))
        // console.log('good ans count', good_ans_count)
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