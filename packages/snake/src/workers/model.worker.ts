import { Brain, Snake } from 'brain';
const modelRef: { brain: Brain | null } = {
    brain: null
}
function controller (e: any) {
    const { width, height, round } = e.data;
    const snake = new Snake({ width, height });
    modelRef.brain = new Brain(snake);
    console.log('start training', round)
    modelRef.brain.train(round);
    console.log('end training')
    // @ts-ignore
    self.postMessage({
        success: true,
        data: modelRef.brain.exportQTable()
    })
}
self.addEventListener('message', controller, false);