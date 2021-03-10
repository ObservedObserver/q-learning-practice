import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Brain, Snake } from 'brain';
import { getTrainedModelData } from '../service';

const BLOCK_SIZE = 40;

interface SnakeProps {
    width: number;
    height: number;
}

const COLOR: { [key: string]: string } = {
    snake: '#4cc9f0',
    background: '#2b2d42',
    food: '#f72585',
};

const View: React.FC<SnakeProps> = (props: SnakeProps) => {
    const [space, setSpace] = useState<Array<[number, number]>>([[0, 0]]);
    const [food, setFood] = useState<[number, number]>([0, 0]);
    const modelRef = useRef<Brain>();
    const [trainedRound, setTrainedRound] = useState(160000);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const clockRef = useRef<number>(0)

    const training = useCallback((round: number) => {
        setIsTraining(true);
        const snake = new Snake({ width: props.width, height: props.height });
        const brain = new Brain(snake);
        modelRef.current = brain;
        // setTimeout(() => {
        //     modelRef.current?.train(round);
        //     setIsTraining(false);
        // }, 0)
        getTrainedModelData({ width: props.width, height: props.height, round: round }).then(data => {
            if (modelRef.current) {
                modelRef.current.importQTable(data);
                console.log(modelRef.current)
            }
            setIsTraining(false);
        })
    }, [props.width, props.height]);

    const startGame = useCallback(() => {
        if (modelRef.current) {
            clearInterval(clockRef.current);
            modelRef.current.greedy_rate = 0.99999;
            modelRef.current.snake.init();
            modelRef.current.useNewSnake(modelRef.current.snake);
            setSpace(modelRef.current.snake.snake);
            setFood(modelRef.current.snake.food);
            clockRef.current = setInterval(() => {
                const { actIndex, died } = modelRef.current!.chooseAction();
                const snake = modelRef.current!.snake;
                snake.move(actIndex);
                setFood(snake.food);
                setSpace(snake.snake);
                if (died) {
                    clearInterval(clockRef.current);
                }
            }, 80);
        }
    }, []);

    const stopGame = useCallback(() => {
        clearInterval(clockRef.current);
    }, []);

    
    const width = BLOCK_SIZE * props.width;
    const height = BLOCK_SIZE * props.height;
    return (
        <div className="snake-playground-container">
            <div className="designer">
                <input
                    className="item"
                    value={trainedRound}
                    onChange={(e) => {
                        setTrainedRound(Number(e.target.value));
                    }}
                />
                <button
                    className="item"
                    onClick={() => {
                        training(trainedRound);
                    }}
                >
                    training
                </button>
                <button className="item" onClick={startGame}>
                    start game
                </button>
                <button className="item" onClick={stopGame}>
                    stop game
                </button>
            </div>
            <p>{isTraining ? 'training' : 'model ready'}</p>
            <div className="snake-playground" style={{ width, height, backgroundColor: COLOR.background }}>
                <svg width={width} height={height}>
                    <rect
                        x={food[0] * BLOCK_SIZE}
                        y={food[1] * BLOCK_SIZE}
                        width={BLOCK_SIZE}
                        height={BLOCK_SIZE}
                        style={{ fill: COLOR.food }}
                    />
                    <g style={{ fill: COLOR.snake }}>
                        {space.map((cell, index) => {
                            return (
                                <rect
                                    key={`cell-${index}`}
                                    x={cell[0] * BLOCK_SIZE}
                                    y={cell[1] * BLOCK_SIZE}
                                    width={BLOCK_SIZE}
                                    height={BLOCK_SIZE}
                                />
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default View;
