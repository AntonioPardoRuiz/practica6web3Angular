import {Component, OnInit} from '@angular/core';
import {Web3Service} from "./share/web3/web3.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'twitter-web3';

  public constructor(protected web3Service: Web3Service) {
  }

  public ngOnInit() {
    this.web3Service.initContractInstance();
  }

}
