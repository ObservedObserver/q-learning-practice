function maxIndex (arr: number[]): number {
    let index = 0;
    let _max = -Infinity;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > _max) {
            _max = arr[i];
            index = i;
        }
    }
    return index;
}

function allZeros (nums: number[]): boolean {
    return nums.every(n => n === 0)
}
export class QLearning {
    private learningRate: number = 0.1;
    private gamma: number = 0.9;
    private epsilon: number = 0.9;
    public state: number = 0;
    private max_length: number = 7;
    private actions: number[] = [-1, 1];
    private q_table: number[][] = [];
    private initQTable () {
        this.q_table = [];
        for (let i = 0; i < this.max_length; i++) {
            this.q_table.push([])
            for (let j = 0; j < this.actions.length; j++) {
                this.q_table[i].push(0)
            }
        }
    }
    constructor (max_length: number) {
        this.max_length = max_length;
        this.initQTable();
    }
    /**
     * 接受一个策略（实际执行），根据预期收益和实际收益，更新qtable
     */
    private updateQTable (actIndex: number, reward: number, isEnd: boolean) {
        const { state, actions, q_table, gamma, learningRate } = this;
        let Q_Real: number = 0;
        if (isEnd) {
            Q_Real = reward;
        } else {
            const nextState = state + actions[actIndex];
            const nextStepIndex = maxIndex(q_table[nextState]);
            Q_Real = reward + gamma * q_table[nextState][nextStepIndex];

        }
    
        const Q_Expected = q_table[state][actIndex];

        q_table[state][actIndex] += learningRate * (Q_Real - Q_Expected);
    }

    public chooseAction (round?: number): { reward: number; actIndex: number, isEnd: boolean, newState: number } {
        const { epsilon, q_table, state, actions, max_length } = this;
        let reward = 0;
        let isEnd = false;
        const rand = Math.random();
        let actIndex = 0;
        if (rand > epsilon || allZeros(q_table[state])) {
            actIndex = Math.floor(Math.random() * actions.length);
        } else {
            actIndex = maxIndex(q_table[state]);      
        }
        if (state + actions[actIndex] === -1) {
            actIndex = (actIndex + 1) % actions.length;
            isEnd = true;
            reward = 0;
        }
        if (state + actions[actIndex] === max_length) {
            isEnd = true;
            reward = 1;
        }
        return {
            reward,
            actIndex,
            isEnd,
            newState: state + actions[actIndex]
        }
    }

    public initState (value?: number) {
        if (value) {
            this.state = value;
        } else {
            this.state = Math.floor(Math.random() * this.max_length);
        }
    }

    public train (max_round: number) {
        this.initQTable();
        for (let i = 0; i < max_round; i++) {
            this.initState();
            let cost = 0;
            while (this.state < this.max_length) {
                const { reward, actIndex, isEnd } = this.chooseAction(cost);
                this.updateQTable(actIndex, reward, isEnd);
                this.state += this.actions[actIndex];
                cost++;
            }
            console.log('game cost', cost);
        }
        console.log(this.q_table);
    }
}