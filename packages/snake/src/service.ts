import ModelWorker from './workers/model.worker?worker';


interface SuccessResult<T> {
    success: true;
    data: T;
}
interface FailResult<T> {
    success: false;
    message: string;
}

type Result<T> = SuccessResult<T> | FailResult<T>;

function workerService<T, R>(worker: Worker, data: R): Promise<Result<T>> {
    return new Promise<Result<T>>((resolve, reject) => {
        worker.postMessage(data);
        worker.onmessage = (e: MessageEvent) => {
            resolve(e.data);
        };
        worker.onerror = (e: ErrorEvent) => {
            reject({
                success: false,
                message: e.error,
            });
        };
    });
}

interface TrainingProps {
    width: number;
    height: number;
    round: number;
}
export async function getTrainedModelData (props: TrainingProps) {
    try {
        const worker = new ModelWorker();
        const res = await workerService<[string, number[]][], TrainingProps>(worker, props);
        if (res.success) {
            return res.data;
        } else {
            throw new Error('worker fail')
        }
    } catch (error) {
        console.error(error)
        return []
    }
}