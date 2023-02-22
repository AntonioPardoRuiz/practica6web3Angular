import {Injectable} from "@angular/core";

import Web3 from 'web3';
import {AbiItem} from 'web3-utils'
import TwitterContract from './../../../../../local-eth/build/contracts/TwitterContract.json';
import {Subject} from "rxjs";
import {WindowRef} from "../window/windowref.service";

@Injectable()
export class Web3Service {
    private contractAddress = "0x7A147C2C08Fc80c1A5B3Fc1D0d9082b6f6EFc8ca";
    public contractInstance: any;
    public web3 = new Web3('ws://localhost:7545');

    public status$ = new Subject();

    protected account = null;

    public constructor(protected winRef: WindowRef) {
        let that = this;
        this.winRef.nativeWindow.ethereum.on('accountsChanged', (accounts: any) => {
            if (accounts.length === 0) {
                that.disconnect();
            } else if (accounts[0] !== that.account) {
                that.account = accounts[0];
            }
        });
    }

    public initContractInstance() {
        this.contractInstance = new this.web3.eth.Contract(TwitterContract.abi as AbiItem[], this.contractAddress);
    }

    public getAccounts(): Promise<any> {
        return this.web3.eth.getAccounts()
    }

    public async getTweets(): Promise<any> {
        const gas = await this.contractInstance.methods.getAllTweets().estimateGas();
        return this.contractInstance.methods.getAllTweets().call()
    }

    public async addTweet(tweetText: string): Promise<any> {
        const gas = await this.contractInstance.methods.addTweet(tweetText, false).estimateGas({from: this.account});
        const gasPrice = await this.web3.eth.getGasPrice();
        return this.contractInstance.methods.addTweet(tweetText, false)
            .send({ from: this.account, gas: this.web3.utils.toHex(gas), gasPrice: this.web3.utils.toHex(gasPrice) })
    }

    public async connectToWallet() {
        if (!this.winRef.nativeWindow.ethereum) {
            console.log("Need to download Wallet")
        } else {
            const accounts = await this.winRef.nativeWindow.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            this.status$.next(true);
        }
    }

    public isConnected() {
        return this.account != null;
    }

    public getConnectedAccount() {
        return this.account;
    }

    public disconnect() {
        this.account = null;
        this.status$.next(false);
    }

}
