export interface IRow {
    [key: string]: any
}

export interface IRoundCounter {
    food: number;
    game_round: number;
    batch_train_round: number;
    batch_size: number;
}