import { IRoundCounter } from 'brain/build/esm/interfaces';
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
        worker.terminate();
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

export function trainingSession(
    props: TrainingProps,
    batchCallback: (batch: IRoundCounter) => void,
    modelCallback: (model: [string, number[]][]) => void
) {
    const worker = new ModelWorker();
    let session: { id: null | string} = { id: null };
    worker.postMessage(props);
    worker.onmessage = (e: MessageEvent) => {
        const res = e.data;
        if (res.success) {
            if (res.type === 'init') {
                if (session.id === null) {
                    session.id = res.data as string;
                    console.log('session', session.id)
                }
            }
            if (res.type === 'batch') {
                console.log('session', session.id, res.sessionId);
                if (session.id === res.sessionId) {
                    batchCallback(res.data);
                }
            } else if (res.type === 'model') {
                console.log('session', session.id, res.sessionId);
                if (session.id === res.sessionId) {
                    modelCallback(res.data);
                    worker.terminate();
                    session.id = null;
                }
            }
        } else {
            console.error('worker fail');
        }
    };
    worker.onerror = (e: ErrorEvent) => {
        console.error(e);
        worker.terminate();
    };
}

export async function loadPreTrainedModel () {
    try {
        const res = await fetch('/model.json');
        const result = await res.json();
        return result;
    } catch (error) {
        console.error(error);
        return []
    }
}
