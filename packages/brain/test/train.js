const RL = require('../build/cjs/index');

const snake = new RL.Snake({
  width: 4,
  height: 4,
});

console.log(snake);
const brain = new RL.Brain(snake);
console.log(brain);
brain.train(1600000);

// console.log(brain.)