const bank = require('./bankLogic');
function alertCallback(name, balance) {
    console.log(`alert ${name},your account balance is low: ${balance}`);
}
console.log("Savings Account");
const wajahataccount = bank.accountFactory("savings", "Wajahat", 5000, alertCallback);
const aliaccount = bank.accountFactory("savings", "Ali", 3000, alertCallback);
console.log("Wajahat's balance:", wajahataccount.getBalance());
console.log("fee calculator");
const calculateFee= bank.feeCalculator(0.02);
console.log(`fee on 1000: ${calculateFee(1000)}`);
console.log ("transfer money");
bank.transferMoney.call(wajahataccount, aliaccount, 2000);
bank.transferMoney.apply(aliaccount, [wajahataccount, 1000]);

const aliTransfer = bank.transferMoney.bind(aliaccount);
aliTransfer(wajahataccount, 500);
console.log("Balances");
aliaccount.withdraw(3500);

