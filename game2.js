const crypto = require('crypto');
const chalk = require('chalk');
const Table = require('cli-table3');

class RandomGenerator {
    static generateSecureRandomKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static generateFairRandomNumber(range, key) {
        let randomValue, hmac;
        randomValue = crypto.randomInt(0, range);
        const hmacKey = crypto.createHmac('sha3-256', key);
        hmac = hmacKey.update(randomValue.toString()).digest('hex');
        return { randomValue, hmac };
    }
}

class Dice {
    constructor(values) {
        if (values.some(v => isNaN(v) || v < 0)) {
            throw new Error('Invalid dice configuration. Only positive integers are allowed.');
        }
        this.values = values;
    }

    roll() {
        return this.values[crypto.randomInt(0, this.values.length)];
    }
}

class ProbabilityCalculator {
    static calculateWinningProbabilities(dice) {
        const probabilities = [];
        for (let i = 0; i < dice.length; i++) {
            for (let j = 0; j < dice.length; j++) {
                if (i !== j) {
                    const winCount = this.simulateDiceMatches(dice[i], dice[j]);
                    probabilities.push({
                        pair: `Dice ${i + 1} vs Dice ${j + 1}`,
                        probability: (winCount / 1000).toFixed(4)
                    });
                } else {
                    probabilities.push({
                        pair: `Dice ${i + 1} vs Dice ${j + 1}`,
                        probability: '-'
                    });
                }
            }
        }
        return probabilities;
    }

    static simulateDiceMatches(diceA, diceB) {
        let diceAWins = 0;
        for (let i = 0; i < 1000; i++) {
            const rollA = diceA.roll();
            const rollB = diceB.roll();
            if (rollA > rollB) diceAWins++;
        }
        return diceAWins;
    }
}

class HelpTable {
    static display(probabilities) {
        const table = new Table({
            head: [
                chalk.blue('User dice vs'),
                ...probabilities.filter(p => p.probability !== '-').map(p => chalk.blue(p.pair))
            ],
            colWidths: probabilities.map(p => Math.max(p.pair.length, 10)),
        });

        probabilities.forEach(({ pair, probability }) => {
            const row = [pair];
            for (let i = 0; i < probabilities.length; i++) {
                if (probabilities[i].pair === pair) {
                    row.push(probability);
                } else {
                    const index = probabilities.findIndex(p => p.pair === probabilities[i].pair);
                    row.push(probabilities[index].pair === pair ? '-' : probabilities[index].probability);
                }
            }
            table.push(row);
        });

        console.log(chalk.yellow('Probability of the win for the user:'));
        console.log(table.toString());
    }
}

class Game {
    constructor(diceConfigurations) {
        if (diceConfigurations.length < 3) {
            throw new Error('At least three dice configurations are required.');
        }
        this.dice = diceConfigurations.map(config => new Dice(config));
    }

    async play() {
        console.log("Let's determine who makes the first move.");

        const key = RandomGenerator.generateSecureRandomKey();
        const { randomValue, hmac } = RandomGenerator.generateFairRandomNumber(2, key);

        console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
        console.log('Try to guess my selection:');
        console.log('0 - 0');
        console.log('1 - 1');
        console.log('X - exit');
        console.log('? - help');

        const userGuess = await this.getUserInput(['0', '1', 'X', '?']);
        if (userGuess === 'X') process.exit(0);

        if (userGuess === '?') {
            const probabilities = ProbabilityCalculator.calculateWinningProbabilities(this.dice);
            HelpTable.display(probabilities);
            return this.play();
        }

        console.log(`My selection: ${randomValue} (KEY=${key}).`);

        const firstPlayer = randomValue === parseInt(userGuess) ? 'user' : 'computer';
        console.log(`${firstPlayer === 'user' ? 'You' : 'I'} make the first move.`);

        await this.selectDice(firstPlayer, key, randomValue);
    }

    async selectDice(firstPlayer, key, randomValue) {
        console.log('Available dice:');
        this.dice.forEach((d, i) => console.log(`${i} - [${d.values.join(',')}]`));
        console.log('X - exit');
        console.log('? - help');

        const selection = await this.getUserInput([...this.dice.keys()].map(String).concat(['X', '?']));
        if (selection === 'X') process.exit(0);

        if (selection === '?') {
            const probabilities = ProbabilityCalculator.calculateWinningProbabilities(this.dice);
            HelpTable.display(probabilities);
            return this.selectDice(firstPlayer, key, randomValue);
        }

        const selectedDice = parseInt(selection);
        console.log(`${firstPlayer === 'user' ? 'You' : 'I'} selected dice [${this.dice[selectedDice].values.join(',')}].`);

        // Restrict the opponent from choosing the same dice
        const availableDice = this.dice.filter((_, i) => i !== selectedDice);
        console.log(`Remaining dice for ${firstPlayer === 'user' ? 'me' : 'you'}:`);
        availableDice.forEach((d, i) => console.log(`${i} - [${d.values.join(',')}]`));

        // Proceed to the throwing phase
        await this.throwDice(firstPlayer, availableDice, key, randomValue);
    }

    async throwDice(player, availableDice, key, randomValue) {
        console.log(`Now, it's time for ${player === 'user' ? 'you' : 'me'} to throw the dice.`);
        console.log('Choose your dice:');
        availableDice.forEach((d, i) => console.log(`${i} - [${d.values.join(',')}]`));
        console.log('X - exit');

        const selection = await this.getUserInput([...availableDice.keys()].map(String).concat(['X']));
        if (selection === 'X') process.exit(0);

        const selectedDice = availableDice[parseInt(selection)];
        const userRoll = selectedDice.roll();
        const computerRoll = randomValue; // Simulate computer's roll with the generated value

        const result = (userRoll + computerRoll) % 6; // Change to appropriate modulus if necessary

        console.log(`You rolled: ${userRoll}`);
        console.log(`Computer rolled: ${computerRoll}`);
        console.log(`Sum modulo 6: ${result}`);
        console.log(`Secret key: ${key}`);

        // Verify HMAC
        const hmacKey = crypto.createHmac('sha3-256', key);
        const calculatedHmac = hmacKey.update(computerRoll.toString()).digest('hex');

        console.log(`HMAC calculated by user should match: ${calculatedHmac}`);
    }

    async getUserInput(validOptions) {
        return new Promise((resolve) => {
            const stdin = process.stdin;
            stdin.setEncoding('utf8');
            stdin.once('data', (data) => {
                const input = data.trim();
                if (!validOptions.includes(input)) {
                    console.log('Invalid input. Try again.');
                    resolve(this.getUserInput(validOptions));
                } else {
                    resolve(input);
                }
            });
        });
    }
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node game2.js <dice configurations>');
    process.exit(1);
}

try {
    const diceConfigurations = args.map(arg => arg.split(',').map(Number));
    const game = new Game(diceConfigurations);
    game.play();
} catch (err) {
    console.error(err.message);
    process.exit(1);
}
