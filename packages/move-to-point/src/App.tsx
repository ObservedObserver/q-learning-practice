import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QLearning } from './lib';
import './App.css';

const SPACE_WIDTH = 17;

function App() {
    const [trainedRound, setTrainedRound] = useState(1);
	const [isTraining, setIsTraining] = useState<boolean>(false);
    const modelRef = useRef<QLearning>();
	const [pos, setPos] = useState<number>(0);
	const [cost, setCost] = useState<number>(0);
	const intRef = useRef<number>(0)

	const space = useMemo<string[]>(() => {
		return new Array(SPACE_WIDTH + 1).fill('').map((s, i) => {
			if (i === pos) return '+'
			return ''
		})
	}, [pos])
	
	const training = useCallback((round: number) => {
		setIsTraining(true);
		setTimeout(() => {
			const model = new QLearning(SPACE_WIDTH);
            model.train(round);
            modelRef.current = model;
			setIsTraining(false)
		}, 0)
	}, [])

	const startGame = useCallback(() => {
		if (modelRef.current) {
            const init_pos = Math.floor(Math.random() * SPACE_WIDTH);
            modelRef.current.initState(init_pos);
            setCost(0);
            setPos(init_pos);
            intRef.current = setInterval(() => {
                const { isEnd, newState } = modelRef.current!.chooseAction();
                setPos(newState);
                setCost((c) => c + 1);
                modelRef.current?.initState(newState);
                if (isEnd) {
                    clearInterval(intRef.current);
                }
            }, 500);
        }
	}, [])

	const stopGame = useCallback(() => {
		clearInterval(intRef.current);
	}, [])

    return (
        <div className="App">
			<div>
				<input value={trainedRound} onChange={e => {
					setTrainedRound(Number(e.target.value));
				}} />
				<button onClick={() => {
					training(trainedRound);
				}}>training</button>
				<button onClick={startGame}>start game</button>
				<button onClick={stopGame}>stop game</button>
			</div>
			<p>{isTraining ? 'training' : 'model ready'}</p>
            <div className="space">
                {space.map((s, index) => (
                    <div key={index} className="space-block">
						{
							s === '+' && <div className="user-role" />
						}
						{
							index === SPACE_WIDTH && 'WIN!'
						}
					</div>
                ))}
            </div>
			<div>
				<h3>COST: {cost}</h3>
			</div>
        </div>
    );
}

export default App;
