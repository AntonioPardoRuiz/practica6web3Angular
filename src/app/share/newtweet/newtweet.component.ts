import {Component} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TweetService} from "../tweetservice/tweet.service";
import {Tweet} from "../model/tweet";
import {UserService} from "../tweetservice/user.service";
import {HttpClient} from "@angular/common/http";

declare let window: any;

@Component({
    selector: 'newtweet',
    templateUrl: 'newtweet.component.html',
    styleUrls: ['newtweet.component.scss']
})
export class NewTweetComponent {

    public form: FormGroup;

    public fileName = "";

    protected file:any = null;

    public constructor(
        public formBuilder: FormBuilder,
        public userService: UserService,
        public tweetService: TweetService
    ) {

        this.form = this.formBuilder.group({
            tweetcontent: [null, [
                Validators.max(140)]]
        });


    }

    public async submit() {
        if(this.form.valid) {
            let user= this.userService.getUser('@jondoe');
            if(user != null) {
                let tweetcontent = this.form.get('tweetcontent')?.value;
                let tweet = new Tweet(new Date(), tweetcontent, user);
                if(this.file != null) {
                    const reader = new window.FileReader()
                    reader.readAsArrayBuffer(this.file);
                    reader.onloadend = () => {
                        window.Buffer = require('buffer/').Buffer;
                        tweet.imageBuffer = window.Buffer(reader.result);
                        this.tweetService.publishTweet(tweet);
                        this.file = null;
                    }
                }
                else {
                    this.tweetService.publishTweet(tweet);
                }

            }
        }
    }

    onFileSelected(event: any) {
        this.file = event.target.files[0];
    }
}
