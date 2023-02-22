import { Component } from '@angular/core';
import {Web3Service} from "../share/web3/web3.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  public connected = false;
  public accountId = null;

  public constructor(protected web3Service: Web3Service) {
    this.connected = web3Service.isConnected();
    this.web3Service.status$.subscribe(() => {
      this.connected = this.web3Service.isConnected();
      if(this.connected) {
        this.accountId = this.web3Service.getConnectedAccount();
      }
      else {
        this.accountId = null;
      }
    })
  }

  public connectWallet() {
    this.web3Service.connectToWallet();
  }

  public disconnect() {
    this.web3Service.disconnect();
  }

}
