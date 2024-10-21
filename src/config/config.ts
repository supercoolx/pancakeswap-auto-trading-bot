const CONFIG = {
    TXFEE: 0.1,                 // BNB amount for transaction in BNB
    BNB_MIN_AMOUNT: 0.001,      // Min bnb amount for buy token
    BNB_MAX_AMOUNT: 0.01,       // Max bnb amount for buy token
    TOKEN_MIN_AMOUNT: 1000,     // Min token amount to sell
    TOKEN_MAX_AMOUNT: 5000,     // Max token amount to sell
    TRADE_INTERVAL: 60 * 1000,  // Trade run random time in every 1 min
}

export default CONFIG;