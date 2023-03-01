import {Injectable} from "@angular/core";
import {Tweet} from "../model/tweet";
import {Subject} from "rxjs";
import {UserService} from "./user.service";
import {User} from "../model/user";
import {Web3Service} from "../web3service/web3.service";

@Injectable()
export class TweetService {

    public newTweets$ = new Subject();

    protected tweets: any[] = [];

    public constructor(protected userService: UserService,
                       protected web3Service: Web3Service) {

        this.web3Service.onNewTweet$.subscribe(event => {
            this.newTweets$.next(true);
        })

    }

    public async publishTweet(tweet: Tweet): Promise<void> {
        //append the tweet at the very beginning of this.tweet array:
        await this.web3Service.publishTweet(tweet);
    }

    public async getTweets(): Promise<Tweet[]> {
        let returnValue: Tweet[] = [];
        let user = this.userService.getUser("@jondoe");
        let tweets = await this.web3Service.getAllTweets();
        tweets.forEach((tweetData: any) => {
            if(user != null) {
                let tweet = new Tweet(new Date(), tweetData.tweetText, user);
                if (tweetData.tweetImage != null && tweetData.tweetImage != "") {
                    tweet.image = tweetData.tweetImage;
                }
                returnValue.push(tweet);
            }
        });
        return returnValue;

    }

}
