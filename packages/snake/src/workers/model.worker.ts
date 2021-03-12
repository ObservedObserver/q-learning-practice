import { SnakeBrain, Snake } from 'brain';
const modelRef: { brain: SnakeBrain | null } = {
    brain: null
}

function controller (e: any) {
    const { width, height, round } = e.data;
    const sessionId = 'session-' + (new Date().getTime())
    const snake = new Snake({ width, height });
    modelRef.brain = new SnakeBrain(snake);
    // @ts-ignore
    self.postMessage({
        success: true,
        type: 'init',
        sessionId,
        data: sessionId
    })
    console.log('start training', round)
    modelRef.brain.train(round, (data) => {
        // @ts-ignore
        self.postMessage({
            success: true,
            type: 'batch',
            sessionId,
            data,
        });
    });
    console.log('end training')
    // @ts-ignore
    self.postMessage({
        success: true,
        sessionId,
        type: 'model',
        data: modelRef.brain.exportQTable()
    })
}
self.addEventListener('message', controller, false);