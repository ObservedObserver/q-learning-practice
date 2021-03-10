import { Brain, Snake } from '../index';
const snake = new Snake({
    width: 8,
    height: 8,
});
console.log(snake);
const brain = new Brain(snake);
console.log(brain);
brain.train(200000);
