import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import TwitterContract from "../../../abi/TwitterContract.json";
import Web3 from "web3";
import {AbiItem} from "web3-utils";
import {Tweet} from "../model/tweet";
import { create } from 'ipfs-http-client'

//declare window variable
declare let window: any;

const projectId = 'xxx'
const projectSecret = 'xxx'

@Injectable()
export class Web3Service {

    protected contractAddress = "0x3aF6665a309a7c51764ca9E81A3f42c2c3A2335d";

    protected web3 = new Web3("ws://localhost:7545");

    protected contractInstance: any;

    protected ipfsClient: any = null;

    protected account: string | null = null;

    public status$ = new Subject<boolean>();

    public onNewTweet$ = new Subject<any>();

    public constructor() {

        this.contractInstance = new this.web3.eth.Contract(TwitterContract.abi as AbiItem[], this.contractAddress)
        this.contractInstance.events.CreateTweet({})
            .on('data', (event: any) => {
                this.onNewTweet$.next(event);
            })

        window.Buffer = require('buffer/').Buffer;
        const auth = 'Basic ' + window.Buffer.from(projectId + ':' + projectSecret).toString('base64');

        this.ipfsClient = create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            apiPath: '/api/v0',
            headers: {
                authorization: auth
            }
        })

        if (!window.ethereum) {
            alert('Please install MetaMask first.');
        }
        else {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.status$.next(true);
                } else {
                    this.disconnectWallet();
                }
            });

        }

    }

    public async getAllTweets() {
        return this.contractInstance.methods.getAllTweets().call();
    }

    public async publishTweet(tweet: Tweet) {

        if(tweet.imageBuffer != null) {
            //upload to infura ipfs ...
            const file = await this.ipfsClient.add(tweet.imageBuffer);
            tweet.image = file.path;
        }

        let gas = await this.contractInstance.methods.createTweet(tweet.message, tweet.image).estimateGas({from: this.account});
        let gasPrice = await this.web3.eth.getGasPrice();

        this.contractInstance.methods.createTweet(tweet.message, tweet.image)
            .send({ from: this.account,
                    gas: this.web3.utils.toHex(gas),
                    gasPrice: this.web3.utils.toHex(gasPrice) });
    }

    public async connectWallet() {
        if (!window.ethereum) {
            alert('Please install MetaMask first.');
        }
        else {
            let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            console.log(this.account);
            this.status$.next(true);
        }
    }

    public disconnectWallet() {
        this.account = null;
        this.status$.next(false);
    }

    public isWalletConnected() {
        return this.account != null;
    }

}
