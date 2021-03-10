import { Snake } from "./snake";
import { allZeros, maxIndex, oppsite, samePoint, snakeSelfPos } from "./utils";

export interface IState {
    x: number;
    y: number;
    /**
     * 食物x - 蛇x
     */
    dfx: number;
    /**
     * 食物y - 蛇
     */
    dfy: number;
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

function zeroState (): IState {
    return {
        x: 0,
        y: 0,
        dfx: 0,
        dfy: 0,
        dsx: 0,
        dsy: 0
    }
}
export class Brain {
    private state: IState = zeroState();
    private snake: Snake;
    private actions: [number, number][];
    private q_table: Map<string, number[]> = new Map();
    private learning_rate: number = 0.05;
    private gamma: number = 0.9;
    private greedy_rate: number = 0.95;

    private buildQTable () {
        this.q_table = new Map();
    }

    public getFromQTable (state: IState): number[] {
        const { x, y, dfx, dfy, dsx, dsy } = state;
        const _key = `x:${x}:_y:${y}:_dfx:${dfx}:_dfy:${dfy}:_dsx:${dsx}:_dsy:${dsy}:`;
        // const _key = `x:${x}:_y:${y}:_dfx:${dfx}:_dfy:${dfy}:`;
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
        const { greedy_rate, q_table } = this;
        const rand = Math.random();
        const q_row = this.getFromQTable(this.state);
        let actIndex: number = 0;
        let reward: number = -0.1;
        if (rand > greedy_rate || allZeros(q_row)) {
            actIndex = Math.floor(Math.random() * this.actions.length)
        } else {
            actIndex = maxIndex(q_row);
            // if (q_row[actIndex] === 0) {
            //     actIndex = Math.floor(Math.random() * this.actions.length);
            // }
        }
        if (oppsite(this.actions[actIndex], this.snake.direction[this.snake.directionIndex])) {
            actIndex = (actIndex + 1) % this.actions.length;
        }
        // 尝试执行蛇运动，给出蛇真实运动之后奖励
        const { hasFood, died, snakePos } = this.snake.mockMove(actIndex);
        if (hasFood) {
            reward = 10
        }
        if (died) {
            reward = -10
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
        this.updateState(actIndex);
        const nextState = this.state;
        let realValue = reward;
        if (!died) {
            const q_row = this.getFromQTable(nextState);
            const nextActIndex = maxIndex(q_row);
            realValue += this.gamma * q_row[nextActIndex]; // 这里拿到的state是还没有执行当前actIndex策略的state
        }
        const expectedValue = this.getFromQTable(state)[actIndex];
        this.getFromQTable(state)[actIndex] += this.learning_rate * (realValue - expectedValue);
    }

    public updateState (actIndex: number) {
        this.snake.move(actIndex);
        const head = this.snake.snake[0];
        const food = this.snake.food;
        const [dsx, dsy] = snakeSelfPos(this.snake.snake);
        this.state = {
            x: head[0],
            y: head[1],
            dfx: food[0] - head[0],
            dfy: food[1] - head[1],
            dsx,
            dsy
        };
    }

    public useNewSnake (snake: Snake) {
        this.snake = snake;
        const head = this.snake.snake[0];
        const food = this.snake.food;
        const [dsx, dsy] = snakeSelfPos(this.snake.snake);
        this.state = {
            x: head[0],
            y: head[1],
            dfx: food[0] - head[0],
            dfy: food[1] - head[1],
            dsx,
            dsy,
        };
    }

    public train (roundLimit: number) {
        this.buildQTable();
        let good_ans_count = 0;
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
            if (this.snake.snake.length > 4 || count > 50) {
                console.log(i, this.snake.snake.length, count);
                good_ans_count++;
            }
        }
        console.log('good ans count', good_ans_count)
    }

}