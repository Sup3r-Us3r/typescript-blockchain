import { hash, validatedHash } from './helpers';

export interface Block {
  header: {
    nonce: number;
    blockHash: string;
  };
  payload: {
    sequence: number;
    timestamp: number;
    data: any;
    previousHash: string;
  };
}

export class Blockchain {
  private _chain: Block[] = [];
  private powPrefix = '0';

  constructor(private readonly difficulty: number = 4) {
    this._chain.push(this.createGenesisBlock());
  }

  private createGenesisBlock(): Block {
    const payload: Block['payload'] = {
      sequence: 0,
      timestamp: +new Date(),
      data: 'Initial block',
      previousHash: '',
    }

    return {
      header: {
        nonce: 0,
        blockHash: hash(JSON.stringify(payload)),
      },
      payload,
    };
  }

  get chain(): Block[] {
    return this._chain;
  }

  private get lastBlock(): Block {
    return this._chain[this._chain.length - 1] as Block
  }

  private getPreviousBlockHash(): string {
    return this.lastBlock.header.blockHash;
  }

  createBlock(data: any): Block['payload'] {
    const newBlock: Block['payload'] = {
      sequence: this.lastBlock.payload.sequence + 1,
      timestamp: +new Date(),
      data,
      previousHash: this.getPreviousBlockHash()
    };

    console.log(
      `Block #${newBlock.sequence} created: ${JSON.stringify(newBlock)}\n`
    );

    return newBlock;
  }

  miningBlock(block: Block['payload']) {
    let nonce = 0;
    const start = +new Date();

    while (true) {
      const blockHash = hash(JSON.stringify(block));
      const hashPow = hash(blockHash + nonce);

      if (
        validatedHash({
          hash: hashPow,
          difficulty: this.difficulty,
          prefix: this.powPrefix,
        })
      ) {
        const final = +new Date();
        const reducedHash = blockHash.slice(0, 12);
        const miningTime = (final - start) / 1000;

        console.log(
          `Block #${block.sequence} mined in ${miningTime}s ` +
          `Hash: ${reducedHash} (${nonce}) attempts\n`
        );

        return {
          minedBlock: {
            header: {
              nonce,
              blockHash,
            },
            payload: { ...block },
          },
        };
      }

      nonce++;
    }
  }

  private verifyBlock(block: Block): boolean {
    if (block.payload.previousHash !== this.getPreviousBlockHash()) {
      console.error(
        `Block #${block.payload.sequence} invalid. ` +
        `The previous hash is ${this.getPreviousBlockHash().slice(0, 12)} and not ` +
        `${block.payload.previousHash.slice(0, 12)}\n`,
      );

      return false;
    }

    const testHash = hash(hash(JSON.stringify(block.payload)) + block.header.nonce);

    if (
      !validatedHash({
        hash: testHash,
        difficulty: this.difficulty,
        prefix: this.powPrefix,
      })
    ) {
      console.error(
        `Block #${block.payload.sequence} invalid. ` +
        `Nonce ${block.header.nonce} is invalid and cannot be verified\n`,
      );

      return false;
    }

    return true;
  }

  sendBlock(block: Block): Block[] {
    if (this.verifyBlock(block)) {
      this._chain.push(block);

      console.log(
        `Block #${block.payload.sequence} has been added to blockchain: ` +
        `${JSON.stringify(block, null, 2)}\n\n` +
        '------------------------------------------------------------\n\n',
      );
    }

    return this._chain;
  }
}
