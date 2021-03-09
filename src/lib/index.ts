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
export class QLearning {
    private learningRate: number = 0.9;
    private gamma: number = 0.9;
    private epsilon: number = 0.9;
    public state: number;
    private max_length: number = 7;
    private actions: number[] = [-1, 1];
    private q_table: number[][];
    private initQTable () {
        this.q_table = [];
        for (let i = 0; i <= this.max_length; i++) {
            this.q_table.push([])
            for (let j = 0; j < this.actions.length; j++) {
                this.q_table[i].push(0)
            }
        }
    }
    constructor () {
        this.initQTable();
    }
    /**
     * 接受一个策略（实际执行），根据预期收益和实际收益，更新qtable
     */
    private updateQTable (actIndex: number) {
        const { state, actions, q_table, gamma, learningRate, max_length } = this;
        const nextState = state + actions[actIndex];
        // console.log(
        //   actIndex,
        //   actions,
        //   state,
        //   state + actions[actIndex],
        //   q_table,
        //   q_table[nextState]
        // );

        if (nextState === max_length) {
            q_table[state][actIndex] += 10;
        } else {
            // console.log('nextState', nextState)
            const nextStepIndex = maxIndex(q_table[nextState]);
            const Q_Real: number = q_table[state][actIndex] + q_table[nextState][nextStepIndex];

            let expectedActionIndex = maxIndex(q_table[state]);
            if (state + actions[expectedActionIndex] < 0) {
                expectedActionIndex = (expectedActionIndex + 1) % actions.length;
            }
            const expectedNextState = state + actions[expectedActionIndex];
            const nextStepActionIndex = maxIndex(q_table[expectedNextState]);
            const Q_Expected = q_table[state][expectedActionIndex] + gamma * q_table[expectedNextState][nextStepActionIndex];

            // console.log(Q_Real, Q_Expected, 'rea')

            q_table[state][actIndex] += learningRate * (Q_Real - Q_Expected)
        }
    }

    private canRunAction (actIndex: number): boolean {
        // console.log("can", this.state + this.actions[actIndex], actIndex);
        if (this.state + this.actions[actIndex] >= 0) {
            return true;
        }
        return false;
    }

    private runAction (actIndex: number) {
        this.state += this.actions[actIndex];
    }

    private initState () {
        this.state = Math.floor(Math.random() * this.max_length);
    }

    public train (max_round: number) {
        this.initQTable();
        for (let i = 0; i < max_round; i++) {
            this.initState();
            let cost = 0;
            while (this.state < this.max_length) {
                const rand = Math.random();
                cost++;
                // 使用随机策略
                if (rand >= this.epsilon) {
                    let actionIndex = Math.round(Math.random());
                    // console.log('rand', actionIndex)
                    if (!this.canRunAction(actionIndex)) {
                        actionIndex = (actionIndex + 1) % this.actions.length
                    }
                    this.updateQTable(actionIndex);
                    this.runAction(actionIndex);
                } else {
                    let actionIndex = maxIndex(this.q_table[this.state]);
                    if (!this.canRunAction(actionIndex)) {
                      actionIndex = (actionIndex + 1) % this.actions.length;
                    }
                    this.updateQTable(actionIndex);
                    this.runAction(actionIndex);
                }
            }
            console.log('game cost', cost);
        }
        console.log(this.q_table);
    }
}