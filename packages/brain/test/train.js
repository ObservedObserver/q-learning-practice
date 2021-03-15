const RL = require('../build/cjs/index');
const fs = require('fs');
const path = require('path');

const snake = new RL.Snake({
  width: 12,
  height: 12,
});

const preTrainedData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./model-12-12.json")).toString()
);

// console.log(snake);
const brain = new RL.SnakeBrain(snake);
brain.importQTable(preTrainedData);
brain.greedy_rate = 0.99999;
brain.learning_rate = 0.1
brain.train(100000, (data) => {
  console.log(data)
});

const data = brain.exportQTable();

fs.writeFileSync(
  path.resolve(__dirname, "./model-12-12-2.json"),
  JSON.stringify(data)
);

