import { ethers } from "ethers";
import { Context } from "telegraf";

import Trade from "../model/Trade";

import address from "../config/address.json";
import routerABI from "../abi/router.json";
import tokenABI from "../abi/token.json";

import { TradeType, NETWORK } from "../lib/constants";
import CONFIG from "./config";

const provider = new ethers.JsonRpcProvider(`https://bsc-${process.env.NETWORK}.infura.io/v3/${process.env.INFURA_KEY}`);

const wbnbAddress = address[process.env.NETWORK as NETWORK].wbnb;
const spuAddress = address[process.env.NETWORK as NETWORK].spu;

const owner = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

/**
 * Swap @bnb BNB to token.
 * @param ctx Telegraf context
 * @param bnb BNB amount for buying token
 * @returns Nothing to return
 */
export const startBuyTrade = async (ctx: Context, bnb: Number) => {
    await ctx.reply('-------------------- Start Buy --------------------');

    // Create new wallet to trade
    const newAccount = ethers.Wallet.createRandom(provider);
    const trade = await Trade.create({
        address: newAccount.address,
        privateKey: newAccount.privateKey,
        type: TradeType.Buy
    });
    console.log('Address:', newAccount.address);
    console.log('Private Key:', newAccount.privateKey);
    ctx.reply(`New wallet created.\nAddress:\n${newAccount.address}\nPrivate Key:\n${newAccount.privateKey}`);

    try {
        const beforeBalance = await provider.getBalance(owner.address);
        console.log('Admin wallet balance:', ethers.formatEther(beforeBalance));

        const txFeeAmount = ethers.parseUnits(CONFIG.TXFEE.toString(), 'ether');
        const amountIn = ethers.parseUnits(bnb.toString(), 'ether');

        trade.bnbAmount = amountIn.toString();

        const fee = await provider.getFeeData();
        if (!fee.gasPrice) return ctx.reply('Cannot estimate gas price!.');

        // Send BNB to new wallet
        const sendtx = {
            to: newAccount.address,
            value: amountIn + txFeeAmount,
            gasLimit: 21000,
            gasPrice: fee.gasPrice
        };
        const sendBnbTx = await owner.sendTransaction(sendtx)
        ctx.reply(`${bnb} + ${CONFIG.TXFEE} BNB sent: ${sendBnbTx.hash}`);
        console.log(`${bnb} + ${CONFIG.TXFEE} BNB sent:`, sendBnbTx.hash);
        trade.transactionHashes.push(sendBnbTx.hash);
        await sendBnbTx.wait();

        // Swap BNB to token
        const routerContract = new ethers.Contract(address[process.env.NETWORK as NETWORK].router, routerABI, newAccount);
        const deadline = ~~(Date.now() / 1000) + 3600 * 24;
        const swapTx = await routerContract.swapExactETHForTokens(0, [wbnbAddress, spuAddress], newAccount.address, deadline, { value: amountIn });
        ctx.reply(`Swapped ${bnb} BNB to SPU: ${swapTx.hash}`);
        console.log(`Swapped ${bnb} BNB to SPU:`, swapTx.hash);
        trade.transactionHashes.push(swapTx.hash);
        await swapTx.wait();

        // Return token to admin
        const spuContract = new ethers.Contract(address[process.env.NETWORK as NETWORK].spu, tokenABI, newAccount);
        const spuBalance = await spuContract.balanceOf(newAccount.address);
        ctx.reply(`SPU amount: ${ethers.formatEther(spuBalance)}`);
        console.log('SPU amount:', ethers.formatEther(spuBalance));
        trade.tokenAmount = spuBalance.toString();

        const returnSPUTx = await spuContract.transfer(owner.address, spuBalance);
        ctx.reply(`SPU returned to admin: ${returnSPUTx.hash}`);
        console.log('SPU returned to admin:', returnSPUTx.hash);
        trade.transactionHashes.push(returnSPUTx.hash);
        await returnSPUTx.wait();

        // Return BNB to admin
        const bnbBalance = await provider.getBalance(newAccount.address);
        ctx.reply(`BNB balance: ${ethers.formatEther(bnbBalance)}`);
        const returnBalance = bnbBalance - fee.gasPrice * BigInt(21000);
        const returntx = {
            to: owner.address,
            value: returnBalance,
            gasLimit: 21000,
            gasPrice: fee.gasPrice
        };
        const returnBNBTx = await newAccount.sendTransaction(returntx);
        ctx.reply(`${ethers.formatEther(returnBalance)} BNB returned to admin: ${returnBNBTx.hash}`);
        console.log(`${ethers.formatEther(returnBalance)} BNB returned to admin:`, returnBNBTx.hash);
        trade.transactionHashes.push(returnBNBTx.hash);
        await returnBNBTx.wait();
        
        trade.success = true;

        const afterBalance = await provider.getBalance(owner.address);
        console.log('Admin wallet balance:', ethers.formatEther(afterBalance));
        const feeSpend = beforeBalance - afterBalance - amountIn;
        trade.fee = feeSpend.toString();

        ctx.reply(`Used fee: ${ethers.formatEther(feeSpend)} BNB`);
        console.log(`Used fee: ${ethers.formatEther(feeSpend)} BNB`);

        ctx.reply('--------------------- End Buy ---------------------');
    } catch (err) {
        if (err instanceof Error) ctx.reply(err.message);
        console.error(err);
    } finally {
        trade.save();
    }
}

