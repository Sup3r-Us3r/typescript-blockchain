import { Blockchain } from './blockchain';

const difficulty = Number(process.argv[2]) || 4;

const blockchain = new Blockchain(difficulty);

const numBlocks = Number(process.argv[3]) || 10;
let chain = blockchain.chain;

for (let i = 1; i <= numBlocks; i++) {
  const block = blockchain.createBlock(`Block ${i}`);
  const miningInfo = blockchain.miningBlock(block);
  chain = blockchain.sendBlock(miningInfo.minedBlock);
}

console.log('--- BLOCKCHAIN ---\n');
console.log(chain);
