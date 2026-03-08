
function feeCalculator(feePercentage) {
    return function (amount) {
        return amount * feePercentage;
    }
}
function baseAccount(ownername, initialBalance, alertCallback) {
    this.ownername = ownername;
    let balance = initialBalance;
    this.deposit = function (amount) {
        balance += amount;
        return balance;

    }
    this.withdraw = function (amount) {
        if (amount > balance) {
            alertCallback("Insufficient funds");
            return;
        }
        balance -= amount;
        if (balance < 1000 && alertCallback) {
            alertCallback("Balance is low");
        }
        return balance;
    }
    this.getBalance = function () {
        return balance;
    }
}
function savingsAccount(ownername, initialBalance, alertCallback) {
    baseAccount.call(this, ownername, initialBalance, alertCallback);
    this.accountType = "savings account";
}
savingsAccount.prototype = Object.create(baseAccount.prototype);
savingsAccount.prototype.constructor = savingsAccount;

function transferMoney(targetAccount, amount) {
    this.withdraw(amount);
    targetAccount.deposit(amount);
    console.log(`Transferred ${amount} from ${this.ownername} to ${targetAccount.ownername}`);
}

baseAccount.prototype.transferMoney = transferMoney;


function accountFactory(type, ownername, initialBalance, alertCallback) {
    if (type === "savings") {
        return new savingsAccount(ownername, initialBalance, alertCallback);
    }
    return new baseAccount(ownername, initialBalance, alertCallback);
}
module.exports = {
    accountFactory,
    feeCalculator,
    transferMoney
};