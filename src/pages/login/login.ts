import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { User } from '../../models/user';
import { GithubUsers } from '../../providers/github-users/github-users';

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

  users: User[]
  constructor(public navCtrl: NavController, public navParams: NavParams, private githubUsers: GithubUsers) {
    githubUsers.load().subscribe(users => {
      console.log(users)
    })
  }

  public verifyLogin() {
    let dummyUser = "herbalife";
    let dummyPassword = "herbalife";
    // console.log(this.loginUname);
    if( (this.loginUname.value == dummyUser || this.loginUname.value == "herbalife_basic" || this.loginUname.value == "herbalife_admin") && this.loginPword.value == dummyPassword) {
      this.navCtrl.push(LocatorPage);
    } else {
      this.triggerWarning();
    }
  }

  public triggerWarning () {
    this.className = 'enabled';
  }

  // ionViewDidLoad() {
  // }

}
