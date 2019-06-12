import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { User } from '../../models/user';
import { NcUsersProvider } from '../../providers/nc-users/nc-users';

import { LocatorPage } from '../../pages/locator/locator';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public userProvider: NcUsersProvider) {
  }

  public verifyLogin() {
    console.log(this.srcJSON)
    // if( this.validUName && this.validPWord) {
    //   this.navCtrl.push(LocatorPage);
    // } else {
    //   this.triggerWarning();
    // }
  }

  private validUName() {
    return (this.srcJSON.users.some(user => user.username === this.loginUname));
  }

  private validPWord() {
    return (this.srcJSON.users.some(user => user.password === this.loginPword));
  }

  public triggerWarning () {
    this.className = 'enabled';
  }

  ionViewDidLoad() {
    this.userProvider.loadNCUsers().subscribe(users => {
      console.log(users)
        this.srcJSON = users;
    })
  }

}
