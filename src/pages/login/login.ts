import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NcUsersProvider } from '../../providers/nc-users/nc-users';
import { LocatorPage } from '../../pages/locator/locator';
import { Plugins } from '@capacitor/core';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const { Network } = Plugins;

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  @ViewChild("loginUname") loginUname: HTMLInputElement;
  @ViewChild("loginPword") loginPword: HTMLInputElement;

  public className: string = "disabled";
  private srcJSON;
  private warningMessage;

  constructor(public navCtrl: NavController, public navParams: NavParams, public userProvider: NcUsersProvider) {
  }

  public async verifyLogin() {
    const network = await Network.getStatus()
    let msg = "";
    if(network.connected) {
      if( this.validUName() && this.validPWord() ) {
        this.navCtrl.push(LocatorPage);
      } else {
        msg = "Error: Please check your login credentials."
        this.triggerWarning(msg);
      }
    } else {
      msg = "Error: Please check your connection and restart the application."
      this.triggerWarning(msg);
    }
  }

  private validUName() {
    return (this.srcJSON.users.some(user => user.username === this.loginUname.value.toLowerCase()));
  }

  private validPWord() {
    return (this.srcJSON.users.some(user => user.password === this.loginPword.value));
  }

  public triggerWarning (msg) {
    this.className = 'enabled';
    this.warningMessage = msg;
  }

  ionViewDidLoad() {
    this.userProvider.loadNCUsers().subscribe(users => {
        this.srcJSON = users;
    })
  }

}
