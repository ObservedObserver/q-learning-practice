import React, { useEffect } from 'react';
import { QLearning } from './lib';

function App () {
    useEffect(() => {
        const model = new QLearning();
        model.train(20);
    }, [])
    return <div>lalal</div>
}

export default App;
