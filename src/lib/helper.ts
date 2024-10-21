import CONFIG from "../lib/config";

export const generateRandomBNBAmount = () => {
    const randomValue = Math.random() * (CONFIG.BNB_MAX_AMOUNT - CONFIG.BNB_MIN_AMOUNT) + CONFIG.BNB_MIN_AMOUNT;
    return parseFloat(randomValue.toFixed(3));
}

export const generateRandomTokenAmount = () => {
    return Math.floor(Math.random() * (CONFIG.TOKEN_MAX_AMOUNT - CONFIG.TOKEN_MIN_AMOUNT) + CONFIG.TOKEN_MIN_AMOUNT);
}
