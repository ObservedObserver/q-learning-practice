import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SnakeBrain, Snake } from 'brain';
import { getTrainedModelData, loadPreTrainedModel, trainingSession } from '../service';
import { IRoundCounter } from 'brain/build/esm/interfaces';
import embed from 'vega-embed';

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

interface IRoundRow extends IRoundCounter {
    final_score: number;
}

const View: React.FC<SnakeProps> = (props: SnakeProps) => {
    const [space, setSpace] = useState<Array<[number, number]>>([[0, 0]]);
    const [food, setFood] = useState<[number, number]>([0, 0]);
    const modelRef = useRef<SnakeBrain>();
    const [trainedRound, setTrainedRound] = useState(20000);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [board, setBoard] = useState<IRoundRow[]>([]);
    const clockRef = useRef<number>(0)
    const chartRef = useRef<HTMLDivElement>(null);

    const training = useCallback((round: number) => {
        setIsTraining(true);
        const snake = new Snake({ width: props.width, height: props.height });
        const brain = new SnakeBrain(snake);
        modelRef.current = brain;
        // 这里是同步训练代码，debug用
        // setTimeout(() => {
        //     modelRef.current?.train(round);
        //     setIsTraining(false);
        // }, 0)
        // 这里是可视化训练过程，类似tensorboard
        trainingSession(
            { width: props.width, height: props.height, round: round },
            (batch) => {
                const avg_round = batch.game_round / batch.batch_size;
                const avg_food = batch.food / batch.batch_size;
                let nextBatch: IRoundRow = {
                    ...batch,
                    game_round: avg_round,
                    food: avg_food,
                    final_score: avg_food * avg_round
                }
                setBoard(list => list.concat(nextBatch));
            },
            (model) => {
                modelRef.current!.importQTable(model);
                setIsTraining(false);
            }
        );

        // 这里异步直接请求训练结果（可能延时很长）
        // getTrainedModelData({ width: props.width, height: props.height, round: round }).then(data => {
        //     if (modelRef.current) {
        //         modelRef.current.importQTable(data);
        //         console.log(modelRef.current)
        //     }
        //     setIsTraining(false);
        // })

    }, [props.width, props.height]);

    const loadModel = useCallback(() => {
        setIsTraining(true);
        const snake = new Snake({ width: props.width, height: props.height });
        const brain = new SnakeBrain(snake);
        modelRef.current = brain;
        loadPreTrainedModel().then((data) => {
            if (modelRef.current) {
                modelRef.current.importQTable(data);
            }
            setIsTraining(false);
        });
    }, [props.width, props.height]);

    const startGame = useCallback(() => {
        if (modelRef.current) {
            clearInterval(clockRef.current);
            modelRef.current.greedy_rate = 0.999;
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

    useEffect(() => {
        if (chartRef.current) {
            embed(
                chartRef.current,
                {
                    data: {
                        values: board,
                    },
                    repeat: ['food', 'game_round', 'final_score'],
                    spec: {
                        mark: 'line',
                        encoding: {
                            x: { field: 'batch_train_round', type: 'quantitative' },
                            y: { field: { repeat: 'repeat' }, type: 'quantitative' },
                        },
                    },
                },
                {
                    mode: 'vega-lite',
                }
            );
        }
    }, [board])

    
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
                <button className="item" onClick={loadModel}>
                    load model
                </button>
                <button className="item" onClick={startGame}>
                    start game
                </button>
                <button className="item" onClick={stopGame}>
                    stop game
                </button>
            </div>
            <p>{isTraining ? 'training' : 'model ready'}</p>
            <div style={{ display: board.length === 0 ? 'none' : 'block'}} ref={chartRef}></div>
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