/**
 * Swap @token tokens to BNB.
 * @param ctx Telegraf context
 * @param token Token amount to sell
 * @returns Nothing to return
 */
export const startSellTrade = async (ctx: Context, token: Number) => {
    await ctx.reply('-------------------- Start Sell --------------------');

    // Create new wallet to trade
    const newAccount = ethers.Wallet.createRandom(provider);
    const trade = await Trade.create({
        address: newAccount.address,
        privateKey: newAccount.privateKey,
        type: TradeType.Sell
    });
    console.log('Address:', newAccount.address);
    console.log('Private Key:', newAccount.privateKey);
    ctx.reply(`New wallet created.\nAddress:\n${newAccount.address}\nPrivate Key:\n${newAccount.privateKey}`);

    try {
        const beforeBalance = await provider.getBalance(owner.address);
        console.log('Admin wallet balance:', ethers.formatEther(beforeBalance));

        const txFeeAmount = ethers.parseUnits(CONFIG.TXFEE.toString(), 'ether');
        const tokenAmount = ethers.parseUnits(token.toString(), 'ether');
        
        trade.tokenAmount = tokenAmount.toString();

        const fee = await provider.getFeeData();
        if (!fee.gasPrice) return ctx.reply('Cannot estimate gas price!.');

        // Send BNB for trading fee
        const sendtx = {
            to: newAccount.address,
            value: txFeeAmount,
            gasLimit: 21000,
            gasPrice: fee.gasPrice
        };
        const sendBnbTx = await owner.sendTransaction(sendtx)
        ctx.reply(`${CONFIG.TXFEE} BNB sent: ${sendBnbTx.hash}`);
        console.log(`BNB sent:`, sendBnbTx.hash);
        trade.transactionHashes.push(sendBnbTx.hash);
        await sendBnbTx.wait();

        // Send token to sell
        const spuContract = new ethers.Contract(address[process.env.NETWORK as NETWORK].spu, tokenABI, owner);
        const sendSPUTx = await spuContract.transfer(newAccount.address, tokenAmount);
        ctx.reply(`${token} SPU sent: ${sendSPUTx.hash}`);
        console.log(`${token} SPU sent:`, sendSPUTx.hash);
        trade.transactionHashes.push(sendSPUTx.hash);
        await sendSPUTx.wait();

        // Approve all tokens of wallet to router contract
        const spuContractByNew = new ethers.Contract(address[process.env.NETWORK as NETWORK].spu, tokenABI, newAccount);
        const tokenBalance = await spuContractByNew.balanceOf(newAccount.address);
        const approveTx = await spuContractByNew.approve(address[process.env.NETWORK as NETWORK].router, tokenBalance);
        ctx.reply(`${token} SPU approved: ${approveTx.hash}`);
        console.log(`${token} SPU approved:`, approveTx.hash);
        trade.transactionHashes.push(approveTx.hash);
        await approveTx.wait();
        
        // Swap token to BNB
        const routerContract = new ethers.Contract(address[process.env.NETWORK as NETWORK].router, routerABI, newAccount);
        const amountOut = await routerContract.getAmountsOut(tokenBalance, [spuAddress, wbnbAddress]);

        const deadline = ~~(Date.now() / 1000) + 3600 * 24;
        const swapTx = await routerContract.swapExactTokensForETH(tokenBalance, 0, [spuAddress, wbnbAddress], newAccount.address, deadline);
        ctx.reply(`Swapped ${token} SPU to BNB: ${swapTx.hash}`);
        console.log(`Swapped ${token} SPU to BNB:`, swapTx.hash);
        trade.transactionHashes.push(swapTx.hash);
        await swapTx.wait();
        
        const bnbBalance = await provider.getBalance(newAccount.address);
        ctx.reply(`BNB balance: ${ethers.formatEther(bnbBalance)}`);
        console.log('BNB balance:', ethers.formatEther(bnbBalance));
        trade.bnbAmount = bnbBalance.toString();

        // Return remain BNB to admin
        const returnBalance = bnbBalance - fee.gasPrice * BigInt(21000);
        const returntx = {
            to: owner.address,
            value: returnBalance,
            gasLimit: 21000,
            gasPrice: fee.gasPrice
        };
        const returnBNBTx = await newAccount.sendTransaction(returntx);
        ctx.reply(`${ethers.formatEther(returnBalance)} BNB returned to admin: ${returnBNBTx.hash}`);
        console.log(`${ethers.formatEther(returnBalance)} BNB returned to admin:`, returnBNBTx.hash);
        trade.transactionHashes.push(returnBNBTx.hash);
        await returnBNBTx.wait();

        trade.success = true;

        const afterBalance = await provider.getBalance(owner.address);
        console.log('Admin wallet balance:', ethers.formatEther(afterBalance));
        const feeSpend = beforeBalance - afterBalance + amountOut[1];
        trade.fee = feeSpend.toString();

        ctx.reply(`Used fee: ${ethers.formatEther(feeSpend)} BNB`);
        console.log(`Used fee: ${ethers.formatEther(feeSpend)} BNB`);

        ctx.reply('--------------------- End Sell ---------------------');
    } catch (err) {
        if (err instanceof Error) ctx.reply(err.message);
        console.error(err);
    } finally {
        trade.save();
    }
}